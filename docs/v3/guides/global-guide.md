# Global Development Guide

## Language and Syntax
- Use **JavaScript only** (no TypeScript). All new files must have a `.js` extension.
- **Always end statements with a semicolon** (`;`).
- Follow standard JavaScript conventions (e.g., camelCase for variables, PascalCase for classes).
- **Vue Components:** All new Vue components must use `<script setup>` syntax (Composition API) with `defineProps` and `defineEmits`.

## Translations
- Use `$t('Literal English sentence')` for user-facing text that must render in Arabic.
- Add Arabic translations to `src/locales/ar.json` (or feature-specific Arabic bundles) using the same literal English sentence as the key.
- Do **NOT** add or maintain `src/locales/en.json`; English remains literal in code.
- Use flat literal keys only; do not use nested keys like `userProfile.title`.

## Documentation Requirements
- Every page or page-level feature must have a requirements document under `docs/v3/requirements/` and a specs document under `docs/v3/specs/`.
- Requirements documents define user goals, functional requirements, non-functional requirements, acceptance criteria, and business rules.
- Specs documents define implementation details: routes, components, API endpoints, displayed data, response shape, state behavior, and QA notes.
- Index or guide documents should link to the requirements/specs files instead of repeating their full content.
- When a page changes behavior, update both the requirements and specs files in the same change.

## Formatting Standards
- **Numerals**: Keep **numbers in English** across the application, including Arabic UI.
- **Timezone**: All times should be displayed in **Asia/Riyadh**.
- **Date Parsing**: Parsing order for timestamps must accept:
    1.  `created` (ISO with offset)
    2.  `created_at` (`YYYY-MM-DD HH:mm`), treated as `+03:00` (Riyadh).

## UI/UX Patterns
- **Card Headings**: Place the section header **outside the card**, left-aligned, bold label line above the white card (following the Participants card pattern).
- **Repeated Review Cards**: For repeated review records (for example contracts, administrators, memberships, and current files), use full-width card surfaces by default. Put the record title/status row outside the white card when it identifies the record, then render the record fields inside a `card-surface` with `kv-grid`. Avoid nested headers inside the card body.
- **Layout-owned Breadcrumbs and Page Headings**: Pages rendered under `src/v3/layouts/MainLayout.vue` must **not** import or render `Breadcrumb` or `PageHeading`. `MainLayout.vue` already renders them once around `router-view`. Child pages may call `usePageHeading().setHeading(...)` to set the displayed title, but must not duplicate the components in their templates.
- **Mobile Tuning**: Reduce gutters and connector spacing; ensure stacked layout without overlapping markers.
- **RTL Support**: Align timeline to **right in LTR** and **left in RTL** so the vertical line sits near the reading edge.

## Form Submission Guard
- **Prevent double submits**: Always lock submission with `useLoading` and guard in `onSubmit` using `isLoadingKey` (or a computed `saving` flag).
- **Wrap the full submit**: Call `withLoading` around the entire submit flow so the loading lock is set before any async work starts.
- **Disable submit UI**: Bind `:disabled` (or `:loading`) to the same loading key used in the guard.

## Forbidden Dependencies
The following libraries **must not be used** in new implementations:
- WOW.js
- Pinia
- Vuex
- Axios
- VeeValidate
- Yub
- Bootstrap
- SweetAlert
- Vue3-Toastify

**Note:** Previous builds shipped with some of these dependencies (e.g., WOW.js). They have now been removed from the app, so do not reintroduce them. If you discover lingering imports, delete them as part of your change.

## Allowed Alternatives
- **PrimeVue** is the recommended UI component library. Use its components instead of Bootstrap or other UI libraries.
  - Example: Replace Bootstrap buttons with PrimeVue's `Button` component.

## Deprecated PrimeVue Components
The following PrimeVue components are **deprecated** and should **NOT** be used in new implementations:
- **Dropdown** - Use `Select` component instead
  - Import: `import Select from 'primevue/select'`
  - Usage: `<Select v-model="value" :options="options" optionLabel="label" />`
  - Migration: Replace `Dropdown` with `Select` - the API is nearly identical
  - Reference: https://primevue.org/select

**Migration Guide:**
```javascript
// ❌ DEPRECATED - Do not use
import Dropdown from 'primevue/dropdown'
<Dropdown v-model="value" :options="options" optionLabel="label" />

// ✅ CORRECT - Use Select instead
import Select from 'primevue/select'
<Select v-model="value" :options="options" optionLabel="label" />
```

**Note:** If you find existing code using deprecated components, update them to use the modern alternatives during your work.

## API Client Import Pattern
- **Always import from `@/v3/services/httpClient.js`** for API calls
- **NEVER import from `@/v3/composables/apiClient.js`** - this file is deprecated and should not be used
- Use named exports: `apiGet`, `apiPost`, `apiPatch`, `apiPut`, `apiDelete`
- Example:
  ```javascript
  // ✅ CORRECT
  import { apiGet, apiPost } from '@/v3/services/httpClient.js';
  
  // ❌ WRONG - deprecated
  import apiClient from '@/v3/composables/apiClient.js';
  const { apiGet, apiPost } = apiClient();
  ```

### API Error Handling
The `httpClient.js` service throws standard JavaScript `Error` objects, **not** Axios error objects.  
If you need to check the status code (e.g., for 404 handling), access the `status` property directly on the error object.

- **Status Code**: `error.status` (Number)
- **Error Payload**: `error.payload` (Object) - contains full response details

```javascript
try {
  await apiGet('/some/endpoint');
} catch (error) {
  // ✅ CORRECT: Check status directly on the error object
  if (error.status === 404) {
    // Handle specific status
  }
  
  // ❌ WRONG: Do not look for response.status (Axios style)
  if (error.response?.status === 404) { ... }
}
```

## API Endpoints Configuration
- **Use centralized API endpoints from `@/v3/config/apiEndpoints.js`** - This is the single source of truth for all API endpoints
- **Import endpoint constants** instead of hardcoding API paths in components
- Example:
  ```javascript
  // ✅ CORRECT - using centralized configuration
  import { AUTH_SIGN_IN, APPLICATIONS_GET_BY_ID } from '@/v3/config/apiEndpoints.js';
  
  // ❌ WRONG - hardcoding API paths
  await apiGet('users/login');
  await apiGet('applications/by-id/' + appId);
  ```
- **All endpoint paths are defined in `.env` file** and imported through the centralized configuration
- **Benefits**:
  - Single source of truth for all API endpoints
  - Easy to update endpoints without hunting through code
  - Consistent naming convention across the project
  - Type-safe endpoint references
  - Environment-specific configuration support

## Deprecated Application APIs
- **Do not use `store.loadApplicationData()` in new v3 work.**
  - This is a deprecated legacy compatibility path from the old two-step loading model.
  - Use `store.loadApplication(appId, { withPayload: true })` and consume `store.payload.*` instead.
- **Do not build new features directly on `application.purpose`.**
  - Treat `application.purpose` as deprecated legacy metadata.
  - Resolve the configured application type from `flow` first by using `resolveConfiguredApplicationType(flow, purpose)`.
  - `purpose` may remain as a temporary fallback only while older routes and configs are still being migrated.

## Project Structure
```
src/
├── v3/
│   ├── components/
│   │   ├── applications/
│   │   │   ├── Files.vue
│   │   │   ├── UploadedFileCard.vue
│   │   │   ├── MissingRequiredFileCard.vue
│   │   │   └── ParticipantsCard.vue
│   │   ├── Forms/
│   │   │   ├── MasterForm.vue
│   │   │   ├── FileUploader.vue
│   │   │   └── DatePicker.vue
│   │   └── shared/
│   │       └── ConfirmDialog.vue
│   ├── composables/
│   │   ├── useApplicationStore.js
│   │   ├── application/
│   │   │   └── useApplicationFiles.js
│   │   ├── useErrorHandler.js
│   │   ├── useLoading.js
│   │   └── layout/
│   │       └── usePageHeading.js
│   ├── pages/
│   │   └── applications/
│   │       ├── ApplicationFileUpload.vue
│   │       └── ApplicationSummary.vue
│   ├── config/
│   │   └── application-config.js
│   └── services/
│       └── httpClient.js

## Tailwind Prefix
- All Tailwind classes must use the `tw-` prefix (e.g., `tw-bg-primary-500`).

## Navigation & Routing
- **Routes vs Buttons**: Any new route should be a route, not a button. Use `router-link` or programmatic navigation for page transitions.
- **Public Website Locale Scope**: Public website routes must be under `:locale(ar|en)` (e.g., `/:locale(ar|en)/professional-divers/license-validation`).
- **Legacy URL Compatibility**: If a legacy non-localized path must stay available, add a redirect to the localized route. Use `ar` as fallback locale when none is provided.
- **Use router-link for Navigation**: Always use `router-link` styled as button for page navigation. Never use programmatic navigation (`router.push()`) for user-facing navigation buttons.
  - **Locale param**: For locale-scoped named routes, always pass `params: { locale: locale.value }` in links/navigation objects.
  - **Why**: `router-link` provides better accessibility, SEO, and user experience (right-click, open in new tab, etc.)
  - **Example**:
    ```vue
    <!-- ✅ CORRECT - Use router-link styled as button -->
    <router-link
      :to="{ name: 'target-route', params: { locale: locale } }"
      class="tw-btn tw-btn-primary"
    >
      {{ $t('Navigate to page') }}
    </router-link>
    
    <!-- ❌ WRONG - Don't use programmatic navigation for buttons -->
    <Button @click="router.push({ name: 'target-route' })">
      {{ $t('Navigate to page') }}
    </Button>
    ```
  - **Exception**: Use programmatic navigation only for:
    - Redirects after form submission
    - Authentication redirects
    - Error page redirects
    - Conditional navigation based on business logic
