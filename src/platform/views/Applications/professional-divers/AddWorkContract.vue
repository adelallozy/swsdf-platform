<template>
  <div>
 
    <base-card1 :title="$t('Add a cooperation contract')">
      <WorkContractForm :btn-loading="btnLoading" @submit="onSubmit" />
    </base-card1>
  </div>
</template>

<script setup>
import WorkContractForm from "@/platform/components/applications/professional-diver/WorkContractForm.vue";
const REGISTER_WORK_CONTRACT = import.meta.env
  .VITE_REGISTER_PROFESSIONAL_DIVER_WORK_CONTRACT;
import axios from "axios";
import { reactive, ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { toast } from "vue3-toastify"; 

const route = useRoute();
const router = useRouter();

const btnLoading = ref(false); 
 

function onSubmit(values) {
  btnLoading.value = true;
  const frmData = new FormData();
  frmData.append("dive_center_id", values.center);
  frmData.append("work_contract_copy_file", values.contract);
  axios
    .post(REGISTER_WORK_CONTRACT + route.params.id, frmData)
    .then(() => {
      console.log('contract registerd');
      router.push({
        name: "application-home",
        params: { 
          id: route.params.id 
        },
      }); 
      getData();
      btnLoading.value = false;
    })
    .catch((err) => {
		btnLoading.value = false;
		toast.error(err.response.data.message);
    });
}
</script>
