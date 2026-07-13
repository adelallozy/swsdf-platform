<!-- FILE: src/v3/components/applications/cards/UserProfileCard.vue -->
<!-- VERSION: 1.0.0 -->
<!-- Self-validating card that reads from centralized store -->

<template>
  <div v-if="visibleComponent" data-step-id="user_profile">
    <!-- Header ABOVE and OUTSIDE the card -->
    <div class="tw-mb-2 tw-flex tw-items-center tw-justify-between">
      <div class="tw-flex tw-items-center tw-gap-2">
        <i class="pi pi-user tw-text-primary" aria-hidden="true"></i>
        <span class="tw-font-bold tw-text-slate-700 tw-text-xl">{{ $t('User Profile') }}</span>
        
        <!-- Status indicator -->
        <div
          v-if="profileStatus"
          :class="statusClass"
          class="tw-flex tw-items-center tw-gap-1 tw-px-2 tw-py-1 tw-text-xs tw-font-medium tw-rounded-full"
        >
          <i :class="statusIcon" aria-hidden="true"></i>
          <span>{{ profileStatusMessage }}</span>
        </div>
      </div>

      <!-- Edit (visible only when allowed) -->
    <RouterLink
    v-if="canEdit"
    :to="{
      name: 'user-profile-edit',
      params: {
        appId: store.application.value.id,
        locale: locale.value
      }
    }"
    class="tw-inline-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 tw-text-sm tw-font-medium tw-text-primary hover:tw-bg-primary/10 tw-rounded-lg tw-transition"
    >
    <i class="pi pi-pencil" aria-hidden="true"></i>
    {{ $t('Edit Profile') }}
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
    <div v-if="displayedProfile" class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-p-5">
      <div class="tw-grid sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-4">
        <!-- Full Name (Arabic) -->
        <div v-if="displayedProfile.name_ar">
          <div class="tw-text-xs tw-text-slate-500">{{ $t('Full Name (Arabic)') }}</div>
          <div class="tw-font-medium">{{ displayedProfile.name_ar }}</div>
        </div>

        <!-- Full Name (English) -->
        <div v-if="displayedProfile.name_en">
          <div class="tw-text-xs tw-text-slate-500">{{ $t('Full Name (English)') }}</div>
          <div class="tw-font-medium">{{ displayedProfile.name_en }}</div>
        </div>

        <!-- Identity Number -->
        <div v-if="displayedProfile.identity_number">
          <div class="tw-text-xs tw-text-slate-500">{{ $t('Identity Number') }}</div>
          <div class="tw-font-medium">{{ displayedProfile.identity_number }}</div>
        </div>

        <!-- Birth Date -->
        <div v-if="displayedProfile.birthdate">
          <div class="tw-text-xs tw-text-slate-500">{{ $t('Birth Date') }}</div>
          <div class="tw-font-medium">{{ displayedProfile.birthdate }}</div>
        </div>

        <!-- Gender -->
        <div v-if="displayedProfile.gender">
          <div class="tw-text-xs tw-text-slate-500">{{ $t('Gender') }}</div>
          <div class="tw-font-medium">{{ displayedGender }}</div>
        </div>

        <!-- Blood Type -->
        <div v-if="displayedProfile.blood_type">
          <div class="tw-text-xs tw-text-slate-500">{{ $t('Blood Type') }}</div>
          <div class="tw-font-medium">{{ displayedProfile.blood_type }}</div>
        </div>

        <!-- Nationality -->
        <div v-if="displayedProfile.nationality">
          <div class="tw-text-xs tw-text-slate-500">{{ $t('Nationality') }}</div>
          <div class="tw-font-medium">{{ displayedProfile.nationality }}</div>
        </div>

        <!-- Mobile -->
        <div v-if="displayedProfile.mobile">
          <div class="tw-text-xs tw-text-slate-500">{{ $t('Mobile') }}</div>
          <div class="tw-font-medium">{{ displayedProfile.mobile }}</div>
        </div>

        <!-- Email -->
        <div v-if="displayedProfile.email">
          <div class="tw-text-xs tw-text-slate-500">{{ $t('Email') }}</div>
          <div class="tw-font-medium">{{ displayedProfile.email }}</div>
        </div>

        <!-- City -->
        <div v-if="displayedProfile.city_name">
          <div class="tw-text-xs tw-text-slate-500">{{ $t('City') }}</div>
          <div class="tw-font-medium">{{ displayedProfile.city_name }}</div>
        </div>

        <!-- Region -->
        <div v-if="displayedProfile.region_name">
          <div class="tw-text-xs tw-text-slate-500">{{ $t('Region') }}</div>
          <div class="tw-font-medium">{{ displayedProfile.region_name }}</div>
        </div>

        <!-- Address -->
        <div v-if="displayedProfile.address">
          <div class="tw-text-xs tw-text-slate-500">{{ $t('Address') }}</div>
          <div class="tw-font-medium">{{ displayedProfile.address }}</div>
        </div>

        <!-- Short Address -->
        <div v-if="displayedProfile.short_address">
          <div class="tw-text-xs tw-text-slate-500">{{ $t('Short Address') }}</div>
          <div class="tw-font-medium">{{ displayedProfile.short_address }}</div>
        </div>
      </div>

      <!-- Document Links Section -->
      <div v-if="hasDocumentLinks" class="tw-mt-4 tw-pt-4 tw-border-t tw-border-slate-200">
        <div class="tw-text-xs tw-font-semibold tw-text-slate-700 tw-mb-3">{{ $t('Documents') }}</div>
        <div class="tw-grid sm:tw-grid-cols-3 tw-gap-4">
          <!-- Identity Link -->
          <div v-if="displayedProfile.identity_link">
            <a
              :href="displayedProfile.identity_link"
              target="_blank"
              rel="noopener noreferrer"
              class="tw-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 tw-bg-slate-50 tw-text-slate-700 tw-rounded-lg hover:tw-bg-slate-100 tw-transition"
            >
              <i class="pi pi-id-card" aria-hidden="true"></i>
              <span>{{ $t('Identity Document') }}</span>
            </a>
          </div>

          <!-- CV Link -->
          <div v-if="displayedProfile.cv_link">
            <a
              :href="displayedProfile.cv_link"
              target="_blank"
              rel="noopener noreferrer"
              class="tw-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 tw-bg-slate-50 tw-text-slate-700 tw-rounded-lg hover:tw-bg-slate-100 tw-transition"
            >
              <i class="pi pi-file-pdf" aria-hidden="true"></i>
              <span>{{ $t('CV') }}</span>
            </a>
          </div>

          <!-- Medical Examination Link -->
          <div v-if="displayedProfile.medical_examination_link">
            <a
              :href="displayedProfile.medical_examination_link"
              target="_blank"
              rel="noopener noreferrer"
              class="tw-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 tw-bg-slate-50 tw-text-slate-700 tw-rounded-lg hover:tw-bg-slate-100 tw-transition"
            >
              <i class="pi pi-file-medical" aria-hidden="true"></i>
              <span>{{ $t('Medical Examination') }}</span>
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-p-5">
      <div class="tw-text-center tw-py-8">
        <i class="pi pi-user tw-text-4xl tw-text-slate-300 tw-mb-3" aria-hidden="true"></i>
        <p class="tw-text-slate-500">{{ $t('No user profile information available') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useLoading } from '@/v3/composables/useLoading.js';
import { useApplicationStore } from '@/v3/composables/application/useApplicationStore.js';
import { getUserProfileSummaryErrors } from '@/v3/schema/userProfile.js';

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

// Determine which profile to display
const displayedProfile = computed(() => {
    return store.payload.user_profile.value;
});

const displayedGender = computed(() => {
    const raw = displayedProfile.value?.gender;
    const normalized = String(raw || '').trim().toLowerCase();

    if (normalized === 'male') {
        return t('Male');
    }
    if (normalized === 'female') {
        return t('Female');
    }

    return raw;
});

// Determine profile status
// Returns: 'active' (verified) or 'unverified' (pending)
const profileStatus = computed(() => {
    if (store.payload.user_profile.value) {
        const status = store.payload.user_profile.value.status;
        const statusLower = String(store.payload.user_profile.value.status).toLowerCase();
        if (statusLower === 'active' || statusLower === 'verified') {
            return 'active'; // Verified profile
        }
        if (statusLower === 'unverified') {
            return 'unverified'; // Unverified profile
        }
    }
    return null; // No profile
});

// User-friendly status message
const profileStatusMessage = computed(() => {
    const status = profileStatus.value;
    if (status === 'unverified') {
        return t('Unverified');
    }
    if (status === 'active') {
        return t('Verified');
    }
    return null;
});

const canEdit = computed(() => store.canModifyApplication.value);

 
const visibleComponent = computed(() => {
    if (canEdit.value) { return true ; }
    return !!store.payload.user_profile.value;
});

// Status styling
const statusClass = computed(() => {
    const status = String(profileStatus.value || '').toLowerCase();
    return status === 'active'
        ? 'tw-bg-green-50 tw-text-green-700'
        : 'tw-bg-amber-50 tw-text-amber-700';
});

const statusIcon = computed(() => {
    const status = String(profileStatus.value || '').toLowerCase();
    return status === 'active'
        ? 'pi pi-check-circle'
        : 'pi pi-clock';
});

// Check if profile has document links
const hasDocumentLinks = computed(() => {
    if (!displayedProfile.value) {
        return false;
    }
    return !!(displayedProfile.value.identity_link ||
                displayedProfile.value.cv_link ||
                displayedProfile.value.medical_examination_link);
});

// ────────────────────────────────────────────────────────────────────────────
// VALIDATION
// ────────────────────────────────────────────────────────────────────────────

const validationErrors = computed(() => {
  // Only validate if we can edit the profile
  if (!canEdit.value) {
    return [];
  }

  return getUserProfileSummaryErrors(displayedProfile.value, t);
});

// Watch validation and sync with store
watch(
  validationErrors,
  (errors) => {
    if (errors.length > 0) {
      store.setStepError('user_profile', errors);
    } else {
      store.deleteStepError('user_profile');
    }
  },
  { immediate: true }
);

// ────────────────────────────────────────────────────────────────────────────
// ACTIONS
// ────────────────────────────────────────────────────────────────────────────

function editProfile() {
  router.push({
    name: 'user-profile-edit',
    params: { 
      appId: store.application.value.id, 
      locale: locale.value 
    }
  });
}

store.registerStepPrimaryAction('user_profile', editProfile);

// ────────────────────────────────────────────────────────────────────────────
// CLEANUP
// ────────────────────────────────────────────────────────────────────────────

import { RouterLink } from 'vue-router';
onBeforeUnmount(() => {
  store.unregisterStepPrimaryAction('user_profile');
  store.deleteStepError('user_profile');
});
</script>
