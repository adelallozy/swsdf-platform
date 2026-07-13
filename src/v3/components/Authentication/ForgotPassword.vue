<template>
  <div class="auth_login">
    <div class="tw-w-full md:tw-max-w-xl tw-max-w-[600px]">
      <!-- Back link -->
      <RouterLink
        :to="{ name: 'sign-in', params: { locale: authLocale } }"
        class="tw-text-lg tw-text-muted-strong tw-mb-6 tw-block tw-font-medium"
      >
        <i class="pi" :class="isRtl ? 'pi-arrow-right' : 'pi-arrow-left'"></i>
        <span class="tw-ms-1">{{$t('Back')}}</span>
      </RouterLink>

      <!-- Heading -->
      <h1 class="tw-mb-3">
        <span class="tw-text-5xl tw-capitalize tw-font-bold tw-leading-9 tw-block">
          {{$t('Reset password')}}
        </span>
      </h1>

      <!-- Intro -->
      <p class="tw-max-w-[70%] tw-mt-3 tw-mb-5 tw-text-muted-strong">
        {{$t('Please enter your email below to recover your password.')}}
      </p>

      <!-- Form -->
      <form @submit.prevent="onSubmit" class="tw-space-y-4 md:tw-space-y-5">
        <!-- Email -->
        <div class="tw-flex tw-flex-col tw-gap-1">
          <label for="email" class="label">{{$t('Email')}}</label>
          <InputText
            id="email"
            v-model.trim="form.email"
            type="email"
            :placeholder="$t('Enter your email')"
            autocomplete="username"
            :invalid="!!errors.email"
            class="tw-w-full"
          />
          <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
        </div>

        <!-- API/global error -->
        <p v-if="apiError" class="tw-text-danger tw-text-center">{{ apiError }}</p>

        <!-- Submit -->
        <Button
          type="submit"
          class="tw-w-full tw-mt-10"
          :label="submitting ? $t('Sending…') : $t('Send reset link')"
          :loading="submitting"
          :disabled="submitting"
        />
      </form>

      <!-- Footer CTA -->
      <p class="tw-mt-6 tw-text-center tw-text-muted tw-mb-0 tw-text-sm">
        {{$t('Remember your password?')}}
        <RouterLink :to="{ name: 'sign-in', params: { locale: authLocale } }" class="tw-text-primary tw-ms-1 tw-font-medium">
          {{$t('Sign in')}}
        </RouterLink>
      </p>
    </div>
 
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button' 
import { useToast } from 'primevue/usetoast'
import { apiPost } from '@/v3/services/httpClient.js'
import { useErrorHandler } from '@/v3/composables/useErrorHandler'

const { locale } = useI18n()
const isRtl = computed(() => locale.value === 'ar')
const router = useRouter()
const route = useRoute()
const toast = useToast()
const { capture } = useErrorHandler()

const form = reactive({ email: '' })
const errors = reactive({ email: '' })
const submitting = ref(false)
const apiError = ref('')
const authLocale = computed(() => {
  const routeLocale = route.params?.locale
  if (routeLocale === 'ar' || routeLocale === 'en') {
    return routeLocale
  }
  return locale.value === 'en' ? 'en' : 'ar'
})

const ENDPOINT = import.meta.env.VITE_USERS_FORGOT_PASSWORD || '/users/forgot-password'

function validate() {
  errors.email = ''
  apiError.value = ''

  if (!form.email) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Invalid email address'
  }
  return !errors.email
}

async function onSubmit() {
  if (!validate()) return
  submitting.value = true

  try {
    await apiPost(ENDPOINT, { email: form.email })
    
    router.push({ name: 'sign-in', params: { locale: authLocale.value } })
    toast.add({
      severity: 'success',
      summary: 'Reset password',
      detail: 'Please check your email inbox for reset instructions',
      life: 2500
    })

    // brief delay so toast is visible, then route back to sign-in
    // setTimeout(() => , 900)
  } catch (e) {
    const message = e?.message || 'An unexpected error occurred'
    apiError.value = message
    capture(message, { where: 'ResetPassword', email: form.email })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
/* Styles derive from Aura + Tailwind theme; no extra rules needed here */
</style>
