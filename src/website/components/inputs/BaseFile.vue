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
        <a
          class="tw-text-primary tw-text-xl"
          v-if="preview && noPreview"
          :href="preview"
          target="_blank"
        >
          <i class="fas fa-eye"></i>
        </a>
      </div>

      <div
        class="upload tw-border hid_input tw-rounded-xl tw-p-2"
        :class="{
          uploading: uploadPercentage,
          'tw-border-dashed tw-bg-third !tw-cursor-move': dragOver,
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
          class="tw-text-xl tw-text-center tw-p-7 tw-rounded-lg tw-flex tw-justify-center tw-items-center tw-gap-3 tw-cursor-pointer"
        >
          <img
            width="150"
            height="100"
            class="tw-mx-auto tw-w-[150px] tw-h-[100px] tw-object-contain"
            v-if="preview && !noPreview"
            :src="preview"
            alt=""
          />

          <img
            v-else
            src="@/assets/images/icons/file.png"
            class="tw-mx-auto tw-mb-3"
            alt="Upload"
          />
          {{ $t("labels.dropFilesHereOrClickToUpload") }}</label
        >

        <div class="tw-flex tw-gap-2 tw-mb-2">
          <img src="@/assets/images/icons/file.png" alt="file upload" />
          <div class="tw-flex tw-flex-col tw-flex-1">
            <h5 class="tw-flex tw-items-center tw-justify-between">
              <span class="tw-text-[#191D23]"> {{ $t("fileUploaded") }}</span>
              <div
                class="tw-text-primary tw-font-bold tw-flex tw-items-center tw-gap-2"
                v-if="uploadFinshed"
              >
                <i
                  class="fas fa-check tw-rounded-full tw-bg-[#047857] tw-text-white tw-border tw-p-1"
                ></i>
                <button
                  type="button"
                  @click="cancelReq"
                  class="tw-text-primary tw-border tw-w-6 tw-h-6 tw-rounded-full tw-border-primary tw-transition hover:tw-bg-primary hover:!tw-text-white"
                >
                  <i class="fas fa-times"></i>
                </button>
                <div class="text">
                  <a
                    class="tw-text-primary tw-text-xl"
                    v-if="preview && noPreview"
                    :href="preview"
                    target="_blank"
                  >
                    <i class="fas fa-eye"></i>
                  </a>
                </div>
              </div>
              <div
                class="tw-text-primary tw-font-bold tw-flex tw-items-center tw-gap-2"
                v-if="uploadPercentage && !uploadFinshed"
              >
                <span class="tw-text-primary tw-font-bold">
                  {{ uploadPercentage + "%" }}
                </span>

                <button
                  type="button"
                  @click="cancelReq"
                  class="tw-text-primary tw-border tw-w-6 tw-h-6 tw-rounded-full tw-border-primary tw-transition hover:tw-bg-primary hover:!tw-text-white"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </h5>
            <div
              class="tw-rounded-lg tw-h-1 tw-w-full tw-bg-[#E7EAEE] tw-mt-auto"
            >
              <div
                class="tw-h-2 tw-rounded-lg tw-bg-[#047857] tw-transition"
                :style="`width:${uploadPercentage}%;`"
              ></div>
            </div>
          </div>
        </div>
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
  noPreview: {
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
const uploadPercentage = ref(0);
const uploadFinshed = ref(false);
const refFile = ref();

const inputField = useField(props.name);
function uploadFile(file) {
  inputField.setValue(file);
  uploadPercentage.value = 0;
  dragOver.value = false;
  preview.value = URL.createObjectURL(file);
  uploadPercentage.value = 100;
  emit("update:itemValue", preview.value);
  emit("update:image", file);
  uploadFinshed.value = true;
}

function cancelReq() {
  inputField.setValue(null);
  refFile.value = null;
  preview.value = null;
  uploadPercentage.value = 0;
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

<style lang="scss">
.input_wrapper {
  &.upload_image {
    input {
      display: none;
    }
    label {
      cursor: pointer;
      max-width: 300px;

      margin-inline: auto;
      img {
        height: 200px;
        object-fit: cover;
        width: 100%;
        border-radius: 1rem;
      }
    }
    margin-bottom: 1.5rem;
  }
  .upload {
    > div {
      @apply tw-hidden;
    }
    &.uploading {
      input {
        @apply tw-hidden;
      }
      > div {
        @apply tw-flex;
      }
    }
    &.hid_input {
      input {
        @apply tw-hidden;
      }
      &.uploading {
        // > label {
        //   @apply hidden;
        // }
      }
    }
  }
}
</style>
