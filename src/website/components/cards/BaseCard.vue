<template>
  <div class="base-card">
    <div class="tw-mb-4">
      <h3 v-if="title" class="tw-text-foreground tw-font-bold tw-text-xl tw-mb-1">
        {{ $t(title) }}
      </h3>
      <p v-if="desc" class="tw-text-muted">{{ $t(desc) }}</p>
    </div>
    <slot />
  </div>
</template>

<script setup>
defineProps({
  title: {
    required: false,
  },
  desc: {
    required: false,
  },
});
</script>

<style lang="scss">
.base-card {
  box-shadow: 0px 7px 58px 0px #b1b1b11a;
  @apply tw-p-6 tw-rounded-xl;
}
</style>
