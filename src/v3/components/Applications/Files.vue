<!-- src/v3/components/Applications/Files.vue -->
<template>
  <template v-if="!loading">
    <h3 class="tw-text-foreground tw-font-bold tw-text-xl tw-mb-1">{{ $t("Attachments") }}</h3>

    <!-- Grid of Uploaded + Required Files -->
    <div
      class="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-3 xl:tw-grid-cols-4 tw-gap-4 tw-mt-4"
    >
      <!-- Missing Required File Cards -->
      <template v-if="canModifyApplication">
        <MissingRequiredFileCard
          v-for="name in missingRequiredFiles"
          :key="'required-' + name"
          :name="name"
        />
      </template>

      <!-- Uploaded File Cards -->
      <UploadedFileCard
        v-for="file in files"
        :key="file.id"
        :file="file"
        :canDelete="canModifyApplication"
        @delete-file="openDeleteModal(file)"
          />

      <!-- Add New File Button (if all required files are uploaded) -->
      <template v-if="!missingRequiredFiles.length && canModifyApplication">
        <div
          class="tw-border-2 tw-border-dashed tw-border-gray-300 tw-rounded-2xl tw-p-6 tw-flex tw-flex-col tw-items-center tw-justify-center tw-h-full tw-cursor-pointer hover:tw-shadow-md tw-transition"
          @click="$router.push({ name: 'add-new-file' })"
        >
          <div class="tw-w-16 tw-h-16 tw-flex tw-items-center tw-justify-center tw-bg-blue-100 tw-rounded-full tw-mb-4">
            <i class="pi pi-plus tw-text-2xl"></i>
          </div>
          <h4 class="tw-font-semibold tw-text-lg">{{ $t("Add File") }}</h4>

          <div v-if="!files.length" class="tw-mt-4 tw-w-full tw-flex  tw-flex-col  tw-items-center tw-gap-3  tw-text-red-700  tw-rounded-xl tw-px-3 tw-py-3">
            <i class="pi pi-exclamation-triangle tw-text-2xl"></i>
            <span class="tw-font-bold tw-text-base md:tw-text-lg">{{ $t('At least one file is required') }}</span>
          </div>
        </div>
      </template>
    </div>

    <!-- No Files Message -->
    <div v-if="!files.length && !canModifyApplication" class="tw-text-center tw-py-8 tw-text-gray-500">
      <i class="fas fa-file-alt tw-text-3xl tw-mb-2"></i>
      <p>{{ $t("No attachments uploaded") }}</p>
    </div>

    <!-- Delete Modal -->
    <Teleport to="body">
      <BaseModal v-if="openModal && itemToDelete" @close="openModal = false">
        <div class="tw-min-w-[300px] tw-text-center">
          <i class="fas fa-trash tw-text-red-500 tw-text-3xl tw-mb-5"></i>
          <h3 class="tw-font-bold tw-text-lg">{{ $t("areYouSureToDelete") }}</h3>
          <p class="tw-text-red-500 tw-mb-5">{{ $t("byDoingThatYouCantBack") }}</p>
          <input-button
            :loading="btnLoading"
            class="base-btn tw-mx-auto tw-mt-5 tw-bg-red-500"
            @click="confirmDelete"
            name="delete"
          />
        </div>
      </BaseModal>
    </Teleport>
</template>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import BaseModal from "@/website/components/base/BaseModal.vue"; 
import UploadedFileCard from "@/v3/components/Applications/UploadedFileCard.vue";
import MissingRequiredFileCard from "@/v3/components/Applications/MissingRequiredFileCard.vue";
import { useApplicationStore } from "@/v3/composables/useApplicationStore";
import { useApplicationFiles } from "@/v3/composables/application/useApplicationFiles";
import { useErrorHandler } from '@/v3/composables/useErrorHandler';


const props = defineProps({
  applicationId: {
    type: [String, Number],
    required: true
  },
  // ...other existing props like canEdit, etc.
})

const { capture } = useErrorHandler();

const { application, canModifyApplication } = useApplicationStore();

const {
  files,
  loading,
  loadFiles,
  deleteFile,
  missingRequiredFiles, // Destructure the computed property 
} = useApplicationFiles(application.value?.id, application.value?.purpose);
 
loadFiles();

// Modal controls
const openModal = ref(false);
const itemToDelete = ref(null);
const btnLoading = ref(false);
function openDeleteModal(file) {
  if (!canModifyApplication) return;
  itemToDelete.value = file;
  openModal.value = true;
}

async function confirmDelete() {
  if (!canModifyApplication || !application.value?.id) throw new Error('Not allowed to delete files.');

  btnLoading.value = true;
  
  try {
      await deleteFile(itemToDelete.value.id);
    loadFiles(); // Reload files to update missing required files list
  } catch (err) {
    capture(err, {
      context: 'File deletion',
        fallback: 'Unable to delete the attached file. Please try again.',
        meta: { 
        fileId: itemToDelete.value.id,
        applicationId: application.value.id
        }
      });
  } finally {
    btnLoading.value = false;
    openModal.value = false;
    itemToDelete.value = null;
  }
}
</script>

<style scoped>
.tw-line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

