# Professional Diver Work Contracts — Requirements & Guide

**Scope:** Professional Diver applications (New License / Renewal / Information Update)  
**Last Updated:** 2026-02-02  
**Primary UI:** `PDWorkContractsCard.vue` + `AddContract.vue`

---

## Overview

Professional Diver applicants must provide at least **one active work contract**. Contracts are managed in the application summary via the `PDWorkContractsCard`, and new contracts are added through the dedicated `AddContract` page (MasterForm-driven).

The term **active** is the canonical UI/business term for the backend `approved` status. The two words are interchangeable; `active` is used in prose and `approved` appears in the raw payload value.

Submission eligibility is based on the contract's **proposed** status (`new_status`), not its current reviewed status (`status`). A contract that is currently `unverified` but proposed as `approved` in the current application satisfies the requirement; the application is then approved (or rejected) by admins, who promote `new_status` to the live `status`.

---

## Business Requirements

1. **Minimum Requirement**
   - At least **one active** contract is required before submission.
   - "Active" here means a contract whose `new_status === 'approved'` (proposed as active in this application).
2. **Maximum Limit**
   - Applicants can add contracts only until `MAX_CONTRACTS` is reached.
3. **Edit Permissions**
   - Add/Remove/Restore actions are available **only** when the application is editable.
4. **View-Only Behavior**
   - If the application is **not editable** and there are **no contracts**, the card shows a read-only empty state with “No work contracts registered” and the main header is hidden to avoid duplicate titles.
5. **Document Support**
   - Each contract must include a **copy** of the contract (PDF or image).

---

## Functional Requirements

### FR‑1: Display Contracts
- Show each contract with:
   - Dive center name
   - Start date
   - End date (optional)
   - Contract copy link (opens in new tab)
   - Status tag (Active / Unverified / Inactive / Pending Cancel)

### FR‑2: Add Contract
- Provide **Add Work Contract** action when editable and under max.
- Route: `pd-contract-add`

### FR‑3: Delete Contract
- Show **Delete** only when:
   - `new_status === 'approved'` (proposed active in this application)

### FR‑4: Restore Contract
- Show **Restore** only when:
   - `new_status === 'inactive'` and `status === 'approved'` (currently active, proposed for cancellation)

### FR‑5: Validation
- Validation errors are reported to the store:
  - `store.setStepError('pd_contracts', errors)`
  - `store.deleteStepError('pd_contracts')`
- Summary “Next” button uses this to guide the user.

---

## Data & Configuration

### Store Payload
Contracts are loaded from:
```
store.payload.pd_contracts.value
```

### Limits
Configured in:
```
src/v3/config/professional-divers-config.js
```

```js
workContracts: {
  maxContracts: 3,
  minContracts: 1
}
```

---

## Add Contract Form (MasterForm)

**Page:** `src/v3/pages/applications/professional-divers/AddContract.vue`

### Schema
Defined in:
```
src/v3/schema/applications/professionalDiverContract.js
```

Fields:

| Field | Type | Required | Notes |
|------|------|----------|------|
| `dive_center_id` | `select` | ✅ | Options from licensed dive centers API |
| `start_date` | `DatePicker` | ✅ | Stored as `YYYY-MM-DD` |
| `end_date` | `DatePicker` | ❌ | Stored as `YYYY-MM-DD` |
| `contract_copy` | `file` | ✅ | PDF / PNG / JPG / JPEG / GIF (≤ 2MB) |

### Dive Centers Source
```
VITE_LICENSED_DIVE_CENTERS_BASIC
```
The form fetches licensed centers and injects them into the schema options.

---

## API Integration

### Add Contract
```
VITE_APPLICATIONS_PROFESSIONAL_DIVERS_CONTRACTS_REGISTER + appId
```
FormData fields sent:
```
dive_center_id
start_date
end_date (optional)
work_contract_copy_file
```

### Delete Contract
```
VITE_APPLICATIONS_PROFESSIONAL_DIVERS_CONTRACTS_CANCEL + updateId
```

### Restore Contract
```
VITE_APPLICATIONS_PROFESSIONAL_DIVERS_CONTRACTS_REACTIVE + updateId
```

**After any mutation:** the store reloads the application payload (`forceReload: true`).

---

## Summary Integration

The summary page uses a **Next** button when the application is incomplete.  
`PDWorkContractsCard` registers a primary action:

```js
store.registerStepPrimaryAction('pd_contracts', navigateToAddContract);
```

This ensures “Next” takes the user directly to the Add Contract page.

---

## Testing Checklist

- [ ] No contracts + not editable → empty state shows “No work contracts registered”
- [ ] No contracts + editable → add card visible, warning shown
- [ ] Contracts proposed active (`new_status === 'approved'`) show **Delete**
- [ ] Inactive contracts show **Restore**
- [ ] `MAX_CONTRACTS` hides Add button
- [ ] Contract copy link opens correctly
- [ ] Validation cleared when at least one contract is proposed active (`new_status === 'approved'`)

---

## Related Docs

- [PDWorkContractsCard Spec](../components/PDWorkContractsCard.md)
- [Professional Diver License Requirements](./professional-diver-new-license.md)
- [Payload System](../reference/payload-system.md)
