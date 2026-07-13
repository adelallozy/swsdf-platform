<template>
  <base-card class="tw-bg-white">
    <general-breadcrumb :items="items" />
  </base-card>

  <base-card
    class="tw-mt-5 tw-bg-white"
    title="Upload New File"
    desc="Please Upload all required files"
  >
    <ul
      class="tw-space-y-2 tw-ps-3 tw-mb-6"
      v-if="application?.requirements?.files"
    >
      <template
        v-for="(value, key) of application.requirements.files"
        :key="key"
      >
        <li
          v-if="key != 'Other' && !setRequiredFiles(key) && value == 'Required'"
          :class="value == 'Required' ? 'tw-text-red-500' : ''"
          class="tw-font-bold tw-flex tw-items-center tw-gap-2"
        >
          <span>*</span>
          <span> {{ $t(key) }} </span>
        </li>
      </template>
    </ul>

    <div class="tw-max-w-[992px] tw-mx-auto tw-mt-3">
      <VeeForm :validation-schema="formSchema" @submit="handleSubmit">
        <div class="tw-grid tw-gap-x-10 tw-gap-y-4">
          <base-file-with-crop
            v-if="selectedType == 'Applicant Picture'"
            id="file"
            name="file"
            accept="image/png, image/webp, image/jpeg,application/pdf"
            v-model:itemValue="selectedFile"
          />
          <base-file
            v-else
            :no-preview="true"
            id="file"
            name="file"
            accept="image/png, image/webp, image/jpeg,application/pdf"
            v-model:itemValue="selectedFile"
          />

          <div 
            v-if="options.length > 0 "
            class="tw-grid sm:tw-grid-cols-2 tw-gap-5">
            <base-select
              id="type"
              name="type"
              :label="t('File Type')"
              :placeholder="t('choose', { name: t('File Type') })"
              :options="options"
              @change="selectedFile = null"
              v-model:itemValue="selectedType"
            />
            <BaseDate
              v-model:itemValue="selectedDate"
              id="expire_date"
              name="expire_date"
              :label="t('Expire Date')"
              :placeholder="t('enter', { name: t('Expire Date') })"
            />
          </div>
        </div>
        <div class="tw-flex tw-gap-2 tw-items-center tw-justify-end tw-mt-5">
          <router-link
            :to="{ name: 'application-home' }"
            class="tw-w-fit base-btn-white tw-py-2 tw-rounded-lg"
          >
            {{ $t("Cancel") }}
          </router-link>
          <button
            type="submit"
            :disabled="btnLoading"
            class="base-btn tw-rounded-lg tw-py-2"
          >
            {{ $t("Save") }}
          </button>
        </div>
      </VeeForm>
    </div>
  </base-card>
</template>

<script setup>
import BaseFileWithCrop from "@/website/components/inputs/BaseFileWithCrop.vue";
import BaseSelect from "@/website/components/inputs/BaseSelect.vue";
import BaseFile from "@/website/components/inputs/BaseFile.vue";
import BaseDate from "@/website/components/inputs/BaseDate.vue";
import axios from "axios";
import { object, string, mixed } from "yup";
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
const NEW_FILE = import.meta.env.VITE_NEW_APPLICATION_FILE;

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const props = defineProps({
  application: {
    type: Object,
    required: false,
  },
  applicationFiles: {
    type: Array,
    required: false,
  },
});

const btnLoading = ref(false);
const selectedType = ref('');
const selectedFile = ref(null);
const selectedDate = ref(null); 

const options = ref([]);

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


  type: string()
    .required(t("isRequired", { name: t("File Type") }))
});
function setRequiredFiles(name) {
  return props.applicationFiles.some((el) => el.caption == name);
}
watch(
  () => props.application,
  () => {
    if (props.application) {
      if (props.application.requirements?.files) {
        options.value = Object.entries(
          props.application.requirements.files
        ).map((el) => ({
          id: el[0],
          name: t(el[0]),
        }));
      }
    }
  },
  {
    immediate: true,
    deep: true,
  }
);

function handleSubmit(values) {
  const frmData = new FormData();

  frmData.append("caption", values.type);
  frmData.append("file", values.file);
  if (values.expire_date) frmData.append("expiry_on", values.expire_date);

  axios.post(NEW_FILE + route.params.id, frmData).then(() => {
    router.push({
      name: "application-home",
      params: {
        id: route.params.id,
      },
    });
  });
}
const items = {
  title: "Upload New File",
  links: [
    {
      path: "/",
      name: "Main",
    },
    {
      path: { name: "workspace" },
      name: "Workspace",
    },
    {
      name: "Show Application",
      path: {
        name: "application-home",
        params: {
          id: route.params.id,
        },
      },
    },

    {
      path: {
        name: "add-new-file",
        params: {
          id: route.params.id,
        },
      },
      name: t("Upload New File"),
    },
  ],
};
</script>

<style></style>
