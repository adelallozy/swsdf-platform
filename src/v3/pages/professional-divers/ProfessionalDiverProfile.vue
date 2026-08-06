<template>
    <div class="mesh-overlay" aria-hidden="true"></div>
    <div class="tw-max-w-7xl tw-mx-auto tw-space-y-12 tw-pb-20 tw-relative tw-z-10">
        
        <!-- Not Found / No License State -->
        <transition name="fade-up" appear>
            <section v-if="notFound" class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-text-center tw-py-24 tw-px-4">
                <div class="tw-bg-white/80 tw-backdrop-blur-sm tw-shadow-xl tw-border tw-border-white/50 tw-rounded-3xl tw-p-12 tw-max-w-lg tw-w-full hover:tw-shadow-2xl tw-transition-all tw-duration-500">
                    <div class="tw-w-20 tw-h-20 tw-bg-sky-50 tw-text-sky-600 tw-rounded-2xl tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-8 tw-shadow-inner">
                        <i class="pi pi-id-card tw-text-4xl"></i>
                    </div>
                    <h2 class="tw-text-3xl tw-font-bold tw-text-slate-800 tw-mb-4 tw-tracking-tight">
                        {{ $t('No Professional License Found') }}
                    </h2>
                    <p class="tw-text-slate-500 tw-leading-relaxed tw-mb-10">
                        {{ $t('It looks like you don\'t have a professional diver license linked to this account yet.') }}
                    </p>
                    <router-link 
                        :to="{ name: 'professional-diver-new-license' }"
                        class="pill-link tw-w-full tw-inline-flex tw-items-center tw-justify-center tw-gap-3 tw-bg-sky-600 tw-text-white tw-font-semibold tw-text-lg tw-px-8 tw-py-4 tw-rounded-xl hover:tw-bg-sky-500 hover:tw-scale-[1.02] active:tw-scale-[0.98] tw-transition-all tw-shadow-lg tw-shadow-sky-200"
                    >
                        <i class="pi pi-plus-circle"></i>
                        <span>{{ $t('Apply for New License') }}</span>
                    </router-link>
                </div>
            </section>

            <!-- HERO -->
            <section v-else-if="license" class="tw-relative">
                <!-- Profile Card -->
                <div class="tw-bg-white/60 tw-backdrop-blur-md tw-border tw-border-white/60 tw-shadow-xl tw-rounded-[2.5rem] tw-overflow-hidden tw-p-8 md:tw-p-12">
                    <div class="tw-flex tw-flex-col tw-items-center tw-text-center tw-gap-6 md:tw-gap-8">
                        
                        <!-- Avatar -->
                        <div class="tw-relative tw-group">
                            <div class="tw-absolute -tw-inset-4 tw-bg-gradient-to-tr tw-from-sky-200/40 tw-to-blue-200/40 tw-rounded-full tw-blur-xl tw-opacity-0 group-hover:tw-opacity-100 tw-transition-opacity tw-duration-700"></div>
                            <img
                                v-if="photoUrl"
                                :src="photoUrl"
                                :alt="displayName"
                                :class="[
                                    'tw-relative tw-w-40 tw-h-40 md:tw-w-56 md:tw-h-56 tw-rounded-full tw-object-cover tw-shadow-2xl',
                                    avatarRingClass
                                ]"
                                loading="lazy"
                                @error="photoError = true"
                            />
                            <div
                                v-else
                                :class="[
                                    'tw-relative tw-w-40 tw-h-40 md:tw-w-56 md:tw-h-56 tw-rounded-full tw-bg-slate-100 tw-flex tw-items-center tw-justify-center tw-text-4xl md:tw-text-5xl tw-font-bold tw-text-slate-400 tw-shadow-2xl',
                                    avatarRingClass
                                ]"
                                aria-hidden="true"
                            >
                                <i class="pi pi-user"></i>
                            </div>
                            
                            <!-- Status Badge (Absolute) -->
                            <div class="tw-absolute tw-bottom-2 tw-right-2 md:tw-bottom-4 md:tw-right-4 tw-bg-white tw-border tw-border-slate-100 tw-rounded-full tw-px-4 tw-py-1.5 tw-shadow-lg tw-flex tw-items-center tw-gap-2">
                                <span :class="['tw-block tw-w-2.5 tw-h-2.5 tw-rounded-full', statusBarClass]"></span>
                                <span class="tw-text-xs tw-font-bold tw-text-slate-600 tw-uppercase tw-tracking-wider">{{ $t(license.status || 'Status') }}</span>
                            </div>
                        </div>

                        <!-- Info -->
                        <div class="tw-space-y-4 tw-max-w-2xl">
                            <h1 class="tw-text-3xl md:tw-text-5xl tw-font-extrabold tw-text-slate-800 tw-tracking-tight">
                                {{ displayName }}
                            </h1>
                            
                            <div v-if="license.rank" class="tw-inline-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 tw-bg-slate-50 tw-rounded-full tw-border tw-border-slate-100">
                                <i class="pi pi-id-card tw-text-sky-500"></i>
                                <span class="tw-text-lg tw-font-medium tw-text-slate-600">{{ $t(license.rank) }}</span>
                            </div>
                        </div>

                        <!-- Actions -->
                        <div class="tw-flex tw-flex-wrap tw-justify-center tw-gap-4 tw-mt-4">
                            <button
                                v-if="primaryAction"
                                type="button"
                                :disabled="isActionLoading(primaryAction.key)"
                                class="tw-group tw-relative tw-overflow-hidden tw-rounded-xl tw-bg-sky-600 tw-px-8 tw-py-3 tw-text-white tw-shadow-lg tw-shadow-sky-200 hover:tw-bg-sky-500 hover:tw-scale-105 active:tw-scale-95 tw-transition-all tw-duration-200"
                                @click="onPrimary()"
                            >
                                <span class="tw-relative tw-flex tw-items-center tw-gap-3 tw-font-semibold">
                                    <i :class="isActionLoading(primaryAction.key) ? 'pi pi-spinner tw-animate-spin' : primaryAction.icon"></i>
                                    {{ $t(primaryAction.label) }}
                                </span>
                            </button>

                            <button
                                v-if="hasCard && statusKind !== 'expired'"
                                type="button"
                                class="tw-group tw-rounded-xl tw-bg-white tw-border tw-border-slate-200 tw-px-6 tw-py-3 tw-text-slate-600 hover:tw-text-sky-600 hover:tw-border-sky-200 hover:tw-bg-sky-50 hover:tw-scale-105 active:tw-scale-95 tw-transition-all tw-duration-200"
                                @click="downloadCard"
                            >
                                <span class="tw-flex tw-items-center tw-gap-3 tw-font-medium">
                                    <i class="pi pi-download"></i>
                                    {{ $t('Download License Card') }}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </transition>

        <!-- License Stats Grid -->
        <transition name="fade-up" appear>
            <section v-if="license" class="tw-delay-100">
                <div class="tw-grid tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-4 md:tw-gap-6">
                    <!-- Stat Card Template -->
                    <div class="stat-card">
                        <div class="icon-box tw-bg-indigo-50 tw-text-indigo-600">
                            <i class="pi pi-hashtag"></i>
                        </div>
                        <div class="content">
                            <div class="label">{{ $t('License number') }}</div>
                            <div class="value tw-font-mono">{{ license.id }}</div>
                        </div>
                    </div>

                    <div v-if="license.rank" class="stat-card">
                        <div class="icon-box tw-bg-orange-50 tw-text-orange-600">
                            <i class="pi pi-star"></i>
                        </div>
                        <div class="content">
                            <div class="label">{{ $t('Rank') }}</div>
                            <div class="value">{{ $t(license.rank) }}</div>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="icon-box tw-bg-teal-50 tw-text-teal-600">
                            <i class="pi pi-shield"></i>
                        </div>
                        <div class="content">
                            <div class="label">{{ $t('Status') }}</div>
                            <div class="value">{{ $t(license.status || 'Status') }}</div>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="icon-box tw-bg-rose-50 tw-text-rose-600">
                            <i class="pi pi-calendar"></i>
                        </div>
                        <div class="content">
                            <div class="label">{{ $t('Expiry on') }}</div>
                            <div class="value">{{ expiryDate }}</div>
                        </div>
                    </div>
                </div>
            </section>
        </transition>

        <!-- Memberships -->
        <transition name="fade-up" appear>
            <section v-if="memberships && memberships.length" class="tw-space-y-8 tw-delay-200">
                <div class="tw-flex tw-items-center tw-gap-4">
                    <h2 class="section-title">{{ $t('International memberships') }}</h2>
                    <div class="tw-h-px tw-bg-slate-200 tw-flex-1"></div>
                </div>

                <div class="tw-grid sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-6">
                    <div
                        v-for="(m, idx) in memberships"
                        :key="idx + '-' + (m.organization || '')"
                        class="info-card tw-group"
                    >
                        <div class="tw-flex tw-items-start tw-gap-4">
                            <div class="tw-w-12 tw-h-12 tw-rounded-xl tw-bg-slate-100 tw-flex tw-items-center tw-justify-center tw-text-slate-500 group-hover:tw-bg-sky-600 group-hover:tw-text-white tw-transition-colors tw-duration-300">
                                <i class="pi pi-globe tw-text-xl"></i>
                            </div>
                            <div>
                                <h3 class="tw-font-bold tw-text-slate-800 tw-text-lg group-hover:tw-text-sky-700 tw-transition-colors">{{ m.organization }}</h3>
                                <p class="tw-text-slate-500 tw-font-medium">{{ m.title }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </transition>

        <!-- Contracts -->
        <transition name="fade-up" appear>
            <section v-if="contracts && contracts.length" class="tw-space-y-8 tw-delay-300">
                <div class="tw-flex tw-items-center tw-gap-4">
                    <h2 class="section-title">{{ $t('Affiliated dive centers') }}</h2>
                    <div class="tw-h-px tw-bg-slate-200 tw-flex-1"></div>
                </div>

                <div class="tw-grid sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-6">
                    <article 
                        v-for="c in contracts" :key="c.id"
                        class="info-card tw-flex tw-flex-col tw-h-full"
                    >
                        <header class="tw-flex tw-justify-between tw-items-start tw-gap-4 tw-mb-4">
                            <h3 class="tw-font-bold tw-text-lg tw-text-slate-800 tw-line-clamp-2">
                                {{ c.center_name }}
                            </h3>
                            <span :class="['tw-shrink-0 tw-text-[10px] tw-uppercase tw-font-bold tw-px-2.5 tw-py-1 tw-rounded-full tw-tracking-wide', statusPillClass(c.status)]">
                                {{ c.status }}
                            </span>
                        </header>

                        <div class="tw-mt-auto tw-space-y-3">
                            <div class="tw-flex tw-items-center tw-gap-3 tw-text-sm tw-text-slate-500">
                                <i class="pi pi-calendar tw-text-slate-400"></i>
                                <span>{{ formatRange(c.start_date, c.end_date, c.auto_renewal) }}</span>
                            </div>
                            
                            <div v-if="c.auto_renewal" class="tw-inline-flex tw-items-center tw-gap-1.5 tw-text-xs tw-font-semibold tw-text-emerald-600 tw-bg-emerald-50 tw-px-2 tw-py-1 tw-rounded-lg">
                                <i class="pi pi-sync tw-text-[10px]"></i>
                                {{ $t('Auto renewal') }}
                            </div>
                        </div>
                    </article>
                </div>
            </section>
        </transition>

	</div>
</template>

  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRouter } from 'vue-router'
  
  /** PrimeVue */
  import Button from 'primevue/button' 
  
  /** Your services/composables */
  import { apiGet, apiPost } from '@/v3/services/httpClient.js'
  import { useNotification } from '@/v3/composables/useNotification.js'
  import {
    PROFESSIONAL_DIVERS_APPS_ACTIVATE,
    PROFESSIONAL_DIVERS_APPS_CARD_REQUEST,
    PROFESSIONAL_DIVERS_APPS_CANCEL_REQUEST,
    PROFESSIONAL_DIVERS_APPS_RENEW_LICENSE,
    PROFESSIONAL_DIVERS_APPS_UPDATE,
    PROFESSIONAL_DIVERS_PICK,
    MEDIA_BASE_URL,
  } from '@/v3/config/apiEndpoints.js'

  const PICK = PROFESSIONAL_DIVERS_PICK
  const UPDATE_APPLICATION = PROFESSIONAL_DIVERS_APPS_UPDATE
  const RENEW_APPLICATION = PROFESSIONAL_DIVERS_APPS_RENEW_LICENSE
  const ACTIVATE_ENDPOINT = PROFESSIONAL_DIVERS_APPS_ACTIVATE
  const PRINTED_CARD_ENDPOINT = PROFESSIONAL_DIVERS_APPS_CARD_REQUEST
  const CANCEL_REQUEST_ENDPOINT = PROFESSIONAL_DIVERS_APPS_CANCEL_REQUEST
  const WEB_BASE = import.meta.env.VITE_WEB_BASE_URL || ''
  
  const { t, locale } = useI18n()
  const router = useRouter()
  const notify = useNotification()
  
  /** State */
  const loading = ref(true)
  const error = ref(null)
  const actionLoadingKey = ref('')
  
  const license = ref(null)
  const notFound = ref(false)
  const usersPicture = ref(null)
  const licenseCard = ref(null) // <-- new
  const memberships = ref([])
  const contracts = ref([])
  const photoError = ref(false)
  
 
 
  /** Derived */
  const photoUrl = computed(() => {
    if (photoError.value) return null
	return buildMediaUrl(usersPicture.value?.portrait_link || usersPicture.value?.link)
  })
  
  const displayName = computed(() => {
	return license.value?.name_ar && locale.value === 'ar'
	  ? license.value.name_ar
	  : (license.value?.name_en && locale.value !== 'ar'
		  ? license.value.name_en
		  : (license.value?.name || ''))
  })
  
  const expiry = computed(() => license.value?.expiry_on || license.value?.expires_on)
  const expiryDate = computed(() => expiry.value || '')
  
  const statusKind = computed(() => {
	const s = (license.value?.status || '').toLowerCase()
	if (s === 'terminated') return 'terminated'
	if (s === 'expired') return 'expired'
	return 'valid'
  })
 

  const statusBarClass = computed(() => {
  if (statusKind.value === 'terminated') return 'tw-bg-red-700'
  if (statusKind.value === 'expired') return 'tw-bg-red-500'   // was amber; now red
  return 'tw-bg-emerald-500'
})

// Status ring around avatar
const avatarRingClass = computed(() => {
  if (statusKind.value === 'terminated') return 'tw-ring-4 tw-ring-red-700 tw-ring-offset-2 tw-ring-offset-white'
  if (statusKind.value === 'expired')    return 'tw-ring-4 tw-ring-red-500 tw-ring-offset-2 tw-ring-offset-white'
  return 'tw-ring-4 tw-ring-emerald-500 tw-ring-offset-2 tw-ring-offset-white'
})
  
  const isWithinRenewWindow = computed(() => {
	if (!expiry.value) return false
	const exp = Date.parse(expiry.value)
	if (Number.isNaN(exp)) return false
	const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000
	return Date.now() >= exp - ninetyDaysMs
  })
  
  const primaryAction = computed(() => {
	if (!license.value) return null
	if (statusKind.value === 'terminated') return { key: 'activate', label: 'Activate License', icon: 'pi pi-power-off' }
	if (statusKind.value === 'expired' || isWithinRenewWindow.value)
	  return { key: 'renew', label: 'Renew License', icon: 'pi pi-refresh' }
	return { key: 'update', label: 'Update Information', icon: 'pi pi-pencil' }
  })
  
  /** Card link via `licenseCard` response key */
  const cardLink = computed(() => {
	const lc = licenseCard.value
	if (!lc) return ''
	// tolerate string or object with link/url/path
	const raw =
	  typeof lc === 'string'
		? lc
		: lc.link || lc.url || lc.href || lc.path || ''
	if (!raw) return ''
	return raw.startsWith('http') ? raw : WEB_BASE + raw
  })
  const hasCard = computed(() => !!cardLink.value)
  const canRequestPrintedCard = computed(() => {
    return !!license.value && statusKind.value === 'valid'
  })
  
 
  
 
  
  /** Utils */
  function buildMediaUrl(link) {
	if (!link) return ''

	const raw = String(link).trim()
	if (!raw) return ''
	if (/^https?:\/\//i.test(raw)) return raw

	const normalizedBase = String(MEDIA_BASE_URL || '/')
	const base = normalizedBase.endsWith('/') ? normalizedBase : `${normalizedBase}/`
	return `${base}${raw.replace(/^\//, '')}`
  }

  function formatRange(start, end, auto_renewal = 0) {
	if (!start) return ''
	return `${start} — ${ (auto_renewal) ? t('Present') : (end ? end : t('Present')) }`
  }
  
  function statusPillClass(s) {
	const v = (s || '').toLowerCase()
	if (v.includes('approved') || v.includes('active')) return 'tw-text-emerald-700 tw-border-emerald-200 tw-bg-emerald-50'
	if (v.includes('pending')) return 'tw-text-amber-700 tw-border-amber-200 tw-bg-amber-50'
	if (v.includes('rejected') || v.includes('inactive')) return 'tw-text-red-700 tw-border-red-200 tw-bg-red-50'
	return 'tw-text-slate-700 tw-border-slate-200 tw-bg-slate-50'
  }
  
  function messageFromError(e) {
	return e?.message
		|| e?.payload?.message
		|| e?.payload?.body?.message
		|| e?.response?.data?.message
		|| e?.response?.statusText
		|| t('Something went wrong')
  }

  function getConflictApplicationId(e) {
    return e?.payload?.application?.id
      || e?.payload?.body?.application?.id
      || e?.payload?.application_id
      || e?.payload?.body?.application_id
      || null
  }

  function goToApplicationSummary(appId) {
    return router.push({
      name: 'app-summary',
      params: { appId, locale: locale.value },
    })
  }
  
  /** Actions */
  async function onPrimary() {
	if (!primaryAction.value) return
	await runAction(primaryAction.value.key)
  }

  function isActionLoading(key) {
    return actionLoadingKey.value === key
  }
 

  function downloadCard() {
	if (!cardLink.value) {
	  notify.error(t('No card available'))
	  return
	}
	window.open(cardLink.value, '_blank', 'noopener')
	notify.success(t('Card download started'))
  }
  
  async function runAction(key) {
    if (actionLoadingKey.value) return
    actionLoadingKey.value = key
	try { 
	  if (key === 'update') {
		const res = await apiPost(UPDATE_APPLICATION)
		const id = res?.application?.id
		if (id) {
		  notify.success(t('Update application started'))
		  goToApplicationSummary(id)
		}
		return
	  }
	  if (key === 'renew') {
		const res = await apiPost(RENEW_APPLICATION)
		const id = res?.application?.id
		if (id) {
		  notify.success(t('Renewal started'))
		  goToApplicationSummary(id)
		}
		return
	  }
	  if (key === 'activate') {
		const res = await apiPost(ACTIVATE_ENDPOINT)
		const id = res?.application?.id
		notify.success(t('Activation request submitted'))
		if (id) {
		  goToApplicationSummary(id)
		  return
		}
		await fetchProfile()
		return
	  }
	  if (key === 'request_printed') {
		const res = await apiPost(PRINTED_CARD_ENDPOINT)
		const id = res?.application?.id
		notify.success(t('Printed card requested'))
		if (id) {
		  goToApplicationSummary(id)
		  return
		}
		await fetchProfile()
		return
	  }
	  if (key === 'cancel_request') {
		await apiPost(CANCEL_REQUEST_ENDPOINT, { type: statusKind.value === 'terminated' ? 'activate' : 'renew' })
		notify.success(t('Request canceled'))
		await fetchProfile()
		return
	  }
	  if (key === 'download_card') {
		downloadCard()
		return
	  }
	  if (key === 'add_contract') {
		router.push({ name: 'professional-diver-contracts-new' })
		return
	  }
		} catch (e) {
          if (e?.status === 409) {
            const appId = getConflictApplicationId(e)

            if (appId) {
              await goToApplicationSummary(appId)
              return
            }
          }

		  notify.error(messageFromError(e))
	  console.error(e)
	} finally {
      actionLoadingKey.value = ''
	}
  }
  
  /** Data */
  async function fetchProfile() {
	loading.value = true
	error.value = null
    notFound.value = false
    photoError.value = false
	try {
	  const data = await apiGet(PICK)
	  license.value = data.license || null
	  usersPicture.value = data.usersPicture || data.userPicture || null
	  licenseCard.value = data.licenseCard || null  // <-- use licenseCard response
	  memberships.value = Array.isArray(data.memberships) ? data.memberships : []
	  contracts.value = Array.isArray(data.diverContracts) ? data.diverContracts : []
	} catch (e) {
	  if (e?.status === 401) {
        return
      }
	  if (e?.status === 404) {
        // Handle 404 silently -> show "Not Found" UI
        notFound.value = true
        loading.value = false
        return
	  }
      // Only notify for other errors
	  error.value = e
	  notify.error(messageFromError(e))
	} finally {
	  loading.value = false
	}
  }
  
  onMounted(fetchProfile)
  </script>
  
  <style scoped>


/* Mesh Gradient Background */
.mesh-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  opacity: 0.8;
  background:
    radial-gradient(900px 500px at 12% 18%, rgba(14,165,233,0.12), transparent 60%),
    radial-gradient(800px 420px at 85% 12%, rgba(34,211,238,0.1), transparent 62%),
    radial-gradient(700px 380px at 25% 85%, rgba(59,130,246,0.08), transparent 60%),
    radial-gradient(600px 340px at 75% 78%, rgba(2,132,199,0.08), transparent 60%);
  z-index: 0;
}

/* Animations */
.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Card Styles */
.stat-card {
    @apply tw-bg-white tw-border tw-border-slate-100 tw-rounded-2xl tw-p-5 tw-shadow-sm 
           tw-flex tw-items-center tw-gap-4 tw-transition-all tw-duration-300;
}
.stat-card:hover {
    @apply tw-shadow-md -tw-translate-y-1 tw-border-slate-200;
}

.stat-card .icon-box {
    @apply tw-w-12 tw-h-12 tw-rounded-xl tw-flex tw-items-center tw-justify-center tw-text-xl tw-shrink-0;
}

.stat-card .content {
    @apply tw-flex tw-flex-col;
}

.stat-card .label {
    @apply tw-text-xs tw-font-bold tw-text-slate-400 tw-uppercase tw-tracking-wide;
}

.stat-card .value {
    @apply tw-text-sm md:tw-text-base tw-font-bold tw-text-slate-800;
}

.info-card {
    @apply tw-bg-white tw-border tw-border-slate-100 tw-rounded-2xl tw-p-6 tw-shadow-sm 
           tw-transition-all tw-duration-300 hover:tw-shadow-lg hover:-tw-translate-y-1 hover:tw-border-sky-100;
}

.section-title {
    @apply tw-text-xl tw-font-bold tw-text-slate-800;
}
</style>
