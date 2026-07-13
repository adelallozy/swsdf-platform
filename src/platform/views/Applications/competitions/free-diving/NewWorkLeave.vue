<template>
  <base-card class=" " title="Work leave details">
    <loader v-if="loadingPage" />
    <VeeForm
      v-else
      :validation-schema="formSchema"
      :initial-values="formData"
      @submit="handleSubmit"
    >
      <div class="tw-grid md:tw-grid-cols-2 tw-mt-11 tw-gap-x-10 tw-gap-y-4">
        <base-select
          id="user_id"
          name="user_id"
          :label="$t('Athlete')"
          :placeholder="$t('Athlete')"
          :loading="optionLoading"
          :options="racers"
          :multiple="false"
          v-model:itemValue="selcetedRaces"
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
const PICK_RELATIVES = import.meta.env.VITE_COMPITION_FREEDIVING_PICK_RELATIVES;
const NEW_WORK_LEAVE = import.meta.env.VITE_COMPITION_FREEDIVING_NEW_WORK_LEAVE;
import { toast } from "vue3-toastify";
import BaseInput from "@/website/components/inputs/BaseInput.vue";
import NoramlSelect from "@/website/components/inputs/NoramlSelect.vue";

import BaseSelect from "@/website/components/inputs/BaseSelect.vue";
import { reactive, ref, onMounted, watch } from "vue";

import axios from "axios";

import { object, string, array } from "yup";
import { useI18n } from "vue-i18n";
import { useRoute,useRouter } from "vue-router";
import { FieldArray } from "vee-validate";


const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const racers = ref([]);
const loadingPage = ref(true);
const btnLoading = ref(false);

const emit = defineEmits(["submit"]);

const optionLoading = ref(true);

const formData = reactive({
    user_id: "",
  work_leave: "",

});

function assignData(response) {
  if (!response?.data) {
    optionLoading.value = false;
    loadingPage.value = false;
    return;
  }


  if (response.data.freedivingParticipants) {
   
  
    racers.value =  response.data.freedivingParticipants.map((el) => ({
      id: el.user_id,
      name: el.athlete_name,
    }));

  }
  loadingPage.value = false;
  optionLoading.value = false;
}

function getApplication() {
    optionLoading.value = true;
    axios.get(PICK_RELATIVES + route.params.id).then(assignData);
}







const formSchema = object().shape({

  work_leave: string().required(t("Work leave is required")).nullable(),
  user_id: string()
    .required(t("isRequired", { name: t("Athlete") })),

});





function handleSubmit(values) {
  const frmData = new FormData();

  btnLoading.value = true;
  axios
    .post(NEW_WORK_LEAVE + route.params.id, values)
    .then((res) => {
      btnLoading.value = false;
      router.push({
        name: "freediving-competition-application",
        params: {
          id: route.params.id,
        },
      });
    })
    .catch((err) => {
      btnLoading.value = false;
  
      toast.error(err.response.data.message);
  
    });
}

const selcetedRaces = ref([]);




onMounted(() => getApplication());
</script>
