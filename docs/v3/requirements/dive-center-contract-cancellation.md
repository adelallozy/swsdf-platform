# Dive Center Contract Cancellation — Requirements (Incomplete Plan)

**Status:** Partially Implemented — Application flow and UI still pending
**Scope:** Dive-center application type for cancelling professional diver work contracts
**Last Updated:** 2026-08-09

---

## Problem

Currently, only professional divers can add or remove work contracts from
their own license application. Dive centers cannot initiate contract
cancellation. When a dive center needs to end a contract with a professional
diver (e.g., employment termination, contract expiry, diver left the center),
the diver must cooperate by submitting a cancellation from their side, or the
federation must intervene manually.

This document plans a new dive-center application type that lets a dive
center apply to cancel one or more professional diver contracts. The
federation reviews and approves the cancellation.

---

## Scope (Narrowed)

This plan covers **contract cancellation only**.

- Dive centers can **cancel** (remove) existing professional diver contracts.
- Dive centers **cannot** add contracts. Adding remains diver-only (file-upload
  model) until the digital contract feature is implemented.
- Digital contracts are out of scope for this plan. See
  [Digital Work Contracts](./digital-work-contracts.md) for that roadmap.

---

## Actors

| Actor | Role |
|---|---|
| Dive Center | Initiates a contract-cancellation application; selects which contracts to cancel |
| Federation (Admin) | Reviews the cancellation application; approves or rejects |

The professional diver is **notified** of the cancellation but is not an
approver. The diver can see the pending cancellation on their license
application summary if one is open.

---

## Application Type

| Property | Value |
|---|---|
| Application type key | `Diving Center Contract Cancellation` |
| Target entity | `Diving Centers` |
| Flow | `diving-center-contract-cancellation` |
| Purpose (legacy alias) | `Diving Center Contract Cancellation` |

This is a **new** application type. It does not clone the existing
dive-center membership/renewal/update config because it has different steps,
payload keys, and summary cards.

---

## Data Source

The dive center's affiliated professional divers are loaded from the existing
backend endpoint:

```
GET /diving-centers/{centerId}
```

Response key: `affiliatedProDivers` — already returned by
`DivingCentersController::view()` via the `ProfessionalDiversActiveContracts`
view, filtering by `dive_center_id = centerId` and
`status IN ('Approved', 'Active')`.

Each affiliated diver includes:
- `professional_diver_id`
- `diver_name` (localized name)
- `diver_rank`
- `contract_status`
- `contract_start_date`
- `contract_end_date`
- `contract_id` (or `id` — the active contract row id)

**Open question:** Does the backend `affiliatedProDivers` response include
the contract row ID needed for cancellation, or does it need to be added?
Needs backend inspection.

---

## Payload Keys

```js
payloadKeys: [
  "center_profile",
  "active_diver_contracts",   // NEW — the contracts eligible for cancellation
  "actions",
]
```

`active_diver_contracts` is a new payload key. The backend loads the dive
center's affiliated divers with their active contracts. The frontend card
renders this list and lets the center select contracts to cancel.

**Open question:** Does the backend `ApplicationPayloadComponent` need
modification to support this key, or can the existing `affiliatedProDivers`
data be reused? Needs backend inspection.

---

## Summary Layout

```js
summaryLayout: [
  "ApplicationInfoCard",
  "DivingCenterProfileCard",
  "DiveCenterDiverContractsCard",   // NEW — lists affiliated divers, select contracts to cancel
  "ActionsTrackingCard",
]
```

The card `DiveCenterDiverContractsCard` is the primary step. It lists
affiliated divers with active contracts and provides a cancel action for each.

---

## Steps

```js
steps: [
  {
    id: "diver_contracts",
    label: "Diver Contracts",
    type: "entity",
    blocking: true,
    component: "DiveCenterDiverContractsCard",
  },
]
```

Only one blocking step. The application is submittable when the center has
selected at least one contract to cancel. No file upload is required.

---

## Card Behavior (DiveCenterDiverContractsCard)

### Data Source
- `store.payload.active_diver_contracts.value` — array of affiliated divers
  with active contracts.

### Display
Each contract row shows:
- Diver name
- Diver rank
- Contract start date
- Contract end date (if set)
- Contract status badge (Active)
- A **Cancel Contract** button (when `canEdit` is true)

### Validation
- At least one contract must be selected for cancellation before submission.
- `store.setStepError('diver_contracts', errors)` /
  `store.deleteStepError('diver_contracts')`.

### Cancel Action
- Shows a confirmation dialog.
- On confirm, creates a `professional_divers_contracts_updates` row with
  `status = 'Inactive'` for the selected contract, linked to this
  application. This is a **proposed** cancellation.
- The contract row in `professional_divers_contracts` is **not** changed
  immediately. The cancellation is applied when the federation approves the
  application (see [Approval Flow](#approval-flow) below).
- This mirrors the diver-side `cancel()` behavior for already-approved
  contracts.

---

## Initiation Flow

1. Dive center opens its profile page (`DiveCenterProfile.vue`).
2. The **Affiliated Professional Divers** section shows the list of divers.
3. A new **Cancel Contracts** button is added to this section.
4. The dive center clicks **Cancel Contracts**.
5. The frontend calls a new backend endpoint to create a
   `Diving Center Contract Cancellation` application for this center.
6. On success, the frontend navigates to `app-summary` with the new
   application ID.
7. The summary page renders `DiveCenterDiverContractsCard`.
8. The center selects contracts to cancel and submits the application.
9. The federation reviews and approves/rejects.
10. On approval, the backend applies the cancellations.

---

## Routes (Planned)

| Route name | Path | Purpose |
|---|---|---|
| `diving-centers-cancel-contracts` | `diving-centers-cancel-contracts` | Create a contract-cancellation application (POST endpoint, no page) |

The cancellation application is created via a POST to a new backend endpoint,
then the frontend navigates to the existing `app-summary` route. No separate
creation page is needed — the creation is a single API call triggered from
the dive-center profile page, matching the pattern of
`renewMembership()` and `updateInformation()` in `DiveCenterProfile.vue`.

---

## Backend Endpoints (Planned — Not Implemented — Requires Per-Change Approval)

| Method | Endpoint (draft) | Purpose |
|---|---|---|
| POST | `diving-centers-applications/cancel-contracts/{centerId}` | Create a contract-cancellation application for the center |
| POST | `diving-centers-applications/cancel-contract/{appId}` | Create a `professional_divers_contracts_updates` row (proposed `Inactive`) for one contract |
| POST | `diving-centers-applications/restore-contract/{updateId}` | Restore a proposed-cancellation update row back to `Approved` (undo before submission) |

The cancellation is applied on admin approval via the existing
`ProfessionalDiversContractsUpdatesTable::approve()` (see
[Approval Flow](#approval-flow) below).

All backend changes require explicit per-change user approval per `AGENTS.md`.

---

## Approval Flow (How Data Changes on Federation Approval)

### Current Implementation Checkpoint

The shared approval hook is now prepared for the cancellation flow:

- `api/src/Model/Table/ProfessionalDiversContractsUpdatesTable.php`
  accepts the dive-center cancellation purpose, validates the target center
  and contract ownership, applies `Inactive` updates transactionally, and
  preserves the new-diver linking behavior for professional-diver
  applications.
- `api/src/Command/SaveApplicationCommand.php` routes dive-center contract
  cancellation applications directly to the contract-update approval handler,
  bypassing the normal dive-center profile/membership approval pipeline, and
  fails when contract approval fails.

The application creation endpoint, update-row creation, payload, frontend
card, admin review section, and automated tests are still not implemented.

### Current Architecture (Two Tables)

**`professional_divers_contracts`** — the actual contract record:

| Field | Description |
|---|---|
| `id` | Primary key |
| `professional_diver_id` | Linked diver (empty for new-diver contracts until license issuance) |
| `dive_center_id` | The dive center |
| `application_id` | The application that created this contract |
| `status` | `Unverified` → `Approved` → `Inactive` |
| `start_date` / `end_date` | Contract period |
| `contract_copy_link` | Uploaded file path |
| `approved_at` | When the contract became `Approved` |
| `terminated_at` | When the contract became `Inactive` |

**`professional_divers_contracts_updates`** — proposed changes (one row per
proposed action):

| Field | Description |
|---|---|
| `uid` | Primary key (this is what the frontend calls `id`) |
| `contract_id` | Links to `professional_divers_contracts.id` |
| `application_id` | Which application proposed this change |
| `status` | `Approved` (propose to activate) or `Inactive` (propose to cancel) |
| `approved_at` | Set when the application is approved (change applied) |

### How `approve()` Works Today

**File:** `api/src/Model/Table/ProfessionalDiversContractsUpdatesTable.php:105`

Called by `SaveApplicationCommand.php:110` when the federation approves an
application:

```php
public function approve($application)
{
    // GATE: only runs for Professional Divers applications
    if (!in_array($application->target, ['Professional Divers', 'Professional Divers Licenses'])) {
        return false;
    }
    // Skip if work contracts already completed/rejected
    ...

    foreach ($diverContractsUpdates as $diverContractUpdate) {
        $diverContract = contractsTable->find()->where(['id' => $diverContractUpdate->contract_id])->first();

        // Skip stale or already-inactive contracts
        if ($diverContract->status == 'Inactive') { continue; }
        if ('Approved' == $diverContractUpdate->status
            && $diverContract->application_id != $diverContractUpdate->application_id) {
            $this->delete($diverContractUpdate);  // stale update
            continue;
        }

        // Proposed cancellation → apply it
        if ('Inactive' == $diverContractUpdate->status) {
            $diverContract->status = 'Inactive';
            $diverContract->terminated_at = $application->approved_at;
        }

        // Proposed activation (new contract for new diver) → apply it
        if ('Unverified' == $diverContract->status
            && $diverContractUpdate->status == 'Approved') {
            $diverContract->status = 'Approved';
            $diverContract->approved_at = $application->approved_at;
        }

        // Link contract to the diver (for new-diver first license)
        if (empty($diverContract->professional_diver_id) && !empty($application->target_id)) {
            $diverContract->professional_diver_id = $application->target_id;
        }

        $contractsTable->save($diverContract);           // ← actual contract row changes
        $diverContractUpdate->approved_at = $application->approved_at;
        $this->save($diverContractUpdate);              // ← mark update as applied
    }

    $this->Applications->saveProgress($application, 'Professional Diver Work Contracts', 'Completed');
}
```

### The Problem for Dive-Center Applications

The `approve()` function has a **target gate** at line 110:

```php
if (!in_array($application->target, ['Professional Divers', 'Professional Divers Licenses'])) {
    return false;
}
```

A dive-center application has `target = 'Diving Centers'`, so
`ProfessionalDiversContractsUpdatesTable::approve()` silently returns `false`
and does nothing.

### Solution (Option A — Extend the `approve()` gate)

**Change needed in `ProfessionalDiversContractsUpdatesTable::approve()`:**

Replace the target gate with a check that distinguishes the applicant type:

```php
public function approve($application)
{
    if (null == $application) { return false; }

    // Determine the applicant context
    $isDiverApplication = in_array($application->target, ['Professional Divers', 'Professional Divers Licenses']);
    $isCenterCancellation = ($application->target == 'Diving Centers'
        && $application->purpose == 'Diving Center Contract Cancellation');

    if (!$isDiverApplication && !$isCenterCancellation) {
        return false;
    }

    // Skip progress check for center cancellations (different progress keys)
    if ($isDiverApplication) {
        if (isset($application->progress["Professional Diver Work Contracts"])
            && in_array($application->progress["Professional Diver Work Contracts"], ['Completed', 'Done', 'Rejected'])) {
            return false;
        }
    }

    $diverContractsUpdates = $this->find('all')
        ->where(['application_id' => $application->id])
        ->all();

    if (empty($diverContractsUpdates)) {
        if ($isDiverApplication) {
            $this->Applications->saveProgress($application, 'Professional Diver Work Contracts', 'Done');
        }
        return true;
    }

    $contractsTable = $this->fetchTable('ProfessionalDiversContracts');

    foreach ($diverContractsUpdates as $diverContractUpdate) {
        $diverContract = $contractsTable->find('all')
            ->where(['id' => $diverContractUpdate->contract_id])
            ->first();

        if (empty($diverContract)) {
            $this->delete($diverContractUpdate);
            continue;
        }

        if ($diverContract->status == 'Inactive') {
            continue;
        }

        // For diver applications: skip stale "Approved" updates from other applications
        // For center cancellations: the contract belongs to a different target,
        //   but that's expected — the center is cancelling a contract created
        //   by the diver's application
        if ('Approved' == $diverContractUpdate->status
            && $isDiverApplication
            && $diverContract->application_id != $diverContractUpdate->application_id) {
            $this->delete($diverContractUpdate);
            continue;
        }

        // Proposed cancellation → apply it (same for both diver and center)
        if ('Inactive' == $diverContractUpdate->status) {
            $diverContract->status = 'Inactive';
            $diverContract->terminated_at = $application->approved_at;
        }

        // Proposed activation (new contract for new diver) → apply it
        // Only relevant for diver applications — center cancellations only
        //   create 'Inactive' updates
        if ($isDiverApplication
            && 'Unverified' == $diverContract->status
            && $diverContractUpdate->status == 'Approved') {
            $diverContract->status = 'Approved';
            $diverContract->approved_at = $application->approved_at;
        }

        // Link contract to diver (only for diver applications with target_id)
        if ($isDiverApplication
            && empty($diverContract->professional_diver_id)
            && !empty($application->target_id)) {
            $diverContract->professional_diver_id = $application->target_id;
        }

        $contractsTable->save($diverContract);

        $diverContractUpdate->approved_at = $application->approved_at;
        $this->save($diverContractUpdate);
    }

    if ($isDiverApplication) {
        $this->Applications->saveProgress($application, 'Professional Diver Work Contracts', 'Completed');
    }

    return true;
}
```

### Why This Works for Both Cases

| Scenario | `application->target` | Update `status` | Contract `status` before | Contract `status` after | `professional_diver_id` |
|---|---|---|---|---|---|
| New diver adds contract | `Professional Divers` | `Approved` | `Unverified` | `Approved` | Set from `target_id` |
| Existing diver cancels | `Professional Divers` | `Inactive` | `Approved` | `Inactive` | Unchanged |
| **Dive center cancels** | `Diving Centers` | `Inactive` | `Approved` | `Inactive` | Unchanged (already set) |

The key insight: for a dive-center cancellation, the contract already exists
and already has `professional_diver_id` set. The update row just proposes
`Inactive`, and `approve()` applies it. The `professional_diver_id` linking
code only runs for diver applications (it checks `$isDiverApplication` and
`empty($diverContract->professional_diver_id)`).

### New-Diver Contract (`professional_diver_id` Empty)

When a new diver adds a contract during their first license application:

1. `register()` creates `professional_divers_contracts` with
   `professional_diver_id = null` (the diver doesn't exist yet).
2. `register()` creates `professional_divers_contracts_updates` with
   `status = 'Approved'`.
3. `issueNewLicense()` creates the `professional_divers` record and sets
   `application->target_id`.
4. `approve()` runs after `issueNewLicense()` (in `SaveApplicationCommand`),
   finds the contract with empty `professional_diver_id`, and sets it from
   `$application->target_id`.

For dive-center cancellations, this step is skipped because:

- `$isDiverApplication` is `false`.
- The contract already has `professional_diver_id` set.

### `SaveApplicationCommand` Call Order

**File:** `api/src/Command/SaveApplicationCommand.php:90-112`

Current order:

```php
if ($application->target == 'Diving Centers') {
    $this->approveDivingCenterApplicationa($application);  // profile, admins, memberships
}

if (in_array($application->target, ['Professional Divers', 'Professional Divers Licenses'])) {
    $this->fetchTable('ApplicationsProfessionalDivers')->apply($application);
    $this->fetchTable('ProfessionalDiversContractsUpdates')->approve($application);
    $this->fetchTable('ProfessionalDiverMembershipUpdates')->approve($application);
}
```

**Change needed:** Add the contract-cancellation call in the
`Diving Centers` branch:

```php
if ($application->target == 'Diving Centers') {
    if (!$this->approveDivingCenterApplicationa($application)) {
        return self::CODE_ERROR;
    }

    // Apply contract cancellations for the new application type
    if ($application->purpose == 'Diving Center Contract Cancellation') {
        $this->fetchTable('ProfessionalDiversContractsUpdates')->approve($application);
    }

    // ... reload application ...
}

if (in_array($application->target, ['Professional Divers', 'Professional Divers Licenses'])) {
    $this->fetchTable('ApplicationsProfessionalDivers')->apply($application);
    $this->fetchTable('ProfessionalDiversContractsUpdates')->approve($application);
    $this->fetchTable('ProfessionalDiverMembershipUpdates')->approve($application);
}
```

This means `ProfessionalDiversContractsUpdatesTable::approve()` is called for
both diver applications and dive-center cancellation applications, but the
function's internal logic now distinguishes the two via `$isDiverApplication`
and `$isCenterCancellation`.

---

## Backend Application Config (Planned — Not Implemented)

In `api/config/applications_configs.php`, add a new action map:

```php
$divingCenterContractCancellation = $divingCenterNewMembership;
$divingCenterContractCancellation['draft']['Applicant']['initiate']['data']['purpose']
  = 'Diving Center Contract Cancellation';
$divingCenterContractCancellation['draft']['Applicant']['initiate']['data']['flow']
  = 'diving-center-contract-cancellation';
// Adjust progress keys and stages as needed
```

Register in `APPLICATIONS_ACTION_MAPS`:

```php
'Diving Center Contract Cancellation' => $divingCenterContractCancellation,
```

Add flow alias:

```php
'diving-center-contract-cancellation' => 'Diving Center Contract Cancellation',
```

**Open question:** What stages does this application need? Likely just
`draft` → `review` → `approved`/`rejected`. No payment or quotation is needed.

---

## Frontend Config (Planned — Not Implemented)

In `application-config.js`, add:

```js
"Diving Center Contract Cancellation": {
  displayName: "Diving Center Contract Cancellation",
  payloadKeys: [
    "center_profile",
    "active_diver_contracts",
    "actions",
  ],
  requiredFiles: [],
  acceptedFiles: [],
  steps: [
    {
      id: "diver_contracts",
      label: "Diver Contracts",
      type: "entity",
      blocking: true,
      component: "DiveCenterDiverContractsCard",
    },
  ],
  summaryLayout: [
    "ApplicationInfoCard",
    "DivingCenterProfileCard",
    "DiveCenterDiverContractsCard",
    "ActionsTrackingCard",
  ],
}
```

Register `DiveCenterDiverContractsCard` in `ApplicationSummary.vue`'s
`COMPONENT_REGISTRY`.

---

## DiveCenterProfile.vue Changes (Planned)

In the **Affiliated Professional Divers** section (template lines 319-357):

1. Add a **Cancel Contracts** button next to the section heading.
2. The button calls a new `cancelContracts()` method.
3. The method POSTs to the new backend endpoint and navigates to
   `app-summary` on success.
4. Handle 409 conflict (existing application) using the existing
   `openExistingApplicationFromConflict()` helper.

```js
async function cancelContracts() {
  try {
    await withLoading("dive-center-profile-action", async () => {
      const res = await apiPost(
        DIVING_CENTERS_APPS_CANCEL_CONTRACTS + centerId.value
      );
      router.push({
        name: "app-summary",
        params: { appId: res.application.id, locale: locale.value },
      });
    });
  } catch (err) {
    if (openExistingApplicationFromConflict(err)) {
      return;
    }
    capture(err, { context: "DiveCenterProfile.cancelContracts" });
    notifyError(t("Failed to create contract cancellation application"));
  }
}
```

---

## Endpoint Constants (Planned)

In `apiEndpoints.js`:

```js
DIVING_CENTERS_APPS_CANCEL_CONTRACTS:
  import.meta.env.VITE_DIVING_CENTERS_APPS_CANCEL_CONTRACTS
  || "diving-centers-applications/cancel-contracts/",
```

In `.env`:

```
VITE_DIVING_CENTERS_APPS_CANCEL_CONTRACTS=diving-centers-applications/cancel-contracts/
```

---

## Admin Review (Planned)

The admin review page (`admins/src/platform/diving_centers/views/application_review.vue`)
needs to handle the new application type. The `pickRelatives` endpoint
should return the list of contracts being cancelled.

**Open question:** Can the existing admin review page be reused as-is (it
already shows profile, memberships, administrators), or does it need a new
section for diver contracts? Needs admins app inspection.

---

## Notification to Diver

When a dive center submits a contract-cancellation application, the affected
diver should be notified that their contract is pending cancellation.

**Open question:** Is this an email notification, in-app notification, or
both? Where does the diver see it (their license application summary, their
workspace, or a separate notifications page)?

---

## Translation Keys (Planned)

```
"Diving Center Contract Cancellation"
"Cancel Contracts"
"Diver Contracts"
"Cancel Contract"
"Cancel this contract?"
"Contract cancellation application created successfully"
"Failed to create contract cancellation application"
"Select at least one contract to cancel"
"Contract cancellation pending review"
"Contract cancelled by federation"
"Affiliated Professional Divers"
```

Arabic translations to be added to `src/locales/ar.json`.

---

## Open Questions

- [ ] Does `affiliatedProDivers` in the backend response include the contract
      row ID needed for cancellation, or must it be added?
- [ ] Does the backend `ApplicationPayloadComponent` support a new
      `active_diver_contracts` payload key, or can existing data be reused?
- [ ] What stages does this application need? (`draft` → `review` →
      `approved`/`rejected`?)
- [ ] Can the admin review page be reused, or does it need a new section?
- [ ] How is the diver notified — email, in-app, or both?
- [ ] Should the diver be able to contest the cancellation before federation
      approval?
- [ ] What happens to the diver's license if the cancelled contract was
      their only active contract? Does their license become invalid, or do
      they get a grace period to find a new center?
- [ ] Can a dive center cancel multiple contracts in a single application, or
      only one at a time?
- [ ] Does the application require a reason for cancellation?

---

## Related Docs

- [Digital Work Contracts](./digital-work-contracts.md)
- [Professional Diver Work Contracts Requirements](./professional-diver-work-contracts.md)
- [PDWorkContractsCard Spec](../components/PDWorkContractsCard.md)
- [Dive Center Applications Requirements](./dive-center-applications.md)
- [Application Summary](../pages/ApplicationSummary.md)
- [Application Store](../state/application-store.md)
