export type LoanTerm = 15 | 30 | 60 | 90;

export type PawnStatus = "Active" | "Redeemed";

export type ItemCategory =
  | "Jewelry"
  | "Gadget"
  | "Appliance"
  | "Vehicle"
  | "Vehicle Lending"
  | "Other";

export interface LoanSettings {
  monthlyInterestRate: number;
  serviceCharge: number;
  vehicleStorageFee: number;
  dailyPenaltyFee: number;
}

export interface PawnForm {
  clientName: string;
  contactNumber: string;
  itemName: string;
  itemCategory: ItemCategory;
  itemDescription: string;
  appraisedValue: number;
  loanAmount: number;
  loanTerm: LoanTerm;
  pawnDate: string;
}

export interface PawnTransaction extends PawnForm {
  id: string;
  interestRate: number;
  serviceCharge: number;
  storageFee: number;
  dailyPenaltyFee: number;
  overdueDays: number;
  penaltyFee: number;
  dueDate: string;
  redeemedDate?: string;
  interestAmount: number;
  totalPayable: number;
  expectedEarning: number;
  status: PawnStatus;
}

export interface LoanCalculation {
  interestAmount: number;
  totalPayable: number;
  expectedEarning: number;
}
