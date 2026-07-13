<template>
	<base-card1 v-if="license">
		<div class="tw-py-4 tw-flex tw-justify-between tw-items-center">
			<h3
				class="tw-text-foreground tw-flex tw-gap-2 tw-items-center tw-font-bold tw-text-2xl"
			>
				{{ $t("professional_divers.license_information") }}
			</h3>
			<div class="tw-flex">
				<button
				v-if="!canRenew"
				type="button"
				@click="updateInformation"
				class="tw-py-2 tw-px-4 tw-rounded-xl tw-flex tw-items-center tw-gap-2 tw-text-foreground"
				>
					{{ $t("Update information") }}
					<img
						width="20"
						height="20"
						src="@/assets/images/icons/professional/edit-2.svg"
						alt="icon"
					/>
				</button> 
				<button
					type="button"
					v-if="canRenew"
					@click="renewApplication"
					class="bg-success tw-py-2 tw-px-4"
				>
				{{ $t("actions.renew") }}

				</button>

			</div>
		</div>
		<div class="tw-py-4">
			<ul class="item-details tw-grid sm:tw-grid-cols-2 lg:tw-grid-cols-3">
				<li>
				<div class="name">
					<img
					width="16"
					height="16"
					src="@/assets/images/icons/professional/document-text.svg"
					alt="icon"
					/>
					{{ $t("professional_divers.number") + " :" }}
				</div>
				<div class="text">
					{{ license.id }}
				</div>
				</li>
				<li>
				<div class="name">
					<img
					width="16"
					height="16"
					src="@/assets/images/icons/professional/card.svg"
					alt="icon"
					/>
					{{ $t("professional_divers.rank") + " :" }}
				</div>
				<div class="text">
					{{ $t("professional_divers." + license.rank) }}
				</div>
				</li>

				<li>
				<div class="name">
					<img
					width="16"
					height="16"
					src="@/assets/images/icons/professional/document-text.svg"
					alt="icon"
					/>
					{{ $t("professional_divers.status") + " :" }}
				</div>
				<div class="text">
					{{ $t("professional_divers." + license.status) }}
				</div>
				</li>
				<li>
				<div class="name">
					<img
					width="16"
					height="16"
					src="@/assets/images/icons/professional/calendar.svg"
					alt="icon"
					/>
					{{ $t("professional_divers.issued_on") + " :" }}
				</div>
				<div class="text">
					{{ license.issued_on }}
				</div>
				</li>
				<li>
				<div class="name">
					<img
					width="16"
					height="16"
					src="@/assets/images/icons/professional/calendar.svg"
					alt="icon"
					/>
					{{ $t("professional_divers.expiry_on") + " :" }}
				</div>
				<div class="text">
					{{ license.expiry_on }}
				</div>
				</li>
				<li>
				<div class="name">
					<img
					width="16"
					height="16"
					src="@/assets/images/icons/professional/user.svg"
					alt="icon"
					/>
					{{ $t("professional_divers.license_card") }}:
				</div>
				<div class="text" v-if="license?.license_card_link">
					<a
					class="tw-text-primary tw-ms-2"
					:href="WEB_URL + license.license_card_link"
					target="_blank"
					>
					<i class="fas fa-eye"></i> {{ $t("actions.view") }}
					</a>
				</div>
				</li>
			</ul>
		</div>
	</base-card1>
</template>

<script setup lang="ts">
const WEB_URL = import.meta.env.VITE_WEB_BASE_URL;

const UPDATE_APPLICATION = import.meta.env.VITE_PROFESSIONAL_DIVERS_UPDATE_APPLICATION;
const RENEW_APPLICATION = import.meta.env.VITE_PROFESSIONAL_DIVERS_RENEW_APPLICATION;
import { toast } from "vue3-toastify";
import axios from "axios";
import { ref, watch } from "vue";
import {  useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

const emit = defineEmits(["update"]);
const props = defineProps({
	license: {
		required: true,
		type: Object,
	},
});

const { t } = useI18n(); 
const router = useRouter();
const canRenew = ref(false);
 

function updateInformation() {
	axios.get(UPDATE_APPLICATION).then((res) => {
		setTimeout(
			() => toast.success(t("HEADERS.requestReturnedSuccessfully")),
			1500
		);

		router.push({
		name: "application-home",
			params: {
				id: res.data.application.id,
			},
		});
	});
}
function renewApplication() {
	axios.get(RENEW_APPLICATION).then((res) => {
		setTimeout(
			() => toast.success(t("HEADERS.requestReturnedSuccessfully")), 1500
		);

		router.push({
			name: "application-home",
			params: {
				id: res.data.application.id,
			},
		});
	});
}

watch(
	() => props.license,
	(newData) => {
		if (!newData) {
		return;
		}
		let licenseExpiry = Date.parse(newData.expires_on);
		if (!licenseExpiry) {
		return;
		}

		let toDayTime = new Date().getTime();
		let renwalDay = licenseExpiry - 1000 * 60 * 60 * 24 * 60;
		const remainingTime = renwalDay - toDayTime;
		canRenew.value = remainingTime <= 0;
	},
	{ immediate: true }
);
</script>
