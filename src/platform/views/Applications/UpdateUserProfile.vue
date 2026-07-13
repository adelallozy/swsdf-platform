<template v-if="application?.requirements?.files" >
  <div class="tw-space-y-6">
 
    <loader v-if="loading" />
    <template v-else>
      <UserProfileForm
        class="tw-bg-white"
        :profile="profile"
        :loading="btnLoading"
        @submit="submitProfile"
      />
    </template>
  </div>
</template>
<script setup>
import { useI18n } from "vue-i18n";
import { toast } from "vue3-toastify";
// import Profile from '@/components/page-layouts/Profile.vue';
import axios from "axios";
import { onMounted, ref, getCurrentInstance } from "vue";
import UserProfileForm from "@/platform/components/applications/UserProfileForm.vue";
import { useRoute, useRouter } from "vue-router";
const route = useRoute();
const router = useRouter();
const loading = ref(true);
const UPDATE_USER_PROFILE = import.meta.env.VITE_APPS_USERS_UPDATE_USER_PROFILE;
const USERS_PROFILE = import.meta.env.VITE_APPS_USERS_PROFILES_PICK;
const profile = ref({});

const globalVariable = getCurrentInstance();
const emitter = globalVariable.appContext.config.globalProperties.emitter;

const btnLoading = ref(false);
const { t } = useI18n();
 const appId  = route.params.id ;

function setUserProfile(response) {
  if (response.data?.profile) {
    profile.value = response.data.profile;
  }
  loading.value = false;
}

function onFetchFailure(err) {}

function submitProfile(values) {
  btnLoading.value = true;
  axios
    .post(UPDATE_USER_PROFILE + appId, values)
    .then((res) => {
      btnLoading.value = false;
      emitter.emit("getApplication");
      setTimeout(
        () =>
          router.push({
            name: "application-home",
            params: {
              id: appId,
            },
          }),
        300
      );
    })
    .catch((err) => {
      btnLoading.value = false;
      toast.error(err.response.statusText);
    });
}

function getProfile() {
  axios
    .get(USERS_PROFILE + appId)
    .then(setUserProfile)
    .catch(onFetchFailure);
}
 

onMounted(() => getProfile());
</script>
