<template>
  <div class="tw-space-y-6">
    <base-card>
      <general-breadcrumb :items="items" />
    </base-card>

    <jetsky-form :btn-loading="btnLoading" @submit="submit" />
  </div>
</template>
<script setup>
import { useI18n } from "vue-i18n";
import { toast } from "vue3-toastify";
import axios from "axios";
import { ref } from "vue";
import JetskyForm from "@/platform/components/applications/compititons/jetsky/JetskyForm.vue";
import { useRouter, useRoute } from "vue-router";

const NEW_JETSKY = import.meta.env.VITE_COMPITION_NEW_JETSKY_APPLICATION;

const profile = ref({});
const router = useRouter();
const route = useRoute();
const btnLoading = ref(false);
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
        name: "jetsky-competition-registration",
        params: {
          id: route.params.event,
        },
      },
      name: "Jetsky Competition Participation",
    },
  ],
};

function submit(values) {
  const frmData = new FormData();
  frmData.append("racer_number", values.racer_number);
  frmData.append("work_leave", values.work_leave);
  values.races.map((el) => frmData.append("races[]", el.id));
  btnLoading.value = true;
  axios
    .post(NEW_JETSKY + route.params.event, frmData)
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
      btnLoading.value = false;
      console.log(err.response);
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
          setTimeout(() => toast.error(t(err.response.statusText)), 1500);
        } else {
          router.push({
            name: "atheltes-instructions",
          });
          setTimeout(() => {
            toast.error(t(err.response.statusText));
          }, 1500);
        }
      }
    });
}
</script>
