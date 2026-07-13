<template>
  <div data-step-id="user_profile_picture">
    <div class="tw-mb-2 tw-flex tw-items-center tw-justify-between">
      <div class="tw-flex tw-items-center tw-gap-2">
        <i class="pi pi-image tw-text-primary" aria-hidden="true"></i>
        <span class="tw-font-bold tw-text-slate-700 tw-text-xl">{{ t('Personal Picture') }}</span>
        
        <!-- Status indicator -->
        <div
          v-if="portraitStatus"
          :class="statusClass"
          class="tw-flex tw-items-center tw-gap-1 tw-px-2 tw-py-1 tw-text-xs tw-font-medium tw-rounded-full"
        >
          <i :class="statusIcon" aria-hidden="true"></i>
          <span>{{ portraitStatusMessage }}</span>
        </div>
      </div>
      <router-link
        v-if="canModifyApplication"
        :to="editRoute"
        class="tw-inline-flex tw-items-center tw-gap-2 tw-text-sm tw-font-medium tw-text-primary hover:tw-text-primary-dark"
      >
        <i class="pi pi-pencil" aria-hidden="true"></i>
        {{ t('Edit photo') }}
      </router-link>
    </div>

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

    <section class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-p-6 tw-flex tw-justify-center">
      <div v-if="isLoadingKey('user_profile_picture')" class="tw-py-8">
        <ProgressSpinner style="width: 40px; height: 40px" />
      </div>

      <div v-else-if="portrait?.link" class="tw-relative">
        <img
          :src="imageUrl"
          :alt="t('Personal Picture')"
          class="tw-w-48 tw-h-60 tw-object-cover tw-rounded-lg tw-shadow-md"
        />
      </div>

      <div v-else class="tw-text-center tw-py-8 tw-text-slate-400">
        <i class="pi pi-image tw-text-4xl tw-mb-2" aria-hidden="true"></i>
        <p>{{ t('No photo uploaded') }}</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, watch, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import ProgressSpinner from 'primevue/progressspinner';
import { useLoading } from '@/v3/composables/useLoading.js';
import { useApplicationStore } from '@/v3/composables/application/useApplicationStore.js';
import { MEDIA_BASE_URL } from '@/v3/config/apiEndpoints.js';
import { useRouter } from 'vue-router';

const { t, locale } = useI18n();
const router = useRouter();
const store = useApplicationStore();
const { isLoadingKey } = useLoading();

const application = computed(() => store.application.value);
const canModifyApplication = computed(() => store.canModifyApplication.value);
const portrait = computed(() => store.payload.user_profile_picture.value);
const hasUploadedPhoto = computed(() => !!portrait.value?.link);

const imageUrl = computed(() => {
  const link = String(portrait.value?.link || '').trim();
  if (!link) return '';
  if (/^https?:\/\//i.test(link)) return link;
  return `${MEDIA_BASE_URL}${link}`;
});

// Determine portrait status
// Returns: 'active' (verified) or 'unverified' (pending/unverified)
const portraitStatus = computed(() => {
  if (store.payload.user_profile_picture.value) {
    const status = store.payload.user_profile_picture.value.status;
    const statusLower = String(status).toLowerCase();
    if (statusLower === 'verified' || statusLower === 'approved') {
      return 'active'; // Verified portrait
    }
    if (statusLower === 'unverified' || statusLower === 'pending') {
      return 'unverified'; // Unverified portrait
    }
  }
  return null; // No portrait
});

// User-friendly status message
const portraitStatusMessage = computed(() => {
  const status = portraitStatus.value;
  if (status === 'unverified') {
    return t('Unverified');
  }
  if (status === 'active') {
    return t('Verified');
  }
  return null;
});

// Status styling
const statusClass = computed(() => {
  const status = String(portraitStatus.value || '').toLowerCase();
  return status === 'active'
    ? 'tw-bg-emerald-50 tw-text-emerald-700'
    : 'tw-bg-amber-50 tw-text-amber-700';
});

const statusIcon = computed(() => {
  const status = String(portraitStatus.value || '').toLowerCase();
  return status === 'active'
    ? 'pi pi-check-circle'
    : 'pi pi-clock';
});

const editRoute = computed(() => ({
  name: 'applicant-personal-photo-upload',
  params: {
    appId: application.value?.id,
    locale: locale.value
  }
}));

const validationErrors = computed(() => {
  const errors = [];

  if (!canModifyApplication.value) {
    return errors;
  }

  if (!hasUploadedPhoto.value) {
    errors.push(t('Personal photo is required'));
  }

  return errors;
});

watch(
  validationErrors,
  (errors) => {
    if (errors.length > 0) {
      store.setStepError('user_profile_picture', errors);
    } else {
      store.deleteStepError('user_profile_picture');
    }
  },
  { immediate: true }
);

function editPhoto() {
  router.push(editRoute.value);
}

watch(
  canModifyApplication,
  (canModify) => {
    if (canModify) {
      store.registerStepPrimaryAction('user_profile_picture', editPhoto);
      return;
    }

    store.unregisterStepPrimaryAction('user_profile_picture');
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  store.unregisterStepPrimaryAction('user_profile_picture');
  store.deleteStepError('user_profile_picture');
});
</script>
