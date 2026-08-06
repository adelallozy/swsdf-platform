<!-- VERSION: 2.4.0 -->
<!-- FILE: src/v3/pages/applications/sport-fishing/ParticipantAdd.vue -->
<!-- Add participant to sport fishing team - uses stateless API -->

<template>
  <div class="tw-pt-10 tw-pb-24 tw-px-4">
    <section
      class="tw-max-w-3xl tw-mx-auto tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-[0_8px_30px_rgba(3,87,150,.06)] tw-p-4 sm:tw-p-6 md:tw-p-8"
    >
      <!-- Page Title -->
      <div class="tw-mb-6">
        <h1 class="tw-text-2xl tw-font-bold tw-text-slate-800">
          {{ t('Add Participant') }}
        </h1>
        <p class="tw-text-sm tw-text-slate-600 tw-mt-1">
          {{ t('Enter athlete national ID to add to team') }}
        </p>
      </div>

      <!-- Info Notice -->
      <div class="tw-mb-6 tw-p-4 tw-bg-blue-50 tw-border tw-border-blue-200 tw-rounded-lg">
        <div class="tw-flex tw-gap-3">
          <i class="pi pi-info-circle tw-text-blue-600 tw-mt-0.5" aria-hidden="true"></i>
          <p class="tw-text-sm tw-text-blue-900">
            {{ t('Employment information (employee number and leave letter addressee) is optional and only required if you need official work leave permission to participate in this competition') }}
          </p>
        </div>
      </div>

      <!-- MasterForm -->
      <MasterForm
        ref="mfRef"
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
          <span v-if="!saving">{{ t('Add Participant') }}</span>
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

import { makeFishingParticipantSchema } from '@/v3/schema/applications/fishingParticipant.js';
import useEventsApplicationsApi from '@/v3/composables/application/useEventsApplicationsApi.js';
import { useApplicationStore } from '@/v3/composables/application/useApplicationStore.js';
import { useNotification } from '@/v3/composables/useNotification.js';
import { useErrorHandler } from '@/v3/composables/useErrorHandler.js';
import { ERROR_TYPES } from '@/v3/services/httpClient.js';
import usePageHeading from '@/v3/composables/layout/usePageHeading.js';

// ────────────────────────────────────────────────────────────────────────────
// COMPOSABLES
// ────────────────────────────────────────────────────────────────────────────

const { setHeading } = usePageHeading();
const route = useRoute();
const router = useRouter();
const { t, locale } = useI18n();
const { success: notifySuccess, error: notifyError } = useNotification();
const { capture } = useErrorHandler();

// Stateless API composable
const { sportFishingAddParticipant } = useEventsApplicationsApi();

// Store
const store = useApplicationStore();
const application = computed(() => store.application.value);
const canModifyApplication = computed(() => store.canModifyApplication.value);

// ────────────────────────────────────────────────────────────────────────────
// STATE
// ────────────────────────────────────────────────────────────────────────────

const schema = makeFishingParticipantSchema();
const mfRef = ref(null);
const saving = ref(false);

const appId = Number(route.params.appId) || null;

const formIsValid = ref(false);
const canSubmit = computed(() => formIsValid.value);

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
    
    // Add participant (returns participant directly, doesn't store)
    await sportFishingAddParticipant(appId, formData);
    
    // Reload participants list in store
    await store.loadEntity('sf_participants', true);
    
    notifySuccess(t('Participant added successfully'));
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

    // 409 conflict - backend sends clear English messages
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
      context: 'ParticipantAdd.submit',
      fallback: 'Failed to add participant',
      meta: { appId, originalError: e?.message }
    });
    notifyError(t('Failed to add participant'));
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
      title: 'Register New Participant',
      visible: true
    });
  } catch (err) {
    capture(err, {
      context: 'ParticipantAdd.onMounted',
      fallback: 'Failed to load application',
      meta: { appId }
    });
    
    notifyError(t('Failed to load application'));
    router.replace({ name: 'applications-index', params: { locale: locale.value } });
  }
});
</script>

<!--
VERSION: 2.4.0

CHANGES IN v2.4.0:
==================
- Updated to use sportFishingAddParticipant (renamed from addParticipant)
- Uses stateless API composable (returns data, doesn't store)
- After successful add, reloads sf_participants via store.loadEntity()
- Uses computed properties for application and canModifyApplication
- Added proper error handling in onMounted
- Uses $t() for all user-facing messages

ARCHITECTURE:
=============
- useEventsApplicationsApi: Pure API calls (sportFishingAddParticipant)
- useApplicationStore: State management (loadApplication, loadEntity)
- ParticipantAdd: Form handling and validation

FLOW:
=====
1. Mount → Load application → Check if editable
2. User fills form
3. Submit → sportFishingAddParticipant(appId, data)
4. Reload participants → store.loadEntity('sf_participants', true)
5. Navigate to app-summary

NOTES:
======
- Employment info (employee_num, leave_letter_addressee) is optional
- Only works when application stage allows modifications
- Backend validates athlete exists and has correct sport membership
-->
