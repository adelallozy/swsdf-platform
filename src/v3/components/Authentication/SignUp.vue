<template>
  <div class="auth_register">
    <div class="tw-w-full md:tw-max-w-xl md:tw-mx-auto xl:tw-mx-0">
      <h1 class="tw-mb-4 xl:tw-mb-8 tw-w-full">
        <span class="tw-text-4xl xl:tw-text-5xl tw-capitalize tw-font-bold tw-leading-9">
          {{ $t('Getting started') }}
        </span>

        <span class="tw-text-base tw-text-muted-strong tw-mt-3 tw-block lg:tw-max-w-[90%]">
          {{ $t('Looks like you are new to us — create an account for a complete experience') }}
        </span>
      </h1>

      <div class="register_form tw-pb-11">
        <div class="tw-bg-blue-50 tw-border tw-border-blue-200 tw-text-blue-800 tw-rounded-lg tw-p-4 tw-mb-6 tw-text-sm">
          <p class="tw-font-semibold tw-mb-2">{{ $t('Choose your account type') }}</p>
          <div class="tw-space-y-1">
            <p><span class="tw-font-semibold">{{ $t('Personal') }}:</span> {{ $t('For athletes and professional divers') }}</p>
            <p><span class="tw-font-semibold">{{ $t('Business') }}:</span> {{ $t('For diving centers and vendors') }}</p>
          </div>
        </div>

        <MasterForm
          ref="mfRef"
          :schema="schema"
          @submit="onSubmit"
          @validity="onValidity"
        />

        <p v-if="apiErrorKey" class="tw-text-danger tw-text-center tw-mt-4">
          {{ $t(apiErrorKey) }}
        </p>

        <!-- Rate limit error — centered banner -->
        <div v-if="rateLimitError" class="tw-bg-red-50 tw-border tw-border-red-400 tw-text-red-700 tw-rounded-lg tw-p-4 tw-mt-4 tw-text-center">
          <p class="tw-font-semibold">{{ $t('Too Many Requests') }}</p>
          <p class="tw-text-sm tw-mt-1">{{ $t(rateLimitError) }}</p>
        </div>

        <AppButton
          type="button"
          variant="primary"
          block
          :loading="submitting"
          :disabled="!canSubmit"
          class="tw-mt-10"
          @click="submitProgrammatically"
        >
          {{ submitting ? $t('Creating account') + '...' : $t('Create new account') }}
        </AppButton>
      </div>

      <p class="tw-mt-6 tw-text-center tw-text-muted tw-mb-0 tw-text-sm">
        {{ $t('Have an account?') }}
        <RouterLink :to="{ name: 'sign-in', params: { locale: authLocale } }" class="tw-text-primary tw-font-medium tw-ms-1">
          {{ $t('Sign in') }}
        </RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import AppButton from '@/v3/components/ui/AppButton.vue';
import MasterForm from '@/v3/components/Forms/MasterForm.vue';
import { makeSignUpSchema } from '@/v3/schema/auth/signUp.js';
import { useNotification } from '@/v3/composables/useNotification.js';
import { useErrorHandler } from '@/v3/composables/useErrorHandler.js';
import { ERROR_TYPES, apiPost } from '@/v3/services/httpClient.js';
import { AUTH_SIGN_UP } from '@/v3/config/apiEndpoints.js';

const SERVER_TO_FORM_FIELD_MAP = {
    confirmPassword: 'password_confirmation',
    passwordConfirmation: 'password_confirmation'
};

const router = useRouter();
const { locale } = useI18n();
const { success: notifySuccess, error: notifyError } = useNotification();
const { capture } = useErrorHandler();

const mfRef = ref(null);
const schema = ref(makeSignUpSchema());
const formIsValid = ref(false);
const submitting = ref(false);
const apiErrorKey = ref('');
const rateLimitError = ref('');

const canSubmit = computed(() => formIsValid.value && !submitting.value);
const authLocale = computed(() => (locale.value === 'en' ? 'en' : 'ar'));

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

function normalizeServerErrors(errorsObj = {}) {
    const normalized = {};

    for (const [key, value] of Object.entries(errorsObj || {})) {
        const mappedKey = SERVER_TO_FORM_FIELD_MAP[key] || key;
        normalized[mappedKey] = Array.isArray(value) ? value[0] : value;
    }

    return normalized;
}

async function onSubmit({ formData }) {
    if (submitting.value) return;

    apiErrorKey.value = '';
    rateLimitError.value = '';

    if (String(formData.password_confirmation || '') !== String(formData.password || '')) {
        mfRef.value?.applyServerErrors?.({
            password_confirmation: 'Passwords do not match'
        });
        return;
    }

    submitting.value = true;

    try {
        const response = await apiPost(AUTH_SIGN_UP, formData);

        notifySuccess('You have successfully created an account!', {
            summary: 'Create account',
            life: 3000
        });

        window.setTimeout(() => {
            // Redirect to email verification if the API requires it
            if (response?.verification_required) {
                router.push({
                    name: 'verify-email',
                    params: { locale: authLocale.value },
                    query: { email: formData.email }
                });
            } else {
                router.push({ name: 'sign-in', params: { locale: authLocale.value } });
            }
        }, 900);
    } catch (error) {
        if (error?.status === 429) {
            rateLimitError.value = 'Too many signup attempts. Please wait and try again later.';
            return;
        }

        if (error?.name === ERROR_TYPES.VALIDATION || error?.status === 422) {
            const serverErrors = normalizeServerErrors(error.validationErrors || error.payload?.errors || {});
            mfRef.value?.applyServerErrors?.(serverErrors);

            notifyError('Please fix the validation errors', {
                summary: 'Create account',
                life: 3000
            });
            return;
        }

        apiErrorKey.value = error?.payload?.body?.message || error?.message || 'An unexpected error occurred';

        notifyError(apiErrorKey.value, {
            summary: 'Create account',
            life: 3000
        });

        capture(error, {
            context: 'SignUp.submit',
            fallback: 'Failed to create account'
        });
    } finally {
        submitting.value = false;
    }
}
</script>

<style scoped>
.auth_register {
  color: var(--p-text-color);
}
</style>
