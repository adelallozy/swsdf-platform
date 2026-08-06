# Legacy Dependency Migration Progress

Last checked: 2026-05-19

## Purpose

The refactoring goal is to stop using Axios and legacy UI/form/state plugins in new v3 work, then remove them from the project when no source files depend on them.

This audit is based on the current codebase and `package.json`. Current code remains the source of truth.

## Summary

The migration is partially complete.

- v3 feature code mostly uses the fetch-based `src/v3/services/httpClient.js`.
- Legacy/platform code still uses Axios, Vue3-Toastify, VeeValidate, Yup, Pinia, Vuex, and Bootstrap.
- The old dependencies are still installed in `package.json`, so package removal is not safe yet.
- SweetAlert and WOW.js were not found in `src` or `package.json` during this audit.

## Confirmed Counts

| Item | Current status |
| --- | --- |
| Files importing Axios in `src` | 48 |
| Files importing Axios in `src/v3` | 2 |
| Files using `src/v3/services/httpClient.js` in `src/v3` | 42 |
| Files referencing `vue3-toastify` in `src` | 20 |
| Files referencing `vue3-toastify` in `src/v3` | 0 |
| Files referencing VeeValidate in `src` | 15 |
| Files referencing Yup in `src` | 15 |
| Files referencing Pinia in `src` | 10 |
| Files referencing Vuex in `src` | 13 |
| Files importing Bootstrap JavaScript in `src` | 5 |
| SweetAlert references in `src` / `package.json` | 0 |
| WOW.js references in `src` / `package.json` | 0 |

## Axios Status

Confirmed active legacy Axios integration:

- `src/main.js` imports Axios, provides it globally, and calls `registerAxios(app)`.
- `src/core/plugins/axios.ts` installs `vue-axios` and sets global Axios defaults/interceptors.
- `src/core/services/ApiService.ts` wraps Axios and is still imported by legacy services/stores/components.
- Many `src/platform/**` application pages still import Axios directly.

Confirmed v3 exceptions:

- `src/v3/composables/useAuth.js` imports Axios only to keep the legacy Axios auth header synchronized while legacy code remains.
- `src/v3/composables/apiClient.js` imports Axios, but no current imports of this file were found during this audit. It appears unused from static search, but remove it only after verifying there are no dynamic references.

Confirmed v3 target:

- `src/v3/services/httpClient.js` is the canonical v3 HTTP client.
- New or refactored v3 code should use `apiGet`, `apiPost`, `apiPut`, `apiPatch`, and `apiDelete` from `src/v3/services/httpClient.js`.
- Do not reproduce Axios response shapes or create feature-local fetch wrappers. Read status from `error.status`; every 401 is owned by the client's centralized `signOut('unauthorized')` lifecycle.
- Canonical behavior and migration examples are documented in [HTTP Client Reference](../v3/reference/http-client.md).

## Other Legacy Dependencies

### Vue3-Toastify

Still installed and still used in legacy/platform files. No `src/v3` usage was found.

Current global integration:

- `src/main.js` imports `vue3-toastify/dist/index.css`.

Migration target:

- Use `src/v3/composables/useNotification.js` in v3 code.

### VeeValidate And Yup

Still installed and still used by legacy/platform forms and remaining `src/website/components/inputs/*` components.

Migration target:

- Use `src/v3/components/Forms/MasterForm.vue`.
- Use Valibot schemas under `src/v3/schema/`.

### Pinia And Vuex

Both are still installed and used.

Confirmed current usage:

- `src/main.js` installs both Pinia and Vuex.
- Pinia stores remain in `src/store/` and `src/platform/store/`.
- Vuex remains in `src/store/index.ts`, store modules, and legacy components.

Migration target:

- New v3 application workflow state should use project composables such as `src/v3/composables/application/useApplicationStore.js`, not new Pinia or Vuex stores.

### Bootstrap

Bootstrap is still installed and used by the legacy theme/helpers.

Confirmed current usage:

- Bootstrap JavaScript is imported in legacy helper/component files.
- Bootstrap SCSS is imported by the legacy Sass theme.

Migration target:

- New v3 UI should use PrimeVue and Tailwind utilities with the `tw-` prefix.

## Recommended Next Steps

1. Finish the `src/website/` component migration tracked in [../v3/operations/refactoring-backlog-website-components.md](../v3/operations/refactoring-backlog-website-components.md). This will remove several VeeValidate-based input components.
2. Replace direct Axios and Vue3-Toastify usage in active legacy/platform flows when each flow is refactored to v3.
3. Remove or replace `src/core/services/ApiService.ts` only after all imports of `ApiService` are gone.
4. Remove `registerAxios(app)`, global Axios provide, and `vue-axios` only after no direct Axios or `ApiService` consumers remain.
5. Remove package dependencies only after source search and build both confirm no remaining usage.

## Verification Commands Used

```bash
rg -l "from ['\"]axios['\"]|import axios|require\\(['\"]axios['\"]\\)" src -S --glob '!assets/**'
rg -l "vue3-toastify" src -S --glob '!assets/**'
rg -l "vee-validate" src -S --glob '!assets/**'
rg -l "from ['\"]yup['\"]|import \\* as yup|\\byup\\." src -S --glob '!assets/**'
rg -l "from ['\"]pinia['\"]|defineStore|createPinia" src -S --glob '!assets/**'
rg -l "from ['\"]vuex['\"]|vuex-module-decorators|createStore|useStore" src -S --glob '!assets/**'
rg -l "from ['\"]bootstrap['\"]|import .*bootstrap" src -S --glob '!assets/**'
```
