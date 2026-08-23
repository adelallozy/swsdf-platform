# SWSDF Platform Work Context

Read this file first when resuming work under `swsdf-platform/`. It records the current deployment boundary, active implementation conventions, recently completed changes, and known follow-up work.

## Required Starting References

Read these documents before implementation:

- `swsdf-platform/docs/START_HERE.md` - task lanes, source-of-truth order, and verification commands.
- `swsdf-platform/docs/architecture/overview.md` - routing, state, HTTP, configuration, and error-handling architecture.
- `swsdf-platform/docs/v3/guides/global-guide.md` - current v3 implementation rules.
- `swsdf-platform/docs/v3/guides/translation-guide.md` - literal-English translation-key rules.
- `swsdf-platform/docs/operations/legacy-dependency-migration-progress.md` - remaining legacy dependency and component work.
- `swsdf-platform/docs/operations/public-page-removal-tracker.md` - private-app boundary and removed public functionality.
- `swsdf-platform/docs/hr-leave-deferred-work.md` - deferred employee leave application scope and dependencies.
- `Docs/Vendor Registration/vendor-registration-resume-context.md` - active
  cross-project Vendor Registration checkpoint and ordered remaining work.
- `Docs/Account Registration/README.md` - canonical account types and
  public email-verification product contract.
- `api/docs/authentication.md` - authoritative API authentication
  implementation spec (login, OTP, email change, reset, rate limits).
- `Docs/Account Registration/account-registration-security-fixes-changelog.md` -
  historical record of the July 2026 security fixes and OTP implementation.

For application workflows, also read:

- `swsdf-platform/docs/v3/state/application-store.md`
- `swsdf-platform/docs/v3/reference/payload-system.md`
- `swsdf-platform/docs/v3/pages/ApplicationSummary.md`
- The relevant requirement/spec pair under `swsdf-platform/docs/v3/requirements/` and `swsdf-platform/docs/v3/specs/`.

For the applications index UI improvement work, read:

- `swsdf-platform/docs/v3/requirements/applications-index-ui.md`
- `swsdf-platform/docs/v3/operations/applications-index-ui-task-list.md`

## Deployment And Routing Boundary

- SWSDF Platform is the private application served externally under `https://swsdf.sa/app/`.
- Vite owns the external base through `base: "/app/"` in `vite.config.js`.
- Vue Router uses `createWebHistory(import.meta.env.BASE_URL)`.
- Router paths must be defined relative to that base. Do not add `/app` to route definitions, router links, redirects, or breadcrumb routes. Doing so produces `/app/app/...`.
- **All application routes require a `:locale(ar|en)` segment.** The top-level route (`AppRoot`) is `/:locale(ar|en)`, not `/`. Every workspace, applications, profile, invoice, and payment route is a child of this locale-prefixed root.
- A route defined internally as `/:locale/applications` is exposed as `/app/:locale/applications` (e.g. `/app/ar/applications`).
- The root path `/` redirects to `/{resolvedLocale}` via a top-level redirect.
- A `beforeEach` locale auto-fill guard resolves the `locale` param for name-based navigations that omit it (e.g. `router.push({ name: 'user-applications' })`), so existing components do not need to pass `locale` explicitly. Redirects within the locale tree use `to.params.locale || resolveLocale()`.
- Backward-compatible redirect shims (`workspace`, `user-applications`, `platform-applications`) resolve the locale and redirect to the canonical locale-prefixed target.
- The standalone Docker Compose service is `swsdf-platform`, exposed on host loopback port `8911` and container port `8080`.
- The host nginx location block for `/app/` must preserve the `/app/` request URI when proxying to port `8911`. A reference snippet exists at `Docs/nginx-current-app.conf`.

## Active Source Boundary

- New work belongs under `src/v3/**`.
- Treat `src/platform/**` as legacy/reference unless route and import inspection proves the file is active.
- Some files outside `src/v3/**`, including the shared header, footer, router, store, and bootstrap code, remain active. Confirm imports before changing or removing them.
- Prefer the v3 HTTP client, endpoint configuration, application store, PrimeVue components, and Tailwind classes with the `tw-` prefix.
- Do not add contract-normalization helpers, alias maps, or old/new field loops. Fix drift at its source boundary.

## Current Application Workflow Contract

- Applicant-editable stages are `draft` and `applicant_revision`.
- Applicant delete is allowed only in `draft`.
- Applicant actions are `submit`, `resubmit`, and `recall`.
- Recall is allowed from `review`.
- Applicant action URLs use the canonical application endpoints with an `{appId}` placeholder.
- Applicant-facing cards display `status`; permissions and transitions use `stage` and backend policy.
- Action timelines consume `action_key` and `created_at`.

## Active Vendor Registration Context

- Canonical documentation is indexed at
  `Docs/Vendor Registration/README.md`.
- Registration, profile editing, vendor profile/contacts summary cards, and the
  dedicated Add Contact form are implemented in `src/v3/`.
- The canonical first post-submission stage is lowercase `review`.
- Commercial-registration expiry is enforced by the API as today or later.
- Vendor required-file names are owned by `src/v3/config/application-config.js`;
  `FilesCard.vue` blocks platform submission through application step errors.
  The API intentionally does not repeat this gate, so direct API calls can
  bypass required-file validation by explicit product decision.
- `Commercial Registration` and `National Address` are required vendor files;
  `VAT Registration Certificate` is optional.
- VAT TIN is optional. When supplied, the platform and API contracts require
  exactly 15 digits. Nullable VAT is defined directly in the consolidated
  vendor profile-domain migration.
- The applicant vendor profile is a single-profile destination at
  `/app/:locale/vendors` (`VendorProfileView.vue`, route name
  `vendor-profile`). It displays the approved vendor profile inline when one
  exists, links to an open registration when one is pending, and shows an
  **Apply to become a vendor** call to action when neither exists.
  Profile-update initiation, profile editing, and per-contact
  add/edit/activate/deactivate requests are implemented.
- Vendor schema uses two migrations. The consolidated profile-domain migration
  is applied in development and its schema dump is current.
- The current applicant-platform production build passes.
- Current platform-facing work is Arabic and English browser acceptance.
- Browser acceptance and temporary test-account password cleanup remain open.

## Active Account Registration Context

- Canonical requirements and sequencing are indexed at
  `Docs/Account Registration/README.md`.
- Public selectable account types are `personal` and `business`; `mixed` is a
  temporary legacy classification.
- Personal accounts are eligible for athlete and professional-diver activity.
  Business accounts are eligible for diving-center and vendor activity, and one
  business account may control both. Vendor Registration or Diving-Center
  approval freezes the account to `business` automatically; the change is
  one-way.
- Successful sign-in opens `/app/:locale` directly without a profile selector.
  Eligible workspace sections use this fixed order: Applications, Professional
  Divers, Athletes, Dive Centers, Vendors, Account Settings.
- New and existing public users must verify their email by manually entering an
  OTP before receiving a normal platform JWT. The user initiates delivery by
  clicking **Send verification code**; verification links are not supported.
- Existing administrator accounts remain outside the public OTP rollout.

### OTP email verification — implemented

Backend implementation is specified solely by
`api/docs/authentication.md` (authoritative — endpoints, canonical
`users_emails` store, login gates, OTP binding, rate limits). Summary of
what shipped:

- `sendVerificationCode` and `verifyCode` in `Api/UsersController.php`.
  Six-digit OTP, 10-minute expiry; abuse control via dedicated
  rate-limit buckets; a resend invalidates all prior codes.
- Login gate: correct credentials + unverified email returns
  `403 verification_required` (no JWT). Correct credentials + suspended
  account returns `403 account_suspended`.
- Canonical email store `users_emails` is LIVE: migrations
  `20260725140000` (table + ids_seq trigger) and `20260816120000`
  (users_email_id token binding) ran and were verified end-to-end in
  August 2026. Email change uses the verify-then-switch flow.

Frontend (under `src/v3/`):

- `VerifyEmail.vue` — new two-state verification page. `@paste` handler strips
  non-digits before `maxlength=6` can truncate; `watch` on `code` cleans
  non-digits on any change. Uses `inputmode="numeric"`,
  `autocomplete="one-time-code"`, monospace centered input, 60s resend
  cooldown, centered red banner for 429 errors. Both states carry a
  prominent amber "Don't have access to this email?" banner linking to the
  password-based email correction page (`change-email`).
- `ChangeEmail.vue` — unverified-email correction page
  (`/app/:locale/auth/change-email`, product §4.6, API §6.5
  `users/change-unverified-email`): current email (from `?email=`) +
  password + new/confirm email; per-field 422 errors; on success returns
  to `verify-email?email=<new>` in the pre-send state (no code is sent
  automatically).
- `useAuth.js` `signIn()` redirects to `/auth/verify-email?email=...` on
  `403 verification_required`; `setAuthManually()` completes sign-in after OTP
  verification.
- `SignIn.vue`, `SignUp.vue`, `ForgotPassword.vue`, `ResetPassword.vue` —
  rate-limit banners for 429; SignUp redirects to verify-email after signup;
  ResetPassword accepts token from `?token=` query param.
- `/auth/verify-email` and `/auth/change-email` routes added;
  `AUTH_SEND_VERIFICATION_CODE`, `AUTH_VERIFY_CODE`, and
  `AUTH_CHANGE_UNVERIFIED_EMAIL` endpoint constants added.

Remaining (open items only):

- `ids_seq` audit for 5 tables not done (payment_transfers, hr_leave_records,
  vendor_services, vendor_profile_entries, file_attachments).
- Signup account-type (personal/business) selection tiles and the account
  settings page are implemented. A locked account type (mixed, or an account
  with existing domain relationships) hides the account-type selector in
  account settings with no "locked" notice (revised 2026-08-18 — the previous
  technical "Account type is locked / Mixed accounts cannot change account
  type." banner was removed). Workspace filtering by account type, route
  gating by account type, the unclassified-legacy-user type-selection gate,
  and the workspace-level mixed-account persistent warning remain pending.

Completed since the previous revision of this file (do not re-plan):
`users_emails` migration + ORM + auth cutover ran and was verified
(see `api/docs/authentication.md`); `schema-dump-default.lock` was dumped;
the temporary account-types backfill action was removed after its
production run.

## Translation Contract

- Pass literal English UI text to `t()` or `$t()`.
- Add Arabic translations to `src/locales/ar.json`.
- Do not add generated or nested keys such as `locale.ar`, `actions.toggleLanguage`, `labels.*`, or template-literal key composition.
- Do not pass already-localized Arabic API values to `$t()`. API-backed translatable values should arrive as canonical English display phrases, then be translated by the frontend.
- Route `meta.title` and `meta.pageTitle`, and `setHeading({ title })`, hold the
  literal English key only. Translate exactly once at the consumption point:
  `Breadcrumb.vue` (`$t(item.name)`), `PageHeading.vue` (`$t(title)`), the
  router guard (`t()` for `document.title`), and `NotFound404.vue`
  (`t(meta.pageTitle || 'Home')`). Never pre-translate with `t()` where the
  consumer translates again — that produced the fixed
  `الملف الشخصي` / `الغواصين المحترفين` / `طلب رخصة غواص محترف`
  double-translation warnings and froze breadcrumbs in the module-load locale.
- Current known backend/data issue: some application, breadcrumb, and entity labels arrive already translated in Arabic, producing warnings such as `الطلبات`, `مراكز الغوص`, and Arabic application names when passed to `$t()`.

## Static Assets

- `public/` was audited and reduced from 147 files (6.4 MB) to 63 files (1.9 MB).
- Keep only assets referenced by active code or required transitively by CSS, such as FontAwesome webfonts.
- Vite prefixes imported assets and CSS `url()` resources with `/app/` during builds.
- Runtime public-asset strings are not automatically rewritten. New app-owned public URLs must use the Vite base or imported assets rather than hardcoded root paths.
- Do not restore Keen/Metronic demo fonts, avatars, flags, images, icons, or obsolete logo variants without an active reference and a concrete requirement.

## Recently Completed

**Account-settings locked-type UX (August 2026):**
- A locked account type (mixed, or an account with existing domain
  relationships) now HIDES the account-type selector in Account Settings
  instead of showing a disabled input plus the technical "Account type is
  locked / Mixed accounts cannot change account type." banner. The
  account-name field and the email-change card remain. Soft locks (some
  options unavailable) keep the selector with the "Some account types are
  unavailable" banner. No notice is shown for fully locked accounts —
  product §7.2 revised (2026-08-18) to require the mixed-account
  persistent warning only in the workspace, not account settings.
  Unused Arabic key "Account type is locked" removed.

**Reserved-email fix for email changes (August 2026):**
- API (user-directed change): completed email changes now DELETE the old
  `users_emails` row (address released immediately — no more `superseded`
  tombstones), and `request-email-change` REVIVES the user's existing
  row for the address on restart (revive-or-create) plus deletes other
  stale pending rows. Fixes: same-address restart after an abandoned
  attempt was blocked forever by global email uniqueness, and replaced
  addresses were permanently reserved. Conflict errors now report
  `new_email = "Unable to change email"`. The planned cleanup migration
  for legacy `superseded` rows was dropped by owner decision (no
  migration needed); see `api/docs/authentication.md` §2.1/§11 for the
  residual-data note.
- No platform code changes (the restart flow works unchanged from the
  UI); specs updated (`api/docs/authentication.md` §2/§6/§11, product
  §4.6, `docs/v3/specs/account-settings-email-change.md`).

**Verified-email change with dual confirmation (August 2026):**
- API (approved change): email change is now two-stage —
  `request-email-change` (OTP to the NEW address) → `verify-email-change`
  stage 1 (new-email OTP confirmed; mails an `EMAIL_CHANGE_CONFIRM` OTP
  to the OLD address) → new `verify-email-change-confirm` stage 2
  (executes the switch, consumes all tokens, fresh JWT). Spec:
  `api/docs/authentication.md` §6; product decision 2026-08-18 recorded
  in §4.6 and the §11 backlog.
- Platform: `EmailChangeCard.vue` in `src/v3/components/Account/` mounted
  in Account Settings — four-phase flow (idle → request → newCode →
  oldCode), paste-safe OTP inputs, 60s stage-1 resend cooldown,
  per-field 422/429 handling, `setAuthManually()` on completion; three
  endpoint constants; Arabic translations (including previously missing
  VerifyEmail toast keys); platform spec
  `docs/v3/specs/account-settings-email-change.md`.
- Cleanup from the prior session applied: the unverified-email
  correction page's confirm-email field removal is reflected in the spec
  and ar.json (three unused keys removed).

**Unverified-email correction by password (August 2026):**
- API (approved change): `POST /api/users/change-unverified-email`
  (unauthenticated, bucket `changeUnverifiedEmail` 5/hour per IP+email) —
  password reauth replaces an unverified primary address in place, frees
  the mistyped address for its true owner, invalidates every outstanding
  challenge, dual-writes the `users.email` mirror, and never mails an OTP
  automatically. Spec: `api/docs/authentication.md` §6.5; product §4.6
  un-deferred.
- Platform: `ChangeEmail.vue` page at `/app/:locale/auth/change-email`;
  prominent "Don't have access to this email?" banner on both
  `VerifyEmail.vue` states; `AUTH_CHANGE_UNVERIFIED_EMAIL` constant;
  Arabic translations; platform spec
  `docs/v3/specs/auth-verification-pages.md`.

**Translation double-translation fix (August 2026):**
- Eliminated the frontend double-translation that produced intlify
  `Not found 'الملف الشخصي'`, `'الغواصين المحترفين'`, and
  `'طلب رخصة غواص محترف'` warnings: all router `meta.title`/`meta.pageTitle`
  values and all `setHeading({ title: t(...) })` call sites now hold literal
  English keys, translated once by `Breadcrumb.vue`, `PageHeading.vue`, the
  router guard (`document.title`), and `NotFound404.vue`.
- Removed the unused `meta.pageTitleKey` guard branch; `meta.pageTitle` is the
  single canonical field. Legacy router keys `NAV.changePassword`,
  `NAV.resetPassword`, and `athletes-sport` were replaced with the literal
  keys `Change password`, `Reset password`, and `Update Sport`.
- Second batch: `MasterForm` resolves schema `label`/`placeholder`/validation
  messages through `t()` exactly once (`resolveText`/`formatMsg`), so schemas
  must pass literal English keys. Removed schema pre-translation in
  `ApplicantPersonalPhotoUpload.vue`, `ApplicationPhotoUpload.vue`,
  `UploadFiles.vue`, and `ApplicationFileUpload.vue` (fixed the
  `الصورة الشخصية` / `اسحب الملفات هنا أو اضغط لرفعها` /
  `أختر نوع الملف` / `اختر ملفًا أو اسحبه إلى هنا` /
  `ادخل تاريخ الإنتهاء` warnings). Replaced composed
  `t('choose'/'enter'/'isRequired', { name })` schema keys with the literal
  keys `Choose file type`, `Enter expiry date`, `File Type is required`, and
  `File is required`. `attrs.description` is NOT MasterForm-resolved, so the
  schema-level `t()` remains its single translation pass.
- Quotation item descriptions arrive from the API as canonical English
  display phrases and are translated by `$t(it.description)` in
  `QuotationItemsView.vue` per the translation data-shape contract.
- Application action timelines render API `action_key` values through
  `$t()` in `ActionsTrackingCard.vue` (canonical English display phrases
  defined by `ApplicationsActionsTable::findApplicantNotes` and the
  `actionDesc` entries in the API `applications_configs.php` /
  `vendor_registration_config.php` flows). `ar.json` carries the Arabic for
  that full label set, including the API's historical `Submited` spelling —
  match the stored value exactly; do not "fix" the key.
- Added missing `ar.json` entries: `Unable to complete registration` (API
  signup validation message per `api/docs/authentication.md`),
  `No Professional License Found`, `It looks like you don't have a
  professional diver license linked to this account yet.`,
  `Apply for New License`, `Update Administrators`, `New Application File`,
  the seven `NotFound404.vue` page keys, `Loading application...`,
  `Submitting...`, `Drop your photo here or click to upload`, the
  professional-diver-contract schema validation messages, and the quotation
  fee phrases `Printing and delivery of the license card` and
  `Professional diver license annual fees`.
- Runtime-verified `/app/ar/auth/sign-up` and `/app/404/...` with zero intlify
  warnings; production build passes.

**Locale-prefixed routing unification:**
- Restructured the router so **all** application routes require a `:locale(ar|en)` segment. The top-level `AppRoot` route moved from `/` to `/:locale(ar|en)`.
- Merged the former dual route trees (legacy non-locale `applications` children and locale-prefixed `platform-applications` children) into a single consolidated `applications` parent under the locale-prefixed root.
- Moved `diving-centers-new-membership` into the locale-prefixed applications children so it matches `professional-diver-new-license` and `athlete-new-registration`.
- Added a `beforeEach` locale auto-fill guard that resolves the `locale` param for name-based navigations missing it, avoiding changes to ~44 components that navigate by route name without explicit `locale` params.
- Added backward-compatible redirect shims (`workspace`, `user-applications`, `platform-applications`) and top-level redirects (`/` → `/{locale}`, `/workspace`, payment and invoice compatibility redirects).
- Simplified `invoice-view` and `invoice-review` to inherit locale from the parent root instead of carrying their own `:locale` segment.
- Route inventory `reference/website-pages.md` needs regeneration with `node scripts/generate-pages-inventory.js`.

**Deployment and routing:**
- Configured Vite base `/app/` and Vue Router history base from `import.meta.env.BASE_URL`.
- Removed the redundant router-level `/app` segment that produced `/app/app/...` URLs.
- Added the `swsdf_current_app` Docker Compose service on host port `8911`.
- Added the nginx reverse-proxy reference configuration at `Docs/nginx-current-app.conf`.

**Static assets:**
- Pruned unused files from `swsdf-platform/public/` (147 files / 6.4 MB → 63 files / 1.9 MB) and verified the production build.

**Standalone production deployment:**
- SWSDF Platform is deployed as a standalone static bundle, independent of the rest of the swsdf.sa stack. `npm ci && npm run build` runs outside Docker and produces `dist/`, with production `VITE_*` values baked in by Vite.
- `swsdf-platform/Dockerfile` builds a reusable nginx-only image. It contains nginx and `nginx.conf`, not application files, and is rebuilt only when the static-server base image or configuration changes.
- `swsdf-platform/docker-compose.yml` mounts `dist/` read-only at `/usr/share/nginx/html/app`. The bundle path defaults to `./dist` and can be set with `SWSDF_PLATFORM_DIST_PATH`; host loopback port defaults to `8911` via `SWSDF_PLATFORM_PORT`.
- `swsdf-platform/nginx.conf` serves the mounted bundle under `/app/`, long-caches `/app/new-front/assets/`, provides SPA history fallback, and uses `absolute_redirect off` for correct redirects behind the host reverse proxy.
- SWSDF Platform production deployment is intentionally decoupled from the rest-of-stack compose. The former application-bundle images `swsdf-current-app` and `swsdf-platform` are retired; the reusable server image is `swsdf-platform-nginx`, and application releases are versioned `dist/` bundles.
- Verified `swsdf-platform-nginx:1.0.0` as image `sha256:3f858028b5e47fe63c2d0e0319f993e3c05794a8d7dd0cff03473d6ede2ceff3` (48.2 MB). The Docker build context contains only the Dockerfile and nginx configuration; the externally built `dist/` mount is read-only, the container becomes healthy, and `/app/` plus SPA routes return 200.
- Canonical operations runbook: `docs/guides/production-deployment.md`. Private image publication guide: `docs/guides/private-docker-hub-image.md`.

**Authentication and file boundary:**
- The v3 HTTP client handles every API `401` through centralized `signOut("unauthorized")`; protected routes redirect to sign-in through the existing `AUTH_SIGNOUT` listener, while public routes remain in place. Individual profile pages must not display a second unauthorized toast. See `docs/v3/reference/http-client.md` for the canonical request and error contract.
- `VITE_AUTHENTICATOR_SIGN_OUT` uses the canonical `users/logout` endpoint.
- Dive-center profile logos consume the canonical `divingCenter.logo` response field. The API suppresses active local logo paths whose physical files are missing from CakePHP `WWW_ROOT`, allowing the existing UI fallback to render without a failed browser request. The warning log identifies stale file metadata for separate content repair; no records are automatically modified or deleted.

**Navigation boundary:**
- Established the public/private boundary: logos and breadcrumb `Home` link to the localized public website via `VITE_WEB_BASE_URL`; Workspace navigation stays under `/app/`.
- Fixed `locale` param warnings by switching from `{ name: 'workspace', params: { locale } }` to `{ name: 'AppRoot' }` across `NewLicense.vue`, `NewMembership.vue`, and `ProfileMenuDrop.vue`.

**Header redesign:**
- Replaced the fixed/overlay-prone header with a compact sticky `.workspace-header` in normal document flow.
- Removed the unused hamburger and empty mobile navigation drawer.
- Scoped header CSS to `.workspace-header` so it no longer affects breadcrumb or footer `<nav>` elements.
- Redesigned the profile dropdown (`ProfileMenuDrop.vue`) with isolated `.account-menu` styles, named routes, and hover/focus/open states matching the language control.

**Footer redesign:**
- Replaced the oversized public-style footer with a compact private footer containing federation identity, social links, copyright, and domain.

**Breadcrumb:**
- Implemented `useBreadcrumb.js` composable with consecutive-title deduplication and intermediate redirect wrapper removal.
- `Home` crumb is an external anchor via PrimeVue `home` prop; final crumb is plain text.
- Produces `Home > Workspace > My Applications` instead of the previous `Home > Workspace > Workspace > Applications > My Applications`.

**Applications index UI:**
- Added shared `PageHeading` component and `usePageHeading` singleton composable; pages call `setHeading()` instead of creating local `<h1>` elements.
- Redesigned `ApplicationCard.vue` with a two-row header (number + status on top, title below), soft neutral metadata surface, bottom-aligned primary action, and RTL/LTR-aware arrow.
- Card status badges map canonical English values to severity variants without relying on color alone.
- Date/time display uses `Intl.DateTimeFormat` with `Asia/Riyadh` timezone.
- Responsive grid: 3 columns desktop, 2 tablet, 1 mobile with `tw-items-stretch` equal-height cards.
- Removed redundant container wrappers and fixed-header offset from `MainLayout.vue`.

**Translations:**
- Updated auth and main-header language controls to avoid `locale.*` dynamic translation keys.
- Added missing Arabic translations for application statuses, card actions, profile menu, footer, and authentication text.

**Account registration security fixes and OTP email verification:**
See `Docs/Account Registration/account-registration-security-fixes-changelog.md` for the July 2026 25-file inventory; current implementation is `api/docs/authentication.md`.
- Backend: entity lockdown, signup whitelist, JWT hardening, rate limiting, login verification gate (403 verification_required / account_suspended), OTP endpoints (`sendVerificationCode`/`verifyCode`), `UserMailer` verification template, canonical `users_emails` store (migrations run and verified August 2026).
- Frontend: `VerifyEmail.vue` verification page with paste-safe OTP input, `useAuth.js` gate handling, rate-limit banners across all auth pages, `/auth/verify-email` route, endpoint constants.

## Known Follow-Up Work

- Add automated API test coverage for the two email-identity change flows:
  unverified-email correction (`change-unverified-email`, §6.5) and the
  verified-email dual confirmation (`verify-email-change` stage 1 +
  `verify-email-change-confirm` stage 2) — races, token invalidation on
  re-request, and stale-OTP behavior are covered by design but not by
  tests (live E2E only).
- Implement HR Leave Wave 2 only after the decisions in `docs/hr-leave-deferred-work.md` and the canonical API registry are approved.
- Continue the applications-index UI task list with optional filtering, date/numeral verification, and final accessibility/verification passes. Core header, footer, breadcrumb, page heading, card redesign, date formatting, and responsive grid phases are complete.
- Trace and correct API-backed Arabic values that are passed back through `$t()`. Prefer canonical English display phrases from the API instead of frontend Arabic-key compatibility entries.
- Correct applicant portrait/file URLs that may arrive as absolute local API URLs such as `http://localhost:8915/applications_files/...`. File URLs should use the configured public files boundary and must not embed a deployment-specific localhost origin.
- Continue auditing active nested translation keys such as `Common.*`, `labels.*`, and `fileUploader.*`; replace them with literal English keys when touching those components.
- Regenerate `docs/reference/website-pages.md` after route changes with `node scripts/generate-pages-inventory.js`.
- Account registration remaining work: workspace filtering by account type, route gating by account type, unclassified-legacy-user type-selection gate, the workspace-level mixed-account persistent warning, and the `ids_seq` audit for 5 tables (payment_transfers, hr_leave_records, vendor_services, vendor_profile_entries, file_attachments). Already done — do not re-plan: signup personal/business selection tiles, the account settings page (with locked-account-type selector hidden and no technical notice), direct post-sign-in workspace navigation with canonical ordering, account-type freezing on vendor/dive-center approval, and the `UsersEmailsTable`/`UsersEmail` ORM classes.

## Verification

Run the checks appropriate to the change:

```bash
npm run translations:audit -- --limit=50
node scripts/generate-pages-inventory.js
npm run build
```

For `/app/` deployment changes, verify these routes directly:

- `/app/ar/auth/sign-in`
- `/app/ar/auth/verify-email` (OTP email verification page — needs `?email=` query param)
- `/app/ar/auth/change-email` (password-based unverified-email correction — carries `?email=`)
- `/app/ar` (workspace dashboard)
- `/app/ar/applications`
- `/app/ar/applications/professional-diver-new-license`
- `/app/ar/applications/diving-centers-new-membership`
- `/app/ar/applications/athlete-new-registration`
- `/app/ar/applications/{id}/summary`

Confirm generated links contain exactly one `/app` prefix and that every application URL includes a locale segment.

## Resume Prompt

Use this entry point in a new session:

```text
Resume SWSDF Platform work.

Read first:
- swsdf-platform/AGENTS.md
- swsdf-platform/docs/swsdf-platform-work-context.md
- swsdf-platform/docs/START_HERE.md

Task:
<describe the next task>

Preserve the external /app/ base, use literal English translation keys, and keep new implementation under src/v3 unless active imports require otherwise.
```
