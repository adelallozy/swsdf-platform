<template>
    <div class="tw-space-y-6">
        <base-card>
            <general-breadcrumb :items="items" />
        </base-card>
        <base-card v-if="loading">
            <loader />
        </base-card>


        <team-form 
            v-if="event"
            :participant="participant"
            :event="event"
            :btn-loading="btnLoading" 
            @submit="submit" 
            />
    </div>
</template>
<script setup>
import { useI18n } from "vue-i18n";
import { toast } from "vue3-toastify";
import axios from "axios";
import { ref, onMounted } from "vue";
import TeamForm from "@/platform/components/applications/compititons/underwater-photography/TeamForm.vue";  
import { useRouter, useRoute } from "vue-router"; 

const PICK_RELATIVES = import.meta.env.VITE_COMPITION_FREEDIVING_PICK_RELATIVES;
const UPDATE_PARTICIPATION = import.meta.env.VITE_COMPITION_UPDATE_UNDERWATER_PHOTOGRAPHY_APPLICATION;


const route = useRoute();
const router = useRouter();
const btnLoading = ref(false);
const loading = ref(true);
const event = ref(false);
const participant = ref(false);

const { t } = useI18n();
const items = {
    title: "Underwater Photography Competition Participation",
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
            name: "Update Participant information",
            path: {
                name: "update-underwater-participation-competition-application",
                params: {
                    participantId: route.params.participantId,
                },
            },
        },
    ],
};

function submit(values) {

    const frmData = new FormData();

    frmData.append("diver_work_leave", values.diver_work_leave);
    frmData.append("body_identity_number", values.body_identity_number);
    frmData.append("body_work_leave", values.body_work_leave);
    frmData.append("body_name", values.body_name);
    frmData.append("body_mobile_number", values.body_mobile_number);
    values.lens_type.map((el) => frmData.append("lens_type[]", el.id));
    btnLoading.value = true;
    axios
        .post(UPDATE_PARTICIPATION+ route.params.id, frmData)
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


function assignData(response) {

    if (response.data.event) {
        event.value = response.data.event;
 
    }
    if (response.data.underwaterParticipant) { 
        participant.value = response.data.underwaterParticipant;
 
    }

    loading.value = false;
}

axios.get(PICK_RELATIVES + route.params.id).then(assignData); 

</script>
