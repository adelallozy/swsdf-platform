import { ref } from "vue";

import { useErrorHandler } from "@/v3/composables/useErrorHandler";
import { apiGet, apiPost } from "@/v3/services/httpClient.js";

const memberships = ref([]);
const loading = ref(false);
const error = ref(null);

const GET_MEMBERSHIPS_BY_APP = import.meta.env
  .VITE_PRO_DIVER_MEMBERSHIPS_BY_APP;
const CANCEL_MEMBERSHIP = import.meta.env
  .VITE_PROFESSIONAL_DIVER_MEMBERSHIP_CANCEL;

const RESTORE_MEMBERSHIP = import.meta.env
  .VITE_PROFESSIONAL_DIVER_MEMBERSHIP_RESTORE;

const NEW_MEMBERSHIP = import.meta.env.VITE_PROFESSIONAL_DIVER_NEW_MEMBERSHIP;

export function useMemberships(applicationId) {
  const { capture } = useErrorHandler();

  async function loadMemberships() {
    loading.value = true;
    try {
      const response = await apiGet(GET_MEMBERSHIPS_BY_APP + applicationId);
      memberships.value = response.memberships;
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to load memberships";
      capture(err, { context: "Loading memberships" });
    } finally {
      loading.value = false;
    }
  }

  async function addMembership(membershipData) {
    loading.value = true;
    try {
      const response = await apiPost(
        NEW_MEMBERSHIP + applicationId,
        membershipData
      );
      memberships.value.push(response.diverMembership);
    } catch (err) {
      // should handle 422 validation errors here

      error.value = err.message || "Failed to add membership";
      capture(err, { context: "Adding membership" });
    } finally {
      loading.value = false;
    }
  }

  async function deleteMembership(membershipId) {
    loading.value = true;
    try {
      await apiPost(CANCEL_MEMBERSHIP + membershipId);
    } catch (err) {
      error.value = err.response?.message || "Failed to delete membership";
      capture(err, { context: "Deleting membership" });
    } finally {
      loading.value = false;
    }
  }

  async function restoreMembership(membershipId) {
    loading.value = true;
    try {
      await apiPost(RESTORE_MEMBERSHIP + membershipId);
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Failed to restore membership.";
    } finally {
      loading.value = false;
    }
  }

  return {
    memberships,
    loading,
    error,
    loadMemberships,
    addMembership,
    deleteMembership,
    restoreMembership,
  };
}
