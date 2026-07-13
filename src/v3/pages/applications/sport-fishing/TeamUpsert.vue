<!-- VERSION: 2.4.0 -->
<!-- FILE: src/v3/pages/applications/sport-fishing/TeamUpsert.vue -->
<!-- Team registration/update form - uses stateless API composable -->

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
        <h1 class="tw-text-2xl tw-font-bold tw-tw-slate-800">
          {{ isEdit ? t('Update Team Information') : t('Register Team for Competition') }}
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
        @submit="onSubmit"
        @validity="onValidity"
      />

      <!-- Actions -->
      <div class="tw-mt-6 tw-flex tw-justify-end tw-gap-4 tw-items-center">
        <!-- Cancel Link -->
        <router-link 
          v-if="isEdit"
          :to="{ name: 'app-summary', params: { appId, locale } }"
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

import { makeSportFishingTeamSchema } from '@/v3/schema/applications/sportFishingTeam.js';
import useAthleteApi from '@/v3/composables/useAthleteApi.js';
import useEventsApplicationsApi from '@/v3/composables/application/useEventsApplicationsApi.js';
import { useApplicationStore } from '@/v3/composables/application/useApplicationStore.js';
import { useNotification } from '@/v3/composables/useNotification.js';
import { useErrorHandler } from '@/v3/composables/useErrorHandler.js';
import { ERROR_TYPES } from '@/v3/services/httpClient.js';
import { cmToMetersString, metersStringToCmInt } from '@/v3/utils/units.js';
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
const { hasMembership } = useAthleteApi();
const store = useApplicationStore();

// Stateless API composable
const {
  fetchEvent,
  sportFishingCreateTeam,
  sportFishingUpdateTeam,
  loadApplicationFishingTeam
} = useEventsApplicationsApi();

// ────────────────────────────────────────────────────────────────────────────
// STATE
// ────────────────────────────────────────────────────────────────────────────

const schema = makeSportFishingTeamSchema();
const mfRef = ref(null);
const mfKey = ref(0);
const saving = ref(false);
const initializing = ref(true);
const eventData = ref(null); // Local state for event (not in store)

const eventId = Number(route.params.eventId) || null;
const appId = Number(route.params.appId) || null;

const isEdit = !!appId;

const formIsValid = ref(false);
const canSubmit = computed(() => formIsValid.value);

// Single-select safety for fishing_category
if (schema.fishing_category?.options) {
  schema.fishing_category.attrs = {
    ...(schema.fishing_category.attrs || {}),
    multiple: undefined,
    selectionMode: undefined,
    display: undefined
  };
}

// ────────────────────────────────────────────────────────────────────────────
// SCHEMA HELPERS
// ────────────────────────────────────────────────────────────────────────────

function castForSubmit(formData) {
  const out = { ...formData };
  if (Array.isArray(out.fishing_category)) out.fishing_category = out.fishing_category[0] || '';
  out.boat_length_cm = metersStringToCmInt(out.boat_length_cm);
  out.boat_width_cm = metersStringToCmInt(out.boat_width_cm);
  return out;
}

function fillSchema(data = {}) {
  Object.entries(schema).forEach(([k, f]) => {
    let v = data[k];
    if (k === 'fishing_category' && Array.isArray(v)) v = v[0] || '';
    if (k === 'boat_length_cm') v = cmToMetersString(v);
    if (k === 'boat_width_cm') v = cmToMetersString(v);

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

function crossFieldCheck(formData) {
  const ar = (formData.team_name_ar || '').trim();
  const en = (formData.team_name_en || '').trim();
  if (!ar && !en) {
    return {
      ok: false,
      errors: {
        team_name_ar: 'At least one team name is required',
        team_name_en: 'At least one team name is required'
      }
    };
  }
  return { ok: true };
}

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

// ────────────────────────────────────────────────────────────────────────────
// INITIALIZATION
// ────────────────────────────────────────────────────────────────────────────

async function initialize() {
  initializing.value = true;

  try {
    // ──────────────────────────────────────────────────────────────────────
    // CREATE MODE
    // ──────────────────────────────────────────────────────────────────────
    if (!isEdit) {
      if (!eventId) {
        notifyError('Event ID is missing');
        router.replace({ name: 'applications-index', params: { locale: locale.value } });
        return;
      }

      // Check membership
      try {
        const isMember = await hasMembership('sport_fishing');
        if (!isMember) {
          notifyError('You must register as a sport fishing athlete before registering a team');
          router.replace({ name: 'new-athlete', params: { locale: locale.value } });
          return;
        }
      } catch (e) {
        if (e?.status === 404) {
          notifyError('You must register as a sport fishing athlete before registering a team');
          router.replace({ name: 'new-athlete', params: { locale: locale.value } });
          return;
        }
        throw e;
      }

      // Fetch event (returns event directly, doesn't store)
      try {
        eventData.value = await fetchEvent(eventId);
      } catch (e) {
        if (e?.status === 404) {
          notifyError('Event not found');
          router.replace({ name: 'applications-index', params: { locale: locale.value } });
          return;
        }
        throw e;
      }

      // Check registration window
      if (!isRegistrationOpen(eventData.value)) {
        notifyError('Registration for this event is not currently open');
        router.replace({ 
          name: 'applications-index', 
          params: { locale: locale.value } 
        });
        return;
      }

      setHeading({
        title: 'Register Team Information',
        visible: true
      });
    }

    // ──────────────────────────────────────────────────────────────────────
    // EDIT MODE
    // ──────────────────────────────────────────────────────────────────────
    if (isEdit) {
      if (!appId) {
        notifyError('Application ID is missing');
        router.replace({ name: 'applications-index', params: { locale: locale.value } });
        return;
      }

      // Load application
      await store.loadApplication(appId);

      if (!store.application.value) {
        notifyError('Application not found');
        router.replace({ name: 'error-404', params: { locale: locale.value } });
        return;
      }

      // Check if editable
      if (!store.canModifyApplication.value) {
        notifyError('This application cannot be modified in its current stage');
        router.replace({ 
          name: 'app-summary', 
          params: { appId, locale: locale.value } 
        });
        return;
      }

      // Load team data (returns team directly, doesn't store)
      try {
        const teamData = await loadApplicationFishingTeam(appId);
        if (!teamData) throw Object.assign(new Error('Team not found'), { status: 404 });
        fillSchema(teamData);
      } catch (e) {
        if (e?.status === 404) {
          notifyError('Team not found');
          router.replace({ 
            name: 'app-summary', 
            params: { appId, locale: locale.value } 
          });
          return;
        }
        throw e;
      }

      setHeading({
        title: 'Update Team Information',
        visible: true
      });
    }
  } catch (e) {
    capture(e, {
      context: 'TeamUpsert.initialize',
      fallback: 'Failed to initialize team registration',
      meta: { isEdit, eventId, appId }
    });
    notifyError('Failed to load team registration page');
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

  const cross = crossFieldCheck(formData);
  if (!cross.ok) {
    mfRef.value?.applyServerErrors?.(cross.errors);
    return;
  }

  try {
    saving.value = true;
    const payload = castForSubmit(formData);

    // ──────────────────────────────────────────────────────────────────────
    // EDIT MODE
    // ──────────────────────────────────────────────────────────────────────
    if (isEdit) {
      await sportFishingUpdateTeam(appId, payload);
      notifySuccess(t('Team information updated successfully'));
      router.push({ name: 'app-summary', params: { appId, locale: locale.value } });
      return;
    }

    // ──────────────────────────────────────────────────────────────────────
    // CREATE MODE
    // ──────────────────────────────────────────────────────────────────────
    const res = await sportFishingCreateTeam(eventId, payload);
    const newAppId = res?.application?.id || null;

    if (!newAppId) {
      capture(new Error('Missing application id in response'), {
        context: 'TeamUpsert.onSubmit',
        fallback: 'Team created but application id missing',
        meta: { responseKeys: Object.keys(res || {}) }
      });
      notifyError(t('Team created but unable to navigate to application'));
      router.push({ name: 'applications-index', params: { locale: locale.value } });
      return;
    }

    notifySuccess(t('Team registered successfully'));
    router.push({ name: 'app-summary', params: { appId: newAppId, locale: locale.value } });

  } catch (e) {
    // 409: Already exists
    if (e?.status === 409) {
      const existingAppId = getConflictApplicationId(e);

      if (existingAppId) {
        notifyError(t('You already have a team registered for this event'));
        router.replace({ 
          name: 'app-summary', 
          params: { appId: Number(existingAppId), locale: locale.value } 
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

    // 404: Not found
    if (e?.status === 404) {
      router.replace({ name: 'error-404' });
      return;
    }

    // 500+: Server error
    if (e?.status >= 500) {
      router.replace({ name: 'server-error' });
      return;
    }

    // Unexpected
    capture(e, {
      context: 'TeamUpsert.onSubmit',
      fallback: 'Failed to save team',
      meta: { isEdit, eventId, appId }
    });
    notifyError(t('Failed to save team information'));
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
VERSION: 2.4.0

CHANGES IN v2.4.0:
==================
- Uses stateless API composable (no state storage in API layer)
- Event data stored locally in component (not in store)
- API functions return data directly
- Store only manages application entity state
- Clear separation: API = requests, Store = state, Component = UI

ARCHITECTURE:
=============
- useEventsApplicationsApi: Pure API calls, no state
- useApplicationStore: Application state management
- TeamUpsert: Local state for event data

CREATE MODE: /sport-fishing/team/register/:eventId
- Check membership → Fetch event → Verify registration open → Create team

EDIT MODE: /sport-fishing/team/update/:appId
- Load application → Check editable → Load team → Update team
-->
