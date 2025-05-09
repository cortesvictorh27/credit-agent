import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Edit, Trash2, Search, Filter } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import PartnerForm from "./partner-form";

export interface LendingPartner {
  id: number;
  name: string;
  loanType: string;
  minLoanAmount: number;
  maxLoanAmount: number;
  minCreditScore: number;
  minAnnualRevenue: number;
  minYearsInBusiness: number;
  interestRateMin?: number;
  interestRateMax?: number;
  termLengthMin?: number;
  termLengthMax?: number;
  termUnit?: string;
  fundingTimeMin?: number;
  fundingTimeMax?: number;
  fundingTimeUnit?: string;
  active: boolean;
}

export default function PartnerTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [partnerToEdit, setPartnerToEdit] = useState<LendingPartner | null>(null);
  const [partnerToDelete, setPartnerToDelete] = useState<LendingPartner | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: partners = [], isLoading } = useQuery({
    queryKey: ["/api/lending-partners"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/lending-partners/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lending-partners"] });
      toast({
        title: "Success",
        description: "Lending partner deleted successfully",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete lending partner",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (partner: LendingPartner) => {
    setPartnerToEdit(partner);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (partner: LendingPartner) => {
    setPartnerToDelete(partner);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (partnerToDelete) {
      deleteMutation.mutate(partnerToDelete.id);
    }
  };

  const filteredPartners = partners.filter((partner: LendingPartner) => {
    return (
      partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.loanType.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-4">
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
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4 text-neutral-600" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                Add Partner
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Lending Partner</DialogTitle>
                <DialogDescription>
                  Enter the details of the new lending partner.
                </DialogDescription>
              </DialogHeader>
              <PartnerForm 
                onSuccess={() => {
                  setIsAddDialogOpen(false);
                  queryClient.invalidateQueries({ queryKey: ["/api/lending-partners"] });
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="overflow-x-auto rounded-md border">
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
              filteredPartners.map((partner: LendingPartner) => (
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
                        onClick={() => handleEdit(partner)}
                        className="p-1 text-neutral-600 hover:text-primary"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(partner)}
                        className="p-1 text-neutral-600 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Lending Partner</DialogTitle>
            <DialogDescription>
              Update the details of the lending partner.
            </DialogDescription>
          </DialogHeader>
          {partnerToEdit && (
            <PartnerForm 
              partner={partnerToEdit}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                queryClient.invalidateQueries({ queryKey: ["/api/lending-partners"] });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the lending partner {partnerToDelete?.name}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
