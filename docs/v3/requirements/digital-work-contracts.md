# Digital Work Contracts — Requirements (Incomplete Plan)

**Status:** Draft / Incomplete Plan
**Scope:** Professional Diver ↔ Dive Center work contracts (digital + file-upload coexistence)
**Last Updated:** 2026-08-09

---

## Overview

This document defines a **digital work contract** model for the relationship
between professional divers and dive centers. It coexists with the existing
file-upload contract model.

The digital contract replaces the paper evidence upload with a structured,
bilingual contract that both parties accept online. A contract becomes active
only after both parties accept **and** the federation approves **and** the
diver's license is issued.

The federation has the authority to reject or terminate any contract with a
reason at any time.

---

## Problem Statement

New professional diver applicants cannot obtain a work contract before
applying for their first license because:

1. The diver does not have a license number yet.
2. The current model requires a paper contract upload as evidence.

The digital contract solves this by linking the contract to the diver's
**identity number** (not a license number) and by letting either party initiate
the contract within the license application flow or the dive-center dashboard.

---

## Actors

| Actor | Role |
|---|---|
| Professional Diver | Initiates or accepts contract invites from dive centers |
| Dive Center | Initiates or accepts contract invites for divers; can remove contracts |
| Federation (Admin) | Reviews, approves, rejects, or terminates contracts with a reason |

---

## Contract Identification

- **Primary link:** diver's national identity number (10-digit Saudi ID).
- **License number:** optional. A new applicant does not have one yet; an
  existing diver may include it when renewing or changing centers.
- The dive center is identified by its licensed dive-center record (selected
  from licensed dive centers).

---

## Contract Types

Two contract types coexist:

| Type | Description | Evidence |
|---|---|---|
| `file_upload` (existing) | Diver uploads a PDF/image of a signed paper contract | Uploaded file |
| `digital` (new) | Structured bilingual contract formed by online acceptance | Acceptance record (no file) |

Both types appear in the work-contracts summary card and the dive-center
affiliated-divers list.

---

## Contract Terms (Bilingual)

Digital contract terms are stored and displayed in both Arabic and English.

| Field | Arabic key | English key |
|---|---|---|
| Job title | `job_title_ar` | `job_title_en` |
| Responsibilities | `responsibilities_ar` | `responsibilities_en` |
| Terms & conditions | `terms_ar` | `terms_en` |
| Federation termination reason | `termination_reason_ar` | `termination_reason_en` |

The UI renders the appropriate language based on the current locale.
Federation review shows both versions side by side.

---

## Contract States

| State | Meaning |
|---|---|
| `pending_acceptance` | Initiated by one party, waiting for the other party to accept |
| `declined` | The other party declined the invite |
| `pending_review` | Both parties accepted, waiting for federation review |
| `federation_rejected` | Federation rejected the contract (with reason) |
| `pending_license` | Federation approved, waiting for the diver's license to be issued |
| `active` | License issued; contract is live |
| `terminated` | Federation terminated an active contract (with reason) |
| `expired` | Contract end date has passed |

---

## State Transitions

```
[initiated] → pending_acceptance
pending_acceptance → accepted_by_both → pending_review
pending_acceptance → declined
pending_review → federation_approved → pending_license
pending_review → federation_rejected
pending_license → license_issued → active
active → terminated (by federation, with reason)
active → expired (end date passed)
```

---

## Activation Rule

A digital contract becomes **active** only when **all three** are true:

1. Both parties (diver and dive center) have accepted the contract terms online.
2. The federation has approved the contract.
3. The diver's license has been issued.

Until license issuance, the contract remains in `pending_license` state.

---

## Initiation Flows

### Flow A: Diver initiates from license application

1. Diver starts a new license application (or renewal / information update).
2. In the work-contracts step, the diver chooses **Digital Contract** instead
   of file upload.
3. The diver selects a licensed dive center and fills in bilingual contract
   terms (job title, responsibilities, start/end dates, terms).
4. The diver submits the invite. Contract state: `pending_acceptance`.
5. The dive center receives a notification and accepts or declines.
6. If accepted: contract moves to `pending_review`.
7. The license application proceeds; federation reviews the contract as part
   of the application.
8. On federation approval + license issuance: contract becomes `active`.

### Flow B: Dive center initiates from its dashboard

1. Dive center opens its profile page and navigates to affiliated divers
   (or initiates a new contract for a diver by identity number).
2. The dive center fills in bilingual contract terms and submits the invite.
   Contract state: `pending_acceptance`.
3. The diver receives a notification and accepts or declines from their
   license application summary or workspace.
4. If accepted: contract moves to `pending_review`.
5. Federation reviews and approves/rejects.

### Flow C: Dive center removes a contract

1. Dive center opens its profile page and navigates to affiliated divers.
2. The dive center selects a contract to remove (cancel).
3. A confirmation dialog appears.
4. On confirmation, the contract is marked for cancellation.
5. Federation reviews the cancellation as part of a dive-center application
   or directly (depending on workflow).

---

## Federation Authority

The federation (admin) can:

- **Reject** a pending contract during application review (with a bilingual
  reason).
- **Terminate** an active contract at any time (with a bilingual reason).
- Terminated contracts remain in the record for audit purposes.

---

## Coexistence with File-Upload Contracts

- The existing file-upload flow remains available.
- Both contract types appear in `PDWorkContractsCard` and the dive-center
  affiliated-divers list.
- The validation rule (at least one active contract) counts both types.
- The contract-type field distinguishes them in the payload.

---

## Bilingual Data Model (Draft)

### Digital Contract Record

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | number | auto | Primary key |
| `contract_type` | string | yes | `digital` or `file_upload` |
| `dive_center_id` | number | yes | Licensed dive center |
| `professional_diver_id` | number | yes (nullable until linked) | Linked on license issuance |
| `identity_number` | string | yes | Diver's 10-digit Saudi ID |
| `license_number` | string | no | Optional, for existing divers |
| `start_date` | date | yes | `YYYY-MM-DD` |
| `end_date` | date | no | `YYYY-MM-DD` |
| `job_title_ar` | string | yes | Arabic job title |
| `job_title_en` | string | yes | English job title |
| `responsibilities_ar` | text | no | Arabic responsibilities |
| `responsibilities_en` | text | no | English responsibilities |
| `terms_ar` | text | no | Arabic terms & conditions |
| `terms_en` | text | no | English terms & conditions |
| `initiated_by` | string | yes | `diver` or `dive_center` |
| `invite_status` | string | yes | `pending_acceptance`, `accepted`, `declined` |
| `federation_status` | string | yes | `pending_review`, `approved`, `rejected`, `terminated` |
| `contract_status` | string | yes | Derived: `pending_license`, `active`, `terminated`, `expired` |
| `accepted_by_diver_at` | datetime | no | |
| `accepted_by_center_at` | datetime | no | |
| `accepted_by_diver_user_id` | number | no | |
| `accepted_by_center_user_id` | number | no | |
| `federation_reviewed_at` | datetime | no | |
| `federation_reviewed_by` | number | no | Admin user ID |
| `termination_reason_ar` | text | no | |
| `termination_reason_en` | text | no | |
| `terminated_at` | datetime | no | |
| `terminated_by` | number | no | Admin user ID |

---

## Open Questions (Incomplete)

- [ ] What bilingual fields are mandatory vs optional?
- [ ] Should the dive center be able to edit terms after sending but before
      acceptance?
- [ ] Should the diver be able to negotiate terms or only accept/decline?
- [ ] How are notifications delivered (email, in-app, both)?
- [ ] Does the dive-center removal flow require a separate application type,
      or can it be a direct action reviewed by the federation?
- [ ] Should a terminated contract block the diver from getting a new contract
      with the same center?
- [ ] What is the exact backend data model (migration, tables, associations)?
- [ ] What are the exact backend endpoints needed?
- [ ] How does the admin review page display a digital contract (terms,
      acceptance timestamps, both languages)?
- [ ] Does the contract expire automatically on `end_date`, or does a job
      run the transition?
- [ ] What are the Arabic translations for all new status labels and UI text?

---

## Frontend Components (Planned — Not Implemented)

| Component | Purpose |
|---|---|
| `PDWorkContractsCard.vue` (updated) | Render both file-upload and digital contracts; show invite status badges; add "Send Digital Invite" action |
| `PDDigitalContractInviteForm.vue` (new) | MasterForm for initiating a digital contract (select center/diver, bilingual terms, dates) |
| `PDContractInvitesCard.vue` (new) | Show received/pending invites with Accept/Decline buttons |
| `DiveCenterDiverContractsCard.vue` (new) | Dive-center-side card listing affiliated divers with Send Invite / Remove actions |
| `DiveCenterDigitalContractInviteForm.vue` (new) | MasterForm for dive center to send a contract invite to a diver by identity number |

---

## Routes (Planned — Not Implemented)

| Route name | Path | Purpose |
|---|---|---|
| `pd-digital-contract-invite` | `:appId(\\d+)/professional-divers/digital-contract-invite` | Diver initiates digital contract |
| `pd-contract-invite-accept` | `:appId(\\d+)/professional-divers/contract-invite/:inviteId(\\d+)/accept` | Diver accepts/declines an invite |
| `dive-center-digital-contract-invite` | `:appId(\\d+)/dive-centers/digital-contract-invite` | Dive center initiates digital contract |
| `dive-center-remove-diver-contract` | `:appId(\\d+)/dive-centers/remove-diver-contract` | Dive center removes a contract |

---

## Application Config (Planned — Not Implemented)

New application type for dive-center contract management:

```js
"Diving Center Diver Contract Management": {
  displayName: "Diving Center Diver Contract Management",
  payloadKeys: [...],
  steps: [...],
  summaryLayout: [...],
}
```

The diver-side digital contract does not need a new application type — it is
a step within the existing professional diver license application workflow.

---

## Configuration (Planned — Not Implemented)

Update `professional-divers-config.js` to include digital contract settings:

```js
workContracts: {
  maxContracts: 3,
  minContracts: 1,
  contractTypes: {
    file_upload: "File Upload",
    digital: "Digital",
  },
  digitalContract: {
    inviteStatuses: {
      pending_acceptance: "Pending Acceptance",
      accepted: "Accepted",
      declined: "Declined",
    },
    federationStatuses: {
      pending_review: "Pending Review",
      approved: "Approved",
      rejected: "Rejected",
      terminated: "Terminated",
    },
    contractStatuses: {
      pending_license: "Pending License",
      active: "Active",
      terminated: "Terminated",
      expired: "Expired",
    },
  },
}
```

---

## Backend Endpoints (Planned — Not Implemented — Requires Per-Change Approval)

| Method | Endpoint (draft) | Purpose |
|---|---|---|
| POST | `professional-divers-contracts/digital-invite` | Diver initiates digital contract invite |
| POST | `professional-divers-contracts/accept-invite/{inviteId}` | Accept a digital contract invite |
| POST | `professional-divers-contracts/decline-invite/{inviteId}` | Decline a digital contract invite |
| POST | `diving-centers-contracts/digital-invite` | Dive center initiates digital contract invite |
| POST | `diving-centers-contracts/remove/{contractId}` | Dive center removes a contract |
| GET | `professional-divers-contracts/pending-invites/{appId}` | List pending invites for a diver application |
| GET | `diving-centers-contracts/affiliated-divers/{centerId}` | List affiliated divers for a dive center |
| POST | `admins-api/professional-divers-contracts/review/{contractId}` | Federation review (approve/reject) |
| POST | `admins-api/professional-divers-contracts/terminate/{contractId}` | Federation terminates an active contract |

All backend changes require explicit per-change user approval per `AGENTS.md`.

---

## Migration Strategy (Draft)

1. Add `contract_type` field to existing contracts table (default
   `file_upload` for legacy rows).
2. Create new `professional_divers_digital_contracts` table for digital
   contract records and acceptance audit trail.
3. The existing `ApplicationsProfessionalDiversContracts` view is extended to
   include digital contracts.
4. Existing file-upload contracts remain unchanged.

---

## Testing Checklist (Draft)

- [ ] Diver initiates digital contract from license application
- [ ] Dive center initiates digital contract from dashboard
- [ ] Other party accepts invite → contract moves to pending_review
- [ ] Other party declines invite → contract moves to declined
- [ ] Federation approves contract → contract moves to pending_license
- [ ] Federation rejects contract → contract moves to federation_rejected
- [ ] License issued → contract becomes active
- [ ] Federation terminates active contract with reason
- [ ] Contract expires on end_date
- [ ] Dive center removes a contract
- [ ] Bilingual terms display in correct locale
- [ ] Federation review shows both languages side by side
- [ ] File-upload and digital contracts coexist in the same summary card
- [ ] Validation counts both contract types for the minimum requirement

---

## Related Docs

- [Professional Diver Work Contracts Requirements](./professional-diver-work-contracts.md)
- [PDWorkContractsCard Spec](../components/PDWorkContractsCard.md)
- [Professional Diver New License Requirements](./professional-diver-new-license.md)
- [Dive Center Applications Requirements](./dive-center-applications.md)
- [Payload System](../reference/payload-system.md)