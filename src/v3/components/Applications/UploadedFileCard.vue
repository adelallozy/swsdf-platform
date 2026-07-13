<template>
  <div class="tw-border tw-rounded-lg tw-p-4 tw-shadow-sm tw-transition-shadow tw-transform hover:tw-scale-105 hover:tw-shadow-md">
    <div class="tw-flex tw-flex-col tw-h-full">
      <div class="tw-flex tw-items-center tw-justify-center tw-w-16 tw-h-16 tw-mx-auto tw-bg-blue-50 tw-rounded-lg tw-mb-3">
        <i :class="getIconForFile(file)" class="tw-text-blue-600 tw-text-2xl" aria-hidden="true"></i>
      </div>
      <div class="tw-flex-1">
        <h4 class="tw-font-semibold tw-text-gray-800 tw-text-sm tw-line-clamp-1 tw-mb-1">
          {{ $t(file.name) }}
        </h4>
        <p class="tw-text-xs tw-text-gray-500 tw-mb-3">{{ formatFileSize(file.size) }}</p>
      </div>
      <div class="tw-flex tw-gap-2 tw-mt-2">
        <a
          :href="`${WEB_URL}${file.link}`"
          target="_blank"
          class="tw-flex-1 tw-py-2 tw-bg-gray-50 hover:tw-bg-gray-100 tw-rounded-md tw-text-sm tw-text-gray-700 tw-flex tw-items-center tw-justify-center tw-gap-1"
        >
          <i class="fas fa-eye"></i>
          {{ $t("View") }}
        </a>
        <button
          v-if="canDelete"
          @click="$emit('delete-file', file)"
          class="tw-py-2 tw-px-3 tw-bg-red-50 hover:tw-bg-red-100 tw-rounded-md tw-text-sm tw-text-red-600 tw-transition-colors tw-flex tw-items-center tw-justify-center"
        >
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  file: Object,
  canDelete: Boolean
});

const WEB_URL = import.meta.env.VITE_WEB_BASE_URL;

function getIconForFile(file) {
  const name = file.name?.toLowerCase() || "";
  if (name.match(/\.(pdf)$/)) return "fas fa-file-pdf text-red-500";
  if (name.match(/\.(doc|docx)$/)) return "fas fa-file-word text-blue-500";
  if (name.match(/\.(xls|xlsx)$/)) return "fas fa-file-excel text-green-500";
  if (name.match(/\.(ppt|pptx)$/)) return "fas fa-file-powerpoint text-orange-500";
  if (name.match(/\.(jpg|jpeg|png|gif)$/)) return "fas fa-file-image text-purple-500";
  if (name.match(/\.(mp4|avi)$/)) return "fas fa-file-video text-red-600";
  if (name.match(/\.(mp3|wav)$/)) return "fas fa-file-audio text-yellow-500";
  return "fas fa-file";
}

function formatFileSize(bytes) {
  if (!bytes) return "";
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
}
</script>

<style scoped>
.tw-line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>