import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ChatInterface from "@/components/chat/chat-interface";
import QualificationSummary from "@/components/chat/qualification-summary";
import PartnerDialog from "@/components/partners/partner-dialog";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";

export default function Chatbot() {
  const [leadData, setLeadData] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [isPartnerDialogOpen, setIsPartnerDialogOpen] = useState(false);

  // Fetch lending partners data
  const { data: partners = [] } = useQuery({
    queryKey: ["/api/lending-partners"],
  });

  // Get matching partners count if we have matches
  const matchCount = matches.length;

  // Handle lead data updates from chat
  const handleLeadUpdate = (lead: any) => {
    setLeadData(lead);
  };

  // Handle matches updates from chat
  const handleMatchesUpdate = (newMatches: any[]) => {
    setMatches(newMatches);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-neutral-800">Chatbot Interface</h1>
        <p className="text-neutral-600">Configure and monitor your credit broker chatbot</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <ChatInterface 
            leadId={leadData?.id} 
            onLeadUpdate={handleLeadUpdate}
            onMatchesUpdate={handleMatchesUpdate}
          />
        </div>

        {/* Qualification Summary */}
        <div>
          <QualificationSummary 
            leadData={{
              businessType: leadData?.businessType,
              yearsInBusiness: leadData?.yearsInBusiness,
              annualRevenue: leadData?.annualRevenue,
              requestedAmount: leadData?.requestedAmount,
              creditScore: leadData?.creditScore,
              loanPurpose: leadData?.loanPurpose
            }} 
            matchCount={matchCount}
          />
        </div>
      </div>

      {/* Lending Partner Database Button */}
      <div className="fixed bottom-0 right-0 m-4">
        <Button
          onClick={() => setIsPartnerDialogOpen(true)}
          className="bg-primary hover:bg-primary-dark text-white rounded-full p-3 shadow-lg h-12 w-12"
        >
          <Building2 className="h-5 w-5" />
        </Button>
      </div>

      {/* Lending Partner Database Dialog */}
      <PartnerDialog 
        isOpen={isPartnerDialogOpen} 
        onClose={() => setIsPartnerDialogOpen(false)} 
      />
    </div>
  );
}
