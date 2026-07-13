# Application Store Guide

`useApplicationStore.js` (`src/v3/composables/application/useApplicationStore.js`) centralizes application metadata, payload entities, and validation. Cards, forms, and pages consume it instead of using props or local API calls.

## 1. Core Concepts
- **Zero props**: cards read data via `const store = useApplicationStore();` and computed refs (`const event = computed(() => store.payload.event.value);`). See `EventInfoCard.vue`.
- **Unified loading (v2.5.0)**: `ApplicationSummary.vue` calls `store.loadApplication(appId, { withPayload: true })` to load both metadata and entities in a single API call. This is the recommended approach.
- **Legacy two-step loading**: `store.loadApplication(appId)` followed by `store.loadApplicationData()` is deprecated and kept only for existing code that has not been migrated yet.
- **Configured application type**: New work must resolve application type from `flow` first. Treat `application.purpose` as deprecated legacy metadata and use it only as a temporary compatibility fallback.
- **Payload refs**: `payload` is an object whose values are Vue refs (`payload.user_profile_picture`, `payload.sf_participants`, etc.). Always use `.value` to read/write.
- **Loading registry**: `useLoading()` exposes `isLoadingKey(key)` reflecting the keys the store passes to `withLoading`. Cards mirror those keys to show spinners (`isLoadingKey('sf_participants')`, `isLoadingKey('user_profile_picture')`, etc.).
- **"Next" navigation**: the summary page can guide users to the next incomplete step. Cards register a primary action per step ID (e.g., “Add Membership”, “Upload Files”), and the summary calls it.

## 2. API Surface
- **State**: `store.application`, `store.payload`, `store.stepsValidationErrors`, `store.stepPrimaryActions`, `store.stepPrimaryActionOrder`.
- **Actions**:
  - `loadApplication(appId, options)` - Load application with optional payload (unified loading)
  - `loadApplicationData(force?)` - Deprecated legacy two-step entity loading
  - `loadEntity(entityName, force?)` - Load single entity on-demand
  - `reloadApplicationPayload()` - Reload all payload after CRUD operations
  - `submitApplication`, `recallApplication`, `deleteApplication`
- **Validation helpers**: `setStepError(stepId, errors)`, `deleteStepError(stepId)`, `clearAllStepErrors()`. Used by cards like `SFParticipantsCard.vue` to report min/max violations.
- **Primary step actions**: `registerStepPrimaryAction(stepId, fn)`, `unregisterStepPrimaryAction(stepId)`, `getStepPrimaryAction(stepId)`, `clearAllStepPrimaryActions()`.
- **Computed permissions**: `store.canModifyApplication`, `store.canDeleteApplication`, `store.canRecallApplication`, `store.isApplicationValid`, `store.canSubmitApplication`, `store.nextIncompleteStepId`, `store.progressPercentage`, `store.incompleteBlockingSteps`.

## 3. Implementing a Card
1. Import the store and loading composable inside `<script setup>`.
2. Create computed refs for the needed payload data and permissions:
   ```js
   const store = useApplicationStore();
   const portrait = computed(() => store.payload.user_profile_picture.value);
   const canModify = computed(() => store.canModifyApplication.value);
   ```
3. Use the loader key from `application-config.js` with `isLoadingKey` to control spinners.
4. If the card enforces validation, watch its computed errors and call `setStepError` / `deleteStepError`.
5. Register a primary action for the step so the summary “Next” button can take users to the correct screen (and unregister on unmount).
6. Add `data-step-id="<stepId>"` to the card root as a scroll fallback if no primary action is registered.
7. After mutations, call `store.reloadApplicationPayload()` or `store.loadEntity('sf_participants', true)` to refresh data.
8. Clean up side effects on unmount (e.g., delete step errors and unregister the primary action).

## 4. Forms & Pages
- Before editing, call `await store.loadApplication(appId);` and respect `store.canModifyApplication.value` (see `UserProfileUpsert.vue`).
- Applicant edit stages are `draft` and `applicant_revision`; delete is only allowed in `draft`, and recall is only allowed in `Data Verification`.
- Forms that change data outside the summary should reload the relevant entity or entire payload before navigating back.
- Non-card screens (ApplicationFiles, TeamUpsert) still benefit from the store for gating and shared actions.

## 5. Loading & Error Patterns
- `withLoading(key, asyncFn)` inside the store ensures every API call registers a key. Components should never invent their own keys; reuse the ones declared in `application-config.js`.
- Loaders with `allowEmpty: true` set `null`/`[]` on 404 so cards can render empty states without extra guarding.
- When handling errors outside the store (e.g., delete participant), use `useErrorHandler().capture` and keep UI state consistent, then reload affected data.

## 6. Checklist
- [ ] Imported `useApplicationStore` and `useLoading`.
- [ ] Computed refs read from `store.payload.<entity>.value`.
- [ ] Loading key matches config.
- [ ] Validation errors pushed via `setStepError`.
- [ ] Edit controls gated by `store.canModifyApplication`.
- [ ] Data refreshed after mutations.

Following this guide keeps every card/page aligned with the shared summary lifecycle.

## See Also
- [useApplicationStore.md](../composables/useApplicationStore.md) - Complete API documentation
- [payload-system.md](../reference/payload-system.md) - Payload system overview
