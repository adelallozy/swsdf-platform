# Dive Center Applications Spec

**Project:** SWSDF Platform v3  
**Domain:** Diving centers  
**Last updated:** 2026-05-20  
**Requirement:** `../requirements/dive-center-applications.md`

## Duplicate Application Conflicts

The diving-center application entry points treat backend `409` responses as an existing active application, not a generic failure.

Affected entry points:

- `src/v3/pages/applications/dive-centers/NewMembership.vue`
- `src/v3/pages/app/dive-centers/DiveCenterProfile.vue`

Shared helper:

- `src/v3/utils/applicationWorkflow.js`

Implementation rules:

- Read the blocking application from `error.payload.application` or `error.payload.body.application`.
- Also support legacy `application_id` in `error.payload.application_id` or `error.payload.body.application_id`.
- If the blocking application is in `draft` or `applicant_revision`, show: `You already have an application in progress. Continue the existing application instead.`
- For submitted/review stages, show: `You already submitted this application. You can track its status here.`
- If no application payload exists, show: `You already have an active application. You can track it from your applications.`
- Use an informational toast, not an error toast.
- Route to `app-summary` when an application id is available.
- Route to `applications-index` when no application id is available.

Unexpected failures still use `useErrorHandler` and the existing failure notifications.
