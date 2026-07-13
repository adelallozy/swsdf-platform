<template>
  <div>
    <loader v-if="loading" />
    <div class="tw-space-y-11 tw-mt-4" v-else>
      <div class="tw-flex tw-items-center tw-justify-between tw-gap-3">
        <general-breadcrumb :items="breads" />
      </div>
      <license-summary 
        v-if="application" 
        :application="application" 
        :applicationNotes = "applicationEntities?.notes"
        :event="event" 
        />

      <router-link
        v-if="['draft', 'applicant_revision'].includes(application.stage)"
        class="tw-w-fit tw-rounded-lg tw-py-1 base-btn tw-ms-auto"
        :to="{
          name: 'add-new-athletes',
          params: {
            id: $route.params.id,
          },
        }"
      >
        {{ $t("Add New Athletes") }}
      </router-link>
      <div class="tw-space-y-4">
        <athletes-card
          :stage="application.stage"
          v-for="(participant, index) in participants"
          :key="participant.id"
          :participant="participant"
          @deleted="participants.splice(index, 1)"
        />
      </div>

      <div>
        <div
          class="tw-flex tw-items-center tw-gap-2 tw-justify-between tw-mb-4"
        >
          <h3 class="tw-text-foreground tw-text-2xl tw-font-bold">
            {{ $t("Work Leaves") }}
          </h3>

          <router-link
            v-if="['draft', 'applicant_revision'].includes(application.stage)"
            class="tw-w-fit tw-rounded-lg tw-py-1 base-btn tw-ms-auto"
            :to="{
              name: 'add-working-leave',
              params: {
                id: $route.params.id,
              },
            }"
          >
            {{ $t("Add Work Leave") }}
          </router-link>
        </div>
        <div class="tw-space-y-4">
          <WorkLeaveCard
            :stage="application.stage"
            v-for="(workLeave, index) in workLeaves"
            :key="workLeave.id"
            :work-leave="workLeave"
            @deleted="workLeaves.splice(index, 1)"
          />
        </div>
      </div>
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

import AthletesCard from "@/platform/components/applications/compititons/free-diving/AthletesCard.vue";
import WorkLeaveCard from "@/platform/components/applications/compititons/free-diving/WorkLeaveCard.vue";


import ApplicationFiles from "@/v3/components/Applications/Files.vue";

import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";

	import { useApplicationStore } from "@/v3/composables/useApplicationStore";
	const appStore = useApplicationStore();
	const {
		application,
    applicationEntities, 
		loadApplication,
	} = appStore;

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const loading = ref(true);
const participants = ref([]);
const workLeaves = ref([]);
const event = ref(null);

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
        name: t("Freediving Competition Participation"),
      }),
      path: {
        name: "freediving-competition-application",
      },
    },
  ];

  if (response.data.freedivingParticipants) {
    participants.value = response.data.freedivingParticipants;
  }
  if (response.data.workLeaves) {
    workLeaves.value = response.data.workLeaves;
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

watch(
  () => application,
  () => {
    if (application) {
      detectApplication(application);
    }
  },
  {
    immediate: true,
    deep: true,
  }
);

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
