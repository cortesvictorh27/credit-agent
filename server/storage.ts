import { 
  users, type User, type InsertUser,
  leads, type Lead, type InsertLead,
  lendingPartners, type LendingPartner, type InsertLendingPartner,
  chatMessages, type ChatMessage, type InsertChatMessage,
  leadPartnerMatches, type LeadPartnerMatch, type InsertLeadPartnerMatch
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Leads
  getLead(id: number): Promise<Lead | undefined>;
  getAllLeads(): Promise<Lead[]>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: number, update: Partial<Lead>): Promise<Lead | undefined>;
  
  // Lending Partners
  getLendingPartner(id: number): Promise<LendingPartner | undefined>;
  getAllLendingPartners(): Promise<LendingPartner[]>;
  getActiveLendingPartners(): Promise<LendingPartner[]>;
  createLendingPartner(partner: InsertLendingPartner): Promise<LendingPartner>;
  updateLendingPartner(id: number, update: Partial<LendingPartner>): Promise<LendingPartner | undefined>;
  deleteLendingPartner(id: number): Promise<boolean>;
  
  // Chat Messages
  getChatMessagesByLeadId(leadId: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Lead-Partner Matches
  getMatchesByLeadId(leadId: number): Promise<LeadPartnerMatch[]>;
  createMatch(match: InsertLeadPartnerMatch): Promise<LeadPartnerMatch>;
  updateMatch(id: number, update: Partial<LeadPartnerMatch>): Promise<LeadPartnerMatch | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private leadsMap: Map<number, Lead>;
  private lendingPartnersMap: Map<number, LendingPartner>;
  private chatMessagesMap: Map<number, ChatMessage>;
  private leadPartnerMatchesMap: Map<number, LeadPartnerMatch>;
  
  currentUserId: number;
  currentLeadId: number;
  currentLendingPartnerId: number;
  currentChatMessageId: number;
  currentMatchId: number;

  constructor() {
    this.users = new Map();
    this.leadsMap = new Map();
    this.lendingPartnersMap = new Map();
    this.chatMessagesMap = new Map();
    this.leadPartnerMatchesMap = new Map();
    
    this.currentUserId = 1;
    this.currentLeadId = 1;
    this.currentLendingPartnerId = 1;
    this.currentChatMessageId = 1;
    this.currentMatchId = 1;
    
    // Initialize with sample lending partners
    this.initializeData();
  }

  // Initialize with sample lending partners
  private initializeData() {
    const samplePartners: InsertLendingPartner[] = [
      {
        name: "Small Business Capital",
        loanType: "Term Loan",
        minLoanAmount: 50000,
        maxLoanAmount: 250000,
        minCreditScore: 680,
        minAnnualRevenue: 100000,
        minYearsInBusiness: 2,
        interestRateMin: 8,
        interestRateMax: 12,
        termLengthMin: 1,
        termLengthMax: 5,
        termUnit: "years",
        fundingTimeMin: 3,
        fundingTimeMax: 5,
        fundingTimeUnit: "days",
        active: true
      },
      {
        name: "Growth Fund",
        loanType: "Line of Credit",
        minLoanAmount: 25000,
        maxLoanAmount: 150000,
        minCreditScore: 650,
        minAnnualRevenue: 75000,
        minYearsInBusiness: 1,
        interestRateMin: 9.5,
        interestRateMax: 14,
        termUnit: "revolving",
        fundingTimeMin: 1,
        fundingTimeMax: 2,
        fundingTimeUnit: "days",
        active: true
      },
      {
        name: "Expansion Partners",
        loanType: "Equipment Financing",
        minLoanAmount: 10000,
        maxLoanAmount: 200000,
        minCreditScore: 620,
        minAnnualRevenue: 50000,
        minYearsInBusiness: 1,
        interestRateMin: 7,
        interestRateMax: 11,
        termLengthMin: 2,
        termLengthMax: 7,
        termUnit: "years",
        fundingTimeMin: 5,
        fundingTimeMax: 7,
        fundingTimeUnit: "days",
        active: true
      },
      {
        name: "First Capital",
        loanType: "SBA Loan",
        minLoanAmount: 50000,
        maxLoanAmount: 5000000,
        minCreditScore: 650,
        minAnnualRevenue: 250000,
        minYearsInBusiness: 2,
        interestRateMin: 6,
        interestRateMax: 9.5,
        termLengthMin: 5,
        termLengthMax: 25,
        termUnit: "years",
        fundingTimeMin: 30,
        fundingTimeMax: 90,
        fundingTimeUnit: "days",
        active: true
      },
      {
        name: "Merchant Advance",
        loanType: "Merchant Cash Advance",
        minLoanAmount: 5000,
        maxLoanAmount: 250000,
        minCreditScore: 580,
        minAnnualRevenue: 100000,
        minYearsInBusiness: 0.5,
        interestRateMin: 12,
        interestRateMax: 25,
        termLengthMin: 3,
        termLengthMax: 18,
        termUnit: "months",
        fundingTimeMin: 1,
        fundingTimeMax: 3,
        fundingTimeUnit: "days",
        active: true
      }
    ];

    samplePartners.forEach(partner => {
      this.createLendingPartner(partner);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Lead methods
  async getLead(id: number): Promise<Lead | undefined> {
    return this.leadsMap.get(id);
  }

  async getAllLeads(): Promise<Lead[]> {
    return Array.from(this.leadsMap.values());
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const id = this.currentLeadId++;
    const lead: Lead = { 
      ...insertLead, 
      id, 
      status: "new",
      createdAt: new Date().toISOString()
    };
    this.leadsMap.set(id, lead);
    return lead;
  }

  async updateLead(id: number, update: Partial<Lead>): Promise<Lead | undefined> {
    const lead = await this.getLead(id);
    if (!lead) return undefined;
    
    const updatedLead = { ...lead, ...update };
    this.leadsMap.set(id, updatedLead);
    return updatedLead;
  }

  // Lending Partner methods
  async getLendingPartner(id: number): Promise<LendingPartner | undefined> {
    return this.lendingPartnersMap.get(id);
  }

  async getAllLendingPartners(): Promise<LendingPartner[]> {
    return Array.from(this.lendingPartnersMap.values());
  }

  async getActiveLendingPartners(): Promise<LendingPartner[]> {
    return Array.from(this.lendingPartnersMap.values()).filter(partner => partner.active);
  }

  async createLendingPartner(insertPartner: InsertLendingPartner): Promise<LendingPartner> {
    const id = this.currentLendingPartnerId++;
    const partner: LendingPartner = { ...insertPartner, id };
    this.lendingPartnersMap.set(id, partner);
    return partner;
  }

  async updateLendingPartner(id: number, update: Partial<LendingPartner>): Promise<LendingPartner | undefined> {
    const partner = await this.getLendingPartner(id);
    if (!partner) return undefined;
    
    const updatedPartner = { ...partner, ...update };
    this.lendingPartnersMap.set(id, updatedPartner);
    return updatedPartner;
  }

  async deleteLendingPartner(id: number): Promise<boolean> {
    return this.lendingPartnersMap.delete(id);
  }

  // Chat Message methods
  async getChatMessagesByLeadId(leadId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessagesMap.values())
      .filter(message => message.leadId === leadId)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentChatMessageId++;
    const message: ChatMessage = { ...insertMessage, id };
    this.chatMessagesMap.set(id, message);
    return message;
  }

  // Lead-Partner Match methods
  async getMatchesByLeadId(leadId: number): Promise<LeadPartnerMatch[]> {
    return Array.from(this.leadPartnerMatchesMap.values())
      .filter(match => match.leadId === leadId);
  }

  async createMatch(insertMatch: InsertLeadPartnerMatch): Promise<LeadPartnerMatch> {
    const id = this.currentMatchId++;
    const match: LeadPartnerMatch = { ...insertMatch, id };
    this.leadPartnerMatchesMap.set(id, match);
    return match;
  }

  async updateMatch(id: number, update: Partial<LeadPartnerMatch>): Promise<LeadPartnerMatch | undefined> {
    const match = this.leadPartnerMatchesMap.get(id);
    if (!match) return undefined;
    
    const updatedMatch = { ...match, ...update };
    this.leadPartnerMatchesMap.set(id, updatedMatch);
    return updatedMatch;
  }
}

export const storage = new MemStorage();
