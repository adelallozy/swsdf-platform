# SWSDF Platform AGENTS.md

## Required Starting Context

Before making any change under `swsdf-platform/`, read:

- `swsdf-platform/docs/swsdf-platform-work-context.md`
- `swsdf-platform/docs/START_HERE.md`

For route, deployment, translation, application workflow, asset, or API-integration work, treat `swsdf-platform-work-context.md` as the canonical resume entry point. It records the `/app/` deployment boundary, active source conventions, recent changes, known issues, and verification commands.

## Data Safety Rules

Follow the repo-wide **Data Safety Rules** in the root `AGENTS.md`:
- Never run migrations yourself; the user runs all migrations.
- Never delete, truncate, or destructively `UPDATE` any records without clear instruction.
- Quotation rows are financial records and are never to be deleted as part of any task.

## Local Rules

- Treat `src/platform/**` as legacy/reference unless current route and import inspection proves the file is still active.
- New v3 work belongs under `src/v3/**` and should follow the current v3 composables, config, API endpoint, PrimeVue, and Tailwind `tw-` patterns.
- New work must use [`src/v3/services/httpClient.js`](src/v3/services/httpClient.js) for HTTP and [`src/v3/composables/useAuth.js`](src/v3/composables/useAuth.js) for auth state.
- Do not import or extend the legacy user store ([`src/store/user.js`](src/store/user.js)) or the axios plugin ([`src/core/plugins/axios.ts`](src/core/plugins/axios.ts)); both remain only for legacy pages not yet migrated.
- Do not add `normalize*` helpers, alias maps, old/new field loops, or input-massaging utilities to hide inconsistent contracts.
- Use canonical backend/frontend values directly. If data arrives under an old name or old value, fix the source contract, migration, or boundary that emits it.
- Add compatibility only with explicit user approval and only for a bounded, documented migration window.
- Keep Vue Router paths relative to `import.meta.env.BASE_URL`; never add the external `/app` base to route definitions.
- Use literal English text as translation keys. Do not add dynamic dotted keys or Arabic mirror keys for already-localized API values.
