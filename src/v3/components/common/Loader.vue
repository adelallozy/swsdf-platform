<!-- src/v3/components/common/Loader.vue -->
<template>
  <div
    class="tw-w-full tw-flex tw-items-center tw-justify-center"
    :class="containerClass"
  >
    <div
      class="tw-flex tw-flex-col tw-items-center tw-gap-3"
      role="status"
      :aria-label="t(text)"
      aria-live="polite"
    >
      <!-- Spinner -->
      <div
        :class="[
          'tw-rounded-full tw-border-solid tw-border-current tw-border-t-transparent tw-animate-spin',
          spinnerSizeClass,
          spinnerBorderClass,
          colorClass
        ]"
      />
      <!-- Message -->
      <p v-if="showText && !srOnly" class="tw-text-sm tw-text-slate-600">
        <slot>{{ t(text) }}</slot>
      </p>

      <!-- Screen-reader only message -->
      <span v-if="srOnly" class="tw-sr-only">
        <slot>{{ t(text) }}</slot>
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  /** i18n key or plain text */
  text: { type: String, default: 'Loading' },
  /** sm | md | lg */
  size: { type: String, default: 'md' },
  /** color tone: sky | slate | emerald | red, etc. */
  tone: { type: String, default: 'sky' },
  /** show message text under spinner */
  showText: { type: Boolean, default: true },
  /** hide visual text but keep it for screen readers */
  srOnly: { type: Boolean, default: false },
  /** make container fill the viewport height */
  fullscreen: { type: Boolean, default: false },
})

const { t } = useI18n()

const spinnerSizeClass = computed(() => {
  switch (props.size) {
    case 'sm': return 'tw-w-6 tw-h-6'
    case 'lg': return 'tw-w-14 tw-h-14'
    default:   return 'tw-w-10 tw-h-10'
  }
})
const spinnerBorderClass = computed(() => {
  switch (props.size) {
    case 'sm': return 'tw-border-2'
    case 'lg': return 'tw-border-4'
    default:   return 'tw-border-4'
  }
})
const colorClass = computed(() => `tw-text-${props.tone}-600`)
const containerClass = computed(() => ({
  'tw-min-h-screen': props.fullscreen,
}))
</script>

<style scoped>
/* No extra styles; all via Tailwind tw- utilities */
</style>
