<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import AppButton from '@/v3/components/ui/AppButton.vue';
import MasterForm from '@/v3/components/Forms/MasterForm.vue';

import { useApplicationStore } from '@/v3/composables/application/useApplicationStore.js';
import { useNotification } from '@/v3/composables/useNotification.js';
import { useErrorHandler } from '@/v3/composables/useErrorHandler.js';
import usePageHeading from '@/v3/composables/layout/usePageHeading.js';
import { useLoading } from '@/v3/composables/useLoading.js';
import { apiPost } from '@/v3/services/httpClient.js';

import { ATHLETES_UPDATE_SPORT } from '@/v3/config/apiEndpoints.js';
import {
  getAthleteSportCode,
  makeAthleteSportSchema,
  serializeAthleteSport
} from '@/v3/schema/applications/athleteSport.js';

const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();

const { setHeading } = usePageHeading();
const { success: notifySuccess, error: notifyError } = useNotification();
const { capture } = useErrorHandler();
const { withLoading, isLoadingKey } = useLoading();

const store = useApplicationStore();

const mfRef = ref(null);
const schema = ref(makeAthleteSportSchema());
const initialValues = ref({ sport: '' });
const formIsValid = ref(false);

const appId = Number(route.params.appId) || Number(route.params.id) || null;

const isRtl = computed(() => locale.value === 'ar');
const initializing = computed(() => isLoadingKey('athlete-sport-initializing'));
const saving = computed(() => isLoadingKey('athlete-sport-saving'));
const canSubmit = computed(() => formIsValid.value && !saving.value);
const saveIcon = computed(() => (saving.value ? 'pi-spinner pi-spin' : 'pi-check'));
const cancelIcon = computed(() => (isRtl.value ? 'pi-arrow-right' : 'pi-arrow-left'));

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

function getCurrentSport() {
  const payloadSportCode = getAthleteSportCode(store.payload.sport.value);
  if (payloadSportCode) {
    return payloadSportCode;
  }

  const appSportCode = getAthleteSportCode(store.application.value?.entity_data?.sport);
  if (appSportCode) {
    return appSportCode;
  }

  return '';
}

async function initialize() {
  try {
    if (!appId) {
      notifyError(t('Application ID is missing'));
      return;
    }

    const appLoaded = Number(store.application.value?.id) === appId;
    const sportLoaded = store.isPayloadKeyLoaded('sport');

    await withLoading('athlete-sport-initializing', async () => {
      if (!appLoaded || !sportLoaded) {
        await store.loadApplication(appId, {
          withPayload: true,
          payloadKeys: ['sport'],
          forceReload: !sportLoaded
        });
      }
    });

    if (!store.application.value) {
      notifyError(t('Application not found'));
      router.replace({ name: 'error-404', params: { locale: locale.value } });
      return;
    }

    if (!store.canModifyApplication.value) {
      notifyError(t('This application cannot be modified in its current stage'));
      router.replace({ name: 'app-summary', params: { appId, locale: locale.value } });
      return;
    }

    const currentSport = getCurrentSport();
    if (currentSport) {
      notifyError(t('Sport cannot be changed after application creation.'));
      router.replace({ name: 'app-summary', params: { appId, locale: locale.value } });
      return;
    }

    initialValues.value = { sport: currentSport };

    setHeading({ title: 'Update Sport', visible: true });
  } catch (e) {
    capture(e, {
      context: 'UpdateAthleteSport.initialize',
      fallback: 'Failed to initialize sport page',
      meta: { appId }
    });
    notifyError(t('Failed to load sport page'));
    router.replace({ name: 'applications-index', params: { locale: locale.value } });
  }
}

async function onSubmit({ formData }) {
  try {
    const payload = serializeAthleteSport(formData);

    const response = await withLoading('athlete-sport-saving', async () => {
      return await apiPost(ATHLETES_UPDATE_SPORT + appId, payload);
    });

    store.payload.sport.value = { code: payload.sport };
    if (response?.application) {
      store.application.value = response.application;
    } else if (store.application.value?.entity_data) {
      store.application.value.entity_data.sport = payload.sport;
    }

    notifySuccess(t('Sport updated successfully'));

    router.push({
      name: 'app-summary',
      params: { appId, locale: locale.value }
    });
  } catch (e) {
    if (e?.status === 422) {
      const errors = e.validationErrors || e.payload?.errors || {};
      mfRef.value?.applyServerErrors?.(errors);
      notifyError(t('Please fix the validation errors'));
      return;
    }

    if (e?.status === 404) {
      router.replace({ name: 'error-404', params: { locale: locale.value } });
      return;
    }

    if (e?.status === 403) {
      notifyError(t('This application cannot be modified in its current stage'));
      router.replace({ name: 'app-summary', params: { appId, locale: locale.value } });
      return;
    }

    if (e?.status === 409) {
      notifyError(e?.payload?.message || e?.message || t('Failed to update sport'));
      return;
    }

    capture(e, {
      context: 'UpdateAthleteSport.onSubmit',
      fallback: 'Failed to update sport',
      meta: { appId, formData }
    });
    notifyError(t('Failed to update sport'));
  }
}

onMounted(async () => {
  await initialize();
});
</script>

<template>
  <div class="athlete-sport-page tw-pt-10 tw-pb-24 tw-px-4">
    <div v-if="initializing" class="tw-flex tw-justify-center tw-py-16">
      <i class="pi pi-spinner tw-animate-spin tw-text-3xl tw-text-primary" aria-hidden="true"></i>
    </div>

    <section
      v-else
      class="tw-max-w-5xl tw-mx-auto tw-bg-white tw-rounded-[2rem] tw-border tw-border-slate-200 tw-shadow-[0_12px_40px_rgba(3,87,150,.07)] tw-p-5 sm:tw-p-7 md:tw-p-9"
    >
      <div class="tw-mb-8 tw-border-b tw-border-slate-100 tw-pb-5">
        <h1 class="tw-text-2xl md:tw-text-3xl tw-font-bold tw-text-slate-800">
          {{ t('Select sport') }}
        </h1>
        <p class="tw-text-sm md:tw-text-base tw-text-slate-600 tw-mt-2">
          {{ t('Choose the sport you want to register for') }}
        </p>
      </div>

      <MasterForm
        ref="mfRef"
        :schema="schema"
        :initialValues="initialValues"
        @submit="onSubmit"
        @validity="onValidity"
      />

      <div class="tw-mt-8 tw-flex tw-flex-col-reverse sm:tw-flex-row tw-justify-between tw-gap-4 sm:tw-items-center">
        <router-link
          :to="{ name: 'app-summary', params: { appId, locale } }"
          class="tw-inline-flex tw-items-center tw-gap-2 tw-text-slate-600 hover:tw-text-slate-900 tw-transition tw-font-medium"
        >
          <span>{{ t('Cancel') }}</span>
          <i :class="['pi', cancelIcon]" aria-hidden="true"></i>
        </router-link>

        <AppButton
          variant="primary"
          :icon="saveIcon"
          iconPosition="end"
          :disabled="!canSubmit"
          :loading="saving"
          @click="submitProgrammatically"
        >
          <span v-if="!saving">{{ t('Save') }}</span>
          <span v-else>{{ t('Saving') }}</span>
        </AppButton>
      </div>
    </section>
  </div>
</template>

<style scoped>
.athlete-sport-page :deep(.athlete-sport-tiles) {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 0.875rem;
}

.athlete-sport-page :deep(.athlete-sport-tiles .option) {
  width: 100%;
  min-height: 4.75rem;
  margin: 0;
  padding: 1rem 1.125rem;
  border: 1px solid rgb(203 213 225);
  border-radius: 1rem;
  background: rgb(248 250 252);
  justify-content: flex-start;
  gap: 0.875rem;
}

.athlete-sport-page :deep(.athlete-sport-tiles .option:hover) {
  border-color: rgb(148 163 184);
  background: rgb(241 245 249);
}

.athlete-sport-page :deep(.athlete-sport-tiles .option.option--active) {
  border-color: rgb(10 94 168);
  background: linear-gradient(135deg, rgba(10, 94, 168, 0.14), rgba(10, 94, 168, 0.05));
  box-shadow: 0 10px 24px rgba(10, 94, 168, 0.12);
}

.athlete-sport-page :deep(.athlete-sport-tiles .option.option--invalid) {
  border-color: rgb(245 158 11);
}

.athlete-sport-page :deep(.athlete-sport-tiles .option-label) {
  font-size: 1.05rem;
  line-height: 1.5;
}

@media (min-width: 640px) {
  .athlete-sport-page :deep(.athlete-sport-tiles) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .athlete-sport-page :deep(.athlete-sport-tiles) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
