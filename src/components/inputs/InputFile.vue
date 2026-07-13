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
        class="upload border hid_input tw-rounded-xl tw-p-2"
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
          class="hidden"
          ref="files"
        />
        <label
          :for="id"
          class="tw-text-xl tw-text-center tw-p-7 tw-rounded-lg tw-flex tw-justify-center tw-items-center tw-gap-3 tw-text-muted-strong tw-cursor-pointer"
          ><img
            src="@/assets/images/icons/upload.svg"
            class="tw-mx-auto"
            alt="Upload"
          />{{ $t("labels.upload_file") }}</label
        >

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
            <div class="rounded-lg h-1 w-full bg-[#E7EAEE] mt-auto">
              <div
                class="h-2 rounded-lg bg-[#047857] w-0 transition"
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
        class="text-red-500"
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
  noPreview: {
    required: false,
  },
});

const uploadPercentage = ref(0);
const filename = ref("");
const uploadFinshed = ref(false);

function uploadFile(e) {
  uploadPercentage.value = 100;
  uploadFinshed.value = true;
  filename.value = e.target.files[0].name;
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
