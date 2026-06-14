<script setup lang="ts">
import type { LoanCalculation, PawnForm } from '../types/pawn'
import { formatCurrency } from '../utils/calculations'

defineProps<{
  form: PawnForm
  calculation: LoanCalculation
}>()
</script>

<template>
  <aside class="panel preview-card" aria-labelledby="preview-title">
    <div class="panel-heading">
      <div>
        <p class="eyebrow">Live estimate</p>
        <h2 id="preview-title">Calculation Preview</h2>
      </div>
      <span class="live-badge"><i></i> Live</span>
    </div>

    <dl class="preview-list">
      <div>
        <dt>Loan Amount</dt>
        <dd>{{ formatCurrency(form.loanAmount) }}</dd>
      </div>
      <div>
        <dt>Monthly Interest Rate</dt>
        <dd>{{ form.interestRate || 0 }}%</dd>
      </div>
      <div>
        <dt>Loan Term</dt>
        <dd>{{ form.loanTerm }} days</dd>
      </div>
      <div class="preview-divider">
        <dt>Interest Amount</dt>
        <dd data-testid="preview-interest">{{ formatCurrency(calculation.interestAmount) }}</dd>
      </div>
      <div>
        <dt>Service Fee</dt>
        <dd>{{ formatCurrency(form.serviceFee) }}</dd>
      </div>
      <div>
        <dt>Penalty Fee</dt>
        <dd>{{ formatCurrency(form.penaltyFee) }}</dd>
      </div>
    </dl>

    <div class="preview-total">
      <span>Total Payable by Client</span>
      <strong data-testid="preview-payable">{{ formatCurrency(calculation.totalPayable) }}</strong>
    </div>

    <div class="earning-callout">
      <div>
        <span>Expected Pawnshop Earning</span>
        <small>Interest + service fee + penalty</small>
      </div>
      <strong data-testid="preview-earning">{{ formatCurrency(calculation.expectedEarning) }}</strong>
    </div>

    <p class="preview-note">This estimate updates automatically as loan details change.</p>
  </aside>
</template>
