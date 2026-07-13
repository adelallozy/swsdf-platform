// FILE: src/v3/composables/useAthleteApi.js
// TOKEN: ATHLETE-API-v1-2025-10-17

import { ref } from "vue";
import { apiGet } from "@/v3/services/httpClient.js";
import { useErrorHandler } from "@/v3/composables/useErrorHandler.js";

const ATHLETES_BASE = import.meta.env.VITE_ATHLETES_BASE || "athletes/";

export default function useAthleteApi() {
  const { capture } = useErrorHandler();

  // State
  const membership = ref(null);
  const memberships = ref([]);
  const loading = ref(false);
  const lastError = ref(null);

  /**
   * Get user's sport membership(s)
   * @param {string|null} sport - Sport type (e.g., 'sport-fishing', 'jetski', 'freediving')
   * @returns {Promise<Object|Array>} - Single membership or array of memberships
   */
  async function fetchMyMemberships(sport = null) {
    loading.value = true;
    lastError.value = null;

    try {
      const url = sport
        ? `${ATHLETES_BASE}my-memberships?sport=${encodeURIComponent(sport)}`
        : `${ATHLETES_BASE}my-memberships`;

      const res = await apiGet(url, {
        context: "AthleteApi.fetchMyMemberships",
      });

      if (sport) {
        // Single membership requested
        membership.value = res?.membership ?? res?.data ?? null;
        return membership.value;
      } else {
        // All memberships requested
        memberships.value = res?.memberships ?? res?.data ?? [];
        return memberships.value;
      }
    } catch (err) {
      lastError.value = err;

      // 404 is expected when user has no membership
      if (err.status === 404) {
        if (sport) {
          membership.value = null;
        } else {
          memberships.value = [];
        }
        throw err; // Let caller handle redirect
      }

      // Capture unexpected errors
      capture(err, {
        fallback: "Failed to fetch athlete memberships",
        context: "useAthleteApi.fetchMyMemberships",
        meta: { sport, originalError: err?.message },
      });

      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Check if user has membership for specific sport
   * @param {string} sport - Sport type to check
   * @returns {Promise<boolean>}
   */
  async function hasMembership(sport) {
    try {
      await fetchMyMemberships(sport);
      return !!membership.value;
    } catch (err) {
      if (err.status === 404) {
        return false;
      }
      throw err;
    }
  }

  /**
   * Reset local state
   */
  function resetLocal() {
    membership.value = null;
    memberships.value = [];
    lastError.value = null;
    loading.value = false;
  }

  return {
    // State
    membership,
    memberships,
    loading,
    lastError,

    // Methods
    fetchMyMemberships,
    hasMembership,
    resetLocal,
  };
}
