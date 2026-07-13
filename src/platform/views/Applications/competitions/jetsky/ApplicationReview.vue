<template>
  <div>
    <loader v-if="loading" />
    <div class="tw-space-y-5 tw-mt-4" v-else>
      <div class="tw-flex tw-items-center tw-justify-between tw-gap-3">
        <general-breadcrumb :items="breads" />
      </div>
      <license-summary 
        v-if="application" 
        :application="application" 

        :applicationNotes="applicationEntities?.notes" 
        :event="event" />

      <DetailsCard :user-profile="userProfile" :application="application" :event="jetskiParticipant" />
      <UserProfileFiles
        v-if="application?.required_files?.length"
        :application-files="populatedEntities.files"
        :application="application"
      />
      <UserProfileFiles />
    </div>
  </div> 
</template>

<script setup>
const PICK_RELATIVES = import.meta.env.VITE_COMPITION_FREEDIVING_PICK_RELATIVES;
import axios from "axios";
import { onMounted, ref, watch, reactive } from "vue";
import LicenseSummary from "@/platform/components/applications/Summary.vue";
import UserProfileFiles from "@/platform/components/applications/UserProfileFiles.vue";
import DetailsCard from "@/platform/components/applications/compititons/jetsky/Details.vue";

import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
 

	import { useApplicationStore } from "@/v3/composables/useApplicationStore";
	const appStore = useApplicationStore();
	const {
		application,
    populatedEntities,
    applicationEntities, 
	} = appStore;


const { t } = useI18n();
const route = useRoute();

const loading = ref(true);
const event = ref(null);
const jetskiParticipant = ref(null);
const userProfile = ref(null);

const breads = reactive({
  title: "NAV.applications",
  links: [],
});

function assignData(response) {
  if (!response?.data) {
    loading.value = false;
    return;
  }
  breads.title = t("application", {
    name: t(application?.purpose ?? ""),
  });
  breads.links = [
    {
      name: "Main",
      path: "/",
    },
    {
      name: "Workspace",
      path: { name: "workspace" },
    },
    {
      name: "NAV.applications",
      path: { name: "user-applications" },
    },
    {
      name: t("application", {
        name: t("Jetski Competition Participation"),
      }),
      path: {
        name: "jetsky-competition-application",
      },
    },
  ];

  if (response.data.jetskiParticipant) {
    jetskiParticipant.value = response.data.jetskiParticipant;
  }
  if (response.data.userProfile) {
    userProfile.value = response.data.userProfile;
  }
  if (response.data.event) {
    event.value = response.data.event;
  }

 
  loading.value = false;
}

function getApplication() {
  axios.get(PICK_RELATIVES + route.params.id).then(assignData);
}

 

 
onMounted(() => {
  getApplication();
});

const items = {
  title: t("Professional Diver License"),
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
      name: t("Professional Diver License"),
    },
  ],
};
</script>

<style src="@/assets/sass/centerProfile.scss" lang="scss"></style>
