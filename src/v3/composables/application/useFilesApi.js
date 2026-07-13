// VERSION: 1.0.0
// PATH: src/v3/composables/application/useFilesApi.js

import { useLoading } from "@/v3/composables/useLoading";
import { useErrorHandler } from "@/v3/composables/useErrorHandler";
import { apiDelete, apiGet, apiPost } from "@/v3/services/httpClient.js";
import {
  APPLICATION_FILES_CREATE,
  APPLICATION_FILES_DELETE,
  APPLICATION_FILES_GET,
} from "@/v3/config/apiEndpoints.js";

// ────────────────────────────────────────────────────────────────────────────
// API ENDPOINTS
// ────────────────────────────────────────────────────────────────────────────

const GET_APPLICATION_FILES = APPLICATION_FILES_GET;
const REMOVE_APPLICATION_FILE = APPLICATION_FILES_DELETE;
const NEW_APPLICATION_FILE = APPLICATION_FILES_CREATE;

// ────────────────────────────────────────────────────────────────────────────
// COMPOSABLE (Pure API - NO State Management)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Pure API composable for file operations
 * NO state management - returns data to caller
 * All methods use withLoading() for loading states
 */
export function useFilesApi() {
  const { capture } = useErrorHandler();
  const { withLoading } = useLoading();

  // ────────────────────────────────────────────────────────────────────────
  // LOAD FILES
  // ────────────────────────────────────────────────────────────────────────

  /**
   * Load all files for an application
   * @param {string|number} appId - Application ID
   * @returns {Promise<Array>} Array of file objects
   */
  async function loadFiles(appId) {
    if (!appId) {
      console.warn("useFilesApi.loadFiles: No appId provided");
      return [];
    }

    return await withLoading("files", async () => {
      try {
        const response = await apiGet(GET_APPLICATION_FILES + appId);
        return Array.isArray(response?.files) ? response.files : [];
      } catch (err) {
        capture(err, {
          fallback: "Failed to load application files.",
          context: "useFilesApi.loadFiles",
          meta: {
            applicationId: appId,
            originalError: err?.message,
          },
        });
        // Return empty array on error instead of throwing
        return [];
      }
    });
  }

  // ────────────────────────────────────────────────────────────────────────
  // UPLOAD FILE
  // ────────────────────────────────────────────────────────────────────────

  /**
   * Upload a file for an application
   * @param {string|number} appId - Application ID
   * @param {Object} formData - Form data containing file, type, and optional expire_date
   * @param {File} formData.file - The file to upload
   * @param {string} formData.type - The file type/name
   * @param {string} [formData.expire_date] - Optional expiry date
   * @returns {Promise<Object>} Response from server with uploaded file
   */
  async function uploadFile(appId, formData) {
    return await withLoading("file-uploading", async () => {
      try {
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
        form.append("name", formData.type);

        if (formData?.expire_date) {
          form.append("expiry_date", formData.expire_date);
        }

        const response = await apiPost(NEW_APPLICATION_FILE + appId, form);
        return response;
      } catch (err) {
        capture(err, {
          fallback: "Failed to upload the file.",
          context: "useFilesApi.uploadFile",
          meta: {
            applicationId: appId,
            fileType: formData?.type,
            hasFile: !!formData?.file,
            originalError: err?.message,
          },
        });
        throw err; // Re-throw for component handling
      }
    });
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
    if (!fileId) {
      throw new Error("File ID is required");
    }

    return await withLoading(`file-deleting-${fileId}`, async () => {
      try {
        await apiDelete(REMOVE_APPLICATION_FILE + fileId);
      } catch (err) {
        capture(err, {
          fallback: "Failed to delete file.",
          context: "useFilesApi.deleteFile",
          meta: {
            fileId,
            originalError: err?.message,
          },
        });
        throw err; // Re-throw for component handling
      }
    });
  }

  // ────────────────────────────────────────────────────────────────────────
  // RETURN PUBLIC API
  // ────────────────────────────────────────────────────────────────────────

  return {
    loadFiles,
    uploadFile,
    deleteFile,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// DOCUMENTATION
// ────────────────────────────────────────────────────────────────────────────

/*
VERSION: 1.0.0

ARCHITECTURE NOTES:
===================
- Pure API composable (NO state management)
- Returns data to caller
- All methods use withLoading() for loading states
- Follows Sport Fishing Competition architecture pattern

LOADING KEYS USED:
==================
- 'files'                    : Loading all files for application
- 'file-uploading'           : Uploading a new file
- 'file-deleting-{fileId}'   : Deleting specific file (granular per file)

USAGE EXAMPLE (with store):
============================
import { useFilesApi } from '@/v3/composables/application/useFilesApi';
import { useApplicationStore } from '@/v3/composables/application/useApplicationStore';

const store = useApplicationStore();
const filesApi = useFilesApi();

// Load files (store will handle this via loadApplicationData)
const files = await filesApi.loadFiles(applicationId);
store.payload.files.value = files;

// Upload a file
const response = await filesApi.uploadFile(applicationId, {
  file: fileObject,
  type: 'Team License',
  expire_date: '2025-12-31'
});

// Reload payload after upload
await store.reloadApplicationPayload();

// Delete a file
await filesApi.deleteFile(fileId);

// Reload payload after delete
await store.reloadApplicationPayload();

ERROR HANDLING:
===============
- All errors are captured and logged via useErrorHandler
- uploadFile() and deleteFile() re-throw errors for component handling
- loadFiles() returns empty array [] on error (doesn't throw)

DIFFERENCES FROM useApplicationFiles:
======================================
OLD (useApplicationFiles):
- Has instance-scoped refs (state management)
- Each component gets its own state
- Methods don't require appId parameter
- Returns computed properties (missingRequiredFiles, acceptedFiles)

NEW (useFilesApi):
- NO state management (pure API)
- Returns raw data to caller
- All methods require appId parameter
- NO computed properties
- Follows centralized store pattern
*/
