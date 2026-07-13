<template>
  <div class="tw-border-2 tw-border-dashed tw-border-red-300 tw-rounded-2xl tw-p-6 tw-flex tw-flex-col tw-items-center tw-justify-center tw-h-full tw-cursor-pointer hover:tw-shadow-md tw-transition" @click="$router.push({ name: 'add-new-file', query: { requiredFile: name } })">
    <div class="tw-w-16 tw-h-16 tw-flex tw-items-center tw-justify-center tw-bg-blue-100 tw-rounded-full tw-mb-4">
      <i class="pi pi-plus tw-text-2xl"></i>
    </div>
    <h4 class="tw-font-semibold tw-text-lg">{{ $t("Upload Required File") }}</h4>
    <div class="tw-mt-3 tw-w-full tw-flex tw-flex-col tw-items-center tw-gap-1">
      <span class="tw-text-red-700 tw-font-medium tw-text-sm">{{ $t(name) }}</span>
      
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  name: String,
});
</script>

<style scoped>
.tw-line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>