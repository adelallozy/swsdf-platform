<template> 
<loader v-if="loading" />
</template>

<script setup>

const CHECH_PAYMENT = import.meta.env.VITE_PAYLINK_CHECH_PAYMENT;
 


import { ref } from "vue";
import {useRoute , useRouter} from "vue-router";

import axios from "axios";

const loading = ref(true);
const route = useRoute();
const router = useRouter(); 
const orderNumber = route.query.orderNumber;
const transactionNo = route.query.transactionNo;

console.log('orderNumber', orderNumber);
console.log('transactionNo', transactionNo);

axios
    .get( CHECH_PAYMENT + transactionNo )

    .finally(() => { 
        router.push({ name: "user-applications" });
        loading.value = false;
    })
    ;

 
</script>