<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import AppButton from '@/v3/components/ui/AppButton.vue';
import MasterForm from '@/v3/components/Forms/MasterForm.vue';

import usePageHeading from '@/v3/composables/layout/usePageHeading.js';
import { useNotification } from '@/v3/composables/useNotification.js';
import { useErrorHandler } from '@/v3/composables/useErrorHandler.js';
import { useLoading } from '@/v3/composables/useLoading.js';
import { apiPost } from '@/v3/services/httpClient.js';

import {
  ATHLETES_CREATE_MEMBERSHIP
} from '@/v3/config/apiEndpoints.js';

import {
  makeAthleteSportSchema,
  serializeAthleteSport
} from '@/v3/schema/applications/athleteSport.js';
import { getConflictApplicationId } from '@/v3/utils/applicationWorkflow.js';

const { t, locale } = useI18n();
const router = useRouter();

const { setHeading } = usePageHeading();
const { success: notifySuccess, error: notifyError } = useNotification();
const { capture } = useErrorHandler();
const { withLoading, isLoadingKey } = useLoading();

const mfRef = ref(null);
const schema = ref(makeAthleteSportSchema());
const initialValues = ref({ sport: '' });
const formIsValid = ref(false);

const isRtl = computed(() => locale.value === 'ar');
const saving = computed(() => isLoadingKey('athlete-application-creating'));
const canSubmit = computed(() => formIsValid.value && !saving.value);
const continueIcon = computed(() => (isRtl.value ? 'pi-arrow-left' : 'pi-arrow-right'));
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

async function onSubmit({ formData }) {
  try {
    await withLoading('athlete-application-creating', async () => {
      const payload = serializeAthleteSport(formData);
      const response = await apiPost(ATHLETES_CREATE_MEMBERSHIP, payload);
      const appId = response?.application?.id;

      if (!appId) {
        throw new Error('Application ID not returned from server');
      }

      notifySuccess(t('Application created successfully'));
      router.push({
        name: 'app-summary',
        params: {
          appId,
          locale: locale.value
        }
      });
    });
  } catch (e) {
    if (e?.status === 409) {
      const appId = getConflictApplicationId(e);

      if (appId) {
        notifyError(e?.message || t('You already have another Application'));
        router.replace({
          name: 'app-summary',
          params: {
            appId,
            locale: locale.value
          }
        });
        return;
      }

      notifyError(t(e?.payload?.message || e?.message || 'Failed to create athlete application'));
      return;
    }

    if (e?.status === 422) {
      const errors = e.validationErrors || e.payload?.errors || {};
      mfRef.value?.applyServerErrors?.(errors);
      notifyError(t('Please fix the validation errors'));
      return;
    }

    capture(e, {
      context: 'NewAthlete.onSubmit',
      fallback: 'Failed to create athlete application',
      meta: { formData }
    });
    notifyError(t('Failed to create athlete application'));
  }
}

onMounted(() => {
  setHeading({
    title: t('New Athlete Registration'),
    visible: true
  });
});
</script>

<template>
  <div class="athlete-registration-page tw-pt-4 md:tw-pt-6 tw-pb-24 tw-px-4">
    <section
      class="tw-max-w-5xl tw-mx-auto tw-bg-white tw-rounded-[2rem] tw-border tw-border-slate-200 tw-shadow-[0_12px_40px_rgba(3,87,150,.07)] tw-p-5 sm:tw-p-7 md:tw-p-9"
    >
      <div class="tw-mb-8 tw-border-b tw-border-slate-100 tw-pb-5">
        <h2 class="tw-text-2xl md:tw-text-3xl tw-font-bold tw-text-slate-800">
          {{ t('Select sport') }}
        </h2>
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
          :to="{ name: 'applications-index', params: { locale } }"
          class="tw-inline-flex tw-items-center tw-gap-2 tw-text-slate-600 hover:tw-text-slate-900 tw-transition tw-font-medium"
        >
          <span>{{ t('Cancel') }}</span>
          <i :class="['pi', cancelIcon]" aria-hidden="true"></i>
        </router-link>

        <AppButton
          variant="primary"
          :icon="continueIcon"
          iconPosition="end"
          :disabled="!canSubmit"
          :loading="saving"
          @click="submitProgrammatically"
        >
          <span v-if="!saving">{{ t('Continue') }}</span>
          <span v-else>{{ t('Saving') }}</span>
        </AppButton>
      </div>
    </section>
  </div>
</template>

<style scoped>
.athlete-registration-page :deep(.athlete-sport-tiles) {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 0.875rem;
}

.athlete-registration-page :deep(.athlete-sport-tiles .option) {
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

.athlete-registration-page :deep(.athlete-sport-tiles .option:hover) {
  border-color: rgb(148 163 184);
  background: rgb(241 245 249);
}

.athlete-registration-page :deep(.athlete-sport-tiles .option.option--active) {
  border-color: rgb(10 94 168);
  background: linear-gradient(135deg, rgba(10, 94, 168, 0.14), rgba(10, 94, 168, 0.05));
  box-shadow: 0 10px 24px rgba(10, 94, 168, 0.12);
}

.athlete-registration-page :deep(.athlete-sport-tiles .option.option--invalid) {
  border-color: rgb(245 158 11);
}

.athlete-registration-page :deep(.athlete-sport-tiles .option-label) {
  font-size: 1.05rem;
  line-height: 1.5;
}

@media (min-width: 640px) {
  .athlete-registration-page :deep(.athlete-sport-tiles) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .athlete-registration-page :deep(.athlete-sport-tiles) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
