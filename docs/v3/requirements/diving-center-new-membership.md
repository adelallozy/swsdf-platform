# Diving Center New Membership Requirements

**Project:** Website v3  
**Page:** `NewMembership.vue`  
**Last updated:** 2026-05-20
**Primary guide:** `dive-center-applications.md`

## Purpose

The new membership page creates a diving-center membership application from the main center profile data, then sends the applicant to the shared application summary to complete activities, memberships, administrators, files, fees, and submission.

## Route

- Name: `diving-centers-new-membership`
- Component: `src/v3/pages/applications/dive-centers/NewMembership.vue`

## Core Requirements

- Render a `MasterForm` using `makeDiveCenterProfileSchema`.
- Load regions and cities before the form is submitted.
- Filter city options when region changes.
- Clear `city_id` when the selected region changes.
- Submit canonical profile data to `DIVING_CENTERS_APPS_CREATE_MEMBERSHIP`.
- On success, load the created application and route to `app-summary`.
- On `422`, apply flattened backend validation errors to the form.
- On `409`, show an informational existing-application notice and route to `app-summary` when the backend returns `application.id`.
- If the backend returns `409` without an application id, route to `applications-index`.
- Use v3 `httpClient`, `useApplicationStore`, `useLoading`, `useNotification`, and `useErrorHandler`.

## Submitted Fields

Required by the v3 form:

- `name_ar`
- `name_en`
- `unified_number`
- `cr_number`
- `cr_expiry_date`
- `region_id`
- `city_id`
- `location_type`
- `telephone`
- `email`
- `address`
- `location_coordinates`

Optional:

- `vat_tin`
- `website`

## Field Rules

- Arabic and English names must be at least 3 characters and under 200 characters.
- Unified number must be exactly 10 digits.
- Commercial registration number must be exactly 10 digits.
- Commercial registration expiry date is required by the v3 form.
- VAT registration number is optional, but must be 15 digits when supplied.
- Region and city are required.
- Location type must be one of `commercial_shop`, `private_beach`, `on_marina`.
- Phone must match the existing KSA phone rule used by the schema.
- Email must be valid.
- Website is optional and must be a valid HTTP or HTTPS URL when supplied.
- Address is required and must be under 100 characters.
- Location coordinates must be selected through the map field and submitted as `lat,lng`.

## Scope Boundaries

This page must not collect or submit:

- `diving_activities`
- international memberships
- administrators
- files
- logo upload
- fees
- submit action

Logo is handled by the shared files step. Activities, memberships, and administrators are handled by their focused pages from the application summary.

## Verification

- Submit a valid new membership and confirm the browser lands on `app-summary`.
- Submit invalid profile data and confirm server validation maps to the correct fields.
- Confirm the request body uses `cr_expiry_date`, `vat_tin`, `location_type`, and `location_coordinates`.
- Confirm the page does not send old field names such as `cr_expiry_on`, `latlng`, `activities_ids`, or `diving_activities`.
