<template>
  <div class="auth_verify">
    <div class="tw-w-full md:tw-max-w-xl md:tw-mx-auto xl:tw-mx-0">
      <h1 class="tw-mb-4 xl:tw-mb-8">
        <span class="tw-text-4xl xl:tw-text-5xl tw-capitalize tw-font-bold tw-leading-9">
          {{ $t('Verify your email') }}
        </span>
        <span class="tw-text-base tw-text-muted-strong tw-mt-3 tw-block">
          {{ $t('Your account is restricted until your email is verified.') }}
        </span>
      </h1>

      <!-- Rate limit error — centered banner -->
      <div v-if="rateLimitError" class="tw-bg-red-50 tw-border tw-border-red-400 tw-text-red-700 tw-rounded-lg tw-p-5 tw-mb-6 tw-text-center">
        <p class="tw-text-lg tw-font-semibold">{{ $t('Too Many Requests') }}</p>
        <p class="tw-text-sm tw-mt-1">{{ rateLimitError }}</p>
      </div>

      <!-- ═══ STATE 1: Before sending ═══ -->
      <div v-if="!codeSent" class="tw-pb-11">
        <div class="tw-bg-gray-50 tw-border tw-border-gray-200 tw-rounded-lg tw-p-5 tw-mb-6">
          <p class="tw-text-sm tw-mb-2">
            <strong>{{ $t('Email address') }}:</strong> {{ email }}
          </p>
          <p class="tw-text-sm tw-text-gray-600 tw-mb-2">
            {{ $t('A six-digit verification code will be sent to this email address.') }}
          </p>
          <p class="tw-text-sm tw-text-gray-600">
            {{ $t('Make sure this email is correct and accessible.') }}
          </p>
        </div>

        <AppButton
          type="button"
          variant="primary"
          block
          :loading="sending"
          :disabled="sending"
          class="tw-mt-4"
          @click="handleSend"
        >
          {{ sending ? $t('Sending') + '...' : $t('Send verification code') }}
        </AppButton>

        <!-- No access to this email → big change-email link -->
        <div class="tw-mt-6 tw-border tw-border-amber-300 tw-bg-amber-50 tw-rounded-lg tw-p-5 tw-text-center">
          <p class="tw-text-base tw-font-semibold tw-text-amber-800 tw-mb-1">
            <i class="pi pi-exclamation-triangle tw-me-1"></i>
            {{ $t("Don't have access to this email?") }}
          </p>
          <p class="tw-text-sm tw-text-amber-800 tw-mb-4">
            {{ $t('You can change your email address using your password.') }}
          </p>
          <RouterLink
            :to="{ name: 'change-email', params: { locale: authLocale }, query: { email } }"
            class="tw-inline-flex tw-items-center tw-justify-center tw-gap-2 tw-w-full sm:tw-w-auto tw-px-6 tw-py-3 tw-rounded-lg tw-bg-amber-600 tw-text-white tw-text-lg tw-font-semibold hover:tw-bg-amber-700"
          >
            <i class="pi pi-envelope tw-text-base"></i>
            <span>{{ $t('Change email with password') }}</span>
          </RouterLink>
        </div>

        <p class="tw-mt-6 tw-text-center tw-text-muted tw-mb-0 tw-text-sm">
          <RouterLink :to="{ name: 'sign-in', params: { locale: authLocale } }" class="tw-text-primary tw-font-medium">
            {{ $t('Back to sign in') }}
          </RouterLink>
        </p>
      </div>

      <!-- ═══ STATE 2: After sending — enter code ═══ -->
      <div v-else class="tw-pb-11">
        <div class="tw-bg-gray-50 tw-border tw-border-gray-200 tw-rounded-lg tw-p-5 tw-mb-6">
          <p class="tw-text-sm tw-mb-4">
            {{ $t('A six-digit code was sent to') }} <strong>{{ email }}</strong>.
            {{ $t('Enter it below to verify your account.') }}
          </p>

          <!-- Code input — strips non-digits on paste and type -->
          <div class="tw-mb-4">
            <label class="tw-block tw-text-sm tw-font-medium tw-mb-2">{{ $t('Verification code') }}</label>
            <InputText
              v-model="code"
              :placeholder="$t('Enter 6-digit code')"
              inputmode="numeric"
              pattern="[0-9]*"
              autocomplete="one-time-code"
              maxlength="6"
              class="tw-w-full tw-font-mono"
              style="letter-spacing: 0.5rem; font-size: 1.75rem; text-align: center; height: 3.5rem;"
              :disabled="verifying"
              @paste="handlePaste"
            />
            <p v-if="codeError" class="tw-text-danger tw-text-sm tw-mt-2 tw-text-center">{{ codeError }}</p>
          </div>

          <!-- Instructions -->
          <div class="tw-border-t tw-border-gray-200 tw-pt-3 tw-mt-2">
            <ul class="tw-text-sm tw-text-gray-600 tw-space-y-1.5">
              <li class="tw-flex tw-items-start tw-gap-2">
                <i class="pi pi-clock tw-text-gray-400 tw-mt-0.5"></i>
                <span>{{ $t('The code expires after 10 minutes.') }}</span>
              </li>
              <li class="tw-flex tw-items-start tw-gap-2">
                <i class="pi pi-inbox tw-text-gray-400 tw-mt-0.5"></i>
                <span>{{ $t('Check your inbox first.') }}</span>
              </li>
              <li class="tw-flex tw-items-start tw-gap-2">
                <i class="pi pi-exclamation-triangle tw-text-gray-400 tw-mt-0.5"></i>
                <span>{{ $t('If you do not see the message, check your junk or spam folder.') }}</span>
              </li>
              <li class="tw-flex tw-items-start tw-gap-2">
                <i class="pi pi-check-circle tw-text-gray-400 tw-mt-0.5"></i>
                <span>{{ $t('Mark the message as Not spam or trust the sender so future messages reach your inbox.') }}</span>
              </li>
              <li class="tw-flex tw-items-start tw-gap-2">
                <i class="pi pi-shield tw-text-red-500 tw-mt-0.5"></i>
                <span class="tw-text-red-600 tw-font-medium">{{ $t('Federation staff will never ask you to disclose this code.') }}</span>
              </li>
            </ul>
          </div>
        </div>

        <AppButton
          type="button"
          variant="primary"
          block
          :loading="verifying"
          :disabled="code.length !== 6 || verifying"
          class="tw-mt-4"
          @click="handleVerify"
        >
          {{ verifying ? $t('Verifying') + '...' : $t('Verify email') }}
        </AppButton>

        <!-- Resend + back -->
        <div class="tw-mt-6 tw-flex tw-flex-col tw-items-center tw-gap-3">
          <button
            type="button"
            class="tw-text-primary tw-font-medium tw-text-sm tw-bg-transparent tw-border-0 tw-cursor-pointer disabled:tw-opacity-50 disabled:tw-cursor-not-allowed"
            :disabled="resendCooldown > 0 || resending"
            @click="handleResend"
          >
            <span v-if="resending">...</span>
            <span v-else-if="resendCooldown > 0">{{ $t('Resend code') }} ({{ resendCooldown }}s)</span>
            <span v-else>{{ $t('Resend code') }}</span>
          </button>

          <RouterLink :to="{ name: 'sign-in', params: { locale: authLocale } }" class="tw-text-muted tw-font-medium tw-text-sm">
            {{ $t('Back to sign in') }}
          </RouterLink>
        </div>

        <!-- No access to this email → big change-email link -->
        <div class="tw-mt-6 tw-border tw-border-amber-300 tw-bg-amber-50 tw-rounded-lg tw-p-5 tw-text-center">
          <p class="tw-text-base tw-font-semibold tw-text-amber-800 tw-mb-1">
            <i class="pi pi-exclamation-triangle tw-me-1"></i>
            {{ $t("Don't have access to this email?") }}
          </p>
          <p class="tw-text-sm tw-text-amber-800 tw-mb-4">
            {{ $t('You can change your email address using your password.') }}
          </p>
          <RouterLink
            :to="{ name: 'change-email', params: { locale: authLocale }, query: { email } }"
            class="tw-inline-flex tw-items-center tw-justify-center tw-gap-2 tw-w-full sm:tw-w-auto tw-px-6 tw-py-3 tw-rounded-lg tw-bg-amber-600 tw-text-white tw-text-lg tw-font-semibold hover:tw-bg-amber-700"
          >
            <i class="pi pi-envelope tw-text-base"></i>
            <span>{{ $t('Change email with password') }}</span>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import InputText from 'primevue/inputtext';

import AppButton from '@/v3/components/ui/AppButton.vue';
import { useNotification } from '@/v3/composables/useNotification.js';
import { apiPost } from '@/v3/services/httpClient.js';
import { AUTH_SEND_VERIFICATION_CODE, AUTH_VERIFY_CODE } from '@/v3/config/apiEndpoints.js';
import { setAuthManually } from '@/v3/composables/useAuth.js';

const router = useRouter();
const route = useRoute();
const { locale } = useI18n();
const { success: notifySuccess, error: notifyError, info: notifyInfo } = useNotification();

const email = computed(() => route.query.email || '');
const authLocale = computed(() => (locale.value === 'en' ? 'en' : 'ar'));

const codeSent = ref(false);
const code = ref('');
const codeError = ref('');
const rateLimitError = ref('');
const sending = ref(false);
const verifying = ref(false);
const resending = ref(false);
const resendCooldown = ref(0);
let cooldownTimer = null;

onMounted(() => {
  if (!email.value) {
    router.replace({ name: 'sign-in', params: { locale: authLocale.value } });
  }
});

onUnmounted(() => {
  if (cooldownTimer) clearInterval(cooldownTimer);
});

function startCooldown() {
  resendCooldown.value = 60;
  cooldownTimer = setInterval(() => {
    resendCooldown.value--;
    if (resendCooldown.value <= 0) {
      clearInterval(cooldownTimer);
      cooldownTimer = null;
    }
  }, 1000);
}

/**
 * Strips all non-digit characters from pasted content before it reaches the input.
 * Fixes the issue where copying " 123456 " from email would truncate to 5 chars
 * because maxlength=6 clipped the whitespace before it could be stripped.
 */
function handlePaste(event) {
  event.preventDefault();
  const pastedText = (event.clipboardData || window.clipboardData).getData('text');
  code.value = pastedText.replace(/\D/g, '').slice(0, 6);
}

/**
 * Cleans the code value on any change — strips non-digits and caps at 6.
 * Using watch instead of @input because PrimeVue InputText does not emit
 * a native input event reliably through the component's fallthrough attrs.
 */
watch(code, (val) => {
  const cleaned = val.replace(/\D/g, '').slice(0, 6);
  if (cleaned !== val) {
    code.value = cleaned;
  }
});

async function handleSend() {
  if (sending.value) return;
  sending.value = true;
  rateLimitError.value = '';

  try {
    await apiPost(AUTH_SEND_VERIFICATION_CODE, { email: email.value });
    codeSent.value = true;
    startCooldown();
    notifyInfo(
      'A verification code has been sent. Check your inbox (or spam folder).',
      { summary: 'Verification code sent', life: 5000 }
    );
  } catch (error) {
    if (error?.status === 429) {
      rateLimitError.value = error?.payload?.body?.message || 'Too many attempts. Please wait and try again.';
    } else {
      notifyError('Could not send verification code. Please try again.', { summary: 'Error', life: 3000 });
    }
  } finally {
    sending.value = false;
  }
}

async function handleResend() {
  if (resending.value || resendCooldown.value > 0) return;
  resending.value = true;
  codeError.value = '';
  rateLimitError.value = '';
  code.value = '';

  try {
    await apiPost(AUTH_SEND_VERIFICATION_CODE, { email: email.value });
    startCooldown();
    notifyInfo(
      'A new code has been sent. Check your inbox (or spam folder).',
      { summary: 'Code resent', life: 5000 }
    );
  } catch (error) {
    if (error?.status === 429) {
      rateLimitError.value = error?.payload?.body?.message || 'Too many attempts. Please wait and try again.';
    } else {
      notifyError('Could not resend the code. Please try again.', { summary: 'Error', life: 3000 });
    }
  } finally {
    resending.value = false;
  }
}

async function handleVerify() {
  if (verifying.value) return;
  if (code.value.length !== 6) {
    codeError.value = 'Please enter the 6-digit code.';
    return;
  }

  verifying.value = true;
  codeError.value = '';
  rateLimitError.value = '';

  try {
    const response = await apiPost(AUTH_VERIFY_CODE, {
      email: email.value,
      code: code.value,
    });

    if (response?.jwt) {
      setAuthManually({
        jwt: response.jwt,
        jwt_expiry: response.jwt_expiry,
        userData: response.user,
      });

      notifySuccess('Your email has been verified. Welcome!', { summary: 'Verified', life: 2500 });

      window.setTimeout(() => {
        router.push('/');
      }, 600);
    } else {
      codeError.value = 'Verification failed. Please try again.';
    }
  } catch (error) {
    if (error?.status === 429) {
      rateLimitError.value = error?.payload?.body?.message || 'Too many attempts. Please wait and try again.';
    } else if (error?.status === 422 && error?.payload?.errors?.code) {
      codeError.value = error.payload.errors.code;
    } else {
      codeError.value = 'Verification failed. Please try again.';
    }
  } finally {
    verifying.value = false;
  }
}
</script>
