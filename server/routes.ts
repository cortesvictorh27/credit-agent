import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertLendingPartnerSchema, insertLeadSchema, insertChatMessageSchema, LendingPartner } from "@shared/schema";
import { syncLendingPartnersFromSheets } from "./utils/sheets";
import { generateSimpleResponse, extractStructuredData as extractSimpleStructuredData } from "./simple-ai";
import { generateChatResponse, extractStructuredData, getMatchingPartnersForLead } from "./openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for lending partners
  app.get("/api/lending-partners", async (req: Request, res: Response) => {
    try {
      const partners = await storage.getActiveLendingPartners();
      res.json(partners);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve lending partners" });
    }
  });

  app.post("/api/lending-partners", async (req: Request, res: Response) => {
    try {
      const validatedData = insertLendingPartnerSchema.parse(req.body);
      const partner = await storage.createLendingPartner(validatedData);
      res.status(201).json(partner);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid lending partner data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create lending partner" });
      }
    }
  });

  app.put("/api/lending-partners/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const validatedData = insertLendingPartnerSchema.partial().parse(req.body);
      const updatedPartner = await storage.updateLendingPartner(id, validatedData);
      
      if (!updatedPartner) {
        return res.status(404).json({ message: "Lending partner not found" });
      }
      
      res.json(updatedPartner);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid lending partner data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update lending partner" });
      }
    }
  });

  app.delete("/api/lending-partners/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const success = await storage.deleteLendingPartner(id);
      
      if (!success) {
        return res.status(404).json({ message: "Lending partner not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete lending partner" });
    }
  });

  // API routes for leads
  app.get("/api/leads", async (req: Request, res: Response) => {
    try {
      const leads = await storage.getAllLeads();
      res.json(leads);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve leads" });
    }
  });

  app.get("/api/leads/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const lead = await storage.getLead(id);
      
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      res.json(lead);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve lead" });
    }
  });

  app.post("/api/leads", async (req: Request, res: Response) => {
    try {
      const validatedData = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead(validatedData);
      res.status(201).json(lead);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid lead data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create lead" });
      }
    }
  });

  // API routes for chat messages
  app.get("/api/leads/:leadId/messages", async (req: Request, res: Response) => {
    try {
      const leadId = parseInt(req.params.leadId, 10);
      const messages = await storage.getChatMessagesByLeadId(leadId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve chat messages" });
    }
  });

  app.post("/api/chat/message", async (req: Request, res: Response) => {
    try {
      const { message, leadId } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message content is required" });
      }
      
      // Get lending partners for matching
      const partners = await storage.getActiveLendingPartners();
      
      // Get previous messages if leadId exists
      let existingMessages: { role: string, content: string }[] = [];
      let lead = null;
      
      if (leadId) {
        const chatMessages = await storage.getChatMessagesByLeadId(leadId);
        existingMessages = chatMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        }));
        
        lead = await storage.getLead(leadId);
      }
      
      // Add the new user message to the list
      const updatedMessages = [
        ...existingMessages,
        { role: "user", content: message }
      ];
      
      // Extract structured data from conversation
      let extractedData = {};
      try {
        // Try to use Hugging Face API first
        extractedData = await extractStructuredData(updatedMessages);
      } catch (error: any) {
        console.log("Falling back to simple data extraction due to error:", error?.message || "Unknown error");
        // Fallback to simple extraction if Hugging Face fails
        extractedData = extractSimpleStructuredData(updatedMessages);
      }
      
      // Update or create lead with extracted data
      let updatedLead = lead;
      if (!lead && Object.keys(extractedData).length > 0) {
        // For new leads without a business name, use a placeholder if needed
        const businessName = (extractedData as any).businessName || "Business Lead";
        updatedLead = await storage.createLead({
          ...extractedData,
          businessName: businessName,
          createdAt: new Date().toISOString()
        } as any);
      } else if (lead && Object.keys(extractedData).length > 0) {
        // Update existing lead with new data
        updatedLead = await storage.updateLead(lead.id, extractedData);
      }
      
      // Find matching partners if we have lead data
      let matchingPartners: Array<{ partner: LendingPartner, score: number }> = [];
      if (updatedLead) {
        matchingPartners = getMatchingPartnersForLead(updatedLead, partners);
        
        // Create matches in storage if new matches found
        for (const match of matchingPartners) {
          const existingMatches = await storage.getMatchesByLeadId(updatedLead.id);
          const existingMatch = existingMatches.find(m => m.partnerId === match.partner.id);
          
          if (!existingMatch) {
            await storage.createMatch({
              leadId: updatedLead.id,
              partnerId: match.partner.id,
              matchScore: match.score.toString()
            });
          }
        }
      }
      
      // Generate AI response
      let aiResponse = "";
      try {
        // Try to use Hugging Face API first
        aiResponse = await generateChatResponse(
          updatedMessages,
          partners,
          updatedLead || undefined,
          matchingPartners
        );
      } catch (error: any) {
        console.log("Falling back to simple response generation due to error:", error?.message || "Unknown error");
        // Fallback to simple response generation if Hugging Face fails
        aiResponse = await generateSimpleResponse(
          updatedMessages,
          updatedLead || undefined,
          matchingPartners
        );
      }
      
      // Save user message
      if (updatedLead) {
        await storage.createChatMessage({
          leadId: updatedLead.id,
          role: "user",
          content: message,
          timestamp: new Date().toISOString()
        });
        
        // Save AI response
        await storage.createChatMessage({
          leadId: updatedLead.id,
          role: "assistant",
          content: aiResponse,
          timestamp: new Date().toISOString()
        });
      }
      
      // Return response with lead information
      res.json({
        message: aiResponse,
        lead: updatedLead,
        matches: matchingPartners.map(match => ({
          partnerId: match.partner.id,
          partnerName: match.partner.name,
          loanType: match.partner.loanType,
          score: match.score
        }))
      });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  // API route for lead-partner matches
  app.get("/api/leads/:leadId/matches", async (req: Request, res: Response) => {
    try {
      const leadId = parseInt(req.params.leadId, 10);
      const matches = await storage.getMatchesByLeadId(leadId);
      
      // Get partner details for each match
      const matchesWithPartners = await Promise.all(
        matches.map(async match => {
          const partner = await storage.getLendingPartner(match.partnerId);
          return {
            ...match,
            partner
          };
        })
      );
      
      res.json(matchesWithPartners);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve matches" });
    }
  });

  app.put("/api/leads/:leadId/matches/:partnerId", async (req: Request, res: Response) => {
    try {
      const leadId = parseInt(req.params.leadId, 10);
      const partnerId = parseInt(req.params.partnerId, 10);
      const { selected, submitted } = req.body;
      
      // Find the match
      const matches = await storage.getMatchesByLeadId(leadId);
      const match = matches.find(m => m.partnerId === partnerId);
      
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }
      
      // Update the match
      const update: Record<string, any> = {};
      if (selected !== undefined) update.selected = selected;
      if (submitted !== undefined) {
        update.submitted = submitted;
        if (submitted) update.submittedAt = new Date().toISOString();
      }
      
      const updatedMatch = await storage.updateMatch(match.id, update);
      res.json(updatedMatch);
    } catch (error) {
      res.status(500).json({ message: "Failed to update match" });
    }
  });

  // API route for syncing lending partners from Google Sheets
  app.post("/api/sync/lending-partners", async (req: Request, res: Response) => {
    try {
      const { apiKey, spreadsheetId, range } = req.body;
      
      if (!apiKey || !spreadsheetId || !range) {
        return res.status(400).json({ message: "Missing required Google Sheets configuration" });
      }
      
      const result = await syncLendingPartnersFromSheets(
        { apiKey, spreadsheetId, range },
        storage.createLendingPartner.bind(storage),
        storage.updateLendingPartner.bind(storage),
        storage.getAllLendingPartners.bind(storage)
      );
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to sync lending partners from Google Sheets" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
