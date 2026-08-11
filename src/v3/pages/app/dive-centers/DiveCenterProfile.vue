<template>
  <div class="dc-page tw-pt-0 tw-pb-8">
    <div class="tw-container">
      <div
        v-if="isLoadingKey('dive-center-profile-loading')"
        class="tw-flex tw-justify-center tw-py-16"
        role="status"
      >
        <i class="pi pi-spinner tw-animate-spin tw-text-3xl tw-text-primary" aria-hidden="true" />
        <span class="tw-sr-only">{{ $t("Loading") }}</span>
      </div>

      <div v-else-if="!center" class="dc-surface tw-p-6 md:tw-p-10">
        <div class="dc-empty">
          <i class="pi pi-building" aria-hidden="true"></i>
          <p class="dc-empty__title">{{ $t("Failed to load dive center profile") }}</p>
        </div>
      </div>

      <div v-else class="dc-profile-content">
        <!-- HERO: logo + membership badge + name + quick facts -->
        <div class="dc-hero">
          <div class="dc-logo-wrap">
            <img
              v-if="logoSrc && !logoError"
              :src="logoSrc"
              :alt="center.name || $t('Logo not available')"
              class="dc-logo"
              loading="lazy"
              @error="logoError = true"
            />
            <div v-else class="dc-logo-fallback">
              <i class="pi pi-building tw-text-4xl tw-text-[#035796]" aria-hidden="true"></i>
              <span>{{ $t("Logo not available") }}</span>
            </div>

            <span
              v-if="membershipStatus.key"
              class="dc-membership-badge"
              :class="membershipStatus.cls"
            >
              <i :class="membershipStatus.icon" aria-hidden="true"></i>
              {{ $t(membershipStatus.key) }}
            </span>
          </div>

          <h1 class="dc-name">{{ center.name }}</h1>

          <ul v-if="hasQuickFacts" class="dc-quick-facts">
            <li v-if="center.id" class="dc-fact">
              <i class="pi pi-id-card" aria-hidden="true"></i>
              <span>
                <span class="tw-text-[#36566e]">{{ $t("Membership number") }}:</span>
                <span class="dc-fact-value">{{ center.id }}</span>
              </span>
            </li>
            <li v-if="center.membership_expiry_on" class="dc-fact">
              <i class="pi pi-calendar" aria-hidden="true"></i>
              <span>
                <span class="tw-text-[#36566e]">{{ $t("Expiry date") }}:</span>
                <span class="dc-fact-value">{{ center.membership_expiry_on }}</span>
              </span>
            </li>
            <li v-if="center.address || center.city_name" class="dc-fact">
              <i class="pi pi-map-marker" aria-hidden="true"></i>
              <a
                v-if="center.latlng"
                :href="'https://www.google.com/maps/?q=' + encodeURIComponent(center.latlng)"
                target="_blank"
                rel="noopener"
                class="dc-fact-link"
              >
                {{ center.address || center.city_name }}
              </a>
              <span v-else>{{ center.address || center.city_name }}</span>
            </li>
            <li v-if="safeWebsite" class="dc-fact">
              <i class="pi pi-globe" aria-hidden="true"></i>
              <a :href="safeWebsite" target="_blank" rel="noopener" class="dc-fact-link">
                {{ websiteHost || center.website }}
              </a>
            </li>
            <li v-if="center.telephone" class="dc-fact">
              <i class="pi pi-phone" aria-hidden="true"></i>
              <a :href="'tel:' + center.telephone" class="dc-fact-link">{{ center.telephone }}</a>
            </li>
            <li v-if="center.email" class="dc-fact">
              <i class="pi pi-envelope" aria-hidden="true"></i>
              <a :href="'mailto:' + center.email" class="dc-fact-link">{{ center.email }}</a>
            </li>
          </ul>

          <div v-if="certs.length" class="dc-certs">
            <a
              v-for="cert in certs"
              :key="cert.id || cert.path"
              :href="certificateUrl(cert.path)"
              target="_blank"
              rel="noopener noreferrer"
              class="dc-cert-link"
            >
              <i class="pi pi-external-link" aria-hidden="true"></i>
              {{ $t(cert.name) }}
            </a>
          </div>

          <div v-if="membershipStatus.renew || membershipStatus.key === 'valid'" class="dc-actions">
            <button
              v-if="membershipStatus.renew"
              type="button"
              :disabled="isLoadingKey('dive-center-profile-action')"
              class="dc-btn-primary"
              @click="renewMembership"
            >
              <i
                v-if="!isLoadingKey('dive-center-profile-action')"
                class="pi pi-refresh"
                aria-hidden="true"
              ></i>
              <i v-else class="pi pi-spinner tw-animate-spin" aria-hidden="true"></i>
              {{ $t("Renew") }}
            </button>
            <button
              v-if="!membershipStatus.renew && membershipStatus.key === 'valid'"
              type="button"
              :disabled="isLoadingKey('dive-center-profile-action')"
              class="dc-btn-secondary"
              @click="updateInformation"
            >
              <i
                v-if="!isLoadingKey('dive-center-profile-action')"
                class="pi pi-pencil"
                aria-hidden="true"
              ></i>
              <i v-else class="pi pi-spinner tw-animate-spin" aria-hidden="true"></i>
              {{ $t("Update information") }}
            </button>
          </div>
        </div>

        <!-- Activities -->
        <section id="dc-activities" class="dc-section">
          <h2 class="dc-section-heading">
            <i class="pi pi-list-check" aria-hidden="true"></i>
            {{ $t("Diving Activities") }}
          </h2>
          <div v-if="activities.length" class="dc-panel tw-p-5">
            <div class="tw-flex tw-flex-wrap tw-gap-2">
              <span
                v-for="activity in activities"
                :key="activity"
                class="dc-activity-chip"
              >
                <i class="pi pi-check-circle" aria-hidden="true"></i>
                {{ $t(activity) }}
              </span>
            </div>
          </div>
          <div v-else class="dc-panel">
            <div class="dc-panel-empty">
              <i class="pi pi-list-check" aria-hidden="true"></i>
              <p>{{ $t("No diving activities selected yet") }}</p>
            </div>
          </div>
        </section>

        <!-- Center Details -->
        <section id="dc-details" class="dc-section">
          <h2 class="dc-section-heading">
            <i class="pi pi-building" aria-hidden="true"></i>
            {{ $t("Center Details") }}
          </h2>
          <div class="dc-panel tw-p-5">
            <div class="tw-grid sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-4">
              <div v-if="center.name_ar">
                <div class="dc-field-label">{{ $t("Center Name") }} {{ $t("inArabic") }}</div>
                <div class="dc-field-value">{{ center.name_ar }}</div>
              </div>
              <div v-if="center.name_en">
                <div class="dc-field-label">{{ $t("Center Name") }} {{ $t("inEnglish") }}</div>
                <div class="dc-field-value">{{ center.name_en }}</div>
              </div>
              <div v-if="center.cr_number">
                <div class="dc-field-label">{{ $t("Commercial Record") }}</div>
                <div class="dc-field-value">{{ center.cr_number }}</div>
              </div>
              <div v-if="center.cr_expiry_on">
                <div class="dc-field-label">{{ $t("Commercial Record Expiration") }}</div>
                <div class="dc-field-value">{{ center.cr_expiry_on }}</div>
              </div>
              <div v-if="center.email">
                <div class="dc-field-label">{{ $t("Email") }}</div>
                <div class="dc-field-value">
                  <a :href="'mailto:' + center.email" class="dc-inline-link">{{ center.email }}</a>
                </div>
              </div>
              <div v-if="center.telephone">
                <div class="dc-field-label">{{ $t("Phone") }}</div>
                <div class="dc-field-value">
                  <a :href="'tel:' + center.telephone" class="dc-inline-link">{{ center.telephone }}</a>
                </div>
              </div>
              <div v-if="center.city_name">
                <div class="dc-field-label">{{ $t("City") }}</div>
                <div class="dc-field-value">{{ center.city_name }}</div>
              </div>
              <div v-if="center.address" class="sm:tw-col-span-2">
                <div class="dc-field-label">{{ $t("Address") }}</div>
                <div class="dc-field-value">
                  {{ center.address }}
                  <a
                    v-if="center.latlng"
                    :href="'https://www.google.com/maps/?q=' + encodeURIComponent(center.latlng)"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="dc-inline-link tw-ms-2"
                  >
                    <i class="pi pi-map-marker" aria-hidden="true"></i>
                    {{ $t("View on map") }}
                  </a>
                </div>
              </div>
              <div v-if="center.website" class="sm:tw-col-span-2">
                <div class="dc-field-label">{{ $t("Website") }}</div>
                <div class="dc-field-value">
                  <a :href="safeWebsite" target="_blank" rel="noopener noreferrer" class="dc-inline-link">
                    {{ center.website }}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- International Memberships -->
        <section id="dc-intl" class="dc-section">
          <h2 class="dc-section-heading">
            <i class="pi pi-globe" aria-hidden="true"></i>
            {{ $t("International Memberships") }}
          </h2>

          <div v-if="intlMemberships.length" class="dc-cards-list">
            <div
              v-for="(membership, index) in intlMemberships"
              :key="index"
              class="dc-panel dc-list-card"
            >
              <div class="tw-mb-2 tw-flex tw-items-center tw-gap-2">
                <span class="tw-font-bold tw-text-[#36566e]">
                  {{ $t("Membership") }} {{ index + 1 }}
                </span>
              </div>
              <div class="tw-grid sm:tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-4">
                <div v-if="membership.organization">
                  <div class="dc-field-label">{{ $t("Organization") }}</div>
                  <div class="dc-field-value">{{ membership.organization }}</div>
                </div>
                <div v-if="membership.number">
                  <div class="dc-field-label">{{ $t("Membership Number") }}</div>
                  <div class="dc-field-value">{{ membership.number }}</div>
                </div>
                <div v-if="membership.expiry_date">
                  <div class="dc-field-label">{{ $t("Expiry Date") }}</div>
                  <div class="dc-field-value">{{ membership.expiry_date }}</div>
                </div>
                <div v-if="membershipDivingTypes(membership).length">
                  <div class="dc-field-label">{{ $t("Diving Type") }}</div>
                  <div class="tw-flex tw-flex-wrap tw-gap-2">
                    <span
                      v-for="type in membershipDivingTypes(membership)"
                      :key="`${membership.id || index}-${type}`"
                      class="dc-activity-chip"
                    >
                      {{ $t(type) }}
                    </span>
                  </div>
                </div>
                <div v-if="membership.certificate_url">
                  <div class="dc-field-label">{{ $t("Certificate") }}</div>
                  <a
                    :href="certificateUrl(membership.certificate_url)"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="dc-inline-link"
                  >
                    <i class="pi pi-external-link" aria-hidden="true"></i>
                    {{ $t("View") }}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="dc-panel">
            <div class="dc-panel-empty">
              <i class="pi pi-globe" aria-hidden="true"></i>
              <p>{{ $t("No international memberships added yet") }}</p>
            </div>
          </div>
        </section>

        <!-- Administrators -->
        <section id="dc-admins" class="dc-section">
          <h2 class="dc-section-heading">
            <i class="pi pi-users" aria-hidden="true"></i>
            {{ $t("Administrators") }}
          </h2>
          <div v-if="admins.length" class="dc-cards-list">
            <div
              v-for="(admin, index) in admins"
              :key="admin.id || index"
              class="dc-panel dc-list-card"
            >
              <div class="tw-mb-2 tw-flex tw-flex-wrap tw-items-center tw-gap-2">
                <i class="pi pi-user tw-text-[#035796]" aria-hidden="true"></i>
                <span class="tw-font-bold tw-text-[#36566e]">
                  {{ $t("Administrator") }} {{ index + 1 }}
                </span>
                <span
                  v-for="role in admin.roles || []"
                  :key="role"
                  class="tw-inline-flex tw-items-center tw-rounded-full tw-bg-slate-100 tw-px-3 tw-py-1 tw-text-sm tw-text-slate-700"
                >
                  {{ $t(role) }}
                </span>
              </div>
              <div class="tw-grid sm:tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-4">
                <div v-if="admin.name_ar">
                  <div class="dc-field-label">{{ $t("Full Name (Arabic)") }}</div>
                  <div class="dc-field-value">{{ admin.name_ar }}</div>
                </div>
                <div v-if="admin.name_en">
                  <div class="dc-field-label">{{ $t("Full Name (English)") }}</div>
                  <div class="dc-field-value">{{ admin.name_en }}</div>
                </div>
                <div v-if="admin.identity_number">
                  <div class="dc-field-label">{{ $t("Identity Number") }}</div>
                  <div class="dc-field-value">{{ admin.identity_number }}</div>
                </div>
                <div v-if="admin.mobile">
                  <div class="dc-field-label">{{ $t("Phone") }}</div>
                  <div class="dc-field-value">
                    <a :href="'tel:' + admin.mobile" class="dc-inline-link">{{ admin.mobile }}</a>
                  </div>
                </div>
                <div v-if="admin.email">
                  <div class="dc-field-label">{{ $t("Email") }}</div>
                  <div class="dc-field-value">
                    <a :href="'mailto:' + admin.email" class="dc-inline-link">{{ admin.email }}</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="dc-panel">
            <div class="dc-panel-empty">
              <i class="pi pi-users" aria-hidden="true"></i>
              <p>{{ $t("No administrators added yet") }}</p>
            </div>
          </div>
        </section>

        <!-- Affiliated Professional Divers -->
        <section id="dc-divers" class="dc-section">
          <h2 class="dc-section-heading">
            <i class="pi pi-id-card" aria-hidden="true"></i>
            {{ $t("Affiliated Professional Divers") }}
          </h2>
          <div v-if="proDivers.length" class="dc-cards-list">
            <div
              v-for="(diver, index) in proDivers"
              :key="index"
              class="dc-panel dc-list-card dc-diver-row"
            >
              <div class="dc-diver-row__info">
                <div v-if="diver.diver_name" class="dc-diver-row__field">
                  <div class="dc-field-label">{{ $t("Name") }}</div>
                  <div class="dc-field-value">{{ diver.diver_name }}</div>
                </div>
                <div v-if="diver.diver_rank" class="dc-diver-row__field">
                  <div class="dc-field-label">{{ $t("Rank") }}</div>
                  <div class="dc-field-value">{{ $t(diver.diver_rank) }}</div>
                </div>
                <div v-if="diver.start_date" class="dc-diver-row__field">
                  <div class="dc-field-label">{{ $t("Contract Start") }}</div>
                  <div class="dc-field-value">{{ diver.start_date }}</div>
                </div>
                <div v-if="diver.end_date" class="dc-diver-row__field">
                  <div class="dc-field-label">{{ $t("Contract End") }}</div>
                  <div class="dc-field-value">{{ diver.end_date }}</div>
                </div>
              </div>
              <button
                v-if="diverContractId(diver)"
                type="button"
                :disabled="isLoadingKey('dive-center-profile-action')"
                :aria-label="$t('Apply to cancel contract') + ' - ' + (diver.diver_name || '')"
                class="dc-btn-danger dc-diver-row__action"
                @click="cancelContract(diver)"
              >
                <i
                  v-if="!isLoadingKey('dive-center-profile-action')"
                  class="pi pi-file"
                  aria-hidden="true"
                ></i>
                <i v-else class="pi pi-spinner tw-animate-spin" aria-hidden="true"></i>
                {{ $t("Apply to cancel contract") }}
              </button>
            </div>
          </div>
          <div v-else class="dc-panel">
            <div class="dc-panel-empty">
              <i class="pi pi-id-card" aria-hidden="true"></i>
              <p>{{ $t("No affiliated professional divers") }}</p>
            </div>
          </div>
        </section>

        <!-- Inspections -->
        <section v-if="inspections.length" id="dc-inspections" class="dc-section">
          <h2 class="dc-section-heading">
            <i class="pi pi-clipboard" aria-hidden="true"></i>
            {{ $t("Inspection Records") }}
          </h2>
          <div class="dc-panel dc-rows">
            <div
              v-for="(inspection, index) in inspections"
              :key="index"
              class="dc-rows__item"
            >
              <div class="tw-grid tw-gap-4 sm:tw-grid-cols-2">
                <div v-if="inspection.inspected_at">
                  <div class="dc-field-label">{{ $t("Inspection Date") }}</div>
                  <div class="dc-field-value">{{ inspection.inspected_at }}</div>
                </div>
                <div v-if="inspection.result">
                  <div class="dc-field-label">{{ $t("Inspection Result") }}</div>
                  <div class="dc-field-value">{{ $t(inspection.result) }}</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

import { apiGet, apiPost } from "@/v3/services/httpClient.js";
import {
  DIVING_CENTERS_VIEW,
  DIVING_CENTERS_APPS_RENEW_MEMBERSHIP,
  DIVING_CENTERS_APPS_CREATE_UPDATE,
  DIVING_CENTERS_APPS_PD_CONTRACTS_UPDATE,
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
    return {
      key: "expired",
      cls: "dc-badge--invalid",
      icon: "pi pi-times-circle",
      renew: true,
    };
  }
  const now = new Date();
  const expiry = new Date(expiryDate);
  if (now.getTime() > expiry.getTime()) {
    return {
      key: "expired",
      cls: "dc-badge--invalid",
      icon: "pi pi-times-circle",
      renew: true,
    };
  }
  const daysDiff = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysDiff <= 90) {
    return {
      key: "expiring soon",
      cls: "dc-badge--other",
      icon: "pi pi-exclamation-triangle",
      renew: true,
    };
  }
  return {
    key: "valid",
    cls: "dc-badge--valid",
    icon: "pi pi-check-circle",
    renew: false,
  };
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
  return Array.isArray(membership?.diving_type) ? membership.diving_type.filter(Boolean) : [];
}

const safeWebsite = computed(() => {
  const raw = (center.value?.website || "").trim();
  if (!raw) return "";
  return /^https?:\/\//i.test(raw) ? raw : "https://" + raw;
});

const websiteHost = computed(() => {
  if (!safeWebsite.value) return "";
  try {
    return new URL(safeWebsite.value).host.replace(/^www\./i, "");
  } catch {
    return "";
  }
});

const hasQuickFacts = computed(
  () =>
    !!(
      center.value?.id ||
      center.value?.membership_expiry_on ||
      center.value?.address ||
      center.value?.city_name ||
      safeWebsite.value ||
      center.value?.telephone ||
      center.value?.email
    )
);

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

// The affiliatedProDivers rows come from the professional_divers_active_contracts
// DB view, where `id` is the contract row primary key.
function diverContractId(diver) {
  return diver?.id || null;
}

async function cancelContract(diver) {
  const contractId = diverContractId(diver);
  if (!contractId) {
    return;
  }

  try {
    await withLoading("dive-center-profile-action", async () => {
      const res = await apiPost(
        DIVING_CENTERS_APPS_PD_CONTRACTS_UPDATE + centerId.value + "/" + contractId
      );
      router.push({
        name: "app-summary",
        params: { appId: res.application.id, locale: locale.value },
      });
    });
  } catch (err) {
    if (openExistingApplicationFromConflict(err)) {
      return;
    }

    capture(err, { context: "DiveCenterProfile.cancelContract" });
    notifyError(t("Failed to create contract cancellation application"));
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

<style scoped>
.dc-page {
  min-height: 50vh;
}

.dc-surface {
  overflow: hidden;
  margin-inline: auto;
  max-width: 72rem;
  border: 1px solid #dce8f0;
  border-radius: 1rem;
  background: #ffffff;
  box-shadow: 0 14px 42px rgba(15, 45, 76, 0.08);
}

.dc-profile-content {
  width: 100%;
  max-width: 72rem;
  margin-inline: auto;
  padding-block: 1rem 3rem;
}

/* ---------- Hero ---------- */
.dc-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  padding-bottom: 2.5rem;
  border-bottom: 1px solid #dce8f0;
  margin-bottom: 0.5rem;
  text-align: center;
}

.dc-logo-wrap {
  position: relative;
}

.dc-logo {
  width: 220px;
  height: 220px;
  object-fit: contain;
}
@media (min-width: 768px) {
  .dc-logo {
    width: 280px;
    height: 280px;
  }
}

.dc-logo-fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 220px;
  height: 220px;
  color: #36566e;
  font-size: 0.75rem;
  font-weight: 600;
}
@media (min-width: 768px) {
  .dc-logo-fallback {
    width: 280px;
    height: 280px;
  }
}

.dc-membership-badge {
  position: absolute;
  inset-inline-end: -0.5rem;
  top: -0.5rem;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  border: 1px solid;
  font-size: 0.7rem;
  font-weight: 700;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
.dc-badge--valid {
  background: #ecfdf5;
  color: #047857;
  border-color: #a7f3d0;
}
.dc-badge--invalid {
  background: #fef2f2;
  color: #b91c1c;
  border-color: #fecaca;
}
.dc-badge--other {
  background: #fffbeb;
  color: #b45309;
  border-color: #fde68a;
}

.dc-name {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
  color: #062f50;
  line-height: 1.3;
}
@media (min-width: 768px) {
  .dc-name {
    font-size: 2rem;
  }
}

/* Quick facts */
.dc-quick-facts {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  list-style: none;
  padding: 0;
  margin: 0;
}
.dc-fact {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.75rem;
  border-radius: 9999px;
  background: #ffffff;
  border: 1px solid #dce8f0;
  font-size: 0.8rem;
  color: #36566e;
}
.dc-fact i {
  color: #16b8c8;
  font-size: 0.8rem;
}
.dc-fact-value {
  color: #062f50;
  font-weight: 600;
}
.dc-fact-link {
  color: #062f50;
  font-weight: 500;
  text-decoration: none;
}
.dc-fact-link:hover {
  color: #035796;
}
.dc-fact-link:focus-visible,
.dc-cert-link:focus-visible,
.dc-inline-link:focus-visible {
  outline: 3px solid rgba(22, 184, 200, 0.45);
  outline-offset: 2px;
  border-radius: 2px;
}

.dc-certs {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
}
.dc-cert-link {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: #035796;
  text-decoration: none;
}
.dc-cert-link:hover {
  text-decoration: underline;
}

.dc-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

/* Buttons */
.dc-btn-primary {
  display: inline-flex;
  min-height: 3rem;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: 0;
  border-radius: 0.75rem;
  background: #035796;
  color: #ffffff !important;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 150ms ease, box-shadow 150ms ease;
}
.dc-btn-primary:hover:not(:disabled) {
  background: #034d86;
  box-shadow: 0 10px 25px rgba(3, 87, 150, 0.2);
}
.dc-btn-primary:focus-visible {
  outline: 3px solid rgba(69, 213, 223, 0.55);
  outline-offset: 3px;
}
.dc-btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dc-btn-secondary {
  display: inline-flex;
  min-height: 3rem;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: 1px solid #dce8f0;
  border-radius: 0.75rem;
  background: #ffffff;
  color: #035796;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 150ms ease, box-shadow 150ms ease;
}
.dc-btn-secondary:hover:not(:disabled) {
  border-color: #16b8c8;
  box-shadow: 0 0 0 4px rgba(22, 184, 200, 0.12);
}
.dc-btn-secondary:focus-visible {
  outline: 3px solid rgba(22, 184, 200, 0.4);
  outline-offset: 3px;
}
.dc-btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dc-btn-danger {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: 0;
  border-radius: 0.5rem;
  background: #fef2f2;
  color: #b91c1c;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 150ms ease;
}
.dc-btn-danger:hover:not(:disabled) {
  background: #fee2e2;
}
.dc-btn-danger:focus-visible {
  outline: 3px solid rgba(185, 28, 28, 0.3);
  outline-offset: 2px;
}
.dc-btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ---------- Sections ---------- */
.dc-section {
  margin-top: 2.5rem;
}

.dc-section-heading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0 0 1.25rem;
  color: #062f50;
  font-size: 1.35rem;
  font-weight: 700;
}
.dc-section-heading::before {
  content: "";
  width: 2.5rem;
  height: 0.25rem;
  flex: 0 0 auto;
  border-radius: 999px;
  background: #16b8c8;
}
.dc-section-heading i {
  color: #035796;
}
@media (max-width: 599px) {
  .dc-section-heading {
    font-size: 1.2rem;
  }
}

/* Panel (restrained content card) */
.dc-panel {
  overflow: hidden;
  border: 1px solid #dce8f0;
  border-radius: 0.75rem;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(15, 45, 76, 0.06);
}

/* Flat, divider-separated items inside a single section surface (no nested cards) */
.dc-rows {
  padding: 0;
}
.dc-rows__item {
  padding: 1.25rem;
}
.dc-rows__item + .dc-rows__item {
  border-top: 1px solid #dce8f0;
}

/* Compact diver cards: separate surfaces with gap, info on the start, action on the end */
.dc-cards-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.dc-list-card {
  padding: 1rem 1.25rem;
}

.dc-diver-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 1rem 1.25rem;
}

.dc-diver-row__info {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 2.5rem;
  flex: 1 1 auto;
  min-width: 0;
}

.dc-diver-row__action {
  flex: 0 0 auto;
}

@media (max-width: 599px) {
  .dc-diver-row__action {
    width: 100%;
    justify-content: center;
  }
}

.dc-panel-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem 1rem;
  color: #36566e;
  text-align: center;
}
.dc-panel-empty i {
  color: #dce8f0;
  font-size: 2rem;
}
.dc-panel-empty p {
  margin: 0;
}

/* Fields */
.dc-field-label {
  margin-bottom: 0.25rem;
  font-size: 0.75rem;
  color: #36566e;
}
.dc-field-value {
  color: #062f50;
  font-weight: 500;
}

.dc-inline-link {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: #035796;
  text-decoration: none;
}
.dc-inline-link:hover {
  text-decoration: underline;
}

/* Activity chips */
.dc-activity-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.75rem;
  border-radius: 0.5rem;
  background: rgba(2, 87, 150, 0.06);
  color: #36566e;
  font-size: 0.8rem;
  font-weight: 500;
}
.dc-activity-chip i {
  color: rgba(3, 87, 150, 0.8);
  font-size: 0.75rem;
}

/* Empty (used for failed load) */
.dc-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 4rem 1rem;
  color: #36566e;
  text-align: center;
}
.dc-empty > i {
  color: #dce8f0;
  font-size: 2.5rem;
}
.dc-empty__title {
  margin: 0;
  color: #062f50;
  font-size: 1.25rem;
  font-weight: 800;
}

@media (prefers-reduced-motion: reduce) {
  .dc-btn-primary,
  .dc-btn-secondary,
  .dc-btn-danger {
    transition: none;
  }
}
</style>
