# Athlete Registration - Requirements and Specifications

**Flow Family:** `athlete-registration`  
**Primary Pages:** `NewAthlete.vue`, `UpdateAthleteSport.vue`, `ApplicationSummary.vue`  
**Version:** 1.1  
**Last Updated:** 2026-03-12

---

## 1. Business Requirements

### 1.1 Core Goal
Users must be able to create and complete athlete applications in v3 through a sport-first flow that ends in the shared application summary.

### 1.2 Supported Athlete Application Variants
The system must preserve distinct user-facing names for athlete application variants:
- `New Athlete Registration`
- `Athlete Registration Renewal`
- `Motorized Sports License`

These variants may share one technical workflow, but they must not be collapsed into one generic display name in the UI.

First athlete registration must always be `membership`, including motorized sports such as `jetski` and `flyboard`.
Athlete card type must be derived from athlete `registration_type`, not from `sport`, so motorized sports may still show membership cards until upgraded to `license`.

### 1.3 Sport-First Entry
- Athlete application creation must start by choosing a sport
- Sport selection happens before user profile entry
- The selected sport is part of application creation payload
- Users must land in `app-summary` after application creation

### 1.4 Shared Steps Policy
The athlete flow must reuse the existing shared v3 implementation for:
- user profile entry/edit
- personal photo upload
- required file upload
- submit
- recall
- resubmit

### 1.5 Duplicate and Resume Handling
- If the backend reports an in-progress athlete application for the same case, the user must be redirected to that existing application summary
- The create page must not silently fail when a duplicate/in-progress application exists
- If the user already has an athlete registration for the selected sport, the create page must reject creating a second new registration and direct the user toward renewal instead

### 1.6 Multiple Sports Context
- A user may be registered in multiple athlete sports overall
- Each athlete application still represents one selected sport
- The selected sport is locked after application creation
- Summary edit for sport is not part of the normal user flow

### 1.7 Summary Entry Rule
From the applications index, athlete applications must open `app-summary` when `target === 'Athletes'`.

---

## 2. Functional Requirements

### FR-1: Create Page Availability
**Priority:** Critical  
**Description:** Provide a dedicated v3 create page for athlete applications.

**Acceptance Criteria:**
- Route `athlete-new-registration` exists
- Legacy `new-athlete` entry redirects to the new route
- Page title uses `New Athlete Registration`
- Form renders a single required sport field

### FR-2: Allowed Sport Selection
**Priority:** Critical  
**Description:** The create page must only allow sports currently accepted by the backend create flow.

**Acceptance Criteria:**
- Form accepts canonical sport codes only
- Unsupported sports are not shown as selectable options in the create page
- The visible sport list is controlled from the athlete sport schema

### FR-3: Application Creation
**Priority:** Critical  
**Description:** Submit the selected sport to the athlete create endpoint.

**Acceptance Criteria:**
- Submit to `athletes-applications/new`
- Request payload shape:
  ```json
  {
    "sport": "freediving"
  }
  ```
- Success response contains `application.id`
- User is redirected to `app-summary`

### FR-4: Duplicate Handling
**Priority:** High  
**Description:** Handle existing in-progress applications gracefully.

**Acceptance Criteria:**
- When backend returns `409` with application data, redirect to `app-summary`
- User receives a clear notification
- No duplicate blank application is created in frontend state

### FR-4A: Existing Sport Registration Conflict
**Priority:** High  
**Description:** Prevent creating a second new registration for a sport the user already owns.

**Acceptance Criteria:**
- When backend finds an existing athlete row for the same `(user_id, sport)`, creation is rejected
- Frontend shows the returned conflict message
- No new athlete application is created
- User must use the renewal path instead of the new-registration path

### FR-5: Summary Step Order
**Priority:** Critical  
**Description:** Athlete summary must block completion in the correct order.

**Acceptance Criteria:**
- Blocking steps are:
  1. `sport_selection`
  2. `user_profile`
  3. `user_profile_picture`
  4. `files`
- `Next` routes to the first incomplete step
- `Submit` is blocked while blocking steps are incomplete

### FR-6: Sport Review Card
**Priority:** High  
**Description:** Show sport information inside summary and validate it like other summary steps.

**Acceptance Criteria:**
- Summary includes a sport card
- New application: card shows selected sport label
- Renewal / upgrade: card shows current registration information using the same `sport` payload key
- Card shows missing-step warning when no sport exists
- Card does not expose a summary edit action for sport

### FR-7: Sport Edit Page
**Priority:** High  
**Description:** Allow setting sport only for exceptional cases where an athlete application has no sport value yet.

**Acceptance Criteria:**
- Route `athlete-sport-selection` exists
- Saving posts to `athletes-applications/update-sport/{appId}`
- User returns to `app-summary` after success
- Editing is blocked when application stage is not editable
- Editing is blocked when the application already has a sport
- Summary does not expose any sport edit action

### FR-8: Payload Contract
**Priority:** Critical  
**Description:** Athlete summary must load the required payload keys from the unified payload system.

**Acceptance Criteria:**
- Athlete flows load these keys:
  - `user_profile`
  - `user_profile_picture`
  - `sport`
  - `files`
  - `quotations`
  - `actions`
- `sport` payload is returned as:
  ```json
  {
    "sport": {
      "code": "freediving"
    }
  }
  ```
- For renewal and upgrade applications, the same `sport` key is decorated by backend with current registration fields needed by the sport card
- The frontend must not require a separate payload key for current athlete registration
- Any athlete card label/download behavior must use `sport.registration_type`, not the sport code alone

### FR-9: Athlete Application Naming
**Priority:** High  
**Description:** Athlete application names must stay distinct in UI.

**Acceptance Criteria:**
- membership-based new athlete flows resolve to `New Athlete Registration`
- membership-based renewal flows resolve to `Athlete Registration Renewal`
- license-based athlete flows, including renewal, resolve to `Motorized Sports License`
- real backend flow names resolve to the correct display name
- card download/label behavior must use `registration_type`; `jetski` and `flyboard` are not license-only by sport

---

## 3. Non-Functional Requirements

### NFR-1: Reuse Shared Components
- Athlete flow must not fork shared profile/photo/files pages without a clear athlete-specific requirement
- Shared summary behavior must remain aligned with existing v3 infrastructure

### NFR-2: Internationalization
- Labels, validation messages, headings, and notifications must use i18n keys
- Arabic translations must exist for user-facing strings introduced by athlete flow
- active athlete application names must have Arabic translations

### NFR-3: Maintainability
- New v3 work must resolve application type from `flow` first
- `purpose` must remain compatibility fallback only
- Display-name differences must be expressed in config, not hardcoded per component when avoidable

### NFR-4: UX Consistency
- Athlete summary must look and behave like the shared v3 summary pattern
- Sport card styling must match the other summary cards
- Success and error handling must follow existing v3 notification behavior

---

## 4. Technical Requirements

### 4.1 Frontend Components
- `src/v3/pages/applications/athletes/NewAthlete.vue`
- `src/v3/pages/applications/athletes/UpdateAthleteSport.vue`
- `src/v3/components/applications/cards/SportSelectionCard.vue`
- `src/v3/schema/applications/athleteSport.js`
- `src/v3/config/application-config.js`

### 4.2 Endpoints
- `ATHLETES_CREATE_MEMBERSHIP` -> `athletes-applications/new`
- `ATHLETES_UPDATE_SPORT` -> `athletes-applications/update-sport/{appId}`
- athlete summary payload via `applications/byId/{appId}?with-payload=true`

### 4.3 File Rules
- `New Athlete Registration` requires:
  - `National Identity`
  - `Medical Examination`
- `Athlete Registration Renewal` requires:
  - `Medical Examination`
- `Motorized Sports License` keeps optional:
  - `National Identity`
  - `Medical Examination`
  - `Motorized License`

### 4.3 Store and Routing
- `useApplicationStore` governs application loading and summary blocking steps
- applications index must route athlete applications to `app-summary` when `target === 'Athletes'`

### 4.4 Schema Rules
- sport values are canonical slugs
- label resolution must support both active and temporarily disabled sports for display
- disabled sports may remain in label helpers while being hidden from the create form

---

## 5. Validation and Error Handling

### 5.1 Client Validation
- sport is required
- sport must be one of the allowed visible options

### 5.2 Server Validation
- `422` validation errors must be mapped to form fields
- `409` duplicate/in-progress errors must redirect or notify appropriately
- `403` on sport update must return user to summary
- `404` on sport update must redirect to not found

---

## 6. Acceptance Checklist

1. Open `athlete-new-registration`
2. Select a supported sport and create the application
3. Confirm redirect to `app-summary`
4. Confirm sport card appears in summary
5. Confirm new application sport card shows only the selected sport
6. Confirm renewal or upgrade application sport card shows current registration information
7. Confirm `Next` respects step order
8. Confirm `Submit` remains blocked until profile and photo are complete
9. Confirm `New Athlete Registration` requires `National Identity` and `Medical Examination`
10. Confirm `Athlete Registration Renewal` requires `Medical Examination`
11. Confirm `Motorized License` appears as an optional file type for `Motorized Sports License` applications
12. Confirm applications index opens athlete applications in `app-summary`
13. Confirm athlete application names display the correct variant label

---

## 7. Related Documents

- [Athlete Registration Specs](../specs/athlete-registration.md)
- [Athlete Profile Renewal Requirements](./athlete-profile-renewal.md)
- [Athlete Profile Renewal Specs](../specs/athlete-profile-renewal.md)
- [User Profile Requirements](./user-profile-upsert.md)
