<!-- VERSION: 1.1.0 -->
<!-- FILE: src/v3/components/applications/cards/ApplicationFeesCard.vue -->
<!-- Self-contained card that reads from centralized store -->

<template>
  <div v-if="quotation">
    <!-- Header -->
    <div class="tw-mb-2 tw-flex tw-items-center tw-gap-2">
      <i class="pi pi-file-invoice tw-text-primary" aria-hidden="true"></i>
      <span class="tw-font-bold tw-text-slate-700 tw-text-xl">
        {{ t('Application Fees') }}
      </span>
    </div>

    <!-- Loading State -->
    <div v-if="isLoadingKey('quotations')" class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-p-5">
      <div class="tw-flex tw-justify-center tw-py-8">
        <i class="pi pi-spinner tw-animate-spin tw-text-2xl tw-text-slate-400" aria-hidden="true"></i>
      </div>
    </div>

    <!-- Quotation Content -->
    <div v-else class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-p-5">
      
      <!-- Items Table -->
      <div class="tw-overflow-x-auto tw-rounded-xl tw-border tw-border-slate-200">
        <table class="tw-w-full tw-text-sm">
          <thead class="tw-bg-slate-50">
            <tr>
              <th class="tw-text-left tw-px-4 tw-py-3 tw-font-semibold">{{ t('Description') }}</th>
              <th class="tw-text-right tw-px-4 tw-py-3 tw-font-semibold">{{ t('Qty') }}</th>
              <th class="tw-text-right tw-px-4 tw-py-3 tw-font-semibold">{{ t('Unit price') }}</th>
              <th class="tw-text-right tw-px-4 tw-py-3 tw-font-semibold">{{ t('VAT') }}</th>
              <th class="tw-text-right tw-px-4 tw-py-3 tw-font-semibold">{{ t('Line total') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in quotation.items" :key="index" class="tw-border-t tw-border-slate-200">
              <td class="tw-px-4 tw-py-3 tw-align-top">
                <div v-if="item.description" class="tw-font-medium">{{ t(item.description) }}</div>
              </td>
              <td class="tw-px-4 tw-py-3 tw-text-right tw-whitespace-nowrap">{{ item.qty }}</td>
              <td class="tw-px-4 tw-py-3 tw-text-right tw-whitespace-nowrap">
                {{ formatMoney(item.price, quotation.currency) }}
              </td>
              <td class="tw-px-4 tw-py-3 tw-text-right tw-whitespace-nowrap">
                {{ formatMinor(item.vat_minor ?? (Number(item.total_minor ?? 0) - Number(item.subtotal_minor ?? 0))) }}
              </td>
              <td class="tw-px-4 tw-py-3 tw-text-right tw-whitespace-nowrap">
                {{ formatMinor(item.total_minor) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Totals Section -->
      <div class="tw-mt-6 tw-flex tw-flex-col tw-gap-1">
        <div class="tw-text-sm">
          <span class="tw-text-slate-500">{{ t('Subtotal') }}: </span> 
          <span class="tw-ml-2 tw-font-medium">{{ formatMoney(quotation.total, quotation.currency) }}</span>
        </div>
        <div class="tw-text-sm">
          <span class="tw-text-slate-500">{{ t('VAT') }} ({{ quotation.vat_rate }}%): </span> 
          <span class="tw-ml-2 tw-font-medium">{{ formatMoney(quotation.vat, quotation.currency) }}</span>
        </div>
        <div class="tw-text-base tw-font-bold">
          <span>{{ t('Total due') }}: </span> 
          <span class="tw-ml-2">{{ formatMoney(quotation.net_amount, quotation.currency) }}</span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="tw-mt-6 tw-flex tw-gap-3 tw-justify-end">
        <!-- View Invoice Button (Paid) -->
        <RouterLink
          v-if="isPaid"
          :to="{ name: 'invoice-view', params: {
            id: quotation.id,
            locale: locale
          } }"
          class="tw-inline-flex tw-items-center tw-gap-2 tw-px-6 tw-py-3 tw-text-base tw-font-medium tw-text-white tw-bg-emerald-600 hover:tw-bg-emerald-700 tw-rounded-lg tw-transition"
        >
          <i class="pi pi-file-invoice" aria-hidden="true"></i>
          {{ t('View invoice') }}
        </RouterLink>

        <!-- Pay Now Button (Payable) -->
        <a
          v-else-if="showPayButton"
          :href="quotation.payment_url"
          target="_blank"
          rel="noopener"
          class="pill-link tw-inline-flex tw-items-center tw-gap-2 tw-px-6 tw-py-3 tw-text-base tw-font-medium tw-bg-primary hover:tw-bg-primary-dark tw-rounded-lg tw-transition"
        >
          <i class="pi pi-credit-card" aria-hidden="true"></i>
          <span>{{ t('Pay now') }}</span>
        </a>
      </div>

      <!-- Draft Status Message -->
      <div v-if="isDraft" class="tw-mt-4 tw-text-sm tw-text-slate-500">
        {{ t('Your application is under review and has not been approved yet') }}.
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { RouterLink } from 'vue-router';
import { useApplicationStore } from '@/v3/composables/application/useApplicationStore.js';
import { useLoading } from '@/v3/composables/useLoading.js';

// ────────────────────────────────────────────────────────────────────────────
// NO PROPS - Everything from store
// ────────────────────────────────────────────────────────────────────────────

const { t, locale } = useI18n();
const { isLoadingKey } = useLoading();
const store = useApplicationStore();

// ────────────────────────────────────────────────────────────────────────────
// DATA FROM STORE
// ────────────────────────────────────────────────────────────────────────────

// Read first quotation from array (quotations is array in payload)
const quotation = computed(() => store.payload.quotations.value?.[0] || null);

// Status helpers
const isPaid = computed(() => {
  if (!quotation.value) return false;
  return Boolean(quotation.value?.invoice_id || quotation.value?.paid_at);
});

const canPayStatus = computed(() => {
  if (!quotation.value) return false;
  const status = String(quotation.value?.status || '').toLowerCase();
  return (status === 'confirmed' || status === 'pending') && !!quotation.value?.payment_url && !isPaid.value;
});

const isDraft = computed(() => {
  if (!quotation.value) return false;
  return String(quotation.value?.status || '').toLowerCase() === 'draft';
});

const showPayButton = computed(() => canPayStatus.value);

// ────────────────────────────────────────────────────────────────────────────
// FORMATTING FUNCTIONS
// ────────────────────────────────────────────────────────────────────────────

function num(x) {
  const n = Number(x);
  return Number.isFinite(n) ? n : 0;
}

function formatMoney(val, currency = 'SAR') {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2
  }).format(num(val));
}

function formatMinor(minor, currency = 'SAR') {
  return formatMoney(minor, currency);
}
</script>

<!--
VERSION: 1.1.0

CHANGES IN v1.1.0:
==================
- Added VAT column to table
- Added totals section (Subtotal, VAT, Total due)
- Added formatMoney and formatMinor functions for proper currency formatting
- Updated table headers to match QuotationItemsView
- Changed View Invoice route to 'invoice-view' with locale parameter
- Changed Pay button to use payment_url (external link)
- Added isDraft status check for draft message
- Improved styling to match QuotationItemsView

ARCHITECTURE NOTES:
=================
- NO PROPS - Everything from store
- Reads from: store.payload.quotations (array, use first item)
- This is a display-only card (no validation)
- No empty state needed (if no quotation, don't display anything)
- Table layout with Description, Qty, Unit price, VAT, Line total
- Totals section with Subtotal, VAT, Total due
- Status-based button visibility (Pay vs View)
- Links to invoice-view route

LOADING KEYS:
============
- quotations (managed by store via loadEntity)

BUTTON LOGIC:
============
- isPaid: Show "View invoice" if invoice_id or paid_at exists
- canPayStatus: Show "Pay now" if status is 'confirmed' or 'pending' AND payment_url exists AND not paid
- isDraft: Show draft message if status is 'draft'

USAGE:
=====
<ApplicationFeesCard />

No props needed! Component gets everything from store.

TRANSLATION KEYS NEEDED:
=======================
- Application Fees
- Description
- Qty
- Unit price
- VAT
- Line total
- Subtotal
- Total due
- View invoice
- Pay now
- Your application is under review and has not been approved yet
-->
