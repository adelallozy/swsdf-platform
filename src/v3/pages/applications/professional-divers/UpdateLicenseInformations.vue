<script setup>
/**
 * UpdateLicenseInformations — v3 Component
 * - Updates license information (rank, card design) for existing professional diver application
 * - Backend validates and saves license information
 * - Follows UserProfileUpsert.vue pattern exactly
 */
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import AppButton from '@/v3/components/ui/AppButton.vue';
import MasterForm from '@/v3/components/Forms/MasterForm.vue';

import { pipe, string, picklist, union, number } from 'valibot';

import { useApplicationStore } from '@/v3/composables/application/useApplicationStore.js';
import { useNotification } from '@/v3/composables/useNotification.js';
import { useErrorHandler } from '@/v3/composables/useErrorHandler.js';
import usePageHeading from '@/v3/composables/layout/usePageHeading.js';
import { useLoading } from '@/v3/composables/useLoading.js';
import { apiPost } from '@/v3/services/httpClient.js';

import {
  PROFESSIONAL_DIVERS_APPS_SET_SERVICES
} from '@/v3/config/apiEndpoints.js';

const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();

const { setHeading } = usePageHeading();
const { success: notifySuccess, error: notifyError } = useNotification();
const { capture } = useErrorHandler();
const { withLoading, isLoadingKey } = useLoading();

const store = useApplicationStore();

const mfRef = ref(null);
const formIsValid = ref(false);
const canSubmit = computed(() => formIsValid.value);

function makeLicenseInformationSchema() {
  return {
    rank: {
      type: 'radioTiles',
      label: 'Professional Diver Rank',
      value: '',
      required: true,
      options: [
        { label: 'Divemaster', value: 'Divemaster', icon: 'pi-certificate' },
        { label: 'Snorkel Guide', value: 'Snorkel Guide', icon: 'pi-book' },
        { label: 'Assistant Instructor', value: 'Assistant Instructor', icon: 'pi-user' },
        { label: 'EFR Instructor', value: 'EFR Instructor', icon: 'pi-user-plus' },
        { label: 'Instructor', value: 'Instructor', icon: 'pi-users' },
        { label: 'Instructor Trainer', value: 'Instructor Trainer', icon: 'pi-users' },
      ],
      validation: pipe(
        string('Professional Diver Rank is required'),
        picklist(
          [
            'Divemaster',
            'Snorkel Guide',
            'Assistant Instructor',
            'EFR Instructor',
            'Instructor',
            'Instructor Trainer'
          ],
          'Select a valid rank'
        )
      )
    },
    card_design_id: {
      type: 'radioTiles',
      label: 'Card Design',
      value: '',
      required: true,
      options: [
        { label: 'Only Digital', value: 0, icon: 'pi-mobile' },
        { label: 'Hard Copy', value: 1, icon: 'pi-id-card' },
      ],
      validation: pipe(
        union([string('Card Design is required'), number('Card Design is required')]),
        picklist([0, 1, '0', '1'], 'Select a valid card design')
      )
    }
  };
}

const schema = makeLicenseInformationSchema();

// Get application ID from route params (support both appId and id)
const appId = Number(route.params.appId) || Number(route.params.id) || null;

// Form initial values from payload
const initialValues = computed(() => {
  const pdLicense = store.payload.pd_license?.value;
  if (!pdLicense) {
    return { rank: '', card_design_id: '' };
  }
  return {
    rank: pdLicense.rank || '',
    card_design_id: pdLicense.card_design_id ?? ''
  };
});

// Loading state management
const initializing = computed(() => isLoadingKey('license-info-initializing'));
const saving = computed(() => isLoadingKey('license-info-saving'));

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

async function initialize() {
  try {
    if (!appId) {
      notifyError(t('Application ID is missing'));
      return;
    }

    // Load application with pd_license payload
    await withLoading('license-info-initializing', async () => {
      await store.loadApplication(appId, {
        withPayload: true,
        payloadKeys: ['pd_license']
      });
    });

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

    setHeading({ title: 'License Informations', visible: true });
  } catch (e) {
    capture(e, {
      context: 'UpdateLicenseInformations.initialize',
      fallback: 'Failed to initialize form',
      meta: { appId }
    });
    notifyError(t('Failed to load license information'));
    router.replace({ name: 'applications-index', params: { locale: locale.value } });
  }
}

async function onSubmit({ formData }) {
  try {
    await withLoading('license-info-saving', async () => {
      const endpoint = PROFESSIONAL_DIVERS_APPS_SET_SERVICES + appId;
      await apiPost(endpoint, formData);
    });

    notifySuccess(t('License information updated successfully'));

    // Navigate to application-summary
    router.push({
      name: 'app-summary',
      params: { appId, locale: locale.value }
    });
  } catch (e) {
    // Handle validation errors
    if (e?.status === 422) {
      // Normalize errors to ensure they are strings, not objects
      const rawErrors = e.validationErrors || e.payload?.errors || e.errors || {};
      const normalizedErrors = {};
      
      for (const [key, value] of Object.entries(rawErrors)) {
        // Handle different error value formats
        if (Array.isArray(value) && value.length > 0) {
          normalizedErrors[key] = String(value[0] || '');
        } else if (typeof value === 'string') {
          normalizedErrors[key] = value;
        } else if (typeof value === 'object' && value !== null) {
          // Try to extract message from object
          const msg = value.message || value.error || '';
          normalizedErrors[key] = String(msg);
        } else {
          normalizedErrors[key] = String(value || '');
        }
      }
      
      mfRef.value?.applyServerErrors?.(normalizedErrors);
      notifyError(t('Please fix the validation errors'));
      return;
    }

    // Handle 404 errors
    if (e?.status === 404) {
      router.replace({ name: 'error-404', params: { locale: locale.value } });
      return;
    }

    // Handle 409 conflicts
    if (e?.status === 409) {
      notifyError(e?.payload?.message || e?.message || t('Conflict occurred while saving'));
      return;
    }

    // Handle other errors
    capture(e, {
      context: 'UpdateLicenseInformations.onSubmit',
      fallback: 'Failed to save license information',
      meta: { appId, formData }
    });
    notifyError(t('Failed to save license information'));
  }
}

onMounted(async () => {
  await initialize();
});
</script>

<template>
  <div class="tw-pt-10 tw-pb-24 tw-px-4">
    <!-- Loading State -->
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
          {{ t('License Informations') }}
        </h1>
        <p class="tw-text-sm tw-text-slate-600 tw-mt-1">
          {{ t('Please provide your license information to complete the application') }}
        </p>
      </div>

      <MasterForm
        ref="mfRef"
        :schema="schema"
        :initialValues="initialValues"
        @submit="onSubmit"
        @validity="onValidity"
      />

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
