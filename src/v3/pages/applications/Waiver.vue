<template>
    <div class="tw-pt-10 tw-pb-24 tw-px-4">
      <section class="tw-max-w-3xl tw-mx-auto tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-[0_8px_30px_rgba(3,87,150,.06)] tw-p-4 sm:tw-p-6 md:tw-p-8">
        <header class="tw-mb-6">
          <h1 class="tw-text-xl tw-font-bold">{{ $t('Common.Waiver') }}</h1>
          <p class="tw-text-slate-600 tw-mt-1">{{ $t('Waiver.Description') }}</p>
        </header>
  
        <div class="tw-space-y-4">
          <div class="tw-p-4 tw-border tw-rounded-xl tw-bg-slate-50 tw-text-sm tw-leading-6">
            <!-- Render your waiver text via i18n key or HTML slot if you have it -->
            {{ $t('Waiver.Text') }}
          </div>
  
          <label class="tw-flex tw-items-start tw-gap-3">
            <input type="checkbox" class="tw-mt-1.5" v-model="accepted" />
            <span class="tw-text-sm">
              {{ $t('Waiver.AcceptLabel') }}
            </span>
          </label>
        </div>
  
        <div class="tw-flex tw-justify-end tw-gap-2 tw-mt-8">
          <AppButton variant="ghost" icon="pi pi-arrow-left" @click="goBack">
            {{ $t('Common.Back') }}
          </AppButton>
          <AppButton
            variant="primary"
            icon="pi pi-check"
            :loading="saving"
            :disabled="!accepted"
            @click="onSave"
          >
            {{ $t('Common.Save') }}
          </AppButton>
        </div>
      </section>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import AppButton from '@/v3/components/ui/AppButton.vue'
  import { useNotification } from '@/v3/composables/useNotification.js'
  import { useErrorHandler } from '@/v3/composables/useErrorHandler.js'
  // import useSportFishingApplicationApi from '@/v3/composables/applications/useSportFishingApplicationApi.js'
  
  const route = useRoute()
  const router = useRouter()
  const { success: notifySuccess, error: notifyError } = useNotification()
  const { capture } = useErrorHandler()
  // const { getWaiver, setWaiver } = useSportFishingApplicationApi()
  
  const appId = route.params.appId
  const accepted = ref(false)
  const saving = ref(false)
  
  async function load() {
    try {
      // const w = await getWaiver(appId)
      accepted.value = !!(w?.waiver?.accepted ?? w?.accepted ?? false)
    } catch (e) {
      capture(e, { context: 'Waiver.load', meta: { appId } })
      notifyError('errors.loadFailed')
    }
  }
  
  async function onSave() {
    try {
      saving.value = true
      // await setWaiver(appId, { accepted: true })
      notifySuccess('Common.Saved')
      router.replace({ name: 'app-summary', params: { appId } })
    } catch (e) {
      capture(e, { context: 'Waiver.save', meta: { appId } })
      notifyError('errors.saveFailed')
    } finally {
      saving.value = false
    }
  }
  
  function goBack() {
    router.back()
  }
  
  onMounted(load)
  </script>
  