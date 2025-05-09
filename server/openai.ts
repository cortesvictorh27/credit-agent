import { Lead, LendingPartner } from "@shared/schema";
import OpenAI from "openai";

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper functions to handle numeric values from different types
function parseNumberValue(value: any): number {
  if (typeof value === 'string') {
    return parseFloat(value);
  } else if (typeof value === 'number') {
    return value;
  }
  return 0;
}

/**
 * Creates a system prompt with context about lending partners
 */
function createSystemPrompt(partners: LendingPartner[]): string {
  let prompt = `You are a loan broker assistant that helps qualify business loan applicants and match them with appropriate lending partners.
Your job is to gather information about the business through conversation, and then recommend lending partners that match their profile.

Here's the information you need to collect:
1. Business type/industry
2. Years in business
3. Annual revenue
4. Requested loan amount
5. Loan purpose
6. Credit score (excellent: 750+, good: 700-749, fair: 650-699, or below 650)

Once you have this information, you can match the business with lending partners.
`;

  // Add information about lending partners
  if (partners.length > 0) {
    prompt += "\nHere are the available lending partners and their requirements:\n";
    partners.forEach(partner => {
      prompt += `
- ${partner.name} (${partner.loanType})
  - Loan amount: $${partner.minLoanAmount} - $${partner.maxLoanAmount}
  - Required minimum credit score: ${partner.minCreditScore}
  - Required minimum annual revenue: $${partner.minAnnualRevenue}
  - Required minimum years in business: ${partner.minYearsInBusiness}
  - Interest rate: ${partner.interestRateMin}% - ${partner.interestRateMax}%
  - Term: ${partner.termLengthMin} - ${partner.termLengthMax} ${partner.termUnit}
  - Funding time: ${partner.fundingTimeMin} - ${partner.fundingTimeMax} ${partner.fundingTimeUnit}
`;
    });
  }

  return prompt;
}

/**
 * Function to qualify a lead for a specific partner
 */
export function qualifyLeadForPartner(lead: Partial<Lead>, partner: LendingPartner): boolean {
  if (lead.creditScore) {
    const creditScore = parseNumberValue(lead.creditScore);
    const minCreditScore = parseNumberValue(partner.minCreditScore);
    
    if (creditScore < minCreditScore) {
      return false;
    }
  }
  
  if (lead.yearsInBusiness) {
    const years = parseNumberValue(lead.yearsInBusiness);
    const minYears = parseNumberValue(partner.minYearsInBusiness);
    
    if (years < minYears) {
      return false;
    }
  }
  
  if (lead.annualRevenue) {
    const revenue = parseNumberValue(lead.annualRevenue);
    const minRevenue = parseNumberValue(partner.minAnnualRevenue);
    
    if (revenue < minRevenue) {
      return false;
    }
  }
  
  if (lead.requestedAmount) {
    const amount = parseNumberValue(lead.requestedAmount);
    const minAmount = parseNumberValue(partner.minLoanAmount);
    const maxAmount = parseNumberValue(partner.maxLoanAmount);
    
    if (amount < minAmount || amount > maxAmount) {
      return false;
    }
  }
  
  return true;
}

/**
 * Calculate a match score between a lead and a partner
 */
export function calculateMatchScore(lead: Partial<Lead>, partner: LendingPartner): number {
  if (!qualifyLeadForPartner(lead, partner)) {
    return 0;
  }
  
  let score = 0;
  let factors = 0;
  
  // Credit score factor
  if (lead.creditScore) {
    factors++;
    const creditScore = parseNumberValue(lead.creditScore);
    const minCreditScore = parseNumberValue(partner.minCreditScore);
    const creditDiff = creditScore - minCreditScore;
    if (creditDiff >= 100) score += 100;
    else if (creditDiff >= 50) score += 80;
    else if (creditDiff >= 20) score += 60;
    else score += 40;
  }
  
  // Years in business factor
  if (lead.yearsInBusiness) {
    factors++;
    const years = parseNumberValue(lead.yearsInBusiness);
    const minYears = parseNumberValue(partner.minYearsInBusiness);
    const yearsDiff = years - minYears;
    if (yearsDiff >= 5) score += 100;
    else if (yearsDiff >= 2) score += 70;
    else score += 40;
  }
  
  // Revenue factor
  if (lead.annualRevenue) {
    factors++;
    const revenue = parseNumberValue(lead.annualRevenue);
    const minRevenue = parseNumberValue(partner.minAnnualRevenue);
    
    const revenueFactor = revenue / minRevenue;
    if (revenueFactor >= 3) score += 100;
    else if (revenueFactor >= 2) score += 80;
    else if (revenueFactor >= 1.5) score += 60;
    else score += 40;
  }
  
  // Loan amount factor
  if (lead.requestedAmount) {
    factors++;
    const amount = parseNumberValue(lead.requestedAmount);
    const minAmount = parseNumberValue(partner.minLoanAmount);
    const maxAmount = parseNumberValue(partner.maxLoanAmount);
    
    // Score based on how centered the amount is in the partner's range
    const range = maxAmount - minAmount;
    const midPoint = minAmount + (range / 2);
    const distanceFromMid = Math.abs(amount - midPoint);
    const percentageFromMid = (distanceFromMid / (range / 2)) * 100;
    
    // Convert to score - closer to midpoint is better
    score += 100 - (percentageFromMid > 100 ? 60 : percentageFromMid * 0.6);
  }
  
  // Average the scores if we have factors
  return factors > 0 ? Math.round(score / factors) : 0;
}

/**
 * Get matching partners for a lead
 */
export function getMatchingPartnersForLead(lead: Partial<Lead>, partners: LendingPartner[]): { partner: LendingPartner, score: number }[] {
  // Calculate match scores for each partner
  const matches = partners
    .map(partner => ({
      partner,
      score: calculateMatchScore(lead, partner)
    }))
    .filter(match => match.score > 0) // Only include partners with a positive match score
    .sort((a, b) => b.score - a.score); // Sort by score (descending)
  
  return matches;
}

/**
 * Extract structured data from conversation using OpenAI
 */
export async function extractStructuredData(messages: { role: string, content: string }[]): Promise<Partial<Lead>> {
  try {
    // Format messages for OpenAI
    const formattedMessages = [
      {
        role: "system" as const,
        content: "Extract structured information about a business loan applicant from the conversation. Return ONLY a JSON object with the following fields if mentioned in the conversation: businessType, yearsInBusiness, annualRevenue, requestedAmount, loanPurpose, creditScore, businessName, email, phone. If a field is not mentioned, exclude it from the JSON. Do NOT include any explanation or additional text outside the JSON object."
      },
      ...messages.map(msg => ({
        role: msg.role === "user" ? "user" as const : "assistant" as const,
        content: msg.content
      }))
    ];

    // Generate JSON response
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: formattedMessages,
      temperature: 0.1, // Lower temperature for more deterministic/factual responses
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    // Get the content from the response
    const jsonContent = completion.choices[0].message.content;
    if (!jsonContent) {
      throw new Error("No response received from OpenAI");
    }

    // Parse the JSON
    const extractedData = JSON.parse(jsonContent);
    return extractedData;
  } catch (error) {
    console.error("Error extracting structured data with OpenAI:", error);
    // Return empty object on error
    return {};
  }
}

/**
 * Generate a chat response using OpenAI
 */
export async function generateChatResponse(
  messages: { role: string, content: string }[],
  partners: LendingPartner[],
  leadData?: Partial<Lead>,
  matchingPartners?: { partner: LendingPartner, score: number }[]
): Promise<string> {
  try {
    // Prepare context about matching partners if available
    let matchingPartnersContext = "";
    if (leadData && matchingPartners && matchingPartners.length > 0) {
      matchingPartnersContext = "Based on the user's information, these are the matching lending partners:\n";
      matchingPartners.forEach(({ partner, score }) => {
        matchingPartnersContext += `
- ${partner.name} (${partner.loanType})
  - Match Score: ${score}%
  - Loan Amount: $${partner.minLoanAmount} - $${partner.maxLoanAmount}
  - Interest Rate: ${partner.interestRateMin}% - ${partner.interestRateMax}%
  - Term: ${partner.termLengthMin ? `${partner.termLengthMin} - ${partner.termLengthMax} ${partner.termUnit}` : 'N/A'}
  - Funding Time: ${partner.fundingTimeMin ? `${partner.fundingTimeMin} - ${partner.fundingTimeMax} ${partner.fundingTimeUnit}` : 'N/A'}
`;
      });
    }

    // Create system message with context
    const systemPrompt = createSystemPrompt(partners) + (matchingPartnersContext ? "\n\n" + matchingPartnersContext : "");

    // Format messages for OpenAI
    const formattedMessages = [
      {
        role: "system" as const,
        content: systemPrompt
      },
      ...messages.map(msg => ({
        role: msg.role === "user" ? "user" as const : "assistant" as const,
        content: msg.content
      }))
    ];

    // Generate the response
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: 500,
    });

    // Get the content from the response
    const responseContent = completion.choices[0].message.content;
    return responseContent || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Error generating chat response with OpenAI:", error);
    // Fall back to rule-based system if OpenAI fails
    const { generateSimpleResponse } = await import('./simple-ai');
    return generateSimpleResponse(messages, leadData, matchingPartners);
  }
}