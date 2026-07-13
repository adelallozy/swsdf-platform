// FILE: src/v3/composables/application/useProfessionalDiversApi.js
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
 *
 * Follows same pattern as useEventsApplicationsApi
 *
 * @returns {Object} API methods and state
 */
export function useProfessionalDiversApi() {
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
        await apiPost(endpoint, frmData, {
          context: "ProfessionalDiversApi.addMembership",
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
            context: "useProfessionalDiversApi.addMembership",
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
          context: "ProfessionalDiversApi.deleteMembership",
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
            context: "useProfessionalDiversApi.deleteMembership",
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
          context: "ProfessionalDiversApi.restoreMembership",
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
            context: "useProfessionalDiversApi.restoreMembership",
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
  };
}

/**
 * Default export for backward compatibility
 */
export default useProfessionalDiversApi;
