import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface LoanCardProps {
  name: string;
  loanType: string;
  minAmount: number;
  maxAmount: number;
  interestRateMin?: number;
  interestRateMax?: number;
  termLengthMin?: number;
  termLengthMax?: number;
  termUnit?: string;
  fundingTimeMin?: number;
  fundingTimeMax?: number;
  fundingTimeUnit?: string;
  score?: number;
  isSelected?: boolean;
  onSelect?: () => void;
}

export default function LoanCard({
  name,
  loanType,
  minAmount,
  maxAmount,
  interestRateMin,
  interestRateMax,
  termLengthMin,
  termLengthMax,
  termUnit,
  fundingTimeMin,
  fundingTimeMax,
  fundingTimeUnit,
  score,
  isSelected,
  onSelect
}: LoanCardProps) {
  return (
    <Card 
      className={`cursor-pointer transition-all hover:border-primary ${isSelected ? 'border-primary border-2' : ''}`}
      onClick={onSelect}
    >
      <CardContent className="pt-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-neutral-800">{name}</h3>
            <p className="text-sm text-neutral-600">{loanType}</p>
          </div>
          {score && (
            <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200">
              {score}% Match
            </Badge>
          )}
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-neutral-500">Loan Amount:</p>
            <p className="font-medium">${minAmount.toLocaleString()} - ${maxAmount.toLocaleString()}</p>
          </div>
          {interestRateMin !== undefined && interestRateMax !== undefined && (
            <div>
              <p className="text-neutral-500">Interest Rate:</p>
              <p className="font-medium">{interestRateMin}% - {interestRateMax}%</p>
            </div>
          )}
          {termLengthMin !== undefined && termLengthMax !== undefined && termUnit && (
            <div>
              <p className="text-neutral-500">Term Length:</p>
              <p className="font-medium">
                {termUnit === 'revolving' 
                  ? 'Revolving' 
                  : `${termLengthMin} - ${termLengthMax} ${termUnit}`}
              </p>
            </div>
          )}
          {fundingTimeMin !== undefined && fundingTimeMax !== undefined && fundingTimeUnit && (
            <div>
              <p className="text-neutral-500">Funding Time:</p>
              <p className="font-medium">{fundingTimeMin}-{fundingTimeMax} {fundingTimeUnit}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
