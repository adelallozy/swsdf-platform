<!-- VERSION: 1.0.0 -->
<!-- FILE: src/v3/pages/applications/professional-divers/AddContract.vue -->
<!-- Add professional diver work contract - uses MasterForm -->

<template>
  <div class="tw-pt-10 tw-pb-24 tw-px-4">
    <section
      class="tw-max-w-3xl tw-mx-auto tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-[0_8px_30px_rgba(3,87,150,.06)] tw-p-4 sm:tw-p-6 md:tw-p-8"
    >
      <!-- Page Title -->
      <div class="tw-mb-6">
        <h1 class="tw-text-2xl tw-font-bold tw-text-slate-800">
          {{ t('Add Work Contract') }}
        </h1>
        <p class="tw-text-sm tw-text-slate-600 tw-mt-1">
          {{ t('Enter work contract details to add to your professional diver application') }}
        </p>
      </div>

      <!-- MasterForm -->
      <MasterForm
        ref="mfRef"
        :key="schemaKey"
        :schema="schema"
        @submit="onSubmit"
        @validity="onValidity"
      />

      <!-- Actions -->
      <div class="tw-mt-6 tw-flex tw-justify-end tw-gap-4 tw-items-center">
        <!-- Cancel Link -->
        <router-link 
          :to="{ name: 'app-summary', params: { appId, locale } }"
          class="tw-inline-flex tw-items-center tw-gap-2 tw-text-slate-600 hover:tw-text-slate-900 tw-transition tw-font-medium"
        >
          <i class="pi pi-arrow-left" aria-hidden="true"></i>
          <span>{{ t('Cancel') }}</span>
        </router-link>

        <!-- Submit Button -->
        <AppButton
          variant="primary"
          icon="pi pi-check"
          :disabled="saving || !canSubmit"
          @click="submitProgrammatically"
        >
          <span v-if="!saving">{{ t('Add Contract') }}</span>
          <span v-else class="tw-inline-flex tw-items-center tw-gap-2">
            <span class="lds-dual-ring"></span>{{ t('Saving') }}
          </span>
        </AppButton>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import AppButton from '@/v3/components/ui/AppButton.vue';
import MasterForm from '@/v3/components/Forms/MasterForm.vue';

import { makePDContractSchema } from '@/v3/schema/applications/professionalDiverContract.js';
import { usePDApplicationsApi } from '@/v3/composables/application/usePDApplicationsApi.js';
import { useApplicationStore } from '@/v3/composables/application/useApplicationStore.js';
import { useNotification } from '@/v3/composables/useNotification.js';
import { useErrorHandler } from '@/v3/composables/useErrorHandler.js';
import { ERROR_TYPES } from '@/v3/services/httpClient.js';
import usePageHeading from '@/v3/composables/layout/usePageHeading.js';
import { apiGet } from '@/v3/services/httpClient.js';

// ────────────────────────────────────────────────────────────────────────────
// COMPOSABLES
// ────────────────────────────────────────────────────────────────────────────

const { setHeading } = usePageHeading();
const route = useRoute();
const router = useRouter();
const { t, locale } = useI18n();
const { success: notifySuccess, error: notifyError } = useNotification();
const { capture } = useErrorHandler();

// API composable
const { addContract, isLoading } = usePDApplicationsApi();

// Store
const store = useApplicationStore();
const application = computed(() => store.application.value);
const canModifyApplication = computed(() => store.canModifyApplication.value);

// ────────────────────────────────────────────────────────────────────────────
// STATE
// ────────────────────────────────────────────────────────────────────────────

const diveCenters = ref([]);
const divingLoader = ref(false);
const schema = ref(makePDContractSchema([]));
const schemaKey = ref(0); // Force re-render when options change
const mfRef = ref(null);
const saving = ref(false);

const appId = Number(route.params.appId) || null;

const formIsValid = ref(false);
const canSubmit = computed(() => formIsValid.value);

// ────────────────────────────────────────────────────────────────────────────
// DIVE CENTERS
// ────────────────────────────────────────────────────────────────────────────

async function getDivingCenters() {
    divingLoader.value = true;
    try {
        const LICENSED_DIVE_CENTERS_BASIC = import.meta.env.VITE_LICENSED_DIVE_CENTERS_BASIC;
        const response = await apiGet(LICENSED_DIVE_CENTERS_BASIC);
        // Backend returns localized name based on request locale
        console.log('Diving centers response:', response);
        diveCenters.value = response.diveCenters || [];
        console.log('Diving centers assigned:', diveCenters.value);
    } catch (err) {
        capture(err, {
            context: 'AddContract.getDivingCenters',
            fallback: 'Failed to load diving centers'
        });
    } finally {
        divingLoader.value = false;
    }
}

// ────────────────────────────────────────────────────────────────────────────
// FORM HANDLERS
// ────────────────────────────────────────────────────────────────────────────

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

async function onSubmit({ formData }) {
  if (saving.value) return;
  
  if (!appId) {
    notifyError('Application ID is missing');
    return;
  }

  try {
    saving.value = true;
    
    // Add contract
    await addContract(appId, formData);
    
    notifySuccess(t('Contract added successfully'));
    router.push({ 
      name: 'app-summary', 
      params: { appId, locale: locale.value } 
    });
  } catch (e) {
    // 422 validation error - backend sends clear English messages
    if (e?.name === ERROR_TYPES.VALIDATION || e?.status === 422) {
      const errors = e.validationErrors || e.payload?.errors || {};
      mfRef.value?.applyServerErrors?.(errors);
      return;
    }

    // 409 conflict
    if (e?.status === 409) {
      const errors = e.payload?.errors || {};
      mfRef.value?.applyServerErrors?.(errors);
      return;
    }

    // 404 application not found
    if (e?.status === 404) {
      router.replace({ name: 'error-404' });
      return;
    }

    // 500+ server error
    if (e?.status >= 500) {
      router.replace({ name: 'server-error' });
      return;
    }

    // Unexpected error
    capture(e, {
      context: 'AddContract.submit',
      fallback: 'Failed to add contract',
      meta: { appId, originalError: e?.message }
    });
    notifyError(t('Failed to add contract'));
  } finally {
    saving.value = false;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// LIFECYCLE
// ────────────────────────────────────────────────────────────────────────────

onMounted(async () => {
  if (!appId) {
    router.replace({ name: 'applications-index', params: { locale: locale.value } });
    return;
  }

  try {
    // Load dive centers first
    await getDivingCenters();
    
    // Update schema with dive centers and force re-render
    schema.value = makePDContractSchema(diveCenters.value);
    schemaKey.value++; // Increment key to force MasterForm re-render
    
    // Load application to check stage/permissions
    await store.loadApplication(appId);
    
    if (!application.value) {
      router.replace({ name: 'error-404', params: { locale: locale.value } });
      return;
    }

    // Guard: only allow applicant-editable stages
    if (!canModifyApplication.value) {
      notifyError(t('Application cannot be modified'));
      router.replace({
        name: 'app-summary',
        params: { appId, locale: locale.value }
      });
      return;
    }

    setHeading({
      title: 'Add Work Contract',
      visible: true
    });
  } catch (err) {
    capture(err, {
      context: 'AddContract.onMounted',
      fallback: 'Failed to load application',
      meta: { appId }
    });
    
    notifyError(t('Failed to load application'));
    router.replace({ name: 'applications-index', params: { locale: locale.value } });
  }
});
</script>

<!--
VERSION: 1.0.0

ARCHITECTURE:
===========
- usePDApplicationsApi: Pure API calls (addContract)
- useApplicationStore: State management (loadApplication, canModifyApplication)
- AddContract: Form handling and validation

FLOW:
=====
1. Mount → Load application → Check if editable
2. User fills form
3. Submit → addContract(appId, formData)
4. Reload application → store.loadApplication(appId)
5. Navigate to app-summary

NOTES:
======
- Contract copy is required (file upload)
- Only works when application stage allows modifications
- Backend validates all fields
- Uses MasterForm for schema-driven form handling
-->
