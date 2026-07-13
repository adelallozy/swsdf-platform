# Dive Center Profile Edit Requirements

**Project:** Website v3  
**Page:** `UpdateCenterProfile.vue`  
**Last updated:** 2026-05-06  
**Primary guide:** `dive-center-applications.md`

## Purpose

The profile edit page updates the `center_profile` section of an existing diving-center application. It edits only center profile fields and returns the applicant to the shared application summary.

## Route

- Name: `dive-center-profile-edit`
- Path: `/app/:locale/applications/:appId/dive-centers/profile/edit`
- Component: `src/v3/pages/applications/dive-centers/UpdateCenterProfile.vue`

## Core Requirements

- Load the application by `appId` with `payloadKeys: ['center_profile']`.
- Load regions and cities.
- Prefill the form from `store.payload.center_profile.value`.
- Redirect to `app-summary` when the application cannot be modified.
- Use `MasterForm` with `makeDiveCenterProfileSchema`.
- Serialize with `serializeDiveCenterProfile`.
- Submit to `DIVING_CENTERS_APPS_UPDATE_PROFILE + appId`.
- Show a success notification after save.
- Route back to `app-summary` after save.
- Apply flattened `422` backend validation errors to `MasterForm`.
- Route `404` responses to `error-404`.

## Submitted Fields

The page submits these canonical fields:

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

The page must not submit:

- `cr_expiry_on`
- `latlng`
- `activities_ids`
- `diving_activities`

## Field Rules

- Uses the same profile schema as new membership.
- `location_coordinates` is edited with `LocationPicker`.
- `location_coordinates` remains a single canonical `lat,lng` string.
- Logo upload is outside the profile page and belongs to application files.

## Summary Relationship

The profile summary card:

- Reads `payload.center_profile`.
- Shows the edit action only when the application can be modified.
- Registers a validation error when no profile exists and the application is editable.
- Shows available city and region display names from payload.

## Verification

- Open the page from `DivingCenterProfileCard`.
- Confirm profile values are prefilled from `center_profile`.
- Change profile fields and confirm the summary refreshes after save.
- Confirm `422` errors are shown on the correct fields.
- Confirm the request body contains canonical profile names only.
