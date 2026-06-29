<script setup lang="ts">
import type { LoanCalculation, LoanSettings, PawnForm } from '../types/pawn'
import { calculatePercentageAmount, formatCurrency } from '../utils/calculations'

defineProps<{
  form: PawnForm
  settings: LoanSettings
  calculation: LoanCalculation
  overdueDays: number
}>()

function isVehicleCategory(form: PawnForm): boolean {
  return form.itemCategory === 'Vehicle' || form.itemCategory === 'Vehicle Lending'
}

function percentageAmount(form: PawnForm, rate: number): string {
  return formatCurrency(calculatePercentageAmount(form.loanAmount, rate))
}
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
        <dd>{{ settings.monthlyInterestRate || 0 }}%</dd>
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
        <dt>Service Charge</dt>
        <dd>{{ settings.serviceChargeRate || 0 }}% · {{ percentageAmount(form, settings.serviceChargeRate) }}</dd>
      </div>
      <div v-if="isVehicleCategory(form)">
        <dt>Storage Fee</dt>
        <dd data-testid="preview-storage-fee">
          {{ settings.vehicleStorageRate || 0 }}% ·
          {{ percentageAmount(form, settings.vehicleStorageRate) }}
        </dd>
      </div>
      <div>
        <dt>Penalty</dt>
        <dd>
          {{ settings.dailyPenaltyRate || 0 }}%/day ·
          {{ percentageAmount(form, settings.dailyPenaltyRate) }}/day × {{ overdueDays }} days
        </dd>
      </div>
    </dl>

    <div class="preview-total">
      <span>Total Payable by Client</span>
      <strong data-testid="preview-payable">{{ formatCurrency(calculation.totalPayable) }}</strong>
    </div>

    <div class="earning-callout">
      <div>
        <span>Expected Pawnshop Earning</span>
        <small>Interest + service charge + storage fee + penalty</small>
      </div>
      <strong data-testid="preview-earning">{{ formatCurrency(calculation.expectedEarning) }}</strong>
    </div>

    <p class="preview-note">This estimate updates automatically as loan details change.</p>
  </aside>
</template>
