import fetch from 'node-fetch';
import { LendingPartner, Lead } from "@shared/schema";

// Hugging Face API endpoint and models
// Try multiple models in case one is accessible
const HF_API_MODELS = [
  "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
  "https://api-inference.huggingface.co/models/gpt2",
  "https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english", 
  "https://api-inference.huggingface.co/models/bert-base-uncased"
];

// Function to handle numeric values consistently
function parseNumberValue(value: any): number {
  if (typeof value === 'string') {
    return parseFloat(value);
  } else if (typeof value === 'number') {
    return value;
  }
  return 0;
}

// Function to create a system prompt for the conversational agent
function createSystemPrompt(partners: LendingPartner[]): string {
  const partnersInfo = partners.map(partner => {
    return `
    ${partner.name}:
    - Loan Type: ${partner.loanType}
    - Loan Amount: $${partner.minLoanAmount} - $${partner.maxLoanAmount}
    - Minimum Credit Score: ${partner.minCreditScore}
    - Minimum Annual Revenue: $${partner.minAnnualRevenue}
    - Minimum Years in Business: ${partner.minYearsInBusiness}
    - Interest Rate: ${partner.interestRateMin}% - ${partner.interestRateMax}%
    - Term Length: ${partner.termLengthMin ? `${partner.termLengthMin} - ${partner.termLengthMax} ${partner.termUnit}` : partner.termUnit}
    - Funding Time: ${partner.fundingTimeMin} - ${partner.fundingTimeMax} ${partner.fundingTimeUnit}
    `;
  }).join('\n');

  return `
  You are a professional credit broker assistant for LendMatch AI. Your role is to help qualify potential borrowers and match them with appropriate lending partners.
  
  Here are the lending partners in our database:
  ${partnersInfo}
  
  Follow these conversation guidelines:
  1. Be professional, helpful, and conversational in tone.
  2. Your primary goal is to collect the necessary information to qualify leads for lending partners.
  3. Ask for one piece of information at a time to keep the conversation flowing naturally.
  4. Key information you need to collect:
     - Business type/industry
     - Years in business
     - Annual revenue
     - Loan amount needed
     - Purpose of the loan
     - Credit score range
  5. After collecting this information, match the lead with suitable lending partners based on their requirements.
  6. When matches are found, present the options to the lead and ask if they want to pursue one specific option or multiple options.
  7. If the conversation goes off-track, politely redirect it back to the qualification process.
  8. Do not fabricate any lending partner information that is not in the database.
  9. If you can't find a match based on the collected information, be honest and explain why.
  
  Always ensure your responses are accurate, helpful, and guide the user through the qualification process smoothly.
  `;
}

// Function to check if lead qualifies for a partner
export function qualifyLeadForPartner(lead: Partial<Lead>, partner: LendingPartner): boolean {
  // Check if the lead meets the minimum requirements
  if (lead.creditScore !== undefined && lead.creditScore !== null) {
    const creditScore = parseNumberValue(lead.creditScore);
    const minCreditScore = parseNumberValue(partner.minCreditScore);
    if (creditScore < minCreditScore) {
      return false;
    }
  }
  
  if (lead.annualRevenue !== undefined) {
    const revenue = parseNumberValue(lead.annualRevenue);
    const minRevenue = parseNumberValue(partner.minAnnualRevenue);
    if (revenue < minRevenue) {
      return false;
    }
  }
  
  if (lead.yearsInBusiness !== undefined) {
    const years = parseNumberValue(lead.yearsInBusiness);
    const minYears = parseNumberValue(partner.minYearsInBusiness);
    if (years < minYears) {
      return false;
    }
  }
  
  if (lead.requestedAmount !== undefined) {
    const amount = parseNumberValue(lead.requestedAmount);
    const minAmount = parseNumberValue(partner.minLoanAmount);
    const maxAmount = parseNumberValue(partner.maxLoanAmount);
    if (amount < minAmount || amount > maxAmount) {
      return false;
    }
  }
  
  return true;
}

// Function to calculate match score
export function calculateMatchScore(lead: Partial<Lead>, partner: LendingPartner): number {
  // Base score if the lead qualifies
  if (!qualifyLeadForPartner(lead, partner)) {
    return 0;
  }
  
  // Start with a base score
  let score = 60;
  
  // Add points based on how well the lead matches
  
  // Credit score bonus
  if (lead.creditScore !== undefined && lead.creditScore !== null) {
    const creditScore = parseNumberValue(lead.creditScore);
    const minCreditScore = parseNumberValue(partner.minCreditScore);
    
    if (creditScore >= minCreditScore + 100) {
      score += 15;
    } else if (creditScore >= minCreditScore + 50) {
      score += 10;
    } else if (creditScore >= minCreditScore + 20) {
      score += 5;
    }
  }
  
  // Revenue bonus
  if (lead.annualRevenue !== undefined) {
    const revenue = parseNumberValue(lead.annualRevenue);
    const minRevenue = parseNumberValue(partner.minAnnualRevenue);
    
    if (revenue >= minRevenue * 3) {
      score += 15;
    } else if (revenue >= minRevenue * 2) {
      score += 10;
    } else if (revenue >= minRevenue * 1.5) {
      score += 5;
    }
  }
  
  // Years in business bonus
  if (lead.yearsInBusiness !== undefined) {
    const years = parseNumberValue(lead.yearsInBusiness);
    const minYears = parseNumberValue(partner.minYearsInBusiness);
    
    if (years >= minYears * 3) {
      score += 10;
    } else if (years >= minYears * 2) {
      score += 5;
    }
  }
  
  return Math.min(score, 100);
}

// Function to get matching partners for a lead
export function getMatchingPartnersForLead(lead: Partial<Lead>, partners: LendingPartner[]): { partner: LendingPartner, score: number }[] {
  const matches = partners
    .map(partner => ({
      partner,
      score: calculateMatchScore(lead, partner)
    }))
    .filter(match => match.score > 0)
    .sort((a, b) => b.score - a.score);
  
  return matches;
}

// Function to format messages for Hugging Face API - Format for BART
function formatMessages(messages: Array<{role: string, content: string}>, systemPrompt?: string): string {
  // For BART, which is primarily a summarization model, we'll create a simpler text prompt
  let formattedPrompt = '';
  
  // Add system prompt if provided
  if (systemPrompt) {
    formattedPrompt += `${systemPrompt}\n\n`;
  }
  
  // Add the conversation history in a simple text format
  for (const message of messages) {
    if (message.role === 'user') {
      formattedPrompt += `User: ${message.content}\n`;
    } else if (message.role === 'assistant') {
      formattedPrompt += `Assistant: ${message.content}\n`;
    }
  }
  
  // Add a request for the model to continue the conversation
  formattedPrompt += 'Assistant: ';
  
  return formattedPrompt;
}

// Helper function to delay execution
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Function to call Hugging Face API with multiple models, retries and timeout
async function huggingFaceCompletion(messages: Array<{role: string, content: string}>, systemPrompt?: string): Promise<string> {
  const maxRetries = 2;  // Fewer retries per model since we'll try multiple models
  const timeoutMs = 8000; // 8 seconds timeout
  const retryDelayMs = 1500;
  
  const formattedPrompt = formatMessages(messages, systemPrompt);
  
  // Try each model in sequence
  for (const modelUrl of HF_API_MODELS) {
    let retries = 0;
    let lastModelError = null;
    
    while (retries < maxRetries) {
      try {
        // Create an AbortController to handle timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        
        try {
          console.log(`Calling Hugging Face API with model ${modelUrl.split('/').pop()} (attempt ${retries + 1})...`);
          
          const response = await fetch(modelUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              inputs: formattedPrompt,
              parameters: {
                max_new_tokens: 150,
                temperature: 0.7,
                top_p: 0.95,
                do_sample: true
              }
            }),
            signal: controller.signal
          });
          
          // Clear the timeout
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Hugging Face API error with model ${modelUrl.split('/').pop()}: ${response.status} ${errorText}`);
          }
          
          const data = await response.json();
          
          // Handle different response formats based on the model
          if (Array.isArray(data) && data.length > 0 && data[0] && typeof data[0] === 'object' && 'generated_text' in data[0]) {
            // BART style response
            return (data[0] as any).generated_text.trim();
          } else if (data && typeof data === 'object') {
            if ('generated_text' in data) {
              // GPT-2 style response
              return (data as any).generated_text.trim();
            } else if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0])) {
              // BERT style response for masked tokens
              // Extract the most likely completion
              const completion = (data[0] as any[]).map((item: any) => 
                item.token_str || item.sequence || ''
              ).join(' ').trim();
              
              if (completion) {
                return completion;
              }
            }
          }
          
          throw new Error(`Unrecognized response format from model ${modelUrl.split('/').pop()}`);
          
        } catch (err) {
          // Clear timeout if it's an abort error
          clearTimeout(timeoutId);
          throw err; // Re-throw to be caught by the retry logic
        }
      } catch (error: any) {
        lastModelError = error;
        
        // If we've exhausted all retries with this model, log and try the next model
        if (retries >= maxRetries - 1) {
          console.error(`Error with model ${modelUrl.split('/').pop()} after ${retries + 1} attempts:`, error.message);
          break; // Break from retry loop and try next model
        }
        
        // Wait before retrying this model
        console.log(`Retrying in ${retryDelayMs/1000} seconds...`);
        await sleep(retryDelayMs);
        retries++;
      }
    }
  }
  
  // If we've exhausted all models and retries, fall back to rule-based system
  console.error(`Failed to get response from all Hugging Face API models.`);
  
  // Import and use the simple-ai fallback
  const { generateSimpleResponse } = await import('./simple-ai');
  const fallbackResponse = await generateSimpleResponse(messages);
  
  // If we can generate a fallback, use it
  if (fallbackResponse) {
    console.log("Using rule-based fallback response.");
    return fallbackResponse;
  }
  
  // If all else fails
  throw new Error("Failed to generate a response from any available AI model.");
}

// Function to extract structured data from chat conversation
export async function extractStructuredData(messages: { role: string, content: string }[]): Promise<Partial<Lead>> {
  try {
    const systemPrompt = "Extract structured information from the conversation. Look for the user's business type, years in business, annual revenue, requested loan amount, loan purpose, and credit score. Return ONLY a JSON object with these fields. If a field is not mentioned in the conversation, exclude it from the JSON.";
    
    // Add a final message requesting the JSON output
    const messagesWithExtraction = [
      ...messages,
      {
        role: "user",
        content: "Extract the structured lead information from our conversation in JSON format. Include only the fields that have been mentioned."
      }
    ];
    
    try {
      const jsonContent = await huggingFaceCompletion(messagesWithExtraction, systemPrompt);
      
      // Find JSON in the response (handling potential text before/after JSON)
      const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error("No valid JSON found in response");
      }
      
      const extractedData = JSON.parse(jsonMatch[0]);
      return extractedData;
    } catch (apiError) {
      console.error("Error from Hugging Face API for structured data extraction:", apiError);
      
      // Fall back to rule-based extraction
      console.log("Falling back to rule-based data extraction");
      const { extractStructuredData: extractSimpleData } = await import('./simple-ai');
      return extractSimpleData(messages);
    }
  } catch (error) {
    console.error("All extraction methods failed:", error);
    return {};
  }
}

// Function to generate chat responses
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
          - Term: ${partner.termLengthMin ? `${partner.termLengthMin} - ${partner.termLengthMax} ${partner.termUnit}` : partner.termUnit}
          - Funding Time: ${partner.fundingTimeMin} - ${partner.fundingTimeMax} ${partner.fundingTimeUnit}
        `;
      });
    }

    // Create system message with context
    const systemPrompt = createSystemPrompt(partners) + (matchingPartnersContext ? "\n\n" + matchingPartnersContext : "");
    
    // Generate a response using Hugging Face API
    const response = await huggingFaceCompletion(messages, systemPrompt);
    return response;
  } catch (error) {
    console.error("Error generating chat response:", error);
    return "I'm sorry, but I encountered an error processing your request. Please try again later.";
  }
}