<script setup lang="ts">
import { computed } from 'vue'
import type { PawnTransaction } from '../types/pawn'
import { formatCurrency } from '../utils/calculations'

const props = defineProps<{
  transactions: PawnTransaction[]
}>()

const totals = computed(() =>
  props.transactions.reduce(
    (summary, transaction) => ({
      interest: summary.interest + transaction.interestAmount,
      serviceCharge: summary.serviceCharge + transaction.serviceCharge,
      storageFee: summary.storageFee + transaction.storageFee,
      penalty: summary.penalty + transaction.penaltyFee,
      expectedIncome: summary.expectedIncome + transaction.expectedEarning,
    }),
    { interest: 0, serviceCharge: 0, storageFee: 0, penalty: 0, expectedIncome: 0 },
  ),
)
</script>

<template>
  <section class="panel transactions-panel" aria-labelledby="income-title">
    <div class="panel-heading table-heading">
      <div>
        <p class="eyebrow">All clients</p>
        <h2 id="income-title">Income Statement</h2>
      </div>
      <span class="record-count">{{ transactions.length }} records</span>
    </div>

    <div v-if="transactions.length" class="table-scroll">
      <table class="income-table">
        <thead>
          <tr>
            <th>Client Name</th>
            <th>Monthly Interest</th>
            <th>Service Charge</th>
            <th>Storage Fee</th>
            <th>Penalty Per Day</th>
            <th>Overdue Days</th>
            <th>Total Penalty</th>
            <th>Expected Income</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="transaction in transactions" :key="transaction.id">
            <td>
              <strong>{{ transaction.clientName }}</strong>
              <span class="cell-secondary">{{ transaction.itemName }}</span>
            </td>
            <td>
              <strong>{{ transaction.interestRate }}%</strong>
              <span class="cell-secondary">{{ formatCurrency(transaction.interestAmount) }}</span>
            </td>
            <td>{{ formatCurrency(transaction.serviceCharge) }}</td>
            <td>{{ formatCurrency(transaction.storageFee) }}</td>
            <td>
              {{ formatCurrency(transaction.dailyPenaltyFee) }}/day ×
              {{ transaction.overdueDays }} days
            </td>
            <td>{{ transaction.overdueDays }}</td>
            <td>{{ formatCurrency(transaction.penaltyFee) }}</td>
            <td class="earning-cell">{{ formatCurrency(transaction.expectedEarning) }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <th scope="row">Totals</th>
            <td>{{ formatCurrency(totals.interest) }}</td>
            <td>{{ formatCurrency(totals.serviceCharge) }}</td>
            <td>{{ formatCurrency(totals.storageFee) }}</td>
            <td></td>
            <td></td>
            <td>{{ formatCurrency(totals.penalty) }}</td>
            <td>{{ formatCurrency(totals.expectedIncome) }}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <div v-else class="empty-state">
      <span aria-hidden="true">₱</span>
      <h3>No income yet</h3>
      <p>Add a pawn transaction to populate the income statement.</p>
    </div>
  </section>
</template>
