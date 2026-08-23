<template>
  <section class="tw-bg-gray-50 tw-border tw-border-gray-200 tw-rounded-lg tw-p-5">
    <h2 class="tw-text-lg tw-font-semibold tw-mb-1">{{ $t('Email address') }}</h2>
    <p class="tw-text-sm tw-text-muted-strong tw-mb-4">{{ $t('Your account email address.') }}</p>

    <!-- Rate limit error — centered banner -->
    <div v-if="rateLimitError" class="tw-bg-red-50 tw-border tw-border-red-400 tw-text-red-700 tw-rounded-lg tw-p-4 tw-mb-4 tw-text-center">
      <p class="tw-font-semibold">{{ $t('Too Many Requests') }}</p>
      <p class="tw-text-sm tw-mt-1">{{ rateLimitError }}</p>
    </div>

    <!-- ═══ Phase: idle ═══ -->
    <template v-if="phase === 'idle'">
      <div class="tw-flex tw-flex-col sm:tw-flex-row sm:tw-items-center tw-justify-between tw-gap-3">
        <p class="tw-font-mono tw-text-sm tw-break-all">{{ currentEmail }}</p>
        <AppButton type="button" variant="primary" @click="startRequest">
          {{ $t('Change email') }}
        </AppButton>
      </div>
      <p class="tw-text-xs tw-text-muted-strong tw-mt-3">
        {{ $t('Changing your email sends a verification code to the new address, then a confirmation code to your current address.') }}
      </p>
    </template>

    <!-- ═══ Phase: request (new email + password) ═══ -->
    <form v-else-if="phase === 'request'" @submit.prevent="submitRequest">
      <div class="tw-flex tw-flex-col tw-gap-1 tw-mb-3">
        <label for="email-change-new" class="tw-text-sm tw-font-medium">{{ $t('New email address') }}</label>
        <InputText
          id="email-change-new"
          v-model.trim="form.newEmail"
          type="email"
          :placeholder="$t('Enter the new email address')"
          autocomplete="off"
          :invalid="!!errors.newEmail"
          class="tw-w-full"
          :disabled="requesting"
        />
        <small v-if="errors.newEmail" class="p-error">{{ $t(errors.newEmail) }}</small>
      </div>

      <div class="tw-flex tw-flex-col tw-gap-1 tw-mb-3">
        <label for="email-change-password" class="tw-text-sm tw-font-medium">{{ $t('Password') }}</label>
        <Password
          inputId="email-change-password"
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

      <div class="tw-flex tw-flex-col sm:tw-flex-row tw-gap-3 tw-mt-4">
        <AppButton type="submit" variant="primary" class="sm:tw-w-auto" :loading="requesting" :disabled="requesting">
          {{ requesting ? $t('Sending') + '...' : $t('Send code') }}
        </AppButton>
        <AppButton type="button" variant="outline" class="sm:tw-w-auto" :disabled="requesting" @click="resetFlow">
          {{ $t('Cancel') }}
        </AppButton>
      </div>
    </form>

    <!-- ═══ Phase: newCode (verify the NEW email) ═══ -->
    <form v-else-if="phase === 'newCode'" @submit.prevent="submitNewCode">
      <p class="tw-text-sm tw-mb-3">
        {{ $t('Enter the 6-digit code sent to') }}
        <strong class="tw-font-mono">{{ form.newEmail }}</strong>.
      </p>

      <div class="tw-flex tw-flex-col tw-gap-1 tw-mb-3">
        <label for="email-change-new-code" class="tw-text-sm tw-font-medium">{{ $t('Verification code') }}</label>
        <InputText
          id="email-change-new-code"
          v-model="newCode"
          inputmode="numeric"
          pattern="[0-9]*"
          autocomplete="one-time-code"
          maxlength="6"
          class="tw-w-full tw-font-mono"
          style="letter-spacing: 0.5rem; font-size: 1.5rem; text-align: center; height: 3rem;"
          :invalid="!!errors.newCode"
          :disabled="verifyingNew"
          @paste="handlePaste($event, 'newCode')"
        />
        <small v-if="errors.newCode" class="p-error tw-text-center">{{ $t(errors.newCode) }}</small>
      </div>

      <p class="tw-text-xs tw-text-muted-strong tw-mb-4">{{ $t('The code expires after 10 minutes.') }}</p>

      <div class="tw-flex tw-flex-col sm:tw-flex-row tw-gap-3">
        <AppButton type="submit" variant="primary" class="sm:tw-w-auto" :loading="verifyingNew" :disabled="newCode.length !== 6 || verifyingNew">
          {{ verifyingNew ? $t('Verifying') + '...' : $t('Verify new email') }}
        </AppButton>
        <AppButton
          type="button"
          variant="outline"
          class="sm:tw-w-auto"
          :disabled="resendCooldown > 0 || requesting"
          @click="resendNewCode"
        >
          {{ resendCooldown > 0 ? $t('Resend code') + ` (${resendCooldown}s)` : $t('Resend code') }}
        </AppButton>
        <AppButton type="button" variant="outline" class="sm:tw-w-auto" :disabled="verifyingNew || requesting" @click="resetFlow">
          {{ $t('Start over') }}
        </AppButton>
      </div>
    </form>

    <!-- ═══ Phase: oldCode (confirm from the OLD email) ═══ -->
    <form v-else-if="phase === 'oldCode'" @submit.prevent="submitOldCode">
      <div class="tw-bg-blue-50 tw-border tw-border-blue-200 tw-text-blue-800 tw-rounded-lg tw-p-4 tw-mb-4 tw-text-sm">
        <p class="tw-font-semibold tw-mb-1">{{ $t('Your new email was verified.') }}</p>
        <p>{{ $t('A confirmation code was sent to your current email address.') }}</p>
        <p class="tw-mt-1">
          {{ $t('Confirm the change from') }}
          <strong class="tw-font-mono">{{ currentEmail }}</strong>.
        </p>
      </div>

      <div class="tw-flex tw-flex-col tw-gap-1 tw-mb-3">
        <label for="email-change-old-code" class="tw-text-sm tw-font-medium">{{ $t('Confirmation code') }}</label>
        <InputText
          id="email-change-old-code"
          v-model="oldCode"
          inputmode="numeric"
          pattern="[0-9]*"
          autocomplete="one-time-code"
          maxlength="6"
          class="tw-w-full tw-font-mono"
          style="letter-spacing: 0.5rem; font-size: 1.5rem; text-align: center; height: 3rem;"
          :invalid="!!errors.oldCode"
          :disabled="confirming"
          @paste="handlePaste($event, 'oldCode')"
        />
        <small v-if="errors.oldCode" class="p-error tw-text-center">{{ $t(errors.oldCode) }}</small>
      </div>

      <p class="tw-text-xs tw-text-muted-strong tw-mb-4">{{ $t('The code expires after 10 minutes.') }}</p>

      <div class="tw-flex tw-flex-col sm:tw-flex-row tw-gap-3">
        <AppButton type="submit" variant="primary" class="sm:tw-w-auto" :loading="confirming" :disabled="oldCode.length !== 6 || confirming">
          {{ confirming ? $t('Confirming') + '...' : $t('Confirm email change') }}
        </AppButton>
        <AppButton type="button" variant="outline" class="sm:tw-w-auto" :disabled="confirming" @click="resetFlow">
          {{ $t('Start over') }}
        </AppButton>
      </div>
    </form>
  </section>
</template>

<script setup>
import { ref, reactive, computed, watch, onUnmounted } from 'vue';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';

import AppButton from '@/v3/components/ui/AppButton.vue';
import { useNotification } from '@/v3/composables/useNotification.js';
import { apiPost } from '@/v3/services/httpClient.js';
import {
  AUTH_REQUEST_EMAIL_CHANGE,
  AUTH_VERIFY_EMAIL_CHANGE,
  AUTH_VERIFY_EMAIL_CHANGE_CONFIRM,
} from '@/v3/config/apiEndpoints.js';
import { user as authUser, setAuthManually } from '@/v3/composables/useAuth.js';

const { success: notifySuccess, error: notifyError, info: notifyInfo } = useNotification();

const currentEmail = computed(() => authUser.value?.email || '');

// Phases: idle → request → newCode → oldCode → (switch) → idle
const phase = ref('idle');
const form = reactive({ newEmail: '', password: '' });
const errors = reactive({ newEmail: '', password: '', newCode: '', oldCode: '' });
const newCode = ref('');
const oldCode = ref('');
const requesting = ref(false);
const verifyingNew = ref(false);
const confirming = ref(false);
const rateLimitError = ref('');
const resendCooldown = ref(0);
let cooldownTimer = null;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

onUnmounted(() => {
  if (cooldownTimer) clearInterval(cooldownTimer);
  // Never leave the password in component state longer than the flow lives.
  form.password = '';
});

function startCooldown() {
  resendCooldown.value = 60;
  if (cooldownTimer) clearInterval(cooldownTimer);
  cooldownTimer = setInterval(() => {
    resendCooldown.value--;
    if (resendCooldown.value <= 0) {
      clearInterval(cooldownTimer);
      cooldownTimer = null;
    }
  }, 1000);
}

function startRequest() {
  resetFlow();
  phase.value = 'request';
}

function resetFlow() {
  phase.value = 'idle';
  form.newEmail = '';
  form.password = '';
  newCode.value = '';
  oldCode.value = '';
  errors.newEmail = '';
  errors.password = '';
  errors.newCode = '';
  errors.oldCode = '';
  rateLimitError.value = '';
}

/**
 * Paste-safe digit stripping (same pattern as VerifyEmail.vue): strip
 * non-digits before maxlength can truncate the pasted text.
 */
function handlePaste(event, target) {
  event.preventDefault();
  const pastedText = (event.clipboardData || window.clipboardData).getData('text');
  const cleaned = pastedText.replace(/\D/g, '').slice(0, 6);
  if (target === 'newCode') newCode.value = cleaned;
  else oldCode.value = cleaned;
}

watch(newCode, (val) => {
  const cleaned = val.replace(/\D/g, '').slice(0, 6);
  if (cleaned !== val) newCode.value = cleaned;
});

watch(oldCode, (val) => {
  const cleaned = val.replace(/\D/g, '').slice(0, 6);
  if (cleaned !== val) oldCode.value = cleaned;
});

function validateRequest() {
  errors.newEmail = '';
  errors.password = '';
  rateLimitError.value = '';

  if (!form.newEmail) {
    errors.newEmail = 'Email is required';
  } else if (!EMAIL_PATTERN.test(form.newEmail)) {
    errors.newEmail = 'Invalid email address';
  } else if (form.newEmail.trim().toLowerCase() === String(currentEmail.value).trim().toLowerCase()) {
    errors.newEmail = 'This is already your email address.';
  }

  if (!form.password) {
    errors.password = 'Password is required';
  }

  return !errors.newEmail && !errors.password;
}

async function submitRequest() {
  if (requesting.value || !validateRequest()) return;

  requesting.value = true;

  try {
    await apiPost(AUTH_REQUEST_EMAIL_CHANGE, {
      current_password: form.password,
      new_email: form.newEmail,
    });
    phase.value = 'newCode';
    startCooldown();
    notifyInfo(
      'A verification code has been sent to your new email address.',
      { summary: 'Verification code sent', life: 5000 }
    );
  } catch (error) {
    handleRequestError(error);
  } finally {
    requesting.value = false;
  }
}

/** Stage-1 resend: re-runs request-email-change (mints a fresh new-email OTP). */
async function resendNewCode() {
  if (requesting.value || resendCooldown.value > 0) return;

  requesting.value = true;
  errors.newCode = '';
  newCode.value = '';
  rateLimitError.value = '';

  try {
    await apiPost(AUTH_REQUEST_EMAIL_CHANGE, {
      current_password: form.password,
      new_email: form.newEmail,
    });
    startCooldown();
    notifyInfo(
      'A new verification code has been sent to your new email address.',
      { summary: 'Code resent', life: 5000 }
    );
  } catch (error) {
    handleRequestError(error);
  } finally {
    requesting.value = false;
  }
}

function handleRequestError(error) {
  if (error?.status === 429) {
    rateLimitError.value = error?.payload?.body?.message || 'Too many attempts. Please wait and try again.';
    return;
  }
  if (error?.status === 422 && error?.payload?.errors) {
    const apiErrors = error.payload.errors;
    if (apiErrors.current_password) errors.password = apiErrors.current_password;
    if (apiErrors.new_email) errors.newEmail = apiErrors.new_email;
    // The shared unique rule reports the entity `email` field.
    if (apiErrors.email && !apiErrors.new_email) errors.newEmail = apiErrors.email;
    return;
  }
  if (error?.status === 401) return; // centralized sign-out owns 401s
  notifyError('Could not send the verification code. Please try again.', { summary: 'Error', life: 3000 });
}

async function submitNewCode() {
  if (verifyingNew.value || newCode.value.length !== 6) return;

  verifyingNew.value = true;
  errors.newCode = '';
  rateLimitError.value = '';

  try {
    const response = await apiPost(AUTH_VERIFY_EMAIL_CHANGE, { code: newCode.value });

    if (response?.stage === 'old_email_confirmation_required') {
      phase.value = 'oldCode';
      notifyInfo(
        'A confirmation code was sent to your current email address.',
        { summary: 'Confirm the change', life: 5000 }
      );
    } else {
      errors.newCode = 'Invalid verification code.';
    }
  } catch (error) {
    handleCodeError(error, 'newCode');
  } finally {
    verifyingNew.value = false;
  }
}

async function submitOldCode() {
  if (confirming.value || oldCode.value.length !== 6) return;

  confirming.value = true;
  errors.oldCode = '';
  rateLimitError.value = '';

  try {
    const response = await apiPost(AUTH_VERIFY_EMAIL_CHANGE_CONFIRM, { code: oldCode.value });

    if (response?.jwt) {
      setAuthManually({
        jwt: response.jwt,
        jwt_expiry: response.jwt_expiry,
        userData: response.user,
      });
      resetFlow();
      notifySuccess('Email changed successfully', { summary: 'Email address', life: 4000 });
    } else {
      errors.oldCode = 'Invalid verification code.';
    }
  } catch (error) {
    handleCodeError(error, 'oldCode');
  } finally {
    confirming.value = false;
  }
}

function handleCodeError(error, field) {
  if (error?.status === 429) {
    rateLimitError.value = error?.payload?.body?.message || 'Too many attempts. Please wait and try again.';
    return;
  }
  if (error?.status === 422 && error?.payload?.errors?.code) {
    errors[field] = error.payload.errors.code;
    return;
  }
  if (error?.status === 401) return; // centralized sign-out owns 401s
  errors[field] = 'Invalid verification code.';
}
</script>
