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

## Tests Stay Fully Delegated

All test planning, test-file creation or editing, test execution, failure
diagnosis, reruns, and result reporting belong exclusively to the
`test-engineer` subagent. The primary coordinator may inspect and review test
evidence but must not write, edit, or run tests unless the user explicitly
instructs it to do so for a specific scope in the current chat. Linting,
builds, and non-test browser inspection remain ordinary verification.

## Local Rules

### Shared Frontend Infrastructure

- Follow the workspace authority at
  [`../Docs/shared-frontend-infrastructure/GOVERNANCE.md`](../Docs/shared-frontend-infrastructure/GOVERNANCE.md).
  The canonical package is `@swsdf/vue-core` at
  `../packages/swsdf-vue-core/`. This project's active `src/v3` implementation
  is the behavioral comparison baseline, not an automatic contract winner.
- Before adding each shared module, compare every active variant, consumer,
  repository history/blame/diff,
  and relevant documentation, and report concrete compatibility impact,
  including FastUpload absolute-URL behavior for transport work.
- No package module is adopted automatically. Adoption here requires explicit
  current-chat user approval, a vendored snapshot pinned by package version and
  SHA-256, and direct imports from the vendored module. Never hand-edit vendored
  source. Do not implement or delegate wrappers, re-export shims, compatibility
  facades, profile factories, alias layers, or project adapters as shortcuts.
  This project is not adopted.
- The current loading implementation remains untouched as behavioral evidence.
  Any separately approved migration renames computed-ref `isLoading` to
  `isAnyLoading`, retains `isLoadingKey`, and retains unguarded behavior as
  `withLoading`; it must not add duplicate suppression or counters.
- `apiClient.js` is retired. Do not copy, import, extend, or recreate it; delete
  its downstream copy when touched.

- Treat `src/platform/**` as legacy/reference unless current route and import inspection proves the file is still active.
- New v3 work belongs under `src/v3/**` and should follow the current v3 composables, config, API endpoint, PrimeVue, and Tailwind `tw-` patterns.
- New work must use [`src/v3/services/httpClient.js`](src/v3/services/httpClient.js) for HTTP and [`src/v3/composables/useAuth.js`](src/v3/composables/useAuth.js) for auth state.
- Do not import or extend the legacy user store ([`src/store/user.js`](src/store/user.js)) or the axios plugin ([`src/core/plugins/axios.ts`](src/core/plugins/axios.ts)); both remain only for legacy pages not yet migrated.
- Do not add `normalize*` helpers, alias maps, old/new field loops, or input-massaging utilities to hide inconsistent contracts.
- Use canonical backend/frontend values directly. If data arrives under an old name or old value, fix the source contract, migration, or boundary that emits it.
- Add compatibility only with explicit user approval and only for a bounded, documented migration window.
- Keep Vue Router paths relative to `import.meta.env.BASE_URL`; never add the external `/app` base to route definitions.
- Use literal English text as translation keys. Do not add dynamic dotted keys or Arabic mirror keys for already-localized API values.
