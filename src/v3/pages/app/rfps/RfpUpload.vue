<template>
  <div class="tw-max-w-4xl tw-mx-auto tw-p-6">
    <div v-if="isLoading" class="tw-text-center tw-py-12">
      <ProgressSpinner style="width: 50px; height: 50px" />
    </div>

    <Message v-else-if="loadFailed" severity="error" :closable="false">
      <div class="tw-flex tw-flex-wrap tw-items-center tw-justify-between tw-gap-3">
        <span>{{ t("Failed to load RFP") }}</span>
        <button type="button" class="tw-font-semibold tw-text-primary" @click="load">
          {{ t("Retry") }}
        </button>
      </div>
    </Message>

    <div v-else class="tw-bg-white tw-rounded-lg tw-shadow-sm tw-p-6">
      <div class="tw-mb-6">
        <div class="tw-flex tw-flex-wrap tw-items-center tw-gap-3 tw-mb-2">
          <h2 class="tw-text-2xl tw-font-bold tw-text-foreground">
            {{ t("Upload New File") }}
          </h2>
          <span
            v-if="activeDefinition && activeDefinition.type !== 'nda'"
            :class="[
              'rfp-badge',
              activeDefinition.required ? 'rfp-badge--required' : 'rfp-badge--open',
            ]"
          >
            {{ activeDefinition.required ? t("Required") : t("Optional") }}
          </span>
        </div>
        <p class="tw-text-gray-600">
          {{ t("Please upload all required files") }}
        </p>
      </div>

      <Message
        v-if="availableFileTypes.length === 0"
        severity="info"
        :closable="false"
      >
        {{ t("This file is not required.") }}
      </Message>

      <MasterForm
        v-else
        :key="formKey"
        ref="formRef"
        :schema="formSchema"
        :initial-values="fileReset"
        @submit="handleSubmit"
        @validity="handleValidity"
        @field-change="handleFieldChange"
      />

      <div class="tw-flex tw-gap-2 tw-items-center tw-justify-end tw-mt-5">
        <RouterLink
          :to="backRoute"
          class="tw-px-4 tw-py-2 tw-bg-gray-100 hover:tw-bg-gray-200 tw-text-gray-700 tw-rounded-lg tw-no-underline tw-transition-colors tw-font-medium"
        >
          {{ t("Cancel") }}
        </RouterLink>
        <button
          v-if="availableFileTypes.length > 0"
          type="button"
          class="tw-px-4 tw-py-2 tw-bg-primary tw-text-white tw-rounded-lg tw-min-w-[100px] disabled:tw-opacity-50 disabled:tw-cursor-not-allowed tw-transition-colors tw-font-medium"
          :disabled="submitting || !isFormValid"
          @click="submitForm"
        >
          <ProgressSpinner
            v-if="submitting"
            style="width: 20px; height: 20px"
            class="tw-inline-block"
          />
          <span v-else>{{ t("Upload") }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { custom, minLength, pipe, string } from "valibot";
import Message from "primevue/message";
import ProgressSpinner from "primevue/progressspinner";
import MasterForm from "@/v3/components/Forms/MasterForm.vue";
import { RFPS_VIEW } from "@/v3/config/apiEndpoints.js";
import {
  buildRfpUploadTypes,
  RFP_FILE_MIME_TYPES,
} from "@/v3/config/rfp-required-files.js";
import { apiGet, apiPost } from "@/v3/services/httpClient.js";
import { useFastUpload } from "@/v3/composables/useFastUpload.js";
import { useErrorHandler } from "@/v3/composables/useErrorHandler.js";
import { useLoading } from "@/v3/composables/useLoading.js";
import { useNotification } from "@/v3/composables/useNotification.js";
import usePageHeading from "@/v3/composables/layout/usePageHeading.js";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const { capture } = useErrorHandler();
const { isLoading, withLoading } = useLoading();
const { error: notifyError, success: notifySuccess } = useNotification();
const { setHeading } = usePageHeading();
const { uploadCandidateFile, uploadOfferFile } = useFastUpload();

const rfpId = computed(() => (route.params.id ? Number(route.params.id) : null));
const backRoute = computed(() => ({
  name: "vendor-rfp-view",
  params: { id: rfpId.value },
}));

const loadFailed = ref(false);
const candidate = ref(null);
const offerRequiredDocuments = ref([]);
// Current offer files: a slot that already reached its file capacity is
// not offered in the type list again. Remove one of its files first.
const offerFiles = ref([]);
const formRef = ref(null);
const formKey = ref(0);
const isFormValid = ref(false);
const submitting = ref(false);

function slotFileCount(slotId) {
  return offerFiles.value.filter(
    (file) =>
      file?.required_document_id != null &&
      Number(file.required_document_id) === Number(slotId)
  ).length;
}

const availableFileTypes = computed(() => {
  const status = String(candidate.value?.status || "");
  return buildRfpUploadTypes(offerRequiredDocuments.value).filter(
    (definition) => {
      if (!definition.visible(status)) return false;
      if (definition.required_document_id != null) {
        const slot = offerRequiredDocuments.value.find(
          (doc) => Number(doc?.id) === definition.required_document_id
        );
        const maxFiles = Number(slot?.max_files) || 0;
        if (maxFiles > 0 && slotFileCount(definition.required_document_id) >= maxFiles) {
          return false;
        }
      }
      return true;
    }
  );
});

// Reverse of the MIME map: highlight the accepted extensions from the
// picker's own accept list.
const EXTENSION_BY_MIME = Object.fromEntries(
  Object.entries(RFP_FILE_MIME_TYPES).map(([code, mime]) => [mime, code])
);

const requestedFileType = computed(() => {
  const value = Array.isArray(route.query.requiredFile)
    ? route.query.requiredFile[0]
    : route.query.requiredFile;
  return typeof value === "string" ? value.trim() : "";
});

// The type the form is currently set to. MasterForm reports selection
// changes through field-change; preselection initializes it.
const selectedType = ref("");

// Replacing this object makes MasterForm's initialValues watcher clear the
// picked file — a file chosen for one slot contract is never carried into
// another type's picker, and a completed upload leaves a clean picker.
const fileReset = ref({ file: null });

function handleFieldChange({ key, value }) {
  if (key !== "type") return;
  const next = typeof value === "string" ? value : "";
  if (next === selectedType.value) return;
  selectedType.value = next;
  fileReset.value = { file: null };
}

const preselectedType = computed(() =>
  availableFileTypes.value.some(
    (definition) => definition.type === requestedFileType.value
  )
    ? requestedFileType.value
    : ""
);

const maxFileSize = computed(() =>
  Math.max(...availableFileTypes.value.map((definition) => definition.maxSize || 0))
);

/**
 * The definition currently selected in the file-type select. Drives the
 * picker's accept list, the format hint, the size limit, and the
 * required/optional badge so each slot advertises only its own contract.
 * Falls back to the first available definition until a type is picked.
 */
const activeDefinition = computed(() => {
  const definitions = availableFileTypes.value;
  if (!definitions.length) return null;
  return (
    definitions.find((definition) => definition.type === selectedType.value) ||
    definitions.find((definition) => definition.type === preselectedType.value) ||
    definitions[0]
  );
});

const activeAccept = computed(() => activeDefinition.value?.accept || "");
const activeMaxSize = computed(
  () => activeDefinition.value?.maxSize || maxFileSize.value
);
const activeDescription = computed(
  () => activeDefinition.value?.description || "PDF file only"
);

/**
 * The file types the selected slot accepts, as display codes. The chips
 * update with the selected file type and always mirror the picker's
 * accept list exactly.
 */
const activeTypeCodes = computed(() => {
  const accept = String(activeAccept.value);
  if (!accept) return [];
  return accept
    .split(",")
    .map((mime) => mime.trim())
    .filter(Boolean)
    .map((mime) => EXTENSION_BY_MIME[mime] || "")
    .filter(Boolean);
});

function acceptsConfiguredFile(file) {
  if (!(file instanceof File)) return false;
  return String(activeAccept.value)
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .some((type) => {
      if (type.startsWith(".")) {
        return String(file.name || "").toLowerCase().endsWith(type.toLowerCase());
      }
      if (type.endsWith("/*")) {
        return String(file.type || "").startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });
}

const formSchema = computed(() => ({
  type: {
    type: "select",
    label: "File Type",
    placeholder: "Choose file type",
    value: preselectedType.value,
    options: availableFileTypes.value.map((definition) => ({
      label: definition.label,
      translateLabel: definition.translateLabel !== false,
      value: definition.type,
    })),
    required: true,
    validation: pipe(string(), minLength(1, "File Type is required")),
  },
  file: {
    type: "file",
    label: "File",
    placeholder: "Choose a file or drag it here",
    value: null,
    required: true,
    attrs: {
      accept: activeAccept.value,
      maxSize: activeMaxSize.value,
      description: t(activeDescription.value),
      typeCodes: activeTypeCodes.value,
    },
    validation: pipe(
      custom((value) => value instanceof File, "File is required"),
      custom(
        (value) => value instanceof File && value.size <= activeMaxSize.value,
        t("File exceeds the allowed size limit")
      ),
      custom(acceptsConfiguredFile, t("File type is not accepted"))
    ),
  },
}));

function handleValidity({ isValid }) {
  isFormValid.value = isValid;
}

function submitForm() {
  formRef.value?.submitForm();
}

async function handleSubmit({ formData }) {
  const definition = availableFileTypes.value.find(
    (item) => item.type === formData.type
  );
  if (!definition || submitting.value) return;

  submitting.value = true;
  try {
    if (definition.type === "nda") {
      // NDA branch: unchanged — one upload, then back to the request page.
      if (!candidate.value?.id) return;
      const upload = await uploadCandidateFile(candidate.value.id, formData.file, {
        accept: definition.accept,
        maxSize: definition.maxSize,
        caption: definition.label,
      });
      const endpoint = definition.uploadEndpoint.replace("{id}", rfpId.value);
      await apiPost(endpoint, { file_id: upload.file_id });
      notifySuccess(t("File uploaded successfully"));
      await router.push(backRoute.value);
      return;
    }

    // Offer branch: the type value is the required-document id (or null
    // for "Other"); after the upload lands, return to the request page so
    // the offer card grid reflects the new file immediately.
    await uploadOfferFile(
      rfpId.value,
      definition.required_document_id ?? "other",
      formData.file
    );
    notifySuccess(t("File uploaded successfully"));
    await router.push(backRoute.value);
  } catch (error) {
    capture(error, {
      context: "RfpUpload.handleSubmit",
      fallback: "Upload failed",
      meta: { rfpId: rfpId.value, fileType: formData.type },
    });
    notifyError(error?.message || t("Upload failed"));
  } finally {
    submitting.value = false;
  }
}

async function load() {
  loadFailed.value = false;
  isFormValid.value = false;
  try {
    await withLoading("vendor-rfp-upload", async () => {
      const endpoint = RFPS_VIEW.replace("{id}", rfpId.value);
      const response = await apiGet(endpoint);
      candidate.value = response?.candidate || null;
      offerRequiredDocuments.value = response?.offer_required_documents ?? [];
      offerFiles.value = response?.offer?.files ?? [];
      // Re-seed the selection from the requested type for the fresh form.
      selectedType.value = "";
      formKey.value += 1;
    });
  } catch (error) {
    loadFailed.value = true;
    candidate.value = null;
    offerRequiredDocuments.value = [];
    offerFiles.value = [];
    capture(error, { context: "RfpUpload.load", fallback: "Failed to load RFP" });
    notifyError(t("Failed to load RFP"));
  }
}

onMounted(() => {
  setHeading({ title: "Upload New File", visible: true });
  load();
});
</script>

<style scoped>
@import url("./rfp-shared.css");
</style>
