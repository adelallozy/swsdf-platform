<template>
  <base-card class=" " title="Add New Athletes">
    <VeeForm
      :validation-schema="formSchema"
      :initial-values="formData"
      @submit="handleSubmit"
    >
      <div class="tw-grid md:tw-grid-cols-2 tw-mt-11 tw-gap-x-10 tw-gap-y-4">
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
            :loading="optionLoading"
            v-model:itemValue="formData[formInput.name]"
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
        :disabled="btnLoading"
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
import { reactive, ref } from "vue"; 

import { object, string } from "yup";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps({
    application: {
        type: Object,
        required: false,
    },

    diveCenters: {
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
  user_id: "",
  diving_center_id: {},
  personal_best: "",
  announced_performance: "",
  discipline: "",
});

const formSchema = object().shape({
  user_id: string().required(t("ERRORS.enter", { name: t("Athletes Number") })),
  diving_center_id: string()
    .required(t("isRequired", { name: t("divingCenter") }))
    .nullable(),
  personal_best: string()
    .required(t("isRequired", { name: t("Personal Best") }))
    .nullable(),
  announced_performance: string()
    .required(t("isRequired", { name: t("Announced Performance") }))
    .nullable(),
  discipline: string()
    .required(t("isRequired", { name: t("Discipline") }))
    .nullable(),
});

const formInputs = reactive([
    {
        label: "Athletes Number",
        name: "user_id",
        required: true,
        type: "text",
    },

    {
        label: "divingCenter",
        name: "diving_center_id",
        required: true,
        type: "select",
        options: [],
    },
    {
        label: "Personal Best",
        name: "personal_best",
        required: true,
        type: "text",
    },

    {
        label: "Announced Performance",
        name: "announced_performance",
        required: true,
        type: "text",
    },
    {
        label: "Discipline",
        name: "discipline",
        required: true,
        type: "select",
        options: [ ],
    },
]);

function handleSubmit(values) {
    emit("submit", values);
}



onMounted( () =>{  
        
        let disciplinesOptions = [];
        let divingCentersOptions = [];
        props.event.races.forEach(element => {
            disciplinesOptions.push({
                name: element,
                id:element,
            }); 
        }); 

        props.diveCenters.forEach(element => {
            divingCentersOptions.push({
                name: element.name,
                id:element.id,
            }); 
        });

        formInputs.map((el) => {

            if (el.name == "diving_center_id") { 
                el.options = divingCentersOptions
            } ;
            if (el.name == "discipline") {
                el.options = disciplinesOptions;
            }
        });

        optionLoading.value = false;    

});
</script>
