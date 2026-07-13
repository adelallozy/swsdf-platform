<template>
  <div class="tw-w-full">
    <!-- Loading -->
    <div v-if="loading" class="tw-grid tw-gap-4 sm:tw-grid-cols-2 md:tw-grid-cols-3 lg:tw-grid-cols-4">
      <Skeleton v-for="i in 8" :key="i" height="240px" class="tw-rounded-2xl" />
    </div>

    <!-- Items -->
    <div
      v-else-if="items?.length"
      class="tw-grid tw-gap-4 sm:tw-grid-cols-2 md:tw-grid-cols-3 lg:tw-grid-cols-4"
    >
    
      <FileTile
        v-for="(doc, i) in items"
        :key="i"
        :title="doc.name"
        :type="doc.type || 'file'"
        :href="doc.link"
      >
        <template #meta>
          <!-- Example extra meta slot (optional): -->
          <Tag v-if="doc.badge" :value="$t(doc.badge)" />
        </template>
      </FileTile>
    </div>

    <!-- Empty -->
    <div v-else class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-gap-3 tw-py-10 tw-text-center">
      <i class="pi pi-folder-open tw-text-5xl tw-text-slate-400" aria-hidden="true"></i>
      <p class="tw-text-lg tw-text-slate-600">{{ $t('No Files') }}</p>
    </div>
  </div>
</template>

<script setup>
import FileTile from '@/v3/components/files/FileTile.vue';
import Tag from 'primevue/tag';
import Skeleton from 'primevue/skeleton';

defineProps({
  items: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
});
</script>
