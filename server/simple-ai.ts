import { Lead, LendingPartner } from "@shared/schema";

/**
 * A simple "rule-based" AI implementation that handles the core functionality
 * when external API calls are not available.
 */

// Array of pre-defined responses for different situations
const welcomeResponses = [
  "Welcome to LendMatch AI! I'm here to help match your business with suitable lending partners. To get started, could you tell me what type of business you run?",
  "Hi there! I'm your LendMatch assistant. I'd love to help find the right loan for your business. What industry is your business in?",
  "Welcome! I'm here to help you find the right lending partner. First, I'd like to learn about your business. What type of business do you operate?"
];

const businessTypeFollowUps = [
  "Great! How many years have you been in business?",
  "Thank you for that information. How long has your business been operating?",
  "I appreciate you sharing that. Can you tell me how many years your business has been established?"
];

const yearsFollowUps = [
  "Excellent. What's your approximate annual revenue?",
  "Thanks. Could you share your business's annual revenue?",
  "That's helpful to know. What is your business's yearly revenue?"
];

const revenueFollowUps = [
  "Thank you. How much funding are you looking for?",
  "Great. What loan amount are you interested in?",
  "Perfect. What amount of funding do you need for your business?"
];

const amountFollowUps = [
  "What would be the primary purpose for this loan?",
  "How do you plan to use these funds?",
  "What is the main reason you're seeking this funding?"
];

const purposeFollowUps = [
  "Last question - what's your approximate credit score range? (excellent: 750+, good: 700-749, fair: 650-699, or below 650)",
  "One final question - could you share your credit score range? (excellent: 750+, good: 700-749, fair: 650-699, or below 650)",
  "To finalize our matching process - what would you say your credit score is? (excellent: 750+, good: 700-749, fair: 650-699, or below 650)"
];

const noMatchResponses = [
  "Based on the information you've provided, I don't see any matching lending partners at this time. This could be due to credit requirements, business tenure, or loan amount requirements. Would you like to discuss alternative options?",
  "I've reviewed your information against our lending partners, but I don't have any matches right now. This is typically related to minimum requirements for credit, time in business, or revenue. Would you like to explore other financing options?",
  "Unfortunately, I couldn't find matching lending partners with the information provided. This is usually due to minimum thresholds for credit score, years in business, or annual revenue. Would you like to discuss what might help improve your chances?"
];

const matchFoundResponses = [
  "Good news! Based on the information you've provided, I've found {count} lending partners that might be a good fit. Would you like me to tell you more about them?",
  "Great! I've identified {count} lending partners that match your criteria. Would you like to hear the details about these options?",
  "I've found {count} lending options that might work well for your business. Would you like me to share more information about these matches?"
];

// Helper function to get a random response from an array
function getRandomResponse(responses: string[]): string {
  const index = Math.floor(Math.random() * responses.length);
  return responses[index];
}

// Function to extract basic information from text using regular expressions
export function extractSimpleData(message: string): Partial<Lead> {
  const data: Partial<Lead> = {};
  
  // Extract business type (simple keyword matching)
  const businessTypeKeywords = [
    { keywords: ['restaurant', 'cafe', 'catering', 'food'], type: 'Food & Beverage' },
    { keywords: ['retail', 'shop', 'store', 'boutique', 'ecommerce'], type: 'Retail' },
    { keywords: ['tech', 'software', 'it', 'app', 'development'], type: 'Technology' },
    { keywords: ['construct', 'build', 'contractor', 'remodel'], type: 'Construction' },
    { keywords: ['health', 'medical', 'doctor', 'clinic', 'wellness'], type: 'Healthcare' },
    { keywords: ['manufacture', 'factory', 'production'], type: 'Manufacturing' },
    { keywords: ['service', 'consult', 'professional'], type: 'Professional Services' }
  ];
  
  for (const {keywords, type} of businessTypeKeywords) {
    if (keywords.some(keyword => message.toLowerCase().includes(keyword))) {
      data.businessType = type;
      break;
    }
  }
  
  // Extract years in business
  const yearsRegex = /(\d+)[\s-]*(year|yr)s?/i;
  const yearsMatch = message.match(yearsRegex);
  if (yearsMatch) {
    data.yearsInBusiness = parseInt(yearsMatch[1]);
  }
  
  // Extract annual revenue - expanded pattern to capture more formats
  const revenueRegex = /(?:revenue|make|earn|annual|yearly|turnover).*?(?:is|of|about|around)?\s*(\$?\d+(?:[,.]\d+)?)\s*(k|thousand|m|million|b|billion)?|(\$?\d+(?:[,.]\d+)?)\s*(k|thousand|m|million|b|billion)?(?:\s*(?:annual|yearly|per year|a year|yearly|revenue|in revenue|turnover))/i;
  const revenueMatch = message.match(revenueRegex);
  if (revenueMatch) {
    // Determine which capture group was matched
    const valueIndex = revenueMatch[1] ? 1 : 3;
    const multiplierIndex = revenueMatch[2] ? 2 : 4;
    
    let revenue = parseFloat((revenueMatch[valueIndex] || "0").replace(/[\$,]/g, ''));
    const multiplier = revenueMatch[multiplierIndex];
    
    if (multiplier) {
      if (multiplier.toLowerCase() === 'k' || multiplier.toLowerCase() === 'thousand') {
        revenue *= 1000;
      } else if (multiplier.toLowerCase() === 'm' || multiplier.toLowerCase() === 'million') {
        revenue *= 1000000;
      } else if (multiplier.toLowerCase() === 'b' || multiplier.toLowerCase() === 'billion') {
        revenue *= 1000000000;
      }
    }
    
    data.annualRevenue = revenue.toString();
  }
  
  // Extract loan amount
  const loanRegex = /(\$?\d+(?:[,.]\d+)?)\s*(k|thousand|m|million|b|billion)?(?:\s*(?:loan|funding|money|financing|capital|amount))/i;
  const loanMatch = message.match(loanRegex);
  if (loanMatch) {
    let amount = parseFloat(loanMatch[1].replace(/[\$,]/g, ''));
    const multiplier = loanMatch[2];
    
    if (multiplier) {
      if (multiplier.toLowerCase() === 'k' || multiplier.toLowerCase() === 'thousand') {
        amount *= 1000;
      } else if (multiplier.toLowerCase() === 'm' || multiplier.toLowerCase() === 'million') {
        amount *= 1000000;
      } else if (multiplier.toLowerCase() === 'b' || multiplier.toLowerCase() === 'billion') {
        amount *= 1000000000;
      }
    }
    
    data.requestedAmount = amount.toString();
  }
  
  // Extract loan purpose
  const purposeKeywords = [
    { keywords: ['equipment', 'machinery', 'tools'], purpose: 'Equipment Purchase' },
    { keywords: ['expansion', 'grow', 'growth', 'scale'], purpose: 'Business Expansion' },
    { keywords: ['inventory', 'stock', 'supplies'], purpose: 'Inventory Purchase' },
    { keywords: ['work capital', 'working capital', 'day-to-day', 'operations'], purpose: 'Working Capital' },
    { keywords: ['refinance', 'consolidate', 'consolidation'], purpose: 'Debt Refinancing' },
    { keywords: ['renovate', 'remodel', 'improve'], purpose: 'Renovation' },
    { keywords: ['hire', 'staff', 'employee', 'personnel'], purpose: 'Hiring Staff' }
  ];
  
  for (const {keywords, purpose} of purposeKeywords) {
    if (keywords.some(keyword => message.toLowerCase().includes(keyword))) {
      data.loanPurpose = purpose;
      break;
    }
  }
  
  // Extract credit score
  const creditRegex = /(?:credit|score|fico)(?:\s+(?:is|of|around|about))?\s+(\d{3,})/i;
  const creditMatch = message.match(creditRegex);
  if (creditMatch) {
    data.creditScore = parseInt(creditMatch[1]);
  } else {
    // Try to extract from ranges
    if (message.toLowerCase().includes('excellent') || message.toLowerCase().includes('750+')) {
      data.creditScore = 750;
    } else if (message.toLowerCase().includes('good') || 
               (message.toLowerCase().includes('700') && message.toLowerCase().includes('749'))) {
      data.creditScore = 700;
    } else if (message.toLowerCase().includes('fair') || 
               (message.toLowerCase().includes('650') && message.toLowerCase().includes('699'))) {
      data.creditScore = 650;
    } else if (message.toLowerCase().includes('poor') || 
               message.toLowerCase().includes('below 650') || 
               message.toLowerCase().includes('under 650')) {
      data.creditScore = 600;
    }
  }
  
  return data;
}

export function determineNextQuestion(existingData: Partial<Lead>): string {
  // Check what information we're missing and ask the next appropriate question
  if (!existingData.businessType) {
    return getRandomResponse(welcomeResponses);
  } else if (existingData.yearsInBusiness === undefined) {
    return getRandomResponse(businessTypeFollowUps);
  } else if (existingData.annualRevenue === undefined) {
    return getRandomResponse(yearsFollowUps);
  } else if (existingData.requestedAmount === undefined) {
    return getRandomResponse(revenueFollowUps);
  } else if (!existingData.loanPurpose) {
    return getRandomResponse(amountFollowUps);
  } else if (existingData.creditScore === undefined) {
    return getRandomResponse(purposeFollowUps);
  } else {
    // We have all the information, but this should be handled by the match presentation
    return "Thank you for providing all that information. Let me analyze the best matches for your business.";
  }
}

export function generateMatchResponse(matchingPartners: { partner: LendingPartner, score: number }[]): string {
  if (!matchingPartners || matchingPartners.length === 0) {
    return getRandomResponse(noMatchResponses);
  }
  
  let response = getRandomResponse(matchFoundResponses).replace('{count}', matchingPartners.length.toString());
  
  // Add details about the top 3 matches
  const topMatches = matchingPartners.slice(0, 3);
  response += "\n\nHere are your top options:\n\n";
  
  topMatches.forEach(({partner, score}, index) => {
    response += `${index + 1}. ${partner.name} (${partner.loanType})\n`;
    response += `   - Match Score: ${score}%\n`;
    response += `   - Loan Amount: $${partner.minLoanAmount.toLocaleString()} - $${partner.maxLoanAmount.toLocaleString()}\n`;
    response += `   - Interest Rate: ${partner.interestRateMin}% - ${partner.interestRateMax}%\n`;
    
    if (partner.termLengthMin && partner.termLengthMax && partner.termUnit) {
      response += `   - Term: ${partner.termLengthMin} - ${partner.termLengthMax} ${partner.termUnit}\n`;
    }
    
    if (partner.fundingTimeMin && partner.fundingTimeMax && partner.fundingTimeUnit) {
      response += `   - Funding Time: ${partner.fundingTimeMin} - ${partner.fundingTimeMax} ${partner.fundingTimeUnit}\n`;
    }
    
    response += '\n';
  });
  
  response += "Would you like to proceed with one of these options or explore more alternatives?";
  
  return response;
}

// Main function to generate responses
export async function generateSimpleResponse(
  messages: { role: string, content: string }[],
  leadData?: Partial<Lead>,
  matchingPartners?: { partner: LendingPartner, score: number }[]
): Promise<string> {
  // Get the last user message
  const userMessages = messages.filter(msg => msg.role === 'user');
  
  if (userMessages.length === 0) {
    return getRandomResponse(welcomeResponses);
  }
  
  const lastUserMessage = userMessages[userMessages.length - 1].content;
  
  // If we have all data and matches, show the matches
  if (leadData && 
      leadData.businessType && 
      leadData.yearsInBusiness !== undefined && 
      leadData.annualRevenue !== undefined && 
      leadData.requestedAmount !== undefined && 
      leadData.loanPurpose && 
      leadData.creditScore !== undefined) {
    
    if (matchingPartners && matchingPartners.length > 0) {
      return generateMatchResponse(matchingPartners);
    } else {
      return getRandomResponse(noMatchResponses);
    }
  }
  
  // Otherwise, determine what question to ask next based on what data we already have
  return determineNextQuestion(leadData || {});
}

// Function to extract structured data from messages
export function extractStructuredData(messages: { role: string, content: string }[]): Partial<Lead> {
  // Combine all user messages to extract data from
  const userMessages = messages
    .filter(msg => msg.role === 'user')
    .map(msg => msg.content)
    .join(" ");
  
  return extractSimpleData(userMessages);
}