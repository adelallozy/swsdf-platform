# Dive Center Activities Edit Requirements

**Project:** Website v3  
**Page:** `UpdateActivities.vue`  
**Last updated:** 2026-05-06  
**Primary guide:** `dive-center-applications.md`

## Purpose

The activities edit page updates only the `diving_activities` list inside the application profile. It keeps activities separate from the main profile form while still saving through the profile update endpoint.

## Route

- Name: `dive-center-activities-edit`
- Path: `/app/:locale/applications/:appId/dive-centers/activities/edit`
- Component: `src/v3/pages/applications/dive-centers/UpdateActivities.vue`

## Core Requirements

- Load activity options from `DIVING_CENTERS_APPS_GET_MEMBERSHIP_OPTIONS`.
- Load the application profile when needed.
- Use `MasterForm` with `makeDiveCenterActivitiesSchema`.
- Render main and ancillary activities with `RadioTiles` in multi-select mode.
- Require at least one main activity.
- Require at least one ancillary activity.
- Preserve saved activities that are not present in the current option catalog.
- Submit only `{ diving_activities: [...] }`.
- Submit to `DIVING_CENTERS_APPS_UPDATE_PROFILE + appId`.
- Route back to `app-summary` after save.
- Apply backend validation errors to `MasterForm`.

## Activity Groups

Main activities are loaded from `divingPrimaryActivityOptions`.

Ancillary activities are loaded from `divingAncillaryActivityOptions`.

Saved activity values are partitioned into:

- `primaryActivities`
- `ancillaryActivities`
- `unclassifiedActivities`

Unclassified activities are preserved in the outgoing payload so existing saved data is not silently dropped when catalogs change.

## Submitted Payload

The page submits:

```json
{
  "diving_activities": []
}
```

The list contains literal activity labels.

The page must not submit:

- `activities_ids`
- `diving_activities_ids`
- profile fields unrelated to activities

## International Membership Dependency

The following training activities require at least one valid international membership in the summary:

- `FREEDIVING_TRAINING`
- `RECREATIONAL_DIVING_TRAINING`
- `TECHNICAL_DIVING_TRAINING`

The activities page only saves activity choices. The summary international-memberships card owns the membership validation and required-file side effects.

## Summary Relationship

The activities summary card:

- Reads `payload.center_profile.diving_activities`.
- Partitions activities using the default local catalog.
- Shows main, ancillary, and additional saved activities.
- Registers validation errors when editable and either main or ancillary activity list is empty.
- Routes users to the profile edit page first if no center profile exists.

## Verification

- Select one main and one ancillary activity and save.
- Confirm the request body contains only `diving_activities`.
- Confirm existing unclassified saved activities remain after save.
- Confirm summary validation appears when either required activity group is missing.
- Confirm selecting a training activity makes the international membership summary validation active.
