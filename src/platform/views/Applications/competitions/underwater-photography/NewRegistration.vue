<template>
    <div class="tw-space-y-6">
        <base-card>
        <general-breadcrumb :items="items" />
        </base-card>

        <team-form 
        v-if="event" 
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
    import { ref } from "vue";
    import TeamForm from "@/platform/components/applications/compititons/underwater-photography/TeamForm.vue"; 
    import { useRouter, useRoute } from "vue-router";

    const EVENTS_PICK = import.meta.env.VITE_EVENTS_PICK;
    const NEW_APPLICATION = import.meta.env.VITE_COMPITION_NEW_UNDERWATER_PHOTOGRAPHY_APPLICATION;
    
    const route = useRoute();
    const router = useRouter();
    const btnLoading = ref(false);

    const event = ref(false ); 

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
        path: {
            name: "underwater-photography-competition-registration",
            params: {
            id: route.params.eventId,
            },
        },
        name: "Underwater Photography Competition Participation",
        },
    ],
    };

    function submit(values) {
    const frmData = new FormData();

    frmData.append("diver_work_leave", values.diver_work_leave);
    frmData.append("body_identity_number", values.body_identity_number);
    frmData.append("body_name", values.body_name);
    frmData.append("body_mobile_number", values.body_mobile_number);

    frmData.append("body_work_leave", values.body_work_leave);
    values.lens_type.map((el) => frmData.append("lens_type[]", el.id));
    btnLoading.value = true;
    axios
        .post(NEW_APPLICATION + route.params.eventId, frmData)
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
function getRaces() { 
    axios.get(EVENTS_PICK + route.params.eventId).then((res) => {
        event.value = res.data.event  
    });
}

getRaces();

</script>
