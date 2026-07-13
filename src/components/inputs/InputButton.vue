<template>
  <button v-if="meta" :type="type" :disabled="loading">
    <div v-if="loading" class="lds-dual-ring"></div>

    <span v-else-if="!iconOnly">
      {{ $t(name) }}
    </span>
    <slot v-if="!loading" />
  </button>
  <button v-else :type="type" :disabled="loading" class="base-btn">
    <div v-if="loading" class="lds-dual-ring"></div>

    <span v-else-if="!iconOnly">
      {{ $t(name) }}
    </span>
    <slot v-if="!loading" />
  </button>
</template>

<script setup>
defineProps({
  meta: {
    required: false,
  },
  type: {
    required: false,
    default: "button",
  },
  name: {
    required: true,
  },
  loading: {
    required: false,
    default: false,
  },
  iconOnly: {
    required: false,
    default: false,
  },
});
</script>
