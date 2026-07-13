<template>
<AthleteProfile :profileData ="data" />
</template>

<script setup>
const PICK = import.meta.env.VITE_ATHLTETES_PROFILE;
import axios from "axios";
import { onMounted, ref } from "vue";

 
import AthleteProfile from "@/v3/pages/athletes/AthleteProfile.vue";

import { useRouter } from "vue-router";

defineProps({
  application: {
    required: false,
  },
});

const router = useRouter();
const loading = ref(true);

const data = ref(null);
const athlete = ref(null);
const userProfile = ref(null);
const userPicture = ref(null);
const internationalMemberships = ref(null);
const workContracts = ref(null);
function assignData(response) {
  if (!response?.data) {
    loading.value = false;
    return;
  }
  data.value = response.data;
  //
  if (response.data.athlete) {
    athlete.value = response.data.athlete;
  }

  if (response.data.userPicture) {
    userPicture.value = response.data.userPicture;
  }

  if (response.data.userProfile) {
    userProfile.value = response.data.userProfile;
  }

  loading.value = false;
}

function pickError(error) {
  if (error.response?.status === 404) {
    router.push({
      name: "atheltes-instructions",
    });
  }
}
onMounted(() => axios.get(PICK).then(assignData).catch(pickError));

const items = {
  title: "Athlete Registration",
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
      path: { name: "athlete-registration" },
      name: "Athlete Registration",
    },
  ],
};
</script>

<style src="@/assets/sass/centerProfile.scss" lang="scss"></style>
