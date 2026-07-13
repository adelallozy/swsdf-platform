# Athlete Registration - Component Specifications

**Flow Family:** `athlete-registration`  
**Primary Pages:** `NewAthlete.vue`, `UpdateAthleteSport.vue`, `ApplicationSummary.vue`  
**Primary Card:** `SportSelectionCard.vue`  
**Location:** `src/v3/pages/applications/athletes/`  
**Version:** 1.1  
**Last Updated:** 2026-03-12

---

## Overview

The athlete registration flow is the v3 entry point for all athlete application variants that share the same summary workflow.

This family currently covers three active display names while sharing one v3 flow family:
- `New Athlete Registration`
- `Athlete Registration Renewal`
- `Motorized Sports License`

The flow is sport-first. The user starts by selecting a sport, the backend creates or resumes an athlete application, and the user completes the rest of the required steps in the unified `app-summary` flow.

Shared profile, photo, files, submit, recall, and resubmit steps reuse the existing tested v3 components already used by professional diver applications.

---

## Scope

### In Scope
- New athlete application creation from sport selection
- Athlete summary rendering in `app-summary`
- Sport review card in summary
- Legacy compatibility for `update-sport` route when a stored sport is still missing
- Application type aliases and display-name resolution
- Shared summary flow for profile, personal photo, files, actions, submit, recall, and resubmit

### Out of Scope
- Re-implementing shared profile/photo/files pages for athletes
- Competition athlete registration flows
- Admin review screens
- Legacy platform athlete pages that are no longer the active entry point

---

## Active Routes

### 1. Create Page
- **Route:** `/app/:locale(ar|en)/applications/athlete-new-registration`
- **Name:** `athlete-new-registration`
- **Component:** `src/v3/pages/applications/athletes/NewAthlete.vue`

### 2. Summary Page
- **Route:** `/app/:locale(ar|en)/applications/:appId(\d+)/summary`
- **Name:** `app-summary`
- **Component:** `src/v3/pages/applications/ApplicationSummary.vue`

### 3. Sport Update Page
- **Route:** `/app/:locale(ar|en)/applications/:appId(\d+)/athletes/update-sport`
- **Name:** `athlete-sport-selection`
- **Component:** `src/v3/pages/applications/athletes/UpdateAthleteSport.vue`
- **Status:** compatibility route only, not exposed from the summary UI

### 4. Legacy Compatibility Entry
- **Route:** `/workspace/applications/new-athlete`
- **Name:** `new-athlete`
- **Behavior:** redirect to `athlete-new-registration`

---

## Application Type Resolution

The athlete family uses one shared v3 config key:
- `athlete-registration`

Renewal flows reuse the same active frontend config as their matching new application type.

### Display Names
- `New Athlete Registration`
- `Athlete Registration Renewal`
- `Motorized Sports License`

### Real Backend Flow/Purpose Values Mapped to This Family
- `water_sports_new_athlete_membership`
- `water_sports_athlete_membership_renewal`
- `motorized_water_sports_new_license`
- `motorized_water_sports_new_athlete_membership`
- `motorized_water_sports_license_renewal`
- `motorized_water_sports_athlete_membership_renewal`

### First Registration Rule
- first athlete registration always uses a membership flow
- motorized sports use `motorized_water_sports_new_athlete_membership` on first registration
- `motorized_water_sports_new_license` is not the default first-registration flow

### Renewal Naming Rule
- membership renewals resolve to `Athlete Registration Renewal`
- license renewals resolve to `Motorized Sports License`

### Resolution Rules
- v3 must resolve application type from `flow` first
- `purpose` remains compatibility fallback only
- athlete applications in applications index open `app-summary` when `target === 'Athletes'`

---

## Create Page Specification

### Component
- `src/v3/pages/applications/athletes/NewAthlete.vue`

### Purpose
Start an athlete application by selecting a sport and submitting to the backend create endpoint.

### Form Technology
- `MasterForm.vue`
- `makeAthleteSportSchema()`
- `serializeAthleteSport()`
- `useLoading`
- `useNotification`
- `useErrorHandler`

### Sport Schema
Defined in:
- `src/v3/schema/applications/athleteSport.js`

Current active options in the create page:
- `jetski`
- `freediving`
- `flyboard`
- `sport_fishing`
- `underwater_photography`
- `target_shooting`

Temporarily disabled in the create page:
- `motosurf`
- `powerboat_e1`
- `powerboat_f1`
- `powerboat_f2`
- `powerboat_f4`
- `powerboat_xcat`

### File Rules
For `New Athlete Registration`:
- required: `National Identity`
- required: `Medical Examination`

For `Athlete Registration Renewal`:
- required: `Medical Examination`

For `Motorized Sports License`:
- `National Identity` is optional
- `Medical Examination` is optional
- `Motorized License` is optional

### Submission Endpoint
- `POST athletes-applications/new`
- Frontend constant: `ATHLETES_CREATE_MEMBERSHIP`

### Success Behavior
- Expect `application.id`
- Redirect to `app-summary`
- Show success notification

### Conflict Behavior
If backend returns `409` with an existing application:
- redirect to that application's `app-summary`
- show backend message or generic duplicate message

If backend returns `409` because the user already has a stored athlete registration for the selected sport:
- do not create a new application
- show the backend conflict message
- require the user to continue through the renewal path instead

### Validation Behavior
If backend returns `422`:
- apply field errors to `MasterForm`
- show validation notification

---

## Summary Integration Specification

### Summary Layout
Configured in:
- `src/v3/config/application-config.js`

Athlete summary includes:
- `ApplicationInfoCard`
- `SportSelectionCard`
- `ApplicantProfileCard`
- `ApplicantPersonalPhotoCard`
- `FilesCard`
- `ActionsTrackingCard`

### Blocking Steps Order
1. `sport_selection`
2. `user_profile`
3. `user_profile_picture`
4. `files`

### Shared Summary Behavior
The athlete flow reuses the shared summary infrastructure for:
- validation state
- step action registration
- next-step routing
- submit
- recall
- resubmit

---

## Sport Card Specification

### Component
- `src/v3/components/applications/cards/SportSelectionCard.vue`

### Responsibilities
- read from `store.payload.sport`
- fallback to `application.entity_data.sport` only for compatibility
- display selected sport label for new applications
- display current registration summary for renewal and upgrade applications
- show progress badge from `application.progress['Sport Specifying']`
- register summary validation error when sport is missing
- do not expose a summary edit action for sport

### Payload Contract
New application payload shape:
```json
{
  "sport": {
    "code": "freediving"
  }
}
```

Renewal / upgrade payload shape uses the same key, but the backend decorates it with current registration fields:
```json
{
  "sport": {
    "code": "jetski",
    "id": 5017,
    "user_id": 521,
    "identity_number": "2379811693",
    "category": "senior",
    "registration_type": "membership",
    "status": "Expired",
    "expiry_date": "2025-12-31",
    "terminated_on": null
  }
}
```

The card must therefore behave as:
- new application: show `Selected Sport`
- renewal / upgrade: show current registration information only
- athlete card artifacts and labels must use `registration_type`; motorized sports can still be `membership` until a license flow updates the athlete row

### Label Resolution
Sport labels are resolved through:
- `getAthleteSportCode()`
- `getAthleteSportLabel()`

---

## Sport Update Page Specification

### Component
- `src/v3/pages/applications/athletes/UpdateAthleteSport.vue`

### Purpose
Keep compatibility for exceptional old requests that still reach the legacy update-sport route.

### Initialization Rules
- load the application through `useApplicationStore`
- request payload key `sport`
- require valid `appId`
- stop and redirect if application is not editable

### Save Endpoint
- `POST athletes-applications/update-sport/{appId}`
- Frontend constant: `ATHLETES_UPDATE_SPORT`

### Save Behavior
- update `store.payload.sport.value` locally after success
- update `store.application.value` if backend returns application entity
- redirect back to `app-summary`
- this page is now effectively a compatibility fallback for applications that do not already have a sport value

### Error Handling
- `422`: apply form errors
- `403`: redirect back to summary with error notification
- `404`: redirect to not found
- `409`: show error notification

### Edit Availability Rule
- users must not change sport after application creation
- the summary card must not show any edit action for sport
- direct navigation to the update page must redirect back to summary when the application already has a sport

---

## Backend Payload Dependencies

### Required Payload Keys
Athlete summary depends on these payload keys being available through `applications/byId?with-payload=true`:
- `user_profile`
- `user_profile_picture`
- `sport`
- `files`
- `quotations`
- `actions`

### Backend Source
- `api/src/Controller/Component/ApplicationPayloadComponent.php`

### Notes
- the payload key remains `sport`; no extra athlete-specific payload key is introduced
- `ApplicationsController::byId()` decides whether `sport` is minimal or decorated
- shared profile/photo/files behavior uses the same payload system already used by other v3 flows

---

## Shared Components Used As-Is

Athlete applications intentionally reuse the existing shared v3 pages/components for:
- `UserProfileUpsert.vue`
- `ApplicantPersonalPhotoUpload.vue`
- `ApplicationFileUpload.vue`
- summary submit/recall/resubmit logic

Related documentation:
- [User Profile Requirements](../requirements/user-profile-upsert.md)
- [Actions Tracking Card Specs](./ActionsTrackingCard.md)
- [Application Fees Requirements](../requirements/application-fees-card.md)

---

## Applications Index Behavior

### Component
- `src/v3/components/applications/ApplicationCard.vue`

### Rule
From the applications index, athlete applications open `app-summary` when:
- `application.target === 'Athletes'`

This rule is intentionally narrower than a blanket summary redirect for all application types.

---

## Known Constraints

1. Distinct athlete application names must remain distinct in UI
2. The create page currently exposes only the sports accepted by backend create flow
3. Disabled sports remain known labels for display and legacy application rendering
4. `purpose` is deprecated for new v3 work and must not be introduced as a new source of truth
5. Shared profile/photo/files components are not athlete-specific and should not be forked without need

---

## Related Files

### Frontend
- `src/v3/pages/applications/athletes/NewAthlete.vue`
- `src/v3/pages/applications/athletes/UpdateAthleteSport.vue`
- `src/v3/components/applications/cards/SportSelectionCard.vue`
- `src/v3/schema/applications/athleteSport.js`
- `src/v3/config/application-config.js`
- `src/v3/pages/applications/ApplicationSummary.vue`
- `src/v3/components/applications/ApplicationCard.vue`

### Backend
- `api/src/Controller/Component/ApplicationPayloadComponent.php`
- `api/src/Controller/Api/AthletesApplicationsController.php`

---

## Related Documents

- [Athlete Registration Requirements](../requirements/athlete-registration.md)
- [Athlete Profile Renewal Specs](./athlete-profile-renewal.md)
- [Athlete Profile Renewal Requirements](../requirements/athlete-profile-renewal.md)
- [User Profile Requirements](../requirements/user-profile-upsert.md)
