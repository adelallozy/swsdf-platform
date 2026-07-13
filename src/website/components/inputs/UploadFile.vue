<template>
  <VeeField type="file" :name="name" v-slot="{ meta, field }">
    <!-- :class="dragOver ? 'bg-red-500' : 'bg-third'" -->

    <div
      class="input_wrapper"
      :class="{
        error: !meta.valid && meta.touched,
      }"
      v-bind="getRootProps()"
    >
      <div class="text tw-flex tw-items-center tw-gap-2" v-if="label">
        <label :for="id" class="label">{{ label }} </label>
      </div>
      <div
        v-if="preview"
        class="upload tw-border tw-bg-[#02579605] tw-border-dashed hid_input tw-rounded-xl tw-p-4 tw-mt-2 tw-flex tw-justify-between tw-items-center tw-flex-1"
      >
        <a
          :href="preview"
          target="_blank"
          class="tw-text-primary tw-flex tw-gap-2 tw-items-center tw-font-semibold"
        >
          {{ selectedFile }}
          <i class="fas fa-eye"></i>
        </a>
        <button
          type="button"
          class="tw-ms-2 tw-text-red-600"
          @click.stop="cancelReq"
        >
          <i class="fas fa-trash"></i>
        </button>
      </div>

      <div
        v-else
        class="upload tw-border tw-bg-[#02579605] tw-border-dashed hid_input tw-rounded-xl tw-p-4"
        :class="{
          'tw-border-dashed  !tw-cursor-move': dragOver,
        }"
        @dragover="dragOver = true"
        @dragleave="dragOver = false"
      >
        <input
          ref="refFile"
          type="file"
          :id="id"
          :accept="accept"
          @change="uploadFile($event.target.files[0])"
          class="tw-hidden"
        />

        <input type="text" class="tw-hidden" :name="name" v-bind="field" />

        <label
          :for="id"
          @click.stop
          class="tw-text-xl !tw-text-muted tw-rounded-lg !tw-flex tw-items-center tw-justify-between tw-gap-3 tw-cursor-pointer"
        >
          <div class="tw-flex tw-items-center tw-gap-2">
            <img src="@/assets/images/icons/document-upload.svg" alt="Upload" />
            {{ placeholder }}
          </div>
        </label>
      </div>

      <VeeErrorMessage
        v-if="!meta.valid && meta.touched"
        :name="name"
        as="div"
        class="tw-text-red-500 tw-text-sm"
      />
    </div>
  </VeeField>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import { useDropzone } from "vue3-dropzone";

import { useField } from "vee-validate";
const props = defineProps({
  itemValue: {
    required: false,
  },

  accept: {
    required: false,
  },
  id: {
    required: true,
  },
  name: {
    required: true,
  },
  label: {
    required: false,
  },
  placeholder: {
    required: false,
  },
});
const emit = defineEmits(["update:itemValue", "update:image"]);
const preview = ref(null);

const { getRootProps, getInputProps, ...rest } = useDropzone({ onDrop });
function onDrop(acceptFiles, rejectReasons) {
  uploadFile(acceptFiles[0]);
}

const refFile = ref();
const selectedFile = ref(null);
const inputField = useField(props.name);
function uploadFile(file) {
  inputField.setValue(file);

  dragOver.value = false;
  selectedFile.value = file.name;
  preview.value = URL.createObjectURL(file);

  emit("update:itemValue", preview.value);
  emit("update:image", file);
}

function cancelReq() {
  inputField.setValue(null);
  refFile.value = null;
  preview.value = null;
}

const dragOver = ref(false);
watch(
  () => props.itemValue,
  (newVal) => {
    if (newVal) {
      preview.value = props.itemValue;
    } else {
      refFile.value = null;
    }
  },
  {
    deep: true,
  }
);

onMounted(() => {
  if (props.itemValue) {
    preview.value = props.itemValue;
  }
});
</script>
