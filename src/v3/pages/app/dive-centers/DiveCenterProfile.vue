<template>
  <div class="tw-container tw-py-8 tw-px-4">
    <div v-if="isLoadingKey('dive-center-profile-loading')" class="tw-flex tw-justify-center tw-py-16">
      <i class="pi pi-spinner tw-animate-spin tw-text-3xl tw-text-primary" aria-hidden="true" />
    </div>

    <Message
      v-else-if="!center"
      severity="warn"
      variant="simple"
      :closable="false"
      class="tw-max-w-3xl tw-mx-auto"
    >
      {{ $t('Failed to load dive center profile') }}
    </Message>

    <section v-else class="tw-max-w-5xl tw-mx-auto tw-space-y-8">

      <!-- F3: Hero -->
      <div class="tw-flex tw-flex-col tw-items-center tw-text-center tw-gap-4 tw-pb-4">
        <div class="tw-relative">
          <img
            v-if="logoSrc && !logoError"
            :src="logoSrc"
            alt=" "
            class="tw-block tw-w-[140px] tw-h-[140px] tw-rounded-2xl tw-object-contain tw-bg-white tw-shadow-sm"
            loading="lazy"
            @error="logoError = true"
          />
          <div
            v-else
            class="tw-w-[140px] tw-h-[140px] tw-rounded-2xl tw-flex tw-items-center tw-justify-center tw-bg-slate-50 tw-p-4 tw-text-center tw-text-sm tw-font-semibold tw-text-slate-500 tw-shadow-sm"
          >
            {{ $t('Logo not available') }}
          </div>
          <span
            v-if="membershipStatus.key"
            class="tw-absolute tw--top-2 tw--end-2 tw-select-none tw-text-[11px] tw-font-bold tw-rounded-full tw-py-1 tw-px-2.5 tw-shadow-sm tw-ring-1 tw-ring-black/5"
            :class="membershipStatus.cls"
          >
            {{ $t(membershipStatus.key) }}
          </span>
        </div>

        <h1 class="tw-text-2xl md:tw-text-3xl tw-font-bold tw-text-foreground tw-leading-tight">
          {{ center.name }}
        </h1>

        <div class="tw-flex tw-flex-wrap tw-items-center tw-justify-center tw-gap-3 tw-text-sm tw-text-slate-600">
          <span v-if="center.id">
            <span class="tw-text-slate-500">{{ $t('Membership number') }}:</span>
            <span class="tw-font-semibold">{{ center.id }}</span>
          </span>
          <span v-if="center.membership_expiry_on" class="tw-text-slate-400">|</span>
          <span v-if="center.membership_expiry_on">
            <span class="tw-text-slate-500">{{ $t('Expiry date') }}:</span>
            <span class="tw-font-semibold">{{ center.membership_expiry_on }}</span>
          </span>
        </div>

        <div v-if="certs.length" class="tw-flex tw-flex-wrap tw-justify-center tw-gap-3 tw-mt-1">
          <a
            v-for="cert in certs"
            :key="cert.id || cert.path"
            :href="certificateUrl(cert.path)"
            target="_blank"
            rel="noopener noreferrer"
            class="tw-inline-flex tw-items-center tw-gap-1.5 tw-text-sm tw-text-primary hover:tw-underline"
          >
            <i class="pi pi-external-link" aria-hidden="true"></i>
            {{ $t(cert.name) }}
          </a>
        </div>

        <div class="tw-flex tw-flex-wrap tw-justify-center tw-gap-3 tw-mt-2">
          <button
            v-if="membershipStatus.renew"
            type="button"
            :disabled="isLoadingKey('dive-center-profile-action')"
            class="tw-inline-flex tw-items-center tw-gap-2 tw-px-6 tw-py-3 tw-text-base tw-font-medium tw-text-white tw-bg-primary hover:tw-bg-primary-dark tw-rounded-lg tw-transition disabled:tw-opacity-50 disabled:tw-cursor-not-allowed"
            @click="renewMembership"
          >
            <i v-if="!isLoadingKey('dive-center-profile-action')" class="pi pi-refresh" aria-hidden="true"></i>
            <i v-else class="pi pi-spinner tw-animate-spin" aria-hidden="true"></i>
            {{ $t('Renew') }}
          </button>
          <button
            v-if="!membershipStatus.renew && membershipStatus.key === 'valid'"
            type="button"
            :disabled="isLoadingKey('dive-center-profile-action')"
            class="tw-inline-flex tw-items-center tw-gap-2 tw-px-6 tw-py-3 tw-text-base tw-font-medium tw-text-primary tw-bg-primary/10 hover:tw-bg-primary/20 tw-rounded-lg tw-transition disabled:tw-opacity-50 disabled:tw-cursor-not-allowed"
            @click="updateInformation"
          >
            <i v-if="!isLoadingKey('dive-center-profile-action')" class="pi pi-pencil" aria-hidden="true"></i>
            <i v-else class="pi pi-spinner tw-animate-spin" aria-hidden="true"></i>
            {{ $t('Update information') }}
          </button>
        </div>
      </div>

      <!-- F4: Center Details -->
      <div>
        <div class="tw-mb-2 tw-flex tw-items-center tw-gap-2">
          <i class="pi pi-building tw-text-primary" aria-hidden="true"></i>
          <span class="tw-font-bold tw-text-slate-700 tw-text-xl">{{ $t('Center Details') }}</span>
        </div>
        <div class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-p-5">
          <div class="tw-grid sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-4">
            <div v-if="center.name_ar">
              <div class="tw-text-xs tw-text-slate-500">{{ $t('Center Name') }} {{ $t('inArabic') }}</div>
              <div class="tw-font-medium">{{ center.name_ar }}</div>
            </div>
            <div v-if="center.name_en">
              <div class="tw-text-xs tw-text-slate-500">{{ $t('Center Name') }} {{ $t('inEnglish') }}</div>
              <div class="tw-font-medium">{{ center.name_en }}</div>
            </div>
            <div v-if="center.cr_number">
              <div class="tw-text-xs tw-text-slate-500">{{ $t('Commercial Record') }}</div>
              <div class="tw-font-medium">{{ center.cr_number }}</div>
            </div>
            <div v-if="center.cr_expiry_on">
              <div class="tw-text-xs tw-text-slate-500">{{ $t('Commercial Record Expiration') }}</div>
              <div class="tw-font-medium">{{ center.cr_expiry_on }}</div>
            </div>
            <div v-if="center.email">
              <div class="tw-text-xs tw-text-slate-500">{{ $t('Email') }}</div>
              <div class="tw-font-medium">
                <a :href="'mailto:' + center.email" class="tw-text-primary hover:tw-underline">{{ center.email }}</a>
              </div>
            </div>
            <div v-if="center.telephone">
              <div class="tw-text-xs tw-text-slate-500">{{ $t('Phone') }}</div>
              <div class="tw-font-medium">
                <a :href="'tel:' + center.telephone" class="tw-text-primary hover:tw-underline">{{ center.telephone }}</a>
              </div>
            </div>
            <div v-if="center.city_name">
              <div class="tw-text-xs tw-text-slate-500">{{ $t('City') }}</div>
              <div class="tw-font-medium">{{ center.city_name }}</div>
            </div>
            <div v-if="center.address" class="sm:tw-col-span-2">
              <div class="tw-text-xs tw-text-slate-500">{{ $t('Address') }}</div>
              <div class="tw-font-medium">
                {{ center.address }}
                <a
                  v-if="center.latlng"
                  :href="'https://www.google.com/maps/?q=' + encodeURIComponent(center.latlng)"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="tw-inline-flex tw-items-center tw-gap-1 tw-text-primary hover:tw-underline tw-ms-2"
                >
                  <i class="pi pi-map-marker" aria-hidden="true"></i>
                  {{ $t('View on map') }}
                </a>
              </div>
            </div>
            <div v-if="center.website" class="sm:tw-col-span-2">
              <div class="tw-text-xs tw-text-slate-500">{{ $t('Website') }}</div>
              <div class="tw-font-medium">
                <a :href="safeWebsite" target="_blank" rel="noopener noreferrer" class="tw-text-primary hover:tw-underline">
                  {{ center.website }}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- F5: Diving Activities -->
      <div>
        <div class="tw-mb-2 tw-flex tw-items-center tw-gap-2">
          <i class="pi pi-list-check tw-text-primary" aria-hidden="true"></i>
          <span class="tw-font-bold tw-text-slate-700 tw-text-xl">{{ $t('Diving Activities') }}</span>
        </div>
        <div v-if="activities.length" class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-p-5">
          <div class="tw-flex tw-flex-wrap tw-gap-2">
            <span
              v-for="activity in activities"
              :key="activity"
              class="tw-inline-flex tw-items-center tw-rounded-full tw-bg-primary/10 tw-px-3 tw-py-1 tw-text-sm tw-text-primary"
            >
              {{ $t(activity) }}
            </span>
          </div>
        </div>
        <div v-else class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-p-5">
          <div class="tw-text-center tw-py-8 tw-text-slate-500">
            <i class="pi pi-list-check tw-text-4xl tw-text-slate-300 tw-mb-3" aria-hidden="true"></i>
            <p>{{ $t('No diving activities selected yet') }}</p>
          </div>
        </div>
      </div>

      <!-- F6: International Memberships -->
      <div>
        <div class="tw-mb-2 tw-flex tw-items-center tw-gap-2">
          <i class="pi pi-globe tw-text-primary" aria-hidden="true"></i>
          <span class="tw-font-bold tw-text-slate-700 tw-text-xl">{{ $t('International Memberships') }}</span>
        </div>

        <div v-if="intlMemberships.length" class="tw-space-y-3">
          <div
            v-for="(membership, index) in intlMemberships"
            :key="index"
            class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-p-5"
          >
            <div class="tw-mb-2 tw-flex tw-items-center tw-gap-2">
              <span class="tw-font-bold tw-text-slate-700">{{ $t('Membership') }} {{ index + 1 }}</span>
            </div>
            <div class="tw-grid sm:tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-4">
              <div v-if="membership.organization">
                <div class="tw-text-xs tw-text-slate-500">{{ $t('Organization') }}</div>
                <div class="tw-font-medium tw-text-slate-800">{{ membership.organization }}</div>
              </div>
              <div v-if="membership.number">
                <div class="tw-text-xs tw-text-slate-500">{{ $t('Membership Number') }}</div>
                <div class="tw-font-medium tw-text-slate-800">{{ membership.number }}</div>
              </div>
              <div v-if="membership.expiry_date">
                <div class="tw-text-xs tw-text-slate-500">{{ $t('Expiry Date') }}</div>
                <div class="tw-font-medium tw-text-slate-800">{{ membership.expiry_date }}</div>
              </div>
              <div v-if="membershipDivingTypes(membership).length">
                <div class="tw-text-xs tw-text-slate-500">{{ $t('Diving Type') }}</div>
                <div class="tw-flex tw-flex-wrap tw-gap-2">
                  <span
                    v-for="type in membershipDivingTypes(membership)"
                    :key="`${membership.id || index}-${type}`"
                    class="tw-inline-flex tw-items-center tw-rounded-full tw-bg-primary/10 tw-px-3 tw-py-1 tw-text-sm tw-text-primary"
                  >
                    {{ $t(type) }}
                  </span>
                </div>
              </div>
              <div v-if="membership.certificate_url">
                <div class="tw-text-xs tw-text-slate-500">{{ $t('Certificate') }}</div>
                <a
                  :href="certificateUrl(membership.certificate_url)"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="tw-inline-flex tw-items-center tw-gap-1 tw-text-sm tw-text-primary hover:tw-underline"
                >
                  <i class="pi pi-external-link" aria-hidden="true"></i>
                  {{ $t('View') }}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-p-5">
          <div class="tw-text-center tw-py-8 tw-text-slate-500">
            <i class="pi pi-globe tw-text-4xl tw-text-slate-300 tw-mb-3" aria-hidden="true"></i>
            <p>{{ $t('No international memberships added yet') }}</p>
          </div>
        </div>
      </div>

      <!-- F7: Administrators -->
      <div>
        <div class="tw-mb-2 tw-flex tw-items-center tw-gap-2">
          <i class="pi pi-users tw-text-primary" aria-hidden="true"></i>
          <span class="tw-font-bold tw-text-slate-700 tw-text-xl">{{ $t('Administrators') }}</span>
        </div>
        <div v-if="admins.length" class="tw-space-y-4">
          <div
            v-for="(admin, index) in admins"
            :key="admin.id || index"
          >
            <div class="tw-mb-2 tw-flex tw-items-center tw-gap-2">
              <i class="pi pi-user tw-text-primary" aria-hidden="true"></i>
              <span class="tw-font-bold tw-text-slate-700">{{ $t('Administrator') }} {{ index + 1 }}</span>
              <span
                v-for="role in (admin.roles || [])"
                :key="role"
                class="tw-inline-flex tw-items-center tw-rounded-full tw-bg-slate-100 tw-px-3 tw-py-1 tw-text-sm tw-text-slate-700"
              >
                {{ $t(role) }}
              </span>
            </div>
            <div class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-p-5">
              <div class="tw-grid sm:tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-4">
                <div v-if="admin.name_ar">
                  <div class="tw-text-xs tw-text-slate-500">{{ $t('Full Name (Arabic)') }}</div>
                  <div class="tw-font-medium tw-text-slate-800">{{ admin.name_ar }}</div>
                </div>
                <div v-if="admin.name_en">
                  <div class="tw-text-xs tw-text-slate-500">{{ $t('Full Name (English)') }}</div>
                  <div class="tw-font-medium tw-text-slate-800">{{ admin.name_en }}</div>
                </div>
                <div v-if="admin.identity_number">
                  <div class="tw-text-xs tw-text-slate-500">{{ $t('Identity Number') }}</div>
                  <div class="tw-font-medium tw-text-slate-800">{{ admin.identity_number }}</div>
                </div>
                <div v-if="admin.mobile">
                  <div class="tw-text-xs tw-text-slate-500">{{ $t('Phone') }}</div>
                  <div class="tw-font-medium tw-text-slate-800">
                    <a :href="'tel:' + admin.mobile" class="tw-text-primary hover:tw-underline">{{ admin.mobile }}</a>
                  </div>
                </div>
                <div v-if="admin.email">
                  <div class="tw-text-xs tw-text-slate-500">{{ $t('Email') }}</div>
                  <div class="tw-font-medium tw-text-slate-800">
                    <a :href="'mailto:' + admin.email" class="tw-text-primary hover:tw-underline">{{ admin.email }}</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-p-5">
          <div class="tw-text-center tw-py-8 tw-text-slate-500">
            <i class="pi pi-users tw-text-4xl tw-text-slate-300 tw-mb-3" aria-hidden="true"></i>
            <p>{{ $t('No administrators added yet') }}</p>
          </div>
        </div>
      </div>

      <!-- F8: Affiliated Professional Divers -->
      <div>
        <div class="tw-mb-2 tw-flex tw-items-center tw-gap-2">
          <i class="pi pi-id-card tw-text-primary" aria-hidden="true"></i>
          <span class="tw-font-bold tw-text-slate-700 tw-text-xl">{{ $t('Affiliated Professional Divers') }}</span>
        </div>
        <div v-if="proDivers.length" class="tw-space-y-3">
          <div
            v-for="(diver, index) in proDivers"
            :key="index"
            class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-p-5"
          >
            <div class="tw-grid sm:tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-4">
              <div v-if="diver.diver_name">
                <div class="tw-text-xs tw-text-slate-500">{{ $t('Name') }}</div>
                <div class="tw-font-medium tw-text-slate-800">{{ diver.diver_name }}</div>
              </div>
              <div v-if="diver.diver_rank">
                <div class="tw-text-xs tw-text-slate-500">{{ $t('Rank') }}</div>
                <div class="tw-font-medium tw-text-slate-800">{{ $t(diver.diver_rank) }}</div>
              </div>
              <div v-if="diver.start_date">
                <div class="tw-text-xs tw-text-slate-500">{{ $t('Contract Start') }}</div>
                <div class="tw-font-medium tw-text-slate-800">{{ diver.start_date }}</div>
              </div>
              <div v-if="diver.end_date">
                <div class="tw-text-xs tw-text-slate-500">{{ $t('Contract End') }}</div>
                <div class="tw-font-medium tw-text-slate-800">{{ diver.end_date }}</div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-p-5">
          <div class="tw-text-center tw-py-8 tw-text-slate-500">
            <i class="pi pi-id-card tw-text-4xl tw-text-slate-300 tw-mb-3" aria-hidden="true"></i>
            <p>{{ $t('No affiliated professional divers') }}</p>
          </div>
        </div>
      </div>

      <!-- F9: Inspections -->
      <div v-if="inspections.length">
        <div class="tw-mb-2 tw-flex tw-items-center tw-gap-2">
          <i class="pi pi-clipboard tw-text-primary" aria-hidden="true"></i>
          <span class="tw-font-bold tw-text-slate-700 tw-text-xl">{{ $t('Inspection Records') }}</span>
        </div>
        <div class="tw-space-y-3">
          <div
            v-for="(inspection, index) in inspections"
            :key="index"
            class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-p-5"
          >
            <div class="tw-grid sm:tw-grid-cols-2 tw-gap-4">
              <div v-if="inspection.inspected_at">
                <div class="tw-text-xs tw-text-slate-500">{{ $t('Inspection Date') }}</div>
                <div class="tw-font-medium tw-text-slate-800">{{ inspection.inspected_at }}</div>
              </div>
              <div v-if="inspection.result">
                <div class="tw-text-xs tw-text-slate-500">{{ $t('Inspection Result') }}</div>
                <div class="tw-font-medium tw-text-slate-800">{{ $t(inspection.result) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import Message from "primevue/message";

import { apiGet, apiPost } from "@/v3/services/httpClient.js";
import {
  DIVING_CENTERS_VIEW,
  DIVING_CENTERS_APPS_RENEW_MEMBERSHIP,
  DIVING_CENTERS_APPS_CREATE_UPDATE,
} from "@/v3/config/apiEndpoints.js";
import { useLoading } from "@/v3/composables/useLoading.js";
import { useNotification } from "@/v3/composables/useNotification.js";
import { useErrorHandler } from "@/v3/composables/useErrorHandler.js";
import { buildFileUrl } from "@/v3/utils/fileUrl.js";
import {
  getConflictApplicationId,
  getConflictApplicationNotice,
} from "@/v3/utils/applicationWorkflow.js";

const route = useRoute();
const router = useRouter();
const { t, locale } = useI18n();
const { withLoading, isLoadingKey } = useLoading();
const { info: notifyInfo, error: notifyError } = useNotification();
const { capture } = useErrorHandler();

const centerId = computed(() => Number(route.params.id));

const center = ref(null);
const admins = ref([]);
const certs = ref([]);
const proDivers = ref([]);
const inspections = ref([]);

async function loadProfile() {
  const res = await apiGet(DIVING_CENTERS_VIEW + centerId.value);
  center.value = res.divingCenter || null;
  admins.value = res.administrators || [];
  certs.value = res.certificates || [];
  proDivers.value = res.affiliatedProDivers || [];
  inspections.value = res.inspections || [];
  logoError.value = false;
}

function getMembershipStatus(expiryDate) {
  if (!expiryDate) {
    return { key: "expired", cls: "tw-bg-red-50 tw-text-red-700", icon: "pi pi-times-circle", renew: true };
  }
  const now = new Date();
  const expiry = new Date(expiryDate);
  if (now.getTime() > expiry.getTime()) {
    return { key: "expired", cls: "tw-bg-red-50 tw-text-red-700", icon: "pi pi-times-circle", renew: true };
  }
  const daysDiff = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysDiff <= 90) {
    return { key: "expiring soon", cls: "tw-bg-amber-50 tw-text-amber-700", icon: "pi pi-exclamation-triangle", renew: true };
  }
  return { key: "valid", cls: "tw-bg-green-50 tw-text-green-700", icon: "pi pi-check-circle", renew: false };
}

const membershipStatus = computed(() => getMembershipStatus(center.value?.membership_expiry_on));

const logoSrc = computed(() => buildFileUrl(center.value?.logo));
const logoError = ref(false);

const activities = computed(() => {
  const raw = center.value?.diving_activities;
  if (!Array.isArray(raw)) return [];
  return raw.filter(Boolean);
});

const intlMemberships = computed(() => {
  const raw = center.value?.international_memberships;
  if (!Array.isArray(raw)) return [];
  return raw;
});

function membershipDivingTypes(membership) {
  return Array.isArray(membership?.diving_type)
    ? membership.diving_type.filter(Boolean)
    : [];
}

const safeWebsite = computed(() => {
  const raw = (center.value?.website || "").trim();
  if (!raw) return "";
  return /^https?:\/\//i.test(raw) ? raw : "https://" + raw;
});

function certificateUrl(path) {
  return buildFileUrl(path);
}

function openExistingApplicationFromConflict(error) {
  if (error?.status !== 409) {
    return false;
  }

  const applicationId = getConflictApplicationId(error);
  notifyInfo(t(getConflictApplicationNotice(error)), { life: 7000 });

  router.replace(
    applicationId
      ? {
          name: "app-summary",
          params: { appId: applicationId, locale: locale.value },
        }
      : {
          name: "applications-index",
          params: { locale: locale.value },
        }
  );

  return true;
}

async function renewMembership() {
  try {
    await withLoading("dive-center-profile-action", async () => {
      const res = await apiPost(DIVING_CENTERS_APPS_RENEW_MEMBERSHIP + centerId.value);
      router.push({
        name: "app-summary",
        params: { appId: res.application.id, locale: locale.value },
      });
    });
  } catch (err) {
    if (openExistingApplicationFromConflict(err)) {
      return;
    }

    capture(err, { context: "DiveCenterProfile.renewMembership" });
    notifyError(t("Failed to create renewal application"));
  }
}

async function updateInformation() {
  try {
    await withLoading("dive-center-profile-action", async () => {
      const res = await apiPost(DIVING_CENTERS_APPS_CREATE_UPDATE + centerId.value);
      router.push({
        name: "app-summary",
        params: { appId: res.application.id, locale: locale.value },
      });
    });
  } catch (err) {
    if (openExistingApplicationFromConflict(err)) {
      return;
    }

    capture(err, { context: "DiveCenterProfile.updateInformation" });
    notifyError(t("Failed to create update application"));
  }
}

onMounted(async () => {
  try {
    await withLoading("dive-center-profile-loading", loadProfile);
  } catch (err) {
    if (err?.status === 404) {
      router.replace({ name: "error-404", params: { locale: locale.value } });
      return;
    }
    capture(err, { context: "DiveCenterProfile.loadProfile" });
    notifyError(t("Failed to load dive center profile"));
  }
});
</script>
