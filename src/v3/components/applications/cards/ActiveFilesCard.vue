<template>
  <section v-if="visibleComponent" class="tw-space-y-4" data-step-id="active_files">
    <div class="tw-mb-2 tw-flex tw-items-center tw-justify-between">
      <div class="tw-flex tw-items-center tw-gap-2">
        <i class="pi pi-folder-open tw-text-primary" aria-hidden="true"></i>
        <span class="tw-font-bold tw-text-slate-700 tw-text-xl">{{ t("Current Files") }}</span>
      </div>

      <span
        v-if="activeFiles.length"
        class="tw-inline-flex tw-items-center tw-rounded-full tw-bg-sky-50 tw-px-3 tw-py-1 tw-text-xs tw-font-semibold tw-uppercase tw-tracking-[0.14em] tw-text-sky-700"
      >
        {{ activeFiles.length }} {{ t("available") }}
      </span>
    </div>

    <div v-if="activeFiles.length" class="tw-space-y-4">
      <article
        v-for="file in activeFiles"
        :key="file.id"
        class="tw-group tw-relative tw-overflow-hidden tw-rounded-3xl tw-border tw-border-slate-200 tw-bg-white tw-p-5 tw-shadow-[0_10px_30px_rgba(15,23,42,0.05)] tw-transition-all tw-duration-200 hover:tw-shadow-[0_18px_40px_rgba(14,116,144,0.12)]"
      >
        <div class="tw-absolute tw-top-0 tw-right-0 tw-h-24 tw-w-24 tw-rounded-2xl tw-bg-sky-100/50 tw-blur-2xl"></div>

        <div
          class="tw-relative tw-flex tw-flex-col tw-gap-5 xl:tw-flex-row xl:tw-items-center xl:tw-justify-between"
        >
          <div class="tw-flex tw-flex-1 tw-items-start tw-gap-4">
            <div
              class="tw-flex tw-h-14 tw-w-14 tw-shrink-0 tw-items-center tw-justify-center tw-rounded-2xl tw-bg-slate-50 tw-ring-1 tw-ring-slate-100"
            >
              <a
                :href="fileUrl(file)"
                target="_blank"
                rel="noopener noreferrer"
                class="tw-inline-flex tw-h-full tw-w-full tw-items-center tw-justify-center tw-no-underline"
                :aria-label="t('View File')"
              >
                <i :class="getIconForFile(file)" class="tw-text-2xl" aria-hidden="true"></i>
              </a>
            </div>

            <div class="tw-min-w-0 tw-flex-1">
              <div class="tw-flex tw-flex-wrap tw-items-center tw-gap-2">
                <a
                  :href="fileUrl(file)"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="tw-inline-flex tw-items-center tw-gap-2 tw-text-lg tw-font-semibold tw-text-slate-800 tw-no-underline hover:tw-text-primary"
                >
                  <span class="tw-line-clamp-2">{{ displayName(file) }}</span>
                  <i class="pi pi-eye tw-text-sm tw-text-slate-400" aria-hidden="true"></i>
                </a>
              </div>

              <div class=" tw-flex tw-flex-wrap tw-gap-2.5">
                <div
                  v-if="file.issuance_date"
                  class="tw-inline-flex tw-items-center tw-gap-2 tw-rounded-2xl tw-bg-slate-50 tw-px-3 tw-py-2"
                >
                  <span class="tw-text-[11px] tw-font-semibold tw-uppercase tw-tracking-[0.14em] tw-text-slate-400">
                    {{ t("Issuance Date") }}
                  </span>
                  <span class="tw-text-sm tw-font-medium tw-text-slate-700">
                    {{ file.issuance_date }}
                  </span>
                </div>

                <div
                  v-if="file.expiry_date"
                  class="tw-inline-flex tw-items-center tw-gap-2 tw-rounded-2xl tw-bg-slate-50 tw-px-3 tw-py-2"
                >
                  <span class="tw-text-[11px] tw-font-semibold tw-uppercase tw-tracking-[0.14em] tw-text-slate-400">
                    {{ t("Expiry Date") }}
                  </span>
                  <span class="tw-text-sm tw-font-medium" :class="expiryClass(file.expiry_date)">
                    {{ file.expiry_date }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>

    <div
      v-else
      class="tw-rounded-3xl tw-border tw-border-dashed tw-border-slate-300 tw-bg-slate-50 tw-p-8 tw-text-center"
    >
      <div
        class="tw-mx-auto tw-mb-4 tw-flex tw-h-16 tw-w-16 tw-items-center tw-justify-center tw-rounded-2xl tw-bg-white tw-text-slate-400 tw-shadow-sm"
      >
        <i class="pi pi-folder-open tw-text-3xl" aria-hidden="true"></i>
      </div>
      <h4 class="tw-text-lg tw-font-semibold tw-text-slate-700">
        {{ t("No active files available") }}
      </h4>
      <p class="tw-mx-auto tw-mt-2 tw-max-w-xl tw-text-sm tw-leading-6 tw-text-slate-500">
        {{ t("Approved dive center files will appear here once they exist on the active profile.") }}
      </p>
    </div>
  </section>
</template>

<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useApplicationStore } from "@/v3/composables/application/useApplicationStore.js";
import { buildFileUrl } from "@/v3/utils/fileUrl.js";

const { t } = useI18n();
const store = useApplicationStore();

const activeFiles = computed(() =>
  Array.isArray(store.payload.active_files.value)
    ? store.payload.active_files.value
    : []
);

const visibleComponent = computed(
  () => store.canModifyApplication.value || activeFiles.value.length > 0
);

function displayName(file) {
  return String(file?.name || file?.caption || file?.title || "File").trim();
}

function fileUrl(file) {
  const path = String(file?.path || file?.link || "").trim();

  return buildFileUrl(path);
}

function getIconForFile(file) {
  const mimeType = String(file?.mime_type || file?.type || "").toLowerCase();
  const path = String(file?.path || file?.link || "").toLowerCase();

  if (mimeType.includes("pdf") || path.endsWith(".pdf")) {
    return "fas fa-file-pdf tw-text-red-500";
  }

  if (
    mimeType.startsWith("image/") ||
    /\.(png|jpe?g|gif|webp|svg)$/.test(path)
  ) {
    return "fas fa-file-image tw-text-sky-500";
  }

  return "fas fa-file-lines tw-text-slate-500";
}

function expiryClass(expiryDate) {
  const normalized = String(expiryDate || "").trim();

  if (!normalized) {
    return "tw-text-slate-700";
  }

  const today = new Date().toISOString().slice(0, 10);
  return normalized < today ? "tw-text-red-600" : "tw-text-slate-700";
}
</script>
