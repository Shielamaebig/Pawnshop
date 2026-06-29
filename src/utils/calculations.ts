import type { LoanTerm, PawnStatus } from '../types/pawn'

const TERM_MULTIPLIERS: Record<LoanTerm, number> = {
  15: 0.5,
  30: 1,
  60: 2,
  90: 3,
}

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function parseUtcDate(value: string): Date {
  return new Date(`${value}T00:00:00Z`)
}

function toIsoDate(value: Date): string {
  return value.toISOString().slice(0, 10)
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

export function calculatePercentageAmount(amount: number, rate: number): number {
  const percentageAmount = amount * (rate / 100)
  return roundMoney(Number.isFinite(percentageAmount) ? percentageAmount : 0)
}

export function calculateTotalPayable(
  loanAmount: number,
  interestAmount: number,
  serviceCharge: number,
  storageFee = 0,
  penaltyFee = 0,
): number {
  return roundMoney(loanAmount + interestAmount + serviceCharge + storageFee + penaltyFee)
}

export function calculateExpectedEarning(
  interestAmount: number,
  serviceCharge: number,
  storageFee = 0,
  penaltyFee = 0,
): number {
  return roundMoney(interestAmount + serviceCharge + storageFee + penaltyFee)
}

export function addDays(date: string, days: number): string {
  const value = parseUtcDate(date)
  value.setUTCDate(value.getUTCDate() + days)
  return toIsoDate(value)
}

export function calculateOverdueDays(
  dueDate: string,
  status: PawnStatus,
  redeemedDate?: string,
  today = new Date(),
): number {
  const comparisonDate = status === 'Redeemed' && redeemedDate ? parseUtcDate(redeemedDate) : today
  const due = parseUtcDate(dueDate)
  const elapsedMs =
    Date.UTC(
      comparisonDate.getUTCFullYear(),
      comparisonDate.getUTCMonth(),
      comparisonDate.getUTCDate(),
    ) - Date.UTC(due.getUTCFullYear(), due.getUTCMonth(), due.getUTCDate())

  return Math.max(0, Math.floor(elapsedMs / 86_400_000))
}

export function calculatePenalty(dailyPenaltyFee: number, overdueDays: number): number {
  return roundMoney(dailyPenaltyFee * overdueDays)
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0)
}
