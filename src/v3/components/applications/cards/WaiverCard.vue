<!-- FILE: src/v3/components/applications/cards/WaiverCard.vue -->
<!-- TOKEN: CARD-WAIVER-v1-2025-10-13-01 -->

<template>
    <div class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-p-5">
      <div class="tw-flex tw-items-start tw-justify-between tw-gap-3">
        <div>
          <h2 class="tw-text-xl tw-font-bold">{{ $t('Waiver & Acknowledgement') }}</h2>
          <p class="tw-text-slate-600 tw-mt-1">
            {{ $t('You must read and accept the waiver before submission.') }}
          </p>
        </div>
        <div class="tw-flex tw-items-center tw-gap-2">
          <span
            class="tw-inline-flex tw-items-center tw-gap-2 tw-rounded-full tw-px-3 tw-py-1 tw-text-sm"
            :class="accepted ? 'tw-bg-emerald-50 tw-text-emerald-700' : 'tw-bg-amber-50 tw-text-amber-700'"
          >
            <i class="pi" :class="accepted ? 'pi-check-circle' : 'pi-exclamation-triangle'" />
            {{ accepted ? $t('Accepted') : $t('Pending') }}
          </span>
          <AppButton
            v-if="canEdit"
            variant="soft"
            icon="pi pi-file"
            :label="$t('Open Waiver')"
            @click="$emit('open')"
          />
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import AppButton from '@/v3/components/ui/AppButton.vue'
  defineProps({
    accepted: { type: Boolean, default: false },
    canEdit: { type: Boolean, default: false }
  })
  defineEmits(['open'])
  </script>
  