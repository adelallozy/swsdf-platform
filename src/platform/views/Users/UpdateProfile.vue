<template>
  <div class="tw-container">
    <general-breadcrumb 
      :items="items" 
      class="tw-bg-white"
      />
    <loader v-if="loading" />

    <UserProfileForm 
      v-else :profile="profile" 
      
      class="tw-bg-white"
      />
  </div>
</template>
<script setup>
import { useI18n } from "vue-i18n";
// import Profile from '@/components/page-layouts/Profile.vue';
import axios from "axios";
import { ref } from "vue";
import { useRoute } from "vue-router" ; 

import UserProfileForm from "@/platform/components/applications/UserProfileForm.vue";
  
const loading = ref(true);
const USERS_PROFILE = import.meta.env.VITE_APPS_USERS_PROFILES_PICK;
const profile = ref({});

const { t , locale  } = useI18n();
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
      path: { 
        name: "professional-diver-new-license",
          params: { locale: locale.value }  },
      name: "Professional Diver New License Application",
    },
  ],
}; 

const route = useRoute() ;
const id = route.params.id;

function setUserProfile(response) {
  if (response.data?.profile) {
    profile.value = response.data.profile;
  }
  loading.value = false;
}

function onFetchFailure(err) {}
axios.get(USERS_PROFILE + route.params.id).then(setUserProfile).then(onFetchFailure);

</script>
