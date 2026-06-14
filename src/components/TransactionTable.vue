<script setup lang="ts">
import { ref } from 'vue'
import type { PawnTransaction } from '../types/pawn'
import { formatCurrency } from '../utils/calculations'

defineProps<{
  transactions: PawnTransaction[]
}>()

const emit = defineEmits<{
  view: [transaction: PawnTransaction]
  delete: [id: string]
  redeem: [id: string]
}>()

const deleteCandidate = ref<string | null>(null)

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`))
}

function confirmDelete(id: string) {
  emit('delete', id)
  deleteCandidate.value = null
}
</script>

<template>
  <section class="panel transactions-panel" aria-labelledby="transactions-title">
    <div class="panel-heading table-heading">
      <div>
        <p class="eyebrow">Portfolio activity</p>
        <h2 id="transactions-title">Pawn Transactions</h2>
      </div>
      <span class="record-count">{{ transactions.length }} records</span>
    </div>

    <div v-if="transactions.length" class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Client / Item</th>
            <th>Category</th>
            <th>Appraised Value</th>
            <th>Loan Amount</th>
            <th>Interest</th>
            <th>Total Payable</th>
            <th>Expected Earning</th>
            <th>Pawn Date</th>
            <th>Status</th>
            <th class="actions-heading">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="transaction in transactions" :key="transaction.id">
            <td>
              <strong>{{ transaction.clientName }}</strong>
              <span class="cell-secondary">{{ transaction.itemName }}</span>
            </td>
            <td>{{ transaction.itemCategory }}</td>
            <td>{{ formatCurrency(transaction.appraisedValue) }}</td>
            <td class="money-cell">{{ formatCurrency(transaction.loanAmount) }}</td>
            <td>{{ formatCurrency(transaction.interestAmount) }}</td>
            <td class="money-cell">{{ formatCurrency(transaction.totalPayable) }}</td>
            <td class="earning-cell">{{ formatCurrency(transaction.expectedEarning) }}</td>
            <td>{{ formatDate(transaction.pawnDate) }}</td>
            <td>
              <span
                class="status-badge"
                :class="`status-badge--${transaction.status.toLowerCase()}`"
              >
                {{ transaction.status }}
              </span>
            </td>
            <td>
              <div v-if="deleteCandidate === transaction.id" class="confirm-actions">
                <span>Delete?</span>
                <button
                  class="text-button text-button--danger"
                  type="button"
                  @click="confirmDelete(transaction.id)"
                >
                  Yes
                </button>
                <button class="text-button" type="button" @click="deleteCandidate = null">No</button>
              </div>
              <div v-else class="row-actions">
                <button
                  class="icon-button"
                  type="button"
                  :aria-label="`View ${transaction.clientName}'s transaction`"
                  @click="emit('view', transaction)"
                >
                  View
                </button>
                <button
                  v-if="transaction.status === 'Active'"
                  class="icon-button icon-button--redeem"
                  type="button"
                  :aria-label="`Mark ${transaction.clientName}'s transaction as redeemed`"
                  @click="emit('redeem', transaction.id)"
                >
                  Redeem
                </button>
                <button
                  class="icon-button icon-button--delete"
                  type="button"
                  :aria-label="`Delete ${transaction.clientName}'s transaction`"
                  @click="deleteCandidate = transaction.id"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="empty-state">
      <span aria-hidden="true">₱</span>
      <h3>No transactions yet</h3>
      <p>Add a pawn item above to begin your transaction list.</p>
    </div>
  </section>
</template>
