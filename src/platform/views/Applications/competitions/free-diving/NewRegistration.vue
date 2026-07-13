<template>
 
  <div class="tw-space-y-6">
    <base-card>
      <general-breadcrumb :items="items" />
    </base-card>
    <div v-if="error"> 
      ++++++++++++++
      {{error}}
      ++++++++++++++++++
    </div>
    <FreeDivingForm 
        v-if="event?.id && diveCenters?.length"
        :event="event"
        :diveCenters= "diveCenters"
        :btn-loading="btnLoading" @submit="submitProfile" />
  </div>
</template>
<script setup>
import { useI18n } from "vue-i18n";
import { toast } from "vue3-toastify";
import axios from "axios";
import { ref } from "vue";
import FreeDivingForm from "@/platform/components/applications/compititons/free-diving/FreeDivingForm.vue";
import { useRouter, useRoute } from "vue-router";

const NEW_FREEDIVING = import.meta.env.VITE_COMPITION_NEW_FREEDIVING_APPLICATION;

const PERMITTED_DIVE_CENTER = import.meta.env.VITE_APPS_DIVING_CENTERS_PERMITTED_DIVE_CENTER; 
const EVENT_PICK = import.meta.env.VITE_EVENTS_PICK;

const profile = ref({});
const router = useRouter();
const route = useRoute();
const btnLoading = ref(false);

const event = ref({});
const diveCenters = ref([]);

const { t } = useI18n();
const items = {
  title: "Freediving Competition Participation",
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
        name: "freediving-competition-registration",
        params: {
          id: route.params.id,
        },
      },
      name: "Freediving Competition Participation",
    },
  ],
};


axios.get(PERMITTED_DIVE_CENTER)
    .then((res) => {
        diveCenters.value = res.data.diveCenters;         
    });
 
axios.get(EVENT_PICK + route.params.id)
    .then((res) => { 
        event.value = res.data.event ; 
    })
    .catch((err) => {
        toast.error(err.message); 
    });
 

const error = ref(null);

function submitProfile(values) {
  btnLoading.value = true;
  axios
    .post(NEW_FREEDIVING + route.params.id, values)
    .then((res) => {
        btnLoading.value = false;

        if(res.data?.application?.id) {
            router.push({
            name: "application-home",
            params: {
                id: res.data.application.id,
            },
            });
        }else {
            
            error.value =  { 
            "status" : res.status,
            "Response":res.data
            } ;
        }

    })
    .catch((err) => {
        btnLoading.value = false;
        if (err.response.status == 422 && err.response?.data?.errors  )  {
            Object.values(err.response.data.errors).map((el) =>
            Object.values(el).map((e) => toast.error(t(e)))
            );
        } else   {
            toast.error(err.message );
        }
    });
}
</script>
