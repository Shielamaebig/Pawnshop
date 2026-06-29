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
  validateField('serviceChargeRate', 'Service charge rate')
  validateField('vehicleStorageRate', 'Vehicle storage rate')
  validateField('dailyPenaltyRate', 'Daily penalty rate')
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
        <label for="service-charge-rate">Service Charge Rate</label>
        <div class="suffix-input">
          <input
            id="service-charge-rate"
            v-model.number="settings.serviceChargeRate"
            type="number"
            min="0"
            step="0.1"
            :aria-invalid="Boolean(errors.serviceChargeRate)"
            @blur="validate"
            @input="clearError('serviceChargeRate')"
          />
          <span>%</span>
        </div>
        <small v-if="errors.serviceChargeRate" class="field-error">
          {{ errors.serviceChargeRate }}
        </small>
      </div>

      <div class="field">
        <label for="vehicle-storage-rate">Vehicle Storage Rate</label>
        <div class="suffix-input">
          <input
            id="vehicle-storage-rate"
            v-model.number="settings.vehicleStorageRate"
            type="number"
            min="0"
            step="0.1"
            :aria-invalid="Boolean(errors.vehicleStorageRate)"
            @blur="validate"
            @input="clearError('vehicleStorageRate')"
          />
          <span>%</span>
        </div>
        <small v-if="errors.vehicleStorageRate" class="field-error">
          {{ errors.vehicleStorageRate }}
        </small>
      </div>

      <div class="field">
        <label for="daily-penalty-rate">Daily Penalty Rate <span>(Per day)</span></label>
        <div class="suffix-input">
          <input
            id="daily-penalty-rate"
            v-model.number="settings.dailyPenaltyRate"
            type="number"
            min="0"
            step="0.1"
            :aria-invalid="Boolean(errors.dailyPenaltyRate)"
            @blur="validate"
            @input="clearError('dailyPenaltyRate')"
          />
          <span>%</span>
        </div>
        <small v-if="errors.dailyPenaltyRate" class="field-error">
          {{ errors.dailyPenaltyRate }}
        </small>
      </div>
    </div>
  </section>
</template>
