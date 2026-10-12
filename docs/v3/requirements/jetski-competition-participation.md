# Jetski Competition Participation Registration Requirements

**Feature:** Jetski competition participation application (create and update)
**Primary routes:**
- Create: `/app/{locale}/applications/jetsky-competition-registration/{eventId}`
- Update: `/app/{locale}/applications/{appId}/update-jetsky-competition-application/{eventId}`
**Primary page:** `src/v3/pages/applications/jetski/ParticipationUpsert.vue`
**Entry point:** Public website competition page Register button (jetski events in Registration stage)
**Last updated:** 2026-10-09

## Purpose

An athlete registers their jetski participation for a specific competition: racing
categories, racer number, and an optional work-leave reference. The same form lets
the applicant update those details while the application is still editable.

## Scope

- v3 create and update form for jetski competition participation
- eligibility, sport, stage, and registration-window gating
- duplicate-application handling
- navigation after create/update

Out of scope: the application review/summary presentation, work-leave attachments,
application submit/recall lifecycle (owned by the shared application flow), and
jetski results management.

## Requirements

### REG-1: Eligibility

- The applicant must have an athlete membership (any sport) before the create
  form is shown; otherwise they are redirected to athlete registration with an
  explanatory message. This mirrors the API gate.
- The event must be a jetski event (canonical sport code `jetski`).
- The event stage must be `Registration` and the current date must fall inside
  the event's registration window when both registration dates are present.

### REG-2: Form fields

| Field | Required | Rules |
|---|---|---|
| Racing categories | Yes | At least one category chosen from the event's `races` list |
| Racer Number | Yes | Free text, max 240 characters |
| Work leave | No | Free text, max 240 characters, submitted only when non-empty |

### REG-3: Duplicate prevention

- If the applicant already has a jetski participation application for the same
  event, the API returns the existing application and the applicant is
  redirected to it with an explanatory message.

### REG-4: Success behavior

- Create: navigate to the application home for the new application.
- Update: navigate to the application home for the edited application.
- The application home presents jetski applications on the shared v3
  application summary (see the technical spec).

### REG-5: Error behavior

- Validation errors (422) are displayed on the matching form fields.
- Closed/expired registration (403) shows the "not open for registration" message.
- Missing eligibility (400) redirects to athlete registration.
- Server errors navigate to the error page; all errors are logged through the
  shared error handler.

### REG-6: Localization and layout

- All UI text uses literal English keys translated once; Arabic lives in
  `src/locales/ar.json`.
- Layout must work in Arabic (RTL) and English (LTR) using logical properties.
