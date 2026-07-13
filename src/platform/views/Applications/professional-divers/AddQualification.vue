<template>
    <div>
 
        <base-card

            class="tw-bg-white"
            title="Add International Membership" 
            >
            <MembershipForm :btn-loading="btnLoading" @submit="onSubmit" />
        </base-card>
    </div>
</template>

<script setup>
import MembershipForm from "@/platform/components/applications/professional-diver/MembershipForm.vue";
const NEW_MEMBERSHIP = import.meta.env.VITE_PROFESSIONAL_DIVER_NEW_MEMBERSHIP;
import axios from "axios";
import { reactive, ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { toast } from "vue3-toastify";
import { useI18n } from "vue-i18n";

const route = useRoute();
const router = useRouter();

const btnLoading = ref(false); 
 

function onSubmit(values) {
btnLoading.value = true;
    const frmData = new FormData();
    frmData.append("application_id"        , route.params.id);
    frmData.append("organization"      , values.organization);
    frmData.append("membership_number"  , values.membership_number);
    frmData.append("title"              , values.title);
    frmData.append("diving_type"        , values.diving_type);
    frmData.append("membership_file", values.membership_copy);

axios
    .post(NEW_MEMBERSHIP + route.params.id,  frmData)
    .then((res) => {
    router.push({
        name: "application-home",
        params: { id: route.params.id },
    }); 
        btnLoading.value = false;
    })

    .catch((err) => {
        console.log(err);
        btnLoading.value = false;
        toast.error(err.response?.data?.message);
    });

}
</script>
