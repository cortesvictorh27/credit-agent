import { CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface QualificationSummaryProps {
  leadData?: {
    businessType?: string;
    yearsInBusiness?: number;
    annualRevenue?: number;
    requestedAmount?: number;
    creditScore?: number;
    loanPurpose?: string;
  };
  matchCount?: number;
}

export default function QualificationSummary({ leadData, matchCount = 0 }: QualificationSummaryProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Lead Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-neutral-600 mb-2">QUALIFICATION SUMMARY</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-600">Business Type:</span>
                  <span className="text-sm font-medium">{leadData?.businessType || "Not provided"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-600">Years in Business:</span>
                  <span className="text-sm font-medium">{leadData?.yearsInBusiness || "Not provided"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-600">Annual Revenue:</span>
                  <span className="text-sm font-medium">{leadData?.annualRevenue ? `$${leadData.annualRevenue.toLocaleString()}` : "Not provided"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-600">Requested Amount:</span>
                  <span className="text-sm font-medium">{leadData?.requestedAmount ? `$${leadData.requestedAmount.toLocaleString()}` : "Not provided"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-600">Credit Score:</span>
                  <span className="text-sm font-medium">{leadData?.creditScore || "Not provided"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-600">Funding Purpose:</span>
                  <span className="text-sm font-medium">{leadData?.loanPurpose || "Not provided"}</span>
                </div>
              </div>
            </div>
            
            <div className="pt-2">
              <h3 className="text-sm font-medium text-neutral-600 mb-2">QUALIFICATION STATUS</h3>
              <div className="bg-green-100 text-green-700 p-2 rounded-lg flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {matchCount > 0 
                    ? `Pre-qualified for ${matchCount} lender${matchCount === 1 ? '' : 's'}`
                    : leadData && Object.keys(leadData).length > 0 
                      ? "Collecting qualification information" 
                      : "Not yet qualified"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Conversation Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-neutral-600">Conversation Mode</Label>
              <Select defaultValue="full">
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Qualification</SelectItem>
                  <SelectItem value="quick">Quick Pre-qualification</SelectItem>
                  <SelectItem value="info">Information Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-neutral-600">Response Style</Label>
              <Select defaultValue="professional">
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="conversational">Conversational</SelectItem>
                  <SelectItem value="concise">Concise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-600">Enable Follow-up Prompts</span>
              <Switch defaultChecked id="follow-up-prompts" />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-600">Save Conversation Data</span>
              <Switch defaultChecked id="save-data" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Agent Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-neutral-600">Knowledge Base Source</Label>
              <Select defaultValue="sheets">
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sheets">Google Sheets Integration</SelectItem>
                  <SelectItem value="database">Direct Database Connection</SelectItem>
                  <SelectItem value="api">Custom API Endpoint</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-neutral-600">Retrieval Method</Label>
              <div className="mt-1 grid grid-cols-2 gap-2">
                <div className="bg-primary bg-opacity-10 border-2 border-primary rounded-lg px-3 py-2 text-center">
                  <p className="text-sm font-medium text-primary">RAG</p>
                </div>
                <div className="bg-white border border-neutral-300 rounded-lg px-3 py-2 text-center">
                  <p className="text-sm font-medium text-neutral-600">Fine-tuning</p>
                </div>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-neutral-600">Data Refresh Interval</Label>
              <Select defaultValue="daily">
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue placeholder="Select interval" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="manual">Manual Refresh Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button className="w-full">
              Update Configuration
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
