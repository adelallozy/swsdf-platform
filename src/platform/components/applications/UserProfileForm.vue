<template>
  <base-card
    class=" "
    title="Applicant Personal Information"
    desc="The information of the applicant as National Identity Or Iqama"
  >
    <loader v-if="loadingPage" />
    <VeeForm
      v-else
      :validation-schema="formSchema"
      :initial-values="formData"
      @submit="handleSubmit"
    >
      <div class="tw-grid md:tw-grid-cols-2 tw-gap-x-10 tw-gap-y-4">
        <template v-for="(formInput, index) in formInputs" :key="index">
          <base-date
            v-if="formInput.type == 'date'"
            :id="formInput.name"
            :name="formInput.name"
            :label="$t(formInput.label)"
            :placeholder="$t(formInput.label)"
            v-model:itemValue="formData[formInput.name]"
          />
          
          <base-select
            v-else-if="formInput.type == 'select'"
            :id="formInput.name"
            :name="formInput.name"
            :label="$t(formInput.label)"
            :placeholder="$t(formInput.label)"
            :options="formInput.options"
            :loading="citiesLoading"
            v-model:itemValue="formData[formInput.name]"
            @change="resetCity($event, formInput.name)"
          />
          <base-input
            v-else
            :id="formInput.name"
            :name="formInput.name"
            :label="$t(formInput.label)"
            :placeholder="$t(formInput.label)"
            :type="formInput.type"
          />
        </template>
      </div>
      <button
        type="submit"
        :disabled="loading"
        class="base-btn tw-rounded-lg tw-ms-auto"
      >
        {{ $t("Next") }}
      </button>
    </VeeForm>
  </base-card>
</template>

<script setup>
import BaseInput from "@/website/components/inputs/BaseInput.vue";
import BaseSelect from "@/website/components/inputs/BaseSelect.vue";
import BaseDate from "@/website/components/inputs/BaseDate.vue";
import { onMounted } from "vue";
import { reactive, ref, watch } from "vue";
import axios from "axios";
import { useRoute, useRouter } from "vue-router";
import { object, string, array, mixed } from "yup";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const loadingPage = ref(true);
const props = defineProps({
  application: {
    type: Object,
    required: false,
  },

  profile: {
    type: Object,
    required: true,
  },
  loading: {
    required: false,
  },
});

const emit = defineEmits(["submit"]);

const route = useRoute();
const router = useRouter();

if (Number.isNaN(route.params.id)) {
  router.push({ name: "404" });
}

const citiesLoading = ref(true);
const cities = ref([]);
const isPosting = ref(false);
const canSubmit = ref(true);
const formData = reactive({
  name_ar: "",
  name_en: "",
  // date_of_birth: null,
  birthdate: "",
  gender: "Male",
  nationality: "",
  mobile: "",
  city_id: 0,
  region_id: 0,
  address: "",
  identity_number: "",
  // identity_file: null,
  // medical_examination_file: null,
});

const formSchema = object().shape({
  name_ar: string()
    .required(t("ERRORS.enter", { name: t("Full name - Arabic") }))
    .max(120)
    .matches(
      /^([\u0600-\u065F\u066A-\u06EF\u06FA-\u06FF]{2,}\s+){2,}([\u0600-\u065F\u066A-\u06EF\u06FA-\u06FF]{2,}\s*)$/,
      { message: t("ERRORS.enter", { name: t("Full name - Arabic") }) }
    ),
  name_en: string()
    .required(t("ERRORS.enter", { name: t("Full name - English") }))
    .matches(/^([a-zA-Z]{2,}\s+){2,}([a-zA-Z]{2,}\s*)$/g, {
      message: t("ERRORS.enter", { name: t("Full name - English") }),
    }),
  gender: string()
    .required(t("isRequired", { name: t("profiles.gender") }))
    .nullable(),
  nationality: string()
    .required(t("isRequired", { name: t("profiles.nationality") }))
    .nullable(),
  birthdate: string()
    .required(t("isRequired", { name: t("profiles.birthdate") }))
    .nullable(),
  identity_number: string()
    .required(t("isRequired", { name: t("profiles.identity_number") }))
    .matches(/^[12]\d{9}$/, t("Please, Enter valid identity number"))
    .nullable(),
  mobile: string()
    .required(t("isRequired", { name: t("addresses.mobile") }))
    .matches(/^0*5\d{8}$/, t("Please, Enter valid mobile number"))
    .nullable(),
  city_id: string()
    .required(t("isRequired", { name: t("addresses.city") }))
    .matches(/^\d{1,8}$/, "Invalid data")
    .nullable(),
  region_id: string()
    .required(t("isRequired", { name: t("addresses.region") }))
    .matches(/^\d{1,8}$/, "Invalid data")
    .nullable(),
  // address: string().required("Required data"),

  // identity_file: mixed()
  //   .required("Required file")
  //   .test("fileSize", "File Size must be less than 1MB", function (file) {
  //     if (file == null) {
  //       return true;
  //     }
  //     return file.size < 1024 * 1024;
  //   })
  //   .test("fileType", "File must be in format of PDF or Image", function (
  //     file
  //   ) {
  //     if (file == null) {
  //       return true;
  //     }
  //     return file.type == "application/pdf" || file.type.startsWith("image/");
  //   }),
  // medical_examination_file: mixed()
  //   // .required('Required file')
  //   .test("fileSize", "File Size must be less than 2MB", function (file) {
  //     if (file == null) {
  //       return true;
  //     }
  //     return file.size < 1024 * 1024 * 2;
  //   })
  //   .test("fileType", "File must be in PDF format", function (file) {
  //     if (file == null) {
  //       return true;
  //     }
  //     return file.type == "application/pdf" || file.type.startsWith("image/");
  //   }),
});

const formInputs = reactive([
  {
    label: "Full name - Arabic", //"Name - Arabic" "الاسم - عربي"
    name: "name_ar",
    required: true,
    type: "text",
  },

  {
    label: "Full name - English", // "Name - English" "الاسم - انجليزي"
    name: "name_en",
    required: true,
    type: "text",
  },

  {
    label: "profiles.gender",
    name: "gender",
    required: true,
    type: "select",
    options: [
      {
        name: t("profiles.male"),
        id: "Male",
      },
      {
        name: t("profiles.female"),
        id: "Female",
      },
    ],
  },
  {
    label: "profiles.nationality", // "Nationality" "الجنسية"
    name: "nationality",
    required: true,
    type: "text",
  },

  {
    label: "profiles.birthdate", // "Date of Birth"   "تاريخ الميلاد"
    name: "birthdate",
    required: true,
    type: "date",
  },

  {
    label: "Identity Number",
    name: "identity_number",
    required: true,
    type: "text",
  },

  {
    label: "addresses.mobile",
    name: "mobile",
    required: true,
    type: "text",
  },

  {
    label: "addresses.region",
    name: "region_id",
    required: true,
    type: "select",
    options: [],
  },
  {
    label: "addresses.city",
    name: "city_id",
    required: true,
    type: "select",
    options: [],
  },
  {
    label: "addresses.address",
    name: "address",
    required: true,
    type: "text",
  },
]);

function saveSuccess(response) {
  toast.success("forms.saved_successfully", {
    autoClose: 3000,
  });
  //
}

function setCitiesOptions() {
  formInputs.map((el) => {
    if (el.name == "city_id") {
      el.options = cities.value.filter(
        (city) => city.region_id == formData.region_id
      );
    }
  });
}

function resetCity(event, name) {
  if (name == "region_id") {
    formData.city_id = null;
  }
}

function handleSubmit(values) {
  emit("submit", values);
}

watch(
  () => {
    return { region_id: formData.region_id };
  },
  (newData, oldData) => {
    if (!newData.region_id || newData.region_id == oldData.region_id) {
      return;
    }
    setCitiesOptions();
  }
);

 

function fillFormData() {
  loadingPage.value = true;

  for (let [key, value] of Object.entries(props.profile)) {
    if (formData.hasOwnProperty(key)) {
      formData[key] = value;
    }
  }
  loadingPage.value = false;
}
watch(
  props.profile,
  () => {
    if (props.profile) {
      fillFormData();
    } else {
      loading.value = false;
    }
  },
  {
    deep: true,
    immediate: true,
  }
);

function getRegionAndCities() {
  citiesLoading.value = true;

  axios
    .get(`addresses/common`)
    .then((res) => {
      cities.value = res.data.cities;
      formInputs.map((el) => {
        if (el.name == "region_id") {
          el.options = res.data.regions;
        }
        if (el.name == "city_id") {
          el.options = res.data.cities;
        }
      });
      setCitiesOptions();

      citiesLoading.value = false;
    })
    .catch(() => (citiesLoading.value = false));
}

onMounted(() => getRegionAndCities());
</script>
