<template>
  <div
    class="photo-input"
    :class="{
      disabled,
      invalid,
    }"
    :id="id"
  >
    <template v-if="mode === MODES.EMPTY">
      <div
        class="drop-area"
        role="button"
        tabindex="0"
        :aria-label="placeholder || t('Drop files here or click to upload')"
        :aria-describedby="`${id}-placeholder`"
        @dragover.prevent="handleDragOver"
        @dragleave.prevent="handleDragLeave"
        @drop.prevent="handleDrop"
        @click="handleClick"
        @keyup.enter="handleClick"
        @keyup.space.prevent="handleClick"
      >
        <div class="text-center tw-space-y-3">
          <span class="tw-inline-flex tw-items-center tw-justify-center tw-w-14 tw-h-14 tw-rounded-full tw-bg-blue-50 tw-text-blue-500">
            <i class="pi pi-upload tw-text-xl" aria-hidden="true"></i>
          </span>
          <p :id="`${id}-placeholder`">
            {{ placeholder || t('Drop files here or click to upload') }}
          </p>
          <p class="tw-text-xs tw-text-slate-500">
            {{ t('PNG, JPG, or WebP up to 5MB') }}
          </p>
        </div>
      </div>
    </template>
    <template v-else-if="mode === MODES.EDITING">
      <div class="preview-container">
        <div
          class="cropper-container"
          :style="cropperContainerStyle"
        >
          <cropper
            v-if="cropSource"
            class="cropper-instance"
            :src="cropSource"
            :stencil-props="{ aspectRatio: aspectRatio }"
            :canvas="canvasSize"
            @change="handleCropChange"
          />
        </div>
        <div class="actions tw-flex tw-justify-end tw-gap-2">
          <button type="button" @click="handleCancel" class="action-btn ghost">
            <i class="pi pi-times" aria-hidden="true"></i>
            <span>{{ t('Cancel') }}</span>
          </button>
          <button type="button" @click="handleSave" class="action-btn primary">
            <i class="pi pi-check" aria-hidden="true"></i>
            <span>{{ t('Apply') }}</span>
          </button>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="preview-container">
        <div
          class="static-preview"
          :style="{ width: `${previewSize.width}px`, height: `${previewSize.height}px` }"
        >
          <img :src="previewImage" alt="Selected photo preview" />
        </div>
        <div class="actions tw-flex tw-flex-wrap tw-gap-2 tw-mt-3">
          <button type="button" @click="handleEditCurrent" class="action-btn outline">
            <i class="pi pi-pencil" aria-hidden="true"></i>
            <span>{{ t('Edit photo') }}</span>
          </button>
          <button type="button" @click="handleClick" class="action-btn neutral">
            <i class="pi pi-refresh" aria-hidden="true"></i>
            <span>{{ t('Replace photo') }}</span>
          </button>
          <button type="button" @click="handleClear" class="action-btn danger">
            <i class="pi pi-trash" aria-hidden="true"></i>
            <span>{{ t('Remove photo') }}</span>
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { Cropper } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  modelValue: {
    type: [File, String, null],
    default: null,
  },
  id: {
    type: String,
    required: true,
  },
  placeholder: {
    type: String,
    default: null,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  invalid: {
    type: Boolean,
    default: false,
  },
  accept: {
    type: String,
    default: 'image/png,image/webp,image/jpeg,image/jpg',
  },
  aspectRatio: {
    type: Number,
    default: 100 / 125,
  },
  canvasSize: {
    type: Object,
    default: () => ({ width: 512, height: 640 }),
  },
  previewSize: {
    type: Object,
    default: () => ({ width: 250, height: 300 }),
  },
  attrs: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['update:modelValue', 'error', 'change', 'input']);
const { t } = useI18n();

const MODES = {
  EMPTY: 'empty',
  EDITING: 'editing',
  PREVIEW: 'preview',
};

const mode = ref(MODES.EMPTY);
const cropSource = ref(null);
const previewImage = ref(null);
const cropCanvas = ref(null);
const originalName = ref('photo.jpg');
const originalType = ref('image/jpeg');
const sourceObjectUrl = ref(null);
const previewObjectUrl = ref(null);

// Optional max size validation (applies to the cropped output file, not the original selection).
const maxSize = computed(() => props.attrs?.maxSize);
const cropperContainerStyle = computed(() => ({
  width: '100%',
  maxWidth: '100%',
  aspectRatio: props.aspectRatio || 1,
  maxHeight: `${props.previewSize?.height * 2 || 600}px`
}));

const revokeObjectUrl = (urlRef) => {
  if (urlRef.value) {
    URL.revokeObjectURL(urlRef.value);
    urlRef.value = null;
  }
};

const revokeSourceUrl = () => revokeObjectUrl(sourceObjectUrl);
const revokePreviewUrl = () => revokeObjectUrl(previewObjectUrl);

const resetState = () => {
  revokeSourceUrl();
  revokePreviewUrl();
  cropSource.value = null;
  previewImage.value = null;
  cropCanvas.value = null;
  originalName.value = 'photo.jpg';
  originalType.value = 'image/jpeg';
  mode.value = MODES.EMPTY;
};

const emitValueChange = (value) => {
  emit('update:modelValue', value);
  emit('change', value);
  emit('input', value);
};

const setCropSourceFromFile = (file) => {
  revokeSourceUrl();
  sourceObjectUrl.value = URL.createObjectURL(file);
  cropSource.value = sourceObjectUrl.value;
  originalName.value = file.name || 'photo.jpg';
  originalType.value = file.type || 'image/jpeg';
  cropCanvas.value = null;
  mode.value = MODES.EDITING;
};

const setPreviewFromFile = (file) => {
  revokePreviewUrl();
  previewObjectUrl.value = URL.createObjectURL(file);
  previewImage.value = previewObjectUrl.value;
};

const syncFromModel = (val) => {
  revokeSourceUrl();
  cropSource.value = null;
  cropCanvas.value = null;

  if (!val) {
    resetState();
    return;
  }

  if (typeof val === 'string') {
    revokePreviewUrl();
    previewImage.value = val;
    originalName.value = 'photo.jpg';
    originalType.value = 'image/jpeg';
  } else if (val instanceof File) {
    setPreviewFromFile(val);
    originalName.value = val.name || 'photo.jpg';
    originalType.value = val.type || 'image/jpeg';
  } else {
    previewImage.value = null;
  }

  if (val) {
    mode.value = MODES.PREVIEW;
  }
};

onMounted(() => {
  syncFromModel(props.modelValue);
});

onBeforeUnmount(() => {
  revokeSourceUrl();
  revokePreviewUrl();
});

watch(
  () => props.modelValue,
  (val) => {
    syncFromModel(val);
  }
);

const isAllowedType = (file) => {
  if (!props.accept) return true;
  const types = props.accept.split(',').map(s => s.trim());
  if (!file.type) return false;
  return types.some(type => {
    if (type === 'image/*') {
      return file.type.startsWith('image/');
    }
    return type === file.type;
  });
};

const handleDragOver = (event) => {
  if (props.disabled) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = 'copy';
};

const handleDragLeave = (event) => {
  if (props.disabled) return;
  event.preventDefault();
};

const handleDrop = (event) => {
  if (props.disabled) return;
  event.preventDefault();
  const files = event.dataTransfer?.files;
  const file = files?.[0];
  handleFile(file);
};

const handleClick = () => {
  if (props.disabled) return;
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = props.accept;
  input.onchange = (e) => {
    const files = e.target?.files;
    const file = files?.[0];
    handleFile(file);
  };
  input.click();
};

const handleFile = (file) => {
  if (!file || props.disabled) return;
  
  if (!isAllowedType(file)) {
    emit('error', {
      type: 'mime-type',
      allowed: props.accept,
      fileType: file.type,
    });
    return;
  }

  setCropSourceFromFile(file);
};

const handleCropChange = ({ canvas }) => {
  cropCanvas.value = canvas || null;
};

const handleCancel = () => {
  syncFromModel(props.modelValue);
};

const handleSave = () => {
  if (!cropCanvas.value || props.disabled) return;
  const outputType = 'image/webp';
  const outputName = (() => {
    const name = originalName.value || 'photo';
    const safeBase = name.replace(/\.[^/.]+$/, '');
    return `${safeBase}.webp`;
  })();

  cropCanvas.value.toBlob((blob) => {
    if (!blob) {
      emit('error', { type: 'blob-failed' });
      return;
    }

    if (maxSize.value && blob.size > maxSize.value) {
      emit('error', {
        type: 'max-size',
        maxSize: maxSize.value,
        size: blob.size,
      });
      return;
    }
    
    const croppedFile = new File(
      [blob],
      outputName,
      { type: outputType }
    );
    
    setPreviewFromFile(croppedFile);
    mode.value = MODES.PREVIEW;
    emitValueChange(croppedFile);
  }, outputType);
};

const handleClear = () => {
  if (props.disabled) return;
  emitValueChange(null);
  resetState();
};

const handleEditCurrent = () => {
  if (props.disabled || !previewImage.value) return;
  cropSource.value = previewImage.value;
  cropCanvas.value = null;
  mode.value = MODES.EDITING;
};
</script>

<style scoped>
.photo-input {
  @apply tw-border-2 tw-rounded-lg tw-p-4;
}
.photo-input.invalid {
  @apply tw-border-red-500;
}
.photo-input.disabled {
  @apply tw-opacity-50 tw-pointer-events-none;
}
.drop-area {
  @apply tw-border-dashed tw-border-2 tw-border-gray-300 tw-rounded-lg tw-p-8 tw-text-center tw-cursor-pointer;
}
.preview-container {
  @apply tw-relative tw-w-full;
}
.cropper-container {
  @apply tw-w-full tw-max-h-[70vh];
}
.cropper-container :deep(.vue-advanced-cropper) {
  width: 100%;
  height: 100%;
}
.actions {
  @apply tw-flex tw-justify-end tw-mt-2;
}
.static-preview {
  @apply tw-overflow-hidden tw-rounded-lg tw-bg-gray-50 tw-flex tw-items-center tw-justify-center;
}
.static-preview img {
  @apply tw-h-full tw-w-full tw-object-cover;
}
.action-btn {
  @apply tw-inline-flex tw-items-center tw-gap-2 tw-rounded-lg tw-px-3 tw-py-2 tw-text-sm tw-font-semibold tw-transition tw-border tw-border-transparent;
}
.action-btn.primary {
  @apply tw-bg-blue-600 tw-text-white hover:tw-bg-blue-700;
}
.action-btn.ghost {
  @apply tw-bg-white tw-text-slate-600 hover:tw-text-slate-900 hover:tw-border-slate-200;
}
.action-btn.outline {
  @apply tw-bg-white tw-text-slate-700 tw-border-slate-200 hover:tw-border-blue-400;
}
.action-btn.neutral {
  @apply tw-bg-slate-100 tw-text-slate-700 hover:tw-bg-slate-200;
}
.action-btn.danger {
  @apply tw-bg-red-50 tw-text-red-600 hover:tw-bg-red-100 hover:tw-text-red-700;
}
</style>
