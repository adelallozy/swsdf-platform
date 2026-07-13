<!-- /src/v3/components/ui/ActionToolbar.vue -->
<template>
  <div class="tw-flex tw-flex-wrap tw-gap-2 tw-items-center"
       :class="[$i18n?.locale === 'ar' ? 'tw-justify-start' : 'tw-justify-end']">
    <!-- Primary actions -->
    <AppButton
      v-for="(a, i) in primary"
      :key="'p'+i"
      :label="a.label"
      :icon="a.icon"
      :variant="a.variant || 'primary'"
      :size="a.size || 'md'"
      @click="a.onClick && a.onClick()"
    />
    <!-- Secondary actions -->
    <AppButton
      v-for="(a, i) in secondary"
      :key="'s'+i"
      :label="a.label"
      :icon="a.icon"
      :variant="a.variant || 'soft'"
      :size="a.size || 'md'"
      @click="a.onClick && a.onClick()"
    />
  </div>
</template>

<script setup>
import AppButton from '@/v3/components/ui/AppButton.vue'

defineProps({
  primary:   { type: Array, default: () => [] },   // [{label, icon, onClick, variant?}]
  secondary: { type: Array, default: () => [] }
})
</script>
