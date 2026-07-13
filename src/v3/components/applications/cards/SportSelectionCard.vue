<template>
  <div v-if="visibleComponent" data-step-id="sport_selection">
    <div class="tw-mb-2 tw-flex tw-items-center tw-justify-between tw-gap-3">
      <div class="tw-flex tw-items-center tw-gap-2 tw-flex-wrap">
        <i class="pi pi-compass tw-text-primary" aria-hidden="true"></i>
        <span class="tw-font-bold tw-text-slate-700 tw-text-xl">{{ t('Sport') }}</span>

        <div
          v-if="sportStatus"
          :class="statusClass"
          class="tw-flex tw-items-center tw-gap-1 tw-px-2 tw-py-1 tw-text-xs tw-font-medium tw-rounded-full"
        >
          <i :class="statusIcon" aria-hidden="true"></i>
          <span>{{ statusMessage }}</span>
        </div>
      </div>
    </div>

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

    <div class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-p-5">
      <div v-if="showSelectedSport" class="tw-grid sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-4">
        <div>
          <div class="tw-text-xs tw-text-slate-500">{{ t('Selected Sport') }}</div>
          <div class="tw-font-medium">{{ t(sportLabel) }}</div>
        </div>
      </div>

      <div
        v-else-if="currentRegistration"
      >
        <div class="tw-mb-4 tw-flex tw-items-center tw-gap-2">
          <div class="tw-flex tw-items-center tw-gap-2">
            <i class="pi pi-id-card tw-text-primary" aria-hidden="true"></i>
            <span class="tw-text-sm tw-font-semibold tw-text-slate-700">{{ t('Current Registration') }}</span>
          </div>
        </div>

        <div class="tw-grid sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-4">
          <div v-if="currentRegistrationSportLabel">
            <div class="tw-text-xs tw-text-slate-500">{{ t('Sport') }}</div>
            <div class="tw-font-medium">{{ t(currentRegistrationSportLabel) }}</div>
          </div>

          <div v-if="currentRegistrationTypeLabel">
            <div class="tw-text-xs tw-text-slate-500">{{ t('Registration Type') }}</div>
            <div class="tw-font-medium">{{ currentRegistrationTypeLabel }}</div>
          </div>

          <div v-if="currentRegistration.status">
            <div class="tw-text-xs tw-text-slate-500">{{ t('Status') }}</div>
            <div class="tw-font-medium">{{ t(currentRegistration.status) }}</div>
          </div>

          <div v-if="currentRegistration.expiry_date">
            <div class="tw-text-xs tw-text-slate-500">{{ t('Expiry date') }}</div>
            <div class="tw-font-medium">{{ currentRegistration.expiry_date }}</div>
          </div>
          <div v-if="currentRegistration.category">
            <div class="tw-text-xs tw-text-slate-500">{{ t('Category') }}</div>
            <div class="tw-font-medium">{{ currentRegistration.category }}</div>
          </div>
        </div>
      </div>

      <div v-else class="tw-text-center tw-py-8">
        <i class="pi pi-compass tw-text-4xl tw-text-slate-300 tw-mb-3" aria-hidden="true"></i>
        <p class="tw-text-slate-500">{{ t('No sport selected yet') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';

import { useApplicationStore } from '@/v3/composables/application/useApplicationStore.js';
import { getAthleteSportCode, getAthleteSportLabel } from '@/v3/schema/applications/athleteSport.js';

const { t } = useI18n();
const store = useApplicationStore();

const application = computed(() => store.application.value);
const canEdit = computed(() => store.canModifyApplication.value);
const sportPayload = computed(() => store.payload.sport.value || null);
const currentRegistration = computed(() => {
  return isCurrentRegistrationPayload(sportPayload.value) ? sportPayload.value : null;
});

const sportCode = computed(() => {
  const payloadSportCode = getAthleteSportCode(sportPayload.value);
  if (payloadSportCode) {
    return payloadSportCode;
  }

  const appSportCode = getAthleteSportCode(application.value?.entity_data?.sport);
  if (appSportCode) {
    return appSportCode;
  }

  return '';
});

const sportLabel = computed(() => getAthleteSportLabel(sportCode.value));

const currentRegistrationSportLabel = computed(() => {
  return getAthleteSportLabel(currentRegistration.value);
});

const currentRegistrationTypeLabel = computed(() => {
  const raw = String(currentRegistration.value?.registration_type || '').trim().toLowerCase();
  if (!raw) {
    return '';
  }

  if (raw === 'membership' || raw === 'license') {
    return t(raw);
  }

  return raw
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
});

const showSelectedSport = computed(() => !!sportCode.value && !currentRegistration.value);

const visibleComponent = computed(() => canEdit.value || !!sportCode.value || !!currentRegistration.value);

const sportStatus = computed(() => application.value?.progress?.['Sport Specifying'] || null);
const normalizedSportStatus = computed(() => String(sportStatus.value || '').toLowerCase());

const statusMessage = computed(() => {
  const status = normalizedSportStatus.value;
  if (!status) return '';
  if (status.includes('submitted')) return t('In progress');
  return t(sportStatus.value);
});

const statusClass = computed(() => {
  const status = normalizedSportStatus.value;
  if (['verified', 'completed', 'approved', 'ok'].some((s) => status.includes(s))) {
    return 'tw-bg-green-50 tw-text-green-700';
  }
  if (status.includes('required')) {
    return 'tw-bg-amber-50 tw-text-amber-700';
  }
  if (status.includes('submitted') || status.includes('pending')) {
    return 'tw-bg-slate-100 tw-text-slate-700';
  }
  return 'tw-bg-slate-100 tw-text-slate-600';
});

const statusIcon = computed(() => {
  const status = normalizedSportStatus.value;
  if (['verified', 'completed', 'approved', 'ok'].some((s) => status.includes(s))) {
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

const validationErrors = computed(() => {
  const errors = [];

  if (!canEdit.value) {
    return errors;
  }

  if (!sportCode.value) {
    errors.push(t('Sport is required'));
  }

  return errors;
});

function isCurrentRegistrationPayload(value) {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return [
    'registration_type',
    'status',
    'expiry_date',
    'category'
  ].some((key) => Object.prototype.hasOwnProperty.call(value, key) && value[key]);
}

watch(
  validationErrors,
  (errors) => {
    if (errors.length > 0) {
      store.setStepError('sport_selection', errors);
    } else {
      store.deleteStepError('sport_selection');
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  store.deleteStepError('sport_selection');
});
</script>
