<template> 
<loader v-if="loading" />
</template>

<script setup>

const INVOICES_REVIEW = import.meta.env.VITE_INVOICES_REVIEW;
 


import { ref } from "vue";
import {useRoute , useRouter} from "vue-router";

import axios from "axios";

const loading = ref(true);
const route = useRoute();
const invoice   = ref( );
const invoiceId = route.params.id; 



axios
    .get( INVOICES_REVIEW + invoiceId )
    .then((res) => {
        invoice.value = res.data?.invoice;
        loading.value = false;
    })
    .catch(() => {})
    
    .finally(() => { 
        if(!!invoice?.value?.payment_url		){
            window.location.replace(invoice.value.payment_url	);
        }
        loading.value = false;
    })
    ;

 
</script>