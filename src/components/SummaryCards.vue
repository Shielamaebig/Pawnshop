<script setup lang="ts">
import { formatCurrency } from '../utils/calculations'

defineProps<{
  totalLoanAmount: number
  totalInterest: number
  totalEarnings: number
  totalTransactions: number
}>()
</script>

<template>
  <section class="summary-grid" aria-label="Portfolio summary">
    <article class="summary-card">
      <span class="summary-icon summary-icon--blue" aria-hidden="true">₱</span>
      <div>
        <p>Total Loan Amount</p>
        <strong data-testid="total-loans">{{ formatCurrency(totalLoanAmount) }}</strong>
        <span>Across all transactions</span>
      </div>
    </article>

    <article class="summary-card">
      <span class="summary-icon summary-icon--gold" aria-hidden="true">%</span>
      <div>
        <p>Total Interest Earned</p>
        <strong data-testid="total-interest">{{ formatCurrency(totalInterest) }}</strong>
        <span>Projected interest</span>
      </div>
    </article>

    <article class="summary-card">
      <span class="summary-icon summary-icon--green" aria-hidden="true">↗</span>
      <div>
        <p>Total Expected Earnings</p>
        <strong data-testid="total-earnings">{{ formatCurrency(totalEarnings) }}</strong>
        <span>Interest and fees</span>
      </div>
    </article>

    <article class="summary-card">
      <span class="summary-icon summary-icon--violet" aria-hidden="true">#</span>
      <div>
        <p>Total Transactions</p>
        <strong data-testid="total-transactions">{{ totalTransactions }}</strong>
        <span>Active and redeemed</span>
      </div>
    </article>
  </section>
</template>
