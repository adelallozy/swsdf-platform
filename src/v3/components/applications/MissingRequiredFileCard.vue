<!-- src/v3/components/Applications/MissingRequiredFileCard.vue -->
<template>
  <router-link
    :to="{
      name: 'application-file-upload',
      params: { 
        locale: $route.params.locale, 
        appId: applicationId 
      },
      query: { requiredFile: name }
    }"
    class="tw-border-2 tw-border-dashed tw-border-red-300 tw-rounded-2xl tw-p-6 tw-flex tw-flex-col tw-items-center tw-justify-center tw-h-full tw-cursor-pointer hover:tw-shadow-md tw-transition tw-no-underline"
  >
    <div class="tw-w-16 tw-h-16 tw-flex tw-items-center tw-justify-center tw-bg-red-100 tw-rounded-full tw-mb-4">
      <i class="pi pi-exclamation-triangle tw-text-2xl tw-text-red-600"></i>
    </div>
    <h4 class="tw-font-semibold tw-text-lg tw-text-foreground tw-text-center">
      {{ $t("Upload Required File") }}
    </h4>
    <div class="tw-mt-3 tw-w-full tw-flex tw-flex-col tw-items-center tw-gap-1">
      <span class="tw-text-red-700 tw-font-medium tw-text-sm tw-text-center file-name-clamp">
        {{ $t(name) }}
      </span>
    </div>
  </router-link>
</template>

<script setup>
defineProps({
  name: {
    type: String,
    required: true
  },
  applicationId: {
    type: [String, Number],
    required: true
  },
});
</script>

<style scoped>
.file-name-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
