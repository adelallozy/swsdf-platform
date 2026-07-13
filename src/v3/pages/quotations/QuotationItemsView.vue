<template>
    <!-- Loading -->
    <div v-if="loading" class="tw-flex tw-justify-center tw-items-center tw-py-16">
        <ProgressSpinner strokeWidth="4" />
    </div>

    <!-- Body -->
    <div v-else-if="q" class="tw-space-y-6">

    <!-- Meta (very compact) -->
    <div class="tw-flex tw-flex-wrap tw-gap-3 tw-items-center">
        <span class="tw-text-sm tw-text-muted">{{ t('Quotation') }} #{{ q.id }}</span>
        <span class="tw-text-xs tw-px-2 tw-py-1 tw-rounded-full tw-border tw-border-divider">
        {{ (q.status || '').toUpperCase() }}
        </span>
        <span class="tw-text-sm tw-text-muted">• {{ t('Client') }}: {{ q.client_name }}</span>
    </div>

    <!-- Items -->
    <div class="tw-overflow-x-auto tw-rounded-xl tw-border tw-border-divider">
        <table class="tw-w-full tw-text-sm">
        <thead class="tw-bg-muted/40">
            <tr>
            <th class="tw-text-left tw-px-4 tw-py-3">{{ t('Description') }}</th>
            <th class="tw-text-right tw-px-4 tw-py-3">{{ t('Qty') }}</th>
            <th class="tw-text-right tw-px-4 tw-py-3">{{ t('Unit price') }}</th>
            <th class="tw-text-right tw-px-4 tw-py-3">{{ t('VAT') }}</th>
            <th class="tw-text-right tw-px-4 tw-py-3">{{ t('Line total') }}</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(it, i) in (q.items || [])" :key="i" class="tw-border-t tw-border-divider">
            <td class="tw-px-4 tw-py-3 tw-align-top">
                <div  v-if="it.description" class="tw-font-medium">{{  $t( it.description) }}</div>
            </td>
            <td class="tw-px-4 tw-py-3 tw-text-right tw-whitespace-nowrap">{{ it.qty }}</td>
            <td class="tw-px-4 tw-py-3 tw-text-right tw-whitespace-nowrap">
                {{ formatMoney(it.price, q.currency) }}
            </td>
            <td class="tw-px-4 tw-py-3 tw-text-right tw-whitespace-nowrap">
                <!-- prefer total VAT minor if present; else derive -->
                {{ formatMinor(it.vat_minor ?? (Number(it.total_minor ?? 0) - Number(it.subtotal_minor ?? 0))) }}
            </td>
            <td class="tw-px-4 tw-py-3 tw-text-right tw-whitespace-nowrap">
                {{ formatMinor(it.total_minor) }}
            </td>
            </tr>
        </tbody>
        </table>
    </div>

    <!-- Totals (compact) -->
    <div class="tw-flex tw-flex-col tw-items-end tw-gap-1">
        <div class="tw-text-sm">
        <span class="tw-text-muted">{{ t('Subtotal') }}: </span> 
        <span class="tw-ml-2 tw-font-medium">{{ formatMoney(q.total, q.currency) }}</span>
        </div>
        <div class="tw-text-sm">
        <span class="tw-text-muted">{{ t('VAT') }} ({{ q.vat_rate }}%): </span> 
        <span class="tw-ml-2 tw-font-medium">{{ formatMoney(q.vat, q.currency) }}</span>
        </div>
        <div class="tw-text-base tw-font-bold">
        <span>{{ t('Total due') }}: </span> 
        <span class="tw-ml-2">{{ formatMoney(q.net_amount, q.currency) }}</span>
        </div>
    </div> 
    <!-- Actions -->
    <!-- Actions -->
<div class="tw-flex tw-gap-3 tw-justify-end">
    <!-- Paid: invoice link -->
    <RouterLink
    v-if="isPaid"
    :to="{ name: 'invoice-view', params: { 
        id: q.id,
        locale: locale
        } }" 
    class="pill-link bg-invoice hover:bg-invoice-hover active:bg-invoice-active focus-visible:tw-ring-emerald-400"
    >
    <i class="pi pi-file-invoice"></i>
    {{ t('View invoice') }}
    </RouterLink>

    <!-- Payable: payment link -->
    <a
    v-else-if="showPayButton"
    :href="q.payment_url"
    target="_blank"
    rel="noopener"
    class="pill-link bg-pay hover:bg-pay-hover active:bg-pay-active focus-visible:tw-ring-p-primary-400"
    >
    <i class="pi pi-credit-card"></i>
    {{ t('Pay now') }}
    </a>
</div>



    <!-- Note when draft -->
    <div v-if="isDraft" class="tw-text-sm tw-text-muted">
        {{ t('You application is under review and has not been approved yet') }}.
    </div>
    </div>

    <!-- Not found -->
    <div v-else class="tw-text-center tw-text-muted tw-py-16">
    {{ t('Quotation not found') }}
    </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import ProgressSpinner from 'primevue/progressspinner'
import { apiGet } from '@/v3/services/httpClient.js' 
const { t, locale }  = useI18n()
const route  = useRoute()
const router = useRouter()

const PICK_ENDPOINT = import.meta.env.VITE_QUOTATIONS_BYID            // e.g. "/admins-api/quotations/" 

const loading       = ref(true)
const q             = ref(null)
const isDraft       = ref(false)
const isPaid        = ref(false)
const showPayButton = ref(false)


function isPaidStatus(qq){ return Boolean(qq?.invoice_id || qq?.paid_at) }
function canPayStatus(qq){
  const st = String(qq?.status || '').toLowerCase()
  return (st === 'confirmed' || st === 'pending') && !!qq?.payment_url && !isPaidStatus(qq)
}
function isDraftStatus(qq){ return String(qq?.status || '').toLowerCase() === 'draft' }

function num(x){ const n = Number(x); return Number.isFinite(n) ? n : 0 }
function formatMoney(val, currency='SAR'){
  return new Intl.NumberFormat(undefined,{style:'currency',currency,maximumFractionDigits:2}).format(num(val))
}
function formatMinor(minor, currency='SAR'){ return formatMoney(minor, currency) }

async function load(){
  loading.value = true
  try{
    const id  = route.params.id || route.query.id
    const res = await apiGet(`${PICK_ENDPOINT}${id}`)
    q.value   = res?.quotation
    if (!q.value) return

    isPaid.value        = isPaidStatus(q.value)
    isDraft.value       = isDraftStatus(q.value)
    showPayButton.value = canPayStatus(q.value)
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>


  