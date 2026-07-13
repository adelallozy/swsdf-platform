// FILE: src/v3/composables/application/usePDApplicationsApi.js
// VERSION: 1.1.0
// NEW COMPOSABLE - Following useEventsApplicationsApi pattern

import { ref } from "vue";

import { useLoading } from "@/v3/composables/useLoading.js";
import { useErrorHandler } from "@/v3/composables/useErrorHandler.js";
import { useApplicationStore } from "@/v3/composables/application/useApplicationStore.js";
import { apiPost } from "@/v3/services/httpClient.js";

/**
 * Professional Divers API Composable
 *
 * Provides API methods for Professional Diver operations:
 * - Add membership
 * - Delete membership
 * - Restore membership
 * - Add work contract
 * - Delete work contract
 * - Restore work contract
 *
 * Follows same pattern as useEventsApplicationsApi
 *
 * @returns {Object} API methods and state
 */
export function usePDApplicationsApi() {
  const { capture, shouldCapture } = useErrorHandler();
  const { withLoading, isLoading } = useLoading();
  const store = useApplicationStore();
  const lastError = ref(null);

  /**
   * Add membership to professional diver application
   *
   * @param {number} applicationId - Application ID
   * @param {Object} formData - Form data from MasterForm
   * @returns {Promise<boolean>} True if successful
   *
   * Loading key: pd_membership-adding
   */
  async function addMembership(applicationId, formData) {
    lastError.value = null;

    return withLoading("pd_membership-adding", async () => {
      try {
        // Convert form data to FormData for file upload
        const frmData = new FormData();
        frmData.append("title", formData.title);
        frmData.append("diving_type", formData.diving_type);
        frmData.append("membership_number", formData.membership_number);
        frmData.append("organization", formData.organization);
        if (formData.membership_copy) {
          frmData.append("membership_file", formData.membership_copy);
        }

        const endpoint =
          import.meta.env.VITE_PROFESSIONAL_DIVER_NEW_MEMBERSHIP +
          applicationId;
        console.log("endpoint", endpoint);
        await apiPost(endpoint, frmData, {
          context: "PDApplicationsApi.addMembership",
        });

        // Reload application with payload to refresh UI
        await store.loadApplication(applicationId, {
          withPayload: true,
          forceReload: true,
        });

        return true;
      } catch (err) {
        lastError.value = err;
        if (shouldCapture(err)) {
          capture(err, {
            fallback: "Failed to add membership",
            context: "usePDApplicationsApi.addMembership",
            meta: { applicationId },
          });
        }
        throw err;
      }
    });
  }

  /**
   * Delete membership by ID
   *
   * @param {number} updateId - The ID of membership update to delete
   * @returns {Promise<boolean>} True if successful
   *
   * Loading key: pd_membership-deleting-{id}
   */
  async function deleteMembership(updateId) {
    lastError.value = null;

    // Use granular key with ID for specific delete operations
    return withLoading(`pd_membership-deleting-${updateId}`, async () => {
      try {
        const endpoint =
          import.meta.env.VITE_PROFESSIONAL_DIVER_MEMBERSHIP_CANCEL + updateId;
        await apiPost(endpoint, {
          context: "PDApplicationsApi.deleteMembership",
        });

        // Reload application with payload to refresh UI with updated data
        await store.loadApplication(store.application.value.id, {
          withPayload: true,
          forceReload: true,
        });

        return true;
      } catch (err) {
        lastError.value = err;
        if (shouldCapture(err)) {
          capture(err, {
            fallback: "Failed to remove membership",
            context: "usePDApplicationsApi.deleteMembership",
            meta: { updateId },
          });
        }
        throw err;
      }
    });
  }

  /**
   * Restore membership by ID
   *
   * @param {number} updateId - The ID of membership update to restore
   * @returns {Promise<boolean>} True if successful
   *
   * Loading key: pd_membership-restoring-{id}
   */
  async function restoreMembership(updateId) {
    lastError.value = null;

    return withLoading(`pd_membership-restoring-${updateId}`, async () => {
      try {
        const endpoint =
          import.meta.env.VITE_PROFESSIONAL_DIVER_MEMBERSHIP_RESTORE + updateId;
        await apiPost(endpoint, {
          context: "PDApplicationsApi.restoreMembership",
        });

        // Reload application with payload to refresh UI with updated data
        await store.loadApplication(store.application.value.id, {
          withPayload: true,
          forceReload: true,
        });

        return true;
      } catch (err) {
        lastError.value = err;
        if (shouldCapture(err)) {
          capture(err, {
            fallback: "Failed to restore membership",
            context: "usePDApplicationsApi.restoreMembership",
            meta: { updateId },
          });
        }
        throw err;
      }
    });
  }

  /**
   * Add work contract to professional diver application
   *
   * @param {number} applicationId - Application ID
   * @param {Object} formData - Form data from MasterForm
   * @returns {Promise<boolean>} True if successful
   *
   * Loading key: pd_contract-adding
   */
  async function addContract(applicationId, formData) {
    lastError.value = null;

    console.log("applicationId", applicationId);
    console.log(formData);
    return withLoading("pd_contract-adding", async () => {
      try {
        // Convert form data to FormData for file upload
        const frmData = new FormData();
        frmData.append("dive_center_id", formData.dive_center_id);
        frmData.append("start_date", formData.start_date);
        if (formData.end_date) {
          frmData.append("end_date", formData.end_date);
        }
        frmData.append("work_contract_copy_file", formData.contract_copy);

        const endpoint =
          import.meta.env
            .VITE_APPLICATIONS_PROFESSIONAL_DIVERS_CONTRACTS_REGISTER +
          applicationId;

        console.log("endpoint", endpoint);
        await apiPost(endpoint, frmData, {
          context: "PDApplicationsApi.addContract",
        });

        // Reload application with payload to refresh UI
        await store.loadApplication(applicationId, {
          withPayload: true,
          forceReload: true,
        });

        return true;
      } catch (err) {
        lastError.value = err;
        if (shouldCapture(err)) {
          capture(err, {
            fallback: "Failed to add work contract",
            context: "usePDApplicationsApi.addContract",
            meta: { applicationId },
          });
        }
        throw err;
      }
    });
  }

  /**
   * Delete work contract by ID
   *
   * @param {number} updateId - The ID of contract to delete
   * @returns {Promise<boolean>} True if successful
   *
   * Loading key: pd_contract-deleting-{id}
   */
  async function deleteContract(updateId) {
    lastError.value = null;

    // Use granular key with ID for specific delete operations
    return withLoading(`pd_contract-deleting-${updateId}`, async () => {
      try {
        const endpoint =
          import.meta.env
            .VITE_APPLICATIONS_PROFESSIONAL_DIVERS_CONTRACTS_CANCEL + updateId;
        await apiPost(endpoint, {
          context: "PDApplicationsApi.deleteContract",
        });

        // Reload application with payload to refresh UI with updated data
        await store.loadApplication(store.application.value.id, {
          withPayload: true,
          forceReload: true,
        });

        return true;
      } catch (err) {
        lastError.value = err;
        if (shouldCapture(err)) {
          capture(err, {
            fallback: "Failed to remove work contract",
            context: "usePDApplicationsApi.deleteContract",
            meta: { updateId },
          });
        }
        throw err;
      }
    });
  }

  /**
   * Restore work contract by ID
   *
   * @param {number} updateId - The ID of contract to restore
   * @returns {Promise<boolean>} True if successful
   *
   * Loading key: pd_contract-restoring-{id}
   */
  async function restoreContract(updateId) {
    lastError.value = null;

    return withLoading(`pd_contract-restoring-${updateId}`, async () => {
      try {
        const endpoint =
          import.meta.env
            .VITE_APPLICATIONS_PROFESSIONAL_DIVERS_CONTRACTS_REACTIVE +
          updateId;
        await apiPost(endpoint, {
          context: "PDApplicationsApi.restoreContract",
        });

        // Reload application with payload to refresh UI with updated data
        await store.loadApplication(store.application.value.id, {
          withPayload: true,
          forceReload: true,
        });

        return true;
      } catch (err) {
        lastError.value = err;
        if (shouldCapture(err)) {
          capture(err, {
            fallback: "Failed to restore work contract",
            context: "usePDApplicationsApi.restoreContract",
            meta: { updateId },
          });
        }
        throw err;
      }
    });
  }

  return {
    // State
    lastError,
    isLoading,

    // Membership operations
    addMembership,
    deleteMembership,
    restoreMembership,

    // Work contract operations (NEW)
    addContract,
    deleteContract,
    restoreContract,
  };
}

/**
 * Default export for backward compatibility
 */
export default usePDApplicationsApi;
