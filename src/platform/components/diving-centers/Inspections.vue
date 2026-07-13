<template v-if="inspections?.length > 0">
	<div class="tw-space-y-4 tw-pb-4 ">
		<div class="tw-flex tw-justify-between tw-items-center ">
			<h3 class="tw-text-foreground tw-flex tw-gap-2 tw-items-center tw-font-bold tw-text-2xl">{{ $t("Inspection Records") }}</h3>
			<div class="tw-flex">
	
				<button 
					v-if=" true" 
						type="button" 
						class="tw-w-fit base-btn tw-py-2 tw-rounded-lg tw-mt-5   tw-px-4   tw-flex tw-items-center tw-gap-2 tw-text-foreground"

						@click="reinspect"
						:loading="btnLoading"
					>
					{{ $t("Reinspect") }}
				</button>		
			</div>
    	</div>


		<base-card1 v-for="inspection in inspections" :key="inspection.id" class="tw-relative tw-mb-2 tw-border tw-border-dashed !tw-shadow-none !tw-bg-[#02579605] tw-overflow-hidden">
			<ul class="item-details tw-grid md:tw-grid-cols-2">
				<li v-if="inspection?.inspected_at">
					<div class="name"><img width="16" height="16" src="@/assets/images/icons/professional/card.svg" alt="icon" />{{ $t("Inspection Date") + " :" }}</div>
					<div class="text">{{ inspection?.inspected_at }}</div>
				</li> 
				<li v-if="inspection?.result">
					<div class="name"><img width="16" height="16" src="@/assets/images/icons/professional/card.svg" alt="icon" />{{ $t("Inspection Result") + " :" }}</div>
					<div class="text">{{ $t(inspection?.result) }}</div>
				</li>
	
			</ul>
		</base-card1>
	</div>
</template>

<script setup> 
	import axios from "axios";
	import { useRoute, useRouter } from "vue-router";

	const btnLoading = ref(false);
	const route = useRoute();
	const router = useRouter();
	defineProps({
		inspections: {
			required: false,
		},
	});

	const emit = defineEmits(["update"]);

	function reinspect() {
		axios.get(import.meta.env.VITE_LICENSED_DIVE_CENTERS_REINSPECT + '/' +  route.params.id  )
			.then(response => {
				if (response?.data?.application?.id) {
					router.push({
						name: "app-summary",
						params: {
							appId: response.data.application.id,
							locale: route.params.locale || "ar",
						}
				}) ;
				} else {
					console.error('Failed to get new application URL.');
				}
			})
			.catch(err => {
				console.error('Error during reinspection:', err);
			});
	}

</script>

<style lang="scss">
	span.status {
Sd { @apply tw-bg-[#b312120A] tw-text-[#b31212]; }
	}
	.top_tag {
		@apply tw-absolute tw-top-0 tw-end-0 tw-p-2 tw-rounded-es-xl tw-font-semibold tw-text-sm tw-border tw-text-white;
		&.Remove { @apply tw-bg-red-500; }
		&.Review { @apply tw-bg-green-600; }
		&.Registration { @apply tw-bg-primary; }
	}
</style>
