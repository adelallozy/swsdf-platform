<!-- src/platform/views/Applications/professional-divers/ApplicationReview.vue -->
<template>
	<div>
		

		<loader v-if="loading" />
		<div class="tw-space-y-5 tw-mt-4" v-else-if="application">
 
		<license-summary 
			v-if="application" 
			:application="application"
			:applicationNotes="applicationEntities?.notes" 
			/>
	 
		<invoice-summary 
			v-if="!!applicationEntities.quotation"  
			:quotation="applicationEntities?.quotation"
			/>
		<!-- <Summary v-if="application" :application="application" /> -->
		<profile-details
	
			v-if="userProfile"
			:user-picture="usersPicture"
			:profile="userProfile"
			:rank="professionalDiverRank"
			:stage="application?.stage"
		/>

		<Memberships
			v-if="application.id"  
		/>
		<!-- v-if="diverContracts" -->
 
		<Contracts :stage="application?.stage" :diverContracts="diverContracts" />
		
		<ApplicationFiles
			v-if="application.id" 
			:applicationId="application.id" />
		</div>
	</div> 
</template>

<script setup>


	console.log('ApplicationReview.vue'); 
	import usePageHeading from '@/v3/composables/layout/usePageHeading.js';


	const { setHeading } = usePageHeading();
	const PICK_RELATIVES = import.meta.env.VITE_PROFESSIONAL_DIVERS_PICK_RELATIVES;

	import ApplicationFiles from "@/v3/components/Applications/Files.vue";

	import Memberships from '@/v3/components/Applications/ProfessionalDivers/Memberships.vue'

	import axios from "axios";
	import { onMounted, ref, watch } from "vue";
	import LicenseSummary from "@/platform/components/applications/Summary.vue";
	import InvoiceSummary from "@/platform/components/applications/InvoiceSummary.vue";

	import ProfileDetails from "@/platform/components/applications/ProfileDetails.vue";
	import Contracts from "@/platform/components/applications/professional-diver/WorkContracts.vue";

	import { useRoute, useRouter } from "vue-router";

	import { useApplicationStore } from "@/v3/composables/useApplicationStore";
	const appStore = useApplicationStore();
	const {
		application,
		applicationEntities,  
		loadApplication
	} = appStore;
 
	console.log(application);
  
	const route = useRoute();
	const router = useRouter();
	const loading = ref(true);
	const userProfile = ref(null);
	const professionalDiverRank = ref(null);
	const usersPicture = ref(null); 
	const diverContracts = ref(null);  

 
	function assignData(response) {
		if (!response?.data) {
			loading.value = false;
			return;
		}
		console.log(response);

		if (response.data.applicantProfile) {
			userProfile.value = response.data.applicantProfile;
		}
		if (response.data.applicantPhoto) {
			usersPicture.value = response.data.applicantPhoto;
		}
		if (response.data.professionalDiverRank) {
			professionalDiverRank.value = response.data.professionalDiverRank;
		}
	
		if (response.data.diverContracts) {
			diverContracts.value = response.data.diverContracts;
		}
		

		loading.value = false;
	}

	function getApplication() {
		axios.get(PICK_RELATIVES + route.params.id).then(assignData);
	}

	function detectApplication(application) {
		if(!application?.progress) {
			return ;
		}

		if(!application?.progress) {
			return ;
		}
		
		if (application.progress["Applicant Profile"] == "Required") {
			router.push({
				name: "update-user-profile",
				params: {
					id: application.id,
				},
			});
		} else if (application.progress["Applicant Portrait"] == "Required") {
			router.push({
				name: "update-user-picture",
				params: {
					id: application.id,
				},
			});
		} else if (application.progress["Professional Diver Rank"] == "Required") {
			router.push({
				name: "professional-diver-application-license-informations",
				params: {
					id: application.id,
				},
			});
		} else if (
			application.progress["Professional Diver Memberships"] == "Required"
		) {
			router.push({
				name: "add-professional-diver-international-qualification",
				params: {
					id: application.id,
				},
			});
		} else if (
			application.progress["Professional Diver Work Contracts"] == "Required"
		) {
			router.push({
				name: "add-professional-diver-contract",
				params: {
					id: application.id,
				},
			});
		} else if (application.progress["Application Files"] == "Required") {
			router.push({
				name: "add-new-file",
				params: {
					id: application.id,
				},
			});
		}
	}

	watch(
		() => application,
		() => {

			if (application) {
			detectApplication(application);
			}
		},
		{
			immediate: true,
			deep: true,
		}
	);

	if(!application?.value?.id ) {
		loadApplication(route.params.id);
	}

	onMounted(() => {
		getApplication();
		setHeading({
			title: application.value?.purpose,
			// subtitle: 'Overview of your data',
			visible: true
		}); 
	});
 
</script>

<style src="@/assets/sass/centerProfile.scss" lang="scss"></style>
