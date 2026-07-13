<!-- src/v3/pages/applications/ApplicationsIndex.vue -->
<template>
 

		<Loader v-if="loading" class="tw-py-20" />

		<div
			v-else-if="applications.length"
			class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-5 tw-items-stretch"
		>
			<ApplicationCard
				v-for="(application, index) in applications"
				:key="application.id"
				:application="application"
				@removeApplication="removeApplication"
				class="tw-animate-enter"
				:style="{ animationDelay: `${index * 50}ms` }"
			/>
		</div>

		<!-- Empty State -->
		<div
			v-else
			class="tw-border-2 tw-border-dashed tw-border-slate-200 tw-rounded-3xl tw-p-12 tw-flex tw-flex-col tw-items-center tw-justify-center tw-text-center tw-gap-4"
		>
			<div class="tw-bg-slate-50 tw-p-4 tw-rounded-full">
				<i class="pi pi-inbox tw-text-4xl tw-text-slate-400" aria-hidden="true"></i>
			</div>
			<div class="tw-max-w-xs">
				<h3 class="tw-text-lg tw-font-semibold tw-text-slate-900">{{ $t('No Applications Found') }}</h3>
				<p class="tw-text-sm tw-text-slate-500 tw-mt-1">{{ $t('You have not submitted any applications yet.') }}</p>
			</div>
			<button
				type="button"
				class="tw-inline-flex tw-items-center tw-gap-2 tw-rounded-xl tw-px-5 tw-py-2.5 tw-font-medium tw-bg-sky-600 tw-text-white hover:tw-bg-sky-700 focus:tw-outline-none tw-transition-colors tw-shadow-sm hover:tw-shadow-md"
				@click="fetchData"
			>
				<i class="pi pi-refresh" aria-hidden="true"></i>
				<span>{{ $t('Refresh') }}</span>
			</button>
		</div>
 
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useNotification } from '@/v3/composables/useNotification.js'
import usePageHeading from '@/v3/composables/layout/usePageHeading.js'
import { apiGet } from '@/v3/services/httpClient.js'

import Loader from '@/v3/components/common/Loader.vue'
import ApplicationCard from '@/v3/components/applications/ApplicationCard.vue'

const route = useRoute()
const { t } = useI18n()
const notify = useNotification()
const { setHeading } = usePageHeading()

setHeading({
	title: 'My Applications',
	subtitle: 'Track your submitted requests and required actions.',
})

const applications = ref([])
const loading = ref(true)

async function fetchData() {
  loading.value = true
  try {
    const res = await apiGet('applications/get-user-applications')
    applications.value = res?.applications ?? []
  } catch (e) {
    notify.error(t('Something went wrong'))
    console.error(e)
  } finally {
    loading.value = false
  }
}

function removeApplication(id) {
  applications.value = applications.value.filter(a => a.id !== id)
}

watch(
  () => route.fullPath,
  () => { fetchData() },
  { immediate: true }
)
</script>
