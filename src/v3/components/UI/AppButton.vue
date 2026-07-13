<!-- /src/v3/components/ui/AppButton.vue -->
<template>
  <button
    :type="type"
    :class="[classes, isDisabled ? 'tw-opacity-60 tw-cursor-not-allowed' : '']"
    :disabled="isDisabled"
    :aria-busy="loading ? 'true' : 'false'"
    @click="!isDisabled && emit('click', $event)"
  >
    <!-- start icon or spinner -->
    <i
      v-if="loading"
      class="pi pi-spinner tw-animate-spin tw-me-2"
      aria-hidden="true"
    />
    <i
      v-else-if="icon && iconPosition === 'start'"
      :class="['pi', icon, 'tw-me-2']"
      aria-hidden="true"
    />

    <slot>{{ label }}</slot>

    <!-- end icon -->
    <i
      v-if="!loading && icon && iconPosition === 'end'"
      :class="['pi', icon, 'tw-ms-2']"
      aria-hidden="true"
    />
  </button>
</template>

<script setup>
import { computed } from 'vue'

const emit = defineEmits(['click'])

const props = defineProps({
  label: { type: String, default: '' },
  type:  { type: String, default: 'button' },
  icon:  { type: String, default: '' },
  iconPosition: { type: String, default: 'start' }, // 'start' | 'end'
  size:  { type: String, default: 'md' },           // 'sm' | 'md' | 'lg'
  variant: { type: String, default: 'primary' },    // 'primary' | 'soft' | 'outline' | 'ghost' | 'link'
  block: { type: Boolean, default: false },
  rounded: { type: Boolean, default: true },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false }
})

const isDisabled = computed(() => props.disabled || props.loading)

const sizeClass = {
  sm: 'tw-text-sm tw-px-3 tw-py-2',
  md: 'tw-text-sm tw-px-4 tw-py-2.5',
  lg: 'tw-text-base tw-px-5 tw-py-3'
}[props.size]

const radius = props.rounded ? 'tw-rounded-xl' : 'tw-rounded-md'

const variantClass = {
  primary: 'tw-bg-primary tw-text-white hover:tw-bg-primary-600 active:tw-bg-primary-700 tw-shadow-sm',
  soft:    'tw-bg-primary-50 tw-text-primary hover:tw-bg-primary-100',
  outline: 'tw-border tw-border-primary tw-text-primary hover:tw-bg-primary-50',
  ghost:   'tw-text-primary hover:tw-bg-primary-50',
  link:    'tw-text-primary tw-underline-offset-4 hover:tw-underline tw-bg-transparent'
}[props.variant]

const classes = [
  'tw-inline-flex tw-items-center tw-justify-center tw-select-none',
  'focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-primary-300',
  'tw-transition tw-duration-150 tw-ease-in-out',
  sizeClass,
  radius,
  variantClass,
  props.block ? 'tw-w-full' : ''
].join(' ')
</script>
