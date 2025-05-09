import { formatTimestamp } from "@/lib/openai";

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
}

export default function ChatMessage({ message, isUser, timestamp }: ChatMessageProps) {
  // Function to render loan options in structured format
  const renderStructuredMessage = (text: string) => {
    // Regex to find loan option sections
    const loanOptionsRegex = /(Small Business Capital|Growth Fund|Expansion Partners|First Capital|Merchant Advance)/g;
    
    if (loanOptionsRegex.test(text)) {
      // Split the message by loan options
      const parts = text.split(/(Small Business Capital|Growth Fund|Expansion Partners|First Capital|Merchant Advance)/g);
      
      return (
        <>
          {parts.map((part, index) => {
            if (loanOptionsRegex.test(part)) {
              // This is a loan option title
              return <strong key={index} className="block mt-3 mb-1">{part}</strong>;
            } else if (part.includes("Loan Amount:") || part.includes("Interest Rate:")) {
              // This is a loan option details section
              return (
                <div key={index} className="bg-white rounded-lg p-3 border border-neutral-200 mt-1 mb-2">
                  {part.split('\n').map((line, i) => {
                    if (line.trim() === "") return null;
                    
                    // Check if line contains label: value pattern
                    const labelMatch = line.match(/(.*?):\s*(.*)/);
                    if (labelMatch) {
                      return (
                        <div key={i} className="flex justify-between my-1">
                          <span className="text-neutral-600 text-sm">{labelMatch[1].trim()}:</span>
                          <span className="text-sm font-medium">{labelMatch[2].trim()}</span>
                        </div>
                      );
                    }
                    
                    return <p key={i}>{line}</p>;
                  })}
                </div>
              );
            } else {
              // This is regular text
              return <div key={index} className="my-1">{part}</div>;
            }
          })}
        </>
      );
    }
    
    // If multiple choice buttons are needed
    if (message.includes("credit score range") && message.includes("Below 600")) {
      const parts = message.split(/(What's your approximate credit score range\?)/i);
      return (
        <>
          {parts.map((part, index) => {
            if (part.toLowerCase().includes("credit score range")) {
              return (
                <>
                  <p key={`text-${index}`}>{part}</p>
                  <div key={`buttons-${index}`} className="mt-3 grid grid-cols-2 gap-2">
                    <button className="text-sm bg-white border border-neutral-300 hover:bg-neutral-50 rounded-lg px-3 py-2 text-neutral-700">Below 600</button>
                    <button className="text-sm bg-white border border-neutral-300 hover:bg-neutral-50 rounded-lg px-3 py-2 text-neutral-700">600-649</button>
                    <button className="text-sm bg-white border border-neutral-300 hover:bg-neutral-50 rounded-lg px-3 py-2 text-neutral-700">650-699</button>
                    <button className="text-sm bg-white border border-neutral-300 hover:bg-neutral-50 rounded-lg px-3 py-2 text-neutral-700">700-749</button>
                    <button className="text-sm bg-white border border-neutral-300 hover:bg-neutral-50 rounded-lg px-3 py-2 text-neutral-700">750+</button>
                    <button className="text-sm bg-white border border-neutral-300 hover:bg-neutral-50 rounded-lg px-3 py-2 text-neutral-700">I don't know</button>
                  </div>
                </>
              );
            }
            return <p key={index}>{part}</p>;
          })}
        </>
      );
    }
    
    // For regular messages, preserve newlines
    return (
      <>
        {text.split('\n').map((line, i) => (
          <p key={i} className={i > 0 ? "mt-2" : ""}>{line}</p>
        ))}
      </>
    );
  };

  return (
    <div className={`flex items-start space-x-2 ${isUser ? "justify-end" : ""}`}>
      {!isUser && (
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
      )}
      
      <div className="max-w-[80%]">
        <div className={`${isUser ? "bg-primary text-white" : "bg-neutral-100 text-neutral-800"} rounded-lg p-3 inline-block`}>
          {renderStructuredMessage(message)}
        </div>
        {timestamp && (
          <p className={`text-xs text-neutral-500 mt-1 ${isUser ? "text-right" : ""}`}>
            {formatTimestamp(timestamp)}
          </p>
        )}
      </div>
      
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-neutral-200 flex-shrink-0 flex items-center justify-center text-neutral-600">
          <span className="text-sm font-medium">U</span>
        </div>
      )}
    </div>
  );
}
