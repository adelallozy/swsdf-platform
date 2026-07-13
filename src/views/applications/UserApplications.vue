<template>
  <Teleport to="body">
    <main-loading v-if="loading" />
  </Teleport>
  <template v-if="items">
    <div class="tw-container tw-bg-white tw-pt-[110px] tw-mb-8">
      <GeneralBreadcrumb :items="items" />
      <div class="tw-my-10 tw-grid md:tw-grid-cols-2 tw-gap-3">
        <ApplicationWidget
          class="tw-mb-4 last:tw-mb-0"
          v-for="item in applications"
          :key="item.id"
          v-on:removeApplication="removeApplication"
          :application="item"
        >
        </ApplicationWidget>

        <div v-if="!applications.length">
          <p>{{ t("No Applications") }}</p>
        </div>
      </div>
    </div>
  </template>
</template>

<script setup>
import ApplicationWidget from "@/platform/components/widgets/application.vue";
import { ref, onMounted } from "vue";
import axios from "axios";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const applications = ref([]);
const loading = ref(true);
const items = {
  links: [
    {
      name: "Main",
      path: "/",
    },
    {
      name: t("NAV.applications"),
      path: "/applications",
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

onMounted(() => getData());
// import ApiService from "@/core/services/ApiService";
// import ApplicationService from "@/core/services/ApplicationServices.js";
// import { ref, reactive, computed, onMounted } from "vue";
// import { useI18n } from "vue-i18n";
// import { useStore } from "vuex";
// import { useSharedStore } from "@/store/shared.js";
// import { useApplicationStore } from "@/store/application";

// import { useRoute, useRouter } from "vue-router";
// import { setCurrentPageTitle } from "@/core/helpers/breadcrumb";

// import ApplicationWidget from "@/platform/components/widgets/application.vue";
 
// export default {
//   name: "UserApplications",
//   components: {
//     ApplicationWidget,
//   },

//   setup(props, context) {
//     const store = useStore();
//     const router = useRouter();
//     const { t, te } = useI18n();
//     const sharedStore = useSharedStore();
//     const applicationStore = useApplicationStore();

//     function onLoadFailure(error) {}

//     function onLoadSuccess(response) {
//       if (response.data == undefined) {
//         applicationStore.applications = [];
//       } else if (response.data.applications != undefined) {
//         applicationStore.applications = response.data.applications;
//       } else {
//         applicationStore.applications = [];
//       }
//     }

//     function afterLoad() {
//       sharedStore.cancelLoadIndicator("getUserApplications");
//     }

//     sharedStore.activateLoadIndicator("getUserApplications");

//     ApiService.get("applications/get-user-applications")
//       .then(onLoadSuccess)
//       .catch(onLoadFailure)
//       .finally(afterLoad);

//     onMounted(() => {
//       setCurrentPageTitle(t("My applications"));
//     });

//     function removeApplication(id) {
//       ApplicationService.removeApplication(id)
//         .then(onRemoveSuccess)
//         .finally(onRemoveFailure);
//     }

//     return {
//       t,
//       applicationStore,
//       removeApplication,
//     };
//   },
// };
</script>
