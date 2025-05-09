import { apiRequest } from "./queryClient";

// Types for chat interaction
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export interface ChatResponse {
  message: string;
  lead?: {
    id: number;
    businessName?: string;
    businessType?: string;
    yearsInBusiness?: number;
    annualRevenue?: number;
    requestedAmount?: number;
    loanPurpose?: string;
    creditScore?: number;
    email?: string;
    phone?: string;
    status: string;
  };
  matches?: {
    partnerId: number;
    partnerName: string;
    loanType: string;
    score: number;
  }[];
}

// Function to send a chat message and get a response
export async function sendChatMessage(message: string, leadId?: number): Promise<ChatResponse> {
  try {
    const response = await apiRequest("POST", "/api/chat/message", { message, leadId });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error sending chat message:", error);
    throw error;
  }
}

// Format timestamp to readable time
export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}
