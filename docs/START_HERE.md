# SWSDF Platform Entry Point

Use this file as the first context document for every new refactoring task, issue fix, feature addition, or documentation update.

First read [swsdf-platform-work-context.md](./swsdf-platform-work-context.md) for the current deployment boundary, recent changes, known follow-up work, and resume prompt.

Active deferred feature registry:
[HR Leave Deferred Work](./hr-leave-deferred-work.md).

Active Vendor Registration context:
[root documentation index](../../Docs/Vendor%20Registration/README.md) and
[resume context](../../Docs/Vendor%20Registration/vendor-registration-resume-context.md).

Active account registration, account-type, email-verification, and application
eligibility context:
[root documentation index](../../Docs/Account%20Registration/README.md),
[requirements](../../Docs/Account%20Registration/account-registration-requirements.md),
and
[implementation plan](../../Docs/Account%20Registration/account-registration-implementation-plan.md).

## SWSDF Platform Boundary

This repository is the private platform split of the larger public website.

- Public website pages have been removed from this app. See [operations/public-page-removal-tracker.md](./operations/public-page-removal-tracker.md).
- The app is exposed externally under `/app/` through Vite's base URL and nginx. Router paths are relative to that base; do not define another `/app` route segment.
- Auth and payment compatibility redirects remain only where they are needed by the private app.
- When porting fixes from the original/public project, port the behavior intentionally. Do not copy removed public pages, routes, headers, footers, home sections, verification pages, or public-only API endpoints back into this project unless the task explicitly says to restore them.

## Source Of Truth Order

1. Current code in `src/`.
2. Architecture summary: [architecture/overview.md](./architecture/overview.md).
3. Feature requirement and spec documents in [v3/requirements](./v3/requirements) and [v3/specs](./v3/specs).
4. Operational notes and historical logs in [operations](./operations) and [v3/operations](./v3/operations).
5. Generated route inventory: [reference/website-pages.md](./reference/website-pages.md).

If documentation conflicts with current code, treat the code as the source of truth and update the documentation in the same task.

## Start Every Task With This Checklist

- Identify the task lane: refactor, bug fix, new feature, route/navigation change, form/schema change, API integration, translation, or docs-only update.
- Inspect the current implementation before changing anything.
- Inspect the matching requirement/spec document if one exists.
- If the task changes behavior, update or create both requirement and spec docs.
- If the task changes routes, regenerate [reference/website-pages.md](./reference/website-pages.md).
- If the task discovers a mismatch, record the correction in the relevant doc instead of creating a duplicate note.
- If the task ports a fix from the original project, compare the affected files against this app boundary before copying code.

## Task Lanes

### Resume Refactoring

Read in this order:

1. [architecture/overview.md](./architecture/overview.md)
2. [v3/guides/refactoring-guide.md](./v3/guides/refactoring-guide.md)
3. [operations/legacy-dependency-migration-progress.md](./operations/legacy-dependency-migration-progress.md)
4. [v3/operations/refactoring-backlog-website-components.md](./v3/operations/refactoring-backlog-website-components.md)
5. Any feature-specific requirement/spec pair.

Current refactoring direction:

- v3 code lives under `src/v3/`.
- Do not modify legacy components as part of a migration unless the task explicitly requires it.
- Keep legacy behavior available until the v3 replacement is wired, tested, and documented.
- Remove old components only after their routes/imports are no longer used.
- Do not add `normalize*` helpers or alias-mapping utilities to hide drifting contracts. Fix the contract at the real boundary and use canonical values directly.

### Fix An Issue Or Regression

Read in this order:

1. [operations/specs-issues.md](./operations/specs-issues.md)
2. [v3/reference/issues-and-fixes.md](./v3/reference/issues-and-fixes.md)
3. The relevant feature spec in [v3/specs](./v3/specs).
4. The current source files involved in the failure.

Document the outcome where it belongs:

- If the issue changes the expected behavior, update the spec.
- If it is a recurring implementation pitfall, update the guide or known issues document.
- If it is only a completed one-time task, keep it out of canonical docs unless it helps future work.

### Port A Fix From The Original Project

Use this lane when copying or adapting a fix from the original public website or another sibling project.

Read in this order:

1. [operations/public-page-removal-resume-context.md](./operations/public-page-removal-resume-context.md)
2. [operations/public-page-removal-tracker.md](./operations/public-page-removal-tracker.md)
3. [architecture/overview.md](./architecture/overview.md)
4. The relevant feature requirement/spec pair in [v3/requirements](./v3/requirements) and [v3/specs](./v3/specs)
5. Current source files in this app and the matching source files in the original project

Porting rules:

- Prefer a targeted diff over copying a whole file.
- Keep this app's route namespace, auth guards, layouts, and redirects.
- Do not reintroduce any route, component, env variable, or API export listed as removed in the public-page tracker.
- If the original fix touches a file deleted from this app, treat it as public-site-only until proven otherwise.
- If the fix touches a shared private workflow, adapt it to the current `src/v3` patterns instead of reviving legacy/public patterns.
- If the original uses Axios, Vuex, VeeValidate, Yup, Bootstrap JS, or legacy services, check [operations/legacy-dependency-migration-progress.md](./operations/legacy-dependency-migration-progress.md) before copying the pattern.
- If the original uses translations, keep the literal-English-key rule from [v3/guides/translation-guide.md](./v3/guides/translation-guide.md).

After porting, run the focused stale-public scan:

```bash
rg -n "['\"]/(about-us|contact-us|news|services|competitions|diving-sites)(['\"/?#]|$)|verify-license|verify-athlete|athletes/license-validation|professional-divers/license-validation|freediving-national-records|zawil-diving-permits" src .env .env.development
```

Any match must be either removed, intentionally private, or documented in the task notes. The current known intentional matches are private/platform competition-flow links documented in the public-page removal tracker.

### Add A Feature

Read in this order:

1. [architecture/overview.md](./architecture/overview.md)
2. [v3/guides/global-guide.md](./v3/guides/global-guide.md)
3. Existing requirement/spec docs for the closest feature.
4. Related implementation files under `src/v3/`.

Before coding, create or update:

- Requirement doc in `docs/v3/requirements/`.
- Technical spec in `docs/v3/specs/`.

Keep requirements focused on user-facing behavior and business rules. Keep specs focused on implementation details, files, endpoints, state, validation, and edge cases.

For Vendor Registration, the cross-project contract and resume state live under
`Docs/Vendor Registration/`. Keep the local requirement/spec files as pointers
and update the root documents rather than forking the contract.

For signup, email verification, account settings, account-sensitive routing, or
application eligibility, start with `Docs/Account Registration/`. Local
requirement/spec documents must describe platform implementation without
redefining canonical account values or domain eligibility.

### Work On API Integrations

Read in this order:

1. [v3/reference/http-client.md](./v3/reference/http-client.md)
2. [architecture/overview.md](./architecture/overview.md#http-client--error-semantics)
3. [v3/guides/global-guide.md](./v3/guides/global-guide.md#api-client-import-pattern)
4. [v3/config/apiEndpoints.js](../src/v3/config/apiEndpoints.js)

Current HTTP contract:

- Use only `src/v3/services/httpClient.js` helpers in new v3 code.
- Read normalized status from `error.status`, not Axios-style `error.response.status`.
- Every 401 is owned by centralized sign-out and protected-route navigation; local callers return silently.
- Use centralized endpoint constants and do not add component-specific Bearer headers.

### Work On Forms Or Schemas

Read in this order:

1. [v3/guides/masterform-guide.md](./v3/guides/masterform-guide.md)
2. [v3/guides/schema-building-guide.md](./v3/guides/schema-building-guide.md)
3. [v3/reference/forms-index.md](./v3/reference/forms-index.md)
4. Related schema/component files in `src/v3/schema/` and `src/v3/components/Forms/`.

Confirmed current code entry points:

- [MasterForm.vue](../src/v3/components/Forms/MasterForm.vue)
- [application-config.js](../src/v3/config/application-config.js)
- [apiEndpoints.js](../src/v3/config/apiEndpoints.js)

### Work On Application State Or Summary Pages

Read in this order:

1. [v3/state/application-store.md](./v3/state/application-store.md)
2. [v3/reference/payload-system.md](./v3/reference/payload-system.md)
3. [v3/pages/ApplicationSummary.md](./v3/pages/ApplicationSummary.md)
4. Related cards in [v3/components](./v3/components).

Confirmed current code entry point:

- [useApplicationStore.js](../src/v3/composables/application/useApplicationStore.js)

Current lifecycle contract:

- Applicant-editable stages are `draft` and `applicant_revision`.
- Applicant delete is only allowed in `draft`.
- Applicant recall is only allowed from `review`.
- Do not support old stage names through normalization helpers in v3. If old labels appear, fix the backend/migration/source data instead of accepting aliases in frontend code.
- Applicant-facing cards should display `status` labels, not `stage`.
- Duplicate/create conflicts should read the blocking app from `error.payload.application` or `error.payload.body.application`.
- Action timelines should use `action_key` and `created_at`.

For the applications list UI, also read:

1. [Applications Index UI Requirements](./v3/requirements/applications-index-ui.md)
2. [Applications Index UI Task List](./v3/operations/applications-index-ui-task-list.md)

### Work On Routing Or Navigation

Read in this order:

1. [architecture/overview.md](./architecture/overview.md)
2. [reference/website-pages.md](./reference/website-pages.md)
3. [v3/reference/website-pages-list.md](./v3/reference/website-pages-list.md)
4. [router/index.js](../src/router/index.js)

After route changes, run:

```bash
node scripts/generate-pages-inventory.js
```

### Work On Translations

Read in this order:

1. [v3/guides/translation-guide.md](./v3/guides/translation-guide.md)
2. [reference/translations-audit-guide.md](./reference/translations-audit-guide.md)

Project rule:

- English text stays in code.
- Arabic translations are added in the approved Arabic translation file.
- Do not add new English translation mirrors unless the current implementation already requires them.

## Documentation Update Rules

- Update existing docs before creating new docs.
- Do not duplicate the same explanation in multiple places.
- Requirement docs describe what the feature must do.
- Spec docs describe how the current implementation works or should be changed.
- Guides describe reusable project patterns.
- Operations docs track task-specific history or migration status.
- Reference docs are indexes, inventories, payload maps, or known issue logs.

When a code change affects documentation, update the docs in the same task.

## Useful Verification Commands

```bash
node scripts/generate-pages-inventory.js
npm run translations:audit -- --limit=50
npm run build
```

Use a Markdown relative-link check after moving or deleting docs. The repository does not currently expose a dedicated npm script for this check.

## New Task Prompt Template

Use this shape when resuming work:

```text
Task:
<short description>

Task lane:
<refactor | bug fix | feature | docs | routes | forms | state>

Known files:
<source files or docs already known>

Expected behavior:
<what should be true after the task>

Constraints:
- Current code is the source of truth.
- Update requirement/spec docs if behavior changes.
- Avoid unrelated rewrites.
```
