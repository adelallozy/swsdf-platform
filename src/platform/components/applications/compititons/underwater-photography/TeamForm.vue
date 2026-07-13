<template>
    <base-card class=" " title="racer_information">
        <loader v-if="loadingPage" />
        <VeeForm
        v-else
        :validation-schema="formSchema"
        :initial-values="formData"
        @submit="handleSubmit"
        >
        <div class="tw-grid md:tw-grid-cols-2 tw-mt-11 tw-mb-11 tw-gap-x-10 tw-gap-y-4">
    
            <base-select
            id="lens_type"
            name="lens_type"
            :label="t('Lens Type')"
            placeholder=" "
            :loading="false"
            :options="lensTypeOptions"
            :multiple="true" 
            />
    
            <base-input
             
            id="diver_work_leave"
            name="diver_work_leave"
            :label="$t('Send Work Leave To' )"
            :placeholder="$t('example hr')"
            type="text"
            />
        </div>

        <h3 class="tw-mb-2">{{ $t('Buddy Information')  }}</h3>
        <div class="tw-grid md:tw-grid-cols-2  tw-gap-x-10 tw-gap-y-4">
    
            <base-input
                id="body_name"
                name="body_name"
                :label="$t('Buddy Name')"
                :placeholder="$t('Buddy Name')"
                type="text"
                />

            <base-input
                id="body_identity_number"
                name="body_identity_number"
                :label="$t('Identity Number')"
                :placeholder="$t('Identity Number')"
                type="text"
                />

            <base-input
                id="body_mobile_number"
                name="body_mobile_number"
                :label="$t('Mobile Number')"
                :placeholder="$t('Mobile Number')"
                type="text"
                />

            <base-input 
                id="body_work_leave"
                name="body_work_leave"
                :label="$t('Send Work Leave To')"
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
import BaseInput from "@/website/components/inputs/BaseInput.vue";
import BaseSelect from "@/website/components/inputs/BaseSelect.vue";
import { reactive, ref, onMounted, watch } from "vue";
 

import { object, string, array } from "yup";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps({
    event: {
        type: Object,
        required: true,
    },
    participant: {
        type: Object,
        required: false,
    },

    btnLoading: {
        required: false,
    },
});

const emit = defineEmits(["submit"]);
  

const formSchema = object().shape({ 
    body_name: string().required("Required") ,  
    body_identity_number: string().required("Required"),
    body_mobile_number: string().required("Required") , 
    body_work_leave: string().required("Required") , 

    diver_work_leave: string().required("Required") , 
    lens_type: array()
        .min(1, "Required")
        .required("Required"),
    
});

const lensTypeOptions = ref([]);
const loadingPage = ref(true);

function handleSubmit(values) {
    console.log(values);
    emit("submit", values);
}

const formData = reactive({ 
    lens_type: [],
    diver_work_leave: "",
    body_identity_number: "",
    body_mobile_number: "",
    body_name: "",
    body_work_leave: "",
});
 

function fillFormData(values) {  
    formData.diver_work_leave = values.diver_work_leave;
    formData.body_identity_number = values.body_identity_number;
    formData.body_mobile_number = values.body_mobile_number;
    formData.body_name = values.body_name;
    formData.body_work_leave = values.body_work_leave; 
    formData.lens_type = values.lens_type.map((el) => ({ id: el, name: el }));
    loadingPage.value = false;
}

lensTypeOptions.value = props.event.racing_categories.map((el) => ({
    id: el,
    name: el,
})); 

onMounted(() => { 
    if (props.participant) {
        fillFormData({...props.participant});
    }else{
        loadingPage.value = false;
    }
});

 
</script>
