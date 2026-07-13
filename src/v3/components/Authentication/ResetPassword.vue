<template>
 
    <div class="tw-w-full  ">
      <!-- Heading -->
      <h1 class="tw-mb-8 tw-w-full">
        <span class="tw-text-4xl tw-capitalize tw-font-bold tw-leading-9 tw-block">
          {{$t('Change password')}}
        </span>
      </h1>

      <!-- Intro (optional) -->
      <p class="tw-text-muted-strong tw-mb-6">
        {{$t('Create a new password and confirm it below.')}}
      </p>

      <form @submit.prevent="onSubmit" class="tw-space-y-4 md:tw-space-y-5">
        <!-- New password -->
        <div class="tw-flex tw-flex-col tw-gap-1">
          <label for="newPassword" class="label">{{$t('New password')}}</label>
          <Password
            inputId="newPassword"
            v-model.trim="form.password"
            :feedback="false"
            toggleMask
            :invalid="!!errors.password"
            :inputProps="{ autocomplete: 'new-password', class: 'tw-w-full' }"
            class="tw-w-full"
            :placeholder="$t('Enter a new password')"
          />
          <small v-if="errors.password" class="p-error">{{ errors.password }}</small>
        </div>

        <!-- Confirm password -->
        <div class="tw-flex tw-flex-col tw-gap-1">
          <label for="confirmPassword" class="label">{{$t('Confirm new password')}}</label>
          <Password
            inputId="confirmPassword"
            v-model.trim="form.confirm"
            :feedback="false"
            toggleMask
            :invalid="!!errors.confirm"
            :inputProps="{ autocomplete: 'new-password', class: 'tw-w-full' }"
            class="tw-w-full"
            :placeholder="$t('Re-enter the new password')"
          />
          <small v-if="errors.confirm" class="p-error">{{ errors.confirm }}</small>
        </div>

        <!-- API/global error -->
        <p v-if="apiError" class="tw-text-danger tw-text-center">{{ apiError }}</p>

        <!-- Submit -->
        <Button
          type="submit"
          class="tw-w-full tw-mt-10"
          :label="submitting ? $t('Changing…') : $t('Change password')"
          :loading="submitting || verifying"
          :disabled="submitting || verifying"
        />
      </form>

      <!-- Back to sign in -->
      <p class="tw-mt-6 tw-text-center tw-text-muted tw-mb-0 tw-text-sm">
        {{$t('Remember your password?')}}
        <RouterLink :to="{ name: 'sign-in', params: { locale: authLocale } }" class="tw-text-primary tw-ms-1 tw-font-medium">
          {{$t('Sign in')}}
        </RouterLink>
      </p>
    </div> 
  
</template>

<script setup>
import { reactive, ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Password from 'primevue/password'
import Button from 'primevue/button' 
import { useToast } from 'primevue/usetoast'
import { apiPost, apiGet } from '@/v3/services/httpClient.js'
import { useErrorHandler } from '@/v3/composables/useErrorHandler'

const router = useRouter()
const route = useRoute()
const { locale } = useI18n()
const toast = useToast()
const { capture } = useErrorHandler()

const form = reactive({ password: '', confirm: '' })
const errors = reactive({ password: '', confirm: '' })
const submitting = ref(false)
const verifying = ref(false)
const apiError = ref('')
const jwtToken = ref('')
const authLocale = computed(() => {
    const routeLocale = route.params?.locale
    if (routeLocale === 'ar' || routeLocale === 'en') {
        return routeLocale
    }
    return locale.value === 'en' ? 'en' : 'ar'
})

const VERIFY_URL = import.meta.env.VITE_USERS_VERIFY_TOKEN || '/users/verify-token'
const RESET_URL  = import.meta.env.VITE_RESET_PASSWORD_URL || '/users/reset-password'

function validate() {
    errors.password = ''
    errors.confirm = ''
    apiError.value = ''

    if (!form.password) {
        errors.password = 'Password is required'
    } else if (form.password.length < 6) {
        errors.password = 'Password must be at least 6 characters'
    }

    if (!form.confirm) {
        errors.confirm = 'Confirmation is required'
    } else if (form.confirm !== form.password) {
        errors.confirm = 'Passwords must match'
    }

    return !errors.password && !errors.confirm
}

async function checkToken() {
  return ;
    const token = route.query.token
    if (!token) {
        router.push({ name: 'forgot-password', params: { locale: authLocale.value } })
        return
    }

    verifying.value = true

    try {
        // Prefer GET, fallback to POST if apiGet isn't available

        const params = new URLSearchParams();
        params.append("token", token );

        const res =   await apiGet(VERIFY_URL + '?' + params  ) 

        // Support both shapes: { api_jwtoken } or direct { token }
        jwtToken.value = res?.jwt || res?.api_jwtoken || ''

        // If backend signals unauthorized explicitly
        if (!jwtToken.value && (res?.status === 401 || res?.code === 401)) {
            router.push({ name: 'forgot-password', params: { locale: authLocale.value } })
        }
    } catch (e) {
        capture(e?.message || 'verify_error', { where: 'Reset user password, From ResetPassword.vue by checkToken' })
        router.push({ name: 'forgot-password', params: { locale: authLocale.value } })
    } finally {
        verifying.value = false
    }
}

async function onSubmit() {
    if (!validate()) return
    submitting.value = true

    const params = new URLSearchParams();
    params.append("token", route.query.token );


    try {
        const payload = {
            password: form.password,
            password_confirmation: form.confirm
        }

        await apiPost(RESET_URL + '?' + params, payload)
        router.push({ name: 'sign-in', params: { locale: authLocale.value } });

        toast.add({
            severity: 'success',
            summary:  'Change password',
            detail: 'Password reset successfully',
            life: 2500,
        })

        localStorage.removeItem('last_page')
    } catch (e) {
        const message = e?.message || 'An unexpected error occurred'
        apiError.value = message
        capture(message, { where: 'Reset user password, From ResetPassword.vue by onSubmit' })
    } finally {
        submitting.value = false
    }
}

onMounted(() => checkToken())
</script>

<style scoped>
/* Relies on global Aura + Tailwind styles */
</style>
