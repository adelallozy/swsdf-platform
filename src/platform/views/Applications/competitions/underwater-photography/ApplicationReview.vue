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
            :event="event" />

        <DetailsCard 
            :user-profile="userProfile" 
            :application="application" 
            :participant="participant" 
            />
 
        <ApplicationFiles
          v-if="application.id" 
          :applicationId="application.id" />
        </div>
    </div>
</template>

<script setup>
const PICK_RELATIVES = import.meta.env.VITE_COMPITION_FREEDIVING_PICK_RELATIVES;
import axios from "axios";
import { onMounted, ref, watch, reactive } from "vue";
import LicenseSummary from "@/platform/components/applications/Summary.vue";	
import ApplicationFiles from "@/v3/components/Applications/Files.vue";

import DetailsCard from "@/platform/components/applications/compititons/underwater-photography/Details.vue";

import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";

	import { useApplicationStore } from "@/v3/composables/useApplicationStore";
	const appStore = useApplicationStore();
	const {
		application,
	} = appStore;

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const loading = ref(true);
const event = ref(null);
const participant = ref(null);
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

  if (response.data.underwaterParticipant) {
    participant.value = response.data.underwaterParticipant;
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

function detectApplication(application) {
  if(!application?.progress) {
    return ;
  }
  if (application.progress["Applicant Profile"] == "Required") {
    router.push({
      name: "update-user-profile",
      params: {
        id: application.id,
      },
    });
  } else if (application.progress["Applicant Portrait"] == "Required") {
    router.push({
      name: "update-user-picture",
      params: {
        id: application.id,
      },
    });
  } else if (application.progress["Professional Diver Rank"] == "Required") {
    router.push({
      name: "professional-diver-application-license-informations",
      params: {
        id: application.id,
      },
    });
  }
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
