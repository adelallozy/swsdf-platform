# Jetski Competition Participation Technical Spec

**Requirement:** [jetski-competition-participation.md](../requirements/jetski-competition-participation.md)
**Page:** `src/v3/pages/applications/jetski/ParticipationUpsert.vue`
**Schema:** `src/v3/schema/applications/jetskiParticipation.js`
**API composable:** `src/v3/composables/application/useEventsApplicationsApi.js`
**Last updated:** 2026-10-09

## Routes

| Name | Path | Mode |
|---|---|---|
| `jetsky-competition-registration` | `applications/jetsky-competition-registration/:event` | create |
| `update-jetsky-competition-application` | `applications/:id/update-jetsky-competition-application/:event` (child of `application-home`) | update |

Both routes render `ParticipationUpsert.vue`. Mode is derived from the presence of
`route.params.id` (the application id). The website Register button links to the
create route through the platform external URL.

## Endpoints

| Constant (env) | Endpoint | Used for |
|---|---|---|
| `VITE_EVENTS_JETSKI_CREATE_APPLICATION` | `POST events-applications/new-jetski-application/{targetId}` | create |
| `VITE_EVENTS_JETSKI_UPDATE_APPLICATION` | `POST events-applications/update-jetski-participation/{appId}` | update |
| `VITE_EVENTS_APPLICATIONS_PICK_RELATIVES` | `GET events-applications/pick-relatives/{appId}` | load existing participation (`jetskiParticipant`) |
| `VITE_EVENTS_BY_ID` | `GET events/by-id/{targetId}` | event, stage, registration window, races |

Functions live in `useEventsApplicationsApi.js`: `jetskiCreateParticipation`,
`jetskiUpdateParticipation`, `loadApplicationJetskiParticipation`.

## Payload

`FormData` (backend actions parse multipart):

- `racer_number` — string
- `work_leave` — string, appended only when non-empty (backend field is optional)
- `races[]` — one entry per selected racing category name

Field limits mirror `EventsAppsJetskiParticipationsTable` validation
(`racer_number` required ≤240, `races` non-empty array, `work_leave` optional ≤240).

## Create flow

1. Athlete check: `useAthleteApi().fetchMyMemberships()` (no sport filter —
   mirrors the API gate, which accepts any athlete row). 404/empty → redirect to
   `athlete-new-registration` with "You must register as a player first".
2. Fetch event via `fetchEvent`. 404 → "Event not found" redirect.
3. Guards: `sport !== 'jetski'`, `stage !== 'Registration'`, or registration
   window closed → redirect with the corresponding message.
4. Racing options: `event.races` mapped to `{ label, value }` and passed through
   the reactive `formOptions` prop (schema stays static).

## Update flow

1. `useApplicationStore().loadApplication(appId)`; 404 → error page.
2. `canModifyApplication` false → redirect to application home with the
   stage message (editable stages: `draft`, `applicant_revision`).
3. `loadApplicationJetskiParticipation(appId)` fills the form via `fillSchema`
   (`races` may arrive as a JSON string and is parsed).

## Error handling

- 409 → `getConflictApplicationId` → redirect to the existing application.
- 422 → `applyServerErrors` with `err.validationErrors`.
- 403 → registration-closed message.
- 404 → error-404 page; ≥500 → server-error page.
- Everything else → `capture()` + generic toast.

## Summary (review) presentation

Jetski applications render on the shared v3 summary page (`app-summary`,
`src/v3/pages/applications/ApplicationSummary.vue`):

- The `application-home` dispatcher (`src/platform/views/Applications/Application.vue`)
  redirects purpose `Jetski Competition Participation` to `app-summary`.
- Application type is configured in `src/v3/config/application-config.js` under
  the key `Jetski Competition Participation` (the legacy `purpose` value every
  jetski application row carries). Layout: `ApplicationInfoCard`,
  `JetskiParticipationCard`, `FilesCard`, `ActionsTrackingCard`.
- `JetskiParticipationCard` (`src/v3/components/applications/cards/`) loads its
  own data through `pickEventApplicationRelatives(appId)` because the backend
  payload resolver does not expose a jetski participation payload key yet. It
  shows the competition, dates, racer name/number, work leave, and racing
  categories, validates the participation step (`jetski_participation`), and
  links to the update route while the application is editable.

## Legacy state

The legacy jetski tree is removed:
`src/platform/views/Applications/competitions/jetsky/` (NewRegistration,
UpdateInformation, ApplicationReview),
`src/platform/components/applications/compititons/jetsky/` (JetskyForm,
Details), and `src/platform/components/applications/UserProfileFiles.vue`
(only consumer was the jetski review). The freediving and underwater-photography
legacy trees remain until their own migrations.
