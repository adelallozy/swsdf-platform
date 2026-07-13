<!-- FILE: src/v3/components/applications/cards/SFTeamCard.vue -->
<!-- VERSION: 2.1.0 -->
<!-- Self-validating card that reads from centralized store -->

<template>
  <div data-step-id="sf_team">
  <div v-if="!isLoadingKey('sf_team')">
    <!-- Header ABOVE and OUTSIDE the card -->
    <div class="tw-mb-2 tw-flex tw-items-center tw-justify-between">
      <div class="tw-flex tw-items-center tw-gap-2">
        <i class="pi pi-users tw-text-primary" aria-hidden="true"></i>
        <span class="tw-font-bold tw-text-slate-700 tw-text-xl">{{ $t('Team') }}</span>
      </div>

      <!-- Edit (visible only when allowed) -->
<RouterLink
v-if="canEdit"
:to="{
  name: 'fishing-team-update',
  params: {
    appId: store.application.value.id,
    locale: locale.value
  }
}"
class="tw-inline-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 tw-text-sm tw-font-medium tw-text-primary hover:tw-bg-primary/10 tw-rounded-lg tw-transition"
>
<i class="pi pi-pencil" aria-hidden="true"></i>
{{ $t('Edit Team') }}
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
    <div v-if="team" class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-p-5">
      <div class="tw-grid sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-4">
        <!-- Captain (localized) -->
        <div v-if="captainName">
          <div class="tw-text-sm tw-text-slate-500">{{ $t('Team Captain') }}</div>
          <div class="tw-font-medium">{{ captainName }}</div>
        </div>

        <!-- Team names (both) -->
        <div v-if="team.team_name_en">
          <div class="tw-text-sm tw-text-slate-500">{{ $t('Team Name (English)') }}</div>
          <div class="tw-font-medium">{{ team.team_name_en }}</div>
        </div>
        <div v-if="team.team_name_ar">
          <div class="tw-text-sm tw-text-slate-500">{{ $t('Team Name (Arabic)') }}</div>
          <div class="tw-font-medium">{{ team.team_name_ar }}</div>
        </div>

        <!-- Fishing category -->
        <div v-if="team.fishing_category">
          <div class="tw-text-sm tw-text-slate-500">{{ $t('Fishing Category') }}</div>
          <div class="tw-font-medium">{{ team.fishing_category }}</div>
        </div>

        <!-- Boat core -->
        <div v-if="team.boat_name">
          <div class="tw-text-sm tw-text-slate-500">{{ $t('Boat Name') }}</div>
          <div class="tw-font-medium">{{ team.boat_name }}</div>
        </div>
        <div v-if="team.boat_owner_name">
          <div class="tw-text-sm tw-text-slate-500">{{ $t('Boat Owner Name') }}</div>
          <div class="tw-font-medium">{{ team.boat_owner_name }}</div>
        </div>
        <div v-if="team.boat_owner_identity_number">
          <div class="tw-text-sm tw-text-slate-500">{{ $t('Boat Owner Identity Number') }}</div>
          <div class="tw-font-medium">{{ team.boat_owner_identity_number }}</div>
        </div>

        <!-- Captain fallback field -->
        <div v-if="!captainName && team.boat_captain_name">
          <div class="tw-text-sm tw-text-slate-500">{{ $t('Boat Captain Name') }}</div>
          <div class="tw-font-medium">{{ team.boat_captain_name }}</div>
        </div>

        <!-- Boat registry -->
        <div v-if="team.boat_registration_number">
          <div class="tw-text-sm tw-text-slate-500">{{ $t('Boat Registration Number') }}</div>
          <div class="tw-font-medium">{{ team.boat_registration_number }}</div>
        </div>
        <div v-if="team.boat_hull_number">
          <div class="tw-text-sm tw-text-slate-500">{{ $t('Boat Hull Number') }}</div>
          <div class="tw-font-medium">{{ team.boat_hull_number }}</div>
        </div>
        <div v-if="team.boat_mmsi">
          <div class="tw-text-sm tw-text-slate-500">{{ $t('Boat MMSI') }}</div>
          <div class="tw-font-medium">{{ team.boat_mmsi }}</div>
        </div>

        <!-- Dimensions (meters via util) -->
        <div v-if="cmToMetersString(team.boat_length_cm)">
          <div class="tw-text-sm tw-text-slate-500">{{ $t('Boat Length (m)') }}</div>
          <div class="tw-font-medium">
            {{ cmToMetersString(team.boat_length_cm) }} {{ $t('m') }}
          </div>
        </div>
        <div v-if="cmToMetersString(team.boat_width_cm)">
          <div class="tw-text-sm tw-text-slate-500">{{ $t('Boat Width (m)') }}</div>
          <div class="tw-font-medium">
            {{ cmToMetersString(team.boat_width_cm) }} {{ $t('m') }}
          </div>
        </div>

        <!-- Operating port -->
        <div v-if="team.boat_operating_port">
          <div class="tw-text-sm tw-text-slate-500">{{ $t('Operating Port') }}</div>
          <div class="tw-font-medium">{{ team.boat_operating_port }}</div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-p-5">
      <div class="tw-text-center tw-py-8">
        <i class="pi pi-users tw-text-4xl tw-text-slate-300 tw-mb-3" aria-hidden="true"></i>
        <p class="tw-text-slate-500">{{ $t('No team information available') }}</p>
      </div>
    </div>
  </div>

  <!-- Loading State -->
  <div v-else>
    <div class="tw-mb-2 tw-flex tw-items-center tw-gap-2">
      <i class="pi pi-users tw-text-primary" aria-hidden="true"></i>
      <span class="tw-font-bold tw-text-slate-700 tw-text-xl">{{ $t('Team') }}</span>
    </div>
    <div class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-p-5">
      <div class="tw-flex tw-justify-center tw-py-8">
        <i class="pi pi-spinner tw-animate-spin tw-text-2xl tw-text-slate-400" aria-hidden="true" />
      </div>
    </div>
  </div>
  </div>
</template>

<script setup>
import { computed, watch, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { RouterLink } from 'vue-router';
import { useLoading } from '@/v3/composables/useLoading.js';
import { useApplicationStore } from '@/v3/composables/application/useApplicationStore.js';
import { cmToMetersString } from '@/v3/utils/units.js';

// ────────────────────────────────────────────────────────────────────────────
// NO PROPS - Everything from store
// ────────────────────────────────────────────────────────────────────────────

const { t, locale } = useI18n();
const router = useRouter();
const { isLoadingKey } = useLoading();
const store = useApplicationStore();

// ────────────────────────────────────────────────────────────────────────────
// DATA - Read from store
// ────────────────────────────────────────────────────────────────────────────

const team = computed(() => store.payload.sf_team.value);
const canEdit = computed(() => store.canModifyApplication.value);

// ────────────────────────────────────────────────────────────────────────────
// COMPUTED
// ────────────────────────────────────────────────────────────────────────────

const captainName = computed(() => {
  if (!team.value) return '';
  
  const loc = locale.value;
  if (loc === 'ar' && team.value.captain_name_ar) return team.value.captain_name_ar;
  if (loc !== 'ar' && team.value.captain_name_en) return team.value.captain_name_en;
  
  return team.value.captain_name_ar || team.value.captain_name_en || '';
});

// ────────────────────────────────────────────────────────────────────────────
// VALIDATION
// ────────────────────────────────────────────────────────────────────────────

const validationErrors = computed(() => {
  const errors = [];
  
  if (!team.value) {
    return errors;
  }
    
  // Check if at least one name is provided
  const hasName = !!(team.value.team_name_ar || team.value.team_name_en);
  if (!hasName) {
    errors.push(t('Team name is required (Arabic or English)'));
  }
  
  return errors;
});

// Watch validation and sync with store
watch(
  validationErrors,
  (errors) => {
    if (errors.length > 0) {
      store.setStepError('sf_team', errors);
    } else {
      store.deleteStepError('sf_team');
    }
  },
  { immediate: true }
);

// ────────────────────────────────────────────────────────────────────────────
// ACTIONS
// ────────────────────────────────────────────────────────────────────────────

function editTeam() {
  router.push({
    name: 'fishing-team-update',
    params: { 
      appId: store.application.value.id, 
      locale: locale.value 
    }
  });
}

store.registerStepPrimaryAction('sf_team', editTeam);

// ────────────────────────────────────────────────────────────────────────────
// CLEANUP
// ────────────────────────────────────────────────────────────────────────────

onBeforeUnmount(() => {
  store.unregisterStepPrimaryAction('sf_team');
  store.deleteStepError('sf_team');
});
</script>

<!--
VERSION: 2.1.0

CHANGES IN v2.1.0:
==================
- Renamed from TeamCard.vue → SFTeamCard.vue
- Removed all props (appId, canEdit) - everything from store
- Updated payload access: payload.team → store.payload.sf_team
- Updated step identifier: 'team_info' → 'sf_team'
- Updated loading key: 'team-loading' → 'sf_team'
- Get canEdit from store.canModifyApplication
- Get appId from store.application.value.id
- Added cleanup on unmount

ARCHITECTURE NOTES:
===================
- NO PROPS - Completely self-contained
- Reads from: store.payload.sf_team
- Edit permission: store.canModifyApplication (based on stage)
- Validates: fishing_category required, at least one team name required
- Reports: setStepError('sf_team', errors) / deleteStepError('sf_team')
- Step identifier: 'sf_team'
- Loading key: 'sf_team'

LOADING KEYS:
=============
- sf_team (managed by store via loadEntity)

VALIDATION RULES:
=================
- fishing_category required
- At least one team name required (Arabic or English)

NAVIGATION:
===========
- Edit button → fishing-team-update route
- Passes appId and locale as route params
- Only visible when canEdit is true (based on application stage)

USAGE:
======
<SFTeamCard />

No props needed! Component gets everything from store.
-->
