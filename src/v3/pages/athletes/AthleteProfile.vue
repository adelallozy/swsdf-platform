<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { apiGet, apiPost } from '@/v3/services/httpClient.js';
import { useNotification } from '@/v3/composables/useNotification.js';
import { useErrorHandler } from '@/v3/composables/useErrorHandler.js';
import usePageHeading from '@/v3/composables/layout/usePageHeading.js';
import {
  ATHLETES_GET_PROFILE,
  ATHLETES_RENEW_MEMBERSHIP,
  ATHLETES_UPGRADE_LICENSE,
  MEDIA_BASE_URL
} from '@/v3/config/apiEndpoints.js';
import { getAthleteSportCode, getAthleteSportLabel } from '@/v3/schema/applications/athleteSport.js';
import { getConflictApplicationId } from '@/v3/utils/applicationWorkflow.js';

const router = useRouter();
const { t, locale } = useI18n();
const { success: notifySuccess, info: notifyInfo, error: notifyError } = useNotification();
const { capture } = useErrorHandler();
const { setHeading } = usePageHeading();

const isLoading = ref(false);
const loadError = ref(null);
const renewingSportId = ref(null);
const upgradingSportId = ref(null);
const userProfile = ref(null);
const userPicture = ref(null);
const sports = ref([]);

const isRtl = computed(() => locale.value === 'ar');
const displayName = computed(() => {
  const profile = userProfile.value || {};
  return isRtl.value
    ? (profile.name_ar || profile.name || profile.name_en || '')
    : (profile.name_en || profile.name || profile.name_ar || '');
});
const identityNumber = computed(() => userProfile.value?.identity_number || sports.value[0]?.identity_number || '');
const athleteNumber = computed(() => sports.value[0]?.user_id || userProfile.value?.id || '');
const photoUrl = computed(() => buildMediaUrl(userPicture.value?.portrait_link || userPicture.value?.link));

const gradientClass = computed(() => {
  const anyValid = sports.value.some((sport) => sport.status === 'Valid');
  return anyValid
    ? 'tw-bg-gradient-to-br tw-from-sky-50 tw-via-white tw-to-cyan-100'
    : 'tw-bg-gradient-to-br tw-from-slate-50 tw-via-white tw-to-sky-50';
});
const toolbarAlign = computed(() => (isRtl.value ? 'tw-justify-start' : 'tw-justify-end'));
const actionAlign = computed(() => (isRtl.value ? 'tw-justify-start' : 'tw-justify-end'));
const hasPendingSportAction = computed(() => renewingSportId.value !== null || upgradingSportId.value !== null);

const sportCards = computed(() => {
  return sports.value.map((row) => {
    const sportCode = getAthleteSportCode(row.sport);
    const registrationType = String(row.registration_type || '').toLowerCase();

    return {
      ...row,
      sportCode,
      sportLabel: getAthleteSportLabel(sportCode || row.sport),
      registrationType,
      statusLabel: t(row.status || 'Status'),
      cardLink: buildMediaUrl(row.card_url),
      renewLabel: buildRenewLabel(registrationType),
      canRenew: showRenew(row),
      canUpgradeLicense: showLicenseUpgrade(row),
      isRenewing: renewingSportId.value === row.id,
      isUpgrading: upgradingSportId.value === row.id
    };
  });
});

function buildMediaUrl(link) {
  if (!link) return '';

  const raw = String(link).trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;

  const normalizedBase = String(MEDIA_BASE_URL || '/');
  const base = normalizedBase.endsWith('/') ? normalizedBase : `${normalizedBase}/`;
  return `${base}${raw.replace(/^\//, '')}`;
}

function humanizeValue(value) {
  return String(value || '')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

function buildRenewLabel(registrationType) {
  if (registrationType === 'membership' || registrationType === 'license') {
    return `${t('Renew')} ${t(registrationType)}`;
  }

  return t('Renew');
}

function showLicenseUpgrade(row) {
  if (typeof row?.can_upgrade_license === 'boolean') {
    return row.can_upgrade_license;
  }

  if (row?.can_upgrade_license === 1 || row?.can_upgrade_license === '1') {
    return true;
  }

  if (row?.can_upgrade_license === 0 || row?.can_upgrade_license === '0') {
    return false;
  }

  const sportCode = getAthleteSportCode(row?.sport);
  const registrationType = String(row?.registration_type || '').toLowerCase();
  const status = String(row?.status || '').toLowerCase();

  return ['jetski', 'flyboard'].includes(sportCode)
    && registrationType === 'membership'
    && status !== 'terminated';
}

function statusIcon(status) {
  if (status === 'Valid') return 'pi pi-check-circle';
  if (status === 'Expired') return 'pi pi-exclamation-circle';
  if (status === 'Terminated') return 'pi pi-ban';
  return 'pi pi-info-circle';
}

function statusChipClass(status) {
  if (status === 'Valid') return 'tw-bg-emerald-50 tw-text-emerald-700';
  if (status === 'Expired') return 'tw-bg-amber-50 tw-text-amber-700';
  if (status === 'Terminated') return 'tw-bg-red-50 tw-text-red-700';
  return 'tw-bg-gray-50 tw-text-gray-700';
}

function cardBgBase(status) {
  if (status === 'Valid') {
    return 'tw-bg-gradient-to-br tw-from-sky-50 tw-via-white tw-to-cyan-100';
  }
  if (status === 'Expired') {
    return 'tw-bg-gradient-to-br tw-from-slate-50 tw-via-white tw-to-amber-50';
  }
  if (status === 'Terminated') {
    return 'tw-bg-gradient-to-br tw-from-slate-50 tw-via-white tw-to-red-50';
  }
  return 'tw-bg-gradient-to-br tw-from-slate-50 tw-via-white tw-to-sky-50';
}

function cardBorderClass(status) {
  if (status === 'Valid') return 'tw-border-emerald-200';
  if (status === 'Expired') return 'tw-border-amber-200';
  if (status === 'Terminated') return 'tw-border-red-200';
  return 'tw-border-gray-200';
}

function ribbonClass(status) {
  if (status === 'Valid') return 'tw-bg-emerald-400';
  if (status === 'Expired') return 'tw-bg-amber-400';
  if (status === 'Terminated') return 'tw-bg-red-400';
  return 'tw-bg-slate-300';
}

function meshBlobs(status) {
  if (status === 'Valid') {
    return [
      'tw-absolute tw--top-8 tw--left-8 tw-w-40 tw-h-40 tw-rounded-full tw-bg-cyan-200 tw-opacity-50 tw-blur-3xl',
      'tw-absolute tw-bottom-0 tw-right-0 tw-w-48 tw-h-48 tw-rounded-full tw-bg-sky-200 tw-opacity-40 tw-blur-3xl',
      'tw-absolute tw-top-10 tw-left-1/2 -tw-translate-x-1/2 tw-w-36 tw-h-36 tw-rounded-full tw-bg-emerald-200 tw-opacity-40 tw-blur-3xl'
    ];
  }

  if (status === 'Expired') {
    return [
      'tw-absolute tw--top-6 tw-left-8 tw-w-36 tw-h-36 tw-rounded-full tw-bg-amber-200 tw-opacity-40 tw-blur-3xl',
      'tw-absolute tw-bottom-0 tw-right-6 tw-w-48 tw-h-48 tw-rounded-full tw-bg-slate-200 tw-opacity-40 tw-blur-3xl'
    ];
  }

  if (status === 'Terminated') {
    return [
      'tw-absolute tw--top-6 tw-right-6 tw-w-40 tw-h-40 tw-rounded-full tw-bg-red-200 tw-opacity-45 tw-blur-3xl',
      'tw-absolute tw-bottom-0 tw-left-4 tw-w-44 tw-h-44 tw-rounded-full tw-bg-slate-200 tw-opacity-40 tw-blur-3xl'
    ];
  }

  return [
    'tw-absolute tw--top-6 tw-left-8 tw-w-36 tw-h-36 tw-rounded-full tw-bg-sky-200 tw-opacity-30 tw-blur-3xl'
  ];
}

function showRenew(row) {
  if (typeof row?.can_renew === 'boolean') {
    return row.can_renew;
  }

  if (row?.can_renew === 1 || row?.can_renew === '1') {
    return true;
  }

  if (row?.can_renew === 0 || row?.can_renew === '0') {
    return false;
  }

  if (String(row?.status || '').toLowerCase() === 'terminated') {
    return false;
  }

  const expiryDate = row?.expiry_date;
  if (!expiryDate) return false;

  const today = new Date();
  const expiry = new Date(`${expiryDate}T00:00:00`);
  if (Number.isNaN(expiry.getTime())) return false;

  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);

  const renewalWindowStart = new Date(expiry);
  renewalWindowStart.setMonth(renewalWindowStart.getMonth() - 3);

  return today >= renewalWindowStart;
}

async function loadProfile() {
  isLoading.value = true;
  loadError.value = null;

  try {
    const data = await apiGet(ATHLETES_GET_PROFILE, {
      context: 'Loading athlete profile'
    });

    userProfile.value = data?.userProfile || null;
    userPicture.value = data?.userPicture || null;
    sports.value = Array.isArray(data?.sports) ? data.sports : [];

    setHeading({
      title: t('Athletes'),
      subtitle: displayName.value,
      visible: true
    });
  } catch (error) {
    if (error?.status === 404) {
      router.replace({ name: 'atheltes-instructions' });
      return;
    }

    loadError.value = error?.message || 'Failed to load athlete profile';
    notifyError(loadError.value);
    capture(error, {
      context: 'AthleteProfile.loadProfile',
      fallback: 'Failed to load athlete profile'
    });
  } finally {
    isLoading.value = false;
  }
}

async function renewSport(row) {
  if (!row?.sport || hasPendingSportAction.value) return;

  const sportCode = getAthleteSportCode(row.sport);
  renewingSportId.value = row.id;

  try {
    const response = await apiPost(`${ATHLETES_RENEW_MEMBERSHIP}${sportCode}`);
    const appId = response?.application?.id;

    if (!appId) {
      throw new Error('Application ID not returned from server');
    }

    notifySuccess(t('Renewal started'));
    router.push({
      name: 'app-summary',
      params: { appId, locale: locale.value }
    });
  } catch (error) {
    if (error?.status === 409) {
      const appId = getConflictApplicationId(error);

      if (appId) {
        notifyInfo(t('You already has incomplete application'));
        router.push({
          name: 'app-summary',
          params: { appId, locale: locale.value }
        });
        return;
      }
    }

    const message = error?.payload?.message || error?.message;
    notifyError(message ? t(message) : t('Failed to start renewal application'));
    capture(error, {
      context: 'AthleteProfile.renewSport',
      fallback: 'Failed to start renewal application',
      meta: {
        sportId: row.id,
        sportCode
      }
    });
  } finally {
    renewingSportId.value = null;
  }
}

async function upgradeSportLicense(row) {
  if (!row?.sport || hasPendingSportAction.value) return;

  const sportCode = getAthleteSportCode(row.sport);
  upgradingSportId.value = row.id;

  try {
    const response = await apiPost(`${ATHLETES_UPGRADE_LICENSE}${sportCode}`);
    const appId = response?.application?.id;

    if (!appId) {
      throw new Error('Application ID not returned from server');
    }

    notifySuccess(t('License application started'));
    router.push({
      name: 'app-summary',
      params: { appId, locale: locale.value }
    });
  } catch (error) {
    if (error?.status === 409) {
      const appId = getConflictApplicationId(error);

      if (appId) {
        notifyInfo(t('You already has incomplete application'));
        router.push({
          name: 'app-summary',
          params: { appId, locale: locale.value }
        });
        return;
      }
    }

    const message = error?.payload?.message || error?.message;
    notifyError(message ? t(message) : t('Failed to start license application'));
    capture(error, {
      context: 'AthleteProfile.upgradeSportLicense',
      fallback: 'Failed to start license application',
      meta: {
        sportId: row.id,
        sportCode
      }
    });
  } finally {
    upgradingSportId.value = null;
  }
}

function downloadCard(row) {
  const cardUrl = buildMediaUrl(row?.card_url);
  if (!cardUrl) {
    notifyError(t('No card available'));
    return;
  }

  window.open(cardUrl, '_blank', 'noopener');
}

onMounted(async () => {
  setHeading({ title: t('Athletes'), visible: true });
  await loadProfile();
});
</script>

<template>
  <div class="tw-max-w-7xl tw-mx-auto tw-px-4 tw-pt-8 tw-pb-12" :class="gradientClass">
    <div v-if="isLoading" class="tw-py-20 tw-text-center">{{ t('Loading') }}</div>
    <div v-else-if="loadError" class="tw-py-4 tw-mb-4 tw-text-red-700 tw-bg-red-50 tw-rounded-xl tw-px-4">{{ loadError }}</div>

    <template v-else>
      <section class="tw-rounded-3xl tw-px-6 tw-py-10 tw-text-center">
        <div class="tw-mt-5 tw-flex tw-items-center tw-gap-3" :class="toolbarAlign">
          <button
            type="button"
            class="tw-px-4 tw-py-2 tw-rounded-xl tw-border tw-border-gray-200 tw-bg-white hover:tw-shadow"
            @click="loadProfile"
          >
            <i class="pi pi-refresh" aria-hidden="true"></i>
            <span class="tw-ml-2">{{ t('Refresh') }}</span>
          </button>
        </div>

        <img
          v-if="photoUrl"
          :src="photoUrl"
          alt=""
          class="tw-w-36 md:tw-w-44 tw-h-36 md:tw-h-44 tw-rounded-full tw-object-cover tw-mx-auto tw-shadow-lg"
        />
        <div
          v-else
          class="tw-w-36 md:tw-w-44 tw-h-36 md:tw-h-44 tw-rounded-full tw-bg-slate-100 tw-flex tw-items-center tw-justify-center tw-text-2xl tw-font-bold tw-mx-auto"
        >
          {{ (displayName || 'NA').split(' ').slice(0, 2).map((word) => word[0]).join('').toUpperCase() }}
        </div>

        <h1 class="tw-mt-4 tw-text-2xl md:tw-text-3xl tw-font-extrabold">{{ displayName }}</h1>

        <div class="tw-mt-2 tw-space-y-1 tw-text-slate-700">
          <div v-if="identityNumber" class="tw-flex tw-items-center tw-justify-center tw-gap-2">
            <i class="pi pi-id-card" aria-hidden="true"></i>
            <span>{{ identityNumber }}</span>
          </div>
          <div v-if="athleteNumber" class="tw-flex tw-items-center tw-justify-center tw-gap-2">
            <i class="pi pi-shield" aria-hidden="true"></i>
            <span>{{ t('Athlete #') }} {{ athleteNumber }}</span>
          </div>
        </div>
      </section>

      <section class="tw-mt-10">
        <h2 class="tw-text-lg tw-font-bold tw-mb-4">{{ t('Sports') }}</h2>

        <div v-if="!sportCards.length" class="tw-text-sm tw-text-slate-600 tw-italic">
          {{ t('No sports added yet') }}
        </div>

        <div v-else class="tw-grid sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-5">
          <article
            v-for="row in sportCards"
            :key="row.id"
            :class="[
              'tw-group tw-relative tw-rounded-2xl tw-p-4 tw-border tw-overflow-hidden hover:tw-shadow-lg hover:tw-translate-y-[-2px] tw-transition',
              cardBgBase(row.status),
              cardBorderClass(row.status)
            ]"
          >
            <div class="tw-absolute tw-inset-x-0 tw-top-0 tw-h-1" :class="ribbonClass(row.status)"></div>

            <div class="tw-pointer-events-none tw-absolute tw-inset-0">
              <span v-for="(blobClass, index) in meshBlobs(row.status)" :key="index" :class="blobClass"></span>
            </div>

            <header class="tw-relative">
              <div class="tw-flex tw-items-start tw-justify-between tw-gap-3">
                <div class="tw-space-y-2">
                  <h3 class="tw-font-semibold tw-text-foreground">{{ t(row.sportLabel) }}</h3>

                  <span
                    v-if="row.registrationType"
                    class="tw-inline-flex tw-items-center tw-gap-1 tw-text-[11px] tw-font-semibold tw-px-2.5 tw-py-1 tw-rounded-full tw-bg-slate-100 tw-text-slate-700"
                  >
                    <i class="pi pi-tag" aria-hidden="true"></i>
                    {{ t(row.registrationType) }}
                  </span>
                </div>

                <span
                  class="tw-inline-flex tw-items-center tw-gap-1 tw-text-[11px] tw-font-semibold tw-px-2.5 tw-py-1 tw-rounded-full"
                  :class="statusChipClass(row.status)"
                >
                  <i :class="statusIcon(row.status)" aria-hidden="true"></i>
                  {{ row.statusLabel }}
                </span>
              </div>
            </header>

            <dl class="tw-relative tw-mt-3 tw-space-y-1 tw-text-sm tw-text-muted-strong">
              <div v-if="row.category">
                <dt class="tw-inline tw-font-medium">{{ t('Category') }}:</dt>
                <dd class="tw-inline"> {{ humanizeValue(row.category) }}</dd>
              </div>
              <div>
                <dt class="tw-inline tw-font-medium">{{ t('Expiry date') }}:</dt>
                <dd class="tw-inline"> {{ row.expiry_date || '—' }}</dd>
              </div>
            </dl>

            <div class="tw-relative tw-mt-4 tw-flex tw-flex-wrap tw-gap-2" :class="actionAlign">
              <button
                v-if="row.canRenew"
                type="button"
                class="tw-text-xs tw-px-2.5 tw-py-1.5 tw-rounded-lg tw-bg-sky-600 tw-text-white hover:tw-opacity-90 disabled:tw-opacity-60 disabled:tw-cursor-not-allowed"
                :disabled="hasPendingSportAction"
                @click="renewSport(row)"
              >
                <i :class="row.isRenewing ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'" aria-hidden="true"></i>
                <span class="tw-mx-2">{{ row.isRenewing ? t('Loading') : row.renewLabel }}</span>
              </button>

              <button
                v-if="row.canUpgradeLicense"
                type="button"
                class="tw-text-xs tw-px-2.5 tw-py-1.5 tw-rounded-lg tw-bg-indigo-600 tw-text-white hover:tw-opacity-90 disabled:tw-opacity-60 disabled:tw-cursor-not-allowed"
                :disabled="hasPendingSportAction"
                @click="upgradeSportLicense(row)"
              >
                <i :class="row.isUpgrading ? 'pi pi-spin pi-spinner' : 'pi pi-arrow-up'" aria-hidden="true"></i>
                <span class="tw-mx-2">{{ row.isUpgrading ? t('Loading') : t('Upgrade to License') }}</span>
              </button>

              <button
                v-if="row.status === 'Valid'"
                type="button"
                :disabled="!row.cardLink"
                class="tw-text-xs tw-px-2.5 tw-py-1.5 tw-rounded-lg tw-border tw-border-gray-200 tw-bg-white hover:tw-shadow disabled:tw-opacity-50"
                @click="downloadCard(row)"
              >
                <i class="pi pi-download" aria-hidden="true"></i>
                <span class="tw-mx-2">{{ t('Download License Card') }}</span>
              </button>
            </div>
          </article>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
/* All visuals handled with Tailwind (tw-*) utilities. */
</style>
