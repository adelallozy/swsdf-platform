# Professional Diver New License Refactoring - Gap Analysis

## Status Update (2026-01-26)
- ✅ Profile prefill + pre-validation integrated in v3 `NewLicense.vue` using `newLicenseProfile`.
- ✅ License Information (rank + card design) implemented via `UpdateLicenseInformations.vue` + `PDLicenseInformationCard.vue` using payload key `pd_license`.
- Remaining items in this document may still apply (validation strictness, address serialization, etc.).

## Executive Summary
- The v3 new license flow integrates `newLicenseProfile` for profile prefill and duplicate-prevention (legacy used `VITE_APPS_USERS_PROFILES_PICK`).
- The v3 schema adds a required email field and tightens some validation rules (name length, mobile format), which can reject inputs previously accepted.
- The v3 payload serializer omits `address`, even though the field is present in the form, which risks data loss or backend validation errors.
- Error handling is more structured in v3 (409/422 handling, notifications, redirects), but the legacy flow had minimal fetch error handling.
- License Information (rank + card design) is now captured in a separate step and shown on the summary (see `pd_license` payload).

## Component Comparison

| Legacy Component | v3 Component(s) | Key Differences |
| --- | --- | --- |
| `src/platform/views/Applications/professional-divers/NewLicense.vue` | `src/v3/pages/applications/professional-divers/NewLicense.vue` | Legacy loads profile via `VITE_APPS_USERS_PROFILES_PICK` and posts raw form values. v3 loads profile via `newLicenseProfile`, uses `serializeProfile`, adds structured error handling, and includes locale in routing. |
| `src/platform/components/applications/UserProfileForm.vue` | `src/v3/components/Forms/MasterForm.vue` + `src/v3/schema/userProfile.js` | Legacy uses VeeForm + yup, with field definitions inside the component. v3 uses MasterForm + Valibot schema, adds `email`, and changes validation rules. |
| N/A | `src/v3/pages/applications/professional-divers/UpdateLicenseInformations.vue` + `src/v3/components/applications/cards/PDLicenseInformationCard.vue` | License information step (rank + card design) is handled as a separate step using payload key `pd_license`. |
| N/A (reference only) | `src/v3/pages/applications/UserProfileUpsert.vue` | Shows v3 data-loading pattern via store + payload; not used in new license flow but relevant for prefill behavior. |

## Feature Matrix

| Feature | Legacy (NewLicense/UserProfileForm) | v3 (NewLicense.vue + schema) | Status | Notes |
| --- | --- | --- | --- | --- |
| License validation pre-check | No explicit pre-check | No explicit pre-check | Match | v3 handles 409 on submit; legacy does not. |
| Profile fetching/prefill | GET `VITE_APPS_USERS_PROFILES_PICK` | GET `newLicenseProfile` integrated | Match | v3 pre-fills initial values when a profile exists. |
| Profile form display | `UserProfileForm` | `MasterForm` | Match | Different component/approach. |
| Loading state (initial) | `loader` while profile fetch | spinner while initializing (profile + regions/cities) | Match | Same UX goal, different implementation. |
| Submit handler | `axios.post(NEW_LICENSE, values)` | `apiPost(..., serializeProfile(formData))` | Different | v3 transforms payload. |
| Error handling | Toast with `statusText` | Notifications, 409/422 handling, redirects | Different | v3 more structured. |
| Success navigation | `application-home` | `app-summary` + locale | Different | v3 goes to summary workflow after create. |
| Breadcrumbs | Present | Present | Match | v3 adds locale param. |
| Data transformation | None | `serializeProfile` trims/filters | Different | `address` dropped. |
| Region/city cascade | Filter cities after region change | Filter cities on field-change | Different | v3 initially shows all cities. |
| Validation library | yup | Valibot | Different | Rules differ. |
| Email field | Not present | Required | New | Adds required input. |
| Address submission | Included in form data | Omitted from payload | Missing | Potential regression. |
| Conflict handling | None | 409 messaging + optional redirect | New | Redirects if message implies license. |

## Data Flow Comparison

Legacy flow:
- `NewLicense.vue` loads profile -> `UserProfileForm.vue` pre-fills -> submit raw form values -> POST new license -> navigate.

v3 flow:
- `NewLicense.vue` loads profile (newLicenseProfile) + regions/cities -> `MasterForm` renders schema -> submit serialized payload -> POST new license -> handle 409/422 -> navigate or redirect.

```mermaid
flowchart LR
  subgraph Legacy
    L1[NewLicense.vue] -->|GET VITE_APPS_USERS_PROFILES_PICK| L2[profile]
    L2 --> L3[UserProfileForm.vue]
    L3 -->|submit values| L4[axios POST VITE_PROFESSIONAL_DIVERS_NEW_LICENSE]
    L4 --> L5[router push application-home]
  end

  subgraph V3
    V1[NewLicense.vue (v3)] -->|GET newLicenseProfile| V0[profile (prefill)]
    V1 -->|GET addresses/common| V2[regions/cities]
    V2 --> V3[MasterForm + userProfile schema]
    V3 -->|serializeProfile| V4[apiPost VITE_PROFESSIONAL_DIVERS_NEW_LICENSE]
    V4 --> V5[409/422 handling + notifications]
    V4 --> V6[router push app-summary]
  end
```

## API Endpoint Mapping

| Purpose | Legacy | v3 | Notes |
| --- | --- | --- | --- |
| Fetch profile | `VITE_APPS_USERS_PROFILES_PICK` | `/professional-divers-applications/new-license-profile` | Integrated in v3 `NewLicense.vue`. |
| Load regions/cities | `addresses/common` | `addresses/common` | Same endpoint, different component level. |
| Submit new license | `VITE_PROFESSIONAL_DIVERS_NEW_LICENSE` | `VITE_PROFESSIONAL_DIVERS_NEW_LICENSE` | Same env var. |
| License check | Not used | Handled by `newLicenseProfile` endpoint | Backend endpoint performs pre-validation. |

## Form Field Mapping

| Field | Legacy Name | v3 Name | Type | Notes |
| --- | --- | --- | --- | --- |
| Full name (Arabic) | `name_ar` | `name_ar` | text | v3 max length reduced (120 -> 100). |
| Full name (English) | `name_en` | `name_en` | text | v3 max length reduced (120 -> 100). |
| Identity number | `identity_number` | `identity_number` | text | v3 enforces exact length 10. |
| Birthdate | `birthdate` | `birthdate` | date | v3 uses DatePicker type. |
| Gender | `gender` | `gender` | select | Same values. |
| Nationality | `nationality` | `nationality` | text | v3 adds max length 100. |
| Mobile | `mobile` | `mobile` | text | Regex changed. |
| Region | `region_id` | `region_id` | select | v3 allows string/number and requires selection. |
| City | `city_id` | `city_id` | select | v3 allows string/number and requires selection. |
| Address | `address` | `address` | text | v3 optional and not serialized. |
| Email | N/A | `email` | email | New required field in v3. |

## Validation Rule Comparison

| Field | Legacy (yup) | v3 (Valibot) | Difference |
| --- | --- | --- | --- |
| `name_ar` | max 120 + Arabic regex | max 100 + Arabic regex | Stricter length in v3. |
| `name_en` | English regex | max 100 + English regex | Stricter length in v3. |
| `identity_number` | regex `^[12]\\d{9}$` | regex + min/max length 10 | Equivalent but more explicit in v3. |
| `mobile` | regex `^0*5\\d{8}$` | regex `^(?:9665\\d{8}|05\\d{8})$` | Different accepted formats. |
| `email` | Not present | Required + email regex | New requirement. |
| `address` | No validation rule | max length 255, optional | Validation added but not submitted. |
| `region_id`/`city_id` | digits-only string | string/number + selection check | Type handling differs. |

## Gap Details (with Evidence)

### 1) Profile prefill removed in v3 (backend endpoint available)
Why it matters: Users previously had profile data pre-loaded and now must re-enter everything. The backend now provides a `newLicenseProfile` endpoint that performs validation and returns the active profile, but the v3 frontend does not yet integrate it.

Backend evidence (new endpoint):
```php
// api/src/Controller/Api/ProfessionalDiversApplicationsController.php (lines 853-913)
public function newLicenseProfile()
{
    $this->request->allowMethod(['get']);
    $this->Authorization->skipAuthorization();

    $professionalDiversTable = $this->fetchTable('ProfessionalDivers');
    $applicationsTable = $this->fetchTable('Applications');

    // Check if user already has a license
    $hasLicense = $professionalDiversTable->exists(['user_id' => $this->userId]);
    if ($hasLicense) {
        return $this->response
            ->withStatus(409, 'You already have a license')
            ->withType('application/json');
    }

    // Check for in-progress applications
    $inProgressApplication = $applicationsTable->find()
        ->select(['id', 'purpose', 'stage'])
        ->where([
            'user_id' => $this->userId,
            'target' => 'Professional Divers',
            'status NOT IN' => ['Canceled', 'Closed', 'Rejected', 'Approved', 'Completed'],
            'stage IN' => [
                'Data Entry',
                'Data Verification',
                'Technical Review',
                'Financial Audit',
                'Management Approval'
            ]
        ])
        ->first();

    if ($inProgressApplication) {
        return $this->response
            ->withStatus(409, 'You already have an in-progress application')
            ->withType('application/json')
            ->withStringBody(json_encode([
                'application_id' => $inProgressApplication->id,
            ]));
    }

    // Load active user profile from UsersProfileEntries
    $activeProfile = $this->fetchTable('UsersProfileEntries')->find()
        ->where([
            'user_id' => $this->userId,
            'status' => 'Active'
        ])
        ->first();

    // Return 200 with the profile (can be null if no active profile)
    return $this->response
        ->withStatus(200)
        ->withType('application/json')
        ->withStringBody(json_encode([
            'profile' => $activeProfile
        ]));
}
```

Legacy evidence:
```vue
// src/platform/views/Applications/professional-divers/NewLicense.vue
axios.get(USERS_PROFILE).then(setUserProfile).catch(onFetchFailure);
...
<UserProfileForm :profile="profile" ... />
```

```js
// src/platform/components/applications/UserProfileForm.vue
for (let [key, value] of Object.entries(props.profile)) {
  if (formData.hasOwnProperty(key)) {
    formData[key] = value;
  }
}
```

v3 evidence (not using the new endpoint):
```js
// src/v3/pages/applications/professional-divers/NewLicense.vue
const initialValues = ref({});
...
initialValues.value = {};
```

### 2) Address is collected but not submitted in v3
Why it matters: The backend may require address or users may expect it to be saved.

Legacy evidence:
```js
// src/platform/components/applications/UserProfileForm.vue
{
  label: "addresses.address",
  name: "address",
  required: true,
  type: "text",
},
```

v3 evidence (address omitted from payload):
```js
// src/v3/schema/userProfile.js
export function serializeProfile(data) {
  return {
    name_ar: data.name_ar.trim(),
    ...
    region_id: data.region_id,
    city_id: data.city_id
  };
}
```

### 3) Email is now required in v3, but did not exist in legacy
Why it matters: This is a breaking UX change and may trigger 422 errors if the backend does not accept email.

v3 evidence:
```js
// src/v3/schema/userProfile.js
email: {
  type: 'email',
  label: 'Email',
  value: '',
  validation: pipe(
    string('Email is required'),
    ...
  ),
  required: true
},
```

Legacy evidence (no email in inputs):
```js
// src/platform/components/applications/UserProfileForm.vue
const formInputs = reactive([
  { name: "name_ar", ... },
  { name: "name_en", ... },
  { name: "gender", ... },
  { name: "nationality", ... },
  { name: "birthdate", ... },
  { name: "identity_number", ... },
  { name: "mobile", ... },
  { name: "region_id", ... },
  { name: "city_id", ... },
  { name: "address", ... }
]);
```

### 4) Validation strictness changed (names and mobile format)
Why it matters: Users who previously passed validation may now be blocked.

Legacy evidence:
```js
// src/platform/components/applications/UserProfileForm.vue
name_ar: string().required(...).max(120).matches(...),
mobile: string().required(...).matches(/^0*5\\d{8}$/),
```

v3 evidence:
```js
// src/v3/schema/userProfile.js
name_ar: {
  validation: pipe(
    string('Arabic name is required'),
    maxLength(100, ...),
    regex(/^([\\u0600-\\u06FF]{2,}\\s+){2,}([\\u0600-\\u06FF]{2,}\\s*)$/, ...)
  )
},
mobile: {
  validation: pipe(
    string('Mobile number is required'),
    regex(/^(?:9665\\d{8}|05\\d{8})$/, ...)
  )
},
```

### 5) Submission payload shape changed via `serializeProfile`
Why it matters: Field trimming and omission can change backend expectations.

Legacy evidence:
```js
// src/platform/views/Applications/professional-divers/NewLicense.vue
axios.post(NEW_LICENSE, values)
```

v3 evidence:
```js
// src/v3/pages/applications/professional-divers/NewLicense.vue
const payload = await serializeProfile(formData);
await apiPost(import.meta.env.VITE_PROFESSIONAL_DIVERS_NEW_LICENSE, payload);
```

### 6) Conflict handling and navigation changed (409 redirect)
Why it matters: Users may be redirected to a license page instead of staying in the form.

v3 evidence:
```js
// src/v3/pages/applications/professional-divers/NewLicense.vue
if (e?.status === 409) {
  const message = getConflictMessage(e);
  notifyError(message);
  if (shouldRedirectToLicense(message)) {
    router.replace({ name: 'professional-diver-license', params: { locale: locale.value } });
    return;
  }
}
```

Legacy evidence (no conflict handling):
```js
// src/platform/views/Applications/professional-divers/NewLicense.vue
.catch((err) => {
  toast.error(err.response.statusText);
});
```

### 7) Region/city selection behavior differs
Why it matters: v3 allows choosing a city before selecting a region, which is a change from legacy.

Legacy evidence:
```js
// src/platform/components/applications/UserProfileForm.vue
function setCitiesOptions() {
  formInputs.map((el) => {
    if (el.name == "city_id") {
      el.options = cities.value.filter(
        (city) => city.region_id == formData.region_id
      );
    }
  });
}
```

v3 evidence:
```js
// src/v3/pages/applications/professional-divers/NewLicense.vue
formOptions.value.city_id = cities.value.map(c => ({
  label: c.name,
  value: c.id,
  region_id: c.region_id
}));
```

### 8) License information step (rank + card design) implemented (resolved)
Why it matters: Rank and card design impact the Professional Diver application services (e.g., printing) and must be captured before submission.

Status (2026-01-26): Implemented as a dedicated step:
- Form/page: `src/v3/pages/applications/professional-divers/UpdateLicenseInformations.vue`
- Summary card: `src/v3/components/applications/cards/PDLicenseInformationCard.vue`
- Payload key: `pd_license` (loaded via `applications/byId?with-payload=true&payload[]=pd_license`)
- Save endpoint: `professional-divers-applications/set-services/{appId}`

See: `docs/v3/specs/professional-diver-license-information.md`

## Recommendations
- ✅ `newLicenseProfile` is integrated in `src/v3/pages/applications/professional-divers/NewLicense.vue` (keep tests for 200/409 flows).
- **Decide whether `email` is truly required for new license applications**: Either add it to legacy expectations or relax it in v3 if the backend does not accept it.
- **Include `address` in `serializeProfile` or remove the field from the form** to avoid silent data loss.
- **Align validation rules (name length and mobile format) with legacy/back-end rules** to avoid regressions.
- ✅ License information step is implemented (consider removing legacy `LicenseInformationForm.vue` once unused).

## Risk Assessment

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Address not submitted | Data loss or backend validation failure | Add to `serializeProfile` or remove field. |
| Email now required | Users blocked if email missing | Confirm backend requirement and adjust UI. |
| Stricter validation | Rejected inputs previously accepted | Align regex/lengths with legacy behavior. |
| Conflict handling redirect | User confusion on redirect | Provide clearer messaging or a pre-check step. |
