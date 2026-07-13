<!-- src/v3/components/Applications/Files.vue -->
<template>
  <div class="tw-space-y-4">
    <h3 class="tw-text-foreground tw-font-bold tw-text-xl tw-mb-1">
      {{ t("Attachments") }}
    </h3>

    <!-- Loading State -->
    <div v-if="isLoadingKey('files-fetching')" class="tw-text-center tw-py-8">
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
          :applicationId="applicationId"
        />
      </template>

      <!-- Uploaded File Cards -->
      <UploadedFileCard
        v-for="file in files"
        :key="file.id"
        :file="file"
        :canDelete="canEdit"
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
              applicationId: applicationId 
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

          <div
            v-if="!files.length"
            class="tw-mt-4 tw-w-full tw-flex tw-flex-col tw-items-center tw-gap-3 tw-text-red-700 tw-rounded-xl tw-px-3 tw-py-3"
          >
            <i class="pi pi-exclamation-triangle tw-text-2xl"></i>
            <span class="tw-font-bold tw-text-base md:tw-text-lg tw-text-center">
              {{ t("At least one file is required") }}
            </span>
          </div>
        </router-link>
      </template>
    </div>

    <!-- No Files Message (View Mode) -->
    <div
      v-if="!isLoadingKey('files-fetching') && !files.length && !canEdit"
      class="tw-text-center tw-py-8 tw-text-gray-500"
    >
      <i class="pi pi-file tw-text-3xl tw-mb-2"></i>
      <p>{{ t("No attachments uploaded") }}</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useConfirm } from "primevue/useconfirm";
import ProgressSpinner from "primevue/progressspinner";
import UploadedFileCard from "@/v3/components/applications/UploadedFileCard.vue";
import MissingRequiredFileCard from "@/v3/components/applications/MissingRequiredFileCard.vue";
import { useApplicationFiles } from "@/v3/composables/application/useApplicationFiles";
import { useErrorHandler } from "@/v3/composables/useErrorHandler";
import { useLoading } from "@/v3/composables/useLoading";
import { useI18n } from 'vue-i18n'

const props = defineProps({
  applicationId: {
    type: [String, Number],
    required: true,
  },
  // Deprecated for new v3 work. Pass a flow-resolved configured application type
  // instead of a raw application.purpose value whenever this legacy component is touched.
  purpose: {
    type: String,
    required: true,
  },
  canEdit: {
    type: Boolean,
    default: false,
  },
});
const { te, t } = useI18n()
const { capture } = useErrorHandler();
const { isLoadingKey } = useLoading();
const confirm = useConfirm();

const { files, loadFiles, deleteFile, missingRequiredFiles } = useApplicationFiles(
  props.applicationId,
  props.purpose
);

// ────────────────────────────────────────────────────────────────────────────
// DELETE CONFIRMATION
// ────────────────────────────────────────────────────────────────────────────

function confirmDeleteFile(file) {
  confirm.require({
    message: t("Are you sure you want to delete this file? This action cannot be undone."),
    header: t("Confirm Deletion"),
    icon: 'pi pi-exclamation-triangle',
    severity: 'danger',
    acceptLabel: 'Delete',
    rejectLabel: 'Cancel',
    acceptClass: "p-button-danger",
    accept: () => handleDeleteFile(file),
  });
}

async function handleDeleteFile(file) {
  if (!props.canEdit) return;

  try {
    await deleteFile(file.id);
    await loadFiles(); // Reload to update missing required files
  } catch (err) {
    capture(err, {
      context: "Files.handleDeleteFile",
      fallback: "Unable to delete the file. Please try again.",
      meta: {
        fileId: file.id,
        applicationId: props.applicationId,
      },
    });
  }
}

// ────────────────────────────────────────────────────────────────────────────
// LIFECYCLE
// ────────────────────────────────────────────────────────────────────────────

onMounted(async () => {
  try {
    await loadFiles();
  } catch (err) {
    // 404 = no files yet, that's ok
    if (err.status !== 404) {
      capture(err, {
        context: "Files.onMounted",
        fallback: "Failed to load files",
      });
    }
  }
});
</script>

<!--
LOADING KEYS USED:
- files-fetching (load all files)
- file-deleting-{id} (granular delete for each file)

USAGE:
<Files
  :applicationId="application.id"
  :purpose="application.purpose"  // Deprecated legacy prop; prefer a flow-resolved type
  :canEdit="canModifyApplication"
/>
-->
