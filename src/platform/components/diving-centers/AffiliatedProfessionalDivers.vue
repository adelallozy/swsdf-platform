<template>
	<div class="tw-space-y-4 tw-py-4">
		<div class="tw-flex tw-justify-between tw-items-center ">
			<h3 class="tw-text-foreground tw-flex tw-gap-2 tw-items-center tw-font-bold tw-text-2xl">{{ $t("Affiliated Professional Divers") }}</h3>
			<div class="tw-flex">
		
			</div>
    	</div> 
 
		<base-card1
			class="tw-relative tw-mb-2 tw-border tw-border-dashed !tw-shadow-none !tw-bg-[#02579605] tw-overflow-hidden"
			v-for="proDiver in professionalDivers"
			:key="proDiver.id"
		>
	

			<ul class="item-details tw-grid md:tw-grid-cols-2">
				<li>
					<div class="name">
					<img
						width="16"
						height="16"
						src="@/assets/images/icons/professional/card.svg"
						alt="icon"
					/>
					{{ $t("Professional Diver") + " :" }}
					</div>
					<div class="text">{{ proDiver?.diver_name }}</div>
				</li> 

				<li
					v-if="proDiver?.diver_rank"
					>
					<div class="name">
					<img
						width="16"
						height="16"
						src="@/assets/images/icons/professional/card.svg"
						alt="icon"
					/>
					{{ $t("Level") + " :" }}
					</div>
					<div class="text">{{ $t(proDiver?.diver_rank) }}</div>
				</li> 


				<li v-if="proDiver?.start_date">
					<div class="name">
					<img
						width="16"
						height="16"
						src="@/assets/images/icons/professional/card.svg"
						alt="icon"
					/>
					{{ $t("Contract Starting Date") + " :" }}
					</div>
					<div class="text">{{ proDiver?.start_date }}</div>
				</li> 

				<li v-if=" proDiver?.end_date ">
					<div class="name">
					<img
						width="16"
						height="16"
						src="@/assets/images/icons/professional/card.svg"
						alt="icon"
					/>
					{{ $t("Contract Ending Date") + " :" }}
					</div>
					<div class="text">{{ proDiver?.end_date }}</div>
				</li> 

	

			</ul>
		</base-card1>
	</div>
</template>

<script setup>
const WEB_URL = import.meta.env.VITE_WEB_BASE_URL;

import { ref } from "vue";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
defineProps({
  professionalDivers: {
    required: false,
  },
 
});
const emit = defineEmits(["update"]);
</script>

<style lang="scss">
span.status {
  @apply tw-font-semibold tw-rounded-md tw-py-2 tw-px-3;
  &.Draft,
  &.Incomplete {
    @apply tw-bg-[#FF99000A] tw-text-[#FF9900];
  }
  &.Submitted {
    @apply tw-bg-[#12B3470A] tw-text-[#12B347];
  }
  &.Returned {
    @apply tw-bg-[#b312120A] tw-text-[#b31212];
  }
}
.top_tag {
  @apply tw-absolute tw-top-0 tw-end-0 tw-p-2 tw-rounded-es-xl tw-font-semibold tw-text-sm tw-border tw-text-white;
  &.Remove {
    @apply tw-bg-red-500;
  }
  &.Review {
    @apply tw-bg-green-600;
  }
  &.Registration {
    @apply tw-bg-primary;
  }
}
</style>
