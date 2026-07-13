// FILE: src/v3/composables/useLoading.js
// Global Dynamic Loading State Management
//
// KEY NAMING CONVENTION: {entity}-{action}
// Examples:
//   - application-fetching
//   - application-submit
//   - team-updating
//   - participant-adding
//   - participant-deleting-123 (with ID for granular control)

import { reactive, computed } from "vue";

// ──────────────────────────────────────────────────────────────────────────────
// Global State - Fully Dynamic Map
// ──────────────────────────────────────────────────────────────────────────────
const loadingStates = reactive({});

// ──────────────────────────────────────────────────────────────────────────────
// Composable
// ──────────────────────────────────────────────────────────────────────────────
export function useLoading() {
  /**
   * Check if ANY loading is happening globally
   */
  const isLoading = computed(() => {
    return Object.values(loadingStates).some((state) => state === true);
  });

  /**
   * Check if any FETCHING operation is happening
   * Fetching = operations ending with: -fetching, -loading, -getting
   */
  const isFetching = computed(() => {
    return Object.keys(loadingStates).some(
      (key) =>
        (key.endsWith("-fetching") ||
          key.endsWith("-loading") ||
          key.endsWith("-getting")) &&
        loadingStates[key] === true
    );
  });

  /**
   * Check if any MUTATION operation is happening
   * Mutation = operations: -submit, -creating, -updating, -deleting, -adding, -removing
   */
  const isMutating = computed(() => {
    return Object.keys(loadingStates).some(
      (key) =>
        (key.includes("-submit") ||
          key.includes("-creating") ||
          key.includes("-updating") ||
          key.includes("-deleting") ||
          key.includes("-adding") ||
          key.includes("-removing")) &&
        loadingStates[key] === true
    );
  });

  /**
   * Set loading state for any key (auto-creates if doesn't exist)
   */
  function setLoading(key, value) {
    loadingStates[key] = Boolean(value);
  }

  /**
   * Start loading for a key
   */
  function startLoading(key) {
    loadingStates[key] = true;
  }

  /**
   * Stop loading for a key
   */
  function stopLoading(key) {
    loadingStates[key] = false;
  }

  /**
   * Check if a specific key is loading
   */
  function isLoadingKey(key) {
    return loadingStates[key] === true;
  }

  /**
   * Wrap async function with loading state
   * Auto-creates key and manages lifecycle
   *
   * @param {string} key - Loading key (format: entity-action)
   * @param {Function} fn - Async function to execute
   * @returns {Promise} Result of the function
   */
  async function withLoading(key, fn) {
    startLoading(key);
    try {
      return await fn();
    } finally {
      stopLoading(key);
    }
  }

  /**
   * Reset all loading states to false
   */
  function resetLoading() {
    Object.keys(loadingStates).forEach((key) => {
      loadingStates[key] = false;
    });
  }

  /**
   * Reset specific loading keys
   */
  function resetKeys(...keys) {
    keys.forEach((key) => {
      loadingStates[key] = false;
    });
  }

  /**
   * Get all active loading keys (for debugging)
   */
  function getActiveKeys() {
    return Object.keys(loadingStates).filter(
      (key) => loadingStates[key] === true
    );
  }

  /**
   * Check if ANY of the specified keys are loading
   */
  function areKeysLoading(...keys) {
    return keys.some((key) => loadingStates[key] === true);
  }

  /**
   * Check if ALL specified keys are loading
   */
  function allKeysLoading(...keys) {
    return keys.length > 0 && keys.every((key) => loadingStates[key] === true);
  }

  return {
    // Direct access to reactive state (read-only in practice)
    loading: loadingStates,

    // Aggregate computed flags
    isLoading, // ANY loading happening
    isFetching, // Any fetch operation
    isMutating, // Any mutation operation

    // Core methods
    setLoading, // Manually set
    startLoading, // Set to true
    stopLoading, // Set to false
    isLoadingKey, // Check specific key
    withLoading, // Wrap async function

    // Utility methods
    resetLoading, // Reset all
    resetKeys, // Reset specific keys
    getActiveKeys, // Debug: see what's loading
    areKeysLoading, // Check multiple keys (OR)
    allKeysLoading, // Check multiple keys (AND)
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// USAGE GUIDE
// ──────────────────────────────────────────────────────────────────────────────

/**
 * ============================================================================
 * NAMING CONVENTION
 * ============================================================================
 *
 * Format: {entity}-{action}[-{id}]
 *
 * Fetch Operations (use: -fetching, -loading, -getting):
 *   ✓ application-fetching
 *   ✓ event-fetching
 *   ✓ team-loading
 *   ✓ participants-fetching
 *
 * Mutation Operations (use: -submit, -creating, -updating, -deleting, -adding, -removing):
 *   ✓ application-submit
 *   ✓ team-creating
 *   ✓ team-updating
 *   ✓ participant-adding
 *   ✓ participant-deleting
 *
 * Granular Control (add ID when needed):
 *   ✓ participant-deleting-123
 *   ✓ file-uploading-456
 *
 * ============================================================================
 * BASIC USAGE
 * ============================================================================
 *
 * 1. In Composable (Recommended - use withLoading):
 *
 * import { useLoading } from '@/v3/composables/useLoading.js'
 *
 * export function useMyApi() {
 *   const { withLoading } = useLoading()
 *
 *   async function fetchData() {
 *     return withLoading('data-fetching', async () => {
 *       const res = await apiGet('/data')
 *       return res
 *     })
 *   }
 *
 *   async function saveData(data) {
 *     return withLoading('data-saving', async () => {
 *       await apiPost('/data', data)
 *     })
 *   }
 *
 *   return { fetchData, saveData }
 * }
 *
 * ============================================================================
 *
 * 2. In Component (Check Loading State):
 *
 * <script setup>
 * import { useLoading } from '@/v3/composables/useLoading.js'
 *
 * const { isLoadingKey, isFetching, isMutating } = useLoading()
 * </script>
 *
 * <template>
 *   <!-- Check specific key -->
 *   <div v-if="isLoadingKey('application-fetching')">
 *     Loading application...
 *   </div>
 *
 *   <!-- Check any fetch operation -->
 *   <div v-if="isFetching">
 *     Loading data...
 *   </div>
 *
 *   <!-- Check any mutation -->
 *   <button :disabled="isMutating">
 *     Submit
 *   </button>
 *
 *   <!-- Check specific mutation -->
 *   <button :disabled="isLoadingKey('application-submit')">
 *     {{ isLoadingKey('application-submit') ? 'Submitting...' : 'Submit' }}
 *   </button>
 * </template>
 *
 * ============================================================================
 *
 * 3. Manual Control (When Not Using Async Wrapper):
 *
 * import { useLoading } from '@/v3/composables/useLoading.js'
 *
 * const { startLoading, stopLoading } = useLoading()
 *
 * function handleClick() {
 *   startLoading('button-processing')
 *
 *   try {
 *     // Do something
 *   } finally {
 *     stopLoading('button-processing')
 *   }
 * }
 *
 * ============================================================================
 *
 * 4. Advanced - Multiple Keys:
 *
 * const { areKeysLoading, allKeysLoading } = useLoading()
 *
 * // Check if ANY of these are loading
 * if (areKeysLoading('user-fetching', 'profile-fetching', 'settings-fetching')) {
 *   console.log('Something is loading')
 * }
 *
 * // Check if ALL of these are loading
 * if (allKeysLoading('step1-processing', 'step2-processing')) {
 *   console.log('All steps are processing')
 * }
 *
 * ============================================================================
 *
 * 5. Debugging:
 *
 * const { getActiveKeys } = useLoading()
 *
 * console.log('Currently loading:', getActiveKeys())
 * // Output: ['application-fetching', 'participant-deleting-123']
 *
 * ============================================================================
 *
 * 6. Cleanup:
 *
 * const { resetLoading, resetKeys } = useLoading()
 *
 * // Reset all loading states
 * resetLoading()
 *
 * // Reset specific keys
 * resetKeys('application-fetching', 'team-updating')
 *
 * ============================================================================
 * BEST PRACTICES
 * ============================================================================
 *
 * ✓ DO: Use withLoading() in composables (automatic cleanup)
 * ✓ DO: Use descriptive keys (entity-action format)
 * ✓ DO: Use -fetching suffix for GET operations
 * ✓ DO: Use specific action suffixes for mutations (-submit, -deleting, etc.)
 * ✓ DO: Add IDs to keys when deleting/updating specific items
 *
 * ✗ DON'T: Use generic keys like 'loading' or 'busy'
 * ✗ DON'T: Forget to stop loading in error cases (use finally or withLoading)
 * ✗ DON'T: Create computed helpers in this composable (keep it dynamic)
 *
 * ============================================================================
 */
