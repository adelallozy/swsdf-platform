<template>
    
  <div>
    <license-informations-form
    class="tw-bg-white"
      @submit="submitServices"
      :back="{ name: 'update-user-picture' }"
      :btn-loading="btnLoading"
    />
  </div>
</template>

<script setup>
const SET_SERVICES = import.meta.env.VITE_PROFESSIONAL_DIVERS_SET_SERVICES;
import LicenseInformationsForm from "@/platform/components/applications/professional-diver/LicenseInformationFrom.vue";
 
import { toast } from "vue3-toastify";
import axios from "axios";
import { useRouter, useRoute } from "vue-router";
import { ref } from "vue";

const btnLoading = ref(false);
const router = useRouter();
const route = useRoute();
function submitServices(values) {
btnLoading.value = true;
axios
    .post(SET_SERVICES + route.params.id, values)
    .then((res) => {
    btnLoading.value = false;
    router.push({
        name: "application-home",
        params: {
        id: res.data.application.id,
        },
    });
    })
    .catch((err) => {
        btnLoading.value = false;
        toast.error(err.response.data?.message || err.response.statusText);
    });
}
</script>
