<template>    
  <div class="tw-w-full tw-flex tw-flex-row tw-justify-between tw-mx-auto">
        <header v-if="visible" class="tw-mb-4">
            <h1 class="tw-text-2xl md:tw-text-3xl lg:tw-text-4xl  tw-font-bold lg:tw-mb-6  md:tw-mb-4 tw-mb-3 tw-font-bold">{{ $t(title) }}</h1>
            <p v-if="subtitle" class="tw-mt-1 tw-text-sm tw-text-gray-600">{{ $t(subtitle) }}</p>
        </header>
    </div>
</template>

<script setup>

    import usePageHeading from '@/v3/composables/layout/usePageHeading.js';
    const { title, subtitle, visible } = usePageHeading();
    
</script>

