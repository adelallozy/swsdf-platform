# Professional Diver Memberships — Requirements & Guide

**Scope:** Professional Diver applications (New License / Renewal / Information Update)  
**Last Updated:** 2026-02-02  
**Primary UI:** `PDMembershipsCard.vue` + `AddMembership.vue`

---

## Overview

Professional Diver applicants must present at least one verified international membership before their application can advance. The `PDMembershipsCard` lives on the application summary and mirrors the SFParticipantsCard pattern: it reads everything from `useApplicationStore`, validates locally, exposes granular loading indicators, and routes editable users to the MasterForm-backed `AddMembership` page. Mutations and form submissions are handled through `usePDApplicationsApi`.

The card always advertises its empty state so read-only reviewers understand why no data exists (and the headline hides when the standalone empty-state panel appears to avoid duplicate titles). Editable users always see an **Add International Membership** action because memberships do not have a maximum cap.

---

## Business Requirements

1. **Minimum Memberships:** The application must have at least one `verified` membership before submission; the card enforces this via `MIN_MEMBERSHIPS = 1` and reports errors through the store (`setStepError`/`deleteStepError`).
2. **Edit Permissions:** Add, delete, and restore controls appear only when `store.canModifyApplication` (`canEdit`) is true.
3. **Empty-State Clarity:** When the app is read-only and membership list is empty, the card still renders a centered message (“No memberships registered”) while hiding its primary header, making it clear that no action is available.
4. **Add Action Always Available for Editors:** Unlike work contracts, there is no maximum limit, so the **Add International Membership** button is shown whenever `canEdit` is true (and hidden while the main payload is loading).
5. **Status Enforcement:** Each membership shows a status tag derived from `status`/`new_status` so reviewers understand whether a membership is verified, unverified, or canceled.
6. **API Consistency:** All mutations refresh the payload through `useApplicationStore.loadApplication(..., { withPayload: true, forceReload: true })` so deleted/restored/added memberships are immediately reflected.

---

## Functional Requirements

### FR-1: Display Memberships
- Render cards for every entry in `store.payload.pd_memberships.value` with organization, qualification level (`title`), membership number, optional diving type, and a link to the uploaded copy (opens in a new tab).
- Inline status tag shows severity and icon (`pi-clock`, `pi-check-circle`, `pi-times-circle`) based on the `displayStatus()` helper.

### FR-2: Add Membership Navigation
- The Add button is visible when `canEdit` is true and the main payload is not loading. It routes to `pd-membership-add` with `appId` and `locale`.
- The card registers this navigation as the primary action (`store.registerStepPrimaryAction('pd_memberships', navigateToAddMembership)`), ensuring the summary page “Next” button lands on the enrollment form.

### FR-3: Delete Confirmation
- Delete buttons appear only when `canShowRemove(membership)` returns true (`canEdit` and `new_status === 'verified'`).
- Clicking Delete triggers the PrimeVue `ConfirmDialog` group `memberships` before calling `handleDeleteMembership`.

### FR-4: Restore Capability
- Restore buttons appear when `canShowRestore` is true (`canEdit`, `new_status === 'canceled'`, and `status === 'verified'`).
- Restore also uses the same dialog pattern and keeps both delete/restore disabled unless the corresponding loading key is inactive.

### FR-5: Validation & Errors
- Verified membership count is evaluated (`memberships.filter(new_status === 'verified')`). If it falls below `MIN_MEMBERSHIPS`, the card displays an amber warning and reports errors via `store.setStepError('pd_memberships', errors)`; `store.deleteStepError('pd_memberships')` runs when the count returns to acceptable levels.
- The warning mirrors the translation `At least one international membership is required`.

### FR-6: Loading & Empty States
- `isLoadingKey('pd_memberships')` governs the spinner panel. While loading, the header and spinner show together.
- When there are zero memberships and the application is not editable, the card renders a text-only empty state (`No memberships registered`) plus a large icon, without repeating the main title.

---

## Data & Configuration

### Store Payload
```
store.payload.pd_memberships.value  // array of membership objects with id, status, new_status, title, membership_link, etc.
store.canModifyApplication.value    // edit toggle
store.application.value.id          // used for navigation and API payloads
```

### Validation & Loading Constants
- `MIN_MEMBERSHIPS = 1`
- Loading keys: `pd_memberships`, `pd_membership-deleting-{id}`, `pd_membership-restoring-{id}`
- `useLoading` ensures buttons show spinners when individual mutations run.

### Database Schema (Backend)
```sql
title varchar(240) NOT NULL,
diving_type varchar(240) DEFAULT NULL,
organization varchar(240) NOT NULL,
membership_number varchar(80) DEFAULT NULL,
membership_link varchar(250) DEFAULT NULL
```

### Status Logic
- `displayStatus(membership)` prioritizes `canceled` (danger), falls back to `unverified` (warn) or `verified` (success), and uses `new_status` only when necessary.
- Helper functions map statuses to CSS classes (`membershipStatusClass`) and icons (`membershipStatusIcon`).

### Translations
Basic keys required:
```
"International Memberships"
"At least one international membership is required"
"Diving Organization"
"Qualification Level"
"Membership Number"
"Diving Type"
"Membership Copy"
"Membership File"
"Open membership link"
"Verified"
"Unverified"
"Canceled"
"Add International Membership"
"Add Membership"
"Enter membership details to add to your professional diver application"
"Membership added successfully"
"Failed to add membership"
"Application cannot be modified"
"Failed to load application"
"Remove membership"
"Remove this membership?"
"Remove"
"Restore"
"Membership"
"No memberships registered"
```

### Environment Variables / Endpoints
- `VITE_PROFESSIONAL_DIVER_NEW_MEMBERSHIP` (POST, add membership)
- `VITE_PROFESSIONAL_DIVER_MEMBERSHIP_CANCEL` (POST, cancel membership via update ID)
- `VITE_PROFESSIONAL_DIVER_MEMBERSHIP_RESTORE` (POST, restore cancelled membership)

---

## Add Membership Form (MasterForm)

**Page:** `src/v3/pages/applications/professional-divers/AddMembership.vue`  
**Schema:** `src/v3/schema/applications/professionalDiverMembership.js` via `makePDMembershipSchema()`

| Field | Type | Required | Notes |
|------|------|----------|------|
| `organization` | select | ✅ | Options: PADI, SSI, NAUI, SDI/TDI, RAID, IANTD, SNSI |
| `diving_type` | select | ✅ | Recreational / Technical / Freediving |
| `title` | autocomplete | ✅ | 79 preloaded titles + custom English-only (`[A-Za-z\\s&\\-]+`) |
| `membership_number` | text | ✅ | Max 80 characters |
| `membership_copy` | file | ✅ | PNG/JPEG/PDF, ≤ 2MB |

- The schema uses Valibot to enforce lengths, English-only validation for `title`, and the 2MB file size limit.
- The form uses `MasterForm`, `useNotification`, and `useErrorHandler` for consistent UX and an on-mount guard to prevent edits when the application is not modifiable.
- Submission builds `FormData` (fields + file) before posting to `VITE_PROFESSIONAL_DIVER_NEW_MEMBERSHIP + applicationId`.
- On success, it shows a success toast, reloads the application payload, and redirects back to the summary.

---

## Route Configuration

- **Route name:** `pd-membership-add`
- **Path:** `:appId(\\d+)/professional-divers/add-membership`
- **Meta:** `requiresAuth: true`, `title: 'Add International Membership'`
- **Guard:** `AddMembership.vue` loads the application on mount and redirects to summary if `store.canModifyApplication` is false.

## API Integration

`usePDApplicationsApi.js` exposes the CRUD operations with granular loading keys and automatic reload:
```
addMembership(applicationId, formData)      // Loading key: pd_membership-adding
deleteMembership(updateId)                 // Loading key: pd_membership-deleting-{id}
restoreMembership(updateId)                // Loading key: pd_membership-restoring-{id}
```
- Each method calls `useApplicationStore.loadApplication(appId, { withPayload: true, forceReload: true })` after a successful mutation to refresh `store.payload.pd_memberships`.
- Errors propagate to `useErrorHandler.capture()` with context metadata (`updateId`, `applicationId`).

### API Payload Notes
- `addMembership` posts `membership_file` (mapped from `membership_copy` in the form schema).
- `deleteMembership` and `restoreMembership` use `apiPost` with `VITE_PROFESSIONAL_DIVER_MEMBERSHIP_CANCEL` and `VITE_PROFESSIONAL_DIVER_MEMBERSHIP_RESTORE`.
- `deleteMembership`/`restoreMembership` receive the **membership update ID** (`updateId`) from the payload, not the base membership ID.

---

## Status & Update Model (Backend Summary)

- The payload exposes both the current membership `status` and a proposed `new_status` from the updates table.
- **New membership:** created as `status = Unverified` with an update `new_status = Verified` (awaiting approval).
- **Cancel membership:**
  - If `status = Unverified`, the membership and update are deleted immediately.
  - If `status = Verified`, the update `new_status` flips to `Canceled`.
- **Restore membership:** update `new_status` flips back to `Verified`.
- The UI uses `new_status` + `status` to decide which actions and status tags to show.

## Summary Integration

- The card registers a primary action so the application summary “Next” button navigates to the add page: `store.registerStepPrimaryAction('pd_memberships', navigateToAddMembership)` (unregistered on unmount).
- It uses `ConfirmDialog` (group `memberships`) for destructive actions and hides the headline when the read-only empty state is visible to avoid duplicated titles.
- Validation `watch` hooks keep `setStepError`/`deleteStepError` in sync with the verified membership count, ensuring the summary navigation is gated correctly.

---

## Testing Checklist

### Form Tests
- [ ] All fields validate (lengths + required)
- [ ] File upload accepts PNG/JPEG/PDF and enforces 2MB limit
- [ ] Submit button is disabled when the form is invalid
- [ ] Loading indicator shows during submission
- [ ] Success toast appears and redirects after add
- [ ] Error messages show for API validation failures (422)
- [ ] RTL layout and mobile view render correctly

### Card Tests
- [ ] Component loads without JavaScript errors
- [ ] Verified membership count triggers the validation warning when below 1
- [ ] Delete button shows only for verified memberships while `canEdit` is true
- [ ] Restore button shows only for canceled-Versus-approved memberships
- [ ] Confirm dialog opens before delete/restore
- [ ] Loading keys (`pd_memberships`, `pd_membership-deleting`, `pd_membership-restoring`) display spinners where appropriate
- [ ] Add button is visible when `canEdit` true (even at 0 memberships) and hidden otherwise
- [ ] Empty state displays “No memberships registered” when read-only
- [ ] Status tags (Verified / Unverified / Canceled) render with the correct severity styling
- [ ] Store errors clear once the validated threshold is met
- [ ] Payload reloads after delete/restore/add operations

---

## Related Docs
- [PD Work Contracts requirements](./professional-diver-work-contracts.md)
