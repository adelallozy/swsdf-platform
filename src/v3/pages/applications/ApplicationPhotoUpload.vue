<!-- VERSION: 1.0.0 | PATH: src/v3/pages/applications/ApplicationPhotoUpload.vue -->
<template>
  <div class="tw-pt-10 tw-pb-24 tw-px-4">
    <section
      class="tw-max-w-3xl tw-mx-auto tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-[0_8px_30px_rgba(3,87,150,.06)] tw-p-4 sm:tw-p-6 md:tw-p-8"
    >
      <!-- Page Title -->
      <div class="tw-mb-6">
        <h1 class="tw-text-2xl tw-font-bold tw-text-slate-800">
          {{ t('Upload personal photo') }}
        </h1>
        <p class="tw-text-sm tw-text-slate-600 tw-mt-1">
          {{ t('Your photo will be used on membership cards and application documents') }}
        </p>
      </div>

      <!-- Guidelines -->
      <div class="tw-mb-6 tw-rounded-xl tw-border tw-border-amber-200 tw-bg-amber-50 tw-p-4">
        <div class="tw-flex tw-items-start tw-gap-3">
          <i class="pi pi-camera tw-text-amber-600 tw-mt-0.5" aria-hidden="true"></i>
          <div>
            <p class="tw-text-amber-900 tw-font-semibold">
              {{ t('Photo requirements') }}
            </p>
            <ul class="tw-mt-2 tw-space-y-1 tw-text-sm tw-text-amber-900 tw-ps-5 tw-list-disc">
              <li v-for="tip in photoGuidelines" :key="tip">
                {{ t(tip) }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Loader -->
      <div v-if="initializing" class="tw-text-center tw-py-10">
        <ProgressSpinner style="width: 48px; height: 48px" />
        <p class="tw-text-sm tw-text-slate-500 tw-mt-3">
          {{ t('Loading application...') }}
        </p>
      </div>

      <!-- Form -->
      <div v-else>
        <MasterForm
          ref="mfRef"
          :schema="schema"
          @submit="onSubmit"
          @validity="onValidity"
        />

        <div class="tw-mt-6 tw-flex tw-justify-end tw-gap-4 tw-items-center">
          <router-link
            :to="backRoute"
            class="tw-inline-flex tw-items-center tw-gap-2 tw-text-slate-600 hover:tw-text-slate-900 tw-transition tw-font-medium"
          >
            <i class="pi pi-arrow-left" aria-hidden="true"></i>
            <span>{{ t('Cancel') }}</span>
          </router-link>

          <AppButton
            variant="primary"
            icon="pi pi-upload"
            :disabled="saving || !canSubmit"
            @click="submitProgrammatically"
          >
            <span v-if="!saving">{{ t('Upload photo') }}</span>
            <span v-else class="tw-inline-flex tw-items-center tw-gap-2">
              <span class="lds-dual-ring"></span>{{ t('Saving') }}
            </span>
          </AppButton>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import ProgressSpinner from 'primevue/progressspinner';
import { custom } from 'valibot';

import MasterForm from '@/v3/components/Forms/MasterForm.vue';
import AppButton from '@/v3/components/ui/AppButton.vue';

import { useApplicationStore } from '@/v3/composables/application/useApplicationStore.js';
import { useNotification } from '@/v3/composables/useNotification.js';
import { useErrorHandler } from '@/v3/composables/useErrorHandler.js';
import usePageHeading from '@/v3/composables/layout/usePageHeading.js';
import { apiPost, ERROR_TYPES } from '@/v3/services/httpClient.js';

const UPDATE_PORTRAIT_URL = import.meta.env.VITE_PROFESSIONAL_DIVERS_UPDATE_APPLICANT_PORTRAIT;

const route = useRoute();
const router = useRouter();
const { t, locale } = useI18n();
const { setHeading } = usePageHeading();
const { capture } = useErrorHandler();
const { success: notifySuccess, error: notifyError } = useNotification();

const store = useApplicationStore();
const application = computed(() => store.application.value);
const canModifyApplication = computed(() => store.canModifyApplication.value);

const appId = Number(route.params.appId ?? route.params.id) || null;

function buildSchema() {
  return {
    photo: {
      type: 'PhotoInput',
      label: 'Personal photo',
      placeholder: 'Drop your photo here or click to upload',
      value: null,
      required: true,
      attrs: {
        accept: 'image/png,image/webp,image/jpeg,image/jpg',
        aspectRatio: 100 / 125,
        canvasSize: { width: 512, height: 640 },
        previewSize: { width: 240, height: 300 },
      },
      validation: custom(
        (value) => value instanceof File,
        'Photo is required'
      )
    }
  };
}

const schema = ref(buildSchema());
const mfRef = ref(null);
const formIsValid = ref(false);
const saving = ref(false);
const initializing = ref(true);

const canSubmit = computed(() => formIsValid.value && canModifyApplication.value);
const backRoute = computed(() => ({
  name: 'application-home',
  params: { id: appId }
}));

const photoGuidelines = [
  'Facial features are fully visible from the front.',
  'Use a white background with even lighting.',
  'Avoid filters, hats, or sunglasses.'
];

watch(locale, () => {
  schema.value = buildSchema();
});

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
  if (saving.value || !appId) return;
  if (!formData?.photo) {
    notifyError(t('Photo is required'));
    return;
  }

  if (!UPDATE_PORTRAIT_URL) {
    capture(new Error('Missing applicant portrait endpoint'), {
      context: 'ApplicationPhotoUpload.submit',
      fallback: 'Upload endpoint missing',
      meta: { appId }
    });
    notifyError(t('Upload service is temporarily unavailable'));
    return;
  }

  const endpoint = `${UPDATE_PORTRAIT_URL}${appId}`;
  const payload = new FormData();
  payload.append('portrait_file', formData.photo);

  try {
    saving.value = true;
    await apiPost(endpoint, payload);

    // Refresh portrait entity if configured
    try {
      await store.loadEntity('portrait', true);
    } catch (_) {
      // Ignore if portrait entity not configured for this application
    }

    notifySuccess(t('Photo uploaded successfully'));
    router.push(backRoute.value);
  } catch (e) {
    if (e?.name === ERROR_TYPES.VALIDATION || e?.status === 422) {
      const errors = { ...(e.validationErrors || e.payload?.errors || {}) };
      if (errors.portrait_file && !errors.photo) {
        errors.photo = errors.portrait_file;
      }
      mfRef.value?.applyServerErrors?.(errors);
      return;
    }

    if (e?.status === 404) {
      router.replace({ name: 'error-404' });
      return;
    }

    if (e?.status >= 500) {
      router.replace({ name: 'server-error' });
      return;
    }

    capture(e, {
      context: 'ApplicationPhotoUpload.submit',
      fallback: 'Failed to upload applicant photo',
      meta: { appId, originalError: e?.message }
    });
    notifyError(t('Failed to upload photo'));
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  setHeading({
    title: 'Upload personal photo',
    visible: true
  });

  if (!appId) {
    notifyError(t('Application ID is missing'));
    router.replace({
      name: 'applications-index',
      params: { locale: route.params.locale || locale.value }
    });
    initializing.value = false;
    return;
  }

  try {
    await store.loadApplication(appId);

    if (!application.value) {
      router.replace({ name: 'error-404' });
      return;
    }

    if (!canModifyApplication.value) {
      notifyError(t('Application cannot be modified'));
      router.push(backRoute.value);
      return;
    }
  } catch (err) {
    capture(err, {
      context: 'ApplicationPhotoUpload.onMounted',
      fallback: 'Failed to load application',
      meta: { appId }
    });
    notifyError(t('Failed to load application'));
    router.replace({
      name: 'applications-index',
      params: { locale: route.params.locale || locale.value }
    });
    return;
  } finally {
    initializing.value = false;
  }
});
</script>
