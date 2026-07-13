<template>
  <base-card class=" " title="racer_information">
    <loader v-if="loadingPage" />
    <VeeForm
      v-else
      :validation-schema="formSchema"
      :initial-values="formData"
      @submit="handleSubmit"
    >
      <div class="tw-grid md:tw-grid-cols-2 tw-mt-11 tw-gap-x-10 tw-gap-y-4">
        <!-- <div class="md:tw-col-span-2">
          <FieldArray name="races" v-slot="{ fields, push, remove }">
            <div class="tw-flex-1">
              <noraml-select
                :placeholder="$t('Racing categories')"
                :label="$t('Racing categories')"
                id="Racing_categories"
                type="text"
                :loading="optionLoading"
                :options="categories"
                @change="
                  !fields.some((el) => el.value.race == $event) &&
                    push({ race: $event })
                "
              />
            </div>

            <ul class="tw-flex tw-items-center tw-gap-3 tw-flex-wrap">
              <li
                v-for="(field, idx) in fields"
                :key="field.key"
                class="tw-text-foreground !tw-mb-0 tw-text-sm tw-font-medium tw-p-2 tw-rounded-md tw-shadow"
              >
                {{ field.value.race }}
                <button
                  type="button"
                  class="tw-text-red-500 tw-ms-2"
                  @click="remove(idx)"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </li>
            </ul>

            <VeeErrorMessage
              v-if="!meta.valid && meta.touched"
              name="races"
              as="div"
              class="tw-text-red-500"
            />
          </FieldArray>
        </div> -->
        <base-select
          id="races"
          name="races"
          :label="t('Racing categories')"
          placeholder=" "
          :loading="optionLoading"
          :options="categories"
          :multiple="true"
          v-model:itemValue="selcetedRaces"
        />
        <base-input
          id="racer_number"
          name="racer_number"
          :label="$t('Racer Number')"
          :placeholder="$t('Racer Number')"
          type="text"
        />
        <base-input
          id="work_leave"
          name="work_leave"
          :label="$t('Work leave')"
          :placeholder="$t('example hr')"
          type="text"
        />
      </div>
      <button
        type="submit"
        :disabled="btnLoading"
        class="base-btn tw-rounded-lg tw-ms-auto tw-mt-11"
      >
        {{ $t("Next") }}
      </button>
    </VeeForm>
  </base-card>
</template>

<script setup>
const EVENTS_PICK = import.meta.env.VITE_EVENTS_PICK;
import BaseInput from "@/website/components/inputs/BaseInput.vue";
import NoramlSelect from "@/website/components/inputs/NoramlSelect.vue";

import BaseSelect from "@/website/components/inputs/BaseSelect.vue";
import { reactive, ref, onMounted, watch } from "vue";

import axios from "axios";

import { object, string, array } from "yup";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { FieldArray } from "vee-validate";

const { t } = useI18n();

const props = defineProps({
  application: {
    type: Object,
    required: false,
  },
  event: {
    type: Object,
    required: false,
  },

  btnLoading: {
    required: false,
  },
});

const emit = defineEmits(["submit"]);

const optionLoading = ref(true);

const formData = reactive({
  racer_number: "",
  work_leave: "",

  races: [],
});

const route = useRoute();

const formSchema = object().shape({
  racer_number: string().required(
    t("ERRORS.enter", { name: t("Racer Number") })
  ),
  work_leave: string().required(t("Work leave is required")).nullable(),
  races: array()
    .min(1, t("isRequired", { name: t("Racing categories") }))
    .required(t("isRequired", { name: t("Racing categories") })),

  // .of(
  //   object().shape({
  //     race: string().required(
  //       t("isRequired", { name: t("Racing categories") })
  //     ),
  //   })
  // )
  // .strict(),
});

const categories = ref([]);
const loadingPage = ref(true);

function handleSubmit(values) {
  emit("submit", values);
}
const selcetedRaces = ref([]);
function getRaces() {
  optionLoading.value = true;
  axios.get(EVENTS_PICK + route.params.event).then((res) => {
    categories.value = res.data.event.races.map((el) => ({
      id: el,
      name: el,
    }));

    optionLoading.value = false;
  });
}

function fillFormData(values) {
  formData.work_leave = values.work_leave;
  formData.racer_number = values.racer_number;
  selcetedRaces.value = values.races.map((el) => ({ name: el, id: el }));
  formData.races = values.races.map((el) => ({ id: el, name: el }));
  loadingPage.value = false;
}
watch(
  () => props.event,
  () => {
    if (props.event) {
      fillFormData(props.event);
    } else {
      loadingPage.value = false;
    }
  },
  {
    deep: true,
    immediate: true,
  }
);

onMounted(() => getRaces());
</script>
