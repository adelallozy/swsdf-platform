<template>
  <div class="tw-space-y-6">
    <base-card>
      <general-breadcrumb :items="items" />
    </base-card>
    <base-card v-if="loading">
      <loader />
    </base-card>
    <jetsky-form
      v-else
      :btn-loading="btnLoading"
      :event="event"
      @submit="submit"
    />
  </div>
</template>
<script setup>
import { useI18n } from "vue-i18n";
import { toast } from "vue3-toastify";
import axios from "axios";
import { ref, onMounted } from "vue";
import JetskyForm from "@/platform/components/applications/compititons/jetsky/JetskyForm.vue";
import { useRouter, useRoute } from "vue-router";
const PICK_RELATIVES = import.meta.env.VITE_COMPITION_FREEDIVING_PICK_RELATIVES;
const UPDATE_JETSKY = import.meta.env.VITE_COMPITION_UPDATE_JETSKY_APPLICATION;

const profile = ref({});
const router = useRouter();
const route = useRoute();
const btnLoading = ref(false);
const loading = ref(true);

const { t } = useI18n();
const items = {
  title: "Jetsky Competition Participation",
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
      path: "/competitions",
      name: t("NAV.competitions"),
    },
    {
      path: {
        name: "update-jetsky-competition-application",
        params: {
          id: route.params.id,
        },
      },
      name: "Update Competition Participation",
    },
  ],
};

function submit(values) {
  console.log();

  const frmData = new FormData();
  frmData.append("racer_number", values.racer_number);
  frmData.append("work_leave", values.work_leave);
  values.races.map((el, index) => frmData.append(`races[${index}]`, el.id));
  btnLoading.value = true;
  axios
    .post(UPDATE_JETSKY + route.params.id, frmData)
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
      if (err.response.status == 403) {
        toast.error(t("The competition is not open for registration"));
      } else {
        if (err.response?.data?.application) {
          router.push({
            name: "application-home",
            params: {
              id: err.response.data.application.id,
            },
          });
          setTimeout(() => toast.error(t(err.response.statusText)), 1000);
        } else {
          toast.error(t(err.response.statusText));
        }
      }
    });
}
const event = ref(null);

function assignData(response) {
  if (response.data.jetskiParticipant) {
    event.value = response.data.jetskiParticipant;
  }

  loading.value = false;
}
function getApplication() {
  axios.get(PICK_RELATIVES + route.params.id).then(assignData);
}

onMounted(() => {
  getApplication();
});
</script>
