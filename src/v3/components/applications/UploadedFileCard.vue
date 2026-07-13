<!-- src/v3/components/applications/UploadedFileCard.vue -->
<template>
  <div class="tw-border tw-border-gray-200 tw-rounded-xl tw-p-4 tw-shadow-sm tw-transition-all tw-duration-200 hover:tw-shadow-md hover:tw-scale-[1.02]">
    <div class="tw-flex tw-flex-col tw-h-full">
      <!-- File Icon -->
      <div class="tw-flex tw-items-center tw-justify-center tw-w-16 tw-h-16 tw-mx-auto tw-bg-blue-50 tw-rounded-lg tw-mb-3">
        <i :class="getIconForFile(file)" class="tw-text-2xl" aria-hidden="true"></i>
      </div>

      <!-- File Info -->
      <div class="tw-flex-1">
        <h4 class="tw-font-semibold tw-text-gray-800 tw-text-sm file-name-clamp tw-mb-1" :title="$t(displayName)">
          {{ $t(displayName) }}
        </h4>
        <p class="tw-text-xs tw-text-gray-500 tw-mb-3">
          {{ formatFileSize(file.size) }}
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="tw-flex tw-gap-2 tw-mt-2">
        <!-- View Button -->
        <a
          :href="`${WEB_URL}${fileUrl}`"
          target="_blank"
          rel="noopener noreferrer"
          class="tw-flex-1 tw-py-2 tw-bg-gray-50 hover:tw-bg-gray-100 tw-rounded-md tw-text-sm tw-text-gray-700 tw-flex tw-items-center tw-justify-center tw-gap-1 tw-no-underline tw-transition-colors"
          :aria-label="$t('View file')"
        >
          <i class="fas fa-eye"></i>
          <span>{{ $t("View") }}</span>
        </a>

        <!-- Delete Button -->
        <button
          v-if="canDelete"
          @click="handleDelete"
          :disabled="deleting"
          class="tw-py-2 tw-px-3 tw-bg-red-50 hover:tw-bg-red-100 disabled:tw-bg-gray-100 tw-rounded-md tw-text-sm tw-text-red-600 disabled:tw-text-gray-400 tw-transition-colors tw-flex tw-items-center tw-justify-center disabled:tw-cursor-not-allowed"
          :aria-label="$t('Delete file')"
        >
          <ProgressSpinner 
            v-if="deleting" 
            style="width: 16px; height: 16px" 
            strokeWidth="6"
          />
          <i v-else class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import ProgressSpinner from 'primevue/progressspinner';

const props = defineProps({
  file: {
    type: Object,
    required: true,
    validator: (file) => {
      return file && typeof file === 'object' && file.id;
    }
  },
  canDelete: {
    type: Boolean,
    default: false
  },
  deleting: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['delete-file']);

const WEB_URL = import.meta.env.VITE_WEB_BASE_URL;
const displayName = computed(
  () => props.file?.name || props.file?.caption || props.file?.title || props.file?.key || 'File'
);
const fileUrl = computed(() => props.file?.link || props.file?.path || '');

// ────────────────────────────────────────────────────────────────────────────
// FILE ICON MAPPING
// ────────────────────────────────────────────────────────────────────────────

function getIconForFile(file) {
  if (!file) {
    return "fas fa-file tw-text-gray-500";
  }

  const mimeType = String(file.type || file.mime_type || '').toLowerCase();
  const filePath = String(file.link || file.path || '').toLowerCase();
  const displayValue = String(file.name || file.caption || '').toLowerCase();
  const name = filePath || displayValue;

  if (mimeType.includes('pdf')) {
    return "fas fa-file-pdf tw-text-red-500";
  }

  if (mimeType.startsWith('image/')) {
    return "fas fa-file-image tw-text-purple-500";
  }
  
  // PDF files
  if (name.match(/\.(pdf)$/)) {
    return "fas fa-file-pdf tw-text-red-500";
  }
  
  // Word documents
  if (name.match(/\.(doc|docx)$/)) {
    return "fas fa-file-word tw-text-blue-500";
  }
  
  // Excel spreadsheets
  if (name.match(/\.(xls|xlsx)$/)) {
    return "fas fa-file-excel tw-text-green-500";
  }
  
  // PowerPoint presentations
  if (name.match(/\.(ppt|pptx)$/)) {
    return "fas fa-file-powerpoint tw-text-orange-500";
  }
  
  // Images
  if (name.match(/\.(jpg|jpeg|png|gif|bmp|svg|webp)$/)) {
    return "fas fa-file-image tw-text-purple-500";
  }
  
  // Videos
  if (name.match(/\.(mp4|avi|mov|wmv|flv|mkv)$/)) {
    return "fas fa-file-video tw-text-red-600";
  }
  
  // Audio
  if (name.match(/\.(mp3|wav|ogg|m4a|flac)$/)) {
    return "fas fa-file-audio tw-text-yellow-500";
  }
  
  // Archives
  if (name.match(/\.(zip|rar|7z|tar|gz)$/)) {
    return "fas fa-file-archive tw-text-gray-600";
  }
  
  // Code files
  if (name.match(/\.(js|jsx|ts|tsx|vue|py|java|cpp|c|php|html|css)$/)) {
    return "fas fa-file-code tw-text-teal-500";
  }
  
  // Default
  return "fas fa-file tw-text-gray-500";
}

// ────────────────────────────────────────────────────────────────────────────
// FILE SIZE FORMATTING
// ────────────────────────────────────────────────────────────────────────────

function formatFileSize(bytes) {
  if (!bytes || bytes === 0) {
    return "0 Bytes";
  }

  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  
  return `${Math.round(size * 100) / 100} ${sizes[i]}`;
}

// ────────────────────────────────────────────────────────────────────────────
// EVENT HANDLERS
// ────────────────────────────────────────────────────────────────────────────

function handleDelete() {
  if (!props.deleting && props.canDelete) {
    emit('delete-file', props.file);
  }
}
</script>

<style scoped>
.file-name-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Hover effect for card */
.tw-border:hover {
  border-color: rgb(229 231 235); /* gray-200 */
}
</style>

<!--
USAGE:
======
<UploadedFileCard
  :file="file"
  :canDelete="true"
  :deleting="isLoadingKey(`file-deleting-${file.id}`)"
  @delete-file="confirmDeleteFile"
/>

PROPS:
======
- file: Object (required)
  {
    id: number|string,
    name: string,
    size: number,
    link: string
  }
- canDelete: Boolean (default: false)
- deleting: Boolean (default: false)

EVENTS:
=======
- delete-file: Emitted when delete button clicked, passes file object

FILE TYPES SUPPORTED:
=====================
- PDF, Word, Excel, PowerPoint
- Images (jpg, png, gif, svg, webp, etc.)
- Videos (mp4, avi, mov, etc.)
- Audio (mp3, wav, ogg, etc.)
- Archives (zip, rar, 7z, etc.)
- Code files (js, py, java, etc.)
-->
