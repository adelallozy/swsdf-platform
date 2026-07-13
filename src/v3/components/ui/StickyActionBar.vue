<!-- /src/v3/components/ui/StickyActionBar.vue -->
<template>
  <div class="tw-fixed tw-inset-x-0 tw-bottom-0 tw-z-40 tw-p-3 md:tw-hidden">
    <div class="tw-backdrop-blur tw-bg-white/85 tw-shadow-card tw-rounded-2xl tw-border tw-border-border tw-p-2 tw-flex tw-gap-2 tw-justify-between">
      <AppButton
        v-for="(a,i) in actions"
        :key="i"
        :label="a.label"
        :icon="a.icon"
        :variant="a.variant || 'primary'"
        :block="true"
        @click="a.onClick && a.onClick()"
      />
    </div>
  </div>
</template>

<script setup>
import AppButton from '@/v3/components/ui/AppButton.vue'
defineProps({
  actions: { type: Array, default: () => [] } // [{label, icon, onClick, variant?}]
})
</script>
