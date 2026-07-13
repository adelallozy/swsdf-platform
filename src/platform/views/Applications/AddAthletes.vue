<template>
  <div class="tw-space-y-6">
 
    <FreeDivingForm 
        v-if="event.id && diveCenters.length"
        :event="event"
        :diveCenters="diveCenters"
        :btn-loading="btnLoading" 
        @submit="submitProfile" 

        />
  </div>
</template>
<script setup>
import { toast } from "vue3-toastify";
import axios from "axios";
import { onMounted, ref } from "vue";
import FreeDivingForm from "@/platform/components/applications/compititons/free-diving/FreeDivingForm.vue";
import { useRouter, useRoute } from "vue-router";



const PERMITTED_DIVE_CENTER = import.meta.env.VITE_APPS_DIVING_CENTERS_PERMITTED_DIVE_CENTER;
const NEW_PARTICIPANT = import.meta.env.VITE_COMPITION_NEW_FREEDIVING_PARTICIPANT;
const EVENT_PICK = import.meta.env.VITE_EVENTS_PICK;
const router = useRouter();
const route = useRoute();
const btnLoading = ref(false);

const props =  defineProps({
    application: {
        type: Object,
        required: false,
    } 
});

const event = ref({});
const diveCenters = ref({});
 

function submitProfile(values) {
    btnLoading.value = true;
    axios
        .post(NEW_PARTICIPANT + route.params.id, values)
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
            Object.values(err.response.data.errors).map((el) =>
                Object.values(el).map((e) => toast.error( e ))
            );
        });
}

function getCenters() {
 
    axios.get(PERMITTED_DIVE_CENTER).then((res) => {
        diveCenters.value = res.data.diveCenters;         
    });
}

function loadEvent(){
    axios.get(EVENT_PICK + props.application.target_id)
        .then((res) => { 
            event.value = res.data.event ; 
        })
        .catch((err) => {
            toast.error(err.message); 
        });
}

onMounted(()=>{
    getCenters(); 
    loadEvent( ); 
});

</script>
