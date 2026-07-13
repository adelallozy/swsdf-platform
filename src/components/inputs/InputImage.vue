<template>
  <VeeField type="file" :name="name" v-slot="{ meta, handleChange }">
    <div
      class="input_wrapper"
      :class="{
        error: !meta.valid && meta.touched,
      }"
    >
      <label :for="id" class="label" v-if="label">{{ label }}</label>

      <div
        class="upload tw-border tw-hid_input tw-rounded-xl p-2"
        :class="{ uploading: uploadPercentage }"
      >
        <input
          type="file"
          :id="id"
          :name="name"
          @change="
            uploadFile($event);
            handleChange($event);
          "
          class="tw-hidden"
          ref="files"
        />
        <label
          :for="id"
          class="tw-text-xl tw-text-center tw-p-7 tw-rounded-lg tw-flex tw-justify-center tw-items-center tw-gap-3 tw-text-muted-strong tw-cursor-pointer"
          ><img
            width="150"
            height="150"
            v-if="preview"
            :src="preview"
            class="tw-mx-auto tw-rounded-full"
            alt="Upload"
          />
          <img
            v-else
            src="@/assets/images/profilePlaceholder.png"
            class="tw-mx-auto"
            alt="Upload"
          />{{ $t("labels.upload_image") }}
        </label>

        <div class="tw-flex tw-gap-2 tw-pb-7">
          <img src="@/assets/images/icons/file_upload.svg" alt="file upload" />
          <div class="tw-flex tw-flex-col tw-flex-1">
            <h5 class="tw-flex tw-items-center tw-justify-between">
              <span class="tw-text-[#191D23]"> {{ filename }}</span>
              <div
                class="tw-text-primary tw-font-bold tw-flex tw-items-center tw-gap-2"
                v-if="uploadFinshed"
              >
                <i
                  class="fa-solid fa-check tw-rounded-full tw-bg-[#047857] tw-text-white tw-border tw-p-1"
                ></i>
              </div>
              <div
                class="tw-text-primary tw-font-bold tw-flex tw-items-center tw-gap-2"
                v-if="uploadPercentage && !uploadFinshed"
              >
                <span class="tw-text-primary tw-font-bold">
                  {{ uploadPercentage + "%" }}
                </span>
              </div>
            </h5>
            <div
              class="tw-rounded-lg tw-h-1 tw-w-full tw-bg-[#E7EAEE] tw-mt-auto"
            >
              <div
                class="tw-h-2 tw-rounded-lg tw-bg-[#047857] tw-w-0 tw-transition"
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
// const { value: file, errorMessage } = useField("identity_copy_file");
const props = defineProps({
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
    required: true,
  },
  preview: {
    required: false,
  },
});

const uploadPercentage = ref(0);
const filename = ref("");
const uploadFinshed = ref(false);
const preview = ref(null);

function uploadFile(e) {
  uploadPercentage.value = 100;
  uploadFinshed.value = true;
  filename.value = e.target.files[0].name;
  preview.value = URL.createObjectURL(e.target.files[0]);
}
if (props.preview) {
  preview.value = props.preview;
}
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
