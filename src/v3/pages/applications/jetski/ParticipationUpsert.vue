<!-- VERSION: 1.0.0 -->
<!-- FILE: src/v3/pages/applications/jetski/ParticipationUpsert.vue -->
<!-- Jetski participation registration/update form - uses stateless API composable -->

<template>
  <div class="tw-pt-10 tw-pb-24 tw-px-4">
    <!-- Loading State -->
    <div v-if="initializing" class="tw-flex tw-justify-center tw-py-16">
      <i class="pi pi-spinner tw-animate-spin tw-text-3xl tw-text-primary" aria-hidden="true" />
    </div>

    <!-- Form -->
    <section
      v-else
      class="tw-max-w-3xl tw-mx-auto tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-[0_8px_30px_rgba(3,87,150,.06)] tw-p-4 sm:tw-p-6 md:tw-p-8"
    >
      <!-- Page Title -->
      <div class="tw-mb-6">
        <h1 class="tw-text-2xl tw-font-bold tw-text-slate-800">
          {{ isEdit ? t('Update Competition Participation') : t('Jetski Competition Participation') }}
        </h1>
        <p v-if="eventData" class="tw-text-sm tw-text-slate-600 tw-mt-1">
          {{ eventData.title }}
        </p>
      </div>

      <!-- MasterForm -->
      <MasterForm
        :key="mfKey"
        ref="mfRef"
        :schema="schema"
        :formOptions="formOptions"
        @submit="onSubmit"
        @validity="onValidity"
      />

      <!-- Actions -->
      <div class="tw-mt-6 tw-flex tw-justify-end tw-gap-4 tw-items-center">
        <!-- Cancel Link -->
        <router-link
          v-if="isEdit"
          :to="{ name: 'application-home', params: { id: appId, locale } }"
          class="tw-inline-flex tw-items-center tw-gap-2 tw-text-slate-600 hover:tw-text-slate-900 tw-transition tw-font-medium"
        >
          <i class="pi pi-arrow-left" aria-hidden="true"></i>
          <span>{{ t('Cancel') }}</span>
        </router-link>

        <router-link
          v-else
          :to="{ name: 'applications-index', params: { locale } }"
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
          <span v-if="!saving">{{ t('Submit') }}</span>
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

import { makeJetskiParticipationSchema } from '@/v3/schema/applications/jetskiParticipation.js';
import useAthleteApi from '@/v3/composables/useAthleteApi.js';
import useEventsApplicationsApi from '@/v3/composables/application/useEventsApplicationsApi.js';
import { useApplicationStore } from '@/v3/composables/application/useApplicationStore.js';
import { useNotification } from '@/v3/composables/useNotification.js';
import { useErrorHandler } from '@/v3/composables/useErrorHandler.js';
import { ERROR_TYPES } from '@/v3/services/httpClient.js';
import usePageHeading from '@/v3/composables/layout/usePageHeading.js';
import { getConflictApplicationId } from '@/v3/utils/applicationWorkflow.js';

// ────────────────────────────────────────────────────────────────────────────
// COMPOSABLES
// ────────────────────────────────────────────────────────────────────────────

const { setHeading } = usePageHeading();
const route = useRoute();
const router = useRouter();
const { t, locale } = useI18n();
const { success: notifySuccess, error: notifyError } = useNotification();
const { capture } = useErrorHandler();
const { fetchMyMemberships } = useAthleteApi();
const store = useApplicationStore();

// Stateless API composable
const {
  fetchEvent,
  jetskiCreateParticipation,
  jetskiUpdateParticipation,
  loadApplicationJetskiParticipation
} = useEventsApplicationsApi();

// ────────────────────────────────────────────────────────────────────────────
// STATE
// ────────────────────────────────────────────────────────────────────────────

const schema = makeJetskiParticipationSchema();
const formOptions = ref({ races: [] });
const mfRef = ref(null);
const mfKey = ref(0);
const saving = ref(false);
const initializing = ref(true);
const eventData = ref(null); // Local state for event (not in store)

const eventId = Number(route.params.event) || null;
const appId = Number(route.params.id) || null;

const isEdit = !!appId;

const formIsValid = ref(false);
const canSubmit = computed(() => formIsValid.value);

// ────────────────────────────────────────────────────────────────────────────
// SCHEMA HELPERS
// ────────────────────────────────────────────────────────────────────────────

function castForSubmit(formData) {
  const frmData = new FormData();
  frmData.append('racer_number', formData.racer_number ?? '');
  if (formData.work_leave) {
    frmData.append('work_leave', formData.work_leave);
  }
  (Array.isArray(formData.races) ? formData.races : []).forEach((race) => {
    frmData.append('races[]', race);
  });
  return frmData;
}

function fillSchema(data = {}) {
  Object.entries(schema).forEach(([k, f]) => {
    let v = data[k];
    if (k === 'races' && typeof v === 'string') {
      try {
        v = JSON.parse(v);
      } catch {
        v = [];
      }
    }

    f.value = (v === null || v === undefined)
      ? (Array.isArray(f.value) ? [] : '')
      : v;
  });

  try { mfRef.value?.hideErrors?.(); } catch {}
  mfKey.value += 1;
}

// ────────────────────────────────────────────────────────────────────────────
// VALIDATION
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

// ────────────────────────────────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────────────────────────────────

function isRegistrationOpen(event) {
  if (!event) return false;

  const now = new Date();

  if (!event.registration_starts_on || !event.registration_ends_on) {
    return true;
  }

  const registrationStart = new Date(event.registration_starts_on);
  const registrationEnd = new Date(event.registration_ends_on);

  return now >= registrationStart && now <= registrationEnd;
}

function redirectAway(message) {
  notifyError(message);
  router.replace({ name: 'applications-index', params: { locale: locale.value } });
}

// ────────────────────────────────────────────────────────────────────────────
// INITIALIZATION
// ────────────────────────────────────────────────────────────────────────────

async function requireAthleteMembership() {
  // Mirrors the API gate: any athlete row for the signed-in user is accepted.
  try {
    const memberships = await fetchMyMemberships();
    return Array.isArray(memberships) ? memberships.length > 0 : !!memberships;
  } catch (e) {
    if (e?.status === 404) return false;
    throw e;
  }
}

async function initialize() {
  initializing.value = true;

  try {
    // ──────────────────────────────────────────────────────────────────────
    // CREATE MODE
    // ──────────────────────────────────────────────────────────────────────
    if (!isEdit) {
      if (!eventId) {
        redirectAway(t('Event ID is missing'));
        return;
      }

      // Check athlete membership
      const isAthlete = await requireAthleteMembership();
      if (!isAthlete) {
        notifyError(t('You must register as a player first'));
        router.replace({ name: 'athlete-new-registration', params: { locale: locale.value } });
        return;
      }

      // Fetch event (returns event directly, doesn't store)
      try {
        eventData.value = await fetchEvent(eventId);
      } catch (e) {
        if (e?.status === 404) {
          redirectAway(t('Event not found'));
          return;
        }
        throw e;
      }

      if (!eventData.value) {
        redirectAway(t('Event not found'));
        return;
      }

      // Sport guard mirrors the API gate (canonical sport code)
      if (eventData.value.sport !== 'jetski') {
        redirectAway(t('Only Jetski Players Can participate'));
        return;
      }

      // Stage + registration window checks
      if (eventData.value.stage !== 'Registration' || !isRegistrationOpen(eventData.value)) {
        redirectAway(t('The competition is not open for registration'));
        return;
      }

      // Racing category options come from the event
      const races = Array.isArray(eventData.value.races) ? eventData.value.races : [];
      formOptions.value.races = races.map((race) => ({ label: race, value: race }));

      setHeading({
        title: 'Jetski Competition Participation',
        visible: true
      });
    }

    // ──────────────────────────────────────────────────────────────────────
    // EDIT MODE
    // ──────────────────────────────────────────────────────────────────────
    if (isEdit) {
      if (!appId) {
        redirectAway(t('Application ID is missing'));
        return;
      }

      // Load application
      await store.loadApplication(appId);

      if (!store.application.value) {
        notifyError(t('Application not found'));
        router.replace({ name: 'error-404', params: { locale: locale.value } });
        return;
      }

      // Check if editable
      if (!store.canModifyApplication.value) {
        notifyError(t('This application cannot be modified in its current stage'));
        router.replace({
          name: 'application-home',
          params: { appId, locale: locale.value }
        });
        return;
      }

      // Load participation data (returns jetskiParticipant directly)
      try {
        const participationData = await loadApplicationJetskiParticipation(appId);
        if (!participationData) throw Object.assign(new Error('Participation not found'), { status: 404 });
        fillSchema(participationData);
      } catch (e) {
        if (e?.status === 404) {
          notifyError(t('Participation details not found'));
          router.replace({
            name: 'application-home',
            params: { appId, locale: locale.value }
          });
          return;
        }
        throw e;
      }

      setHeading({
        title: 'Update Competition Participation',
        visible: true
      });
    }
  } catch (e) {
    capture(e, {
      context: 'JetskiParticipationUpsert.initialize',
      fallback: 'Failed to initialize jetski participation registration',
      meta: { isEdit, eventId, appId }
    });
    notifyError(t('Failed to load the registration page'));
    router.replace({ name: 'applications-index', params: { locale: locale.value } });
  } finally {
    initializing.value = false;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// SUBMIT HANDLER
// ────────────────────────────────────────────────────────────────────────────

async function onSubmit({ formData }) {
  if (saving.value) return;

  try {
    saving.value = true;
    const payload = castForSubmit(formData);

    // ──────────────────────────────────────────────────────────────────────
    // EDIT MODE
    // ──────────────────────────────────────────────────────────────────────
    if (isEdit) {
      await jetskiUpdateParticipation(appId, payload);
      notifySuccess(t('Participation updated successfully'));
      router.push({ name: 'application-home', params: { id: appId, locale: locale.value } });
      return;
    }

    // ──────────────────────────────────────────────────────────────────────
    // CREATE MODE
    // ──────────────────────────────────────────────────────────────────────
    const res = await jetskiCreateParticipation(eventId, payload);
    const newAppId = res?.application?.id || null;

    if (!newAppId) {
      capture(new Error('Missing application id in response'), {
        context: 'JetskiParticipationUpsert.onSubmit',
        fallback: 'Participation created but application id missing',
        meta: { responseKeys: Object.keys(res || {}) }
      });
      notifyError(t('Participation created but unable to navigate to application'));
      router.push({ name: 'applications-index', params: { locale: locale.value } });
      return;
    }

    notifySuccess(t('Participation registered successfully'));
    router.push({ name: 'application-home', params: { id: newAppId, locale: locale.value } });

  } catch (e) {
    // 409: Already exists
    if (e?.status === 409) {
      const existingAppId = getConflictApplicationId(e);

      if (existingAppId) {
        notifyError(t('You already have another Application'));
        router.replace({
          name: 'application-home',
          params: { id: Number(existingAppId), locale: locale.value }
        });
        return;
      }
    }

    // 422: Validation
    if (e?.name === ERROR_TYPES.VALIDATION || e?.status === 422) {
      const errors = e.validationErrors || e.payload?.errors || {};
      mfRef.value?.applyServerErrors?.(errors);
      return;
    }

    // 403: Registration closed (stage gate on the API)
    if (e?.status === 403) {
      notifyError(t('The competition is not open for registration'));
      return;
    }

    // 404: Not found
    if (e?.status === 404) {
      router.replace({ name: 'error-404', params: { locale: locale.value } });
      return;
    }

    // Unexpected (including 5xx — captured and surfaced as a toast)
    capture(e, {
      context: 'JetskiParticipationUpsert.onSubmit',
      fallback: 'Failed to save participation',
      meta: { isEdit, eventId, appId }
    });
    notifyError(t('Failed to save participation'));
  } finally {
    saving.value = false;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// LIFECYCLE
// ────────────────────────────────────────────────────────────────────────────

onMounted(initialize);
</script>

<!--
VERSION: 1.0.0

ARCHITECTURE:
============
- useEventsApplicationsApi: Pure API calls, no state
- useApplicationStore: Application state management (edit mode)
- ParticipationUpsert: Local state for event data

CREATE MODE: /app/:locale/applications/jetsky-competition-registration/:event
- Check athlete membership → Fetch event → Verify sport/stage/window → Create participation

EDIT MODE: /app/:locale/applications/:id/update-jetsky-competition-application/:event
- Load application → Check editable → Load participation → Update participation
-->
