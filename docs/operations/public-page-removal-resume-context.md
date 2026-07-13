# Public Page Removal Resume Context

Last updated: 2026-05-19
Project root: `/home/adelallozy/workspace/swsdf.sa/current_app`

## Status: Complete

All public-facing pages have been removed from `current_app`, including public verification routes (`verify-license`, `verify-athlete`). The remaining routes are private/workspace, payment confirmation, and auth flows.

## Scope

- Work only inside `current_app`.
- Do not edit `website_current_app`, `website`, `api`, or other projects.
- Private/workspace pages were not removed (see `public-page-removal-tracker.md` for the full list).

## Porting Guardrail

When copying fixes from the original public website or another sibling project, do not restore removed public routes/components by accident.

- Check `public-page-removal-tracker.md` before copying route, layout, header, footer, home, validation, or public API endpoint changes.
- If an upstream fix touches a removed file, port only the private-app behavior that still exists in this project.
- If the fix is for public pages, keep it in the public website project instead of reintroducing it here.
- After porting, regenerate `docs/reference/website-pages.md` when routes change and run the stale-public scan from `docs/START_HERE.md`.

## Key Changes

- All public routes removed from `src/router/index.js`; `/` redirects to `/app`.
- All app routes live under `/app` with `MainLayout.vue` (auth required).
- Auth routes (`/:locale/auth/*`) remain at root level.
- Verification routes (`verify-license`, `verify-athlete`) were removed from `current_app`.
- 48+ dead component/data files deleted.
- Unused env vars and API endpoint exports cleaned.
- Current shell navigation intentionally separates projects: header/footer logos and breadcrumb `Home` link to the localized public website through `VITE_WEB_BASE_URL`; private Workspace links use `AppRoot` under `/app/`.
- Translation audit tooling added: `npm run translations:audit`.

## Audit Trail

Full removal details: `public-page-removal-tracker.md`.

## Translation Cleanup Rule

Do not mass-delete locale keys. Use `npm run translations:audit` as a candidate report only. Remove keys only after confirming they are not directly source-used, dynamically translated from API data, used by shared/private components, or still needed by workspace/private pages.

## Suggested Follow-Up

1. Continue the `src/website/` component migration tracked in `../v3/operations/refactoring-backlog-website-components.md`.
2. Review private/profile links that still point to removed public route names such as `professional-divers-license-instructions` and `atheltes-instructions`.
3. Review "maybe unused" translation keys flagged by `npm run translations:audit` — only remove keys confirmed unused after manual review.
