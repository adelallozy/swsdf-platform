# useApplicationStore Composable

**Version:** 2.8.0  
**Last Updated:** 2026-04-22  
**Path:** `src/v3/composables/application/useApplicationStore.js`

Central store for application state management with unified payload loading and validation.

---

## Overview

`useApplicationStore` provides a reactive state management system for application data, including the application metadata and all related entities (payload). It supports both unified loading (single API call) and legacy two-step loading for backward compatibility.

---

## Features

- **Unified Loading**: Load application + payload in a single API call
- **Backward Compatible**: Supports legacy two-step loading pattern
- **Payload Management**: Centralized state for all application entities
- **Validation Tracking**: Track step validation errors across the application
- **Step Navigation**: Cards register a "primary action" so the summary page can move the user to the next incomplete requirement
- **Runtime Required Files**: Cards can register extra required files in the shared store when needed, but config-driven `getRequiredFiles(applicationType, payload)` remains the primary source
- **Loading States**: Built-in loading state management
- **CRUD Operations**: Submit, recall, and delete applications
- **On-Demand Loading**: Load specific entities when needed

---

## State Management

### Application State

```javascript
const application = ref(null);  // Application metadata
const stepsValidationErrors = ref({});  // Validation errors by step ID
const stepPrimaryActions = ref({});  // stepId -> () => void (used by Summary "Next")
const stepPrimaryActionOrder = ref([]);  // registration order
const runtimeRequiredFilesBySource = ref({});  // sourceId -> string[]
```

### Payload Structure

The payload is a single source of truth for all application-related entities:

```javascript
const payload = {
    // User profiles
    user_profile: ref(null),

    // Professional Divers Applications
    pd_license: ref(null),
    pd_memberships: ref(null),
    pd_contracts: ref(null),

    // Sport Fishing Competition
    event: ref(null),
    sf_team: ref(null),
    sf_participants: ref([]),

    underwater_photography_participant: ref(null),

    // Athlete Registration
    user_profile_picture: ref(null),
    sport: ref(null),

    // Diving Center
    center_profile: ref(null),
    active_files: ref([]),
    active_international_memberships: ref([]),
    unverified_international_memberships: ref([]),
    center_administrators: ref([]),

    // Jetski Competition
    participation: ref(null),

    // Shared entities
    files: ref([]),
    quotations: ref([]),
    actions: ref([])
};
```

---

## API

### loadApplication()

Load application with optional payload using backend's `byId` endpoint.

#### Signature

```javascript
async function loadApplication(appId, options = {})
```

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|--------|-----------|----------|-------------|
| `appId` | `string \| number` | Yes | - | Application ID |
| `options` | `Object` | No | `{}` | Loading options |
| `options.withPayload` | `boolean` | No | `true` | Include payload in response |
| `options.payloadKeys` | `Array<string>` | No | `null` | Specific payload keys to load (defaults to config) |
| `options.forceReload` | `boolean` | No | `false` | Force reload even if already loaded |

#### Legacy Signature (Backward Compatible)

```javascript
// Old signature still works
async function loadApplication(appId, forceReload = false)
```

#### Return Value

Returns `Promise<void>` - Resolves when application is loaded.

#### Usage Examples

```javascript
const store = useApplicationStore();

// Option 1: Unified loading with payload (recommended)
await store.loadApplication(123, {
    withPayload: true,
    payloadKeys: ['event', 'sf_team', 'files', 'actions']
});

// Option 2: Use config payload keys
await store.loadApplication(123, {
    withPayload: true
    // payloadKeys will be fetched from config automatically
});

// Option 3: Load without payload
await store.loadApplication(123, {
    withPayload: false
});

// Option 4: Legacy signature (backward compatible)
await store.loadApplication(123, true); // forceReload = true
```

#### Behavior

1. **Guard Clauses**:
   - Skips if `appId` is not provided
   - Skips if application is already loading
   - Skips if same application is already loaded (unless `forceReload=true`)

2. **State Reset**:
   - Resets all payload refs when switching to a different application
   - Clears validation errors

3. **API Call**:
   - Uses `applications/byId/{appId}` endpoint
   - Adds query parameters: `?with-payload=true&payload[]=key1&payload[]=key2`
   - Fetches payload keys from config if not provided

4. **Response Handling**:
   - Extracts application metadata
   - Maps backend payload keys to frontend payload refs
   - Populates all payload refs with response data

---

### loadApplicationData()

Deprecated legacy two-step loader. New v3 work must use unified `loadApplication(appId, { withPayload: true })`.

#### Signature

```javascript
async function loadApplicationData(forceReload = false)
```

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|--------|-----------|----------|-------------|
| `forceReload` | `boolean` | No | `false` | Force reload even if already loaded |

#### Usage

```javascript
const store = useApplicationStore();

// Load application metadata first
await store.loadApplication(123);

// Then load all entities (deprecated legacy two-step loading)
await store.loadApplicationData();
```

#### Behavior

- Resolves configured application type from `application.value.flow` first
- Falls back to `application.value.purpose` only for legacy compatibility
- Fetches all data loaders for that type from config
- Loads all entities in parallel
- Handles `allowEmpty` flag for optional entities

---

### loadEntity()

Load a specific entity on-demand.

#### Signature

```javascript
async function loadEntity(entityName, forceReload = false)
```

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|--------|-----------|----------|-------------|
| `entityName` | `string` | Yes | - | Entity name (e.g., 'sf_team', 'files') |
| `forceReload` | `boolean` | No | `false` | Force reload even if already loaded |

#### Usage

```javascript
const store = useApplicationStore();

// Load specific entity
await store.loadEntity('sf_team');

// Force reload
await store.loadEntity('files', true);
```

---

### reloadApplicationPayload()

Reload all payload data for current application.

#### Signature

```javascript
async function reloadApplicationPayload()
```

#### Usage

```javascript
const store = useApplicationStore();

// After CRUD operations
await store.reloadApplicationPayload();
```

---

### resetPayload()

Reset all payload refs to initial state.

#### Signature

```javascript
function resetPayload()
```

#### Usage

```javascript
const store = useApplicationStore();

store.resetPayload();
```

---

## Application Actions

### submitApplication()

Submit an application for review.

#### Signature

```javascript
async function submitApplication(appId)
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|--------|-----------|-------------|
| `appId` | `string \| number` | Yes | Application ID |

#### Usage

```javascript
const store = useApplicationStore();

await store.submitApplication(123);
```

---

### recallApplication()

Recall an application from `Data Verification` back to applicant draft.

#### Signature

```javascript
async function recallApplication(appId)
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|--------|-----------|-------------|
| `appId` | `string \| number` | Yes | Application ID |

#### Usage

```javascript
const store = useApplicationStore();

await store.recallApplication(123);
```

---

### deleteApplication()

Delete an application.

#### Signature

```javascript
async function deleteApplication(appId)
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|--------|-----------|-------------|
| `appId` | `string \| number` | Yes | Application ID |

#### Usage

```javascript
const store = useApplicationStore();

await store.deleteApplication(123);
```

---

## Validation

### setStepError()

Set validation error for a specific step.

#### Signature

```javascript
function setStepError(stepName, errors)
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|--------|-----------|-------------|
| `stepName` | `string` | Yes | Step identifier |
| `errors` | `any` | Yes | Error object or message |

#### Usage

```javascript
const store = useApplicationStore();

store.setStepError('sf_team', {
    name: 'Team name is required',
    captain: 'Captain information is incomplete'
});
```

---

### deleteStepError()

Remove validation error for a specific step.

#### Signature

```javascript
function deleteStepError(stepName)
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|--------|-----------|-------------|
| `stepName` | `string` | Yes | Step identifier |

#### Usage

```javascript
const store = useApplicationStore();

store.deleteStepError('sf_team');
```

---

### clearAllStepErrors()

Clear all validation errors.

#### Signature

```javascript
function clearAllStepErrors()
```

#### Usage

```javascript
const store = useApplicationStore();

store.clearAllStepErrors();
```

---

## Step Navigation ("Next")

The store also tracks **primary actions** per step so `ApplicationSummary.vue` can show a `Next` button when the application is incomplete and route the user to the most relevant screen.

### registerStepPrimaryAction()

Register the primary action for a step (typically "Add", "Edit", or "Upload").

#### Signature

```javascript
function registerStepPrimaryAction(stepId, action)
```

#### Usage (in a card)

```javascript
const store = useApplicationStore();

function navigateToAdd() {
  router.push({ name: 'pd-contract-add', params: { appId: store.application.value.id, locale: locale.value } });
}

store.registerStepPrimaryAction('pd_contracts', navigateToAdd);

onBeforeUnmount(() => {
  store.unregisterStepPrimaryAction('pd_contracts');
});
```

### getStepPrimaryAction()

```javascript
function getStepPrimaryAction(stepId)
```

### unregisterStepPrimaryAction()

```javascript
function unregisterStepPrimaryAction(stepId)
```

### clearAllStepPrimaryActions()

```javascript
function clearAllStepPrimaryActions()
```

#### Fallback: `data-step-id`

Cards should add `data-step-id="<stepId>"` to their root element so the summary can scroll to the card if no primary action is registered.

---

## Computed Properties

### canModifyApplication

Whether the current application can be modified.

```javascript
const canModifyApplication = computed(() => {
    return isApplicantEditableStage(application.value?.stage);
});
```

Editable applicant stages are `draft` and `applicant_revision`. Delete is only allowed in `draft`; recall is only allowed in `Data Verification`.

---

### isApplicationValid

Whether the application has no validation errors.

```javascript
const isApplicationValid = computed(() => {
    return Object.keys(stepsValidationErrors.value).length === 0;
});
```

---

### nextIncompleteStepId

Returns the best candidate step ID for the summary `Next` button.

- Prefers steps that registered a primary action (registration order)
- Falls back to the first key in `stepsValidationErrors`

```javascript
const nextIncompleteStepId = computed(() => {
  return (
    stepPrimaryActionOrder.value.find((id) => !!stepsValidationErrors.value?.[id]) ||
    Object.keys(stepsValidationErrors.value || {})[0] ||
    null
  );
});
```

---

### progressPercentage

Progress percentage based on completed blocking steps.

```javascript
const progressPercentage = computed(() => {
    if (!application.value?.purpose) return 0;
    
    const blockingSteps = getBlockingSteps(application.value?.purpose);
    
    if (blockingSteps.length === 0) return 0;
    
    const completedSteps = blockingSteps.filter(step => {
        return !stepsValidationErrors.value[step.id];
    });
    
    return Math.round((completedSteps.length / blockingSteps.length) * 100);
});
```

---

### incompleteBlockingSteps

List of blocking steps that have validation errors.

```javascript
const incompleteBlockingSteps = computed(() => {
    if (!applicationType.value) return [];
    
    const blockingSteps = getBlockingSteps(applicationType.value);
    
    return blockingSteps.filter(step => {
        return stepsValidationErrors.value[step.id];
    });
});
```

---

### canSubmitApplication

Whether the application can be submitted (all blocking steps complete).

```javascript
const canSubmitApplication = computed(() => {
    if (!canModifyApplication.value) return false;
    if (!applicationType.value) return false;
    
    const blockingSteps = getBlockingSteps(applicationType.value);
    
    return blockingSteps.every(step => {
        return !stepsValidationErrors.value[step.id];
    });
});
```

---

## User Profile Handling

For Professional Diver applications, the profile is accessed via a single ref:

- `store.payload.user_profile.value`

On the backend, `user_profile` is resolved with an `applicationOrActive` finder (if the current application has a profile entry it is returned, otherwise the active profile is returned).

If the UI needs a status badge, use `user_profile.status` (see `ApplicantProfileCard.vue`).

---

## Loading Utilities

### isLoadingKey()

Check if a specific loading key is active.

#### Signature

```javascript
function isLoadingKey(key)
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|--------|-----------|-------------|
| `key` | `string` | Yes | Loading key identifier |

#### Usage

```javascript
const store = useApplicationStore();

if (store.isLoadingKey('application')) {
    // Application is loading
}
```

---

## Loading Patterns

### Pattern 1: Unified Loading (Recommended)

Load application and all payload data in a single API call.

```javascript
onMounted(async () => {
    const appId = route.params.appId;
    
    // Single call loads everything
    await store.loadApplication(appId, {
        withPayload: true
        // payloadKeys fetched from config automatically
    });
    
    // Ready to render
});
```

**Benefits:**
- Fewer API calls
- Better performance
- Backend optimizes payload loading
- Consistent data source

---

### Pattern 2: Two-Step Loading (Deprecated Legacy)

Load application metadata first, then load entities separately.

```javascript
onMounted(async () => {
    const appId = route.params.appId;
    
    // Step 1: Load metadata
    await store.loadApplication(appId);
    
    // Step 2: Load all entities
    await store.loadApplicationData();
    
    // Ready to render
});
```

**When to use:**
- Only while migrating older screens that have not been converted yet
- Do not introduce this pattern in new v3 work

---

### Pattern 3: On-Demand Loading

Load specific entities when needed.

```javascript
onMounted(async () => {
    const appId = route.params.appId;
    
    // Load application only
    await store.loadApplication(appId, {
        withPayload: false
    });
    
    // Load specific entity when user interacts
    async function showTeamInfo() {
        await store.loadEntity('sf_team');
        // Render team info
    }
});
```

---

## Payload Mapping

The backend uses specific payload keys that map to frontend payload refs:

| Backend Key | Frontend Ref | Description |
|--------------|---------------|-------------|
| `event` | `event` | Event information |
| `sf_team` | `sf_team` | Sport fishing team |
| `sf_participants` | `sf_participants` | Sport fishing participants |
| `user_profile` | `user_profile` | Applicant profile data |
| `user_profile_picture` | `user_profile_picture` | Applicant portrait (link + status) |
| `sport` | `sport` | Sport selection |
| `files` | `files` | Application files |
| `active_files` | `active_files` | Active target-owned files for dive-center applications |
| `quotations` | `quotations` | Quotations |
| `actions` | `actions` | Application actions |
| `center_profile` | `center_profile` | Diving center profile data |
| `active_files` | `active_files` | Active target-owned files for dive-center applications |
| `active_international_memberships` | `active_international_memberships` | Active dive-center international memberships |
| `unverified_international_memberships` | `unverified_international_memberships` | Pending dive-center international memberships on the current application |
| `center_administrators` | `center_administrators` | Dive-center administrators |
| `pd_license` | `pd_license` | Professional Diver license info (rank + card design) |
| `pd_memberships` | `pd_memberships` | Professional Diver international memberships |
| `pd_contracts` | `pd_contracts` | Professional Diver work contracts |
| `participation` | `participation` | Competition participation |
| `underwater_photography_participant` | `underwater_photography_participant` | Underwater photography participant |

---

## API Endpoints

| Environment Variable | Default Value | Description |
|-------------------|-----------------|-------------|
| `VITE_APPLICATION_BY_ID` | `applications/byId/{appId}` | Load application with payload |
| `VITE_APPLICATION_PICK_URL` | `applications/pick/{appId}` | Legacy endpoint (basic app data) |
| `VITE_APPLICATION_SUBMIT_URL` | `applications/execute/submit/{appId}` | Submit application |
| `VITE_APPLICATION_RECALL_URL` | `applications/execute/recall/{appId}` | Recall application |
| `VITE_APPLICATION_DELETE_URL` | `applications/delete/{appId}` | Delete application |

---

## Integration with application-config.js

The store integrates with `application-config.js` for:

1. **Payload Keys**: `getPayloadKeys(applicationType)` - Get payload keys for application type
2. **Data Loaders**: `getDataLoaders(applicationType)` - Get entity loaders
3. **Blocking Steps**: `getBlockingSteps(applicationType)` - Get required steps

### Dive-center file buckets

For dive-center applications, the store now carries two separate file arrays:

- `store.payload.files.value`
  - application-scoped evidence rows from the canonical `files` table, filtered by `application_id`
- `store.payload.active_files.value`
  - active target-owned rows from `files`

Current implementation note:
- `ActiveFilesCard.vue` renders `store.payload.active_files.value` as a separate `Current Files` section
- `FilesCard.vue` remains generic and renders the application evidence bucket from `store.payload.files.value`
- required files are treated as satisfied if the configured label exists in either bucket
- dive-center-specific dynamic required files still belong in `application-config.js`, not in the store
- New consumers must use the canonical `files` row shape (`name`, `path`, dates/status when needed). Do not add new reads for legacy `applications_files` fields such as `caption`, `link`, or `type`.

### Example Config Integration

```javascript
// application-config.js
export const APPLICATION_CONFIG = {
    'sport-fishing-competition-team-registration': {
        payloadKeys: ['event', 'sf_team', 'sf_participants', 'files', 'actions'],
        steps: [
            { id: 'sf_team', label: 'Team Information', blocking: true },
            { id: 'sf_participants', label: 'Team Participants', blocking: true }
        ]
    }
};

// Component usage
import { getPayloadKeys } from '@/v3/config/application-config';

const store = useApplicationStore();

await store.loadApplication(123, {
    withPayload: true,
    payloadKeys: getPayloadKeys('sport-fishing-competition-team-registration')
});
```

---

## Error Handling

The store throws errors for:

- Network failures
- API errors (4xx, 5xx)
- Validation failures
- Missing application ID

Always wrap calls in try-catch:

```javascript
try {
    await store.loadApplication(appId);
} catch (err) {
    if (err?.status === 404) {
        // Handle not found
    } else {
        // Handle other errors
    }
}
```

---

## Best Practices

### 1. Use Unified Loading

```javascript
// ✅ Good - Single API call
await store.loadApplication(appId, { withPayload: true });

// ❌ Avoid - Multiple API calls
await store.loadApplication(appId);
await store.loadEntity('event');
await store.loadEntity('sf_team');
await store.loadEntity('files');
```

### 2. Check Loading States

```javascript
// ✅ Good - Check before loading
if (!store.isLoadingKey('application')) {
    await store.loadApplication(appId);
}

// ❌ Avoid - Unnecessary duplicate calls
await store.loadApplication(appId);
await store.loadApplication(appId); // Skipped by guard
```

### 3. Use Computed Properties

```javascript
// ✅ Good - Reactive
if (store.canSubmitApplication.value) {
    // Enable submit button
}

// ❌ Avoid - Manual checking
if (Object.keys(store.stepsValidationErrors.value).length === 0) {
    // Enable submit button
}
```

### 4. Reset State When Switching

```javascript
// ✅ Automatic - Store handles this
await store.loadApplication(newAppId); // Resets old payload

// ❌ Avoid - Manual reset
store.resetPayload();
await store.loadApplication(newAppId);
```

---

## Migration Guide

### From v2.4.0 to v2.5.0

**Before (v2.4.0):**
```javascript
onMounted(async () => {
    const appId = route.params.appId;
    
    await store.loadApplication(appId, {
        withPayload: true
        // payloadKeys from config automatically
    });
    // Legacy two-step loading (backward compatible):
    // await store.loadApplication(appId);
    // await store.loadApplicationData();
});
```

**After (v2.5.0):**
```javascript
onMounted(async () => {
    const appId = route.params.appId;
    
    await store.loadApplication(appId, {
        withPayload: true
    });
});
```

**Key Changes:**
1. `loadApplication()` now accepts `options` object
2. `withPayload` parameter (default: `true`)
3. `payloadKeys` parameter for specific entities
4. `forceReload` option still supported
5. Legacy signature `loadApplication(appId, forceReload)` still works

---

## Version History

### v2.6.0 (Current, 2026-02-01)
- Added step primary action registry for summary `Next` navigation (`registerStepPrimaryAction`, etc.)
- Added `nextIncompleteStepId` computed helper
- Summary UX encourages per-card guidance instead of aggregating all errors in one banner

### v2.5.0 (2026-01-26)
- Updated `loadApplication()` to support an options object
- Added `withPayload`, `payloadKeys`, `forceReload` options
- Added support for backend `byId` endpoint with payload query parameters
- Added payload mapping from backend keys to frontend refs
- Maintained backward compatibility with the legacy signature

### v2.4.0
- Added `submitApplication`, `recallApplication`, `deleteApplication` actions
- Added `reloadApplicationPayload` method
- Updated API endpoints with placeholder pattern
- Complete state management for application lifecycle

---

## See Also

- [application-config.js](../../../src/v3/config/application-config.js) - Application configuration
- [ApplicationPayloadComponent](../../../../api/src/Controller/Component/ApplicationPayloadComponent.php) - Backend payload loading
- [ApplicationsController](../../../../api/src/Controller/Api/ApplicationsController.php) - Backend API endpoints
