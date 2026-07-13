<!-- src/v3/components/applications/ApplicationCard.vue -->
<template>
    <article :class="articleClass">
        <div class="application-card__body">
            <header class="application-card__header">
                <div class="application-card__topline">
                    <span class="application-card__number">#{{ application.id }}</span>
                    <span :class="['status-pill', statusPill.class]">
                        <i :class="statusPill.icon" aria-hidden="true"></i>
                        <span>{{ $t(application.status) }}</span>
                    </span>
                </div>

                <h3 class="application-card__title">
                    {{ $t('application', { name: applicationDisplayName }) }}
                </h3>
            </header>

            <div v-if="stageNotice" :class="['notice-box', stageNotice.boxClass]" role="status">
                <i :class="['pi pi-exclamation-triangle', stageNotice.iconClass]" aria-hidden="true"></i>
                <div :class="stageNotice.textClass">
                    <strong>{{ $t(stageNotice.title) }}</strong>
                    <p>{{ $t(stageNotice.message) }}</p>
                </div>
            </div>

            <div v-if="hasUnpaidInvoice" class="notice-box tw-border-amber-400 tw-bg-amber-50" role="status">
                <i class="pi pi-wallet tw-text-amber-600" aria-hidden="true"></i>
                <div class="tw-text-amber-900">
                    <strong>{{ $t('Payment required') }}</strong>
                    <p>{{ $t('An invoice has been issued for your application. Please complete payment to continue processing the application.') }}</p>
                </div>
            </div>

            <div v-else-if="hasExpiredInvoice" class="notice-box tw-border-red-400 tw-bg-red-50" role="status">
                <i class="pi pi-times-circle tw-text-red-600" aria-hidden="true"></i>
                <div class="tw-text-red-900">
                    <strong>{{ $t('Invoice expired') }}</strong>
                    <p>{{ $t('The invoice and payment link have expired. Please request a new invoice.') }}</p>
                </div>
            </div>

            <dl class="application-card__meta">
                <div v-if="formattedDate" class="application-card__meta-item">
                    <dt><i class="pi pi-calendar" aria-hidden="true"></i>{{ $t('Submitted') }}</dt>
                    <dd>{{ formattedDate }}</dd>
                </div>

                <div v-if="showInvoiceRow && !isDraftQuotation" class="application-card__meta-item">
                    <dt><i class="pi pi-receipt" aria-hidden="true"></i>{{ $t('Invoice') }}</dt>
                    <dd>
                        <RouterLink :to="{ name: 'quotation-view', params: { id: application.last_quotation.id } }">
                            {{ $t('View Invoice') }}
                        </RouterLink>
                    </dd>
                </div>
            </dl>

            <footer class="application-card__actions">
                <RouterLink
                    v-if="hasUnpaidInvoice && !isDraftQuotation"
                    :to="{ name : 'quotation-view' , params: { id : application.last_quotation.id }}"
                    target="_blank"
                    rel="noopener"
                    class="btn-action btn-payment"
                >
                    <i class="pi pi-credit-card" aria-hidden="true"></i>
                    {{ $t('Pay Now') }}
                </RouterLink>

                <Component
                    :is="viewLink.to ? 'RouterLink' : 'button'"
                    v-bind="viewLink.props"
                    class="btn-action btn-view"
                >
                    {{ t('View application') }}
                    <i :class="isRTL ? 'pi pi-arrow-left' : 'pi pi-arrow-right'" aria-hidden="true"></i>
                </Component>
            </footer>
        </div>
    </article>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
    resolveApplicationDisplayName,
    resolveConfiguredApplicationType
} from '@/v3/config/application-config.js'
import {
  isApplicantDraftStage,
  isApplicantRevisionStage
} from '@/v3/utils/applicationWorkflow.js'

const { t, locale } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const props = defineProps({
  application: { type: Object, required: true }
})

const applicationType = computed(() => {
    return resolveConfiguredApplicationType(props.application?.flow, props.application?.purpose)
})

const applicationDisplayName = computed(() => {
    const displayName = resolveApplicationDisplayName(props.application?.flow, props.application?.purpose)
    return t(displayName || props.application?.flow || props.application?.purpose || '')
})

const formattedDate = computed(() => {
    const raw = props.application?.submitted_at || props.application?.created_at
    if (!raw) return ''
    const date = new Date(raw)
    if (isNaN(date.getTime())) return String(raw)
    try {
        return new Intl.DateTimeFormat(locale.value === 'ar' ? 'ar-SA' : 'en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Riyadh',
        }).format(date)
    } catch {
        return String(raw)
    }
})
 

/** Applicant action alert (from STAGE only) */
const stageNotice = computed(() => {
  const stage = props.application?.stage

  if (isApplicantRevisionStage(stage)) {
    return {
      title: 'Action required',
      message: 'Your application has been returned and can be edited. Please review the application information before resubmitting it.',
      boxClass: 'tw-border-orange-400 tw-bg-orange-50',
      iconClass: 'tw-text-orange-600',
      textClass: 'tw-text-orange-900'
    }
  }

  if (isApplicantDraftStage(stage)) {
    return {
      title: 'Action required',
      message: 'Your application has not been submitted yet. The federation will not review it until you submit the application.',
      boxClass: 'tw-border-amber-400 tw-bg-amber-50',
      iconClass: 'tw-text-amber-600',
      textClass: 'tw-text-amber-900'
    }
  }

  return null
})

const isProDiverApp = computed(() => {
    const app = props.application || {}
    const p = (app.purpose || '').toLowerCase()
    
    // Check target if it exists
    if (app.target === 'Professional Divers') return true
    
    // Check known purposes
    const targets = [
        'professional diver',
        'professional_diver',
        'diver license',
        'diver_license'
    ]
    return targets.some(t => p.includes(t))
})

/** Invoice helpers */
const q = computed(() => props.application?.last_quotation || null)
const qStatus = computed(() => (q.value?.status || '').toLowerCase())
const paymentUrl = computed(() => q.value?.payment_url || '')

// New computed property to check if quotation is draft
const isDraftQuotation = computed(() => qStatus.value === 'draft')

const hasUnpaidInvoice = computed(() => {
  if (!q.value) return false
  
  // Exclude draft quotations from unpaid invoice logic
  if(q.value.status == 'Draft' ) return false
  
  // Exclude if application is completed or approved
  const appStatus = (props.application?.status || '').toLowerCase()
  if (['completed', 'approved', 'license issued'].some(s => appStatus.includes(s))) return false;

  // Exclude if quotation is paid
  if (q.value.paid_at || qStatus.value === 'paid' || qStatus.value === 'completed') return false;

  const open = ['invoice created', 'confirmed', '']
  return open.some(s => qStatus.value.includes(s)) && !q.value.paid_at && !!paymentUrl.value
})
const hasExpiredInvoice = computed(() => {
  if (!q.value) return false
  return qStatus.value.includes('invoice expired') && !q.value.paid_at
})
const showInvoiceRow = computed(() => !!q.value && !!q.value.id)

/** Any user-action flag (affects card border): applicant action OR unpaid invoice */
const needsUserAction = computed(() => !!stageNotice.value || hasUnpaidInvoice.value)

/** Card border styling */
const articleClass = computed(() => [
  'application-card tw-group tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200',
  'tw-transition-all tw-duration-300 tw-ease-out',
  'hover:tw-shadow-[0_12px_34px_rgba(15,45,76,0.09)] hover:-tw-translate-y-[2px] hover:tw-border-slate-300',
  needsUserAction.value ? 'application-card--attention' : ''
])

/** Progress pill (STATUS only) */
const statusPill = computed(() => {
  const s = (props.application?.status || '').toLowerCase()

  // Payment-related statuses — use warning color to nudge
  if (['invoice issued', 'invoice created', 'confirmed'].some(k => s.includes(k))) {
    return { class: 'tw-text-amber-700 tw-bg-amber-100/50 tw-border-amber-200', icon: 'pi pi-wallet' }
  }
  if (['approved', 'completed', 'paid', 'license issued', 'eligible', 'data reviewed'].some(k => s.includes(k))) {
    return { class: 'tw-text-emerald-700 tw-bg-emerald-100/50 tw-border-emerald-200', icon: 'pi pi-check-circle' }
  }
  if (['draft', 'incomplete', 'in progress', 'new', 'submitted', 'resubmitted'].some(k => s.includes(k))) {
    return { class: 'tw-text-sky-700 tw-bg-sky-100/50 tw-border-sky-200', icon: 'pi pi-clock' }
  }
  if (['returned to applicant', 'returned', 'rejected', 'cancelled', 'canceled', 'invoice expired', 'expired']
    .some(k => s.includes(k))) {
    return { class: 'tw-text-red-700 tw-bg-red-100/50 tw-border-red-200', icon: 'pi pi-exclamation-triangle' }
  }
  return { class: 'tw-text-slate-700 tw-bg-slate-100/50 tw-border-slate-200', icon: 'pi pi-info-circle' }
})

/** View Link Logic */
const viewLink = computed(() => {
    const app = props.application
    
    if (app.purpose == 'sport-fishing-competition-team-registration') {
        return {
            to: true,
            props: {
                to: { name: 'app-summary', params: { appId: app.id, locale: locale.value } }
            }
        }
    }
    
    if (app.target === 'Athletes' || isProDiverApp.value) {
        return {
            to: true,
            props: {
                to: { name: 'app-summary', params: { appId: app.id, locale: locale.value } }
            }
        }
    }
    
    return {
        to: true,
        props: {
            to: { name: 'application-home', params: { id: app.id } }
        }
    }
})
</script>

<style scoped>
.application-card {
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.application-card--attention {
    border-color: #fdba74;
    box-shadow: inset 0 3px 0 #f97316;
}

.application-card__body {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    height: 100%;
    padding: 1.35rem;
}

.application-card__header {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.application-card__topline {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
}

.application-card__number {
    display: block;
    color: #94a3b8;
    font-size: 0.75rem;
    font-weight: 700;
    direction: ltr;
    unicode-bidi: isolate;
}

:dir(rtl) .application-card__number {
    text-align: right;
}

:dir(ltr) .application-card__number {
    text-align: left;
}

.application-card__title {
    margin: 0;
    color: #172033;
    font-size: 1.125rem;
    font-weight: 800;
    line-height: 1.55;
}

.status-pill {
    @apply tw-inline-flex tw-items-center tw-gap-1.5 tw-rounded-full tw-px-2.5 tw-py-1 tw-border tw-font-bold tw-text-xs tw-whitespace-nowrap;
}

.notice-box {
    @apply tw-flex tw-items-start tw-gap-3 tw-p-3 tw-rounded-xl tw-border-l-[3px];
}

.notice-box strong {
    display: block;
    margin-bottom: 0.2rem;
}

.notice-box p {
    margin: 0;
    font-size: 0.75rem;
    line-height: 1.6;
    opacity: 0.82;
}

.application-card__meta {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
    margin: 0;
    padding: 0.85rem 1rem;
    border-radius: 0.875rem;
    background: #f8fafc;
}

.application-card__meta-item dt {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin-bottom: 0.3rem;
    color: #94a3b8;
    font-size: 0.6875rem;
    font-weight: 700;
}

.application-card__meta-item dd {
    margin: 0;
    color: #334155;
    font-size: 0.8125rem;
    font-weight: 650;
    line-height: 1.5;
}

.application-card__meta-item a {
    color: #0369a1;
    text-decoration: none;
}

.application-card__meta-item a:hover {
    text-decoration: underline;
}

.application-card__actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.65rem;
    margin-top: auto;
}

.btn-action {
    @apply tw-inline-flex tw-items-center tw-justify-center tw-gap-2 tw-rounded-xl tw-px-4 tw-py-2.5 tw-text-sm tw-font-bold tw-transition-all tw-duration-200 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2;
}

.btn-payment {
    @apply tw-bg-emerald-600 tw-text-white hover:tw-bg-emerald-700 hover:tw-shadow-md hover:tw-shadow-emerald-600/20 focus:tw-ring-emerald-500;
}

.btn-view {
    @apply tw-bg-primary tw-text-white hover:tw-bg-primary-600 hover:tw-shadow-md focus:tw-ring-primary-300;
}

@media (max-width: 639px) {
    .application-card__meta {
        grid-template-columns: 1fr;
    }
}
</style>
