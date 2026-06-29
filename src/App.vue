<script setup lang="ts">
import { computed, ref } from 'vue'
import CalculationPreview from './components/CalculationPreview.vue'
import IncomeStatement from './components/IncomeStatement.vue'
import LoanDetails from './components/LoanDetails.vue'
import PawnForm from './components/PawnForm.vue'
import SummaryCards from './components/SummaryCards.vue'
import TransactionModal from './components/TransactionModal.vue'
import TransactionTable from './components/TransactionTable.vue'
import { sampleTransactions } from './data/sampleTransactions'
import type {
  LoanCalculation,
  LoanSettings,
  PawnForm as PawnFormModel,
  PawnTransaction,
} from './types/pawn'
import {
  addDays,
  calculateExpectedEarning,
  calculateInterest,
  calculateOverdueDays,
  calculatePenalty,
  calculateTotalPayable,
} from './utils/calculations'

type AppView = 'Dashboard' | 'Income Statement' | 'Loan Details'

const views: AppView[] = ['Dashboard', 'Income Statement', 'Loan Details']

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
    loanTerm: 30,
    pawnDate: localIsoDate(),
  }
}

function createDefaultSettings(): LoanSettings {
  return {
    monthlyInterestRate: 7,
    serviceCharge: 300,
    vehicleStorageFee: 500,
    dailyPenaltyFee: 50,
  }
}

function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `pawn-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function isVehicleCategory(itemCategory: PawnFormModel['itemCategory']): boolean {
  return itemCategory === 'Vehicle' || itemCategory === 'Vehicle Lending'
}

function withCurrentPenalty(transaction: PawnTransaction): PawnTransaction {
  if (transaction.status !== 'Active') {
    return transaction
  }

  const overdueDays = calculateOverdueDays(transaction.dueDate, transaction.status)
  const penaltyFee = calculatePenalty(transaction.dailyPenaltyFee, overdueDays)

  return {
    ...transaction,
    overdueDays,
    penaltyFee,
    totalPayable: calculateTotalPayable(
      transaction.loanAmount,
      transaction.interestAmount,
      transaction.serviceCharge,
      transaction.storageFee,
      penaltyFee,
    ),
    expectedEarning: calculateExpectedEarning(
      transaction.interestAmount,
      transaction.serviceCharge,
      transaction.storageFee,
      penaltyFee,
    ),
  }
}

const form = ref<PawnFormModel>(createDefaultForm())
const settings = ref<LoanSettings>(createDefaultSettings())
const activeView = ref<AppView>('Dashboard')
const transactions = ref<PawnTransaction[]>(
  sampleTransactions.map((transaction) => ({ ...transaction })),
)
const selectedTransaction = ref<PawnTransaction | null>(null)
const currentTransactions = computed(() =>
  transactions.value.map((transaction) => withCurrentPenalty(transaction)),
)

const formDueDate = computed(() => addDays(form.value.pawnDate, form.value.loanTerm))
const formOverdueDays = computed(() => calculateOverdueDays(formDueDate.value, 'Active'))

const calculation = computed<LoanCalculation>(() => {
  const interestAmount = calculateInterest(
    Number(form.value.loanAmount) || 0,
    Number(settings.value.monthlyInterestRate) || 0,
    form.value.loanTerm,
  )
  const serviceCharge = Number(settings.value.serviceCharge) || 0
  const storageFee = isVehicleCategory(form.value.itemCategory)
    ? Number(settings.value.vehicleStorageFee) || 0
    : 0
  const penaltyFee = calculatePenalty(Number(settings.value.dailyPenaltyFee) || 0, formOverdueDays.value)

  return {
    interestAmount,
    totalPayable: calculateTotalPayable(
      Number(form.value.loanAmount) || 0,
      interestAmount,
      serviceCharge,
      storageFee,
      penaltyFee,
    ),
    expectedEarning: calculateExpectedEarning(interestAmount, serviceCharge, storageFee, penaltyFee),
  }
})

const totals = computed(() =>
  currentTransactions.value.reduce(
    (summary, transaction) => ({
      loanAmount: summary.loanAmount + transaction.loanAmount,
      interest: summary.interest + transaction.interestAmount,
      earnings: summary.earnings + transaction.expectedEarning,
    }),
    { loanAmount: 0, interest: 0, earnings: 0 },
  ),
)

function addTransaction() {
  const dueDate = formDueDate.value
  const overdueDays = formOverdueDays.value
  const storageFee = isVehicleCategory(form.value.itemCategory)
    ? Number(settings.value.vehicleStorageFee) || 0
    : 0

  transactions.value.unshift({
    ...form.value,
    interestRate: Number(settings.value.monthlyInterestRate) || 0,
    serviceCharge: Number(settings.value.serviceCharge) || 0,
    storageFee,
    dailyPenaltyFee: Number(settings.value.dailyPenaltyFee) || 0,
    overdueDays,
    penaltyFee: calculatePenalty(Number(settings.value.dailyPenaltyFee) || 0, overdueDays),
    dueDate,
    id: createId(),
    ...calculation.value,
    status: 'Active',
  })
  form.value = createDefaultForm()
}

function viewTransaction(transaction: PawnTransaction) {
  selectedTransaction.value = withCurrentPenalty(transaction)
}

function deleteTransaction(id: string) {
  transactions.value = transactions.value.filter((transaction) => transaction.id !== id)

  if (selectedTransaction.value?.id === id) {
    selectedTransaction.value = null
  }
}

function redeemTransaction(id: string) {
  const redeemedDate = localIsoDate()

  transactions.value = transactions.value.map((transaction) =>
    transaction.id === id
      ? (() => {
          const overdueDays = calculateOverdueDays(transaction.dueDate, 'Redeemed', redeemedDate)
          const penaltyFee = calculatePenalty(transaction.dailyPenaltyFee, overdueDays)

          return {
            ...transaction,
            status: 'Redeemed',
            redeemedDate,
            overdueDays,
            penaltyFee,
            totalPayable: calculateTotalPayable(
              transaction.loanAmount,
              transaction.interestAmount,
              transaction.serviceCharge,
              transaction.storageFee,
              penaltyFee,
            ),
            expectedEarning: calculateExpectedEarning(
              transaction.interestAmount,
              transaction.serviceCharge,
              transaction.storageFee,
              penaltyFee,
            ),
          }
        })()
      : transaction,
  )

  if (selectedTransaction.value?.id === id) {
    selectedTransaction.value = transactions.value.find((transaction) => transaction.id === id) ?? null
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

      <nav class="view-tabs" aria-label="Workspace views">
        <button
          v-for="view in views"
          :key="view"
          type="button"
          :class="{ 'view-tab--active': activeView === view }"
          @click="activeView = view"
        >
          {{ view }}
        </button>
      </nav>

      <SummaryCards
        v-if="activeView === 'Dashboard'"
        :total-loan-amount="totals.loanAmount"
        :total-interest="totals.interest"
        :total-earnings="totals.earnings"
        :total-transactions="currentTransactions.length"
      />

      <section v-if="activeView === 'Dashboard'" class="workspace-grid">
        <PawnForm v-model="form" @submit="addTransaction" />
        <CalculationPreview
          :form="form"
          :settings="settings"
          :calculation="calculation"
          :overdue-days="formOverdueDays"
        />
      </section>

      <TransactionTable
        v-if="activeView === 'Dashboard'"
        :transactions="currentTransactions"
        @view="viewTransaction"
        @delete="deleteTransaction"
        @redeem="redeemTransaction"
      />

      <IncomeStatement v-if="activeView === 'Income Statement'" :transactions="currentTransactions" />

      <LoanDetails v-if="activeView === 'Loan Details'" v-model="settings" />
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
