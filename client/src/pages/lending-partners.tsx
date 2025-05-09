import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PartnerTable from "@/components/partners/partner-table";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { RefreshCw, Database, FileSpreadsheet } from "lucide-react";

export default function LendingPartners() {
  const [syncConfig, setSyncConfig] = useState({
    apiKey: process.env.GOOGLE_SHEETS_API_KEY || "",
    spreadsheetId: "",
    range: "A1:P100"
  });
  const { toast } = useToast();

  const { data: partners = [], isLoading } = useQuery({
    queryKey: ["/api/lending-partners"],
  });

  // Mutation for syncing partners from Google Sheets
  const syncMutation = useMutation({
    mutationFn: async (config: { apiKey: string; spreadsheetId: string; range: string }) => {
      return apiRequest("POST", "/api/sync/lending-partners", config);
    },
    onSuccess: (data) => {
      toast({
        title: "Synced Successfully",
        description: `Added: ${data.added}, Updated: ${data.updated}, Unchanged: ${data.unchanged}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/lending-partners"] });
    },
    onError: () => {
      toast({
        title: "Sync Failed",
        description: "Failed to sync lending partners from Google Sheets",
        variant: "destructive",
      });
    },
  });

  const handleSyncSheets = () => {
    if (!syncConfig.spreadsheetId) {
      toast({
        title: "Missing Configuration",
        description: "Please provide a Google Sheets spreadsheet ID",
        variant: "destructive",
      });
      return;
    }
    
    syncMutation.mutate(syncConfig);
  };

  // Calculate active and inactive partners
  const activePartners = partners.filter((partner: any) => partner.active).length;
  const inactivePartners = partners.length - activePartners;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-800">Lending Partners</h1>
        <p className="text-neutral-600">Manage your lending partners and their requirements</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-neutral-500 mb-1">Total Partners</p>
                <p className="text-2xl font-semibold">{isLoading ? "..." : partners.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Database className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-neutral-500 mb-1">Active Partners</p>
                <p className="text-2xl font-semibold">{isLoading ? "..." : activePartners}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-green-600"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-neutral-500 mb-1">Inactive Partners</p>
                <p className="text-2xl font-semibold">{isLoading ? "..." : inactivePartners}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-red-600"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="partners">
        <TabsList>
          <TabsTrigger value="partners">Partners</TabsTrigger>
          <TabsTrigger value="import">Import & Sync</TabsTrigger>
        </TabsList>
        <TabsContent value="partners" className="mt-4">
          <PartnerTable />
        </TabsContent>
        <TabsContent value="import" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Google Sheets Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-600 mb-1">
                    Google Sheets Spreadsheet ID
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={syncConfig.spreadsheetId}
                      onChange={(e) => setSyncConfig({ ...syncConfig, spreadsheetId: e.target.value })}
                      placeholder="Enter spreadsheet ID from URL"
                      className="flex-1 border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <Button 
                      onClick={handleSyncSheets}
                      disabled={syncMutation.isPending || !syncConfig.spreadsheetId}
                      className="flex items-center space-x-1"
                    >
                      {syncMutation.isPending ? (
                        <>
                          <span className="animate-spin">
                            <RefreshCw className="h-4 w-4" />
                          </span>
                          <span>Syncing...</span>
                        </>
                      ) : (
                        <>
                          <FileSpreadsheet className="h-4 w-4" />
                          <span>Sync Now</span>
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="mt-1 text-sm text-neutral-500">
                    The ID is the value between /d/ and /edit in the Google Sheets URL
                  </p>
                </div>
                
                <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                  <h3 className="font-medium mb-2">Expected Spreadsheet Format</h3>
                  <p className="text-sm text-neutral-600 mb-2">
                    Your Google Sheet should have the following columns:
                  </p>
                  <div className="text-sm text-neutral-600 space-y-1">
                    <p>
                      <span className="font-medium">Column A:</span> Partner Name
                    </p>
                    <p>
                      <span className="font-medium">Column B:</span> Loan Type
                    </p>
                    <p>
                      <span className="font-medium">Column C:</span> Min Loan Amount
                    </p>
                    <p>
                      <span className="font-medium">Column D:</span> Max Loan Amount
                    </p>
                    <p>
                      <span className="font-medium">Column E:</span> Min Credit Score
                    </p>
                    <p>
                      <span className="font-medium">Column F:</span> Min Annual Revenue
                    </p>
                    <p>
                      <span className="font-medium">Column G:</span> Min Years in Business
                    </p>
                    <p className="text-neutral-500">
                      See documentation for additional optional columns
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
