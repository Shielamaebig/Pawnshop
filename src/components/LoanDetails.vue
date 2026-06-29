<script setup lang="ts">
import { reactive } from 'vue'
import type { LoanSettings } from '../types/pawn'

const settings = defineModel<LoanSettings>({ required: true })

type SettingField = keyof LoanSettings
type SettingErrors = Partial<Record<SettingField, string>>

const errors = reactive<SettingErrors>({})

function clearError(field: SettingField) {
  delete errors[field]
}

function validateField(field: SettingField, label: string) {
  if (settings.value[field] < 0) {
    errors[field] = `${label} cannot be negative.`
  }
}

function validate() {
  Object.keys(errors).forEach((key) => delete errors[key as SettingField])
  validateField('monthlyInterestRate', 'Monthly interest rate')
  validateField('serviceCharge', 'Service charge')
  validateField('vehicleStorageFee', 'Vehicle storage fee')
  validateField('dailyPenaltyFee', 'Daily penalty fee')
}
</script>

<template>
  <section class="panel settings-panel" aria-labelledby="loan-settings-title">
    <div class="panel-heading">
      <div>
        <p class="eyebrow">Owner setup</p>
        <h2 id="loan-settings-title">Loan Details</h2>
      </div>
      <span class="record-count">Applies to new transactions</span>
    </div>

    <div class="settings-grid">
      <div class="field">
        <label for="monthly-interest-rate">Monthly Interest Rate</label>
        <div class="suffix-input">
          <input
            id="monthly-interest-rate"
            v-model.number="settings.monthlyInterestRate"
            type="number"
            min="0"
            step="0.1"
            :aria-invalid="Boolean(errors.monthlyInterestRate)"
            @blur="validate"
            @input="clearError('monthlyInterestRate')"
          />
          <span>%</span>
        </div>
        <small v-if="errors.monthlyInterestRate" class="field-error">
          {{ errors.monthlyInterestRate }}
        </small>
      </div>

      <div class="field">
        <label for="service-charge">Service Charge</label>
        <div class="money-input">
          <span>₱</span>
          <input
            id="service-charge"
            v-model.number="settings.serviceCharge"
            type="number"
            min="0"
            step="50"
            :aria-invalid="Boolean(errors.serviceCharge)"
            @blur="validate"
            @input="clearError('serviceCharge')"
          />
        </div>
        <small v-if="errors.serviceCharge" class="field-error">{{ errors.serviceCharge }}</small>
      </div>

      <div class="field">
        <label for="vehicle-storage-fee">Vehicle Storage Fee</label>
        <div class="money-input">
          <span>₱</span>
          <input
            id="vehicle-storage-fee"
            v-model.number="settings.vehicleStorageFee"
            type="number"
            min="0"
            step="50"
            :aria-invalid="Boolean(errors.vehicleStorageFee)"
            @blur="validate"
            @input="clearError('vehicleStorageFee')"
          />
        </div>
        <small v-if="errors.vehicleStorageFee" class="field-error">
          {{ errors.vehicleStorageFee }}
        </small>
      </div>

      <div class="field">
        <label for="daily-penalty-fee">Daily Penalty Fee</label>
        <div class="money-input">
          <span>₱</span>
          <input
            id="daily-penalty-fee"
            v-model.number="settings.dailyPenaltyFee"
            type="number"
            min="0"
            step="50"
            :aria-invalid="Boolean(errors.dailyPenaltyFee)"
            @blur="validate"
            @input="clearError('dailyPenaltyFee')"
          />
        </div>
        <small v-if="errors.dailyPenaltyFee" class="field-error">
          {{ errors.dailyPenaltyFee }}
        </small>
      </div>
    </div>
  </section>
</template>
