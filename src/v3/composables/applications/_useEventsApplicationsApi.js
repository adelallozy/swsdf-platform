// FILE: src/v3/composables/applications/useEventsApplicationsApi.js
// TOKEN: EVENTS-API-FINAL-2025-10-19

import { ref } from "vue";
import {
  apiGet,
  apiPost,
  apiPatch,
  apiDelete,
} from "@/v3/services/httpClient.js";
import { useErrorHandler } from "@/v3/composables/useErrorHandler.js";
import { useLoading } from "@/v3/composables/useLoading.js";

// ──────────────────────────────────────────────────────────────────────────────
// Environment Variables
// ──────────────────────────────────────────────────────────────────────────────
const EVENTS_BASE = import.meta.env.VITE_EVENTS_BASE || "events/";
const SF_TEAMS_BASE =
  import.meta.env.VITE_SF_TEAMS_BASE || "events-fishing-teams/";
const SF_TEAMS_LOAD_BY_APP_ID_URL =
  import.meta.env.VITE_EVENTS_SF_TEAMS_BY_APP_ID ||
  "events-fishing-teams/by-application-id/";
const SF_TEAMS_UPDATE_URL =
  import.meta.env.VITE_EVENTS_SF_TEAMS_UPDATE_URL ||
  "events-fishing-teams/update/";
const FISHING_PARTICIPANTS_BASE =
  import.meta.env.VITE_FISHING_PARTICIPANTS_BASE ||
  "events-fishing-participants/";
const FISHING_PARTICIPANTS_BY_APP =
  import.meta.env.VITE_FISHING_PARTICIPANTS_BY_APP ||
  "events-fishing-participants/by-application-id/";

// ──────────────────────────────────────────────────────────────────────────────

export default function useEventsApplicationsApi() {
  const { capture } = useErrorHandler();
  const { withLoading } = useLoading();

  // ─────────────────────────────────────────────────────────
  // Reactive State
  // ─────────────────────────────────────────────────────────
  const event = ref(null);
  const team = ref(null);
  const participants = ref([]);
  const lastError = ref(null);

  // ─────────────────────────────────────────────────────────
  // Error Capture Helper
  // ─────────────────────────────────────────────────────────
  function shouldCapture(err) {
    if (!err) return true;
    // Let view handle these known flows
    if (err.status === 404) return false;
    if (err.status === 409) return false;
    if (err.name === "VALIDATION_ERROR") return false;
    if (err.status >= 500) return false;
    return true;
  }

  // ─────────────────────────────────────────────────────────
  // EVENT - Fetch
  // ─────────────────────────────────────────────────────────

  /**
   * Fetch event by ID
   * Loading key: event-fetching
   */
  async function fetchEvent(eventId) {
    if (!eventId) return null;

    lastError.value = null;

    return withLoading("event-fetching", async () => {
      try {
        const res = await apiGet(`${EVENTS_BASE}${eventId}`, {
          context: "EventsApi.fetchEvent",
        });
        event.value = res?.event ?? res?.data ?? res;
        return event.value;
      } catch (err) {
        lastError.value = err;
        if (shouldCapture(err)) {
          capture(err, {
            fallback: "Failed to load event",
            context: "useEventsApplicationsApi.fetchEvent",
            meta: { eventId },
          });
        }
        throw err;
      }
    });
  }

  // ─────────────────────────────────────────────────────────
  // TEAM - CRUD
  // ─────────────────────────────────────────────────────────

  /**
   * Create new team for event
   * Loading key: team-creating
   */
  async function sportFishingCreateTeam(eventId, payload) {
    lastError.value = null;

    return withLoading("team-creating", async () => {
      try {
        const res = await apiPost(
          `${SF_TEAMS_BASE}create/${eventId}`,
          payload,
          { context: "EventsApi.sportFishingCreateTeam" }
        );
        team.value = res?.team ?? res?.data ?? res;
        return team.value;
      } catch (err) {
        lastError.value = err;
        if (shouldCapture(err)) {
          capture(err, {
            fallback: "Failed to create team",
            context: "useEventsApplicationsApi.sportFishingCreateTeam",
            meta: { eventId },
          });
        }
        throw err;
      }
    });
  }

  /**
   * Load team by application ID
   * Loading key: team-fetching
   */
  async function loadApplicationFishingTeam(appId) {
    if (!appId) return null;

    lastError.value = null;

    return withLoading("team-fetching", async () => {
      try {
        const res = await apiGet(`${SF_TEAMS_LOAD_BY_APP_ID_URL}${appId}`, {
          context: "EventsApi.loadApplicationFishingTeam",
        });
        team.value = res?.team ?? res?.data ?? res;
        return team.value;
      } catch (err) {
        lastError.value = err;
        if (shouldCapture(err)) {
          capture(err, {
            fallback: "Failed to load team",
            context: "useEventsApplicationsApi.loadApplicationFishingTeam",
            meta: { appId },
          });
        }
        throw err;
      }
    });
  }

  /**
   * Update team by application ID
   * Loading key: team-updating
   */
  async function sportFishingUpdateTeam(appId, payload) {
    lastError.value = null;

    return withLoading("team-updating", async () => {
      try {
        const res = await apiPatch(`${SF_TEAMS_UPDATE_URL}${appId}`, payload, {
          context: "EventsApi.sportFishingUpdateTeam",
        });
        team.value = {
          ...(team.value || {}),
          ...(res?.team ?? res?.data ?? res),
        };
        return team.value;
      } catch (err) {
        lastError.value = err;
        if (shouldCapture(err)) {
          capture(err, {
            fallback: "Failed to update team",
            context: "useEventsApplicationsApi.sportFishingUpdateTeam",
            meta: { appId },
          });
        }
        throw err;
      }
    });
  }

  // ─────────────────────────────────────────────────────────
  // PARTICIPANTS - CRUD
  // ─────────────────────────────────────────────────────────

  /**
   * Fetch all participants for application
   * Loading key: participants-fetching
   */
  async function fetchParticipants(appId) {
    lastError.value = null;

    return withLoading("participants-fetching", async () => {
      try {
        const res = await apiGet(`${FISHING_PARTICIPANTS_BY_APP}${appId}`, {
          context: "EventsApi.fetchParticipants",
        });
        const list = res?.participants ?? res?.data ?? res ?? [];
        participants.value = Array.isArray(list) ? list : [];
        return participants.value;
      } catch (err) {
        lastError.value = err;
        // 404 is acceptable - means no participants yet
        if (err.status === 404) {
          participants.value = [];
          return [];
        }
        if (shouldCapture(err)) {
          capture(err, {
            fallback: "Failed to load participants",
            context: "useEventsApplicationsApi.fetchParticipants",
            meta: { appId },
          });
        }
        throw err;
      }
    });
  }

  /**
   * Add participant to application
   * Loading key: participant-adding
   */
  async function addParticipant(appId, payload) {
    lastError.value = null;

    return withLoading("participant-adding", async () => {
      try {
        const res = await apiPost(
          `${FISHING_PARTICIPANTS_BASE}add/${appId}`,
          payload,
          { context: "EventsApi.addParticipant" }
        );
        const created = res?.participant ?? res?.data ?? res;
        if (created) {
          // Add to local list
          const idx = participants.value.findIndex((p) => p.id === created.id);
          if (idx === -1) {
            participants.value.unshift(created);
          } else {
            participants.value[idx] = created;
          }
        }
        return created;
      } catch (err) {
        lastError.value = err;
        if (shouldCapture(err)) {
          capture(err, {
            fallback: "Failed to add participant",
            context: "useEventsApplicationsApi.addParticipant",
            meta: { appId },
          });
        }
        throw err;
      }
    });
  }

  /**
   * Remove participant by ID
   * Loading key: participant-deleting-{id}
   */
  async function removeParticipant(participantId) {
    lastError.value = null;

    // Use granular key with ID for specific delete operations
    return withLoading(`participant-deleting-${participantId}`, async () => {
      try {
        await apiDelete(`${FISHING_PARTICIPANTS_BASE}${participantId}`, {
          context: "EventsApi.removeParticipant",
        });
        // Remove from local list
        participants.value = participants.value.filter(
          (p) => p.id !== participantId
        );
        return true;
      } catch (err) {
        lastError.value = err;
        if (shouldCapture(err)) {
          capture(err, {
            fallback: "Failed to remove participant",
            context: "useEventsApplicationsApi.removeParticipant",
            meta: { participantId },
          });
        }
        throw err;
      }
    });
  }

  // ─────────────────────────────────────────────────────────
  // Utilities
  // ─────────────────────────────────────────────────────────

  /**
   * Reset all local state
   */
  function resetLocal() {
    event.value = null;
    team.value = null;
    participants.value = [];
    lastError.value = null;
  }

  return {
    // State
    event,
    team,
    participants,
    lastError,

    // Event
    fetchEvent,

    // Team
    sportFishingCreateTeam,
    sportFishingUpdateTeam,
    loadApplicationFishingTeam,

    // Participants
    fetchParticipants,
    addParticipant,
    removeParticipant,

    // Utils
    resetLocal,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// LOADING KEYS USED IN THIS COMPOSABLE
// ──────────────────────────────────────────────────────────────────────────────
/**
 * Fetch Operations:
 * - event-fetching
 * - team-fetching
 * - participants-fetching
 *
 * Mutation Operations:
 * - team-creating
 * - team-updating
 * - participant-adding
 * - participant-deleting-{id} (granular with ID)
 *
 * Usage in Components:
 *
 * import { useLoading } from '@/v3/composables/useLoading.js'
 * import useEventsApplicationsApi from '@/v3/composables/applications/useEventsApplicationsApi.js'
 *
 * const { isLoadingKey, isFetching } = useLoading()
 * const { fetchEvent, participants } = useEventsApplicationsApi()
 *
 * // Check specific operation
 * <div v-if="isLoadingKey('event-fetching')">Loading event...</div>
 *
 * // Check any fetch
 * <div v-if="isFetching">Loading...</div>
 *
 * // Check specific delete
 * <button :disabled="isLoadingKey(`participant-deleting-${participant.id}`)">
 *   Delete
 * </button>
 */
