// FILE: src/v3/components/applications/cards/ActionsTrackingCard.vue
// TOKEN: ACTIONS-CARD-v3.3-2025-10-27-rewrite

<!--
VERSION: 3.4.0 (Header outside, no outer card, participants-card style)
- PrimeVue Timeline with tuned spacing; no outer day header; no refresh button.
- Displays ONLY: Action, Time (HH:mm, en-GB), Date (YYYY-MM-DD via toYmd), Notes.
- Backend filters to user-related actions; component renders as-is.
- Highlights: Reject/Application Reject, Applicant Notice, Issue Fee Invoice, Return to Applicant.
- Full RTL support (timeline aligns right; timestamp block flips alignment).
-->

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Timeline from 'primevue/timeline';

import { useApplicationStore } from '@/v3/composables/application/useApplicationStore.js';
import { toYmd } from '@/v3/utils/dates.js';

// ────────────────────────────────────────────────────────────────────────────
// COMPOSABLES
// ────────────────────────────────────────────────────────────────────────────
const { t, locale } = useI18n();
const store = useApplicationStore();

// RTL helper
const isRtl = computed(() => locale.value === 'ar');

// ────────────────────────────────────────────────────────────────────────────
// CONSTANTS & HELPERS
// ────────────────────────────────────────────────────────────────────────────
const TZ = 'Asia/Riyadh';

// Important actions with strong visual accents
const IMPORTANT_ACTIONS = [
  'Reject',
  'Application Reject',
  'Applicant Notice',
  'Issue Fee Invoice',
  'Return to Applicant'
].map((s) => s.toLowerCase());

function isImportant(act) {
  const label = actionKey(act).toLowerCase();
  return IMPORTANT_ACTIONS.includes(label);
}

function actionKey(action) {
  return String(action?.action_key || '').trim();
}

function iconFor(label) {
  const key = (label || '').toString().toLowerCase();
  if (key === 'submit' || key === 'submission')  return 'pi pi-send';
  if (key === 'reject' || key === 'application reject') return 'pi pi-times';
  if (key === 'applicant notice') return 'pi pi-exclamation-circle';
  if (key === 'issue fee invoice') return 'pi pi-wallet';
  if (key === 'return to applicant' || key === 'recall' ) return 'pi pi-undo';
  return 'pi pi-check-circle';
}

function markerClass(label) {
  const key = (label || '').toString().toLowerCase();
  if (key === 'reject' || key === 'application reject') return 'tw-bg-rose-600';
  if (key === 'applicant notice') return 'tw-bg-amber-500';
  if (key === 'issue fee invoice') return 'tw-bg-sky-600';
  if (key === 'return to applicant') return 'tw-bg-orange-500';
  return 'tw-bg-slate-500';
}

function parseActionDate(a) {
  if (a?.created_at) {
    // Backend format: "YYYY-MM-DD HH:mm" (assume +03:00)
    const iso = a.created_at.replace(' ', 'T') + ':00+03:00';
    return new Date(iso);
  }
  return null;
}

function timeHHmm(a) {
  const dt = parseActionDate(a);
  if (!dt) return '';
  // Always English numerals
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit', minute: '2-digit', hour12: false, timeZone: TZ
  }).format(dt);
}

function dateYmd(a) {
  const dt = parseActionDate(a);
  if (!dt) return '';
  // toYmd ensures YYYY-MM-DD with English numerals
  return toYmd(dt);
}

// ────────────────────────────────────────────────────────────────────────────
// DATA: read-only from store
// ────────────────────────────────────────────────────────────────────────────
const rawActions = computed(() => {
  const a = store?.payload?.actions?.value;
  const b = store?.payload?.application_actions?.value;
  if (Array.isArray(a)) return a;
  if (Array.isArray(b)) return b;
  if (b && typeof b === 'object') return [b];
  return [];
});

const actionsSorted = computed(() => {
  return [...rawActions.value].sort((x, y) => {
    const A = parseActionDate(x)?.getTime() ?? 0;
    const B = parseActionDate(y)?.getTime() ?? 0;
    return B - A; // newest first
  });
});
</script>

<template>
  <div class="tw-space-y-8" data-testid="actions-card">
    <!-- Heading (outside, not centered) -->
    <div class="tw-mb-2 tw-flex tw-items-center tw-gap-2">
      <i class="pi pi-history tw-text-primary" aria-hidden="true"></i>
      <span class="tw-font-bold tw-text-slate-700 tw-text-xl">{{ $t('Action History') }}</span>
    </div>

    <!-- Empty -->
    <div v-if="actionsSorted.length === 0">
      <div class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-p-5">
        <div class="tw-text-center tw-py-8">
          <i class="pi pi-inbox tw-text-4xl tw-text-slate-300 tw-mb-3" aria-hidden="true"></i>
          <p class="tw-text-slate-500">{{ $t('No actions recorded yet') }}</p>
        </div>
      </div>
    </div>

    <!-- Timeline (single list; date & time inside card) -->
    <div v-else>
      <Timeline :value="actionsSorted" :align="isRtl ?  'left': 'right' " layout="vertical" class=" tw-flex tw-items-center tw-justify-center ">
        <template #marker="{ item }">
          <span :class="['tw-rounded-full tw-border-4 tw-border-white tw-flex tw-items-center tw-justify-center', markerClass(actionKey(item)), 'tw-w-8 tw-h-8 sm:tw-w-10 sm:tw-h-10']">
            <i :class="iconFor(actionKey(item))" class="tw-text-white tw-text-sm sm:tw-text-base" aria-hidden="true"></i>
          </span>
        </template>

        <template #content="{ item }" class="tw-px-0" >
          <div  :class="['tw-rounded-2xl tw-border tw-p-3 sm:tw-p-4 tw-shadow-sm', isImportant(item) ? 'tw-border-2 tw-border-rose-200 tw-bg-rose-50' : 'tw-border-slate-200 tw-bg-white']">
            <div :dir="isRtl ?  'rtl': 'ltr' " class="tw-flex tw-flex-row tw-items-start tw-justify-between tw-gap-3">
              <div class="tw-w-full" :class="[  isRtl ? 'tw-text-right' : 'tw-text-left' ]">
                <h3 class="tw-font-bold tw-text-slate-800 tw-mb-1 tw-truncate">{{ $t(actionKey(item)) }}</h3>
                <p v-if="item.notes || item.description" :class="['tw-break-words', isImportant(item) ? 'tw-text-rose-900 tw-font-medium' : 'tw-text-slate-700 tw-text-sm']">
                  {{ item.notes || item.description }}
                </p>
              </div>

              <!-- Time & Date (inside card) -->
              <div :class="['tw-whitespace-nowrap tw-ml-2', isRtl ? 'tw-text-right' :  'tw-text-left' ]">
                <div class="tw-text-sm tw-text-slate-900 tw-font-medium">{{ timeHHmm(item) }}</div>
                <div class="tw-text-xs tw-text-slate-500">{{ dateYmd(item) }}</div>
              </div>
            </div>
          </div>
        </template>
      </Timeline>
    </div>
  </div>
</template>

<style scoped>
/* PrimeVue Timeline tuning + RTL support + mobile spacing */
:deep(.p-timeline) { --line-color: #e5e7eb; }
:deep(.p-timeline-event) { 
    margin-bottom: 1rem;
    width: 100%;
 }
:deep(.p-timeline-event:last-child) { margin-bottom: 0; }
:deep(.p-timeline-event-opposite) { display: none; }
:deep(.p-timeline-event-connector) { background-color: var(--line-color); width: 2px; }
:deep(.p-timeline-event-marker) { box-shadow: 0 0 0 4px #fff; }

:deep(.p-timeline-event-content) {padding: 0;}
/* Content offset from the line */
:deep(.p-timeline.p-timeline-left .p-timeline-event-content) { margin-left: 0.5rem; }
:deep(.p-timeline.p-timeline-right .p-timeline-event-content) { margin-right: 0.5rem; }

@media (min-width: 640px) { /* sm: */
  :deep(.p-timeline-event) { margin-bottom: 1.25rem; }
  :deep(.p-timeline.p-timeline-left .p-timeline-event-content) { margin-left: 0.75rem; }
  :deep(.p-timeline.p-timeline-right .p-timeline-event-content) { margin-right: 0.75rem; }
}
</style>
