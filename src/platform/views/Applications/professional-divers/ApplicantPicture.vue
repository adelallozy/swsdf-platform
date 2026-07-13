<template>
  <base-card class="tw-mt-5" title="Personal Picture" desc="test">
    <UserPicture
      @submit="updatePicture"
      :btn-loading="btnLoading"
      :back="{ name: 'application-home' }"
    />
  </base-card>
</template>

<script setup>
import axios from "axios";
import UserPicture from "@/platform/components/applications/UserPicture.vue";
import { useRoute, useRouter } from "vue-router";
import { ref } from "vue";
const UPDATE_PORTRAIT = import.meta.env
  .VITE_PROFESSIONAL_DIVERS_UPDATE_APPLICANT_PORTRAIT;

const route = useRoute();
const router = useRouter();
const btnLoading = ref(false);
function updatePicture(file) {
  const frmData = new FormData();

  btnLoading.value = true;
  frmData.append("portrait_file", file.file);

  axios
    .post(UPDATE_PORTRAIT + route.params.id, frmData)
    .then(() => {
      btnLoading.value = false;
      router.push({
        name: "professional-diver-application-review",
        params: {
          id: route.params.id,
        },
      });
    })
    .catch(() => (btnLoading.value = false));
}
</script>

<style></style>
