<template>
<base-card
    title="License Informations"
    desc="Level based on your highest diving qualification"
>
    <loader v-if="loading" />
    <VeeForm
        v-else
        :validation-schema="formSchema"
        :initial-values="formData"
        @submit="handleSubmit"
        v-slot="{ meta }"
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
    <div class="tw-flex tw-mt-11 tw-gap-1 tw-justify-end">
        <router-link
        v-if="back"
        :to="{
            name: 'application-home',
            params: {
            id: $route.params.id,
            },
        }"
        class="base-btn-white tw-rounded-lg"
        >
        {{ $t("Previous") }}
        </router-link>
        <button
        type="submit"
        :disabled="btnLoading"
        class="base-btn tw-rounded-lg"
        >
        {{ $t("Next") }}
        </button>
    </div>
    </VeeForm>
</base-card>
</template>
<script setup>
import { onMounted } from "vue";
import { reactive, ref, watch } from "vue";
import { object, string } from "yup";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const loading = ref(true);
const props = defineProps({
  back: {
    required: false,
  },
  btnLoading: {
    required: false,
  },
});

const emit = defineEmits(["submit"]);

const formData = reactive({
  rank: "",
  card_design_id: "",
});

const formSchema = object().shape({
  rank: string()
    .required(t("isRequired", { name: t("professional_divers.rank") }))
    .nullable(),
  card_design_id: string()
    .required(t("isRequired", { name: t("Card Design") }))
    .nullable(),
});

const formInputs = reactive([
  {
    title: "professional_divers.rank",
    name: "rank",
    inputs: [
      {
        label: "professional_divers.Divemaster", 
        name: "rank",
        value: "Divemaster",
      },
      {
        label: "Snorkel Guide", 
        name: "rank",
        value: "Snorkel Guide",
      },
      {
        label: "professional_divers.Assistant Instructor",  
        name: "rank",
        value: "Assistant Instructor",
      },

      {
        label: "EFR Instructor",  
        name: "rank",
        value: "EFR Instructor",
      },


      {
        label: "professional_divers.Instructor",  
        name: "rank",
        value: "Instructor",
      },
      {
        label: "professional_divers.Instructor Trainer",  
        name: "rank",
        value: "Instructor Trainer",
      },
    ],
  },
  // {
  //   title: "Diving Type",
  //   name: "diving_type",
  //   inputs: [
  //     {
  //       label: "divingSite.Freediving", // "Name - English" "الاسم - انجليزي"
  //       name: "diving_type",
  //       value: "Freediving",
  //     },
  //     {
  //       label: "divingSite.Recreational", // "Name - English" "الاسم - انجليزي"
  //       name: "diving_type",
  //       value: "Recreational",
  //     },
  //     {
  //       label: "divingSite.Technical", // "Name - English" "الاسم - انجليزي"
  //       name: "diving_type",
  //       value: "Technical",
  //     },
  //   ],
  // },
  {
    title: "Card Design",
    name: "card_design_id",
    inputs: [
      {
        label: "Only Digital",
        name: "card_design_id",
        value: 0,
      },
      {
        label: "Hard Copy",
        name: "card_design_id",
        value: 1,
      },
    ],
  },
]);

function handleSubmit(values) {
  emit("submit", values);
}

function fillFormData() {
  loading.value = true;

  for (let [key, value] of Object.entries(props.profile)) {
    if (formData.hasOwnProperty(key)) {
      formData[key] = value;
    }
  }
  loading.value = false;
}
watch(
  () => props.profile,
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
</script>
<style lang="scss">
.form_inputs {
  &:has(.error) {
    > h3 {
      @apply tw-text-red-500;
    }
    label {
      span {
        @apply tw-text-red-500;
      }
    }
    input,
    textarea {
      @apply tw-text-red-500 tw-border-red-500;
    }
  }
}
</style>
