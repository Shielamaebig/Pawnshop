<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { PawnTransaction } from '../types/pawn'
import { formatCurrency } from '../utils/calculations'

const props = defineProps<{
  transaction: PawnTransaction
}>()

const emit = defineEmits<{
  close: []
}>()

const closeButton = ref<HTMLButtonElement | null>(null)

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    emit('close')
  }
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`))
}

function hasStorageFee(transaction: PawnTransaction): boolean {
  return (
    transaction.itemCategory === 'Vehicle' ||
    transaction.itemCategory === 'Vehicle Lending' ||
    transaction.storageFee > 0
  )
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  closeButton.value?.focus()
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <section
      class="modal-card"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="`transaction-${props.transaction.id}`"
    >
      <header class="modal-header">
        <div>
          <p class="eyebrow">Transaction details</p>
          <h2 :id="`transaction-${props.transaction.id}`">{{ transaction.itemName }}</h2>
        </div>
        <button
          ref="closeButton"
          class="modal-close"
          type="button"
          aria-label="Close details"
          @click="emit('close')"
        >
          ×
        </button>
      </header>

      <div class="modal-client">
        <div class="client-avatar" aria-hidden="true">
          {{ transaction.clientName.charAt(0) }}
        </div>
        <div>
          <strong>{{ transaction.clientName }}</strong>
          <span>{{ transaction.contactNumber }}</span>
        </div>
        <span
          class="status-badge"
          :class="`status-badge--${transaction.status.toLowerCase()}`"
        >
          {{ transaction.status }}
        </span>
      </div>

      <div class="detail-grid">
        <div>
          <span>Category</span>
          <strong>{{ transaction.itemCategory }}</strong>
        </div>
        <div>
          <span>Pawn Date</span>
          <strong>{{ formatDate(transaction.pawnDate) }}</strong>
        </div>
        <div>
          <span>Due Date</span>
          <strong>{{ formatDate(transaction.dueDate) }}</strong>
        </div>
        <div v-if="transaction.redeemedDate">
          <span>Redeemed Date</span>
          <strong>{{ formatDate(transaction.redeemedDate) }}</strong>
        </div>
        <div>
          <span>Appraised Value</span>
          <strong>{{ formatCurrency(transaction.appraisedValue) }}</strong>
        </div>
        <div>
          <span>Loan Amount</span>
          <strong>{{ formatCurrency(transaction.loanAmount) }}</strong>
        </div>
        <div>
          <span>Interest Rate</span>
          <strong>{{ transaction.interestRate }}% monthly</strong>
        </div>
        <div>
          <span>Loan Term</span>
          <strong>{{ transaction.loanTerm }} days</strong>
        </div>
      </div>

      <div class="description-block">
        <span>Item Description</span>
        <p>{{ transaction.itemDescription }}</p>
      </div>

      <dl class="modal-breakdown">
        <div>
          <dt>Interest Amount</dt>
          <dd>{{ formatCurrency(transaction.interestAmount) }}</dd>
        </div>
        <div>
          <dt>Service Charge</dt>
          <dd>{{ formatCurrency(transaction.serviceCharge) }}</dd>
        </div>
        <div v-if="hasStorageFee(transaction)">
          <dt>Storage Fee</dt>
          <dd>{{ formatCurrency(transaction.storageFee) }}</dd>
        </div>
        <div>
          <dt>Penalty Fee</dt>
          <dd>
            {{ formatCurrency(transaction.dailyPenaltyFee) }}/day ×
            {{ transaction.overdueDays }} days =
            {{ formatCurrency(transaction.penaltyFee) }}
          </dd>
        </div>
        <div class="modal-total">
          <dt>Total Payable</dt>
          <dd>{{ formatCurrency(transaction.totalPayable) }}</dd>
        </div>
        <div class="modal-earning">
          <dt>Expected Earning</dt>
          <dd>{{ formatCurrency(transaction.expectedEarning) }}</dd>
        </div>
      </dl>
    </section>
  </div>
</template>
