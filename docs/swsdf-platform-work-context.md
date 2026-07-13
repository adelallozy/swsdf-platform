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
- Router paths must be defined relative to that base. The top-level application route is `/`, not `/app`.
- A route defined internally as `/ar/applications` is exposed as `/app/ar/applications`.
- Do not add `/app` to route definitions, router links, redirects, or breadcrumb routes. Doing so produces `/app/app/...`.
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
- Recall is allowed from `Data Verification`.
- Applicant action URLs use the canonical application endpoints with an `{appId}` placeholder.
- Applicant-facing cards display `status`; permissions and transitions use `stage` and backend policy.
- Action timelines consume `action_key` and `created_at`.

## Translation Contract

- Pass literal English UI text to `t()` or `$t()`.
- Add Arabic translations to `src/locales/ar.json`.
- Do not add generated or nested keys such as `locale.ar`, `actions.toggleLanguage`, `labels.*`, or template-literal key composition.
- Do not pass already-localized Arabic API values to `$t()`. API-backed translatable values should arrive as canonical English display phrases, then be translated by the frontend.
- Current known backend/data issue: some application, breadcrumb, and entity labels arrive already translated in Arabic, producing warnings such as `الطلبات`, `مراكز الغوص`, and Arabic application names when passed to `$t()`.

## Static Assets

- `public/` was audited and reduced from 147 files (6.4 MB) to 63 files (1.9 MB).
- Keep only assets referenced by active code or required transitively by CSS, such as FontAwesome webfonts.
- Vite prefixes imported assets and CSS `url()` resources with `/app/` during builds.
- Runtime public-asset strings are not automatically rewritten. New app-owned public URLs must use the Vite base or imported assets rather than hardcoded root paths.
- Do not restore Keen/Metronic demo fonts, avatars, flags, images, icons, or obsolete logo variants without an active reference and a concrete requirement.

## Recently Completed

**Deployment and routing:**
- Configured Vite base `/app/` and Vue Router history base from `import.meta.env.BASE_URL`.
- Removed the redundant router-level `/app` segment that produced `/app/app/...` URLs.
- Added the `swsdf_current_app` Docker Compose service on host port `8911`.
- Added the nginx reverse-proxy reference configuration at `Docs/nginx-current-app.conf`.

**Static assets:**
- Pruned unused files from `swsdf-platform/public/` (147 files / 6.4 MB → 63 files / 1.9 MB) and verified the production build.

**Distributed (production) image — standalone deployment:**
- SWSDF Platform is deployed as a standalone project, independent of the rest of the swsdf.sa stack. The target production flow builds an immutable, version-tagged image outside the production server and deploys that image by digest or release tag. The container only serves static files and reaches the public API over HTTPS (origins baked from `.env`/`.env.production` at build time), so it needs no other application container on its network.
- Added a multi-stage `swsdf-platform/Dockerfile`: stage 1 builds the Vite bundle (`npm ci` + `npm run build`, baking in `.env`/`.env.production` `VITE_*` values); stage 2 serves `dist/` from `nginx:1.27-alpine` on container port `8080`. Build arguments add OCI version, Git revision, and build-date labels to release images.
- Added `swsdf-platform/nginx.conf` (serves the bundle under `/app/` to match the Vite base, long-caches `/app/new-front/assets/`, SPA history fallback, `absolute_redirect off` for correct redirects behind the host reverse proxy) and `swsdf-platform/.dockerignore` (keeps `.env`/`.env.production`, excludes `node_modules`/`dist`/`docs`/dev env files; the runtime stage only copies `dist/`, so source secrets never land in the final image).
- Added standalone `swsdf-platform/docker-compose.yml` (single `swsdf-platform` service, no `depends_on`, host port defaults to `8911` via `SWSDF_PLATFORM_PORT`, container name via `SWSDF_PLATFORM_CONTAINER`, `wget` healthcheck). Host port `8911` matches the existing host nginx `/app/` block.
- SWSDF Platform production deployment is intentionally decoupled from the rest-of-stack compose.
- Verified renamed candidate `swsdf-platform:20260713-3b2553efeba7-dirty.1` as image `sha256:3b52bd15a1292b2995b2bd19d7d60ae65b1cba4e3cde77d2f3006aa950906d9e`; `/app/` and SPA routes return 200 and both HTML and OCI metadata identify the application as SWSDF Platform. The former `swsdf-current-app` image name is retired. Clean production releases must be built from a committed revision.

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

## Known Follow-Up Work

- Continue the applications-index UI task list with optional filtering, date/numeral verification, and final accessibility/verification passes. Core header, footer, breadcrumb, page heading, card redesign, date formatting, and responsive grid phases are complete.
- Trace and correct API-backed Arabic values that are passed back through `$t()`. Prefer canonical English display phrases from the API instead of frontend Arabic-key compatibility entries.
- Correct applicant portrait/file URLs that may arrive as absolute local API URLs such as `http://localhost:8915/applications_files/...`. File URLs should use the configured public files boundary and must not embed a deployment-specific localhost origin.
- Continue auditing active nested translation keys such as `Common.*`, `labels.*`, and `fileUploader.*`; replace them with literal English keys when touching those components.
- Regenerate `docs/reference/website-pages.md` after route changes with `node scripts/generate-pages-inventory.js`.

## Verification

Run the checks appropriate to the change:

```bash
npm run translations:audit -- --limit=50
node scripts/generate-pages-inventory.js
npm run build
```

For `/app/` deployment changes, verify these routes directly:

- `/app/ar/auth/sign-in`
- `/app/ar`
- `/app/ar/applications`
- `/app/ar/applications/{id}/summary`

Confirm generated links contain exactly one `/app` prefix.

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
