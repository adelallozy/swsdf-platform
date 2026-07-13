<!-- FILE: src/v3/components/applications/cards/PDLicenseInformationCard.vue -->
<!-- VERSION: 1.0.1 -->
<!-- Self-validating card that reads from centralized store -->

<template>
  <div v-if="visibleComponent" data-step-id="pd_license">
    <!-- Header ABOVE and OUTSIDE the card -->
    <div class="tw-mb-2 tw-flex tw-items-center tw-justify-between">
      <div class="tw-flex tw-items-center tw-gap-2">
        <i class="pi pi-id-card tw-text-primary" aria-hidden="true"></i>
        <span class="tw-font-bold tw-text-slate-700 tw-text-xl">{{ t('License Informations') }}</span>

        <!-- Status indicator -->
        <div
          v-if="licenseStatus"
          :class="statusClass"
          class="tw-flex tw-items-center tw-gap-1 tw-px-2 tw-py-1 tw-text-xs tw-font-medium tw-rounded-full"
        >
          <i :class="statusIcon" aria-hidden="true"></i>
          <span>{{ statusMessage }}</span>
        </div>
      </div>

      <!-- Edit (visible only when allowed) -->
      <RouterLink
        v-if="canEdit"
        :to="editRoute"
        class="tw-inline-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 tw-text-sm tw-font-medium tw-text-primary hover:tw-bg-primary/10 tw-rounded-lg tw-transition"
      >
        <i class="pi pi-pencil" aria-hidden="true"></i>
        {{ t('Edit') }}
      </RouterLink>
    </div>

    <!-- Validation Errors -->
    <div v-if="validationErrors.length > 0" class="tw-mb-3">
      <div
        v-for="(error, index) in validationErrors"
        :key="index"
        class="tw-p-3 tw-bg-amber-50 tw-border tw-border-amber-200 tw-rounded-lg tw-mb-2"
      >
        <div class="tw-flex tw-gap-2">
          <i class="pi pi-exclamation-triangle tw-text-amber-600 tw-mt-0.5" aria-hidden="true"></i>
          <p class="tw-text-sm tw-text-amber-900">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Card -->
    <div v-if="licenseInfo" class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-p-5">
      <div class="tw-grid sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-4">
        <div v-if="licenseRank">
          <div class="tw-text-xs tw-text-slate-500">{{ t('Diver Rank') }}</div>
          <div class="tw-font-medium">{{ t(licenseRank) }}</div>
        </div>

        <div v-if="cardDesignLabel">
          <div class="tw-text-xs tw-text-slate-500">{{ t('Card Design') }}</div>
          <div class="tw-font-medium">{{ cardDesignLabel }}</div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-p-5">
      <div class="tw-text-center tw-py-8">
        <i class="pi pi-id-card tw-text-4xl tw-text-slate-300 tw-mb-3" aria-hidden="true"></i>
        <p class="tw-text-slate-500">{{ t('No license information available') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import { RouterLink, useRouter } from 'vue-router';
import { useApplicationStore } from '@/v3/composables/application/useApplicationStore.js';

const { t, locale } = useI18n();
const router = useRouter();
const store = useApplicationStore();

const licenseInfo = computed(() => store.payload.pd_license.value);
const canEdit = computed(() => store.canModifyApplication.value);
const application = computed(() => store.application.value);

const visibleComponent = computed(() => {
  if (canEdit.value) return true;
  return !!licenseInfo.value;
});

const licenseRank = computed(() => licenseInfo.value?.rank || '');

const cardDesignLabel = computed(() => {
  const raw = licenseInfo.value?.card_design_id;
  if (raw === null || raw === undefined || raw === '') return '';
  const normalized = String(raw);
  if (normalized === '0') return t('Only Digital');
  if (normalized === '1') return t('Hard Copy');
  return normalized;
});

const licenseStatus = computed(() => application.value?.progress?.['Professional Diver Rank'] || null);

const normalizedLicenseStatus = computed(() => String(licenseStatus.value || '').toLowerCase());

const statusMessage = computed(() => {
  const status = normalizedLicenseStatus.value;
  if (!status) return '';

  // "Submitted" here means the step data was provided/saved, NOT that the whole application was submitted.
  if (status.includes('submitted')) return t('In progress');

  return t(licenseStatus.value);
});

const statusClass = computed(() => {
  const status = normalizedLicenseStatus.value;
  if (['verified', 'completed', 'approved', 'ok'].some(s => status.includes(s))) {
    return 'tw-bg-green-50 tw-text-green-700';
  }

  if (status.includes('required')) {
    return 'tw-bg-amber-50 tw-text-amber-700';
  }

  // Keep this neutral to avoid confusion with application submission.
  if (status.includes('submitted') || status.includes('pending')) {
    return 'tw-bg-slate-100 tw-text-slate-700';
  }
  return 'tw-bg-slate-100 tw-text-slate-600';
});

const statusIcon = computed(() => {
  const status = normalizedLicenseStatus.value;
  if (['verified', 'completed', 'approved', 'ok'].some(s => status.includes(s))) {
    return 'pi pi-check-circle';
  }
  if (status.includes('required')) {
    return 'pi pi-exclamation-triangle';
  }
  if (status.includes('submitted') || status.includes('pending')) {
    return 'pi pi-clock';
  }
  return 'pi pi-info-circle';
});

const editRoute = computed(() => ({
  name: 'pd-license-info-update',
  params: {
    appId: application.value?.id,
    locale: locale.value
  }
}));

const validationErrors = computed(() => {
  const errors = [];

  if (!canEdit.value) {
    return errors;
  }

  if (!licenseRank.value) {
    errors.push(t('Professional Diver Rank is required'));
  }

  const raw = licenseInfo.value?.card_design_id;
  if (raw === null || raw === undefined || raw === '') {
    errors.push(t('Card Design is required'));
  }

  return errors;
});

watch(
  validationErrors,
  (errors) => {
    if (errors.length > 0) {
      store.setStepError('pd_license', errors);
    } else {
      store.deleteStepError('pd_license');
    }
  },
  { immediate: true }
);

function editLicenseInfo() {
  router.push(editRoute.value);
}

store.registerStepPrimaryAction('pd_license', editLicenseInfo);

onBeforeUnmount(() => {
  store.unregisterStepPrimaryAction('pd_license');
  store.deleteStepError('pd_license');
});
</script>
