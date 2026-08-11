<template>
  <div class="dc-page tw-pt-0 tw-pb-8">
    <div class="tw-container">
      <section class="dc-index-content">
        <div class="tw-mb-5 tw-flex tw-flex-wrap tw-items-center tw-gap-4">
          <p class="dc-count">
            {{ $t("Showing") }} <strong>{{ centers.length }}</strong> {{ $t("Centers") }}
          </p>
        </div>

        <div
          v-if="isLoadingKey('workspace-dive-centers-fetching')"
          class="tw-flex tw-justify-center tw-py-16"
          role="status"
        >
          <ProgressSpinner />
        </div>

          <div
            v-else-if="centers.length"
            class="tw-grid tw-grid-cols-1 tw-gap-5 sm:tw-grid-cols-2 lg:tw-grid-cols-3"
          >
            <article
              v-for="center in centers"
              :key="center.id"
              class="dc-card dc-card--clickable"
              role="link"
              tabindex="0"
              :aria-label="$t('Open Profile') + ': ' + getCenterName(center)"
              @click="handleCardClick($event, center)"
              @keydown.enter="openCenterProfile(center)"
              @keydown.space.prevent="openCenterProfile(center)"
            >
            <div class="dc-card__logo">
              <img
                v-if="logoUrl(center) && !failedLogos[center.id]"
                :src="logoUrl(center)"
                :alt="getCenterName(center)"
                loading="lazy"
                class="tw-h-full tw-w-full tw-object-contain"
                @error="failedLogos[center.id] = true"
              />
              <span
                v-else
                class="tw-flex tw-flex-col tw-items-center tw-gap-2 tw-text-xs tw-font-semibold tw-text-[#36566e]"
              >
                <i class="pi pi-building tw-text-2xl tw-text-[#035796]" aria-hidden="true"></i>
                {{ $t("Logo not available") }}
              </span>
            </div>

            <h2 class="dc-card__name" :title="getCenterName(center)">
              {{ getCenterName(center) }}
            </h2>

            <span
              v-if="statusFor(center).text"
              class="dc-card__status"
              :class="statusFor(center).classes"
            >
              <i :class="statusFor(center).icon" aria-hidden="true"></i>
              {{ $t(statusFor(center).text) }}
            </span>

            <div
              v-if="getCity(center) || center.address"
              class="dc-card__location"
            >
              <i class="pi pi-map-marker" aria-hidden="true"></i>
              <span>{{ center.address || getCity(center) }}</span>
            </div>

            <div
              v-if="center.telephone || center.email"
              class="dc-card__contact"
            >
              <a
                v-if="center.telephone"
                :href="'tel:' + center.telephone"
                class="dc-card__contact-link"
              >
                <i class="pi pi-phone" aria-hidden="true"></i>
                <span>{{ center.telephone }}</span>
              </a>
              <a
                v-if="center.email"
                :href="'mailto:' + center.email"
                :title="center.email"
                class="dc-card__contact-link"
              >
                <i class="pi pi-envelope" aria-hidden="true"></i>
                <span class="tw-max-w-[13rem] tw-truncate">{{ center.email }}</span>
              </a>
            </div>

            <p v-if="center.id" class="dc-card__expiry">
              {{ $t("Membership number") }}: {{ center.id }}
            </p>

          </article>

            <RouterLink
              :to="{ name: 'diving-centers-new-membership' }"
              class="dc-add-card"
              :aria-label="$t('New Membership')"
            >
              <span class="dc-add-card__icon" aria-hidden="true">
                <i class="pi pi-plus" />
              </span>
              <span class="dc-add-card__label">{{ $t("New Membership") }}</span>
            </RouterLink>
          </div>

        <div v-else class="dc-empty">
          <i class="pi pi-building" aria-hidden="true"></i>
          <h2 class="dc-empty__title">{{ $t("No dive centers found") }}</h2>
          <p>{{ $t("You do not have any permitted dive centers yet.") }}</p>
          <RouterLink
            :to="{ name: 'diving-centers-new-membership' }"
            class="dc-add-card dc-add-card--empty"
            :aria-label="$t('New Membership')"
          >
            <span class="dc-add-card__icon" aria-hidden="true">
              <i class="pi pi-plus" />
            </span>
            <span class="dc-add-card__label">{{ $t("New Membership") }}</span>
          </RouterLink>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import ProgressSpinner from "primevue/progressspinner";
import { DIVING_CENTERS_ADMIN_GET_PERMITTED } from "@/v3/config/apiEndpoints.js";
import { apiGet } from "@/v3/services/httpClient.js";
import { useLoading } from "@/v3/composables/useLoading.js";
import { useNotification } from "@/v3/composables/useNotification.js";
import { useErrorHandler } from "@/v3/composables/useErrorHandler.js";
import usePageHeading from "@/v3/composables/layout/usePageHeading.js";
import { buildFileUrl } from "@/v3/utils/fileUrl.js";

const centers = ref([]);
const failedLogos = ref({});

const { locale } = useI18n();
const router = useRouter();
const { withLoading, isLoadingKey } = useLoading();
const { error: notifyError } = useNotification();
const { capture } = useErrorHandler();
const { setHeading } = usePageHeading();

function getCenterName(center) {
  if (locale.value === "ar") {
    return center?.name_ar || center?.name || center?.name_en || "";
  }

  return center?.name_en || center?.name || center?.name_ar || "";
}

function getCity(center) {
  if (locale.value === "ar") {
    return center?.city_name_ar || center?.city_name || center?.city_name_en || "";
  }

  return center?.city_name_en || center?.city_name || center?.city_name_ar || "";
}

function logoUrl(center) {
  return buildFileUrl(center?.logo || center?.active_logo_file?.path);
}

function openCenterProfile(center) {
  router.push({
    name: "diving-center-show",
    params: { locale: locale.value, id: center.id },
  });
}

function handleCardClick(event, center) {
  if (event.target.closest("a, button")) {
    return;
  }

  openCenterProfile(center);
}

function statusFor(center) {
  const status = String(center?.membership_status || "").trim().toLowerCase();
  if (status === "valid") {
    return {
      text: "Valid",
      classes: "dc-card__status--valid",
      icon: "pi pi-shield",
    };
  }
  if (["expired", "invalid", "temporary pending"].includes(status)) {
    return {
      text: center?.membership_status || "Invalid",
      classes: "dc-card__status--invalid",
      icon: "pi pi-exclamation-triangle",
    };
  }
  if (!status) {
    return { text: "", classes: "", icon: "" };
  }
  return {
    text: center.membership_status,
    classes: "dc-card__status--other",
    icon: "pi pi-info-circle",
  };
}

async function loadCenters() {
  try {
    const response = await withLoading("workspace-dive-centers-fetching", async () => {
      return await apiGet(DIVING_CENTERS_ADMIN_GET_PERMITTED, {
        context: "AppDiveCentersIndex.loadCenters",
      });
    });

    centers.value = Array.isArray(response?.diveCenters) ? response.diveCenters : [];
    failedLogos.value = {};
  } catch (error) {
    centers.value = [];
    notifyError("Failed to load dive centers");
    capture(error, {
      context: "AppDiveCentersIndex.loadCenters",
      fallback: "Failed to load dive centers",
    });
  }
}

onMounted(async () => {
  setHeading({
    title: "Dive Centers",
    visible: true,
  });

  await loadCenters();
});
</script>

<style scoped>
.dc-page {
  min-height: 50vh;
}

.dc-index-content {
  width: 100%;
  max-width: 72rem;
  margin-inline: auto;
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

.dc-count {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
  color: #36566e;
  font-size: 0.9rem;
}
.dc-count::before {
  content: "";
  width: 2rem;
  height: 0.25rem;
  flex: 0 0 auto;
  border-radius: 999px;
  background: #16b8c8;
}

.dc-count strong {
  color: #062f50;
  font-weight: 800;
}

/* Primary action (teal→blue SWSDF) */
.dc-btn-primary {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  gap: 0.5rem;
  border-radius: 0.75rem;
  background: #035796;
  color: #ffffff !important;
  padding: 0.75rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 700;
  text-decoration: none !important;
  transition: background-color 150ms ease, box-shadow 150ms ease;
}
.dc-btn-primary:hover {
  background: #034d86;
  color: #ffffff !important;
  box-shadow: 0 10px 25px rgba(3, 87, 150, 0.2);
}
.dc-btn-primary:focus-visible {
  outline: 3px solid rgba(69, 213, 223, 0.55);
  outline-offset: 3px;
}

/* Directory card (adapted from public .public-directory-card) */
.dc-card {
  position: relative;
  display: flex;
  height: 100%;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  border: 1px solid #dce8f0;
  border-radius: 0.75rem;
  background: #f8fbfd;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 1px 3px rgba(15, 45, 76, 0.08);
  transition: transform 300ms ease, border-color 300ms ease, box-shadow 300ms ease;
}

.dc-card::after {
  position: absolute;
  content: "";
  inset: -30%;
  background:
    radial-gradient(60% 40% at 50% 20%, rgba(22, 184, 200, 0.1), transparent 60%),
    radial-gradient(55% 35% at 80% 80%, rgba(3, 87, 150, 0.08), transparent 60%);
  opacity: 0;
  pointer-events: none;
  transition: opacity 280ms ease;
}

.dc-card > * {
  position: relative;
  z-index: 1;
}

.dc-card:hover,
.dc-card:focus-within {
  border-color: rgba(22, 184, 200, 0.4);
  box-shadow: 0 14px 32px rgba(15, 45, 76, 0.13);
  transform: translateY(-4px);
}

.dc-card--clickable {
  cursor: pointer;
}

.dc-card--clickable:focus-visible {
  outline: 3px solid rgba(22, 184, 200, 0.45);
  outline-offset: 3px;
}

.dc-card:hover::after,
.dc-card:focus-within::after {
  opacity: 1;
}

.dc-card__logo {
  display: flex;
  height: 9rem;
  width: 100%;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.dc-card__name {
  margin: 0.75rem 0 0;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #062f50;
  font-size: 1.125rem;
  font-weight: 700;
  transition: color 150ms ease;
}

.dc-card__status {
  margin-top: 0.5rem;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  border-radius: 9999px;
  border: 1px solid;
  padding: 0.25rem 0.625rem;
  font-size: 11px;
  font-weight: 600;
}
.dc-card__status--valid {
  background: #ecfdf5;
  color: #047857;
  border-color: #a7f3d0;
}
.dc-card__status--invalid {
  background: #fef2f2;
  color: #b91c1c;
  border-color: #fecaca;
}
.dc-card__status--other {
  background: #fffbeb;
  color: #b45309;
  border-color: #fde68a;
}

.dc-card__location {
  margin-top: 0.75rem;
  display: flex;
  min-height: 1.75rem;
  align-items: center;
  gap: 0.4rem;
  color: #36566e;
  font-size: 0.75rem;
}
.dc-card__location i {
  color: #16b8c8;
}

.dc-card__contact {
  margin-top: 0.75rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
}
.dc-card__contact-link {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  border-radius: 0.5rem;
  background: #ffffff;
  padding: 0.375rem 0.5rem;
  font-size: 11px;
  font-weight: 500;
  color: #36566e;
  box-shadow: 0 0 0 1px #dce8f0;
  text-decoration: none;
  transition: color 150ms ease;
}
.dc-card__contact-link:hover {
  color: #035796;
}
.dc-card__contact-link:focus-visible {
  outline: 3px solid rgba(22, 184, 200, 0.45);
  outline-offset: 2px;
}
.dc-card__contact-link i {
  font-size: 0.75rem;
  color: #16b8c8;
}

.dc-card__expiry {
  margin: 0.75rem 0 0;
  font-size: 0.75rem;
  color: #36566e;
}

.dc-card__actions {
  margin-top: auto;
  width: 100%;
  padding-top: 1.15rem;
}

/* One add surface at the same level as the directory items. */
.dc-add-card {
  display: flex;
  min-height: 18rem;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  border: 2px dashed #cbd8e6;
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.72);
  color: #36566e !important;
  text-decoration: none !important;
  transition: border-color 150ms ease, background-color 150ms ease, color 150ms ease;
}
.dc-add-card:hover,
.dc-add-card:focus-visible {
  border-color: #16b8c8;
  background: #ffffff;
  color: #035796 !important;
}
.dc-add-card:focus-visible {
  outline: 3px solid rgba(22, 184, 200, 0.4);
  outline-offset: 3px;
}
.dc-add-card__icon {
  display: inline-flex;
  width: 3.5rem;
  height: 3.5rem;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: #eef4f9;
  color: #36566e;
  font-size: 1.5rem;
  transition: background-color 150ms ease, color 150ms ease;
}
.dc-add-card:hover .dc-add-card__icon,
.dc-add-card:focus-visible .dc-add-card__icon {
  background: #e5f9fb;
  color: #035796;
}
.dc-add-card__label {
  font-size: 1.05rem;
  font-weight: 600;
}
.dc-add-card--empty {
  width: min(100%, 48rem);
  margin: 0 auto 2rem;
}

/* Empty state (adapted from .public-directory-empty) */
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
.dc-empty p {
  margin: 0;
}
.dc-empty__cta {
  display: inline-flex;
  height: 3rem;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid #dce8f0;
  border-radius: 9999px;
  background: #ffffff;
  color: #062f50 !important;
  font-size: 0.9rem;
  font-weight: 600;
  padding-inline: 1.5rem;
  text-decoration: none !important;
  transition: border-color 150ms ease, box-shadow 150ms ease;
}
.dc-empty__cta:hover {
  border-color: #16b8c8;
  box-shadow: 0 0 0 4px rgba(22, 184, 200, 0.12);
}
.dc-empty__cta:focus-visible {
  outline: 3px solid rgba(22, 184, 200, 0.4);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  .dc-card,
  .dc-card::after {
    transition: none;
  }
  .dc-card:hover,
  .dc-card:focus-within {
    transform: none;
  }
  .dc-btn-primary,
  .dc-empty__cta,
  .dc-add-card,
  .dc-add-card__icon {
    transition: none;
  }
}
</style>
