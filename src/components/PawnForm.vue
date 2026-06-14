<script setup lang="ts">
import { reactive } from 'vue'
import type { ItemCategory, LoanTerm, PawnForm } from '../types/pawn'

const form = defineModel<PawnForm>({ required: true })

const emit = defineEmits<{
  submit: []
}>()

type FormField = keyof PawnForm
type FormErrors = Partial<Record<FormField, string>>

const errors = reactive<FormErrors>({})

const categories: ItemCategory[] = ['Jewelry', 'Gadget', 'Appliance', 'Vehicle', 'Other']
const terms: Array<{ value: LoanTerm; label: string }> = [
  { value: 15, label: '15 days' },
  { value: 30, label: '30 days' },
  { value: 60, label: '60 days' },
  { value: 90, label: '90 days' },
]

function clearError(field: FormField) {
  delete errors[field]
}

function validate(): boolean {
  Object.keys(errors).forEach((key) => delete errors[key as FormField])

  const requiredTextFields: Array<{ field: FormField; label: string }> = [
    { field: 'clientName', label: 'Client name' },
    { field: 'contactNumber', label: 'Contact number' },
    { field: 'itemName', label: 'Item name' },
    { field: 'itemDescription', label: 'Item description' },
    { field: 'pawnDate', label: 'Pawn date' },
  ]

  requiredTextFields.forEach(({ field, label }) => {
    if (!String(form.value[field]).trim()) {
      errors[field] = `${label} is required.`
    }
  })

  if (form.value.appraisedValue <= 0) {
    errors.appraisedValue = 'Appraised value must be greater than 0.'
  }

  if (form.value.loanAmount <= 0) {
    errors.loanAmount = 'Loan amount must be greater than 0.'
  } else if (form.value.loanAmount > form.value.appraisedValue) {
    errors.loanAmount = 'Loan amount cannot exceed the appraised value.'
  }

  if (form.value.interestRate <= 0) {
    errors.interestRate = 'Interest rate must be greater than 0.'
  }

  if (form.value.serviceFee < 0) {
    errors.serviceFee = 'Service fee cannot be negative.'
  }

  if (form.value.penaltyFee < 0) {
    errors.penaltyFee = 'Penalty fee cannot be negative.'
  }

  return Object.keys(errors).length === 0
}

function handleSubmit() {
  if (validate()) {
    emit('submit')
  }
}
</script>

<template>
  <form class="panel form-panel" novalidate @submit.prevent="handleSubmit">
    <div class="panel-heading">
      <div>
        <p class="eyebrow">New record</p>
        <h2>Pawn Item Details</h2>
      </div>
      <span class="required-note"><b>*</b> Required fields</span>
    </div>

    <div v-if="Object.keys(errors).length" class="error-banner" role="alert">
      Please review the highlighted fields before adding this transaction.
    </div>

    <fieldset>
      <legend>Client information</legend>
      <div class="form-grid">
        <div class="field">
          <label for="client-name">Client Name <b>*</b></label>
          <input
            id="client-name"
            v-model.trim="form.clientName"
            type="text"
            placeholder="e.g. Juan Dela Cruz"
            :aria-invalid="Boolean(errors.clientName)"
            @input="clearError('clientName')"
          />
          <small v-if="errors.clientName" class="field-error">{{ errors.clientName }}</small>
        </div>

        <div class="field">
          <label for="contact-number">Contact Number <b>*</b></label>
          <input
            id="contact-number"
            v-model.trim="form.contactNumber"
            type="tel"
            placeholder="e.g. 0917 123 4567"
            :aria-invalid="Boolean(errors.contactNumber)"
            @input="clearError('contactNumber')"
          />
          <small v-if="errors.contactNumber" class="field-error">{{ errors.contactNumber }}</small>
        </div>
      </div>
    </fieldset>

    <fieldset>
      <legend>Item information</legend>
      <div class="form-grid">
        <div class="field">
          <label for="item-name">Item Name <b>*</b></label>
          <input
            id="item-name"
            v-model.trim="form.itemName"
            type="text"
            placeholder="e.g. 18K Gold Necklace"
            :aria-invalid="Boolean(errors.itemName)"
            @input="clearError('itemName')"
          />
          <small v-if="errors.itemName" class="field-error">{{ errors.itemName }}</small>
        </div>

        <div class="field">
          <label for="item-category">Item Category <b>*</b></label>
          <select id="item-category" v-model="form.itemCategory">
            <option v-for="category in categories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>

        <div class="field field--full">
          <label for="item-description">Item Description <b>*</b></label>
          <textarea
            id="item-description"
            v-model.trim="form.itemDescription"
            rows="3"
            placeholder="Describe condition, specifications, weight, or identifying details."
            :aria-invalid="Boolean(errors.itemDescription)"
            @input="clearError('itemDescription')"
          ></textarea>
          <small v-if="errors.itemDescription" class="field-error">
            {{ errors.itemDescription }}
          </small>
        </div>
      </div>
    </fieldset>

    <fieldset>
      <legend>Loan details</legend>
      <div class="form-grid form-grid--three">
        <div class="field">
          <label for="appraised-value">Appraised Value <b>*</b></label>
          <div class="money-input">
            <span>₱</span>
            <input
              id="appraised-value"
              v-model.number="form.appraisedValue"
              type="number"
              min="0"
              step="100"
              :aria-invalid="Boolean(errors.appraisedValue)"
              @input="clearError('appraisedValue')"
            />
          </div>
          <small v-if="errors.appraisedValue" class="field-error">
            {{ errors.appraisedValue }}
          </small>
        </div>

        <div class="field">
          <label for="loan-amount">Loan Amount <b>*</b></label>
          <div class="money-input">
            <span>₱</span>
            <input
              id="loan-amount"
              v-model.number="form.loanAmount"
              type="number"
              min="0"
              step="100"
              :aria-invalid="Boolean(errors.loanAmount)"
              @input="clearError('loanAmount')"
            />
          </div>
          <small v-if="errors.loanAmount" class="field-error">{{ errors.loanAmount }}</small>
        </div>

        <div class="field">
          <label for="interest-rate">Interest Rate <b>*</b></label>
          <div class="suffix-input">
            <input
              id="interest-rate"
              v-model.number="form.interestRate"
              type="number"
              min="0"
              step="0.1"
              :aria-invalid="Boolean(errors.interestRate)"
              @input="clearError('interestRate')"
            />
            <span>%</span>
          </div>
          <small v-if="errors.interestRate" class="field-error">
            {{ errors.interestRate }}
          </small>
        </div>

        <div class="field">
          <label for="loan-term">Loan Term <b>*</b></label>
          <select id="loan-term" v-model="form.loanTerm">
            <option v-for="term in terms" :key="term.value" :value="term.value">
              {{ term.label }}
            </option>
          </select>
        </div>

        <div class="field">
          <label for="service-fee">Service Fee <b>*</b></label>
          <div class="money-input">
            <span>₱</span>
            <input
              id="service-fee"
              v-model.number="form.serviceFee"
              type="number"
              min="0"
              step="50"
              :aria-invalid="Boolean(errors.serviceFee)"
              @input="clearError('serviceFee')"
            />
          </div>
          <small v-if="errors.serviceFee" class="field-error">{{ errors.serviceFee }}</small>
        </div>

        <div class="field">
          <label for="penalty-fee">Penalty Fee <span>(Optional)</span></label>
          <div class="money-input">
            <span>₱</span>
            <input
              id="penalty-fee"
              v-model.number="form.penaltyFee"
              type="number"
              min="0"
              step="50"
              :aria-invalid="Boolean(errors.penaltyFee)"
              @input="clearError('penaltyFee')"
            />
          </div>
          <small v-if="errors.penaltyFee" class="field-error">{{ errors.penaltyFee }}</small>
        </div>

        <div class="field">
          <label for="pawn-date">Pawn Date <b>*</b></label>
          <input
            id="pawn-date"
            v-model="form.pawnDate"
            type="date"
            :aria-invalid="Boolean(errors.pawnDate)"
            @input="clearError('pawnDate')"
          />
          <small v-if="errors.pawnDate" class="field-error">{{ errors.pawnDate }}</small>
        </div>
      </div>
    </fieldset>

    <button class="primary-button" type="submit" data-testid="add-transaction">
      <span aria-hidden="true">+</span>
      Add Transaction
    </button>
  </form>
</template>
