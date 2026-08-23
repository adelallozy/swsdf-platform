# Dive-Center Professional Diver Contract Cancellation Spec

**Project:** SWSDF Platform v3  
**Domain:** Diving centers  
**Status:** Implemented  
**Last updated:** 2026-08-11  
**Requirement:** `../requirements/dive-center-contract-cancellation.md`

## Implementation Map

| Area | File |
| --- | --- |
| Center profile entry point | `src/v3/pages/app/dive-centers/DiveCenterProfile.vue` |
| Contract summary card | `src/v3/components/applications/cards/DivingCenterProfessionalDiverContractUpdateCard.vue` |
| Application configuration | `src/v3/config/application-config.js` |
| Endpoint constants | `src/v3/config/apiEndpoints.js` |
| Application payload state | `src/v3/composables/application/useApplicationStore.js` |
| Summary component registry | `src/v3/pages/applications/ApplicationSummary.vue` |

The canonical application-config key, display name, and backend purpose are `Professional Divers Contracts Updates`. The target is `Diving Centers`.

## Routes

The feature uses existing platform routes:

| Route | Purpose |
| --- | --- |
| `/app/:locale/dive-center/:id` | Displays affiliated professional divers and starts cancellation for a selected contract |
| `/app/:locale/applications/:appId/summary` | Displays and edits the cancellation application |

There is no feature-specific creation or edit page. After successful initiation, `DiveCenterProfile.vue` navigates by route name `app-summary` with `appId` and the active locale.

## Frontend API Endpoints

| Constant | Method | Relative endpoint |
| --- | --- | --- |
| `DIVING_CENTERS_APPS_PD_CONTRACTS_UPDATE` | `POST` | `diving-centers-applications/professional-divers-contracts-update/{centerId}/{contractId}` |
| `DIVING_CENTERS_APPS_ADD_CONTRACT_CANCELLATION` | `POST` | `diving-centers-applications/add-contract-cancellation/{appId}/{contractId}` |
| `DIVING_CENTERS_APPS_REMOVE_CONTRACT_CANCELLATION` | `POST` | `diving-centers-applications/remove-contract-cancellation/{updateId}` |

All calls use `apiPost` from `src/v3/services/httpClient.js`. The endpoints do not require a request body.

## Application Configuration

`application-config.js` defines:

```js
"Professional Divers Contracts Updates": {
  displayName: "Professional Divers Contracts Updates",
  payloadKeys: ["center_profile", "center_active_contracts", "actions"],
  requiredFiles: [],
  acceptedFiles: [],
  steps: [
    {
      id: "pd_contracts",
      label: "Professional Diver Work Contracts",
      type: "entity",
      blocking: true,
      component: "DivingCenterProfessionalDiverContractUpdateCard",
    },
  ],
  summaryLayout: [
    "ApplicationInfoCard",
    "DivingCenterProfessionalDiverContractUpdateCard",
    "ActionsTrackingCard",
  ],
}
```

`ApplicationSummary.vue` lazy-loads `DivingCenterProfessionalDiverContractUpdateCard` through its component registry.

## Payload Contract

The flow requests:

- `center_profile` — the target center profile used by the shared payload system;
- `center_active_contracts` — every currently eligible center contract, enriched with this application's pending cancellation; and
- `actions` — application action history.

`useApplicationStore.js` initializes `center_active_contracts` as `ref([])` and maps the backend key directly to that ref.

### `center_active_contracts` item

The following is an illustrative response shape; its values do not represent a project record:

```json
{
  "id": 184,
  "contract_copy_link": "/professional_divers_contracts/example.pdf",
  "start_date": "2026-01-01",
  "end_date": "2026-12-31",
  "status": "Approved",
  "center_name": "Example Diving Center",
  "diver_name": "Example Diver",
  "diver_rank": "Dive Master",
  "update_id": 73,
  "new_status": "Inactive"
}
```

`update_id` and `new_status` are `null` when the contract is not selected. Names are locale-aware API values. The card passes canonical English rank and status phrases to `t()` and renders names directly.

## Center Profile Entry Point

`DiveCenterProfile.vue` reads the contract identifier from each affiliated-diver row's `id`. It renders **Apply to cancel contract** only when that ID exists.

`cancelContract(diver)`:

1. resolves `contractId` from the row;
2. posts `{centerId}/{contractId}` to `DIVING_CENTERS_APPS_PD_CONTRACTS_UPDATE`;
3. routes to `app-summary` using `res.application.id`; and
4. delegates HTTP `409` to `openExistingApplicationFromConflict(err)`.

The profile action uses the `dive-center-profile-action` loading key. Unexpected errors are captured with context `DiveCenterProfile.cancelContract` and display **Failed to create contract cancellation application**.

## Contract Card Data Model

The component reads:

```js
store.payload.center_active_contracts.value
```

It derives:

- `selectedContracts`: rows with a truthy `update_id`;
- `activeContracts`: rows without an `update_id`;
- `visibleActiveContracts`: all active rows when expanded, otherwise the first row; and
- `canEdit`: `store.canModifyApplication.value`.

The editable state therefore follows the shared application policy for `draft` and `applicant_revision`; the component does not infer permissions from status labels.

## Component Behavior

### Contracts to cancel

The selected section is rendered when `selectedContracts` is non-empty and is not collapsible. Each row:

- displays the amber **Cancellation will be completed after application approval** badge when the current status is `Active` or `Approved` and `new_status` is `Inactive`;
- displays **Restore** only when `canEdit` is true; and
- calls the remove endpoint with `update_id`.

### Active contracts

The active section is rendered when `activeContracts` is non-empty. It initially displays one row (`COLLAPSED_COUNT = 1`). When more than one active row exists, the section displays a toggle:

- collapsed: **Show all (N)**;
- expanded: **Show less**.

Editable rows display **Cancel this contract** and call the add endpoint with the current application ID and contract ID. Eligible current contracts receive the green **Active** badge.

### Contract layout

Both groups use the same row structure:

1. a header outside the details card containing the contract sequence, status badge, and optional action;
2. a white, bordered, rounded details card; and
3. a responsive key/value grid with available diver name, rank, center, start date, end date, and contract-copy link.

Contract-copy links use `VITE_WEB_BASE_URL` plus `contract_copy_link` and open in a new tab.

When no rows are returned, the card displays **No active contracts found**.

## Validation

The step ID is `pd_contracts`. While the application is editable, zero selected contracts produces:

```js
store.setStepError("pd_contracts", [
  t("Select at least one contract to cancel"),
]);
```

When at least one contract is selected, or the application is read-only, the component calls:

```js
store.deleteStepError("pd_contracts");
```

The component also deletes its step error in `onBeforeUnmount` to avoid stale validation state.

## Mutation and Reload Flow

### Add selection

1. Use loading key `dc-contract-{contract.id}`.
2. `POST` `{appId}/{contract.id}` to the add endpoint.
3. Await `store.reloadApplicationPayload()`.
4. Recompute selected and active groups from the reloaded payload.

### Restore selection

1. Use loading key `dc-contract-{contract.id}`.
2. `POST` `{contract.update_id}` to the remove endpoint.
3. Await `store.reloadApplicationPayload()`.
4. Recompute selected and active groups from the reloaded payload.

The mutation responses are not used as the card's local source of truth. The shared reloaded payload is authoritative.

## Error Handling

- A mutation error with `status === 401` returns silently because centralized authentication handling owns the response.
- Add failures are captured with `DivingCenterContractUpdateCard.addCancellation` and display **Failed to add contract cancellation**.
- Remove failures are captured with `DivingCenterContractUpdateCard.removeCancellation` and display **Failed to remove contract cancellation**.
- Buttons are disabled while their per-contract loading key is active.

## Translation Contract

The component uses literal English keys, including:

- `Contracts to cancel`
- `Active contracts`
- `Cancel this contract`
- `Show all`
- `Show less`
- `Select at least one contract to cancel`
- `Failed to add contract cancellation`
- `Failed to remove contract cancellation`
- `No active contracts found`

Arabic values are defined in `src/locales/ar.json`. No dotted or generated translation keys are used by this feature.

## End-to-End Data Flow

```text
DiveCenterProfile affiliated-diver row
  -> POST initiation endpoint with centerId and contractId
  -> API creates draft application and first Inactive update
  -> app-summary loads configured payload keys
  -> center_active_contracts joins active contracts to this application's updates
  -> card partitions rows by update_id
  -> add/restore POST mutates update rows
  -> store.reloadApplicationPayload refreshes the inventory
  -> shared submit/resubmit workflow sends the application for review
  -> approval applies selected Inactive updates to contract rows
```

## Backend Reference

See `../../../../api/docs/diving_centers/contract-cancellation.md` for the controller, payload loader, action map, and approval contract.
