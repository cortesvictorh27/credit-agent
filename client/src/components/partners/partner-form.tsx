import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface LendingPartner {
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

interface PartnerFormProps {
  partner?: LendingPartner;
  onSuccess: () => void;
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  loanType: z.string().min(1, "Loan type is required"),
  minLoanAmount: z.coerce.number().min(0, "Minimum loan amount must be a positive number"),
  maxLoanAmount: z.coerce.number().min(0, "Maximum loan amount must be a positive number"),
  minCreditScore: z.coerce.number().min(300, "Minimum credit score must be at least 300").max(850, "Maximum credit score cannot exceed 850"),
  minAnnualRevenue: z.coerce.number().min(0, "Minimum annual revenue must be a positive number"),
  minYearsInBusiness: z.coerce.number().min(0, "Minimum years in business must be a positive number"),
  interestRateMin: z.coerce.number().min(0, "Minimum interest rate must be a positive number").optional(),
  interestRateMax: z.coerce.number().min(0, "Maximum interest rate must be a positive number").optional(),
  termLengthMin: z.coerce.number().min(0, "Minimum term length must be a positive number").optional(),
  termLengthMax: z.coerce.number().min(0, "Maximum term length must be a positive number").optional(),
  termUnit: z.string().optional(),
  fundingTimeMin: z.coerce.number().min(0, "Minimum funding time must be a positive number").optional(),
  fundingTimeMax: z.coerce.number().min(0, "Maximum funding time must be a positive number").optional(),
  fundingTimeUnit: z.string().optional(),
  active: z.boolean().default(true),
}).refine(data => data.maxLoanAmount >= data.minLoanAmount, {
  message: "Maximum loan amount must be greater than or equal to minimum loan amount",
  path: ["maxLoanAmount"],
}).refine(data => !data.interestRateMin || !data.interestRateMax || data.interestRateMax >= data.interestRateMin, {
  message: "Maximum interest rate must be greater than or equal to minimum interest rate",
  path: ["interestRateMax"],
}).refine(data => !data.termLengthMin || !data.termLengthMax || data.termLengthMax >= data.termLengthMin, {
  message: "Maximum term length must be greater than or equal to minimum term length",
  path: ["termLengthMax"],
}).refine(data => !data.fundingTimeMin || !data.fundingTimeMax || data.fundingTimeMax >= data.fundingTimeMin, {
  message: "Maximum funding time must be greater than or equal to minimum funding time",
  path: ["fundingTimeMax"],
});

export default function PartnerForm({ partner, onSuccess }: PartnerFormProps) {
  const { toast } = useToast();
  const isEditing = !!partner;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: partner ? {
      ...partner,
      interestRateMin: partner.interestRateMin || undefined,
      interestRateMax: partner.interestRateMax || undefined,
      termLengthMin: partner.termLengthMin || undefined,
      termLengthMax: partner.termLengthMax || undefined,
      termUnit: partner.termUnit || undefined,
      fundingTimeMin: partner.fundingTimeMin || undefined,
      fundingTimeMax: partner.fundingTimeMax || undefined,
      fundingTimeUnit: partner.fundingTimeUnit || undefined,
    } : {
      name: "",
      loanType: "",
      minLoanAmount: 0,
      maxLoanAmount: 0,
      minCreditScore: 600,
      minAnnualRevenue: 0,
      minYearsInBusiness: 0,
      active: true,
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (isEditing && partner) {
        return apiRequest("PUT", `/api/lending-partners/${partner.id}`, values);
      } else {
        return apiRequest("POST", "/api/lending-partners", values);
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Lending partner ${isEditing ? "updated" : "created"} successfully`,
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} lending partner`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutation.mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Partner Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter partner name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="loanType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loan Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select loan type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Term Loan">Term Loan</SelectItem>
                    <SelectItem value="Line of Credit">Line of Credit</SelectItem>
                    <SelectItem value="SBA Loan">SBA Loan</SelectItem>
                    <SelectItem value="Equipment Financing">Equipment Financing</SelectItem>
                    <SelectItem value="Merchant Cash Advance">Merchant Cash Advance</SelectItem>
                    <SelectItem value="Invoice Factoring">Invoice Factoring</SelectItem>
                    <SelectItem value="Business Credit Card">Business Credit Card</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="minLoanAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Loan Amount</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="maxLoanAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Loan Amount</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="minCreditScore"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Credit Score</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="600" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="minAnnualRevenue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Annual Revenue</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="minYearsInBusiness"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Years in Business</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    step="0.1" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Use 0.5 for 6 months
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="interestRateMin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Interest Rate (%)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Optional" step="0.1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="interestRateMax"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Interest Rate (%)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Optional" step="0.1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="termLengthMin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Term Length</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Optional" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="termLengthMax"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Term Length</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Optional" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="termUnit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Term Unit</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select term unit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="days">Days</SelectItem>
                    <SelectItem value="months">Months</SelectItem>
                    <SelectItem value="years">Years</SelectItem>
                    <SelectItem value="revolving">Revolving</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="fundingTimeMin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Funding Time</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Optional" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="fundingTimeMax"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Funding Time</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Optional" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="fundingTimeUnit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Funding Time Unit</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select funding time unit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="hours">Hours</SelectItem>
                    <SelectItem value="days">Days</SelectItem>
                    <SelectItem value="weeks">Weeks</SelectItem>
                    <SelectItem value="months">Months</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active</FormLabel>
                <FormDescription>
                  Whether this lending partner is active and should be included in matching.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : isEditing ? "Update Partner" : "Add Partner"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
