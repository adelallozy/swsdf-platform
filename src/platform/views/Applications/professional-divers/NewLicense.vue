<template>
  <div class="tw-space-y-6">
    <base-card class=" tw-bg-white">
      <general-breadcrumb :items="items" />
    </base-card>
    <loader v-if="loading" />
    <template v-else>
      <UserProfileForm
        :profile="profile"
        :loading="btnLoading"
        @submit="submitProfile"
        class=" tw-bg-white"
      />
    </template>
  </div>
</template>
<script setup>
import { useI18n } from "vue-i18n";
import { toast } from "vue3-toastify";
import axios from "axios";
import { ref } from "vue";
import UserProfileForm from "@/platform/components/applications/UserProfileForm.vue";
import { useRouter } from "vue-router";

const loading = ref(true);
const NEW_LICENSE = import.meta.env.VITE_PROFESSIONAL_DIVERS_NEW_LICENSE;
const USERS_PROFILE = import.meta.env.VITE_APPS_USERS_PROFILES_PICK;
const profile = ref({});
const router = useRouter();
const btnLoading = ref(false);
const { t } = useI18n();
const items = {
  title: "Professional Diver New License Application",
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
      path: { name: "professional-diver-new-license" },
      name: "Professional Diver New License Application",
    },
  ],
};

function setUserProfile(response) {
  if (response.data?.profile) {
    profile.value = response.data.profile;
  }
  loading.value = false;
}

function onFetchFailure(err) {}

axios.get(USERS_PROFILE).then(setUserProfile).catch(onFetchFailure);

function submitProfile(values) {
  btnLoading.value = true;
  axios
    .post(NEW_LICENSE, values)
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
      console.log(err.response);
      btnLoading.value = false;
      toast.error(err.response.statusText);
    });
}
</script>
