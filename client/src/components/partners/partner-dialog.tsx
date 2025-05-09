import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PartnerDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PartnerDialog({ isOpen, onClose }: PartnerDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: partners = [], isLoading } = useQuery({
    queryKey: ["/api/lending-partners"],
  });
  
  const filteredPartners = partners.filter((partner: any) => {
    return (
      partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.loanType.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader className="flex justify-between items-center">
          <DialogTitle className="text-lg font-semibold">Lending Partner Database</DialogTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="flex justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
              <Input
                type="text"
                placeholder="Search lending partners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              Add Partner
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto overflow-y-auto max-h-[60vh]">
          <Table>
            <TableHeader>
              <TableRow className="bg-neutral-100">
                <TableHead className="text-sm font-medium text-neutral-600">Lender Name</TableHead>
                <TableHead className="text-sm font-medium text-neutral-600">Loan Type</TableHead>
                <TableHead className="text-sm font-medium text-neutral-600">Min Loan</TableHead>
                <TableHead className="text-sm font-medium text-neutral-600">Max Loan</TableHead>
                <TableHead className="text-sm font-medium text-neutral-600">Min Credit Score</TableHead>
                <TableHead className="text-sm font-medium text-neutral-600">Min Annual Revenue</TableHead>
                <TableHead className="text-sm font-medium text-neutral-600">Min Years In Business</TableHead>
                <TableHead className="text-sm font-medium text-neutral-600">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">Loading...</TableCell>
                </TableRow>
              ) : filteredPartners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">No lending partners found</TableCell>
                </TableRow>
              ) : (
                filteredPartners.map((partner: any) => (
                  <TableRow key={partner.id} className="hover:bg-neutral-50">
                    <TableCell>{partner.name}</TableCell>
                    <TableCell>{partner.loanType}</TableCell>
                    <TableCell>${partner.minLoanAmount.toLocaleString()}</TableCell>
                    <TableCell>${partner.maxLoanAmount.toLocaleString()}</TableCell>
                    <TableCell>{partner.minCreditScore}</TableCell>
                    <TableCell>${partner.minAnnualRevenue.toLocaleString()}</TableCell>
                    <TableCell>{partner.minYearsInBusiness}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 text-neutral-600 hover:text-primary"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                            <path d="M12 20h9"></path>
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                          </svg>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 text-neutral-600 hover:text-red-500"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                          </svg>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
