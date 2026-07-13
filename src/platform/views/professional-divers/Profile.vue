<template>
  <div>
    <general-breadcrumb :items="items" />
    <loader v-if="loading" />
    <div class="tw-space-y-5 tw-mt-4" v-else>
      <license-summary v-if="license" :license="license" />

      <profile-details
        v-if="userProfile"
        :userPicture="usersPicture"
        :profile="userProfile"
      />
 
      <Contracts v-if="diverContracts?.length" :diverContracts="diverContracts" />
    </div>
  </div>
</template>

<script setup>
const PICK = import.meta.env.VITE_PROFESSIONAL_DIVERS_PICK;
import axios from "axios";
import { ref } from "vue";

import LicenseSummary from "@/platform/components/applications/professional-diver/LicenseSummary.vue";

import ProfileDetails from "@/platform/components/applications/professional-diver/ProfileDetails.vue";
import Contracts from "@/platform/components/applications/professional-diver/WorkContracts.vue";
 
import { useRoute, useRouter } from "vue-router";
 
const router = useRouter();
const loading = ref(true);

const license = ref(null);
const userProfile = ref(null);
const usersPicture = ref(null);
const memberships = ref(null);
const diverContracts = ref(null);
function assignData(response) {
  if (!response?.data) {
    loading.value = false;
    return;
  }

  //
  if (response.data.license) {
    license.value = response.data.license;
  }

  if (response.data.usersPicture) {
    usersPicture.value = response.data.usersPicture;
  }

  if (response.data.userProfile) {
    userProfile.value = response.data.userProfile;
  }

  if (response.data.memberships) {
    memberships.value = response.data.memberships;
  }
  if (response.data.diverContracts) {
    diverContracts.value = response.data.diverContracts;
  }
  loading.value = false;
}

function pickError(error) {
  if (error.response?.status === 404) {
    router.push({
      name: "professional-divers-license-instructions", 
    });
  }
}

axios.get(PICK).then(assignData).catch(pickError);

const items = {
  title: "Professional Diver License",
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
      path: { name: "professional-diver-license" },
      name: "Professional Diver License",
    },
  ],
};
</script>

<style src="@/assets/sass/centerProfile.scss" lang="scss"></style>
