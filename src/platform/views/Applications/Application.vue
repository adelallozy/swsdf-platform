<template>
	<div >
		<loader v-if="loading" />
 
		<template
			v-if="!!application" > 
			<router-view />
		</template>


	</div>
</template>

<script setup>

	import { ref, watch, getCurrentInstance, onMounted } from "vue";
	import { useRoute, useRouter } from "vue-router";
	import { useI18n } from "vue-i18n";
 
	import usePageHeading from '@/v3/composables/layout/usePageHeading.js';
	import { useApplicationStore } from "@/v3/composables/useApplicationStore";

	const appStore = useApplicationStore();
	const {
		loading,
		application,
		loadApplication,
	} = appStore;

	const { setHeading } = usePageHeading();


	const globalVariable = getCurrentInstance();
	const emitter = globalVariable.appContext.config.globalProperties.emitter;
	const { t, locale } = useI18n();
 
	const route = useRoute();
	const router = useRouter();
 
	const id = parseInt(route.params.id);

	emitter.on("getApplication", () => loadApplication(id));

	function detectApplication(application) {
		if(!application?.target){
			return ;
		}
		const target = application.target;
		if (route.name == "application-home") {
			if (target == "Athletes") {
			router.replace({
				name: "app-summary",
				params: {
				appId: application.id,
				locale: route.params.locale || locale.value || "ar",
				},
			});
			}
			if (target == "Diving Centers") {
				router.replace({
					name: "app-summary",
					params: {
					appId: application.id,
					locale: route.params.locale || locale.value || "ar",
					},
				});
			}

			if ( target == "Events" && application.purpose == "Freediving Competition Participation"
			) {
				router.replace({
					name: "freediving-competition-application",
					params: {
					id: application.id,
					},
				});
			}
			if (
				target == "Events" &&
				application.purpose == "Jetski Competition Participation"
				) {
					router.replace({
						name: "jetsky-competition-application",
						params: {
						id: application.id,
						},
					});
			}
			if (
				target == "Events" &&
				application.purpose == "Underwater Photography Competition Participation"
				) {
					router.replace({
						name: "underwater-photography-competition-application",
						params: {
							id: application.id,
						},
					});
			}
		}

	}


	watch(
		() => route.path,
		async () => {
			const id = route.params.id;
			if ( route.name == "application-home"  || !application?.value?.id) {
				await loadApplication(id);
				detectApplication(application.value);	
				setHeading({
					title: application.value?.purpose,
					// subtitle: 'Overview of your data',
					visible: true
				}); 

			}
		},
		{
			immediate: true,
		}
	);

	onMounted(() => {



	});
</script>
