<!-- InvoiceViewSimple.vue -->
<template>
  <div v-if="loading" class="sheet">
    <div class="bar"></div>
    <div class="wrap"><p class="muted">{{$t('Loading invoice…')}}</p></div>
  </div>

  <div v-else-if="invoice" class="sheet" :dir="dir" :lang="langAttr">
    <div class="bar"></div>
    <div class="wrap">
      <!-- Header -->
      
      <!-- Header meta: show only when paid -->
      <header class="head">
        <div class="brand">
          <img class="logo" src="/swsdf-color-symbol.png" alt="logo" />
          <img class="wordmark" src="/swsdf-color-name.png" alt="swsdf" />
        </div>
        <div class="meta" v-if="isPaid">
          <div class="meta-row">
            <span class="meta-label">{{$t('Invoice No.')}}</span>
            <span class="mono">{{ invoice.number || '—' }}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">{{$t('Invoice Date/Time')}}</span>
            <span class="mono" dir="ltr">{{  invoice.paid_at || '_'   }}</span>
          </div>
        </div>
      </header>

      <!-- Badge -->
      <div class="center">
        <span 
          v-if="isPaid"
          class="badge">{{ hasClientVatTin ? $t('Tax Invoice') : $t('Simplified Tax Invoice') }}</span>
 
        <span
          v-else
          > {{ $t('Unpaid Invoice')}}</span>
      </div>

      <!-- Parties -->
<!-- Parties: titles changed to Biller / Beneficiary -->
<div class="grid">
  <section class="card">
    <h3 class="card-title">{{$t('Biller')}}</h3>
    <div class="kv"><div class="kv-val">{{ issuerName }}</div></div>
    <div class="kv"><div class="kv-val">{{ locale  === 'ar' ?    SWSDF_ADDRESS_AR : SWSDF_ADDRESS_EN  }}
</div></div>
    <div class="kv">
      <div class="kv-key">{{$t('VAT No.')}}</div>
      <div class="kv-val mono">{{ issuerVat }}</div>
    </div>
  </section>

  <section class="card">
    <h3 class="card-title">{{$t('Beneficiary')}}</h3>
    <div class="kv"><div class="kv-val">{{ invoice.customer?.name || '—' }}</div></div>
    <template v-if="hasClientVatTin">
      <div class="kv"><div class="kv-key">{{$t('VAT Registration Number')}}</div><div class="kv-val">{{ invoice.vat_tin|| '—' }}</div></div>
      <div class="kv"><div class="kv-key">{{$t('Unified Number')}}</div><div class="kv-val">{{ invoice.unified_number || '—' }}</div></div>
    </template>
    <template v-else>
      <div class="kv"><div class="kv-key">{{$t('Mobile')}}</div><div class="kv-val">{{ invoice.client_mobile || '—' }}</div></div>
      <div class="kv"><div class="kv-key">{{$t('Email')}}</div><div class="kv-val">{{ invoice.client_email || '—' }}</div></div>
    </template>

    <div class="kv"><div class="kv-key">{{$t('Address')}}</div><div class="kv-val">{{ invoice.address || '—' }}</div></div>

  </section>
</div>


      <!-- Lines -->
      <h2 class="section-title">{{$t('Service Details')}}</h2>
      <div class="table-card">
        <table class="tbl">
          <thead>
            <tr>
              <th>{{$t('Description')}}</th>
              <th>{{$t('Qty')}}</th>
              <th>{{$t('Unit Price (SAR)')}}</th>
              <th>{{$t('VAT Amount')}}</th>
              <th>{{$t('Total')}}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(l, i) in invoice.lines" :key="i">
              <td>{{ $t (l.description) }}</td>
              <td class="mono">{{ l.qty }}</td>
              <td class="mono">{{ money(l.unit_price) }}</td>
              <td class="mono">{{ money(l.vat_amount) }}</td>
              <td class="mono">{{ money(l.total) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4" class="tae"><strong>{{$t('Total (Excl. VAT)')}}</strong></td>
              <td class="mono">{{ money(invoice.totals.excl_vat) }}</td>
            </tr>
            <tr>
              <td colspan="4" class="tae"><strong>{{$t('VAT Total')}} ({{Number(invoice.vat_rate)}}%)</strong></td>
              <td class="mono">{{ money(invoice.totals.vat) }}</td>
            </tr>
            <tr class="totals">
              <td colspan="4" class="tae"><strong>{{$t('Grand Total (Incl. VAT)')}}</strong></td>
              <td class="mono">{{ money(invoice.totals.incl_vat) }}</td>
            </tr>
          </tfoot>
        </table>
      </div>

 
    </div>
  </div>

  <div v-else class="sheet">
    <div class="bar"></div>
    <div class="wrap"><p class="muted">{{$t('Not found')}}</p></div>
  </div>
</template>

<script setup>
// Minimal, dependency-free, JS-only
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { apiGet } from '@/v3/services/httpClient.js'

const { locale } = useI18n()
const route = useRoute()

const loading = ref(true)
const invoice = ref(null)

const VITE_INVOICES_REVIEW = import.meta.env.VITE_INVOICES_REVIEW
const VAT_REG_NUMBER = import.meta.env.VITE_VAT_REG_NUMBER || '—'
const SWSDF_ADDRESS_AR = import.meta.env.VITE_SWSDF_ADDRESS_AR
const SWSDF_ADDRESS_EN = import.meta.env.VITE_SWSDF_ADDRESS_EN



// Locale/dir (simple)
const langAttr = computed(() => (route.params.locale === 'ar' ? 'ar' : 'en'))
const dir = computed(() => (langAttr.value === 'ar' ? 'rtl' : 'ltr'))
locale.value = langAttr.value

// Fetch + normalize
onMounted(async () => {
  try {
    const id = route.params.id
    if (!id || !VITE_INVOICES_REVIEW) throw new Error('Missing id or endpoint')
    const raw = await apiGet(`${VITE_INVOICES_REVIEW}${id}`)
    invoice.value = normalizeInvoice(raw?.quotation || raw)
  } catch {
    invoice.value = null
  } finally {
    loading.value = false
  }
})

const isPaid = computed(() => (invoice.value?.status || '').toLowerCase() === 'paid')
const hasClientVatTin = computed(() => {
  const vatTin = invoice.value?.vat_tin
  return typeof vatTin === 'string' ? vatTin.trim().length > 0 : Boolean(vatTin)
})

// Static issuer (strings kept in code to avoid extra i18n keys)
const issuerName = computed(() =>
  langAttr.value === 'ar'
    ? 'الاتحاد السعودي للرياضات البحرية والغوص'
    : 'Saudi Water Sports and Diving Federation'
)
 
const issuerVat = computed(() => VAT_REG_NUMBER)

// Helpers
function normalizeInvoice(src) {
  if (!src || typeof src !== 'object') return null
  const items = Array.isArray(src.items) ? src.items : []

  // Totals
  const vat = num(src.vat, 0)
  const incl = num(src.net_amount ?? src.total, 0)
  const excl = Math.max(0, incl - vat)

  return {
    number: src.invoice_id ?? src.payment_reference ?? null,
    status: src.status ?? '',
    paid_at: src.paid_at ?? null,
    customer_name: src.client_name ?? '—',
    client_mobile: src.client_mobile ?? '—',
    client_email: src.client_email ?? '—',
    vat_tin: src.client_vat_tin ?? null,
    unified_number : src.client_unified_number ?? null ,
    address: src.client_address ?? null,
    issued_at: src.created_at ?? null,
    created_at: src.created_at ?? null,
    customer: {
      name: src.customer?.name ?? src.client_name ?? '—',
      mobile: src.customer?.mobile ?? src.client_mobile ?? '—',
      email: src.customer?.email ?? src.client_email ?? '—',
    },
    lines: items.map(i => ({
      description: i.description ?? 'Service',
      qty: num(i.qty, 1),
      unit_price: num(i.price, 0),
      vat_amount: num(i.vat_minor, 0), // keep if present, else 0
      total: num(i.total_minor, (num(i.price, 0)+ num(i.vat_minor, 0)) * num(i.qty, 1)),
    })),
    totals: { excl_vat: excl, vat, incl_vat: incl },
    vat_rate : src.vat_rate, 
    payment: { link: src.payment_url || '' },
    qr: { data_url: src.qr_code_data_url || '' },
  }
}

function num(v, fallback = 0) {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

function money(n) {
  const x = Number(n)
  return Number.isFinite(x) ? x.toFixed(2) : '0.00'
}

 
</script>

<style>
:root{
  --brand:#0a5ea8; --brand2:#00a7b3;
  --ink:#0f172a; --muted:#64748b;
  --line:#e5e7eb; --bg:#f8fafc; --card:#ffffff;
  --shadow: 0 6px 20px rgba(2,24,43,.06);
}

*{box-sizing:border-box}
html,body{margin:0;padding:0;background:var(--bg);color:var(--ink);font-family:Arial,"Segoe UI",Tahoma,sans-serif}

.sheet{max-width:900px;margin:24px auto;background:var(--card);border-radius:14px;overflow:hidden;box-shadow:var(--shadow)}
.bar{height:6px;background:linear-gradient(90deg,var(--brand),var(--brand2))}
.wrap{padding:24px}

.head{display:flex;align-items:center;justify-content:space-between;gap:16px}
.brand{display:flex;align-items:center;gap:12px}
.logo{width:72px}
.wordmark{width:220px}

.meta{font-size:13px;display:flex;flex-direction:column;gap:6px;align-items:flex-end}
.meta-row{display:flex;gap:8px;align-items:center;background:#f6fbfd;padding:6px 10px;border-radius:10px}
.meta-label{color:var(--muted);font-weight:600}

.center{display:flex;justify-content:center;margin-top:10px}
.badge{display:inline-block;padding:8px 14px;color:#fff;background:linear-gradient(90deg,var(--brand),var(--brand2));border-radius:999px;font-weight:700;font-size:12px}

.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px}
.card{background:var(--card);border-radius:12px;padding:14px 16px;box-shadow:var(--shadow)}
.card-title{margin:0 0 10px 0;font-size:14px;color:var(--muted);font-weight:700}

.kv{display:flex;gap:10px;padding:8px 0;border-bottom:1px dashed var(--line)}
.kv:last-child{border-bottom:none}
.kv-key{color:var(--muted);font-weight:600}
.kv-val{flex:1}
.mono{font-family:ui-monospace,Menlo,Consolas,monospace}

.section-title{margin:22px 0 10px;font-size:16px}

.table-card{background:var(--card);border-radius:12px;padding:8px;box-shadow:var(--shadow)}
.tbl{width:100%;border-collapse:collapse}
.tbl th,.tbl td{border:1px solid var(--line);padding:10px;font-size:13px}
.tbl th{background:#f1f5f9;text-align:center}
.tbl td{vertical-align:top}
.tae{text-align:right}
.tbl tfoot tr.totals td{font-weight:700;background:#eef2f7}

.qr{width:140px;height:140px;display:block;margin:auto;border-radius:12px;background:#fff}
.pill{display:inline-block;padding:4px 10px;border-radius:999px;background:#f6fbfd;font-size:12px;font-weight:600;margin-inline-end:8px}
.muted{color:var(--muted);font-size:12px;line-height:1.7}
.small{font-size:11px}

@media (max-width:720px){
  .grid{grid-template-columns:1fr}
  .meta{align-items:flex-start}
}

/* Print */
@media print {
  @page { size:A4 portrait; margin:5mm 8mm; }
  body{ margin:0!important; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  .sheet{ width:100%!important; min-width:720px!important; max-width:100%!important; margin:0 auto!important; box-shadow:none!important; border-radius:0!important; }
  .card,.table-card{ box-shadow:none!important }
}
</style>
