<template>
  <div> 
    <base-card 
      
      class="tw-bg-white tw-mb-5"
      >
      <general-breadcrumb :items="items" />
    </base-card>
    <base-card   
      class="tw-bg-white" title="Personal Picture">
      <UserPicture

        @submit="updatePicture"
        :btn-loading="btnLoading"
        :back="{ name: 'application-home' }"
        
      />
    </base-card>
  </div>
</template>

<script setup>
import axios from "axios";
import UserPicture from "@/platform/components/applications/UserPicture.vue";
import { useRoute, useRouter } from "vue-router";
import { ref } from "vue";
import { useI18n } from "vue-i18n";

import { useApplicationStore } from '@/v3/composables/useApplicationStore.js' 

const { 
  loadApplication,
}  = useApplicationStore();
 


const UPDATE_PORTRAIT = import.meta.env
  .VITE_PROFESSIONAL_DIVERS_UPDATE_APPLICANT_PORTRAIT; 
const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const btnLoading = ref(false);

function updatePicture(file) {
  const frmData = new FormData();
  btnLoading.value = true;
  frmData.append("portrait_file", file.file);

  axios
    .post(UPDATE_PORTRAIT + route.params.id, frmData)
    .then(() => { 
      loadApplication(route.params.id) ;
      btnLoading.value = false;
      setTimeout(
        () =>
          router.push({
            name: "application-home",
            params: {
              id: route.params.id,
            },
          }),
        300
      );
    })
    .catch(() => (btnLoading.value = false));
}

const items = {
  title: t("Personal Picture"),
  links: [
    {
      path: "/",
      name: "Main",
    },
    {
      path: { name: "workspace" },
      name: "Workspace",
    },
    {
      name: "Show Application",
      path: {
        name: "application-home",
        params: {
          id: route.params.id,
        },
      },
    },

    {
      path: {
        name: "update-user-picture",
        params: {
          id: route.params.id,
        },
      },
      name: t("Personal Picture"),
    },
  ],
};
</script>

<style></style>
