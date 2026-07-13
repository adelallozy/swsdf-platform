<!-- FILE: src/v3/components/applications/cards/SFParticipantsCard.vue -->
<!-- VERSION: 2.1.0 -->
<!-- Self-validating card that reads from centralized store -->

<script setup>
import { computed, watch, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useConfirm } from 'primevue/useconfirm';

import { useLoading } from '@/v3/composables/useLoading.js';
import { useApplicationStore } from '@/v3/composables/application/useApplicationStore.js';
import useEventsApplicationsApi from '@/v3/composables/application/useEventsApplicationsApi.js';
import { useErrorHandler } from '@/v3/composables/useErrorHandler.js';
import { useNotification } from '@/v3/composables/useNotification.js';

// ────────────────────────────────────────────────────────────────────────────
// NO PROPS - Everything from store
// ────────────────────────────────────────────────────────────────────────────

const { t, locale } = useI18n();
const router = useRouter();
const confirm = useConfirm();
const { capture } = useErrorHandler();
const { error: notifyError } = useNotification();
const { isLoadingKey } = useLoading();
const store = useApplicationStore();

// ────────────────────────────────────────────────────────────────────────────
// DATA - Read from store
// ────────────────────────────────────────────────────────────────────────────

const participants = computed(() => store.payload.sf_participants.value || []);
const canEdit = computed(() => store.canModifyApplication.value);

// ────────────────────────────────────────────────────────────────────────────
// API (for delete only - no state management)
// ────────────────────────────────────────────────────────────────────────────

const api = useEventsApplicationsApi();

// ────────────────────────────────────────────────────────────────────────────
// VALIDATION CONFIG
// ────────────────────────────────────────────────────────────────────────────

const MIN_PARTICIPANTS = 3;
const MAX_PARTICIPANTS = 5;

// ────────────────────────────────────────────────────────────────────────────
// COMPUTED
// ────────────────────────────────────────────────────────────────────────────

const isAtMaximum = computed(() => {
  return participants.value.length >= MAX_PARTICIPANTS;
});

const isBelowMinimum = computed(() => {
  return participants.value.length < MIN_PARTICIPANTS;
});

// ────────────────────────────────────────────────────────────────────────────
// VALIDATION
// ────────────────────────────────────────────────────────────────────────────

const validationErrors = computed(() => {
  const errors = [];
  const count = participants.value.length;
  
  if (count < MIN_PARTICIPANTS) {
    errors.push(
      t('At least {min} participants are required. {current} of {min} have been added', {
        min: MIN_PARTICIPANTS,
        current: count
      })
    );
  }
  
  if (count > MAX_PARTICIPANTS) {
    errors.push(
      t('Maximum {max} participants allowed. Currently {current}', {
        max: MAX_PARTICIPANTS,
        current: count
      })
    );
  }
  
  return errors;
});

// Watch validation and sync with store
watch(
  validationErrors,
  (errors) => {
    if (errors.length > 0) {
      store.setStepError('sf_participants', errors);
    } else {
      store.deleteStepError('sf_participants');
    }
  },
  { immediate: true }
);

// ────────────────────────────────────────────────────────────────────────────
// METHODS
// ────────────────────────────────────────────────────────────────────────────

function getAthleteName(participant) {
  const loc = locale.value;
  
  if (loc === 'ar' && participant.name_ar) return participant.name_ar;
  if (loc === 'en' && participant.name_en) return participant.name_en;
  
  if (participant.name_ar) return participant.name_ar;
  if (participant.name_en) return participant.name_en;
  
  return `${t('Athlete')} #${participant.athlete_id}`;
}

function getRoleLabel(role) {
  if (!role) return '';
  
  const capitalized = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  
  return t(capitalized);
}

function confirmRemove(participant) {
  confirm.require({
    message: t('Are you sure you want to remove this participant?') + '\n' + getAthleteName(participant),
    header: t('Remove Participant?'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('Remove'),
    rejectLabel: t('Cancel'),
    acceptClass: 'p-button-danger',
    accept: () => removeParticipant(participant)
  });
}

async function removeParticipant(participant) {
  if (!participant?.id) return;
  
  try {
    await api.sportFishingDeleteParticipant(participant.id);
    
    // Reload payload to refresh participants
    await store.reloadApplicationPayload();
    
  } catch (err) {
    capture(err, { 
      fallback: 'Failed to remove participant', 
      context: 'SFParticipantsCard.removeParticipant', 
      meta: { 
        appId: store.application.value.id, 
        participantId: participant.id 
      } 
    });
    
    notifyError(t('Failed to remove participant. Please try again.'));
  }
}

function navigateToAdd() {
  router.push({
    name: 'fishing-participant-add',
    params: { 
      appId: store.application.value.id, 
      locale: locale.value 
    }
  });
}

store.registerStepPrimaryAction('sf_participants', navigateToAdd);

// ────────────────────────────────────────────────────────────────────────────
// CLEANUP
// ────────────────────────────────────────────────────────────────────────────

onBeforeUnmount(() => {
  store.unregisterStepPrimaryAction('sf_participants');
  store.deleteStepError('sf_participants');
});
</script>

<template>
  <div class="tw-space-y-8" data-step-id="sf_participants">
    <!-- Maximum Reached Notice -->
    <div v-if="canEdit && !isLoadingKey('sf_participants') && isAtMaximum">
      <div class="tw-mb-2 tw-flex tw-items-center tw-justify-between">
        <div class="tw-flex tw-items-center tw-gap-2">
          <i class="pi pi-users tw-text-primary" aria-hidden="true"></i>
          <span class="tw-font-bold tw-text-slate-700 tw-text-xl">
            {{ $t('Participants') }}
          </span>
        </div>
        
        <span class="tw-text-sm tw-font-medium tw-text-green-600">
          {{ participants.length }} / {{ MAX_PARTICIPANTS }}
        </span>
      </div>

      <div class="tw-p-4 tw-bg-green-50 tw-border tw-border-green-200 tw-rounded-lg">
        <div class="tw-flex tw-gap-2">
          <i class="pi pi-check-circle tw-text-green-600 tw-mt-0.5" aria-hidden="true"></i>
          <p class="tw-text-sm tw-text-green-900">
            {{ $t("Team is full; the maximum is 5 (team leader + four members)") }}
          </p>
        </div>
      </div>
    </div>

    <!-- Participant Cards -->
    <div
      v-for="(participant, index) in participants"
      :key="participant.id"
    >
      <div class="tw-mb-2 tw-flex tw-items-center tw-justify-between">
        <div class="tw-flex tw-items-center tw-gap-2">
          <i class="pi pi-user tw-text-primary" aria-hidden="true"></i>
          <span class="tw-font-bold tw-text-slate-700 tw-text-xl">
            {{ $t('Participant') }} {{ index + 1 }}
          </span>
        </div>

        <!-- Delete Button -->
        <button
          v-if="canEdit"
          type="button"
          :disabled="isLoadingKey(`participant-deleting-${participant.id}`)"
          class="tw-inline-flex tw-items-center tw-gap-2 tw-px-3 tw-py-1.5 tw-text-sm tw-font-medium tw-text-slate-600 hover:tw-text-red-600 tw-transition disabled:tw-opacity-50"
          :aria-label="$t('Remove participant') + ': ' + getAthleteName(participant)"
          @click="confirmRemove(participant)"
        >
          <i 
            :class="isLoadingKey(`participant-deleting-${participant.id}`) ? 'pi pi-spinner tw-animate-spin' : 'pi pi-trash'" 
            aria-hidden="true"
          ></i>
        </button>
      </div>

      <div class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-p-5">
        <div class="tw-grid sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-4">
          <div class="sm:tw-col-span-2">
            <div class="tw-text-sm tw-text-slate-500">{{ $t('Athlete Name') }}</div>
            <div class="tw-font-medium tw-text-slate-800">
              {{ getAthleteName(participant) }}
            </div>
          </div>

          <div v-if="participant.role">
            <div class="tw-text-sm tw-text-slate-500">{{ $t('Role') }}</div>
            <div class="tw-font-medium tw-text-slate-700">
              {{ getRoleLabel(participant.role) }}
            </div>
          </div>

          <div v-if="participant.employee_number">
            <div class="tw-text-sm tw-text-slate-500">{{ $t('Employee Number') }}</div>
            <div class="tw-font-medium tw-text-slate-700">
              {{ participant.employee_number }}
            </div>
          </div>

          <div v-if="participant.leave_responsible" class="sm:tw-col-span-2">
            <div class="tw-text-sm tw-text-slate-500">{{ $t('Leave letter addressee') }}</div>
            <div class="tw-font-medium tw-text-slate-700">
              {{ participant.leave_responsible }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Participant -->
    <div v-if="canEdit && !isLoadingKey('sf_participants') && !isAtMaximum">
      <div class="tw-mb-2 tw-flex tw-items-center tw-justify-between">
        <div class="tw-flex tw-items-center tw-gap-2">
          <i class="pi pi-users tw-text-primary" aria-hidden="true"></i>
          <span class="tw-font-bold tw-text-slate-700 tw-text-xl">
            {{ participants.length === 0 ? $t('Participants') : $t('Add Another Participant') }}
          </span>
        </div>
        
        <span class="tw-text-sm tw-text-slate-500 tw-font-medium">
          {{ participants.length }} / {{ MAX_PARTICIPANTS }}
        </span>
      </div>

      <!-- Minimum Warning -->
      <div 
        v-if="isBelowMinimum" 
        class="tw-mb-3 tw-p-3 tw-bg-amber-50 tw-border tw-border-amber-200 tw-rounded-lg"
      >
        <div class="tw-flex tw-gap-2">
          <i class="pi pi-info-circle tw-text-amber-600 tw-mt-0.5" aria-hidden="true"></i>
          <p class="tw-text-sm tw-text-amber-900">
            {{ $t("At least three participants are required. {current} of {min} have been added so far", { 
              min: MIN_PARTICIPANTS, 
              current: participants.length 
            }) }}
          </p>
        </div>
      </div>

      <!-- Add Button -->
      <button
        type="button"
        class="tw-block tw-w-full tw-bg-white tw-rounded-2xl tw-border-2 tw-border-dashed tw-border-slate-300 hover:tw-border-primary hover:tw-bg-blue-50 tw-shadow-sm tw-p-8 tw-transition"
        @click="navigateToAdd"
      >
        <div class="tw-flex tw-flex-col tw-items-center tw-gap-3">
          <div class="tw-w-12 tw-h-12 tw-rounded-full tw-bg-slate-100 hover:tw-bg-blue-100 tw-flex tw-items-center tw-justify-center tw-transition">
            <i class="pi pi-plus tw-text-xl tw-text-slate-600 hover:tw-text-primary tw-transition" aria-hidden="true"></i>
          </div>
          <span class="tw-text-slate-600 hover:tw-text-primary tw-font-medium tw-transition">
            {{ $t('Add Participant') }}
          </span>
        </div>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoadingKey('sf_participants')" class="tw-mb-2">
      <div class="tw-flex tw-items-center tw-gap-2 tw-mb-2">
        <i class="pi pi-users tw-text-primary" aria-hidden="true"></i>
        <span class="tw-font-bold tw-text-slate-700 tw-text-xl">
          {{ $t('Participants') }}
        </span>
      </div>
      <div class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-p-5">
        <div class="tw-flex tw-justify-center tw-py-8">
          <i class="pi pi-spinner tw-animate-spin tw-text-2xl tw-text-slate-400" aria-hidden="true" />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!isLoadingKey('sf_participants') && participants.length === 0 && !canEdit">
      <div class="tw-mb-2 tw-flex tw-items-center tw-gap-2">
        <i class="pi pi-users tw-text-primary" aria-hidden="true"></i>
        <span class="tw-font-bold tw-text-slate-700 tw-text-xl">
          {{ $t('Participants') }}
        </span>
      </div>
      <div class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-p-5">
        <div class="tw-text-center tw-py-8">
          <i class="pi pi-users tw-text-4xl tw-text-slate-300 tw-mb-3" aria-hidden="true"></i>
          <p class="tw-text-slate-500">{{ $t('No participants registered yet') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<!--
VERSION: 2.1.0

CHANGES IN v2.1.0:
==================
- Renamed from ParticipantsCard.vue → SFParticipantsCard.vue
- Removed all props (appId, canEdit) - everything from store
- Updated payload access: payload.participants → store.payload.sf_participants
- Updated step identifier: 'participants' → 'sf_participants'
- Updated loading key: 'participants-loading' → 'sf_participants'
- Get canEdit from store.canModifyApplication
- Get appId from store.application.value.id
- Updated reloadPayloadData → reloadApplicationPayload
- Added cleanup on unmount

ARCHITECTURE NOTES:
===================
- NO PROPS - Completely self-contained
- Reads from: store.payload.sf_participants
- Edit permission: store.canModifyApplication (based on stage)
- Validates: Min 3, Max 5 participants
- Reports: setStepError('sf_participants', errors) / deleteStepError('sf_participants')
- Step identifier: 'sf_participants'
- Loading key: 'sf_participants'

LOADING KEYS:
=============
- sf_participants (managed by store via loadEntity)
- participant-deleting-{id} (granular delete loading)

VALIDATION RULES:
=================
- Minimum 3 participants required
- Maximum 5 participants allowed

NAVIGATION:
===========
- Add button → fishing-participant-add route
- Passes appId and locale as route params
- Only visible when canEdit is true (based on application stage)

USAGE:
======
<SFParticipantsCard />

No props needed! Component gets everything from store.
-->
