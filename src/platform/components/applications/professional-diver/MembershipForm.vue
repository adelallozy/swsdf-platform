<template>
  <div>
    <loader v-if="loading" />
    <VeeForm
      v-else
      v-slot="{ meta }"
      @submit="$emit('submit', $event)"
      :validation-schema="schema"
      :initial-values="initialValues"
    >
      <div
        v-for="(formInput, index) in formInputs"
        :key="index"
        class="tw-my-7 form_inputs"
      >
        <h3 class="tw-text-muted tw-mb-2">{{ $t(formInput.title) }}</h3>
        <div
          class="tw-flex tw-flex-wrap tw-gap -y-3 tw-gap-x-7 tw-items-center"
        >
          <VeeField
            type="radio"
            :name="subInput.name"
            :value="subInput.value"
            v-slot="{ field, meta }"
            v-for="(subInput, index) in formInput.inputs"
            :key="index"
          >
            <div
              :class="{
                error: !meta.valid && meta.touched,
              }"
            >
              <label
                :for="subInput.value"
                class="label tw-flex tw-gap-2 tw-capitalize tw-items-center"
              >
                <input
                  type="radio"
                  :name="subInput.name"
                  :id="subInput.value"
                  v-bind="field"
                  :value="subInput.value"
                  class="!tw-w-4 !tw-h-4"
                  placeholder="placeholder"
                />
                <span class="tw-text-foreground tw-font-semibold tw-text-lg">
                  {{ $t(subInput.label) }}
                </span>
              </label>
            </div>
          </VeeField>
        </div>

        <VeeErrorMessage
          v-if="!meta.valid && meta.touched"
          :name="formInput.name"
          as="div"
          class="tw-text-red-500 tw-text-sm"
        />
      </div>
      <div class="tw-my-7 form_inputs">
        <h3 class="tw-text-muted tw-mb-2">{{ $t("Diving Organization") }}</h3>
        <div
          class="tw-flex tw-flex-wrap tw-gap -y-3 tw-gap-x-7 tw-items-center"
        >
          <VeeField
            type="radio"
            name="organization"
            v-slot="{ field, meta }"
            v-for="(subInput, index) in organizations"
            :key="index"
            :value="subInput.id"
          >
            <div
              :class="{
                error: !meta.valid && meta.touched,
              }"
            >
              <label
                :for="subInput.value"
                class="label tw-flex tw-gap-2 tw-capitalize tw-items-center"
              >
                <input
                  type="radio"
                  name="organization"
                  :id="subInput.id"
                  v-bind="field"
                  :value="subInput.id"
                  class="!tw-w-4 !tw-h-4"
                  placeholder="placeholder"
                />
                <span class="tw-text-foreground tw-font-semibold tw-text-lg">
                  {{ subInput.name }}
                </span>
              </label>
            </div>
          </VeeField>
        </div>

        <VeeErrorMessage
          v-if="!meta.valid && meta.touched"
          name="organization"
          as="div"
          class="tw-text-red-500 tw-text-sm"
        />
      </div>
      <div class="tw-mb-3 tw-space-y-7">
        <div class="tw-grid tw-gap-11 md:tw-grid-cols-2">
 
          <base-input
            id="title"
            name="title"
            :label="$t('Level')"
            :placeholder="$t('Level')"
            v-model:itemValue="initialValues.title"
          />
          <base-input
            id="membership_number"
            name="membership_number"
            :label="$t('labels.membershipNumber')"
            :placeholder="$t('labels.membershipNumber')"
            v-model:itemValue="initialValues.membership_number"
          />

          <UploadFile
            id="membership_copy"
            name="membership_copy"
            :label="$t('Membership Copy')"
            :placeholder="$t('Membership Copy')"
            accept="image/jpeg,image/jpg,image/gif,image/png,application/pdf,image/x-eps"
            v-model:image="initialValues.membership_copy"
            v-model:itemValue="initialValues.membership_copy_preview"
          />
        </div>
        <div class="tw-mt-3 tw-flex tw-items-center tw-gap-2 tw-justify-end">
          <router-link
            v-if="back"
            @click="$emit('close')"
            :to="{
              name: 'application-home',
              params: {
                id: $route.params.id,
              },
            }"
            class="tw-w-fit base-btn-white btn-danger tw-rounded-lg"
          >
            {{ $t("Cancel") }}
          </router-link>
          <input-button
            :loading="btnLoading"
            type="submit"
            class="base-btn tw-py-2 tw-rounded-lg"
            name="save"
            :meta="meta"
          />
        </div>
      </div>
    </VeeForm>
  </div>
</template>

<script setup> 
import BaseInput from "@/website/components/inputs/BaseInput.vue";

import UploadFile from "@/website/components/inputs/UploadFile.vue"; 
import { reactive, ref, onMounted, watch } from "vue";
import * as yup from "yup";
 
import { useI18n } from "vue-i18n";
const WEB_URL = import.meta.env.VITE_WEB_BASE_URL;
const props = defineProps({
  back: {
    required: false,
    default: true,
  },
  btnLoading: {
    required: false,
  },
  qualification: {
    required: false,
  },
});
const { t, locale } = useI18n();

const openModal = ref(false);
const loading = ref(false);

const initialValues = reactive({
  id: "",
  organization: null,
  diving_type: null,
  membership_number: null,
  membership_copy: null,
  title: null,
  membership_copy_preview: null,
});

const organizations = [
  {
    id: "PADI",
    name: "PADI",
  },
  {
    id: "NAUI",
    name: "NAUI",
  },
  {
    id: "SSI",
    name: "SSI",
  },
  {
    id: "SDI",
    name: "SDI",
  },
  {
    id: "SNSI",
    name: "SNSI",
  },
  {
    id: "IANTD",
    name: "IANTD",
  },
  {
    id: "RAID",
    name: "RAID",
  },
];

const schema = yup.object().shape({
  organization: yup
    .mixed()
    .required(t("isRequired", { name: t("Diving Organization") })),
  diving_type: yup
    .mixed()
    .required(t("isRequired", { name: t("Diving Type") })),
  membership_number: yup
    .mixed()
    .required(t("isRequired", { name: t("labels.membershipNumber") })),
  title: yup
    .mixed()
    .required(t("isRequired", { name: t("Qualification Level") })),
  membership_copy: yup
    .mixed()
    .test(
      "membership_copy",
      t("isRequired", { name: t("Membership Copy") }),
      (value) => {
        if (initialValues.membership_copy_preview || value) {
          return true;
        } else {
          return false;
        }
        // membership_copy_preview
      }
    )
    // .required(t("isRequired", { name: t("Membership Copy") }))
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

const formInputs = reactive([
  {
    title: "Diving Type",
    name: "diving_type",
    inputs: [
      {
        label: "divingSite.Freediving", // "Name - English" "الاسم - انجليزي"
        name: "diving_type",
        value: "Freediving",
      },
      {
        label: "divingSite.Recreational", // "Name - English" "الاسم - انجليزي"
        name: "diving_type",
        value: "Recreational",
      },
      {
        label: "divingSite.Technical", // "Name - English" "الاسم - انجليزي"
        name: "diving_type",
        value: "Technical",
      },
    ],
  },
]);

watch(
  () => props.qualification,
  (value) => {
    if (value) {
      loading.value = true;

      initialValues.diving_type = value.speciality;
      initialValues.organization = value.issuing_organization;
      initialValues.title = value.title;
      initialValues.membership_number = value.number;
      initialValues.membership_copy_preview =
        WEB_URL + value.certificate_copy_link;
      initialValues["id"] = value.id;
      setTimeout(() => (loading.value = false), 300);
    }
  },
  { immediate: true, deep: true }
);

// VITE_LICENSED_DIVE_CENTERS

onMounted(() => {
  window.scrollTo({
    top: 0,
  });
});
</script>

<style lang="scss"></style>
