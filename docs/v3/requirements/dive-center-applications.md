# Dive Center Applications Website Requirements

**Project:** Website v3  
**Domain:** Diving centers  
**Last updated:** 2026-05-20
**Source of truth:** shipped website v3 behavior

## Purpose

The website v3 diving-center application flow lets applicants create and complete diving-center membership applications through the shared application summary. The summary owns validation, navigation, files, fees, and submit actions. Focused pages edit one application section at a time.

This guide is the website entry document for diving-center applications.

## Active Application Types

The v3 application config supports:

- `Diving Center New Membership`
- `Diving Center Membership Renewal`
- `Diving Center Information Update`
- `Diving Center Administrators Update`

Each type uses the same shared payload keys, steps, accepted files, and summary card order unless stated otherwise.

## Core Files

- Application config: `src/v3/config/application-config.js`
- API endpoint constants: `src/v3/config/apiEndpoints.js`
- Application conflict helper: `src/v3/utils/applicationWorkflow.js`
- New membership page: `src/v3/pages/applications/dive-centers/NewMembership.vue`
- Profile edit page: `src/v3/pages/applications/dive-centers/UpdateCenterProfile.vue`
- Activities edit page: `src/v3/pages/applications/dive-centers/UpdateActivities.vue`
- International membership add page: `src/v3/pages/applications/dive-centers/AddInternationalMembership.vue`
- Administrator add/edit page: `src/v3/pages/applications/dive-centers/DCAdministratorUpsert.vue`
- Profile schema: `src/v3/schema/applications/diveCenterProfile.js`
- Activities schema: `src/v3/schema/applications/diveCenterActivities.js`
- International membership schema: `src/v3/schema/applications/diveCenterInternationalMembership.js`
- Administrator schema: `src/v3/schema/applications/diveCenterAdministrator.js`
- Summary profile card: `src/v3/components/applications/cards/DivingCenterProfileCard.vue`
- Summary activities card: `src/v3/components/applications/cards/DivingCenterActivitiesCard.vue`
- Summary memberships card: `src/v3/components/applications/cards/DivingCenterInternationalMembershipsCard.vue`
- Summary administrators card: `src/v3/components/applications/cards/DivingCenterAdministratorsCard.vue`
- Current active files card: `src/v3/components/applications/cards/ActiveFilesCard.vue`
- Application files card: `src/v3/components/applications/cards/FilesCard.vue`

## Routes

Public dive-center pages:

- `/app/:locale/dive-centers`
- `/app/:locale/dive-center/:id`

Application routes:

- `diving-centers-new-membership`
- `dive-center-profile-edit`
- `dive-center-activities-edit`
- `dive-center-administrator-add`
- `dive-center-administrator-edit`
- `dive-center-international-membership-add`

Route paths:

- `/app/:locale/applications/diving-centers-new-membership`
- `/app/:locale/applications/:appId/dive-centers/profile/edit`
- `/app/:locale/applications/:appId/dive-centers/activities/edit`
- `/app/:locale/applications/:appId/dive-centers/administrators/add`
- `/app/:locale/applications/:appId/dive-centers/administrators/:profileId/edit`
- `/app/:locale/applications/:appId/dive-centers/international-memberships/add`

The administrators edit collection route redirects to `dive-center-administrator-add`.

## API Endpoint Constants

The website uses v3 endpoint constants:

- `DIVING_CENTERS_APPS_CREATE_MEMBERSHIP`
- `DIVING_CENTERS_APPS_RENEW_MEMBERSHIP`
- `DIVING_CENTERS_APPS_CREATE_UPDATE`
- `DIVING_CENTERS_APPS_UPDATE_PROFILE`
- `DIVING_CENTERS_APPS_GET_MEMBERSHIP_OPTIONS`
- `DIVING_CENTERS_APPS_ADD_INTERNATIONAL_MEMBERSHIP`
- `DIVING_CENTERS_APPS_REMOVE_INTERNATIONAL_MEMBERSHIP`
- `DIVING_CENTERS_ADMIN_CREATE_PROFILE`
- `DIVING_CENTERS_ADMIN_UPDATE_PROFILE`
- `DIVING_CENTERS_ADMIN_CANCEL`
- `DIVING_CENTERS_ADMIN_RESTORE`
- `DIVING_CENTERS_ADMIN_GET_PERMITTED`

All v3 pages must use `apiGet`, `apiPost`, and `apiDelete` from `src/v3/services/httpClient.js`.

## Payload Contract

All diving-center application types request:

- `center_profile`
- `active_files`
- `active_international_memberships`
- `application_international_memberships`
- `unverified_international_memberships`
- `center_administrators`
- `files`

Frontend meaning:

- `center_profile`: application profile entry, or an active-center clone when the backend returns one for existing center applications.
- `active_files`: approved target-owned files for the current dive center.
- `files`: files uploaded for the current application.
- `active_international_memberships`: approved active memberships for the target center.
- `application_international_memberships`: all membership rows attached to the application.
- `unverified_international_memberships`: pending membership rows attached to the application.
- `center_administrators`: administrator rows attached to the application.

## Summary Layout

The summary card order is:

1. `ApplicationInfoCard`
2. `DivingCenterProfileCard`
3. `DivingCenterActivitiesCard`
4. `DivingCenterInternationalMembershipsCard`
5. `DivingCenterAdministratorsCard`
6. `ActiveFilesCard`
7. `FilesCard`

Summary behavior:

- Cards read from `useApplicationStore`.
- Cards register validation errors with the store.
- Cards register primary step actions only while the application can be modified.
- Users return to `app-summary` after saving focused edit pages.

## Required Files

Accepted file types:

- `Logo`
- `Owner National Identity`
- `Manager National Identity`
- `International Membership`
- `National Address`
- `Air Purity Certificate`
- `Maintenance License`
- `Air Compressor Worker Qualifications`
- `Training Course Records`
- `Other`

Configured required files:

| Application type | Required files |
| --- | --- |
| `Diving Center New Membership` | `Logo` |
| `Diving Center Membership Renewal` | `Logo` |
| `Diving Center Information Update` | `Logo` |
| `Diving Center Administrators Update` | none |

Derived required files:

- For each unverified international membership with `action = register`, require `{organization} Membership Certificate`.
- The derived file names are calculated in `application-config.js`.

Required-file satisfaction:

- `FilesCard` checks both `payload.files` and `payload.active_files`.
- An approved active logo can satisfy the `Logo` requirement.
- Dive-center-specific file logic must stay in application config or runtime step registration, not inside generic shared file components.

## New Membership Page

Page:

- `NewMembership.vue`

Purpose:

- Create a new diving-center membership application from center profile data only.

Behavior:

- Uses `MasterForm`.
- Uses `makeDiveCenterProfileSchema`.
- Loads regions and cities from the common addresses endpoint.
- Submits `serializeDiveCenterProfile(formData)` to `DIVING_CENTERS_APPS_CREATE_MEMBERSHIP`.
- On success, loads the created application and routes to `app-summary`.
- On `422`, applies server errors to `MasterForm`.
- On `409`, shows an informational existing-application notice and routes to `app-summary` when `application.id` is returned.
- If a `409` does not include an application id, routes to `applications-index`.
- Uses `useLoading`, `useNotification`, `useErrorHandler`, and `useApplicationStore`.

Scope:

- Handles center profile only.
- Does not collect activities, international memberships, administrators, files, fees, or submit action.
- Does not upload logo; logo belongs to the files step.

## Profile Edit Page

Page:

- `UpdateCenterProfile.vue`

Purpose:

- Edit the main `center_profile` payload section for an existing application.

Behavior:

- Loads the application with `payloadKeys: ['center_profile']`.
- Loads regions and cities.
- Redirects to `app-summary` when the application cannot be modified.
- Prefills `MasterForm` from `store.payload.center_profile.value`.
- Submits serialized profile data to `DIVING_CENTERS_APPS_UPDATE_PROFILE + appId`.
- On success, shows a success notification and routes to `app-summary`.
- On `422`, applies backend validation errors to `MasterForm`.
- On `404`, routes to `error-404`.

Canonical submitted fields:

- `name_ar`
- `name_en`
- `unified_number`
- `cr_number`
- `cr_expiry_date`
- `vat_tin`
- `region_id`
- `city_id`
- `location_type`
- `telephone`
- `email`
- `website`
- `address`
- `location_coordinates`

The page must not submit old field names such as `cr_expiry_on`, `latlng`, `activities_ids`, or `diving_activities`.

## Activities Edit Page

Page:

- `UpdateActivities.vue`

Purpose:

- Edit only the `diving_activities` list for an application.

Behavior:

- Loads membership options from `DIVING_CENTERS_APPS_GET_MEMBERSHIP_OPTIONS`.
- Loads the application with `payloadKeys: ['center_profile']` when needed.
- Uses `makeDiveCenterActivitiesSchema`.
- Uses `RadioTiles` in multi-select mode.
- Requires at least one main activity.
- Requires at least one ancillary activity.
- Preserves saved activities that are not in the current selectable catalog.
- Submits only `{ diving_activities: [...] }` to `DIVING_CENTERS_APPS_UPDATE_PROFILE + appId`.
- Returns to `app-summary` after save.

Training activities that trigger the international-membership requirement:

- `FREEDIVING_TRAINING`
- `RECREATIONAL_DIVING_TRAINING`
- `TECHNICAL_DIVING_TRAINING`

## International Membership Add Page

Page:

- `AddInternationalMembership.vue`

Purpose:

- Add a pending international membership entry to an application.

Behavior:

- Loads membership organizations from `membership-options`.
- Loads the application without payload for initial permissions.
- Redirects to `app-summary` when the application cannot be modified.
- Uses `makeDiveCenterInternationalMembershipSchema`.
- Submits to `DIVING_CENTERS_APPS_ADD_INTERNATIONAL_MEMBERSHIP + appId`.
- Reloads application with payload after save.
- Returns to `app-summary`.

Submitted fields:

- `organization`
- `number`
- `diving_type`
- `expiry_date`

Validation:

- Organization is required.
- Membership number is required.
- At least one diving type is required.
- Expiry date is required.

## International Membership Summary Card

Component:

- `DivingCenterInternationalMembershipsCard.vue`

Requirements:

- Merge active and application membership rows by organization, number, and diving type.
- Display active rows, unverified rows, and pending termination rows.
- Pending application data must override active row values for display while preserving active file/certificate fallback.
- Validate that training activities have at least one non-expired membership that is not pending termination.
- Validate required fields for unverified membership rows.
- Register runtime required files for register memberships where needed.
- Allow add/remove actions only while the application can be modified.
- Use confirmation before remove actions.
- Reload application payload after add/remove operations.

## Administrator Add/Edit Page

Page:

- `DCAdministratorUpsert.vue`

Purpose:

- Add or update a center administrator for an application.

Behavior:

- Add route loads application without payload.
- Edit route loads application with `payloadKeys: ['center_administrators']`.
- Redirects to `app-summary` when the application cannot be modified.
- Uses `makeDiveCenterAdministratorSchema`.
- Submits `FormData`.
- Add submits to `DIVING_CENTERS_ADMIN_CREATE_PROFILE + appId`.
- Edit submits to `DIVING_CENTERS_ADMIN_UPDATE_PROFILE + profileId`.
- Reloads application with payload after save.
- Returns to `app-summary`.

Fields:

- `roles`
- `name_ar`
- `name_en`
- `email`
- `identity_number`
- `mobile`
- `languages`
- `identity_file`
- `cv_file`

Validation:

- Role is required and must be one or more of `Owner`, `Manager`.
- Arabic and English names are required.
- Email is required and must be valid.
- Identity number must match the Saudi identity pattern used by the schema.
- Phone must match the existing KSA phone rule used by the schema.
- Identity copy is always required.
- Languages are required when `Manager` is selected.
- CV is required when `Manager` is selected.

## Administrator Summary Card

Component:

- `DivingCenterAdministratorsCard.vue`

Requirements:

- Read administrators from `payload.center_administrators`.
- Show the component while editable or when administrators exist.
- Hide canceled rows from owner/manager presence checks.
- Validate at least one owner and at least one manager while editable.
- Sort active administrators first, pending changes next, pending cancellations last.
- Show add, edit, remove, and restore actions only when allowed.
- Use confirmation before cancellation.
- Reload application after cancel or restore.
- Build attachment URLs with the shared file URL helper.

## Summary Profile Card

Component:

- `DivingCenterProfileCard.vue`

Requirements:

- Read `payload.center_profile`.
- Show while editable or when a center profile exists.
- Link edit action to `dive-center-profile-edit`.
- Validate that a profile exists while editable.
- Display available profile fields without showing empty field rows.
- Display city and region names from payload when available.

## Summary Activities Card

Component:

- `DivingCenterActivitiesCard.vue`

Requirements:

- Read activities from `payload.center_profile.diving_activities`.
- Partition activities into main, ancillary, and additional saved activities.
- Show while editable or when activities exist.
- Link edit action to `dive-center-activities-edit`.
- Validate at least one main and one ancillary activity while editable.
- If profile is missing, direct the primary action to the profile edit route.

## Current Files Card

Component:

- `ActiveFilesCard.vue`

Requirements:

- Read `payload.active_files`.
- Show while editable or when active files exist.
- Display approved target-owned files such as active logos.
- Build file URLs with the shared file URL helper.
- Mark expired file dates visually.

## Application Files Card

Component:

- `FilesCard.vue`

Requirements:

- Read application files from `payload.files`.
- Compute missing required files from configured required files, derived required files, and runtime required files.
- Check uploaded file names against both `payload.files` and `payload.active_files`.
- Show missing required file upload cards while editable.
- Allow upload when all required files are satisfied.
- Allow delete only through the shared files API and only when file deletion is allowed.

## Public Center Pages

Public center routes use v3 pages:

- `DiveCentersIndex.vue`
- `DiveCenterProfile.vue`

Requirements:

- List permitted/licensed centers for the authenticated user where applicable.
- Start renewal through `DIVING_CENTERS_APPS_RENEW_MEMBERSHIP`.
- Start information update through `DIVING_CENTERS_APPS_CREATE_UPDATE`.
- Route created applications to `app-summary`.
- On `409` from renewal or information update creation, show an informational existing-application notice and route to the existing `app-summary` when the backend returns the blocking application.
- Display active center data from current API responses.

## Error Handling

Website pages must:

- Use `useErrorHandler` for unexpected errors.
- Use `useNotification` for user-facing messages.
- Treat duplicate/create `409` responses as expected existing-application navigation, not generic failures.
- Apply flattened `422` validation errors to `MasterForm`.
- Redirect `404` responses to `error-404`.
- Redirect server failures to `server-error` when implemented in the page.
- Redirect unmodifiable applications back to `app-summary`.

## Internationalization Requirements

- Use literal English strings in `t()`.
- Do not introduce nested translation keys.
- Do not build dynamic dotted translation keys.
- Stored diving activity values are display phrases and should be passed directly to `t(activity)`.

## Implementation Constraints

- Use plain JavaScript.
- Use Vue 3 Composition API and existing v3 composables.
- Use `MasterForm` schema patterns for forms.
- Keep required-file logic in application config or card runtime registration.
- Do not modify generic shared components for dive-center-only rules unless the shared contract explicitly requires it.
- Do not add compatibility layers for old field names in frontend forms.

## Verification Checklist

For website changes in this domain, verify:

- New membership create routes to summary.
- Profile edit saves canonical profile fields.
- Activities edit saves only `diving_activities`.
- Training activities trigger international membership validation.
- Adding an international membership creates a pending row.
- Register memberships create derived certificate requirements.
- Active files satisfy required file checks.
- Administrator add and edit submit `FormData`.
- Administrator cancel and restore reload payload.
- Summary blocks submission when profile, activities, memberships, administrators, or files are incomplete.
- Arabic and English pages do not show untranslated keys except intentional domain labels.
