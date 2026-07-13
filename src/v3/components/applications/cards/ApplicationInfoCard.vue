<!-- VERSION: 2.1.0 -->
<!-- FILE: src/v3/components/applications/cards/ApplicationInfoCard.vue -->
<!-- Self-contained card that reads from centralized store -->

<template>
  <div>
    <!-- Heading outside the card (same spacing/style as Event card) -->
    <div class="tw-mb-2 tw-flex tw-items-center tw-gap-2 tw-text-slate-800 tw-text-xl tw-font-bold">
      <i class="pi pi-file" aria-hidden="true" />
      <span>{{ t('Application Information') }}</span>
    </div>
    
    <!-- Applicant Action Notice -->
    <div
      v-if="stageNotice"
      :class="[
        'tw-mb-3 tw-p-3 tw-border tw-rounded-lg',
        stageNotice.boxClass
      ]"
    >
      <div class="tw-flex tw-gap-2">
        <i :class="['pi pi-info-circle tw-font-semibold tw-mt-0.5', stageNotice.iconClass]" aria-hidden="true"></i>
        <p :class="['tw-text-sm tw-font-semibold', stageNotice.textClass]">
          {{ t(stageNotice.message) }}
        </p>
      </div>
    </div>
    
    <!-- Card -->
    <section
      class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-p-5"
    >
      <div class="tw-grid sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-4">
        <!-- Application ID -->
        <div>
          <div class="tw-text-xs tw-text-slate-500">{{ t('Application ID') }}</div>
          <div class="tw-font-medium">{{ application?.id }}</div>
        </div>
        
        <!-- Status -->
        <div>
          <div class="tw-text-xs tw-text-slate-500">{{ t('Status') }}</div>
          <div class="tw-font-medium" v-if="application?.status">{{ $t(application?.status) }}</div>
        </div>
        
        <!-- Submitted Date -->
        <div v-if="application?.submitted_at">
          <div class="tw-text-xs tw-text-slate-500">{{ t('Submitted Date') }}</div>
          <div class="tw-font-medium">{{ toYmd(application.submitted_at) }}</div>
        </div>
        
        <!-- Approval Date -->
        <div v-if="application?.approved_at">
          <div class="tw-text-xs tw-text-slate-500">{{ t('Approval Date') }}</div>
          <div class="tw-font-medium">{{ toYmd(application.approved_at) }}</div>
        </div>
        
        <!-- Payment Date -->
        <div v-if="application?.paid_at">
          <div class="tw-text-xs tw-text-slate-500">{{ t('Payment Date') }}</div>
          <div class="tw-font-medium">{{ toYmd(application.paid_at) }}</div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useApplicationStore } from '@/v3/composables/application/useApplicationStore.js';
import { toYmd } from '@/v3/utils/dates.js';
import {
  isApplicantDraftStage,
  isApplicantRevisionStage
} from '@/v3/utils/applicationWorkflow.js';

// ────────────────────────────────────────────────────────────────────────────
// NO PROPS - Everything from store
// ────────────────────────────────────────────────────────────────────────────

const { t } = useI18n();
const store = useApplicationStore();

// ────────────────────────────────────────────────────────────────────────────
// DATA FROM STORE
// ────────────────────────────────────────────────────────────────────────────

const application = computed(() => store.application.value);

const stageNotice = computed(() => {
  const stage = application.value?.stage;

  if (isApplicantRevisionStage(stage)) {
    return {
      message: 'Your application has been returned and can be edited. Please review the application information before resubmitting it.',
      boxClass: 'tw-bg-orange-50 tw-border-orange-200',
      iconClass: 'tw-text-orange-900',
      textClass: 'tw-text-orange-900'
    };
  }

  if (isApplicantDraftStage(stage)) {
    return {
      message: 'Your application has not been submitted yet. The federation will not review it until you submit the application.',
      boxClass: 'tw-bg-amber-50 tw-border-amber-200',
      iconClass: 'tw-text-amber-900',
      textClass: 'tw-text-amber-900'
    };
  }

  return null;
});
</script>

<!--
VERSION: 2.1.0

CHANGES IN v2.1.0:
==================
- Removed application prop (now reads from store.application)
- Component is now completely self-contained (zero props)
- Added imports for store

ARCHITECTURE NOTES:
===================
- NO PROPS - Everything from store
- Reads from: store.application
- This is a display-only card (no validation)

USAGE:
======
<ApplicationInfoCard />

No props needed! Component gets everything from store.
-->
