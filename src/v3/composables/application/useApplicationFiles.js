// PATH: src/v3/composables/application/useApplicationFiles.js
// TOKEN: COMPOSABLE-APP-FILES-v3-2025-10-20-FINAL

import { ref, nextTick, computed } from "vue";
import { useErrorHandler } from "@/v3/composables/useErrorHandler";
import { useLoading } from "@/v3/composables/useLoading";
import { APPLICATION_CONFIG } from "@/v3/config/application-config";
import { apiGet, apiPost } from "@/v3/services/httpClient.js";

// ────────────────────────────────────────────────────────────────────────────
// API ENDPOINTS
// ────────────────────────────────────────────────────────────────────────────

const GET_APPLICATION_FILES = import.meta.env.VITE_APPLICATION_FILES_GET;
const REMOVE_APPLICATION_FILE = import.meta.env.VITE_APPLICATION_FILES_REMOVE;
const NEW_APPLICATION_FILE = import.meta.env.VITE_APPLICATION_FILES_NEW;

// ────────────────────────────────────────────────────────────────────────────
// COMPOSABLE
// ────────────────────────────────────────────────────────────────────────────

/**
 * File helper for application-specific required/accepted file rules.
 * Pass the configured application type from flow-first resolution.
 * Do not introduce new direct application.purpose dependencies here.
 */
export function useApplicationFiles(appId, applicationType) {
  const { capture } = useErrorHandler();
  const { startLoading, stopLoading } = useLoading();

  // Instance-scoped refs (each component gets its own state)
  const files = ref([]);
  const filesVersion = ref(0); // Version tracker for reactivity

  // ────────────────────────────────────────────────────────────────────────
  // LOAD FILES
  // ────────────────────────────────────────────────────────────────────────

  /**
   * Load all files for an application
   * @returns {Promise<void>}
   */
  async function loadFiles() {
    if (!appId) {
      console.warn("useApplicationFiles.loadFiles: No appId provided");
      return;
    }

    const loadingKey = "files-fetching";

    try {
      startLoading(loadingKey);
      const response = await apiGet(GET_APPLICATION_FILES + appId);
      files.value = Array.isArray(response?.files) ? response.files : [];
      filesVersion.value++; // Trigger computed updates
    } catch (err) {
      capture(err, {
        fallback: "Failed to load application files.",
        context: "useApplicationFiles.loadFiles",
        meta: {
          applicationId: appId,
          applicationType,
          originalError: err?.message,
        },
      });
      files.value = []; // Safe fallback
    } finally {
      stopLoading(loadingKey);
    }
  }

  // ────────────────────────────────────────────────────────────────────────
  // UPLOAD FILE
  // ────────────────────────────────────────────────────────────────────────

  /**
   * Upload a file for an application
   * @param {Object} formData - Form data containing file, type, and optional expire_date
   * @param {File} formData.file - The file to upload
   * @param {string} formData.type - The file type/name
   * @param {string} [formData.expire_date] - Optional expiry date
   * @returns {Promise<Object>} Response from server
   */
  async function uploadFile(formData) {
    const loadingKey = "file-uploading";

    try {
      startLoading(loadingKey);

      if (!appId) {
        throw new Error("Invalid application: No appId provided");
      }

      if (!formData?.file) {
        throw new Error("No file provided");
      }

      if (!formData?.type) {
        throw new Error("File type is required");
      }

      // Build FormData for multipart upload
      const form = new FormData();
      form.append("file", formData.file);
      form.append("caption", formData.type);
      form.append("name", formData.type);

      if (formData?.expire_date) {
        form.append("expiry_on", formData.expire_date);
      }

      const response = await apiPost(NEW_APPLICATION_FILE + appId, form);

      if (response?.file) {
        files.value.push(response.file);
        filesVersion.value++; // Trigger computed updates
      }

      return response;
    } catch (err) {
      capture(err, {
        fallback: "Failed to upload the file.",
        context: "useApplicationFiles.uploadFile",
        meta: {
          applicationId: appId,
          applicationType,
          fileType: formData?.type,
          hasFile: !!formData?.file,
          originalError: err?.message,
        },
      });
      throw err;
    } finally {
      stopLoading(loadingKey);
    }
  }

  // ────────────────────────────────────────────────────────────────────────
  // DELETE FILE
  // ────────────────────────────────────────────────────────────────────────

  /**
   * Delete a file from an application
   * @param {number|string} fileId - The ID of the file to delete
   * @returns {Promise<void>}
   */
  async function deleteFile(fileId) {
    if (!appId) {
      throw new Error("Invalid application: No appId provided");
    }

    if (!fileId) {
      throw new Error("File ID is required");
    }

    const loadingKey = `file-deleting-${fileId}`;

    try {
      startLoading(loadingKey);
      await apiPost(REMOVE_APPLICATION_FILE + fileId);
      files.value = files.value.filter((f) => f.id !== fileId);
      filesVersion.value++; // Trigger computed updates
      await nextTick();
    } catch (err) {
      capture(err, {
        fallback: "Failed to delete file.",
        context: "useApplicationFiles.deleteFile",
        meta: {
          applicationId: appId,
          applicationType,
          fileId,
          originalError: err?.message,
        },
      });
      throw err;
    } finally {
      stopLoading(loadingKey);
    }
  }

  // ────────────────────────────────────────────────────────────────────────
  // CONFIG HELPERS
  // ────────────────────────────────────────────────────────────────────────

  /**
   * Get configuration for application type
   * @returns {Object} Configuration object
   * @private
   */
  function getTypeConfig() {
    const cfg = APPLICATION_CONFIG?.[applicationType];

    if (!cfg) {
      capture(new Error("APPLICATION_CONFIG missing for type"), {
        fallback: "Missing application type config.",
        context: "useApplicationFiles.getTypeConfig",
        meta: { applicationType },
      });
    }

    return cfg || {};
  }

  /**
   * Get required files for application type
   * @returns {string[]} Array of required file names
   * @private
   */
  function getRequiredFiles() {
    const cfg = getTypeConfig();
    return Array.isArray(cfg.requiredFiles) ? cfg.requiredFiles : [];
  }

  /**
   * Get accepted files for application type
   * @returns {string[]} Array of accepted file names
   * @private
   */
  function getAcceptedFiles() {
    const cfg = getTypeConfig();
    return Array.isArray(cfg.acceptedFiles) ? cfg.acceptedFiles : [];
  }

  // ────────────────────────────────────────────────────────────────────────
  // COMPUTED PROPERTIES
  // ────────────────────────────────────────────────────────────────────────

  /**
   * Normalize string for comparison (lowercase, trimmed)
   * @param {string} s - String to normalize
   * @returns {string} Normalized string
   * @private
   */
  const norm = (s) => (typeof s === "string" ? s.trim().toLowerCase() : "");

  /**
   * Get list of missing required files
   * Compares uploaded files against required files from config
   * @returns {string[]} Array of missing required file names
   */
  const missingRequiredFiles = computed(() => {
    // Include filesVersion to ensure reactivity trigger
    const _ = filesVersion.value;

    // Get uploaded file names (normalized)
    const uploaded = files.value
      .map((f) => f?.name ?? f?.caption ?? f?.title ?? f?.key ?? "")
      .map(norm);

    // Get required file names (normalized)
    const required = getRequiredFiles().map(norm);

    // If no required files, nothing is missing
    if (!required.length) {
      return [];
    }

    // Filter required files that are not uploaded
    // Return original (non-normalized) labels for UI display
    return required
      .filter(Boolean)
      .filter((req) => !uploaded.includes(req))
      .map((req) => getRequiredFiles().find((r) => norm(r) === req) || req);
  });

  /**
   * Get list of accepted files for application type
   * @returns {string[]} Array of accepted file names
   */
  const acceptedFiles = computed(() => getAcceptedFiles());

  // ────────────────────────────────────────────────────────────────────────
  // RETURN PUBLIC API
  // ────────────────────────────────────────────────────────────────────────

  return {
    // State
    files,

    // Actions
    loadFiles,
    uploadFile,
    deleteFile,

    // Computed
    missingRequiredFiles,
    acceptedFiles,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// DOCUMENTATION
// ────────────────────────────────────────────────────────────────────────────

/*
LOADING KEYS USED:
==================
- 'files-fetching'           : Loading all files for application
- 'file-uploading'           : Uploading a new file
- 'file-deleting-{fileId}'   : Deleting specific file (granular per file)

USAGE EXAMPLE:
==============
import { useApplicationFiles } from '@/v3/composables/application/useApplicationFiles'

const { 
  files, 
  loadFiles, 
  uploadFile, 
  deleteFile,
  missingRequiredFiles,
  acceptedFiles 
} = useApplicationFiles(applicationId, 'sport-fishing-team')

// Load files on mount
onMounted(async () => {
  await loadFiles()
})

// Upload a file
await uploadFile({
  file: fileObject,
  type: 'Team License',
  expire_date: '2025-12-31'
})

// Delete a file
await deleteFile(fileId)

// Check missing required files
if (missingRequiredFiles.value.length > 0) {
  console.log('Missing:', missingRequiredFiles.value)
}

REACTIVITY:
===========
- Each component instance gets its own isolated state
- filesVersion ref ensures computed properties update correctly
- missingRequiredFiles automatically recalculates when files change
- No need to manually trigger updates

CONFIGURATION:
==============
Files are configured in APPLICATION_CONFIG:

export const APPLICATION_CONFIG = {
  'sport-fishing-team': {
    requiredFiles: [
      'Team License',
      'Insurance Certificate',
      'Captain ID'
    ],
    acceptedFiles: [
      'Team License',
      'Insurance Certificate',
      'Captain ID',
      'Team Photo',
      'Additional Documents',
      'Other'
    ]
  }
}

ERROR HANDLING:
===============
All errors are captured and logged via useErrorHandler
Errors are re-thrown for component-level handling
Failed operations show user-friendly messages

LOADING STATES:
===============
Use with useLoading composable:

import { useLoading } from '@/v3/composables/useLoading'
const { isLoadingKey } = useLoading()

// Check loading states
<div v-if="isLoadingKey('files-fetching')">Loading...</div>
<button :disabled="isLoadingKey('file-uploading')">Upload</button>
<button :disabled="isLoadingKey(`file-deleting-${file.id}`)">Delete</button>
*/
