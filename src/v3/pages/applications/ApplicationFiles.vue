<template>
    <div class="tw-pt-10 tw-pb-24 tw-px-4">
      <section class="tw-max-w-3xl tw-mx-auto tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-[0_8px_30px_rgba(3,87,150,.06)] tw-p-4 sm:tw-p-6 md:tw-p-8">
        <header class="tw-mb-6">
          <h1 class="tw-text-xl tw-font-bold">{{ $t('Common.RequiredDocuments') }}</h1>
          <p class="tw-text-slate-600 tw-mt-1">{{ $t('Files.Description') }}</p>
        </header>
  
        <!-- Add new file (reference-based for now) -->
        <div class="tw-grid md:tw-grid-cols-3 tw-gap-3 tw-mb-6">
          <input
            v-model.trim="newKey"
            type="text"
            class="p-inputtext tw-w-full"
            :placeholder="$t('Files.DocumentTypeKey')"
          />
          <input
            v-model.trim="newRef"
            type="text"
            class="p-inputtext tw-w-full"
            :placeholder="$t('Files.FileReferenceOrId')"
          />
          <AppButton
            variant="primary"
            icon="pi pi-plus"
            :loading="adding"
            :disabled="!newKey || !newRef"
            @click="onAddFile"
          >
            {{ $t('Common.Add') }}
          </AppButton>
        </div>
  
        <!-- List -->
        <div class="tw-overflow-auto tw-border tw-rounded-xl">
          <table class="tw-min-w-full">
            <thead class="tw-bg-slate-50">
              <tr class="tw-text-left">
                <th class="tw-p-3 tw-text-sm tw-text-slate-600">{{ $t('Files.Type') }}</th>
                <th class="tw-p-3 tw-text-sm tw-text-slate-600">{{ $t('Files.Ref') }}</th>
                <th class="tw-p-3 tw-text-sm tw-text-slate-600 tw-w-24">{{ $t('Common.Actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="f in files" :key="f.id" class="tw-border-t">
                <td class="tw-p-3 tw-font-medium">{{ f.key }}</td>
                <td class="tw-p-3 tw-text-slate-600 tw-text-sm break-all">{{ f.ref }}</td>
                <td class="tw-p-3">
                  <AppButton
                    variant="ghost"
                    icon="pi pi-trash"
                    :loading="removingId === f.id"
                    @click="onRemove(f)"
                  >
                    {{ $t('Common.Delete') }}
                  </AppButton>
                </td>
              </tr>
              <tr v-if="files.length === 0">
                <td class="tw-p-3 tw-text-slate-500" colspan="3">{{ $t('Files.NoFiles') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
  
        <div class="tw-flex tw-justify-end tw-gap-2 tw-mt-8">
          <AppButton variant="ghost" icon="pi pi-arrow-left" @click="goBack">
            {{ $t('Common.Back') }}
          </AppButton>
          <RouterLink :to="{ name: 'app-summary', params: { appId } }">
            <AppButton variant="primary" icon="pi pi-check">
              {{ $t('Common.Done') }}
            </AppButton>
          </RouterLink>
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
  // const { listFiles, uploadFileRef, deleteFileRef } = useSportFishingApplicationApi()
  
  const appId = route.params.appId
  
  const files = ref([])
  const newKey = ref('')
  const newRef = ref('')
  const adding = ref(false)
  const removingId = ref(null)
  
  async function load() {
    try {
      // const res = await listFiles(appId)
      files.value = res?.files || res?.data || res || []
    } catch (e) {
      capture(e, { context: 'AppFiles.load', meta: { appId } })
      notifyError('errors.loadFailed')
    }
  }
  
  async function onAddFile() {
    try {
      adding.value = true
      // const res = await uploadFileRef(appId, { key: newKey.value, ref: newRef.value })
      const f = res?.file || res?.data || res
      if (f) files.value.unshift(f)
      newKey.value = ''
      newRef.value = ''
      notifySuccess('Common.Saved')
    } catch (e) {
      capture(e, { context: 'AppFiles.add', meta: { appId } })
      notifyError('errors.saveFailed')
    } finally {
      adding.value = false
    }
  }
  
  async function onRemove(f) {
    try {
      removingId.value = f.id
      // await deleteFileRef(appId, f.id)
      files.value = files.value.filter(x => x.id !== f.id)
      notifySuccess('Common.Deleted')
    } catch (e) {
      capture(e, { context: 'AppFiles.remove', meta: { appId, fileId: f.id } })
      notifyError('errors.saveFailed')
    } finally {
      removingId.value = null
    }
  }
  
  function goBack() {
    router.back()
  }
  
  onMounted(load)
  </script>
  