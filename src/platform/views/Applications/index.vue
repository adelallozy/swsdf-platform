<template>
  <!-- <Teleport to="body">
    <main-loading v-if="loading" />
  </Teleport> -->

  <div class="tw-bg-white tw-mb-8">
 
    <Loader v-if="loading" class="tw-py-20" />
    <div class="tw-my-10 tw-grid md:tw-grid-cols-2 tw-gap-3" v-else>
      <application-card
        class=" "
        v-for="application in applications"
        :key="application.id"
        :application="application"
      />
      <!-- v-on:removeApplication="removeApplication" -->

      <div v-if="!applications.length">
        <p>{{ $t("No Applications") }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
 
import ApplicationCard from "@/platform/components/applications/ApplicationCard.vue";
import { ref, watch } from "vue";
import axios from "axios";
import { useRoute } from "vue-router";

const route = useRoute();
const applications = ref([]);
const loading = ref(true);
const items = {
  title: "NAV.applications",
  links: [
    {
      name: "Main",
      path: "/",
    },
    {
      name: "Workspace",
      path: { name: "workspace" },
    },
    {
      name: "Applications",
      path: { name: "user-applications" },
    },
  ],
};

function getData() {
  axios
    .get("applications/get-user-applications")
    .then((res) => {
      applications.value = res.data.applications;
      loading.value = false;
    })
    .catch(() => {});
}

watch(
  () => route.path,
  () => {
    getData();
  },
  {
    immediate: true,
  }
);
</script>
