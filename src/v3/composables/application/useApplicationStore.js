// VERSION: 2.4.0
// PATH: src/v3/composables/application/useApplicationStore.js
// Central store for application state management with payload and validation

import { ref, computed } from "vue";
import { useLoading } from "@/v3/composables/useLoading";
import { apiGet, apiPost, apiDelete } from "@/v3/services/httpClient.js";
import {
  getDataLoader,
  getDataLoaders,
  getBlockingSteps,
  getPayloadKeys,
  resolveConfiguredApplicationType,
} from "@/v3/config/application-config";
import {
  isApplicantDraftStage,
  isApplicantEditableStage,
  isReviewStage,
} from "@/v3/utils/applicationWorkflow.js";
import {
  APPLICATIONS_DELETE,
  APPLICATIONS_GET_BY_ID,
  APPLICATIONS_PICK,
  APPLICATIONS_RECALL,
  APPLICATIONS_SUBMIT,
  APPLICATIONS_RESUBMIT,
} from "@/v3/config/apiEndpoints.js";

// ────────────────────────────────────────────────────────────────────────────
// MODULE-SCOPED STATE (Shared across all components)
// ────────────────────────────────────────────────────────────────────────────

const application = ref(null);
const stepsValidationErrors = ref({});
const stepPrimaryActions = ref({});
const stepPrimaryActionOrder = ref([]);
const loadedPayloadKeys = ref([]); // Track which payload keys were loaded
const runtimeRequiredFilesBySource = ref({});

// Payload structure - single source of truth
const payload = {
  // User profiles
  user_profile: ref(null),

  // Professional Divers Applications
  pd_license: ref(null),
  pd_memberships: ref(null),
  pd_contracts: ref(null), // Professional diver work contracts

  // Sport Fishing Competition entities
  event: ref(null),
  sf_team: ref(null),
  sf_participants: ref([]),

  underwater_photography_participant: ref(null),

  // Athlete Registration entities
  user_profile_picture: ref(null),
  sport: ref(null),

  // Vendor Registration entities
  vendor_profile: ref(null),
  vendor_contacts: ref([]),
  vendor_contact_updates: ref([]),
  active_vendor_profile: ref(null),
  active_vendor_contacts: ref([]),
  managed_vendor_contacts: ref([]),

  // Diving Center entities
  center_profile: ref(null),
  center_active_contracts: ref([]),
  active_files: ref([]),
  active_international_memberships: ref([]),
  application_international_memberships: ref([]),
  unverified_international_memberships: ref([]),
  center_administrators: ref([]),

  // Jetski Competition entities
  participation: ref(null),

  // Shared entities (flat structure)
  files: ref([]),
  quotations: ref([]),
  actions: ref([]),
};

// ────────────────────────────────────────────────────────────────────────────
// API ENDPOINTS
// ────────────────────────────────────────────────────────────────────────────

const APPLICATION_BY_ID = APPLICATIONS_GET_BY_ID;
const APPLICATION_PICK_URL = APPLICATIONS_PICK;
const SUBMIT_URL = APPLICATIONS_SUBMIT;
const RESUBMIT_URL = APPLICATIONS_RESUBMIT;
const RECALL_URL = APPLICATIONS_RECALL;
const DELETE_URL = APPLICATIONS_DELETE;

// ────────────────────────────────────────────────────────────────────────────
// COMPOSABLE
// ────────────────────────────────────────────────────────────────────────────

export function useApplicationStore() {
  const { withLoading, isLoadingKey } = useLoading();

  function uniqueFileNames(values = []) {
    const normalized = [];

    values.forEach((value) => {
      if (typeof value !== "string") {
        return;
      }

      const fileName = value.trim();
      if (!fileName || normalized.includes(fileName)) {
        return;
      }

      normalized.push(fileName);
    });

    return normalized;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // RESET PAYLOAD
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Reset all payload refs to initial state
   * Called when switching to a different application
   */
  function resetPayload() {
    // User profiles
    payload.user_profile.value = null;

    // Reset loaded payload keys tracking
    loadedPayloadKeys.value = [];

    // Professional Divers
    payload.pd_license.value = null;
    payload.pd_memberships.value = null;
    payload.pd_contracts.value = null;

    // Sport Fishing Competition
    payload.event.value = null;
    payload.sf_team.value = null;
    payload.sf_participants.value = [];

    // Athlete Registration
    payload.user_profile_picture.value = null;
    payload.sport.value = null;

    // Vendor Registration
    payload.vendor_profile.value = null;
    payload.vendor_contacts.value = [];
    payload.vendor_contact_updates.value = [];
    payload.active_vendor_profile.value = null;
    payload.active_vendor_contacts.value = [];
    payload.managed_vendor_contacts.value = [];

    // Diving Center
    payload.center_profile.value = null;
    payload.active_files.value = [];
    payload.active_international_memberships.value = [];
    payload.application_international_memberships.value = [];
    payload.unverified_international_memberships.value = [];
    payload.center_administrators.value = [];

    // Jetski Competition
    payload.participation.value = null;

    // Shared entities
    payload.files.value = [];
    payload.quotations.value = [];
    payload.actions.value = [];
    runtimeRequiredFilesBySource.value = {};
  }

  // ──────────────────────────────────────────────────────────────────────────
  // LOAD APPLICATION WITH PAYLOAD (Unified Loading)
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Load application with optional payload
   * Uses backend's byId endpoint with with-payload and payload query parameters
   * @param {string|number} appId - Application ID
   * @param {Object} options - Loading options
   * @param {boolean} options.withPayload - Include payload in response (default: true)
   * @param {Array} options.payloadKeys - Specific payload keys to load (default: from config)
   * @param {string|null} options.applicationType - Optional configured application type hint
   * @param {boolean} options.forceReload - Force reload even if already loaded (default: false)
   */
  async function loadApplication(appId, options = {}) {
    // Support legacy signature: loadApplication(appId, forceReload)
    if (typeof options === "boolean") {
      options = { forceReload: options };
    }

    const {
      withPayload = true,
      payloadKeys = null,
      applicationType: applicationTypeHint = null,
      forceReload = false,
    } = options;

    if (!appId) {
      // console.warn('useApplicationStore.loadApplication: No appId provided');
      return;
    }

    // Guard: Already loading?
    if (isLoadingKey("application")) {
      // console.log('useApplicationStore: Application already loading, skipping...');
      return;
    }

    // Guard: Same application already loaded?
    if (!forceReload && application?.value?.id === appId) {
      // console.log('useApplicationStore: Application already loaded, skipping...');
      return;
    }

    // Different application? Reset payload
    if (application.value?.id !== appId) {
      resetPayload();
      stepsValidationErrors.value = {};
      stepPrimaryActions.value = {};
      stepPrimaryActionOrder.value = [];
    }

    return await withLoading("application", async () => {
      try {
        const baseEndpoint = APPLICATION_BY_ID.replace("{appId}", appId);
        let endpoint = baseEndpoint;
        let keys = payloadKeys;

        // Add query parameters for payload loading
        if (withPayload) {
          let requestApplicationType =
            applicationTypeHint ||
            resolveConfiguredApplicationType(
              application.value?.flow,
              application.value?.purpose
            );

          if (!keys && !requestApplicationType) {
            const metadata = await apiGet(baseEndpoint);
            application.value = metadata?.application || null;
            requestApplicationType = resolveConfiguredApplicationType(
              metadata?.application?.flow,
              metadata?.application?.purpose
            );
          }

          const queryParams = new URLSearchParams();
          queryParams.append("with-payload", "true");

          // Get payload keys from config if not provided
          keys = keys || getPayloadKeys(requestApplicationType);

          // Add each payload key as array parameter
          if (keys && keys.length > 0) {
            keys.forEach((key) => {
              queryParams.append("payload[]", key);
            });
          }

          const queryString = queryParams.toString();
          if (queryString) {
            endpoint += "?" + queryString;
          }
        }

        const res = await apiGet(endpoint);

        // Extract application from response
        application.value = res?.application;

        // Load payload data if present
        if (withPayload && res) {
          // Track which payload keys were actually loaded from response
          loadedPayloadKeys.value = [];

          // Map backend payload keys to frontend payload refs
          const payloadMapping = {
            event: "event",
            sf_team: "sf_team",
            sf_participants: "sf_participants",
            user_profile: "user_profile",
            user_profile_picture: "user_profile_picture",
            sport: "sport",
            files: "files",
            quotations: "quotations",
            actions: "actions",
            center_profile: "center_profile",
            center_active_contracts: "center_active_contracts",
            vendor_profile: "vendor_profile",
            vendor_contacts: "vendor_contacts",
            vendor_contact_updates: "vendor_contact_updates",
            active_vendor_profile: "active_vendor_profile",
            active_vendor_contacts: "active_vendor_contacts",
            managed_vendor_contacts: "managed_vendor_contacts",
            active_files: "active_files",
            active_international_memberships:
              "active_international_memberships",
            application_international_memberships:
              "application_international_memberships",
            unverified_international_memberships:
              "unverified_international_memberships",
            center_administrators: "center_administrators",
            pd_contracts: "pd_contracts",
            pd_license: "pd_license",
            participation: "participation",
            underwater_photography_participant:
              "underwater_photography_participant",
          };

          // Populate payload refs from response
          Object.keys(res).forEach((key) => {
            if (key !== "application" && key !== "purpose" && key !== "keys") {
              const payloadKey = payloadMapping[key] || key;
              if (payload[payloadKey]) {
                payload[payloadKey].value = res[key];

                // Track that this key was actually loaded
                loadedPayloadKeys.value.push(payloadKey);
              }
            }
          });
        }

        // console.log('useApplicationStore: Application loaded successfully', {
        //     id: application.value?.id,
        //     purpose: application.value?.purpose,
        //     withPayload
        // });
      } catch (err) {
        // console.error('useApplicationStore.loadApplication: Error loading application', err);
        throw err;
      }
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // LOAD APPLICATION DATA (Step 2)
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * @deprecated Legacy two-step loader kept only for backward compatibility.
   * New v3 work must use loadApplication(appId, { withPayload: true }) and read from payload refs.
   *
   * Load all related entities based on configured application type.
   * Uses flow first and falls back to application.purpose only for legacy compatibility.
   *
   * @param {boolean} forceReload - Force reload even if already loaded
   */
  async function loadApplicationData(forceReload = false) {
    if (!application.value) {
      // console.warn('useApplicationStore.loadApplicationData: No application loaded');
      return;
    }

    const applicationType = resolveConfiguredApplicationType(
      application.value?.flow,
      application.value?.purpose
    );

    if (!applicationType) {
      // console.warn('useApplicationStore.loadApplicationData: No configured application type found');
      return;
    }

    // Get all data loaders for this application type
    const dataLoaders = getDataLoaders(applicationType);

    if (!dataLoaders || Object.keys(dataLoaders).length === 0) {
      // console.log('useApplicationStore.loadApplicationData: No data loaders configured for', applicationType);
      return;
    }

    // Load all entities in parallel
    const loaderPromises = Object.entries(dataLoaders).map(
      async ([entityName, loader]) => {
        try {
          await loadEntity(entityName, forceReload);
        } catch (err) {
          // console.error(`Failed to load entity "${entityName}":`, err);

          // If allowEmpty, set empty array/null
          if (loader.allowEmpty) {
            const key = loader.payloadKey;
            if (Array.isArray(payload[key].value)) {
              payload[key].value = [];
            } else {
              payload[key].value = null;
            }
          }
        }
      }
    );

    await Promise.all(loaderPromises);

    // console.log('useApplicationStore: All entities loaded successfully');
  }

  // ──────────────────────────────────────────────────────────────────────────
  // LOAD ENTITY (On-Demand Loading)
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Load a specific entity on-demand
   * @param {string} entityName - Entity name (e.g., 'sf_team', 'files', 'quotations')
   * @param {boolean} forceReload - Force reload even if already loaded
   */
  async function loadEntity(entityName, forceReload = false) {
    if (!application.value) {
      // console.warn(`useApplicationStore.loadEntity: No application loaded, cannot load entity "${entityName}"`);
      return;
    }

    const applicationType = resolveConfiguredApplicationType(
      application.value?.flow,
      application.value?.purpose
    );

    // Get loader config
    const loader = getDataLoader(applicationType, entityName);

    if (!loader) {
      // console.warn(`useApplicationStore.loadEntity: No loader defined for entity "${entityName}"`);
      return;
    }

    // Guard: Already loaded?
    if (!forceReload && payload[loader.payloadKey]?.value) {
      const currentValue = payload[loader.payloadKey].value;
      const isLoaded = Array.isArray(currentValue)
        ? currentValue.length > 0
        : currentValue !== null;

      if (isLoaded) {
        // console.log(`useApplicationStore.loadEntity: Entity "${entityName}" already loaded, skipping...`);
        return;
      }
    }

    // Guard: Already loading?
    if (isLoadingKey(loader.loadingKey)) {
      // console.log(`useApplicationStore.loadEntity: Entity "${entityName}" already loading, skipping...`);
      return;
    }

    return await withLoading(loader.loadingKey, async () => {
      try {
        // Replace placeholders in endpoint
        let endpoint = loader.endpoint
          .replace("{appId}", application.value?.id)
          .replace(
            "{targetId}",
            application.value?.target_id || application.value?.id
          );

        const data = await apiGet(endpoint);

        // Store data in payload - extract from response structure
        payload[loader.payloadKey].value = data[entityName];
      } catch (err) {
        // If allowEmpty and 404, set empty value
        if (loader.allowEmpty && err?.status === 404) {
          if (Array.isArray(payload[loader.payloadKey].value)) {
            payload[loader.payloadKey].value = [];
          } else {
            payload[loader.payloadKey].value = null;
          }
        } else {
          throw err;
        }
      }
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // RELOAD APPLICATION PAYLOAD
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Reload all payload data for current application
   * Used after create/update/delete operations
   */
  async function reloadApplicationPayload() {
    if (!application.value) {
      // console.warn('useApplicationStore.reloadApplicationPayload: No application loaded');
      return;
    }

    await loadApplication(application.value.id, {
      withPayload: true,
      forceReload: true,
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // APPLICATION ACTIONS (Submit/Recall/Delete)
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Submit application
   * @param {string|number} appId - Application ID
   */
  async function submitApplication(appId) {
    if (!appId) {
      throw new Error("Application ID is required");
    }

    if (!canModifyApplication.value) {
      throw new Error("Application cannot be submitted in the current stage");
    }

    return await withLoading("application-submitting", async () => {
      try {
        const baseUrl =
          application.value?.stage === "applicant_revision"
            ? RESUBMIT_URL
            : SUBMIT_URL;
        const endpoint = baseUrl.replace("{appId}", appId);
        const res = await apiPost(endpoint, {});

        // Reload application to get updated status
        await loadApplication(appId, true);

        return res;
      } catch (err) {
        // console.error('useApplicationStore.submitApplication: Error', err);
        throw err;
      }
    });
  }

  /**
   * Recall application
   * @param {string|number} appId - Application ID
   */
  async function recallApplication(appId) {
    if (!appId) {
      throw new Error("Application ID is required");
    }

    if (!canRecallApplication.value) {
      throw new Error("Application cannot be recalled in the current stage");
    }

    return await withLoading("application-recalling", async () => {
      try {
        const endpoint = RECALL_URL.replace("{appId}", appId);
        const res = await apiPost(endpoint, {});

        // Reload application to get updated status
        await loadApplication(appId, true);

        return res;
      } catch (err) {
        // console.error('useApplicationStore.recallApplication: Error', err);
        throw err;
      }
    });
  }

  /**
   * Delete application
   * @param {string|number} appId - Application ID
   */
  async function deleteApplication(appId) {
    if (!appId) {
      throw new Error("Application ID is required");
    }

    if (!canDeleteApplication.value) {
      throw new Error("Application cannot be deleted in the current stage");
    }

    return await withLoading("application-deleting", async () => {
      try {
        const endpoint = DELETE_URL.replace("{appId}", appId);
        await apiDelete(endpoint);

        // Clear all state after successful delete
        application.value = null;
        resetPayload();
        clearAllStepErrors();
        clearAllStepPrimaryActions();
        loadedPayloadKeys.value = [];

        return true;
      } catch (err) {
        // console.error('useApplicationStore.deleteApplication: Error', err);
        throw err;
      }
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // VALIDATION ERROR MANAGEMENT
  // ──────────────────────────────────────────────────────────────────────────

  function setStepError(stepName, errors) {
    stepsValidationErrors.value[stepName] = errors;
  }

  function deleteStepError(stepName) {
    delete stepsValidationErrors.value[stepName];
  }

  function clearAllStepErrors() {
    stepsValidationErrors.value = {};
  }

  // ──────────────────────────────────────────────────────────────────────────
  // PRIMARY ACTION REGISTRY (For "Next" navigation)
  // ──────────────────────────────────────────────────────────────────────────

  function registerStepPrimaryAction(stepId, action) {
    if (!stepId || typeof action !== "function") return;

    stepPrimaryActions.value[stepId] = action;
    if (!stepPrimaryActionOrder.value.includes(stepId)) {
      stepPrimaryActionOrder.value.push(stepId);
    }
  }

  function unregisterStepPrimaryAction(stepId) {
    if (!stepId) return;

    delete stepPrimaryActions.value[stepId];
    stepPrimaryActionOrder.value = stepPrimaryActionOrder.value.filter(
      (id) => id !== stepId
    );
  }

  function getStepPrimaryAction(stepId) {
    return stepPrimaryActions.value?.[stepId];
  }

  function clearAllStepPrimaryActions() {
    stepPrimaryActions.value = {};
    stepPrimaryActionOrder.value = [];
  }

  function setRuntimeRequiredFiles(source, fileNames = []) {
    if (!source) {
      return;
    }

    runtimeRequiredFilesBySource.value[source] = uniqueFileNames(fileNames);
  }

  function deleteRuntimeRequiredFiles(source) {
    if (!source) {
      return;
    }

    delete runtimeRequiredFilesBySource.value[source];
  }

  // ──────────────────────────────────────────────────────────────────────────
  // COMPUTED PROPERTIES
  // ──────────────────────────────────────────────────────────────────────────

  const canModifyApplication = computed(() => {
    return isApplicantEditableStage(application.value?.stage);
  });

  const canDeleteApplication = computed(() => {
    return isApplicantDraftStage(application.value?.stage);
  });

  const canRecallApplication = computed(() => {
    return isReviewStage(application.value?.stage);
  });

  // application.purpose is deprecated in new v3 work. Keep it only as a
  // compatibility fallback while older routes, payloads, and configs migrate to flow.
  const applicationType = computed(() => {
    return resolveConfiguredApplicationType(
      application.value?.flow,
      application.value?.purpose
    );
  });

  const isApplicationValid = computed(() => {
    return Object.keys(stepsValidationErrors.value).length === 0;
  });

  const runtimeRequiredFiles = computed(() =>
    uniqueFileNames(
      Object.values(runtimeRequiredFilesBySource.value).flatMap((files) =>
        Array.isArray(files) ? files : []
      )
    )
  );

  const nextIncompleteStepId = computed(() => {
    const orderedBlockingStepIds = getBlockingSteps(applicationType.value).map(
      (step) => step.id
    );
    const nextConfiguredStepId = orderedBlockingStepIds.find(
      (id) => !!stepsValidationErrors.value?.[id]
    );

    return (
      nextConfiguredStepId ||
      stepPrimaryActionOrder.value.find(
        (id) => !!stepsValidationErrors.value?.[id]
      ) ||
      Object.keys(stepsValidationErrors.value || {})[0] ||
      null
    );
  });

  const progressPercentage = computed(() => {
    if (!applicationType.value) return 0;

    const blockingSteps = getBlockingSteps(applicationType.value);

    if (blockingSteps.length === 0) return 0;

    const completedSteps = blockingSteps.filter((step) => {
      return !stepsValidationErrors.value[step.id];
    });

    return Math.round((completedSteps.length / blockingSteps.length) * 100);
  });

  const incompleteBlockingSteps = computed(() => {
    if (!applicationType.value) return [];

    const blockingSteps = getBlockingSteps(applicationType.value);

    return blockingSteps.filter((step) => {
      return stepsValidationErrors.value[step.id];
    });
  });

  const canSubmitApplication = computed(() => {
    if (!canModifyApplication.value) return false;
    if (!applicationType.value) return false;

    const blockingSteps = getBlockingSteps(applicationType.value);

    return blockingSteps.every((step) => {
      return !stepsValidationErrors.value[step.id];
    });
  });

  /**
   * Check if a specific payload key was loaded
   * @param {string} key - Payload key to check (e.g., 'user_profile', 'files')
   * @returns {boolean} True if the key was loaded in the last loadApplication call
   */
  function isPayloadKeyLoaded(key) {
    return loadedPayloadKeys.value.includes(key);
  }

  /**
   * Check if full payload was loaded (all keys from config)
   * @returns {boolean} True if all configured payload keys were loaded
   */
  function isFullPayloadLoaded() {
    const expectedKeys = getPayloadKeys(applicationType.value) || [];
    return expectedKeys.every((key) => loadedPayloadKeys.value.includes(key));
  }

  /**
   * Check if partial payload was loaded (not all keys from config)
   * @returns {boolean} True if only some payload keys were loaded
   */
  function isPartialPayloadLoaded() {
    const expectedKeys = getPayloadKeys(applicationType.value) || [];
    return (
      loadedPayloadKeys.value.length > 0 &&
      loadedPayloadKeys.value.length < expectedKeys.length
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // RETURN PUBLIC API
  // ──────────────────────────────────────────────────────────────────────────

  return {
    // State
    application,
    payload,
    stepsValidationErrors,
    stepPrimaryActions,
    stepPrimaryActionOrder,
    loadedPayloadKeys,

    // Actions
    loadApplication, // Load application with optional payload (unified loading)
    loadApplicationData, // Deprecated: legacy two-step loader kept for compatibility only
    loadEntity, // Load single entity on-demand
    reloadApplicationPayload, // Reload payload after CRUD operations
    resetPayload, // Reset all payload to initial state

    // Application Actions
    submitApplication, // Submit application
    recallApplication, // Recall application
    deleteApplication, // Delete application

    // Validation
    setStepError,
    deleteStepError,
    clearAllStepErrors,

    // Primary step actions (for summary "Next")
    registerStepPrimaryAction,
    unregisterStepPrimaryAction,
    getStepPrimaryAction,
    clearAllStepPrimaryActions,
    setRuntimeRequiredFiles,
    deleteRuntimeRequiredFiles,

    // Computed
    applicationType,
    runtimeRequiredFiles,
    canModifyApplication,
    canDeleteApplication,
    canRecallApplication,
    isApplicationValid,
    nextIncompleteStepId,
    progressPercentage,
    incompleteBlockingSteps,
    canSubmitApplication,

    // Payload tracking helpers
    isPayloadKeyLoaded,
    isFullPayloadLoaded,
    isPartialPayloadLoaded,

    // Loading utilities
    isLoadingKey,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// DOCUMENTATION
// ────────────────────────────────────────────────────────────────────────────

/*
VERSION: 2.4.1

CHANGES IN v2.4.1:
==================
- Marked loadApplicationData() as deprecated
- Marked application.purpose as a legacy fallback only
- Exposed computed applicationType for flow-first consumers
- Payload completeness checks now use configured application type

CHANGES IN v2.4.0:
==================
- Added submitApplication, recallApplication, deleteApplication actions
- Added reloadApplicationPayload method
- Updated API endpoints with placeholder pattern
- Response extraction: data[entityName] for payload loading
- Complete state management for application lifecycle

LOADING FLOW:
=============
1. loadApplication(appId, { withPayload: true }) - Load metadata and configured payload in one call
2. Components render with data from payload
3. loadApplicationData() is deprecated and kept only for legacy compatibility
4. After CRUD: reloadApplicationPayload()

EDITABLE STAGES:
================
Applications can be modified when stage is:
- 'draft': Applicant draft before first submission
- 'applicant_revision': Application returned to applicant for corrections

Applications can be deleted only when stage is:
- 'draft'

Applications can be recalled only when stage is:
- 'review'

PAYLOAD STRUCTURE:
==================
{
  // Sport Fishing Competition
  event: ref(null),
  sf_team: ref(null),
  sf_participants: ref([]),
  
  // Athlete Registration
  profile: ref(null),
  portrait: ref(null),
  sport: ref(null),
  
  // Diving Center
  center_profile: ref(null),
  center_administrators: ref([]),
  
  // Jetski Competition
  participation: ref(null),
  
  // Shared entities
  files: ref([]),
  quotations: ref([]),
  actions: ref([])
}

API ENDPOINTS:
==============
- VITE_APPLICATION_BY_ID='applications/pick/{appId}'
- VITE_APPLICATION_SUBMIT_URL='applications/submit/{appId}'
- VITE_APPLICATION_RECALL_URL='applications/recall/{appId}'
- VITE_APPLICATION_DELETE_URL='applications/delete/{appId}'

USAGE EXAMPLE:
==============
const store = useApplicationStore();

// Load application
await store.loadApplication(123, { withPayload: true });

// Check if can edit
if (store.canModifyApplication.value) {
  // Show edit UI
}

// Submit application
await store.submitApplication(123);

// Delete application
await store.deleteApplication(123);
*/
