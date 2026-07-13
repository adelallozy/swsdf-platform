<template>
	<Toast group="notifications">
 
	</Toast>	
</template>


<script setup>
import Toast from 'primevue/toast'; 
import { onMounted, onUnmounted } from 'vue';
import { useErrorHandler } from '@/v3/composables/useErrorHandler.js';

import {useNotification}  from '@/v3/composables/useNotification.js';
 
const { onError, offError } = useErrorHandler();
const { error } = useNotification();
 
function handleError({ message, context, meta, originalError }) {
	const severityConfig = {
		error: { style: 'background-color: #ffdddd; color: #d8000c' },
	};

	error(message || 'An unexpected error occurred', {
		summary: 'Error',
		life: 5000,
		style: severityConfig['error']?.style
    });

	if (import.meta.env.DEV) {
		console.error('[Full Error Details]', { message, context, meta, originalError });
	}
}

onMounted(() => {
    onError(handleError);
});

onUnmounted(() => {
    offError(handleError);
});
</script>