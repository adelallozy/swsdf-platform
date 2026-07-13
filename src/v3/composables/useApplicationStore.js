// FILE: /src/v3/composables/useApplicationStore.js
// TOKEN: 2025-10-20-APP-STORE-004-FINAL
import { ref, reactive, computed } from "vue";
import { useErrorHandler } from "@/v3/composables/useErrorHandler.js";
import { useLoading } from "@/v3/composables/useLoading.js";
import { apiGet, apiPost, apiDelete } from "@/v3/services/httpClient.js";
import {
  APPLICATIONS_DELETE,
  APPLICATIONS_PICK_BY_ID,
  APPLICATIONS_RECALL,
  APPLICATIONS_RESUBMIT,
  APPLICATIONS_SUBMIT,
} from "@/v3/config/apiEndpoints.js";
import {
  isApplicantDraftStage,
  isApplicantEditableStage,
  isDataVerificationStage,
} from "@/v3/utils/applicationWorkflow.js";

const { capture } = useErrorHandler();

// ────────────────────────────────────────────────────────────────────────────
// API ENDPOINTS
// ────────────────────────────────────────────────────────────────────────────

const PICK_APPLICATION = APPLICATIONS_PICK_BY_ID;
const SUBMIT_URL = APPLICATIONS_SUBMIT;
const RESUBMIT_URL = APPLICATIONS_RESUBMIT;
const RECALL_URL = APPLICATIONS_RECALL;
const DELETE_URL = APPLICATIONS_DELETE;

// ────────────────────────────────────────────────────────────────────────────
// STATE (module-scoped singletons; store is lightweight and reused)
// ────────────────────────────────────────────────────────────────────────────

const application = ref(null);
const loading = ref(false); // KEPT FOR BACKWARD COMPATIBILITY
const applicationError = ref(null);
const hasLocalChanges = ref(false);

// Action loading states - KEPT FOR BACKWARD COMPATIBILITY
const submitting = ref(false);
const recalling = ref(false);
const deleting = ref(false);

// Back-compat only; do not use in new code.
const applicationEntities = reactive({
  applicationNotes: null,
  quotation: null,
  notes: null,
});
const populatedEntities = reactive({
  applicationNotes: null,
  quotation: null,
  notes: null,
});

// ────────────────────────────────────────────────────────────────────────────
// COMPOSABLE
// ────────────────────────────────────────────────────────────────────────────

export function useApplicationStore() {
  const { startLoading, stopLoading } = useLoading();

  // ────────────────────────────────────────────────────────────────────────
  // COMPUTED
  // ────────────────────────────────────────────────────────────────────────

  const applicationType = computed(() => {
    return application.value?.purpose || application.value?.target || "basic";
  });

  const canModifyApplication = computed(() => {
    return isApplicantEditableStage(application.value?.stage);
  });

  const canDeleteApplication = computed(() => {
    return isApplicantDraftStage(application.value?.stage);
  });

  const canRecallApplication = computed(() => {
    return isDataVerificationStage(application.value?.stage);
  });

  // ────────────────────────────────────────────────────────────────────────
  // LOAD APPLICATION
  // ────────────────────────────────────────────────────────────────────────

  /**
   * Load application by ID
   * Uses loading key: 'application-loading'
   * @param {string|number} applicationId - The application ID to load
   * @returns {Promise<Object|null>} The loaded application or null
   */
  async function loadApplication(applicationId) {
    if (!applicationId) {
      console.warn(
        "useApplicationStore.loadApplication: No applicationId provided"
      );
      return null;
    }

    resetStore();

    // Set both old ref and new loading key for compatibility
    loading.value = true;
    const loadingKey = "application-loading";
    startLoading(loadingKey);
    applicationError.value = null;

    try {
      const response = await apiGet(`${PICK_APPLICATION}${applicationId}`);
      application.value = response.application;

      // Populate legacy entities for backward compatibility
      for (const [key, value] of Object.entries(response)) {
        if (key in applicationEntities) {
          applicationEntities[key] = value;
        }
      }

      hasLocalChanges.value = false;
      return application.value;
    } catch (err) {
      applicationError.value = err;
      capture(err, {
        fallback: "Failed to load application.",
        context: "useApplicationStore.loadApplication",
        meta: {
          applicationId,
          endpoint: `${PICK_APPLICATION}${applicationId}`,
          originalError: err?.message,
        },
      });
      throw err;
    } finally {
      loading.value = false;
      stopLoading(loadingKey);
    }
  }

  // ────────────────────────────────────────────────────────────────────────
  // SUBMIT APPLICATION
  // ────────────────────────────────────────────────────────────────────────

  /**
   * Submit application
   * Sends draft or applicant revision applications into backend review.
   * Uses loading key: 'application-submitting'
   * @param {string|number} applicationId - The application ID to submit
   * @returns {Promise<Object>} Response data from server
   */
  async function submitApplication(applicationId) {
    if (!applicationId) {
      throw new Error("Application ID is required");
    }

    if (!canModifyApplication.value) {
      throw new Error("Application cannot be submitted in the current stage");
    }

    // Set both old ref and new loading key for compatibility
    submitting.value = true;
    const loadingKey = "application-submitting";
    startLoading(loadingKey);

    try {
      const baseUrl = application.value?.stage === 'applicant_revision'
        ? RESUBMIT_URL
        : SUBMIT_URL;
      const response = await apiPost(baseUrl.replace("{appId}", applicationId));

      // Update local state if response includes updated application
      if (response?.application) {
        application.value = response.application;
      }

      return response;
    } catch (err) {
      capture(err, {
        fallback: "Failed to submit application",
        context: "useApplicationStore.submitApplication",
        meta: {
          applicationId,
          originalError: err?.message,
        },
      });
      throw err;
    } finally {
      submitting.value = false;
      stopLoading(loadingKey);
    }
  }

  // ────────────────────────────────────────────────────────────────────────
  // RECALL APPLICATION
  // ────────────────────────────────────────────────────────────────────────

  /**
   * Recall application
   * Recalls an application from Data Verification back to applicant draft.
   * Uses loading key: 'application-recalling'
   * @param {string|number} applicationId - The application ID to recall
   * @returns {Promise<Object>} Response data from server
   */
  async function recallApplication(applicationId) {
    if (!applicationId) {
      throw new Error("Application ID is required");
    }

    if (!canRecallApplication.value) {
      throw new Error("Application cannot be recalled in the current stage");
    }

    // Set both old ref and new loading key for compatibility
    recalling.value = true;
    const loadingKey = "application-recalling";
    startLoading(loadingKey);

    try {
      const response = await apiPost(RECALL_URL.replace("{appId}", applicationId));

      // Update local state
      if (response?.application) {
        application.value = response.application;
      }

      return response;
    } catch (err) {
      capture(err, {
        fallback: "Failed to recall application",
        context: "useApplicationStore.recallApplication",
        meta: {
          applicationId,
          originalError: err?.message,
        },
      });
      throw err;
    } finally {
      recalling.value = false;
      stopLoading(loadingKey);
    }
  }

  // ────────────────────────────────────────────────────────────────────────
  // DELETE APPLICATION
  // ────────────────────────────────────────────────────────────────────────

  /**
   * Delete application permanently
   * Only allowed while the application is still in draft.
   * Uses loading key: 'application-deleting'
   * @param {string|number} applicationId - The application ID to delete
   * @returns {Promise<boolean>} True if deletion successful
   */
  async function deleteApplication(applicationId) {
    if (!applicationId) {
      throw new Error("Application ID is required");
    }

    if (!canDeleteApplication.value) {
      throw new Error("Application cannot be deleted in the current stage");
    }

    // Set both old ref and new loading key for compatibility
    deleting.value = true;
    const loadingKey = "application-deleting";
    startLoading(loadingKey);

    try {
      // Use apiDelete if available, otherwise apiPost for DELETE method
      if (typeof apiDelete === "function") {
        await apiDelete(DELETE_URL.replace("{appId}", applicationId));
      } else {
        await apiPost(
          DELETE_URL.replace("{appId}", applicationId),
          {},
          { method: "DELETE" }
        );
      }

      // Clear local state
      application.value = null;

      return true;
    } catch (err) {
      capture(err, {
        fallback: "Failed to delete application",
        context: "useApplicationStore.deleteApplication",
        meta: {
          applicationId,
          originalError: err?.message,
        },
      });
      throw err;
    } finally {
      deleting.value = false;
      stopLoading(loadingKey);
    }
  }

  // ────────────────────────────────────────────────────────────────────────
  // RESET STORE
  // ────────────────────────────────────────────────────────────────────────

  /**
   * Reset store to initial state
   * Clears all application data and loading states
   */
  function resetStore() {
    application.value = null;
    applicationError.value = null;
    hasLocalChanges.value = false;
    submitting.value = false;
    recalling.value = false;
    deleting.value = false;

    // Back-compat cleanup: keep shapes but clear them
    Object.keys(applicationEntities).forEach((key) => {
      applicationEntities[key] = Array.isArray(applicationEntities[key])
        ? []
        : null;
    });
    Object.keys(populatedEntities).forEach((key) => {
      populatedEntities[key] = Array.isArray(populatedEntities[key])
        ? []
        : null;
    });
  }

  // ────────────────────────────────────────────────────────────────────────
  // RETURN PUBLIC API
  // ────────────────────────────────────────────────────────────────────────

  return {
    // State
    application,
    applicationType,
    canModifyApplication,
    canDeleteApplication,
    canRecallApplication,
    loading, // KEPT FOR BACKWARD COMPATIBILITY
    applicationError,
    hasLocalChanges,

    // Action loading states - KEPT FOR BACKWARD COMPATIBILITY
    submitting,
    recalling,
    deleting,

    // Legacy (kept for compatibility; avoid in new code)
    applicationEntities,
    populatedEntities,

    // Actions
    loadApplication,
    submitApplication,
    recallApplication,
    deleteApplication,
    resetStore,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// DOCUMENTATION
// ────────────────────────────────────────────────────────────────────────────

/*
LOADING KEYS USED:
==================
- 'application-loading'    : Loading application data
- 'application-submitting' : Submitting application
- 'application-recalling'  : Recalling application
- 'application-deleting'   : Deleting application

USAGE IN COMPONENTS:
====================

// Modern way (with useLoading)
import { useLoading } from '@/v3/composables/useLoading';
const { isLoadingKey } = useLoading();

if (isLoadingKey('application-loading')) {
  // Show spinner
}

if (isLoadingKey('application-submitting')) {
  // Disable submit button
}

// Legacy way (still supported)
const { loading, submitting } = useApplicationStore();
if (loading.value) { ... }  // Still works!
if (submitting.value) { ... } // Still works!

EXAMPLE USAGE:
==============

import { useApplicationStore } from '@/v3/composables/useApplicationStore';
import { useLoading } from '@/v3/composables/useLoading';

const { application, loadApplication, submitApplication } = useApplicationStore();
const { isLoadingKey } = useLoading();

// Load application
onMounted(async () => {
  try {
    await loadApplication(applicationId);
  } catch (err) {
    // Handle error
  }
});

// Submit application
async function handleSubmit() {
  try {
    await submitApplication(applicationId);
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Application submitted successfully'
    });
  } catch (err) {
    // Error already captured and logged
  }
}

// Check loading state
<button :disabled="isLoadingKey('application-submitting')">
  Submit
</button>

BACKWARD COMPATIBILITY:
=======================
All old code using `loading`, `submitting`, `recalling`, `deleting` refs 
continues to work without any changes.

New code should use the loading keys with useLoading for better flexibility.
*/
