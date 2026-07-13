<template>
    <div class="flex flex-col gap-1">
        <label v-if="label">{{ label }}</label>
        <Select name="name" :options="options" optionLabel="name" :placeholder=placeholder fluid />
        <Message v-if="$form.city?.name?.invalid" severity="error" size="small" variant="simple">{{ $form.city.name.error?.message }}</Message>
    </div>
</template>

<script setup >

import { ref } from "vue";
const props = defineProps({
    id: {
        required: true,
    },
    name:{
        type:String,
        default:""
    },
    label:{
        type:String,
        default:""
    },
    options: {
        type: Array,
        required: true
    },
    loading: {
        required: false,
    },
    placeholder:{
        type:String,
        default:""
    },
    icon: {
        required: false,
    },
    error :{
		required: false,
		default:"",
	}
});

</script>