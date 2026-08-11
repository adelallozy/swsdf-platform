# Refactoring Backlog: `src/website/` Component Migration

Last updated: 2026-05-13
Goal: Eliminate all imports from `src/website/` by creating v3 replacements, then delete the directory.
Refactoring guide: `../guides/refactoring-guide.md`

---

## Summary

- 13 components remain in `src/website/`
- 37 import references across 20 consumer files
- All consumers are in `src/platform/` or `src/v3/` (never the reverse)

---

## Backlog Items

### 1. Workspace Dashboard Page

| Field | Value |
|-------|-------|
| Source | `src/website/profile/index.vue` |
| Consumers | `src/router/index.js` (route `workspace-index`) |
| Suggested target | `src/v3/pages/workspace/WorkspaceIndex.vue` |
| Notes | Route entry point for `/app`. Create new v3 page, test, then update router import. |

---

### 2. BaseInput

| Field | Value |
|-------|-------|
| Source | `src/website/components/inputs/BaseInput.vue` |
| Consumers | `NewWorkLeave.vue`, `TeamForm.vue`, `JetskyForm.vue`, `FreeDivingForm.vue`, `UserProfileForm.vue` (5 files — MembershipForm.vue removed) |
| Suggested target | `src/v3/components/inputs/V3Input.vue` (or reuse PrimeVue `InputText`) |
| Notes | Used across competition and professional-diver forms. Low complexity. |

---

### 3. BaseSelect

| Field | Value |
|-------|-------|
| Source | `src/website/components/inputs/BaseSelect.vue` |
| Consumers | `NewWorkLeave.vue`, `NewFileStep.vue`, `TeamForm.vue`, `JetskyForm.vue`, `FreeDivingForm.vue`, `UserProfileForm.vue` (6 files — WorkContractForm.vue removed) |
| Suggested target | `src/v3/components/inputs/V3Select.vue` (or reuse PrimeVue `Select` / MasterForm select field) |
| Notes | Most widely imported website component. Consider MasterForm field integration. |

---

### 4. BaseDate

| Field | Value |
|-------|-------|
| Source | `src/website/components/inputs/BaseDate.vue` |
| Consumers | `NewFileStep.vue`, `FreeDivingForm.vue`, `UserProfileForm.vue` (3 files, 7 locations — WorkContractForm.vue removed) |
| Suggested target | `src/v3/components/inputs/V3Date.vue` (or MasterForm DatePicker field) |
| Notes | Date handling. Check MasterForm guide for DatePicker patterns. |

---

### 5. NoramlSelect

| Field | Value |
|-------|-------|
| Source | `src/website/components/inputs/NoramlSelect.vue` |
| Consumers | `NewWorkLeave.vue`, `JetskyForm.vue` (2 files) |
| Suggested target | Merge into `V3Select.vue` or replace with PrimeVue `Select` |
| Notes | Typo in original name ("Noraml"). Only 2 consumers. |

---

### 6. BaseFileWithCrop

| Field | Value |
|-------|-------|
| Source | `src/website/components/inputs/BaseFileWithCrop.vue` |
| Consumers | `NewFileStep.vue` (1 file — UserPicture.vue removed) |
| Suggested target | `src/v3/components/inputs/V3FileCrop.vue` or enhance `PhotoInput.vue` |
| Notes | Image upload with crop. Check if `v3/components/PhotoInput.vue` can replace. |

---

### 7. BaseFile

| Field | Value |
|-------|-------|
| Source | `src/website/components/inputs/BaseFile.vue` |
| Consumers | `NewFileStep.vue` (1 file) |
| Suggested target | `src/v3/components/inputs/V3File.vue` or `FileUploader.vue` |
| Notes | Single consumer. Low priority. |

---

### 8. UploadFile

| Field | Value |
|-------|-------|
| Source | `src/website/components/inputs/UploadFile.vue` |
| Consumers | _(all legacy consumers removed — WorkContractForm.vue, MembershipForm.vue deleted)_ |
| Suggested target | `src/v3/components/inputs/V3Upload.vue` or reuse `FileUploader.vue` |
| Notes | File upload for contracts/memberships. |

---

### 9. BaseModal

| Field | Value |
|-------|-------|
| Source | `src/website/components/base/BaseModal.vue` |
| Consumers | `Files.vue`, `UserProfileFiles.vue` (2 files — legacy consumers `WorkContract.vue`, `AddProfissionalQualification.vue`, `WorkContracts.vue`, `MembershipsReview.vue` removed) |
| Suggested target | `src/v3/components/V3Modal.vue` or PrimeVue `Dialog` |
| Notes | Widely used. If replacing with PrimeVue `Dialog`, update all 6 consumers at once. |

---

### 10. MainModal

| Field | Value |
|-------|-------|
| Source | `src/website/components/MainModal.vue` |
| Consumers | `WorkLeaveCard.vue`, `AthletesCard.vue` (2 files — ApplicationActionCard.vue removed) |
| Suggested target | `src/v3/components/V3Modal.vue` or PrimeVue `Dialog` |
| Notes | Different from BaseModal — check if both can be consolidated into one v3 modal. |

---

### 11. BaseCard

| Field | Value |
|-------|-------|
| Source | `src/website/components/cards/BaseCard.vue` |
| Consumers | `src/core/plugins/components.ts` (globally registered as `BaseCard`) |
| Suggested target | Replace global registration with v3 card component |
| Notes | Globally registered. Search entire codebase for `<BaseCard` usage before removing. |

---

### 12. BaseCard1

| Field | Value |
|-------|-------|
| Source | `src/website/components/cards/BaseCard1.vue` |
| Consumers | `src/core/plugins/components.ts` (globally registered as `BaseCard1`) |
| Suggested target | Replace global registration with v3 card component |
| Notes | Globally registered. Search entire codebase for `<BaseCard1` usage before removing. |

---

### 13. Loader

| Field | Value |
|-------|-------|
| Source | `src/website/components/Loader.vue` |
| Consumers | `src/core/plugins/components.ts` (globally registered), used in `ApplicationsIndex.vue` and `platform/views/Applications/index.vue` |
| Suggested target | Inline spinner (`<i class="pi pi-spinner tw-animate-spin">`) or `src/v3/components/V3Loader.vue` |
| Notes | Globally registered. Simple loading spinner. Easy to replace inline. |

---

## Suggested Refactoring Order

Group by dependency chain — refactor leaf components first, then forms, then pages.

### Phase A: Shared Primitives (no cross-dependencies)
1. **BaseCard / BaseCard1** — globally registered, replace and search all templates
2. **Loader** — globally registered, simple spinner
3. **BaseModal + MainModal** — consolidate into one v3 modal (PrimeVue `Dialog`?)
4. **BaseInput** — replace with PrimeVue `InputText` or v3 wrapper

### Phase B: Input Components
5. **BaseSelect + NoramlSelect** — consolidate into one v3 select
6. **BaseDate** — integrate with MasterForm DatePicker pattern
7. **BaseFile + BaseFileWithCrop + UploadFile** — consolidate file uploads

### Phase C: Page Migration
8. **Workspace Dashboard** (`profile/index.vue`) — create `v3/pages/workspace/WorkspaceIndex.vue`

### Phase D: Cleanup
- Update `src/core/plugins/components.ts` to remove global registrations
- Update all 37 imports across 20 consumer files
- Delete `src/website/` directory
- Update this backlog as complete

---

## Completion Criteria

- [ ] Zero imports from `@/website/` in `src/`
- [ ] `src/website/` directory deleted
- [ ] `src/core/plugins/components.ts` updated
- [ ] `src/router/index.js` updated (workspace-index route)
- [ ] `npm run build` passes
- [ ] All refactored components tested per refactoring guide
