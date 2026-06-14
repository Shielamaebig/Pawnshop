export type LoanTerm = 15 | 30 | 60 | 90

export type PawnStatus = 'Active' | 'Redeemed'

export type ItemCategory = 'Jewelry' | 'Gadget' | 'Appliance' | 'Vehicle' | 'Other'

export interface PawnForm {
  clientName: string
  contactNumber: string
  itemName: string
  itemCategory: ItemCategory
  itemDescription: string
  appraisedValue: number
  loanAmount: number
  interestRate: number
  loanTerm: LoanTerm
  serviceFee: number
  penaltyFee: number
  pawnDate: string
}

export interface PawnTransaction extends PawnForm {
  id: string
  interestAmount: number
  totalPayable: number
  expectedEarning: number
  status: PawnStatus
}

export interface LoanCalculation {
  interestAmount: number
  totalPayable: number
  expectedEarning: number
}
