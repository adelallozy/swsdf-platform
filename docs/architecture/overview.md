# Universal Roles & Architecture Reference

Last updated: 2026-07-16

* **Single source of UX truth:** Pages/components decide UX (redirects, toasts). Services/composables only fetch, normalize, and **rethrow**.
* **No hidden side-effects:** No notifications, no navigation inside services.
* **Semicolons everywhere. JavaScript only.** No TypeScript.

---

## Routing & Navigation

* External base namespace: `/app/`, configured by Vite and nginx. Router definitions remain relative to this base.
* **All application routes require a `:locale(ar|en)` segment.** The top-level route (`AppRoot`) is `/:locale(ar|en)`; every workspace, applications, profile, invoice, and payment route is a child of this locale-prefixed root.
* Locale-prefixed application routes are exposed as `/app/:locale(ar|en)/*` (e.g. `/app/ar/applications`).
* The root path `/` redirects to `/{resolvedLocale}`.
* Auth routes are exposed as `/app/:locale(ar|en)/auth/*` and remain guest-only.
* Auth guard runs in `beforeEach`. If unauthenticated → redirect to sign-in after storing `last_page`.
* **Locale auto-fill guard:** `beforeEach` detects name-based navigations that are missing the `locale` param and resolves it from the current route or `localStorage`. This allows existing components to call `router.push({ name: 'user-applications' })` without passing `locale` explicitly.
* **Locale handling:** if the route contains `:locale`, set the locale accordingly before rendering; keep document title in sync with `to.meta.pageTitle`.
* Redirects within the locale tree use `to.params.locale || resolveLocale()` instead of stale module-load-time `locale.value`.
* Backward-compatible redirect shims (`workspace`, `user-applications`, `platform-applications`) resolve the locale and redirect to the canonical locale-prefixed target.
* Always scroll to top on route change.
* Never add `/app` to route definitions or named-route navigation; Vite's history base adds it externally.
* Route inventory: `../reference/website-pages.md` (auto-generated — regenerate after route changes).

### Key Routes

| Purpose | Route | Name |
|---------|-------|------|
| Workspace dashboard | `/app/:locale` | `workspace-index` |
| Applications hub | `/app/:locale/applications` | `applications-index` |
| Professional diver new license | `/app/:locale/applications/professional-diver-new-license` | `professional-diver-new-license` |
| Dive center new membership | `/app/:locale/applications/diving-centers-new-membership` | `diving-centers-new-membership` |
| Athlete new registration | `/app/:locale/applications/athlete-new-registration` | `athlete-new-registration` |
| Sport fishing create | `/app/:locale/applications/sport-fishing-register/:eventId` | `sport-fishing-register` |
| Sport fishing edit | `/app/:locale/applications/sport-fishing-team-update/:appId` | `fishing-team-update` |
| Application summary | `/app/:locale/applications/:appId/summary` | `app-summary` |
| Application waiver | `/app/:locale/applications/:appId/waiver` | `app-waiver` |
| Application files | `/app/:locale/applications/:appId/new-files` | `app-new-files` |

**Participants** are managed inline on the Summary page — no dedicated route.

## Application Shell

### Public/private navigation boundary

* Public website base is configured with `VITE_WEB_BASE_URL`:
  * development: `http://localhost:8910/`
  * production: `https://swsdf.sa/`
* Header/footer logos and breadcrumb `Home` use normal anchors to the localized public website root.
* Private workspace navigation uses named Vue Router routes and remains under `/app/:locale/`.
* All application routes carry a `:locale` param. The breadcrumb `Workspace` item targets `AppRoot`; the locale auto-fill guard resolves the param when components navigate by name without it.

### Header

* Active component: `src/layout/header/Header.vue`.
* The header is sticky and remains in normal document flow; it is not a fixed overlay.
* The shell does not include a public-site navigation menu or empty mobile drawer.
* Controls are limited to the public-site logo, language switch, and account menu.
* Mobile hides the wordmark while retaining the federation symbol and account/language controls.
* Account menu implementation: `src/layout/header/ProfileMenuDrop.vue`.

### Footer

* Active component: `src/layout/footer/Footer.vue`.
* The private footer is compact and contains federation identity, social links, copyright, and domain.
* The logo links to the localized public website root.
* Redundant public-website and Workspace button blocks are intentionally omitted.
* Social links are secondary icon-only actions with accessible labels.

### Breadcrumb

* Active component: `src/v3/components/Layout/Breadcrumb.vue` (wraps PrimeVue Breadcrumb).
* Composable: `src/v3/composables/layout/useBreadcrumb.js`.
* The `Home` item is an external anchor to the localized public website root (`VITE_WEB_BASE_URL`), passed via PrimeVue's `:home` prop so it does not inherit the `/app/` router base.
* Private crumbs are built from `route.matched` records that declare `meta.title`.
* Consecutive duplicate titles are deduplicated (e.g. `AppRoot` "Workspace" followed by `web-app-index` "Workspace").
* An intermediate `Applications` redirect wrapper is dropped when a more specific child title follows it.
* The final crumb is rendered as plain text (not a link).

### Page Heading

* Active component: `src/v3/components/Layout/PageHeading.vue` (rendered once inside `MainLayout.vue`).
* Composable: `src/v3/composables/layout/usePageHeading.js` — singleton module-level refs.
* Pages call `usePageHeading().setHeading({ title, subtitle })` in their setup function.
* The title is rendered as the page's single `<h1>`; subtitle is a secondary `<p>`.
* Pages must not create their own duplicate `<h1>` or heading wrapper.
* The composable exposes readonly `title`, `subtitle`, and `visible` refs.

---

## HTTP Client & Error Semantics

* `apiRequest` sets: `Accept: application/json`, `Accept-Language`, `Authorization: Bearer <token>` (if available).
* `Content-Type: application/json` unless body is `FormData`.
* `credentials: 'include'`.
* Status handling:
  * **401**: always call `signOut('unauthorized')`, then throw `{ name: 'UNAUTHORIZED', status: 401 }`. `signOut()` makes a best-effort request to the configured `users/logout` endpoint, clears all local authentication state, and emits `AUTH_SIGNOUT`. The application-level listener redirects only protected routes to sign-in and preserves the current route in the `redirect` query; public routes remain in place.
  * **204**: return `null`.
  * **422**: throw `{ name: 'VALIDATION_ERROR', status: 422, validationErrors: { field: [msg] } }`.
  * **409**: throw `{ name: 'CONFLICT_ERROR', status: 409, payload }`.
  * **>=500**: throw generic HTTP error.
* Services/composables **must** `capture(err, …)` once and **rethrow**.
* `Api` endpoints use Bearer JWT authentication. `credentials: 'include'` does not replace the `Authorization` header for these endpoints.
* Page-level callers must not toast, capture, or redirect again for a normalized 401. Return from the local catch block and let the centralized authentication lifecycle own the transition.

---

## Error UX Rules

Use `src/v3/utils/errors.js` helpers:

* **422 (validation)** → `MasterForm.applyServerErrors(errors)`. No toast.
* **409 (conflict)** → navigate to redirect target or show toast.
* **401 (unauthorized)** → no page-level toast or redirect; `httpClient.js` and the `AUTH_SIGNOUT` listener own sign-out and navigation.
* **404** → `router.replace({ name: 'error-404' })`.
* **>=500** → `router.replace({ name: 'error-404' })`.
* **Fallback** → `notifyError(userMessage(err))`.

**Rule of one:** exactly one `capture()` per failure chain.

---

## State Management

### useApplicationStore (`src/v3/composables/application/useApplicationStore.js`)

* Module-level refs: `application`, `stepsValidationErrors`, flat `payload` object.
* Computed: `canModifyApplication`, `canSubmitApplication`, `progressPercentage`, `incompleteBlockingSteps`.
* Loading: Unified `loadApplication(appId, { withPayload: true })` or legacy two-step.
* Actions: `submitApplication`, `recallApplication`, `deleteApplication`.
* Reference: `../v3/state/application-store.md`.

### useEventsApplicationsApi (`src/v3/composables/api/applications/useEventsApplicationsApi.js`)

* Reactive: `event`, `team`, `participants`, `loading`, `lastError`.
* Methods: `fetchEvent`, `sportFishingCreateTeam`, `sportFishingUpdateTeam`, `loadApplicationFishingTeam`, `fetchParticipants`, `addParticipant`, `updateParticipant`, `removeParticipantById`.
* All methods: **capture-and-rethrow only**.

---

## Applications Index Page

* Page component: `src/v3/pages/applications/ApplicationsIndex.vue`.
* Card component: `src/v3/components/applications/ApplicationCard.vue`.
* Route: `/:locale/applications` (exposed as `/app/:locale/applications`).
* The page calls `usePageHeading().setHeading()` to set the title and subtitle — no local `<h1>`.
* Responsive grid: 3 columns desktop, 2 tablet, 1 mobile (`md:tw-grid-cols-2 lg:tw-grid-cols-3`).
* Cards use `tw-items-stretch` for equal-height rows; primary action sits at the bottom via `margin-top: auto`.
* Application status badges map canonical English status values to severity variants (success, danger, warning, info, neutral) and must not rely on color alone.
* Date/time display uses `Intl.DateTimeFormat` with the active locale and `Asia/Riyadh` timezone.
* Card primary action label is `View application` with RTL/LTR-aware arrow direction.

---

## Forms & Validation

* **MasterForm.vue** — schema-driven; `valibot` validation; emits `@validity` and `@submit`.
* **Schema is not reactive** — prefill by updating field `.value`s then re-mount via `:key`.
* See `../v3/guides/masterform-guide.md` for canonical usage.

---

## Configuration

* **APPLICATION_CONFIG** in `src/v3/config/application-config.js`.
* Includes steps and review bundles for sport fishing, PD-NL, and athlete registration.
* No `step-library.js` — single config file only.

---

## Utilities

* **Dates:** `src/v3/utils/date.js` — `toYmd(value)`.
* **Units:** `src/v3/utils/units.js` — `cmToMetersString`, `metersStringToCmInt`.
* **Errors:** `src/v3/utils/errors.js` — `isValidation`, `isConflict`, `isNotFound`, `isServerError`, `getStatus`, `userMessage`, `getRedirectTarget`.

---

## Related Documentation

* `../v3/guides/global-guide.md` — coding standards
* `../v3/guides/refactoring-guide.md` — refactoring process
* `../v3/guides/masterform-guide.md` — MasterForm usage
* `../v3/guides/translation-guide.md` — i18n strategy
* `../v3/requirements/applications-index-ui.md` — applications index UI requirements
* `../reference/website-pages.md` — route inventory
