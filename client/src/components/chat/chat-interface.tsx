import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Settings, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ChatMessage from "./chat-message";
import MessageInput from "./message-input";
import { apiRequest } from "@/lib/queryClient";
import { sendChatMessage, type ChatMessage as ChatMessageType } from "@/lib/openai";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";

interface ChatInterfaceProps {
  leadId?: number;
  onLeadUpdate?: (lead: any) => void;
  onMatchesUpdate?: (matches: any[]) => void;
}

export default function ChatInterface({ leadId, onLeadUpdate, onMatchesUpdate }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Query to fetch existing messages if we have a leadId
  const { data: existingMessages, isLoading } = useQuery({
    queryKey: [leadId ? `/api/leads/${leadId}/messages` : null],
    enabled: !!leadId,
  });

  // Add initial welcome message when chat first loads and no existing messages
  useEffect(() => {
    if (!isLoading && !existingMessages?.length && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: "👋 Hello! I'm your LendMatch assistant. I can help you find the right loan options based on your needs. Would you like to see if you qualify for our lending partners?",
          timestamp: new Date().toISOString()
        }
      ]);
    } else if (!isLoading && existingMessages?.length && messages.length === 0) {
      setMessages(existingMessages);
    }
  }, [isLoading, existingMessages, messages.length]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mutation to send a message
  const sendMessageMutation = useMutation({
    mutationFn: async ({ message }: { message: string }) => {
      return sendChatMessage(message, leadId);
    },
    onSuccess: (data) => {
      // Add assistant response to messages
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: data.message,
          timestamp: new Date().toISOString()
        }
      ]);
      
      // Update lead information if available
      if (data.lead && onLeadUpdate) {
        onLeadUpdate(data.lead);
      }
      
      // Update matches if available
      if (data.matches && onMatchesUpdate) {
        onMatchesUpdate(data.matches);
      }
      
      // Invalidate queries to refresh data
      if (leadId) {
        queryClient.invalidateQueries({ queryKey: [`/api/leads/${leadId}/messages`] });
        queryClient.invalidateQueries({ queryKey: [`/api/leads/${leadId}`] });
        queryClient.invalidateQueries({ queryKey: [`/api/leads/${leadId}/matches`] });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
      console.error("Failed to send message:", error);
    }
  });

  const handleSendMessage = (message: string) => {
    if (!message.trim()) return;
    
    // Add user message to chat
    setMessages(prev => [
      ...prev,
      {
        role: "user",
        content: message,
        timestamp: new Date().toISOString()
      }
    ]);
    
    // Send to API
    sendMessageMutation.mutate({ message });
  };

  const handleReset = () => {
    setMessages([
      {
        role: "assistant",
        content: "👋 Hello! I'm your LendMatch assistant. I can help you find the right loan options based on your needs. Would you like to see if you qualify for our lending partners?",
        timestamp: new Date().toISOString()
      }
    ]);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-neutral-200 flex flex-col h-[800px]">
      <div className="bg-primary px-4 py-3 text-white flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M12 8V4H8"></path>
            <rect width="16" height="12" x="4" y="8" rx="2"></rect>
            <path d="M2 14h2"></path>
            <path d="M20 14h2"></path>
            <path d="M15 13v2"></path>
            <path d="M9 13v2"></path>
          </svg>
          <h2 className="font-medium">LendMatch Assistant</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            size="sm" 
            variant="ghost" 
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded text-white"
            onClick={handleReset}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded text-white"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <ChatMessage 
            key={index} 
            message={message.content} 
            isUser={message.role === "user"} 
            timestamp={message.timestamp}
          />
        ))}
        {sendMessageMutation.isPending && (
          <div className="flex items-start space-x-2">
            <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M12 8V4H8"></path>
                <rect width="16" height="12" x="4" y="8" rx="2"></rect>
                <path d="M2 14h2"></path>
                <path d="M20 14h2"></path>
                <path d="M15 13v2"></path>
                <path d="M9 13v2"></path>
              </svg>
            </div>
            <div className="max-w-[80%] bg-neutral-100 rounded-lg p-3 inline-block">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <MessageInput 
        onSendMessage={handleSendMessage} 
        disabled={sendMessageMutation.isPending}
      />
    </div>
  );
}
