<!-- VERSION: 2.1.0 -->
<!-- FILE: src/v3/components/applications/cards/FilesCard.vue -->
<!-- Self-validating card that reads from centralized store -->

<template>
  <div class="tw-space-y-4" data-step-id="files">
    <h3 class="tw-text-foreground tw-font-bold tw-text-xl tw-mb-1">
      {{ t("Attachments") }}
    </h3>

    <!-- Loading State -->
    <div v-if="isLoadingKey('files')" class="tw-text-center tw-py-8">
      <ProgressSpinner style="width: 50px; height: 50px" />
    </div>

    <!-- Grid of Uploaded + Required Files -->
    <div
      v-else
      class="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-3 xl:tw-grid-cols-4 tw-gap-4"
    >
      <!-- Missing Required File Cards -->
      <template v-if="canEdit">
        <MissingRequiredFileCard
          v-for="name in missingRequiredFiles"
          :key="'required-' + name"
          :name="name"
          :applicationId="store.application.value.id"
        />
      </template>

      <!-- Uploaded File Cards -->
      <UploadedFileCard
        v-for="file in store.payload.files.value"
        :key="file.id"
        :file="file"
        :canDelete="canDeleteFile(file)"
        :deleting="isLoadingKey(`file-deleting-${file.id}`)"
        @delete-file="confirmDeleteFile(file)"
      />

      <!-- Add New File Button (if all required files are uploaded) -->
      <template v-if="!missingRequiredFiles.length && canEdit">
        <router-link
          :to="{
            name: 'application-file-upload',
            params: { 
              locale: $route.params.locale, 
              appId: store.application.value.id
            }
          }"
          class="tw-border-2 tw-border-dashed tw-border-gray-300 tw-rounded-2xl tw-p-6 tw-flex tw-flex-col tw-items-center tw-justify-center tw-h-full tw-cursor-pointer hover:tw-shadow-md tw-transition tw-no-underline"
        >
          <div
            class="tw-w-16 tw-h-16 tw-flex tw-items-center tw-justify-center tw-bg-blue-100 tw-rounded-full tw-mb-4"
          >
            <i class="pi pi-plus tw-text-2xl tw-text-blue-600"></i>
          </div>
          <h4 class="tw-font-semibold tw-text-lg tw-text-foreground">
            {{ t("Add File") }}
          </h4>

          <!-- <div
            v-if="!store.payload.files.value.length"
            class="tw-mt-4 tw-w-full tw-flex tw-flex-col tw-items-center tw-gap-3 tw-text-red-700 tw-rounded-xl tw-px-3 tw-py-3"
          >
            <i class="pi pi-exclamation-triangle tw-text-2xl"></i>
            <span class="tw-font-bold tw-text-base md:tw-text-lg tw-text-center">
              {{ t("At least one file is required") }}
            </span>
          </div> -->
        </router-link>
      </template>
    </div>

    <!-- No Files Message (View Mode) -->
    <div
      v-if="!isLoadingKey('files') && !store.payload.files.value.length && !canEdit"
      class="tw-text-center tw-py-8 tw-text-gray-500"
    >
      <i class="pi pi-file tw-text-3xl tw-mb-2"></i>
      <p>{{ t("No attachments uploaded") }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, onBeforeUnmount } from "vue";
import { useConfirm } from "primevue/useconfirm";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import ProgressSpinner from "primevue/progressspinner";
import UploadedFileCard from "@/v3/components/applications/UploadedFileCard.vue";
import MissingRequiredFileCard from "@/v3/components/applications/MissingRequiredFileCard.vue";
import { useApplicationStore } from "@/v3/composables/application/useApplicationStore.js";
import { useFilesApi } from "@/v3/composables/application/useFilesApi.js";
import { useErrorHandler } from "@/v3/composables/useErrorHandler.js";
import { useLoading } from "@/v3/composables/useLoading.js";
import { getRequiredFiles as getConfiguredRequiredFiles } from "@/v3/config/application-config.js";

// ────────────────────────────────────────────────────────────────────────────
// NO PROPS - Everything from store
// ────────────────────────────────────────────────────────────────────────────

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const { capture } = useErrorHandler();
const { isLoadingKey } = useLoading();
const confirm = useConfirm();
const store = useApplicationStore();
const filesApi = useFilesApi();

// ────────────────────────────────────────────────────────────────────────────
// DATA FROM STORE
// ────────────────────────────────────────────────────────────────────────────

const canEdit = computed(() => store.canModifyApplication.value);
const requiredFileTypes = computed(() =>
  Array.from(
    new Set([
      ...getConfiguredRequiredFiles(store.applicationType.value, store.payload),
      ...store.runtimeRequiredFiles.value,
    ])
  )
);

/**
 * Normalize string for comparison (lowercase, trimmed)
 */
const norm = (s) => (typeof s === "string" ? s.trim().toLowerCase() : "");

// ────────────────────────────────────────────────────────────────────────────
// MISSING REQUIRED FILES
// ────────────────────────────────────────────────────────────────────────────

const missingRequiredFiles = computed(() => {
  // Get uploaded file names (normalized)
  const uploaded = [
    ...(Array.isArray(store.payload.files.value) ? store.payload.files.value : []),
    ...(Array.isArray(store.payload.active_files.value)
      ? store.payload.active_files.value
      : []),
  ]
    .map((f) => f?.name ?? f?.caption ?? f?.title ?? f?.key ?? "")
    .map(norm);

  // Get required file names (normalized)
  const requiredFiles = requiredFileTypes.value || [];
  const required = requiredFiles.map(norm);

  // If no required files configured, nothing is missing
  if (!required.length) {
    return [];
  }

  // Filter required files that are not uploaded
  // Return original (non-normalized) labels for UI display
  return required
    .filter(Boolean)
    .filter((req) => !uploaded.includes(req))
    .map((req) => requiredFiles.find((fileName) => norm(fileName) === req) || req);
});

// ────────────────────────────────────────────────────────────────────────────
// VALIDATION (vErrors pattern)
// ────────────────────────────────────────────────────────────────────────────

const vErrors = computed(() => {
  const errors = {};

  // Rule 1: At least one file is required
  // if (!store.payload.files.value || store.payload.files.value.length === 0) {
  //   errors.required = t("At least one file is required");
  // }

  // Rule 2: All required files must be uploaded
  if (missingRequiredFiles.value.length > 0) {
    errors.missingRequired = t("Please upload all required files");
  }

  return errors;
});

// ────────────────────────────────────────────────────────────────────────────
// WATCH VALIDATION & REPORT TO STORE
// ────────────────────────────────────────────────────────────────────────────

watch(
  vErrors,
  (errors) => {
    if (Object.keys(errors).length > 0) {
      store.setStepError("files", errors);
    } else {
      store.deleteStepError("files");
    }
  },
  { immediate: true, deep: true }
);

function navigateToUpload() {
  router.push({
    name: "application-file-upload",
    params: {
      locale: route.params.locale,
      appId: store.application.value.id,
    },
  });
}

store.registerStepPrimaryAction("files", navigateToUpload);

// ────────────────────────────────────────────────────────────────────────────
// DELETE FILE
// ────────────────────────────────────────────────────────────────────────────

function confirmDeleteFile(file) {
  if (!canDeleteFile(file)) {
    return;
  }

  confirm.require({
    message: t("Are you sure you want to delete this file? This action cannot be undone."),
    header: t("Confirm Deletion"),
    icon: "pi pi-exclamation-triangle",
    severity: "danger",
    acceptLabel: t("Delete"),
    rejectLabel: t("Cancel"),
    acceptClass: "p-button-danger",
    accept: () => handleDeleteFile(file),
  });
}

async function handleDeleteFile(file) {
  if (!canDeleteFile(file)) return;

  try {
    await filesApi.deleteFile(file.id);
    // Reload entire payload to refresh files + recalculate validation
    await store.reloadApplicationPayload();
  } catch (err) {
    capture(err, {
      context: "FilesCard.handleDeleteFile",
      fallback: t("Unable to delete the file. Please try again."),
      meta: {
        fileId: file.id,
        applicationId: store.application.value.id,
      },
    });
  }
}

function canDeleteFile(file) {
  return canEdit.value && file?.can_delete !== false;
}

// ────────────────────────────────────────────────────────────────────────────
// CLEANUP
// ────────────────────────────────────────────────────────────────────────────

onBeforeUnmount(() => {
  store.unregisterStepPrimaryAction("files");
  store.deleteStepError("files");
});
</script>

<!--
VERSION: 2.1.0

CHANGES IN v2.1.0:
==================
- Moved to: src/v3/components/applications/cards/FilesCard.vue
- Removed canEdit prop (now from store.canModifyApplication)
- Added useRoute import for $route access
- Component is now completely self-contained (zero props)

ARCHITECTURE NOTES:
===================
- NO PROPS - Everything from store
- Reads from: store.payload.files
- Edit permission: store.canModifyApplication
- Validates: (1) At least one file required, (2) All required files uploaded
- Reports: setStepError('files', errors) / deleteStepError('files')
- Step identifier: 'files'
- Uses: useFilesApi for API calls (no state management)
- Uses: isLoadingKey from useLoading
- Reloads: store.reloadApplicationPayload() after delete
- Config: Reads requiredFiles from APPLICATION_CONFIG[applicationType]

LOADING KEYS:
=============
- files (managed by store)
- file-deleting-{id} (managed by filesApi)

VALIDATION RULES:
=================
- At least 1 file required
- All required files from config must be uploaded
- Missing required files tracked via APPLICATION_CONFIG

REQUIRED FILES LOGIC:
=====================
- Reads from APPLICATION_CONFIG[applicationType].requiredFiles
- Compares uploaded files (by name/caption/title/key) with required files
- Shows MissingRequiredFileCard for each missing required file
- Normalized comparison (case-insensitive, trimmed)

USAGE:
======
<FilesCard />

No props needed! Component gets everything from store.
-->
