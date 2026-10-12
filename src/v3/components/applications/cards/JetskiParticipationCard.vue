<!-- FILE: src/v3/components/applications/cards/JetskiParticipationCard.vue -->
<!-- VERSION: 1.0.0 -->
<!-- Self-validating card that loads its own data via pick-relatives -->

<template>
  <div data-step-id="jetski_participation">
    <!-- Loading State -->
    <div v-if="isLoadingKey('event-application-relatives')">
      <div class="tw-mb-2 tw-flex tw-items-center tw-gap-2">
        <i class="pi pi-user tw-text-primary" aria-hidden="true"></i>
        <span class="tw-font-bold tw-text-slate-700 tw-text-xl">{{ $t('Racer Information') }}</span>
      </div>
      <div class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-p-5">
        <div class="tw-flex tw-justify-center tw-py-8">
          <i class="pi pi-spinner tw-animate-spin tw-text-2xl tw-text-slate-400" aria-hidden="true" />
        </div>
      </div>
    </div>

    <div v-else>
      <!-- Header ABOVE and OUTSIDE the card -->
      <div class="tw-mb-2 tw-flex tw-items-center tw-justify-between">
        <div class="tw-flex tw-items-center tw-gap-2">
          <i class="pi pi-user tw-text-primary" aria-hidden="true"></i>
          <span class="tw-font-bold tw-text-slate-700 tw-text-xl">{{ $t('Racer Information') }}</span>
        </div>

        <!-- Edit (visible only when allowed) -->
        <RouterLink
          v-if="canEdit && participation"
          :to="{
            name: 'update-jetsky-competition-application',
            params: {
              id: store.application.value.id,
              event: store.application.value.target_id,
              locale: locale.value
            }
          }"
          class="tw-inline-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 tw-text-sm tw-font-medium tw-text-primary hover:tw-bg-primary/10 tw-rounded-lg tw-transition"
        >
          <i class="pi pi-pencil" aria-hidden="true"></i>
          {{ $t('Edit Participation') }}
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
      <div v-if="participation" class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-p-5">
        <div class="tw-grid sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-4">
          <!-- Competition -->
          <div v-if="eventTitle" class="sm:tw-col-span-2">
            <div class="tw-text-sm tw-text-slate-500">{{ $t('Competition') }}</div>
            <div class="tw-font-medium">{{ eventTitle }}</div>
          </div>

          <!-- Competition Dates -->
          <div v-if="eventDates">
            <div class="tw-text-sm tw-text-slate-500">{{ $t('Competition Dates') }}</div>
            <div class="tw-font-medium">{{ eventDates }}</div>
          </div>

          <!-- Racer Name -->
          <div v-if="racerName">
            <div class="tw-text-sm tw-text-slate-500">{{ $t('Racer Name') }}</div>
            <div class="tw-font-medium">{{ racerName }}</div>
          </div>

          <!-- Racer Number -->
          <div v-if="participation.racer_number">
            <div class="tw-text-sm tw-text-slate-500">{{ $t('Racer Number') }}</div>
            <div class="tw-font-medium">{{ participation.racer_number }}</div>
          </div>

          <!-- Work leave -->
          <div v-if="participation.work_leave">
            <div class="tw-text-sm tw-text-slate-500">{{ $t('Work leave') }}</div>
            <div class="tw-font-medium">{{ participation.work_leave }}</div>
          </div>

          <!-- Racing Categories (pills) -->
          <div v-if="races.length" class="sm:tw-col-span-2 lg:tw-col-span-3">
            <div class="tw-text-sm tw-text-slate-500">{{ $t('Racing Categories') }}</div>
            <ul class="tw-mt-1 tw-flex tw-flex-wrap tw-gap-2">
              <li
                v-for="(race, idx) in races"
                :key="idx"
                class="tw-inline-flex tw-items-center tw-rounded-full tw-bg-slate-100 tw-text-slate-700 tw-px-3 tw-py-1 tw-text-xs"
              >
                {{ race }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-p-5">
        <div class="tw-text-center tw-py-8">
          <i class="pi pi-user tw-text-4xl tw-text-slate-300 tw-mb-3" aria-hidden="true"></i>
          <p class="tw-text-slate-500">{{ $t('No participation information available') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { RouterLink } from 'vue-router';
import { useLoading } from '@/v3/composables/useLoading.js';
import { useApplicationStore } from '@/v3/composables/application/useApplicationStore.js';
import useEventsApplicationsApi from '@/v3/composables/application/useEventsApplicationsApi.js';

// ────────────────────────────────────────────────────────────────────────────
// NO PROPS - Everything from store + self-fetched relatives
// ────────────────────────────────────────────────────────────────────────────

const { t, locale } = useI18n();
const router = useRouter();
const { isLoadingKey } = useLoading();
const store = useApplicationStore();
const { pickEventApplicationRelatives } = useEventsApplicationsApi();

const participation = ref(null);
const event = ref(null);
const userProfile = ref(null);

const canEdit = computed(() => store.canModifyApplication.value);

// ────────────────────────────────────────────────────────────────────────────
// DATA LOADING
// ────────────────────────────────────────────────────────────────────────────

onMounted(async () => {
  const appId = store.application.value?.id;
  if (!appId) return;

  try {
    const res = await pickEventApplicationRelatives(appId);
    participation.value = res?.jetskiParticipant || null;
    event.value = res?.event || null;
    userProfile.value = res?.userProfile || null;
  } catch {
    // Network/authorization failures leave the card in its empty state;
    // the composable already captured the error.
  }
});

// ────────────────────────────────────────────────────────────────────────────
// COMPUTED
// ────────────────────────────────────────────────────────────────────────────

const eventTitle = computed(() => {
  if (!event.value) return '';
  return event.value.title || event.value.title_en || event.value.title_ar || '';
});

const eventDates = computed(() => {
  if (!event.value) return '';
  const start = event.value.starts_on || event.value.starts_at;
  const end = event.value.ends_on || event.value.ends_at;
  if (!start && !end) return '';
  return [start, end].filter(Boolean).join(' — ');
});

const racerName = computed(() => {
  if (!userProfile.value) return '';
  return locale.value === 'ar'
    ? (userProfile.value.name_ar || userProfile.value.name || userProfile.value.name_en || '')
    : (userProfile.value.name_en || userProfile.value.name || userProfile.value.name_ar || '');
});

const races = computed(() => {
  let raw = participation.value?.races;
  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw);
    } catch {
      raw = [];
    }
  }
  if (!Array.isArray(raw)) return [];
  return raw.map((r) => String(r || '').trim()).filter(Boolean);
});

// ────────────────────────────────────────────────────────────────────────────
// VALIDATION
// ────────────────────────────────────────────────────────────────────────────

const validationErrors = computed(() => {
  const errors = [];

  if (!participation.value) {
    errors.push(t('No participation information available'));
    return errors;
  }

  if (!participation.value.racer_number) {
    errors.push(t('Racer Number is required'));
  }

  if (races.value.length === 0) {
    errors.push(t('Select at least one racing category'));
  }

  return errors;
});

// Watch validation and sync with store
watch(
  validationErrors,
  (errors) => {
    if (errors.length > 0) {
      store.setStepError('jetski_participation', errors);
    } else {
      store.deleteStepError('jetski_participation');
    }
  },
  { immediate: true }
);

// ────────────────────────────────────────────────────────────────────────────
// ACTIONS
// ────────────────────────────────────────────────────────────────────────────

function editParticipation() {
  router.push({
    name: 'update-jetsky-competition-application',
    params: {
      id: store.application.value.id,
      event: store.application.value.target_id,
      locale: locale.value
    }
  });
}

store.registerStepPrimaryAction('jetski_participation', editParticipation);

// ────────────────────────────────────────────────────────────────────────────
// CLEANUP
// ────────────────────────────────────────────────────────────────────────────

onBeforeUnmount(() => {
  store.unregisterStepPrimaryAction('jetski_participation');
  store.deleteStepError('jetski_participation');
});
</script>

<!--
VERSION: 1.0.0

ARCHITECTURE NOTES:
===================
- NO PROPS - Completely self-contained
- Loads its own data: pickEventApplicationRelatives(appId) → event,
  userProfile, jetskiParticipant (the backend payload system does not yet
  expose a jetski participation key)
- Edit permission: store.canModifyApplication (based on stage)
- Validates: participation exists, racer number present, at least one race
- Reports: setStepError('jetski_participation', errors) / deleteStepError
- Step identifier: 'jetski_participation'
- Loading key: 'event-application-relatives'

NAVIGATION:
===========
- Edit button → update-jetsky-competition-application route
- Passes id, event (target_id) and locale as route params
- Only visible when canEdit is true (draft / applicant_revision)
-->
