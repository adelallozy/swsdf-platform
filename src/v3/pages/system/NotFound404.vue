<!-- src/v3/pages/system/NotFound404.vue -->
<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'

const props = defineProps({
  // route NAME of the suggested destination (e.g., "admins-home")
  redirect: { type: String, default: '' },
  // requested URL to display (passed via ?target=...); purely informational
  target: { type: String, default: '' }
})

console.log('redirect' , props.redirect);

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()

// current app locale (e.g., 'ar' or 'en')
const currentLocale = computed(() => String(locale.value || 'en'))

// resolve suggested route and label (from routes' meta.pageTitle)
const destRecord = computed(() => router.getRoutes().find(r => r.name === props.redirect))


console.log('destRecord' , destRecord.value);
const destTitle  = computed(() => destRecord.value?.meta?.pageTitle || t('Home'))

function goTarget() {
  if (destRecord.value) {
    router.replace({ name: destRecord.value.name, params: { locale: currentLocale.value } })
  } else {
    router.replace('/') // fallback to home
  }
}

function goBack() {
  if (history.length > 1) router.back()
  else router.replace('/')
}
</script>

<template>
  <div class="tw-flex tw-min-h-[70vh] tw-items-center tw-justify-center tw-p-6">
    <div class="apps-card tw-w-full tw-max-w-3xl tw-text-center tw-overflow-hidden">
      <!-- Header -->
      <div class="apps-card__header tw-px-6 tw-py-6">
        <div class="tw-flex tw-items-baseline tw-justify-center tw-gap-3">
          <span class="tw-text-lg tw-font-semibold tw-text-slate-600">{{ t('Page not found') }}</span>
          <span class="tw-text-slate-500">|</span>
          <span class="tw-text-4xl tw-font-extrabold tw-text-slate-800">404</span>
        </div>
        <p class="tw-mt-3 tw-text-slate-600">
          {{ t('The page you are looking for does not exist or was moved.') }}
        </p>
      </div>

      <!-- Body -->
      <div class="tw-px-8 tw-py-8 tw-space-y-5">
        <div class="tw-text-sm tw-text-slate-600">
          <span class="tw-inline-block tw-mb-1">{{ t('Requested URL') }}:</span>
          <code class="tw-bg-slate-100 dark:tw-bg-slate-800 tw-rounded tw-px-2 tw-py-1">
            {{ props.target || route.fullPath || '/' }}
          </code>
        </div>

        <div class="tw-text-sm tw-text-slate-600">
          <span class="tw-inline-block tw-mb-1">{{ t('Suggested destination') }}:</span>
          <code class="tw-bg-slate-100 dark:tw-bg-slate-800 tw-rounded tw-px-2 tw-py-1">
            {{ destTitle }}
          </code>
        </div>

        <div class="tw-flex tw-justify-center tw-gap-3 tw-pt-2">
          <Button size="small" severity="secondary" outlined @click="goBack">
            {{ t('Go back') }}
          </Button>
          <Button size="small" @click="goTarget">
            {{ t('Go to page') }}
          </Button>
        </div>
      </div>

      <!-- Footer -->
      <div class="apps-card__footer tw-px-6 tw-py-4 tw-text-xs tw-text-slate-500">
        {{ t('If you believe this is an error, please contact support.') }}
      </div>
    </div>
  </div>
</template>
