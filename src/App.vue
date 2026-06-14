<script setup lang="ts">
import { computed, ref } from 'vue'
import CalculationPreview from './components/CalculationPreview.vue'
import PawnForm from './components/PawnForm.vue'
import SummaryCards from './components/SummaryCards.vue'
import TransactionModal from './components/TransactionModal.vue'
import TransactionTable from './components/TransactionTable.vue'
import { sampleTransactions } from './data/sampleTransactions'
import type { LoanCalculation, PawnForm as PawnFormModel, PawnTransaction } from './types/pawn'
import {
  calculateExpectedEarning,
  calculateInterest,
  calculateTotalPayable,
} from './utils/calculations'

function localIsoDate(): string {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

function createDefaultForm(): PawnFormModel {
  return {
    clientName: '',
    contactNumber: '',
    itemName: '',
    itemCategory: 'Jewelry',
    itemDescription: '',
    appraisedValue: 30000,
    loanAmount: 20000,
    interestRate: 3,
    loanTerm: 30,
    serviceFee: 300,
    penaltyFee: 0,
    pawnDate: localIsoDate(),
  }
}

function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `pawn-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const form = ref<PawnFormModel>(createDefaultForm())
const transactions = ref<PawnTransaction[]>(
  sampleTransactions.map((transaction) => ({ ...transaction })),
)
const selectedTransaction = ref<PawnTransaction | null>(null)

const calculation = computed<LoanCalculation>(() => {
  const interestAmount = calculateInterest(
    Number(form.value.loanAmount) || 0,
    Number(form.value.interestRate) || 0,
    form.value.loanTerm,
  )
  const serviceFee = Number(form.value.serviceFee) || 0
  const penaltyFee = Number(form.value.penaltyFee) || 0

  return {
    interestAmount,
    totalPayable: calculateTotalPayable(
      Number(form.value.loanAmount) || 0,
      interestAmount,
      serviceFee,
      penaltyFee,
    ),
    expectedEarning: calculateExpectedEarning(interestAmount, serviceFee, penaltyFee),
  }
})

const totals = computed(() =>
  transactions.value.reduce(
    (summary, transaction) => ({
      loanAmount: summary.loanAmount + transaction.loanAmount,
      interest: summary.interest + transaction.interestAmount,
      earnings: summary.earnings + transaction.expectedEarning,
    }),
    { loanAmount: 0, interest: 0, earnings: 0 },
  ),
)

function addTransaction() {
  transactions.value.unshift({
    ...form.value,
    id: createId(),
    ...calculation.value,
    status: 'Active',
  })
  form.value = createDefaultForm()
}

function viewTransaction(transaction: PawnTransaction) {
  selectedTransaction.value = transaction
}

function deleteTransaction(id: string) {
  transactions.value = transactions.value.filter((transaction) => transaction.id !== id)

  if (selectedTransaction.value?.id === id) {
    selectedTransaction.value = null
  }
}

function redeemTransaction(id: string) {
  transactions.value = transactions.value.map((transaction) =>
    transaction.id === id ? { ...transaction, status: 'Redeemed' } : transaction,
  )

  if (selectedTransaction.value?.id === id) {
    selectedTransaction.value = { ...selectedTransaction.value, status: 'Redeemed' }
  }
}
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <a class="brand" href="#" aria-label="PawnLedger home">
        <span class="brand-mark">P</span>
        <span>
          <strong>PawnLedger</strong>
          <small>Lending workspace</small>
        </span>
      </a>
      <div class="prototype-pill"><i></i> Frontend prototype</div>
    </header>

    <main>
      <section class="hero-section">
        <div>
          <p class="eyebrow">Operations dashboard</p>
          <h1>Pawnshop Lending Prototype</h1>
          <p>Encode pawned items, calculate lending terms, and track projected earnings.</p>
        </div>
        <div class="date-chip">
          <span>As of</span>
          <strong>
            {{ new Intl.DateTimeFormat('en-PH', { dateStyle: 'long' }).format(new Date()) }}
          </strong>
        </div>
      </section>

      <SummaryCards
        :total-loan-amount="totals.loanAmount"
        :total-interest="totals.interest"
        :total-earnings="totals.earnings"
        :total-transactions="transactions.length"
      />

      <section class="workspace-grid">
        <PawnForm v-model="form" @submit="addTransaction" />
        <CalculationPreview :form="form" :calculation="calculation" />
      </section>

      <TransactionTable
        :transactions="transactions"
        @view="viewTransaction"
        @delete="deleteTransaction"
        @redeem="redeemTransaction"
      />
    </main>

    <footer>
      <span>PawnLedger Prototype</span>
      <span>Local session only | Data resets on refresh</span>
    </footer>

    <TransactionModal
      v-if="selectedTransaction"
      :transaction="selectedTransaction"
      @close="selectedTransaction = null"
    />
  </div>
</template>
