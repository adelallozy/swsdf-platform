// VERSION: 2.3.0
// FILE: src/v3/composables/application/useEventsApplicationsApi.js
// Event applications API - Sport Fishing specific operations

import { ref } from "vue";
import {
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
} from "@/v3/services/httpClient.js";
import { useErrorHandler } from "@/v3/composables/useErrorHandler.js";
import { useLoading } from "@/v3/composables/useLoading.js";

// ──────────────────────────────────────────────────────────────────────────────
// Environment Variables (Updated to match new structure)
// ──────────────────────────────────────────────────────────────────────────────
const EVENTS_BY_ID =
  import.meta.env.VITE_EVENTS_BY_ID || "events/by-id/{targetId}";
const SF_TEAMS_BY_APP_ID =
  import.meta.env.VITE_EVENTS_SF_TEAMS_BY_APP_ID ||
  "events-fishing-teams/by-application-id/{appId}";
const SF_TEAMS_CREATE =
  import.meta.env.VITE_EVENTS_SF_TEAMS_CREATE_URL ||
  "events-fishing-teams/create/{targetId}";
const SF_TEAMS_UPDATE =
  import.meta.env.VITE_EVENTS_SF_TEAMS_UPDATE_URL ||
  "events-fishing-teams/update/{appId}";
const SF_PARTICIPANTS_BY_APP =
  import.meta.env.VITE_EVENTS_SF_PARTICIPANTS_BY_APP_ID ||
  "events-fishing-participants/by-application-id/{appId}";
const SF_PARTICIPANTS_ADD =
  import.meta.env.VITE_EVENTS_SF_PARTICIPANTS_ADD_URL ||
  "events-fishing-participants/add/{appId}";
const SF_PARTICIPANTS_DELETE =
  import.meta.env.VITE_EVENTS_SF_PARTICIPANTS_DELETE_URL ||
  "events-fishing-participants/{participantId}";

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
   * Response structure: { event: {...} }
   */
  async function fetchEvent(eventId) {
    if (!eventId) return null;

    lastError.value = null;

    return withLoading("event-fetching", async () => {
      try {
        const endpoint = EVENTS_BY_ID.replace("{targetId}", eventId);
        const res = await apiGet(endpoint, {
          context: "EventsApi.fetchEvent",
        });

        // Extract event from response
        event.value = res?.event || null;
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
   * Response structure: { sf_team: {...}, application: { id: ... } }
   */
  async function sportFishingCreateTeam(eventId, payload) {
    lastError.value = null;

    return withLoading("team-creating", async () => {
      try {
        const endpoint = SF_TEAMS_CREATE.replace("{targetId}", eventId);
        const res = await apiPost(endpoint, payload, {
          context: "EventsApi.sportFishingCreateTeam",
        });

        // Store team and return full response, including the created application.
        team.value = res?.sf_team || null;
        return res;
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
   * Response structure: { sf_team: {...} }
   */
  async function loadApplicationFishingTeam(appId) {
    if (!appId) return null;

    lastError.value = null;

    return withLoading("team-fetching", async () => {
      try {
        const endpoint = SF_TEAMS_BY_APP_ID.replace("{appId}", appId);
        const res = await apiGet(endpoint, {
          context: "EventsApi.loadApplicationFishingTeam",
        });

        // Extract team from response
        team.value = res?.sf_team || null;
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
   * Response structure: { sf_team: {...} }
   */
  async function sportFishingUpdateTeam(appId, payload) {
    lastError.value = null;

    return withLoading("team-updating", async () => {
      try {
        const endpoint = SF_TEAMS_UPDATE.replace("{appId}", appId);
        const res = await apiPut(endpoint, payload, {
          context: "EventsApi.sportFishingUpdateTeam",
        });

        // Extract and merge team data
        const updatedTeam = res?.sf_team || null;
        team.value = { ...(team.value || {}), ...updatedTeam };
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
   * Response structure: { sf_participants: [...] }
   */
  async function fetchParticipants(appId) {
    lastError.value = null;

    return withLoading("participants-fetching", async () => {
      try {
        const endpoint = SF_PARTICIPANTS_BY_APP.replace("{appId}", appId);
        const res = await apiGet(endpoint, {
          context: "EventsApi.fetchParticipants",
        });

        // Extract participants array
        const list = res?.sf_participants || [];
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
   * Response structure: { sf_participant: {...} }
   */
  async function sportFishingAddParticipant(appId, payload) {
    lastError.value = null;

    return withLoading("participant-adding", async () => {
      try {
        const endpoint = SF_PARTICIPANTS_ADD.replace("{appId}", appId);
        const res = await apiPost(endpoint, payload, {
          context: "EventsApi.sportFishingAddParticipant",
        });

        // Extract participant from response
        const created = res?.sf_participant || null;
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
            context: "useEventsApplicationsApi.sportFishingAddParticipant",
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
  async function sportFishingDeleteParticipant(participantId) {
    lastError.value = null;

    // Use granular key with ID for specific delete operations
    return withLoading(`participant-deleting-${participantId}`, async () => {
      try {
        const endpoint = SF_PARTICIPANTS_DELETE.replace(
          "{participantId}",
          participantId
        );
        await apiDelete(endpoint, {
          context: "EventsApi.sportFishingDeleteParticipant",
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
            context: "useEventsApplicationsApi.sportFishingDeleteParticipant",
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
    sportFishingAddParticipant,
    sportFishingDeleteParticipant,

    // Utils
    resetLocal,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// DOCUMENTATION
// ──────────────────────────────────────────────────────────────────────────────
/**
 * VERSION: 2.3.0
 *
 * CHANGES IN v2.3.0:
 * ==================
 * - Updated to use new endpoint structure with placeholders
 * - Changed apiPatch to apiPut for consistency
 * - Updated response structure extraction (sf_team, sf_participants, event)
 * - Renamed addParticipant → sportFishingAddParticipant
 * - Renamed removeParticipant → sportFishingDeleteParticipant
 * - All endpoints use placeholder replacement pattern
 *
 * ENDPOINTS:
 * ==========
 * - VITE_EVENTS_BY_ID='events/by-id/{targetId}'
 * - VITE_EVENTS_SF_TEAMS_BY_APP_ID='events-fishing-teams/by-application-id/{appId}'
 * - VITE_EVENTS_SF_TEAMS_CREATE_URL='events-fishing-teams/create/{targetId}'
 * - VITE_EVENTS_SF_TEAMS_UPDATE_URL='events-fishing-teams/update/{appId}'
 * - VITE_EVENTS_SF_PARTICIPANTS_BY_APP_ID='events-fishing-participants/by-application-id/{appId}'
 * - VITE_EVENTS_SF_PARTICIPANTS_ADD_URL='events-fishing-participants/add/{appId}'
 * - VITE_EVENTS_SF_PARTICIPANTS_DELETE_URL='events-fishing-participants/{participantId}'
 *
 * RESPONSE STRUCTURES:
 * ====================
 * fetchEvent: { event: {...} }
 * sportFishingCreateTeam: { sf_team: {...}, application: { id: ... } }
 * loadApplicationFishingTeam: { sf_team: {...} }
 * sportFishingUpdateTeam: { sf_team: {...} }
 * fetchParticipants: { sf_participants: [...] }
 * sportFishingAddParticipant: { sf_participant: {...} }
 * sportFishingDeleteParticipant: (no body)
 *
 * LOADING KEYS:
 * =============
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
 */
