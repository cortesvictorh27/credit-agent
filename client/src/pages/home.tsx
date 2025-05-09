import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Users, MessageSquare, Building2, ExternalLink } from "lucide-react";

export default function Home() {
  const [location, setLocation] = useLocation();

  // Fetch leads data
  const { data: leads = [], isLoading: isLeadsLoading } = useQuery({
    queryKey: ["/api/leads"],
  });

  // Fetch lending partners data
  const { data: partners = [], isLoading: isPartnersLoading } = useQuery({
    queryKey: ["/api/lending-partners"],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-800">Dashboard</h1>
        <p className="text-neutral-600">Welcome to LendMatch AI - Your credit broker assistant</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-neutral-500 mb-1">Total Leads</p>
                <p className="text-2xl font-semibold">{isLeadsLoading ? "..." : leads.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-neutral-500 mb-1">Active Conversations</p>
                <p className="text-2xl font-semibold">
                  {isLeadsLoading ? "..." : leads.filter((lead: any) => lead.status === "active").length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-neutral-500 mb-1">Lending Partners</p>
                <p className="text-2xl font-semibold">{isPartnersLoading ? "..." : partners.length}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Building2 className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-neutral-500 mb-1">Qualified Leads</p>
                <p className="text-2xl font-semibold">
                  {isLeadsLoading
                    ? "..."
                    : leads.filter((lead: any) => lead.status === "qualified").length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-purple-600"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Leads</CardTitle>
          </CardHeader>
          <CardContent>
            {isLeadsLoading ? (
              <div className="py-8 text-center text-neutral-500">Loading leads...</div>
            ) : leads.length === 0 ? (
              <div className="py-8 text-center text-neutral-500">No leads found</div>
            ) : (
              <div className="space-y-4">
                {leads.slice(0, 5).map((lead: any) => (
                  <div key={lead.id} className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                    <div>
                      <p className="font-medium">{lead.businessName}</p>
                      <p className="text-sm text-neutral-500">
                        {lead.businessType || "Business"} • Created {new Date(lead.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        className={`${
                          lead.status === "qualified"
                            ? "bg-green-100 text-green-700"
                            : lead.status === "active"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-neutral-100 text-neutral-700"
                        }`}
                      >
                        {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                      </Badge>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 text-center">
              <Button variant="outline" onClick={() => setLocation("/leads")}>
                View All Leads
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card
                className="bg-primary text-white cursor-pointer hover:bg-primary/90 transition-colors"
                onClick={() => setLocation("/chatbot")}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="h-6 w-6" />
                    <div>
                      <h3 className="font-medium">Open Chatbot</h3>
                      <p className="text-sm text-white/80">Start qualifying leads</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="bg-neutral-100 cursor-pointer hover:bg-neutral-200 transition-colors"
                onClick={() => setLocation("/lending-partners")}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <Building2 className="h-6 w-6 text-neutral-700" />
                    <div>
                      <h3 className="font-medium text-neutral-700">Manage Partners</h3>
                      <p className="text-sm text-neutral-500">View and edit lenders</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-neutral-100 cursor-pointer hover:bg-neutral-200 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6 text-neutral-700"
                    >
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                    </svg>
                    <div>
                      <h3 className="font-medium text-neutral-700">Analytics</h3>
                      <p className="text-sm text-neutral-500">View performance</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-neutral-100 cursor-pointer hover:bg-neutral-200 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6 text-neutral-700"
                    >
                      <circle cx="12" cy="12" r="3"></circle>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                    <div>
                      <h3 className="font-medium text-neutral-700">Settings</h3>
                      <p className="text-sm text-neutral-500">Configure system</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Import at the top of the file
import { Badge } from "@/components/ui/badge";
