# Application Payload System

**Version:** 1.4.0  
**Last Updated:** 2026-04-22

Overview of the unified payload loading system for application-related entities.

---

## Overview

The payload system provides a centralized way to load application-related entities from the backend. Instead of making multiple API calls for each entity, the system uses a single request with query parameters to fetch all required data at once.

### Frontend Deprecation Rules

- `store.loadApplicationData()` is deprecated for new v3 work.
- Direct frontend dependence on `application.purpose` is deprecated for new v3 work.
- New code must resolve the configured application type from `flow` first and use `purpose` only as a temporary compatibility fallback.

---

## Architecture

### Frontend (Vue.js)

```
Component (ApplicationSummary.vue)
    ↓
useApplicationStore.loadApplication(appId, options)
    ↓
application-config.js (getPayloadKeys)
    ↓
Backend API (applications/byId/{appId}?with-payload=true&payload[]=key1&payload[]=key2)
    ↓
Response: { application, event, sf_team, files, ... }
    ↓
Payload refs populated
    ↓
Components render with data
```

### Backend (PHP/CakePHP)

```
ApplicationsController::byId($id)
    ↓
ApplicationPayloadComponent::resolveKeys(purpose, requestedKeys)
    ↓
ApplicationPayloadComponent::loadPayload(keys, application)
    ↓
Load entities from database
    ↓
Return: { application, payload_data }
```

---

## Payload Keys

### What are Payload Keys?

Payload keys are identifiers for application-related entities that can be loaded from the backend. Each application type has a specific set of payload keys it needs.

### Available Payload Keys

| Key | Description | Application Types |
|------|-------------|-------------------|
| `event` | Event information | Sport Fishing, Jetski, Freediving |
| `sf_team` | Sport fishing team | Sport Fishing Competition |
| `sf_participants` | Sport fishing participants | Sport Fishing Competition |
| `user_profile` | Applicant profile data | Athlete Registration, Professional Diver |
| `user_profile_picture` | Applicant portrait (link + status) | Athlete Registration, Professional Diver, Motorized Water Sports |
| `pd_license` | Professional Diver license info (rank + card design) | Professional Diver |
| `pd_memberships` | Professional Diver international memberships | Professional Diver |
| `pd_contracts` | Professional Diver work contracts | Professional Diver |
| `sport` | Sport selection | Athlete Registration |
| `files` | Application-scoped files from the canonical `files` table, filtered by `application_id` | All types |
| `active_files` | Active target-owned files from `files` | Diving Center |
| `quotations` | Quotations | All types |
| `actions` | Application actions | All types |
| `center_profile` | Diving center profile data | Diving Center |
| `active_international_memberships` | Active dive-center international memberships | Diving Center |
| `unverified_international_memberships` | Pending dive-center international memberships on the current application | Diving Center |
| `center_administrators` | Dive-center administrators | Diving Center |
| `participation` | Competition participation | Jetski, Freediving |
| `underwater_photography_participant` | Underwater photography participant | Underwater Photography |

### User Profile Handling

For Professional Diver applications, the backend returns a single `user_profile` payload key resolved via the `applicationOrActive` finder:

- If the current application has a profile entry, it is returned (even if Unverified).
- Otherwise, the active profile is returned.

On the frontend:
- Read it from `store.payload.user_profile.value`
- Use `user_profile.status` to show "Verified" / "Unverified" (see `ApplicantProfileCard.vue`)

---

## Configuration

### Frontend Configuration

Payload keys are defined in `application-config.js` for each application type:

```javascript
export const APPLICATION_CONFIG = {
    'sport-fishing-competition-team-registration': {
        payloadKeys: ['event', 'sf_team', 'sf_participants', 'files', 'quotations', 'actions'],
        // ... other config
    },
    
    'athlete-registration': {
        payloadKeys: ['user_profile', 'user_profile_picture', 'sport', 'files', 'quotations', 'actions'],
        // ... other config
    },
    
    'Professional Diver New License': {
        payloadKeys: ['user_profile', 'pd_license', 'user_profile_picture', 'pd_memberships', 'pd_contracts', 'files', 'quotations', 'actions'],
        // ... other config
    }
};
```

Required files for the shared files step are also resolved from `application-config.js` through:

```javascript
getRequiredFiles(applicationType, payload)
```

Rules:
- shared components must not hardcode dive-center-specific labels such as `Logo`
- `FilesCard.vue` stays generic
- required file labels come from config, including payload-derived additions when the application type defines them
- for dive-center applications, required files are checked against both:
  - `store.payload.files.value`
  - `store.payload.active_files.value`

### Backend Configuration

Payload keys are defined in `ApplicationPayloadComponent.php`:

```php
private array $flowPayload = [
    'sport-fishing-competition-team-registration' => ['event','sf_team','sf_participants','files','quotations','actions'],
    'athlete-registration' => ['user_profile','user_profile_picture','sport','files','quotations','actions'],
    'water_sports_new_athlete_membership' => ['user_profile','user_profile_picture','sport','files','quotations','actions'],
    'water_sports_athlete_membership_renewal' => ['user_profile','user_profile_picture','sport','files','quotations','actions'],
    'motorized_water_sports_new_license' => ['user_profile','user_profile_picture','sport','files','quotations','actions'],
    'motorized_water_sports_new_athlete_membership' => ['user_profile','user_profile_picture','sport','files','quotations','actions'],
    'motorized_water_sports_license_renewal' => ['user_profile','user_profile_picture','sport','files','quotations','actions'],
    'motorized_water_sports_athlete_membership_renewal' => ['user_profile','user_profile_picture','sport','files','quotations','actions'],
    'Professional Diver New License' => ['user_profile','pd_license','user_profile_picture','pd_memberships','pd_contracts','files','quotations','actions'],
    'Professional Diver License Renewal' => ['user_profile','pd_license','user_profile_picture','pd_memberships','pd_contracts'],
    'Diving Center New Membership' => ['center_profile','active_files','active_international_memberships','unverified_international_memberships','center_administrators','files','quotations','actions'],
    'Diving Center Membership Renewal' => ['center_profile','active_files','active_international_memberships','unverified_international_memberships','center_administrators','files','quotations','actions'],
    'Diving Center Information Update' => ['center_profile','active_files','active_international_memberships','unverified_international_memberships','center_administrators','files','quotations','actions'],
    'Diving Center Administrators Update' => ['center_profile','active_files','active_international_memberships','unverified_international_memberships','center_administrators','files','quotations','actions'],
];
```

### Diving-center note

- The backend summary payload for dive-center applications includes:
  - `center_profile`
  - `active_files`
  - `active_international_memberships`
  - `unverified_international_memberships`
  - `center_administrators`
  - `files`
  - `quotations`
  - `actions`
- The current website v3 summary flow explicitly requests:
  - `center_profile`
  - `active_files`
  - `active_international_memberships`
  - `unverified_international_memberships`
  - `center_administrators`
- `files` and `active_files` are different buckets from the same canonical table:
  - `files` returns application evidence rows from `files`, scoped by `application_id`
  - `active_files` returns active target-owned rows from `files`, scoped by `model` and `foreign_key`
- For dive centers, approved logo files now live in `active_files` after approval with `model = DiveCenters`, `foreign_key = diving_centers.id`, `name = Logo`, and `status = active`.
- Do not use legacy `applications_files` shape (`caption`, `link`, `type`) in new payload consumers. Use `name` and `path` from `files`.
- Current frontend rule:
  - `ActiveFilesCard.vue` renders `active_files` as a separate `Current Files` section
  - `FilesCard.vue` stays generic and renders the application evidence bucket from `files`
  - required files are considered satisfied if the required label exists in either `files` or `active_files`
- Dive-center dynamic required files now come from config:
  - `getRequiredFiles(applicationType, payload)`
  - current derived rule adds `${organization} Membership Certificate`
  - source rows are pending `unverified_international_memberships` with `action = register`
- Focused v3 update pages now exist for:
  - `center_profile`
  - `diving_activities`
  - `center_administrators`
- International-memberships rows in payload are canonical-only:
  - `organization`
  - `number`
  - `diving_type` (JSON array)
  - `action`
  - `status`
  - `expiry_date`
  - `certificate_url`
- Approval rule note:
  - a newly approved `register` membership inactivates previous active memberships for the same dive center and organization, excluding rows from the same application
- Do not depend on deprecated aliases such as `organization_name`, `membership_number`, `expiry_on`, or `link`.

### Athlete sport payload shape

For new athlete applications, sport is loaded as a minimal object:

```json
{
  "sport": {
    "code": "freediving"
  }
}
```

For athlete renewal and license-upgrade applications, the same `sport` key is decorated by `ApplicationsController::byId()` with current registration details:

```json
{
  "sport": {
    "code": "jetski",
    "registration_type": "membership",
    "status": "Expired",
    "expiry_date": "2025-12-31",
    "category": "senior"
  }
}
```

---

## API Usage

### Endpoint

```
GET /applications/byId/{appId}?with-payload=true&payload[]=key1&payload[]=key2
```

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|--------|-----------|----------|-------------|
| `with-payload` | `boolean` | No | `false` | Include payload in response |
| `payload[]` | `string` | No | `[]` | Payload keys to load (array parameter) |

### Example Requests

```bash
# Load application with all payload keys
GET /applications/byId/123?with-payload=true&payload[]=event&payload[]=sf_team&payload[]=sf_participants&payload[]=files&payload[]=actions

# Load application without payload
GET /applications/byId/123

# Load application with specific payload keys
GET /applications/byId/123?with-payload=true&payload[]=event&payload[]=files
```

### Response Structure

```json
{
  "application": {
    "id": 123,
    "purpose": "sport-fishing-competition-team-registration",
    "stage": "draft",
    "status": "Incomplete",
    ...
  },
  "purpose": "sport-fishing-competition-team-registration",
  "keys": ["event", "sf_team", "sf_participants", "files", "quotations", "actions"],
  "event": {
    "id": 456,
    "name": "Annual Fishing Competition 2025",
    ...
  },
  "sf_team": {
    "id": 789,
    "name": "Team Sharks",
    ...
  },
  "sf_participants": [
    { "id": 1, "name": "John Doe" },
    { "id": 2, "name": "Jane Smith" }
  ],
  "files": [
    { "id": 1, "name": "Boat Registration Certificate", "path": "applications_files/..." }
  ],
  "active_files": [
    { "id": 9, "name": "Logo", "path": "files/dive-centers/logo.png", "status": "active" }
  ],
  "quotations": [],
  "actions": [
    { "id": 1, "action": "Created", "created": "2025-01-01" }
  ]
}
```

`purpose` remains in the response for backend and legacy compatibility. New frontend work should not use it directly as the primary application-type source.

---

## Frontend Implementation

### Using useApplicationStore

```javascript
import { useApplicationStore } from '@/v3/composables/application/useApplicationStore.js';

const store = useApplicationStore();

// Load application with payload
await store.loadApplication(123, {
    withPayload: true,
    payloadKeys: ['event', 'sf_team', 'files', 'actions']
});

// Access payload data
console.log(store.payload.event.value);      // Event data
console.log(store.payload.sf_team.value);     // Team data
console.log(store.payload.files.value);       // Files array
console.log(store.payload.actions.value);     // Actions array
```

### Using getPayloadKeys Helper

```javascript
import { getPayloadKeys } from '@/v3/config/application-config';

// Get payload keys for application type
const keys = getPayloadKeys('sport-fishing-competition-team-registration');
// Returns: ['event', 'sf_team', 'sf_participants', 'files', 'quotations', 'actions']

// Use in loadApplication
await store.loadApplication(123, {
    withPayload: true,
    payloadKeys: keys
});
```

### Automatic Payload Key Resolution

If `payloadKeys` is not provided, the store automatically fetches them from config using the configured application type, preferring `flow` when it maps to a known config and otherwise falling back to `purpose` only for legacy compatibility:

```javascript
// This will automatically get payload keys from config
await store.loadApplication(123, {
    withPayload: true
    // payloadKeys will be resolved from the configured application type
});
```

---

## Backend Implementation

### ApplicationsController::byId()

```php
public function byId($id)
{
    $this->request->allowMethod(['get']);

    if(!is_numeric($id )) {
        return $this->response->withType('application/json')
        ->withStatus(404);
    }

    $application = $this->fetchTable('Applications')->find( 'all') 
        ->where([ 'Applications.id' => $id])
        ->firstOrFail();
    
    $this->Authorization->authorize( $application , 'view');

    $withPayload = filter_var($this->request->getQuery('with-payload'), FILTER_VALIDATE_BOOL);
    $requestedKeys = (array)$this->request->getQuery('payload', []); 
    
    $response = [
        'application' =>$application,
        '$withPayload' => $withPayload, 
        '$requestedKeys' => $requestedKeys , 
    ];
  
    if ($withPayload) {
        $response ['purpose'] =(string)$application->purpose ;
        $keys = $this->ApplicationPayload->resolveKeys((string)$application->purpose, $requestedKeys);
        $response ['keys'] = $keys;
        $response += $this->ApplicationPayload->loadPayload($keys, $application);
        $response ['actions'] = $this->fetchTable('ApplicationsActions')->find( 'ApplicantNotes' ,['appId' => $application->id ]) 
            ->all();
    }

    return $this->response 
        ->withStatus(200)
        ->withType('application/json')
        ->withStringBody(json_encode( $response  ));
}
```

### ApplicationPayloadComponent::resolveKeys()

```php
public function resolveKeys(string $flow, array $requested): array
{ 
    $available = $this->flowPayload[$flow] ?? ['files','actions'];
    
    if (!empty($requested)) {
        return array_values(array_intersect($requested, $available));  
    }
    
    return $available; 
}
```

### ApplicationPayloadComponent::loadPayload()

```php
public function loadPayload(array $keys, $app): array
{
    $data = [];
    foreach ($keys as $key) {
        $data[$key] = $this->loadKey($key, $app);
    }
    return $data;
}

private function loadKey(string $key, $app)
{
    return match ($key) {
        'user_profile' => $this->fetchTable('UsersProfileEntries')->find('applicationOrActive', ['app_id' => $app->id, 'user_id' => $app->user_id])->first(),
        'user_profile_picture' => $this->fetchTable('UsersProfilePictureEntries')->find('applicationOrActive', ['app_id' => $app->id, 'user_id' => $app->user_id])->first(),
        'event' => $this->fetchTable('Events')->find('byApplication', ['application_id' => $app->id])->first(),
        'sf_team' => $this->fetchTable('EventsFishingTeams')->find('byApplication', ['application_id' => $app->id])->first(),
        'sf_participants' => $this->fetchTable('EventsFishingParticipants')->find('byApplication', ['application_id' => $app->id])->all(),
        'files' => $this->fetchTable('ApplicationsFiles')->find('all')->where(['application_id' => $app->id])->all(),
        'active_files' => $this->loadActiveFiles($app),
        'quotations' => $this->fetchTable('ApplicationQuotations')->find('byApplication', ['application_id' => $app->id])->all(),
        'actions' => $this->fetchTable('ApplicationActions')->find('byApplication', ['application_id' => $app->id])->orderDesc('created_at')->all(),
        'pd_license' => $this->loadPDLicense($app),
        'pd_memberships' => $this->loadPDMemberships($app),
        'pd_contracts' => $this->loadPDContracts($app),
        'center' => $this->fetchTable('DivingCentersApplications')->find('byApplication', ['application_id' => $app->id])->first(),
        'owner' => $this->fetchTable('DivingCentersApplications')->Owners->find('byApplication', ['application_id' => $app->id])->first(),
        'manager' => $this->fetchTable('DivingCentersApplications')->Managers->find('byApplication', ['application_id' => $app->id])->first(),
        default => null,
    };
}
```

---

## Payload Mapping

### Backend to Frontend Mapping

The frontend maps backend payload keys to its internal payload refs:

```javascript
const payloadMapping = {
    'event': 'event',
    'sf_team': 'sf_team',
    'sf_participants': 'sf_participants',
    'user_profile': 'user_profile',
    'user_profile_picture': 'user_profile_picture',
    'sport': 'sport',
    'files': 'files',
    'active_files': 'active_files',
    'quotations': 'quotations',
    'actions': 'actions',
    'center_profile': 'center_profile',
    'active_international_memberships': 'active_international_memberships',
    'unverified_international_memberships': 'unverified_international_memberships',
    'center_administrators': 'center_administrators',
    'pd_license': 'pd_license',
    'pd_memberships': 'pd_memberships',
    'pd_contracts': 'pd_contracts',
    'participation': 'participation',
    'underwater_photography_participant': 'underwater_photography_participant'
};
```

### Why Single Ref?

The store uses a single `ref` for `user_profile`:
- Profile data is stored in a reactive ref
- Simplifies profile access and management
- Profile status is determined by the profile's verification status

---

## Benefits

### 1. Reduced API Calls

**Before (Multiple Calls):**
```javascript
await apiGet('/applications/pick/123');
await apiGet('/events/by-application/123');
await apiGet('/sf-teams/by-application/123');
await apiGet('/sf-participants/by-application/123');
await apiGet('/files/by-application/123');
// 5 API calls
```

**After (Single Call):**
```javascript
await store.loadApplication(123, {
    withPayload: true,
    payloadKeys: ['event', 'sf_team', 'sf_participants', 'files']
});
// 1 API call
```

### 2. Better Performance

- Backend optimizes database queries
- Single database transaction
- Reduced network latency
- Faster page load times

### 3. Consistent Data Source

- Backend controls payload structure
- Single source of truth
- Reduced data inconsistency
- Easier debugging
- Diving-center files now have an explicit split between:
  - application evidence in `files`
  - active target-owned assets in `active_files`

### 4. Flexible Loading

```javascript
// Load only what you need
await store.loadApplication(123, {
    withPayload: true,
    payloadKeys: ['event', 'files']  // Only load event and files
});

// Or load everything from config
await store.loadApplication(123, {
    withPayload: true
    // payloadKeys from config automatically
});
```

### 5. Backward Compatibility

```javascript
// Deprecated - legacy compatibility only
await store.loadApplication(123);
await store.loadApplicationData();

// Still works - legacy signature
await store.loadApplication(123, true);  // forceReload = true
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
```

### 2. Define Payload Keys in Config

```javascript
// ✅ Good - Centralized configuration
'sport-fishing-competition-team-registration': {
    payloadKeys: ['event', 'sf_team', 'sf_participants', 'files', 'actions']
}

// ❌ Avoid - Hardcoded keys
await store.loadApplication(appId, {
    payloadKeys: ['event', 'sf_team', 'sf_participants', 'files', 'actions']
});
```

### 3. Use Helper Functions

```javascript
// ✅ Good - Use helper
import { getPayloadKeys } from '@/v3/config/application-config';

const keys = getPayloadKeys(applicationType);
await store.loadApplication(appId, { payloadKeys: keys });

// ❌ Avoid - Manual lookup
const config = APPLICATION_CONFIG[applicationType];
const keys = config.payloadKeys;
await store.loadApplication(appId, { payloadKeys: keys });
```

### 4. Keep Backend and Frontend in Sync

```php
// Backend: ApplicationPayloadComponent.php
private array $flowPayload = [
    'sport-fishing-competition-team-registration' => ['event','sf_team','sf_participants','files','actions'],
];
```

```javascript
// Frontend: application-config.js
'sport-fishing-competition-team-registration': {
    payloadKeys: ['event', 'sf_team', 'sf_participants', 'files', 'actions'],
}
```

---

## Troubleshooting

### Issue: Payload Not Loading

**Symptoms:**
- `payload.event.value` is null
- Components show no data

**Solutions:**

1. Check `withPayload` parameter:
```javascript
await store.loadApplication(appId, {
    withPayload: true  // Must be true
});
```

2. Check payload keys configuration:
```javascript
const keys = getPayloadKeys(applicationType);
console.log('Payload keys:', keys);  // Should not be empty
```

3. Check backend response:
```javascript
const res = await apiGet(endpoint);
console.log('Response:', res);  // Check if payload data exists
```

### Issue: Missing Payload Key

**Symptoms:**
- Specific entity not loaded
- Backend returns null for that key

**Solutions:**

1. Check if key is in config:
```javascript
const config = APPLICATION_CONFIG[applicationType];
console.log('Config payloadKeys:', config.payloadKeys);
```

2. Check backend configuration:
```php
// ApplicationPayloadComponent.php
$available = $this->flowPayload[$flow] ?? ['files','actions'];
```

3. Check if key is valid:
```javascript
// Valid keys: event, sf_team, sf_participants, user_profile, etc.
// Invalid keys are ignored by backend
```

### Issue: Backend-Frontend Mismatch

**Symptoms:**
- Data loaded but not accessible
- Wrong ref is populated

**Solutions:**

1. Check payload mapping:
```javascript
const payloadMapping = {
    'center_profile': 'center_profile',  // Backend key -> Frontend ref
    'active_files': 'active_files',
    // ...
};
```

2. Check payload ref names:
```javascript
const payload = {
    center_profile: ref(null),  // Must match mapping
    active_files: ref([]),
    // ...
};
```

---

## Error Handling

### Common Error Scenarios

#### 1. Payload Not Loading

**Symptoms:**
- `payload.event.value` is null
- `payload.sf_team.value` is null
- Components show no data

**Solutions:**

1. **Check `withPayload` parameter:**
```javascript
await store.loadApplication(appId, {
    withPayload: true  // Must be true
});
```

2. **Check payload keys configuration:**
```javascript
const keys = getPayloadKeys(applicationType);
console.log('Payload keys:', keys);  // Should not be empty
```

3. **Check backend response:**
```javascript
const res = await apiGet(endpoint);
console.log('Response:', res);  // Check if payload data exists
```

#### 2. API Errors

**400 Bad Request:**
```javascript
try {
    await store.loadApplication(appId, { withPayload: true });
} catch (err) {
    if (err.status === 400) {
        // Invalid payload keys or malformed request
        console.error('Bad Request:', err);
    }
}
```

**403 Forbidden:**
```javascript
try {
    await store.loadApplication(appId, { withPayload: true });
} catch (err) {
    if (err.status === 403) {
        // User doesn't have permission to view application
        console.error('Forbidden:', err);
    }
}
```

**404 Not Found:**
```javascript
try {
    await store.loadApplication(appId, { withPayload: true });
} catch (err) {
    if (err.status === 404) {
        // Application doesn't exist
        console.error('Not Found:', err);
        // Navigate to error page
        router.replace({ name: 'error-404' });
    }
}
```

**422 Validation Error:**
```javascript
try {
    await store.loadApplication(appId, { withPayload: true });
} catch (err) {
    if (err.status === 422) {
        // Invalid payload keys or data validation failed
        console.error('Validation Error:', err);
    }
}
```

**500 Server Error:**
```javascript
try {
    await store.loadApplication(appId, { withPayload: true });
} catch (err) {
    if (err.status >= 500) {
        // Internal server error
        console.error('Server Error:', err);
    }
}
```

### Error Handling Best Practices

```javascript
// ✅ Good - Use try-catch with specific error handling
try {
    await store.loadApplication(appId, { withPayload: true });
} catch (err) {
    // Handle specific error codes
    if (err.status === 404) {
        router.replace({ name: 'error-404' });
    } else if (err.status === 403) {
        // Show validation errors
        console.error('Bad Request:', err);
    } else {
        // Generic error handling
        useErrorHandler().capture(err, {
            context: 'ApplicationSummary.loadApplication',
            fallback: 'Failed to load application',
            meta: { applicationId }
        });
    }
}
```

---

## See Also

- [useApplicationStore.md](../composables/useApplicationStore.md) - Store documentation
- [application-config.js](../../../src/v3/config/application-config.js) - Frontend config (payloadKeys + steps + layouts)
- [ApplicationPayloadComponent.php](../../../../api/src/Controller/Component/ApplicationPayloadComponent.php) - Backend implementation
- [ApplicationsController.php](../../../../api/src/Controller/Api/ApplicationsController.php) - API endpoints
