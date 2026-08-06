<template>
  <div class="tw-w-full md:tw-max-w-2xl md:tw-mx-auto xl:tw-mx-0">
    <div v-if="loading" class="tw-text-muted-strong tw-py-8">
      {{ $t('Loading') }}
    </div>

    <template v-else>
      <div v-if="blockers.length" class="tw-bg-amber-50 tw-border tw-border-amber-300 tw-text-amber-800 tw-rounded-lg tw-p-4 tw-mb-6">
        <p class="tw-font-semibold tw-mb-1">
          {{ $t(canChangeAccountType ? 'Some account types are unavailable' : 'Account type is locked') }}
        </p>
        <ul class="tw-list-disc tw-ps-5 tw-text-sm">
          <li v-for="(blocker, i) in blockers" :key="i">{{ $t(blocker) }}</li>
        </ul>
      </div>

      <div class="tw-pb-12">
        <div v-if="canChangeAccountType" class="tw-bg-blue-50 tw-border tw-border-blue-200 tw-text-blue-800 tw-rounded-lg tw-p-4 tw-mb-6 tw-text-sm">
          <p class="tw-font-semibold tw-mb-2">{{ $t('Choose your account type') }}</p>
          <div class="tw-space-y-1">
            <p><span class="tw-font-semibold">{{ $t('Personal') }}:</span> {{ $t('For athletes and professional divers') }}</p>
            <p><span class="tw-font-semibold">{{ $t('Business') }}:</span> {{ $t('For diving centers and vendors') }}</p>
          </div>
        </div>

        <MasterForm
          :key="formKey"
          ref="mfRef"
          :schema="schema"
          :initial-values="initialValues"
          @submit="onSubmit"
          @validity="onValidity"
        />

        <p v-if="apiErrorKey" class="tw-text-danger tw-text-center tw-mt-4">
          {{ $t(apiErrorKey) }}
        </p>

        <AppButton
          type="button"
          variant="primary"
          block
          :loading="submitting"
          :disabled="!canSubmit"
          class="tw-mt-6"
          @click="submitProgrammatically"
        >
          {{ submitting ? $t('Saving') + '...' : $t('Save changes') }}
        </AppButton>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

import AppButton from '@/v3/components/ui/AppButton.vue';
import MasterForm from '@/v3/components/Forms/MasterForm.vue';
import { makeAccountSettingsSchema } from '@/v3/schema/auth/accountSettings.js';
import { useNotification } from '@/v3/composables/useNotification.js';
import { useErrorHandler } from '@/v3/composables/useErrorHandler.js';
import { ERROR_TYPES, apiGet, apiPost } from '@/v3/services/httpClient.js';
import { AUTH_UPDATE_ACCOUNT } from '@/v3/config/apiEndpoints.js';
import { user as authUser, saveAuthToStorage } from '@/v3/composables/useAuth.js';

const { t } = useI18n();
const { success: notifySuccess, error: notifyError } = useNotification();
const { capture } = useErrorHandler();

const mfRef = ref(null);
const formKey = ref(0);
const schema = ref({});
const initialValues = ref({});
const formIsValid = ref(false);
const submitting = ref(false);
const loading = ref(true);
const apiErrorKey = ref('');
const canChangeAccountType = ref(true);
const blockers = ref([]);
const accountTypeOptions = ref({});

const canSubmit = computed(() => formIsValid.value && !submitting.value);

function onValidity({ isValid }) {
  formIsValid.value = isValid;
}

function submitProgrammatically() {
  if (submitting.value) return;

  const ok = mfRef.value?.validateForm?.();
  if (!ok) {
    mfRef.value?.showErrors?.();
    return;
  }

  mfRef.value?.submitForm?.();
}

async function onSubmit({ formData }) {
  if (submitting.value) return;

  apiErrorKey.value = '';

  submitting.value = true;

  try {
    const response = await apiPost(AUTH_UPDATE_ACCOUNT, formData);

    if (response?.user) {
      authUser.value = { ...authUser.value, ...response.user };
      saveAuthToStorage();
    }

    canChangeAccountType.value = response?.can_change_account_type ?? true;
    blockers.value = response?.blockers ?? [];
    accountTypeOptions.value = response?.account_type_options ?? {};

    notifySuccess('Account updated successfully', {
      summary: 'Account Settings',
      life: 3000,
    });
  } catch (error) {
    if (error?.name === ERROR_TYPES.VALIDATION || error?.status === 422) {
      const serverErrors =
        error.validationErrors || error.payload?.errors || {};
      mfRef.value?.applyServerErrors?.(serverErrors);

      const responseBlockers = error.payload?.blockers || error.payload?.body?.blockers;
      if (Array.isArray(responseBlockers)) {
        blockers.value = responseBlockers;
        canChangeAccountType.value = false;
        accountTypeOptions.value = {
          ...accountTypeOptions.value,
          [formData.account_type]: {
            allowed: false,
            blockers: responseBlockers,
          },
        };
        schema.value = makeAccountSettingsSchema({
          accountType: formData.account_type || '',
          canChangeAccountType: false,
          accountTypeOptions: accountTypeOptions.value,
        });
        formKey.value += 1;
      }

      notifyError('Please fix the validation errors', {
        summary: 'Account Settings',
        life: 3000,
      });
      return;
    }

    apiErrorKey.value =
      error?.payload?.body?.message || error?.message || 'An unexpected error occurred';

    notifyError(apiErrorKey.value, {
      summary: 'Account Settings',
      life: 3000,
    });

    capture(error, {
      context: 'AccountSettings.submit',
      fallback: 'Failed to update account',
    });
  } finally {
    submitting.value = false;
  }
}

onMounted(async () => {
  try {
    const stored = authUser.value || JSON.parse(localStorage.getItem('user-data') || 'null');
    const user = stored || {};

    canChangeAccountType.value = true;
    blockers.value = [];

    initialValues.value = {
      alias: user.alias || '',
      account_type: user.account_type || '',
    };

    const response = await apiGet(AUTH_UPDATE_ACCOUNT);
    canChangeAccountType.value = response?.can_change_account_type ?? true;
    blockers.value = response?.blockers ?? [];
    accountTypeOptions.value = response?.account_type_options ?? {};

    if (response?.user) {
      initialValues.value = {
        alias: response.user.alias || user.alias || '',
        account_type: response.user.account_type || user.account_type || '',
      };
    }

    schema.value = makeAccountSettingsSchema({
      accountType: initialValues.value.account_type,
      canChangeAccountType: canChangeAccountType.value,
      accountTypeOptions: accountTypeOptions.value,
    });
  } catch (error) {
    canChangeAccountType.value = false;
    schema.value = makeAccountSettingsSchema({
      accountType: initialValues.value.account_type || '',
      canChangeAccountType: false,
      accountTypeOptions: accountTypeOptions.value,
    });
    apiErrorKey.value =
      error?.payload?.body?.message || error?.message || 'Failed to load account settings.';

    capture(error, {
      context: 'AccountSettings.load',
      fallback: 'Failed to load account settings',
    });
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
</style>
