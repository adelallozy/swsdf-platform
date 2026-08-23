# Dive-Center Professional Diver Contract Cancellation Requirements

**Project:** SWSDF Platform v3  
**Domain:** Diving centers  
**Status:** Implemented  
**Last updated:** 2026-08-11  
**Source of truth:** shipped platform and API behavior

## Purpose

The platform must let an authorized diving-center account administrator apply to cancel one or more active professional-diver work contracts. Selecting a contract records a proposed cancellation; it must not change the active contract until the application is approved.

The canonical application identity is:

| Property | Canonical value |
| --- | --- |
| Application purpose (`applications.purpose`) | `Professional Divers Contracts Updates` |
| Application target | `Diving Centers` |
| Frontend application-config key | `Professional Divers Contracts Updates` |

## Scope

This application supports cancellation of existing contracts only.

- A diving center may select one or more eligible contracts in one application.
- A diving center may restore a selected contract before the application becomes non-editable.
- The application does not create professional-diver contracts.
- A selection is represented by a `professional_divers_contracts_updates` row whose requested status is `Inactive`.
- The active `professional_divers_contracts` row remains unchanged until approval.

## Actors and Authorization

| Actor | Responsibility |
| --- | --- |
| Diving-center account administrator | Initiates the application, selects contracts, restores selections, and submits or resubmits the application |
| Diving Operations Officer | Reviews the application and performs configured workflow actions |

The initiation action must be available only when the authenticated user is registered in `DiveCentersAccountAdmins` for the target center. Changes to an existing application must be allowed only when application update authorization succeeds.

## Functional Requirements

### DC-CC-001 — Initiation from the center profile

Each affiliated professional-diver row that exposes a contract ID must provide an **Apply to cancel contract** action.

When the user selects the action, the platform must:

1. send the center ID and selected contract ID to the initiation endpoint;
2. create a draft `Professional Divers Contracts Updates` application for the center;
3. create the first proposed `Inactive` contract update for the selected contract; and
4. navigate to the existing application-summary route for the returned application ID.

No dedicated creation page is required.

### DC-CC-002 — Initiation eligibility

The API must reject initiation unless all of the following are true:

- the target diving center exists;
- the authenticated user administers that center;
- the selected contract belongs to that center;
- the contract status is `Active` or `Approved`; and
- the contract is linked to a professional diver.

### DC-CC-003 — Duplicate blocking

Before creating the draft, the API must apply the shared blocking-application rule for the same user, target, and target ID. If a blocking application exists, the API must return HTTP `409` with the blocking application.

The platform must present the conflict as an existing application, then open its summary when an application ID is available. It must not create another application for the same blocked target.

### DC-CC-004 — Contract inventory

The application summary must load all contracts for the target center whose current status is `Active` or `Approved`.

Each contract must provide the data needed to identify and review it:

- contract ID;
- contract-copy link;
- start date;
- end date;
- current status;
- localized center name;
- localized diver name;
- diver rank;
- cancellation-update ID, when selected; and
- requested new status, when selected.

### DC-CC-005 — Selection and restoration

While the application is editable:

- **Cancel this contract** must create an application-scoped contract-update row with `status = Inactive`;
- selecting an already-selected contract must not create a duplicate update row;
- **Restore** must delete the selected contract-update row, thereby removing that contract from the proposed cancellation; and
- the application payload must be reloaded after either operation.

Restoring a selection must not modify the active contract.

### DC-CC-006 — Required selection

At least one contract must remain selected before the application can be submitted or resubmitted. The contract step must register **Select at least one contract to cancel** as a blocking step error when the application is editable and no selection exists.

### DC-CC-007 — Application workflow

The application must begin with:

- `status = Draft`;
- `stage = draft`;
- `assigned_to = Applicant`; and
- progress values `Professional Diver Work Contracts = Required` and `draft = In Progress`.

Submission and resubmission must use the shared application workflow. The configured review role is `Diving Operations Officer`. Return, rejection, recall, and action tracking must use the shared application behavior.

### DC-CC-008 — Approval

Approval must route `Diving Centers` applications whose purpose is `Professional Divers Contracts Updates` to the professional-diver contract-update approval handler rather than the diving-center profile and membership approval pipeline.

For every selected cancellation, approval must:

- confirm that the contract belongs to the application target center;
- require the contract to be linked to a professional diver;
- require the proposed update status to be `Inactive`;
- require an eligible current contract status;
- set the contract status to `Inactive`;
- set the contract termination time from the application approval time; and
- mark the update with the application approval time.

The selected updates must be applied transactionally. Center-originated cancellation approval must not assign or replace `professional_diver_id`.

### DC-CC-009 — Read-only summary

When the application is not editable, the summary must continue to display the contract selections and status badges, but it must not display cancellation or restore controls.

## Summary Presentation Requirements

The application summary order must be:

1. `ApplicationInfoCard`
2. `DivingCenterProfessionalDiverContractUpdateCard`
3. `ActionsTrackingCard`

The work-contract card must contain two groups:

1. **Contracts to cancel** — always expanded; contains contracts with an `update_id`, a **Restore** control while editable, and the amber **Cancellation will be completed after application approval** badge.
2. **Active contracts** — contains contracts without an `update_id`; initially shows one contract and provides **Show all (N)** and **Show less** controls when more contracts are available. Editable rows provide **Cancel this contract** and display the green **Active** badge.

Each contract heading and status badge must appear outside its white details card. The details card must use the established key/value grid and show available diver name, rank, center, contract dates, and contract-copy link.

If the center has no eligible contracts, the card must display **No active contracts found**.

## Error Handling Requirements

- HTTP `401` remains owned by the shared HTTP client's authentication handling.
- Initiation conflicts must use the shared existing-application conflict flow.
- Unexpected initiation failures must display **Failed to create contract cancellation application**.
- Add failures must display **Failed to add contract cancellation**.
- Restore failures must display **Failed to remove contract cancellation**.

## Translation Requirements

UI code must pass literal English text to `t()` or `$t()`. Arabic translations are maintained in `src/locales/ar.json`; generated dotted keys and dynamic translation-key composition are not permitted.

## Acceptance Criteria

- An authorized center administrator can initiate the application from a specific affiliated-diver contract.
- The created application uses target `Diving Centers` and purpose `Professional Divers Contracts Updates`.
- The first selected contract appears under **Contracts to cancel**.
- All other eligible center contracts appear under **Active contracts**.
- The user can add multiple contracts to the same editable application and restore any selection.
- An editable application with no selected contracts is blocked by the contract-step validation.
- A blocking application produces the existing-application experience instead of a duplicate draft.
- Contract records remain active before approval.
- Approval applies all selected cancellations transactionally without changing their professional-diver links.

## Related Documentation

- [Technical specification](../specs/dive-center-contract-cancellation.md)
- [Dive Center Applications Requirements](./dive-center-applications.md)
- [Professional Diver Work Contracts Requirements](./professional-diver-work-contracts.md)
- [Application Summary](../pages/ApplicationSummary.md)
- [Application Store](../state/application-store.md)
