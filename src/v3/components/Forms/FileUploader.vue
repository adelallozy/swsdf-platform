<template>
  <div
    class="input_wrapper"
    :class="{
      error: invalid,
      'is-disabled': disabled
    }"
  >
    <!-- Preview -->
    <div
      v-if="previewUrl"
      class="upload tw-border tw-bg-[#02579605] tw-border-dashed hid_input tw-rounded-xl tw-p-4 tw-mt-2 tw-flex tw-justify-between tw-items-center tw-flex-1"
    >
      <a
        :href="previewUrl"
        target="_blank"
        class="tw-text-primary tw-flex tw-gap-2 tw-items-center tw-font-semibold"
      >
        {{ selectedFileName }}
        <i class="fas fa-eye"></i>
      </a>
      <button
        type="button"
        class="tw-ms-2 tw-text-red-600 hover:tw-text-red-700 focus:tw-outline-none"
        @click="onClear"
        :aria-label="t('fileUploader.removeFile')"
      >
        <i class="fas fa-trash"></i>
      </button>
    </div>

    <!-- Upload Area -->
    <div
      v-else
      class="upload tw-border tw-bg-[#02579605] tw-border-dashed hid_input tw-rounded-xl tw-p-4"
      :class="{
        'tw-border-primary !tw-cursor-move': dragOver,
        'tw-pointer-events-none': disabled
      }"
      @dragover.prevent="onDragOver"
      @dragleave="dragOver = false"
      @drop.prevent="onDrop"
    >
      <input
        ref="inputEl"
        type="file"
        :id="id"
        :accept="accept"
        :multiple="attrs?.multiple"
        :capture="attrs?.capture"
        :disabled="disabled"
        :aria-describedby="attrs?.description ? descriptionId : undefined"
        :aria-invalid="invalid ? 'true' : 'false'"
        class="visually-hidden-input"
        @change="onChange"
        @blur="$emit('blur')"
      />

      <label
        :for="id"
        class="tw-text-xl !tw-text-muted tw-rounded-lg !tw-flex tw-items-center tw-justify-between tw-gap-3 tw-cursor-pointer"
        :class="{ 'tw-opacity-50': disabled }"
      >
        <div class="tw-flex tw-flex-wrap tw-items-center tw-gap-2">
          <div class="tw-flex tw-items-center tw-gap-2">
            <img
              src="@/assets/images/icons/document-upload.svg"
              alt="Upload"
              class="tw-w-6 tw-h-6"
            />
            {{ placeholder || $t('Choose a file or drag it here') }}
          </div>
          <!-- Accepted formats for the current file type — highlighted,
               interactive chips mirroring the picker's accept list. -->
          <span
            v-for="code in attrs?.typeCodes"
            :key="code"
            class="tw-inline-flex tw-items-center tw-px-2.5 tw-py-0.5 tw-rounded-full tw-text-xs tw-font-bold tw-tracking-wide tw-bg-[#02579614] tw-text-[#035796] tw-border tw-border-[#0257962e]"
          >
            {{ code.toUpperCase() }}
          </span>
        </div>
      </label>
    </div>

    <!-- Description -->
    <p v-if="attrs?.description" :id="descriptionId" class="tw-text-sm tw-text-gray-500 tw-mt-1">
      {{ attrs.description }}
    </p>

    <!-- File size info -->
    <p 
      v-if="attrs?.maxSize"
      class="tw-text-xs tw-text-gray-500 tw-mt-1"
    >
      {{ $t('Maximum file size') }}: {{ formatBytes(attrs.maxSize) }}
    </p>
  </div>
</template>

<script setup>
import { ref, watch, computed, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  modelValue: { default: null }, // File | null | string
  id: { type: String, required: true },
  placeholder: { type: String, default: null },
  disabled: { type: Boolean, default: false },
  invalid: { type: Boolean, default: false },
  accept: { type: String, default: 'image/png,image/webp,image/jpeg,image/jpg,application/pdf' },
  attrs: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue', 'change', 'input', 'blur', 'remove', 'validationError'])

const inputEl = ref(null)
const dragOver = ref(false)
const previewUrl = ref(null)
const ownsBlob = ref(false)
const selectedFileName = ref('')

const descriptionId = computed(() => `${props.id}-description`)

function extractFilename(url) {
  try {
    // SSR-safe: guard window access
    const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
    const u = new URL(url, base)
    return decodeURIComponent(u.pathname.split('/').pop() || 'file')
  } catch {
    return 'file'
  }
}

function revokePreview() {
  if (ownsBlob.value && previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
  ownsBlob.value = false
}

function setPreviewFromFile(file) {
  revokePreview()
  previewUrl.value = URL.createObjectURL(file)
  ownsBlob.value = true
  selectedFileName.value = file?.name || 'file'
}

function setPreviewFromUrl(url) {
  revokePreview()
  previewUrl.value = url || null
  selectedFileName.value = url ? extractFilename(url) : ''
}

function clearNativeInput() {
  if (inputEl.value) inputEl.value.value = ''
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

function validateFile(file) {
  // Validate file size if maxSize is set
  if (props.attrs?.maxSize && file.size > props.attrs.maxSize) {
    const message = t('File size exceeds maximum allowed size') + ': ' + formatBytes(props.attrs.maxSize)
    emit('validationError', message) // FIXED: emit instead of alert
    clearNativeInput()
    return false
  }

  // Validate file type if accept is set
  if (props.accept && props.accept !== '*/*') {
    const acceptedTypes = props.accept.split(',').map(t => t.trim())
    const fileType = file.type
    const fileExt = '.' + file.name.split('.').pop().toLowerCase()
    
    const isValid = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return fileExt === type.toLowerCase() // Case-insensitive extension matching
      }
      if (type.endsWith('/*')) {
        return fileType.startsWith(type.replace('/*', ''))
      }
      return fileType === type
    })

    if (!isValid) {
      emit('validationError', t('File type not accepted')) // FIXED: emit instead of alert
      clearNativeInput()
      return false
    }
  }
  
  return true
}

function onChange(e) {
  if (props.disabled) return
  const file = e?.target?.files?.[0]
  if (!file) return
  
  // Validate before processing
  if (!validateFile(file)) return
  
  setPreviewFromFile(file)
  emit('update:modelValue', file)
  emit('input', file)
  emit('change', file)
}

function onClear() {
  revokePreview()
  previewUrl.value = null
  selectedFileName.value = ''
  clearNativeInput()
  emit('update:modelValue', null)
  emit('change', null)
  emit('remove')
}

function onDragOver(e) {
  if (props.disabled) return
  e.preventDefault()
  e.stopPropagation()
  dragOver.value = true
}

function onDrop(e) {
  e.preventDefault()
  e.stopPropagation()
  dragOver.value = false
  
  if (props.disabled) return
  
  const file = e?.dataTransfer?.files?.[0]
  if (!file) return
  
  // Validate before processing
  if (!validateFile(file)) return
  
  setPreviewFromFile(file)
  emit('update:modelValue', file)
  emit('input', file)
  emit('change', file)
}

// Sync with external modelValue
watch(
  () => props.modelValue,
  (val) => {
    if (val instanceof File) {
      setPreviewFromFile(val)
    } else if (typeof val === 'string' && val) {
      setPreviewFromUrl(val)
    } else if (val == null) {
      // Don't emit on external clear, just update internal state
      revokePreview()
      previewUrl.value = null
      selectedFileName.value = ''
      clearNativeInput()
    }
  },
  { immediate: true }
)

onUnmounted(() => {
  revokePreview()
})
</script>

<style scoped>
/* iOS-safe visually hidden input */
.visually-hidden-input {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border-width: 0 !important;
  opacity: 0 !important;
}

.input_wrapper.error .upload {
  @apply tw-border-red-500;
}

.input_wrapper.is-disabled .upload {
  @apply tw-opacity-50 tw-cursor-not-allowed;
}

.upload {
  transition: all 0.2s ease;
}

.upload:hover:not(.tw-pointer-events-none) {
  @apply tw-shadow-sm;
}
</style>