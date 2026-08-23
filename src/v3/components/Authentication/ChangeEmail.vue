<template>
  <div class="auth_verify">
    <div class="tw-w-full md:tw-max-w-xl md:tw-mx-auto xl:tw-mx-0">
      <!-- Back link -->
      <RouterLink
        :to="{ name: 'verify-email', params: { locale: authLocale }, query: email ? { email } : {} }"
        class="tw-text-lg tw-text-muted-strong tw-mb-6 tw-block tw-font-medium"
      >
        <i class="pi" :class="isRtl ? 'pi-arrow-right' : 'pi-arrow-left'"></i>
        <span class="tw-ms-1">{{ $t('Back') }}</span>
      </RouterLink>

      <h1 class="tw-mb-4 xl:tw-mb-8">
        <span class="tw-text-4xl xl:tw-text-5xl tw-capitalize tw-font-bold tw-leading-9">
          {{ $t('Change email') }}
        </span>
        <span class="tw-text-base tw-text-muted-strong tw-mt-3 tw-block">
          {{ $t('Use this page if you signed up with an incorrect email or an email you cannot access.') }}
        </span>
      </h1>

      <!-- Rate limit error — centered banner -->
      <div v-if="rateLimitError" class="tw-bg-red-50 tw-border tw-border-red-400 tw-text-red-700 tw-rounded-lg tw-p-5 tw-mb-6 tw-text-center">
        <p class="tw-text-lg tw-font-semibold">{{ $t('Too Many Requests') }}</p>
        <p class="tw-text-sm tw-mt-1">{{ rateLimitError }}</p>
      </div>

      <!-- Info: no code is sent automatically -->
      <div class="tw-bg-gray-50 tw-border tw-border-gray-200 tw-rounded-lg tw-p-5 tw-mb-6">
        <p class="tw-text-sm tw-text-gray-600">
          {{ $t('Changing your email does not send a verification code automatically. After changing it, send a new code to your new email address.') }}
        </p>
      </div>

      <form @submit.prevent="onSubmit" class="tw-pb-11">
        <!-- Current email -->
        <div class="tw-mb-2">
          <div class="tw-flex tw-flex-col tw-gap-1">
            <label for="current-email" class="tw-font-medium tw-text-p-text">{{ $t('Current email address') }}</label>
            <InputText
              id="current-email"
              v-model.trim="form.email"
              type="email"
              :placeholder="$t('Enter your email')"
              autocomplete="username"
              :invalid="!!errors.email"
              class="tw-w-full"
              :disabled="submitting"
            />
            <small v-if="errors.email" class="p-error">{{ $t(errors.email) }}</small>
          </div>
        </div>

        <!-- Password -->
        <div class="tw-mb-2">
          <div class="tw-flex tw-flex-col tw-gap-1">
            <label for="password" class="tw-font-medium tw-text-p-text">{{ $t('Password') }}</label>
            <Password
              inputId="password"
              v-model.trim="form.password"
              :placeholder="$t('Enter your password')"
              :feedback="false"
              toggleMask
              class="tw-w-full"
              :inputProps="{ autocomplete: 'current-password', class: 'tw-w-full' }"
              :invalid="!!errors.password"
            />
            <small v-if="errors.password" class="p-error">{{ $t(errors.password) }}</small>
          </div>
        </div>

        <!-- New email -->
        <div class="tw-mb-2">
          <div class="tw-flex tw-flex-col tw-gap-1">
            <label for="new-email" class="tw-font-medium tw-text-p-text">{{ $t('New email address') }}</label>
            <InputText
              id="new-email"
              v-model.trim="form.newEmail"
              type="email"
              :placeholder="$t('Enter the new email address')"
              autocomplete="off"
              :invalid="!!errors.newEmail"
              class="tw-w-full"
              :disabled="submitting"
            />
            <small v-if="errors.newEmail" class="p-error">{{ $t(errors.newEmail) }}</small>
          </div>
        </div>

        <p v-if="apiError" class="tw-text-danger tw-text-center tw-mt-3">{{ $t(apiError) }}</p>

        <AppButton
          type="submit"
          variant="primary"
          block
          :loading="submitting"
          :disabled="submitting"
          class="tw-mt-6"
        >
          {{ submitting ? $t('Changing your email...') : $t('Change email') }}
        </AppButton>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';

import AppButton from '@/v3/components/ui/AppButton.vue';
import { useNotification } from '@/v3/composables/useNotification.js';
import { apiPost } from '@/v3/services/httpClient.js';
import { AUTH_CHANGE_UNVERIFIED_EMAIL } from '@/v3/config/apiEndpoints.js';

const router = useRouter();
const route = useRoute();
const { locale } = useI18n();
const { success: notifySuccess, error: notifyError } = useNotification();

const isRtl = computed(() => locale.value === 'ar');
const authLocale = computed(() => {
  const routeLocale = route.params?.locale;
  if (routeLocale === 'ar' || routeLocale === 'en') {
    return routeLocale;
  }
  return locale.value === 'en' ? 'en' : 'ar';
});

// Current (inaccessible) email is carried from the verification page query.
const email = computed(() => (route.query.email || '').trim());

const form = reactive({
  email: email.value,
  password: '',
  newEmail: '',
});
const errors = reactive({
  email: '',
  password: '',
  newEmail: '',
});
const submitting = ref(false);
const apiError = ref('');
const rateLimitError = ref('');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(value) {
  return value.trim().toLowerCase();
}

function validate() {
  errors.email = '';
  errors.password = '';
  errors.newEmail = '';
  apiError.value = '';

  if (!form.email) {
    errors.email = 'Email is required';
  } else if (!EMAIL_PATTERN.test(form.email)) {
    errors.email = 'Invalid email address';
  }

  if (!form.password) {
    errors.password = 'Password is required';
  }

  if (!form.newEmail) {
    errors.newEmail = 'Email is required';
  } else if (!EMAIL_PATTERN.test(form.newEmail)) {
    errors.newEmail = 'Invalid email address';
  } else if (normalizeEmail(form.newEmail) === normalizeEmail(form.email)) {
    errors.newEmail = 'This is already your email address.';
  }

  return !errors.email && !errors.password && !errors.newEmail;
}

async function onSubmit() {
  if (submitting.value || !validate()) return;

  submitting.value = true;
  rateLimitError.value = '';

  try {
    const response = await apiPost(AUTH_CHANGE_UNVERIFIED_EMAIL, {
      email: form.email,
      password: form.password,
      new_email: form.newEmail,
    });

    const newEmail = (response?.email || form.newEmail).trim();

    notifySuccess('Your email has been changed. Send a verification code to your new email address.', {
      summary: 'Email updated',
      life: 5000,
    });

    // Back to the verification page in its pre-send state: per the product
    // contract no code was mailed automatically — the user must click
    // "Send verification code" for the replacement address.
    router.push({
      name: 'verify-email',
      params: { locale: authLocale.value },
      query: { email: newEmail },
    });
  } catch (error) {
    if (error?.status === 429) {
      rateLimitError.value = error?.payload?.body?.message || 'Too many attempts. Please wait and try again.';
    } else if (error?.status === 422 && error?.payload?.errors) {
      const apiErrors = error.payload.errors;
      if (apiErrors.password) {
        errors.password = apiErrors.password;
      }
      if (apiErrors.new_email) {
        errors.newEmail = apiErrors.new_email;
      }
      if (apiErrors.email && !apiErrors.new_email) {
        // The shared unique rule reports the entity `email` field.
        errors.newEmail = apiErrors.email;
      }
      if (!apiErrors.password && !apiErrors.new_email && !apiErrors.email) {
        apiError.value = 'Unable to change email';
      }
    } else if (error?.status === 403 && error?.payload?.body?.status === 'account_suspended') {
      apiError.value = 'Your account has been suspended. Please contact support.';
    } else {
      apiError.value = error?.message || 'Unable to change email';
      notifyError('Could not change your email. Please try again.', { summary: 'Error', life: 3000 });
    }
  } finally {
    submitting.value = false;
  }
}
</script>
