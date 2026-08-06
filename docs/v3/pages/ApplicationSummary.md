# ApplicationSummary Page

**Source:** `src/v3/pages/applications/ApplicationSummary.vue`  
**Purpose:** Universal v3 application review page for authenticated application flows.

---

## Overview

`ApplicationSummary.vue` renders the application review experience for multiple application types. It loads the application and configured payload through `useApplicationStore`, resolves the configured application type, renders the configured summary card layout, and owns the shared submit, recall, delete, and "Next" actions.

Confirmed from current code:
- The route can provide either `appId` or legacy `id`.
- Application metadata and payload are loaded with `store.loadApplication(appId, { withPayload: true })`.
- The application type is resolved with `resolveConfiguredApplicationType(application.flow, application.purpose)`.
- `application.purpose` is kept only as a legacy fallback.
- Summary cards are lazy-loaded from a local component registry.

---

## Key Dependencies

| Purpose | Source |
|---|---|
| Store | `src/v3/composables/application/useApplicationStore.js` |
| Layout config | `src/v3/config/application-config.js` |
| Loading state | `src/v3/composables/useLoading.js` |
| Notifications | `src/v3/composables/useNotification.js` |
| Error capture | `src/v3/composables/useErrorHandler.js` |
| Page heading | `src/v3/composables/layout/usePageHeading.js` |

---

## Runtime Flow

1. Read `appId` from route params.
2. Load the application with payload through the store.
3. Resolve application type from `flow`, with `purpose` as fallback.
4. Resolve the summary layout from `APPLICATION_CONFIG`.
5. Render each configured card from the component registry.
6. Show shared application actions based on application stage.
7. Clear all step errors on unmount.

---

## Dynamic Card Rendering

Cards are rendered from `summaryLayout` in `src/v3/config/application-config.js`.

Registered current card names include:
- `ApplicationInfoCard`
- `ApplicationFeesCard`
- `ActionsTrackingCard`
- `ApplicantProfileCard`
- `ApplicantPersonalPhotoCard`
- `FilesCard`
- `EventInfoCard`
- `SFTeamCard`
- `SFParticipantsCard`
- `SportSelectionCard`
- `PDLicenseInformationCard`
- `PDMembershipsCard`
- `PDWorkContractsCard`
- `DivingCenterProfileCard`
- `DivingCenterActivitiesCard`
- `DivingCenterInternationalMembershipsCard`
- `DivingCenterAdministratorsCard`
- `ActiveFilesCard`
- `VendorProfileCard`
- `VendorContactsCard`

If a configured component is missing from the registry, the page logs a warning and skips it.

---

## Validation Contract

Validation is card-driven:
- Cards call `store.setStepError(stepId, errors)` when a blocking step is incomplete.
- Cards call `store.deleteStepError(stepId)` when their step becomes valid.
- `ApplicationSummary.vue` uses `store.isApplicationValid` to decide whether the application can be submitted.
- The "Next" button uses `store.nextIncompleteStepId`.

Cards that need direct navigation register their own primary action:

```js
store.registerStepPrimaryAction(stepId, action);
```

When the "Next" button is clicked:
1. If a primary action is registered for the next incomplete step, it is executed.
2. Otherwise, the page scrolls to `[data-step-id="{stepId}"]`.

---

## Shared Actions

| Stage | Action | Store method | Result |
|---|---|---|---|
| `draft` | Delete | `store.deleteApplication(application.id)` | Navigate to `user-applications` |
| `draft`, `applicant_revision` | Next | Registered step action or scroll target | Continue completion flow |
| `draft`, `applicant_revision` | Submit or resubmit | `store.submitApplication(application.id)` | Navigate to `user-applications` |
| `review` | Recall | `store.recallApplication(application.id)` | Store handles recall |

The page does not render submit or recall actions outside `draft`, `applicant_revision`, and `review`. Delete is only rendered in `draft`.

---

## Error Handling

Confirmed behavior:
- `404` from load redirects to `error-404`.
- Other load errors are captured with context `ApplicationSummary.onMounted`.
- Submit, recall, and delete failures are captured and surfaced with notifications.

---

## Related Docs

- [Application Store](../composables/useApplicationStore.md)
- [Payload System](../reference/payload-system.md)
- [Vendor Registration](../../../../Docs/Vendor%20Registration/README.md)
- [Application Config](../../../src/v3/config/application-config.js)
- [Cards Style Guide](../style/cards.md)
