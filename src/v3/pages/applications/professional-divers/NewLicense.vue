<script setup>
/**
 * ProfessionalDiverNewLicense — v3 Component
 * - Collect user profile (identity number) for new license application
 * - Backend validates identity number to prevent duplicate licenses
 * - Follows UserProfileUpsert.vue pattern exactly
 */
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import AppButton from '@/v3/components/ui/AppButton.vue';
import MasterForm from '@/v3/components/Forms/MasterForm.vue';

import { useNotification } from '@/v3/composables/useNotification.js';
import { useErrorHandler } from '@/v3/composables/useErrorHandler.js';
import usePageHeading from '@/v3/composables/layout/usePageHeading.js';
import { useLoading } from '@/v3/composables/useLoading.js';
import { apiGet, apiPost } from '@/v3/services/httpClient.js';

import {
  makeUserProfileSchema,
  normalizeProfileInitialValues,
  serializeProfile,
} from '@/v3/schema/userProfile.js';
import { getCountryNameOptions } from '@/v3/utils/countryOptions.js';

import {
  GET_REGIONS_CITIES,
  PROFESSIONAL_DIVERS_APPS_CREATE_LICENSE,
  PROFESSIONAL_DIVERS_APPS_GET_LICENSE_PROFILE
} from '@/v3/config/apiEndpoints.js';
import { getConflictApplicationId } from '@/v3/utils/applicationWorkflow.js';

const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();

const { setHeading } = usePageHeading();
const { success: notifySuccess, error: notifyError } = useNotification();
const { capture } = useErrorHandler();
const { withLoading, isLoadingKey } = useLoading();

const mfRef = ref(null);
const schema = ref(makeUserProfileSchema());
const formOptions = ref({ region_id: [], city_id: [], nationality: [] });
const initialValues = ref({});

const regions = ref([]);
const cities = ref([]);

// Loading state management
const initializing = computed(() => isLoadingKey('profile-initializing'));
const saving = computed(() => isLoadingKey('profile-saving'));

const submitting = ref(false);

const formIsValid = ref(false);
const canSubmit = computed(() => formIsValid.value);

function onValidity({ isValid }) {
  formIsValid.value = isValid;
}

function submitProgrammatically() {
  if (saving.value || submitting.value) return;
  const ok = mfRef.value?.validateForm?.();
  if (!ok) {
    mfRef.value?.showErrors?.();
    return;
  }
  mfRef.value?.submitForm?.();
}

function filterCitiesByRegion(regionId) {
  if (!regionId) {
    // Show all cities if no region selected
    formOptions.value.city_id = cities.value.map(c => ({
      label: c.name,
      value: c.id,
      region_id: c.region_id
    }));
    return;
  }
  
  formOptions.value.city_id = cities.value
    .filter(c => Number(c.region_id) === Number(regionId))
    .map(c => ({
      label: c.name,
      value: c.id,
      region_id: c.region_id
    }));
}

function setNationalityOptions(currentValue = '') {
  formOptions.value.nationality = getCountryNameOptions(locale.value, currentValue);
}

function onFieldChange({ key, value }) {
  if (key === 'region_id') {
    mfRef.value?.setFieldValue?.('city_id', null);
    filterCitiesByRegion(value);
  }
}

function getConflictMessage(error) {
  const raw =
    error?.payload?.body?.message ||
    error?.payload?.message ||
    error?.payload?.statusText ||
    error?.statusText ||
    error?.statusText ||
    error?.message ||
    '';

  const conflictName = error?.name || '';
  if (!raw || (conflictName && raw === conflictName)) {
    return t('It is not allowed to issue two licenses to the same person');
  }

  return raw;
}

function shouldRedirectToLicense(message) {
  const normalized = String(message || '').toLowerCase();
  if (!normalized) return false;
  if (normalized.includes('application')) return false;
  return normalized.includes('license');
}

async function initialize() {
  try {
    // Load regions and cities first
    const addressResponse = await apiGet(GET_REGIONS_CITIES);
    regions.value = addressResponse?.regions || [];
    cities.value = addressResponse?.cities || [];

    // Populate formOptions for regions
    formOptions.value.region_id = regions.value.map(r => ({
      label: r.name,
      value: r.id
    }));

    // Start with FULL list of cities (as requested)
    formOptions.value.city_id = cities.value.map(c => ({
      label: c.name,
      value: c.id,
      region_id: c.region_id
    }));
    setNationalityOptions();

    // Load user profile for prefill using newLicenseProfile endpoint
    const profileResponse = await apiGet(PROFESSIONAL_DIVERS_APPS_GET_LICENSE_PROFILE);
    const profile = profileResponse?.profile;
    
    // Populate initialValues if profile exists
    if (profile) {
      initialValues.value = normalizeProfileInitialValues(profile);
      setNationalityOptions(profile.nationality || '');
      
      // Filter cities by region if profile has region_id
      if (profile.region_id) {
        filterCitiesByRegion(profile.region_id);
      }
    } else {
      // No active profile - start with empty form
      initialValues.value = {};
    }

    setHeading({ title: t('Professional Diver New License Application'), visible: true });
  } catch (e) {
    // Handle 409 conflicts separately
    if (e?.status === 409) {
      const message = getConflictMessage(e);
      const applicationId = getConflictApplicationId(e);
      
      // Show notification with cause of redirection
      notifyError(message);
      
      // If response has a blocking application, redirect to app-summary page
      if (applicationId) {
        router.replace({
          name: 'app-summary',
          params: { appId: applicationId, locale: locale.value }
        });
      } else {
        // Otherwise redirect to user profile page
        router.replace({ name: 'professional-diver-license', params: { locale: locale.value } });
      }
      return;
    }
    
    // Handle other errors
    capture(e, {
      context: 'ProfessionalDiverNewLicense.initialize',
      fallback: 'Failed to initialize form',
      meta: {}
    });
    notifyError(t('Failed to load form'));
    router.replace({ name: 'AppRoot' });
  }
}

async function onSubmit({ formData }) {
  if (saving.value || submitting.value) return;
  submitting.value = true;

  try {
    await withLoading('profile-saving', async () => {
      try {
        const payload = await serializeProfile(formData);
        
        // Submit to newLicense endpoint
        // Backend validates:
        // 1. License exists with this identity number? → 409
        // 2. User already has a license? → 409
        // 3. In-progress application exists? → 409
        // 4. Create application + save profile → 201
        const response = await apiPost(
          PROFESSIONAL_DIVERS_APPS_CREATE_LICENSE,
          payload
        );
        
        const applicationId = response?.application?.id;
        
        if (!applicationId) {
          throw new Error('Application ID not returned from server');
        }
        
        notifySuccess(t('Application created successfully'));
        
        // Navigate to application summary
        router.push({
          name: 'app-summary',
          params: { appId: applicationId, locale: locale.value }
        });
      } catch (e) {
        // Handle conflict errors (existing license)
        if (e?.status === 409) {
          const message = getConflictMessage(e);
          const applicationId = getConflictApplicationId(e);
          notifyError(message);

          if (applicationId) {
            router.replace({
              name: 'app-summary',
              params: { appId: applicationId, locale: locale.value }
            });
            return;
          }

          if (shouldRedirectToLicense(message)) {
            router.replace({ name: 'professional-diver-license', params: { locale: locale.value } });
            return;
          }

          mfRef.value?.showErrors?.();
          return;
        }
        
        // Handle validation errors
        if (e?.status === 422) {
          const errors = e.validationErrors || e.payload?.errors || {};
          mfRef.value?.applyServerErrors?.(errors);
          notifyError(t('Please fix the validation errors'));
          return;
        }
        
        // Handle other errors
        capture(e, {
          context: 'ProfessionalDiverNewLicense.onSubmit',
          fallback: 'Failed to create license application',
          meta: { formData }
        });
        notifyError(t('Failed to create license application'));
      }
    });
  } finally {
    submitting.value = false;
  }
}

onMounted(async () => {
  await withLoading('profile-initializing', initialize);
});
</script>

<template>
  <div class="tw-space-y-6">
 

    <!-- Loading State -->
    <div v-if="initializing" class="tw-flex tw-justify-center tw-py-16">
      <i class="pi pi-spinner tw-animate-spin tw-text-3xl tw-text-primary" aria-hidden="true"></i>
    </div>

    <!-- User Profile Form -->
    <section
      v-else
      class="tw-max-w-3xl tw-mx-auto tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-[0_8px_30px_rgba(3,87,150,.06)] tw-p-4 sm:tw-p-6 md:tw-p-8"
    >
      <div class="tw-mb-6">
        <h1 class="tw-text-2xl tw-font-bold tw-text-slate-800">
          {{ t('Professional Diver New License Application') }}
        </h1>
        <p class="tw-text-sm tw-text-slate-600 tw-mt-1">
          {{ t('Please provide your personal information to begin the license application process') }}
        </p>
      </div>

      <MasterForm 
        ref="mfRef"
        :schema="schema"
        :formOptions="formOptions"
        :initialValues="initialValues"
        @submit="onSubmit"
        @validity="onValidity"
        @field-change="onFieldChange"
      />

      <div class="tw-mt-6 tw-flex tw-justify-end tw-gap-4 tw-items-center">
        <router-link
          :to="{ name: 'AppRoot' }"
          class="tw-inline-flex tw-items-center tw-gap-2 tw-text-slate-600 hover:tw-text-slate-900 tw-transition tw-font-medium"
        >
          <i class="pi pi-arrow-left" aria-hidden="true"></i>
          <span>{{ t('Cancel') }}</span>
        </router-link>

        <AppButton
          variant="primary"
          icon="pi pi-check"
          :disabled="saving || submitting || !canSubmit"
          @click="submitProgrammatically"
        >
          <span v-if="!saving">{{ t('Submit') }}</span>
          <span v-else class="tw-inline-flex tw-items-center tw-gap-2">
            <i class="pi pi-spinner tw-animate-spin" aria-hidden="true"></i>
            <span>{{ t('Submitting') }}</span>
          </span>
        </AppButton>
      </div>
    </section>
  </div>
</template>
