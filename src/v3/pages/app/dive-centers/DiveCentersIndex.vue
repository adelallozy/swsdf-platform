<template>
  <div class="tw-container tw-py-8">
    <div class="tw-mb-6 tw-flex tw-items-center tw-justify-between tw-gap-3">
      <p class="tw-text-sm tw-text-slate-500">
        {{ centers.length }} {{ $t("Centers") }}
      </p>

      <router-link
        :to="{ name: 'diving-centers-new-membership' }"
        class="tw-inline-flex tw-items-center tw-gap-2 tw-rounded-xl tw-bg-primary tw-px-4 tw-py-2 tw-text-sm tw-font-semibold !tw-text-white tw-no-underline tw-transition hover:tw-opacity-90"
      >
        <i class="pi pi-plus tw-text-xs !tw-text-white" />
        <span class="!tw-text-white">{{ $t("New Membership") }}</span>
      </router-link>
    </div>

    <div v-if="isLoadingKey('workspace-dive-centers-fetching')" class="tw-flex tw-justify-center tw-py-16">
      <ProgressSpinner />
    </div>

    <div v-else-if="centers.length" class="tw-grid tw-grid-cols-1 tw-gap-4 lg:tw-grid-cols-2">
      <article
        v-for="center in centers"
        :key="center.id"
        class="center-row tw-group tw-relative tw-overflow-hidden tw-rounded-2xl tw-border tw-border-slate-200 tw-bg-white tw-p-5"
      >
        <div class="tw-absolute tw-inset-y-0 tw-start-0 tw-w-2 tw-bg-primary/80" />

        <div class="tw-relative tw-flex tw-items-center tw-justify-between tw-gap-4 tw-ps-3">
          <h2 class="tw-text-lg md:tw-text-xl tw-font-bold tw-leading-tight tw-text-slate-900">
            {{ getCenterName(center) }}
          </h2>

          <RouterLink
            :to="{ name: 'diving-center-show', params: { locale, id: center.id } }"
            class="tw-inline-flex tw-items-center tw-gap-2 tw-rounded-lg tw-border tw-border-primary tw-bg-white tw-px-3 tw-py-2 tw-text-sm tw-font-semibold !tw-text-primary tw-no-underline tw-transition hover:tw-bg-primary hover:!tw-text-white"
          >
            <span>{{ $t("Open Profile") }}</span>
            <i class="pi pi-angle-left tw-text-xs" />
          </RouterLink>
        </div>
      </article>
    </div>

    <div
      v-else
      class="tw-rounded-3xl tw-border tw-border-dashed tw-border-slate-300 tw-bg-slate-50 tw-px-6 tw-py-12 tw-text-center"
    >
      <h2 class="tw-text-lg tw-font-bold tw-text-slate-900">
        {{ $t("No dive centers found") }}
      </h2>
      <p class="tw-mt-2 tw-text-sm tw-text-slate-600">
        {{ $t("You do not have any permitted dive centers yet.") }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import ProgressSpinner from "primevue/progressspinner";
import { DIVING_CENTERS_ADMIN_GET_PERMITTED } from "@/v3/config/apiEndpoints.js";
import { apiGet } from "@/v3/services/httpClient.js";
import { useLoading } from "@/v3/composables/useLoading.js";
import { useNotification } from "@/v3/composables/useNotification.js";
import { useErrorHandler } from "@/v3/composables/useErrorHandler.js";
import usePageHeading from "@/v3/composables/layout/usePageHeading.js";

const centers = ref([]);

const { locale } = useI18n();
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

async function loadCenters() {
  try {
    const response = await withLoading("workspace-dive-centers-fetching", async () => {
      return await apiGet(DIVING_CENTERS_ADMIN_GET_PERMITTED, {
        context: "AppDiveCentersIndex.loadCenters",
      });
    });

    centers.value = Array.isArray(response?.diveCenters) ? response.diveCenters : [];
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
.center-row {
  background: linear-gradient(140deg, #ffffff 0%, #f9fbff 100%);
  transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
}

.center-row:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(2, 87, 150, 0.08);
  border-color: #a4c4f3;
}
</style>
