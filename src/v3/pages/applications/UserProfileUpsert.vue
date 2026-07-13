<script setup>
/**
 * UserProfileUpsert — Phase A
 * - Create/Edit profile by application_id
 * - Schema-driven with MasterForm
 * - i18n/RTL ready, English numerals
 * - Uses app store to gate editability
 */
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import AppButton from '@/v3/components/ui/AppButton.vue';
import MasterForm from '@/v3/components/Forms/MasterForm.vue';

import { useApplicationStore } from '@/v3/composables/application/useApplicationStore.js';
import { useNotification } from '@/v3/composables/useNotification.js';
import { useErrorHandler } from '@/v3/composables/useErrorHandler.js';
import usePageHeading from '@/v3/composables/layout/usePageHeading.js';
import { ERROR_TYPES, apiGet, apiPost } from '@/v3/services/httpClient.js';

import {
  makeUserProfileSchema,
  normalizeProfileInitialValues,
  serializeProfile
} from '@/v3/schema/userProfile.js';
import { getCountryNameOptions } from '@/v3/utils/countryOptions.js';

// Added import for useLoading
import { useLoading } from '@/v3/composables/useLoading.js';
 

const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();

const { setHeading } = usePageHeading();
const { success: notifySuccess, error: notifyError } = useNotification();
const { capture } = useErrorHandler();

const store = useApplicationStore();
// Initialize useLoading
const { withLoading, isLoadingKey } = useLoading();

const mfRef = ref(null);
// Schema definition (structure only)
const schema = ref(makeUserProfileSchema());

// Reactive state for options and data
const formOptions = ref({ region_id: [], city_id: [], nationality: [] });
const initialValues = ref({});

const regions = ref([]);
const cities = ref([]);

// Loading state management
const initializing = computed(() => isLoadingKey('profile-initializing'));
const saving = computed(() => isLoadingKey('profile-saving'));

const formIsValid = ref(false);
const canSubmit = computed(() => formIsValid.value); 
const appId = Number(route.params.appId) || null;

function onValidity({ isValid }) {
  formIsValid.value = isValid;
}

function submitProgrammatically() {
  if (saving.value) return;
  const ok = mfRef.value?.validateForm?.();
  if (!ok) {
    mfRef.value?.showErrors?.();
    return;
  }
  mfRef.value?.submitForm?.();
}

function filterCitiesByRegion(regionId) {
  if (!regionId) {
    formOptions.value.city_id = [];
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

async function initialize() {
  try {
    if (!appId) {
      notifyError(t('Application ID is missing'));
      return;
    }

    // Load regions and cities first
    const addressResponse = await apiGet('addresses/common');
    regions.value = addressResponse?.regions || [];
    cities.value = addressResponse?.cities || [];
    
    // Populate formOptions for regions
    formOptions.value.region_id = regions.value.map(r => ({
      label: r.name,
      value: r.id
    }));
    // Start with empty cities until region is selected
    formOptions.value.city_id = [];
    setNationalityOptions();

    // Always ensure user_profile is loaded for this component
    const appLoaded = store.application.value && store.application.value.id === appId;
    const userProfileLoaded = store.isPayloadKeyLoaded('user_profile');

    // Load application if not loaded, or force reload if user_profile is missing
    if (!appLoaded || !userProfileLoaded) {
      await withLoading('application-fetching', async () => {
        await store.loadApplication(appId, {
          withPayload: true,
          payloadKeys: ['user_profile'],
          forceReload: !userProfileLoaded // Force reload if user_profile is missing
        });
      });
    }
    if (!store.application.value) {
      notifyError(t('Application not found'));
      router.replace({ name: 'error-404', params: { locale: locale.value } });
      return;
    }
    if (!store.canModifyApplication.value) {
      notifyError(t('This application cannot be modified in its current stage'));
      router.replace({ name: 'app-summary', params: { appId, locale: locale.value } });
      return;
    }

    // User profile loaded from payload
    // If null = create mode (no profile exists)
    // If has data = edit mode (profile exists)
    const profile = store.payload.user_profile.value;
    
    // Populate initialValues
    if (profile) {
      initialValues.value = normalizeProfileInitialValues(profile);
      setNationalityOptions(profile.nationality || '');
      
      // If editing existing profile, filter cities by region
      if (profile.region_id) {
        filterCitiesByRegion(profile.region_id);
      }
    }

    setHeading({ title: t('Update Profile'), visible: true });
  } catch (e) {
    capture(e, {
      context: 'UserProfileUpsert.initialize',
      fallback: 'Failed to initialize profile',
      meta: { appId }
    });
    notifyError(t('Failed to load profile page'));
    router.replace({ name: 'applications-index', params: { locale: locale.value } });
  }
}

async function onSubmit({ formData }) {
  try {
    const payload = await serializeProfile(formData);

    // Use single API call that handles both create and update
    await withLoading('profile-saving', async () => {
      await apiPost(import.meta.env.VITE_APPS_USERS_UPDATE_USER_PROFILE + appId, payload);
    });

    notifySuccess(t('Profile updated successfully'));
    
    // Navigate to summary page
    // No need to reload - summary page will load with full payload
    router.push({ name: 'app-summary', params: { appId, locale: locale.value } });
  } catch (e) {
    if (e?.name === ERROR_TYPES.VALIDATION || e?.status === 422) {
      const errors = e.validationErrors || e.payload?.errors || {};
      mfRef.value?.applyServerErrors?.(errors);
      return;
    }
    if (e?.status === 404) {
      router.replace({ name: 'error-404', params: { locale: locale.value } });
      return;
    }
    if (e?.status === 409) {
      notifyError(t('A profile already exists for this application'));
      return;
    }
    if (e?.status >= 500) {
      router.replace({ name: 'server-error', params: { locale: locale.value } });
      return;
    }

    capture(e, {
      context: 'UserProfileUpsert.onSubmit',
      fallback: 'Failed to save profile',
      meta: { appId }
    });
    notifyError(t('Failed to save profile'));
  }
}

// Wrap initialize with loading state
onMounted(async () => {
  await withLoading('profile-initializing', initialize);
});
</script>

<template>
  <div class="tw-pt-10 tw-pb-24 tw-px-4">
    <!-- Loading -->
    <div v-if="initializing" class="tw-flex tw-justify-center tw-py-16">
      <i class="pi pi-spinner tw-animate-spin tw-text-3xl tw-text-primary" aria-hidden="true"></i>
    </div>

    <!-- Form -->
    <section
      v-else
      class="tw-max-w-3xl tw-mx-auto tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-[0_8px_30px_rgba(3,87,150,.06)] tw-p-4 sm:tw-p-6 md:tw-p-8"
    >
      <div class="tw-mb-6">
        <h1 class="tw-text-2xl tw-font-bold tw-text-slate-800">
          {{ t('Update Profile') }}
        </h1>
        <p class="tw-text-sm tw-text-slate-600 tw-mt-1">
          {{ t('Please ensure your personal information is accurate and up to date') }}
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
      ></MasterForm>

      <div class="tw-mt-6 tw-flex tw-justify-end tw-gap-4 tw-items-center">
        <router-link
          :to="{ name: 'app-summary', params: { appId, locale } }"
          class="tw-inline-flex tw-items-center tw-gap-2 tw-text-slate-600 hover:tw-text-slate-900 tw-transition tw-font-medium"
        >
          <i class="pi pi-arrow-left" aria-hidden="true"></i>
          <span>{{ t('Cancel') }}</span>
        </router-link>

        <AppButton
          variant="primary"
          icon="pi pi-check"
          :disabled="saving || !canSubmit"
          @click="submitProgrammatically"
        >
          <span v-if="!saving">{{ t('Save') }}</span>
          <span v-else class="tw-inline-flex tw-items-center tw-gap-2">
            <i class="pi pi-spinner tw-animate-spin" aria-hidden="true"></i>
            <span>{{ t('Saving') }}</span>
          </span>
        </AppButton>
      </div>
    </section>
  </div>
</template>
