<template>
  <div class="tw-me-auto tw-max-w-[992px] tw-my-3 tw-space-y-7">
    <div>
      <h4 class="tw-text-foreground tw-font-semibold tw-mb-1 tw-text-lg">
        {{ information[$i18n.locale].title }}
      </h4>
      <ul class="tw-ps-5 tw-list-decimal">
        <li
          class="tw-text-foreground"
          v-for="info in information[$i18n.locale].list"
          :key="info"
        >
          {{ info }}
        </li>
      </ul>
    </div>
    <VeeForm
      v-slot="{ meta }"
      :validation-schema="formSchema"
      @submit="handleSubmit"
    >
      <div class="tw-grid tw-gap-x-10 tw-gap-y-4">
        <base-file-with-crop
          id="file"
          name="file"
          accept="image/jpeg,image/jpg,image/gif,image/png"
          v-model:itemValue="selectedFile"
        />
      </div>
      <div class="tw-flex tw-mt-11 tw-gap-2 tw-w-fit tw-ms-auto">
        <router-link
          v-if="back"
          :to="back"
          class="base-btn-white tw-rounded-lg"
        >
          {{ $t("Previous") }}
        </router-link>
        <button
          type="submit"
          :disabled="btnLoading || !meta.valid"
          class="base-btn tw-rounded-lg"
        >
          {{ $t("Save") }}
        </button>
      </div>
    </VeeForm>
  </div>
</template>

<script setup>
import { object, string, mixed } from "yup";
import { ref } from "vue";
import BaseFileWithCrop from "@/website/components/inputs/BaseFileWithCrop.vue";

import { useI18n } from "vue-i18n";

const { t } = useI18n();
defineProps({
  back: {
    required: false,
  },
  btnLoading: {
    required: false,
  },
});

const information = {
  en: {
    title: "Image requirements:",
    list: [
      "Facial features are fully visible from the front.",
      "Good quality image with a white background.",
      "Equally lightened Without using any filters.",
    ],
  },
  ar: {
    title: "مواصفات الصورة :",
    list: [
      "تظهر ملامح الوجه بالكامل من الأمام.",
      "أن تكون نوعية الصورة جيدة بخليفه بيضاء.",
      "أن تكون الإضاءة متساوية مع عدم إستخدام أي مؤثرات.",
    ],
  },
};

const selectedFile = ref(null);
const emit = defineEmits(["submit"]);

const formSchema = object().shape({
  file: mixed()
    .required(t("isRequired", { name: t("labels.file") }))
    .test("fileSize", t("File Size must be less than 2MB"), function (file) {
      if (file == null) {
        return true;
      }
      return file.size < 1024 * 1024 * 2;
    })
    .test(
      "fileType",
      t("File must be in format of PDF or Image"),
      function (file) {
        if (file == null) {
          return true;
        }
        return file.type == "application/pdf" || file.type.startsWith("image/");
      }
    ),
});

function handleSubmit(values) {
  emit("submit", values);
}
</script>

<style></style>
