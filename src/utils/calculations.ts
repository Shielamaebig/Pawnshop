import type { LoanTerm } from '../types/pawn'

const TERM_MULTIPLIERS: Record<LoanTerm, number> = {
  15: 0.5,
  30: 1,
  60: 2,
  90: 3,
}

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function calculateInterest(
  loanAmount: number,
  interestRate: number,
  loanTerm: LoanTerm,
): number {
  // The entered rate is monthly; the selected term scales it from half a month to three months.
  const interest = loanAmount * (interestRate / 100) * TERM_MULTIPLIERS[loanTerm]
  return roundMoney(Number.isFinite(interest) ? interest : 0)
}

export function calculateTotalPayable(
  loanAmount: number,
  interestAmount: number,
  serviceFee: number,
  penaltyFee = 0,
): number {
  return roundMoney(loanAmount + interestAmount + serviceFee + penaltyFee)
}

export function calculateExpectedEarning(
  interestAmount: number,
  serviceFee: number,
  penaltyFee = 0,
): number {
  return roundMoney(interestAmount + serviceFee + penaltyFee)
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0)
}
