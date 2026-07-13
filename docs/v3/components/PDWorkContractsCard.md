# PDWorkContractsCard Component Specification

**Version:** 1.1.0  
**Last Updated:** 2026-02-02  
**Component Path:** `src/v3/components/applications/cards/PDWorkContractsCard.vue`

---

## Overview

`PDWorkContractsCard` displays Professional Diver work contracts inside `ApplicationSummary.vue`. It follows the **zero‑props** pattern and reads all data from `useApplicationStore`. The card:

- Shows existing contracts with status tags
- Lets applicants **add**, **remove**, or **restore** contracts (when editable)
- Enforces **minimum** and **maximum** contract rules
- Registers a **primary action** so the summary page can navigate to the correct step
- Shows a read-only empty state when there are no contracts **and** the application is not editable

---

## Location & Dependencies

- **Component:** `src/v3/components/applications/cards/PDWorkContractsCard.vue`
- **Store:** `src/v3/composables/application/useApplicationStore.js`
- **API:** `src/v3/composables/application/usePDApplicationsApi.js`
- **Config:** `src/v3/config/professional-divers-config.js`
- **UI:** PrimeVue `ConfirmDialog`, `useConfirm`, `useLoading`

---

## Data Sources

| Data | Source | Notes |
|------|--------|-------|
| `contracts` | `store.payload.pd_contracts.value` | Array of contracts |
| `canEdit` | `store.canModifyApplication.value` | Edit permissions |
| `MAX_CONTRACTS` | `getMaxContracts()` | From professional divers config |
| `MIN_CONTRACTS` | `getMinContracts()` | From professional divers config |

### Contract Object (observed shape)
```js
{
  id: number,
  center_name: string,
  new_status: 'approved' | 'inactive' | string,
  status: 'approved' | 'unverified' | 'inactive' | string,
  start_date: 'YYYY-MM-DD',
  end_date: 'YYYY-MM-DD' | null,
  contract_copy_link: string
}
```

---

## Visibility Rules

The card remains visible when:

- `canEdit === true`
- or `isLoadingKey('pd_contracts') === true`
- or `contracts.length > 0`
- or the read-only empty state is active

This is controlled by:
```js
const showEmptyState = computed(() => {
    return !canEdit.value && !isLoadingKey('pd_contracts') && contracts.value.length === 0;
});

const visibleComponent = computed(() =>
  canEdit.value || isLoadingKey('pd_contracts') || contracts.value.length > 0 || showEmptyState.value
);
```

---

## Validation Rules

Minimum required contracts are enforced using **approved** contracts only:

```js
const activeCount = contracts.value.filter(c => lc(c?.new_status) === 'approved').length;
if (activeCount < MIN_CONTRACTS) errors.push(t('At least one work contract is required'));
```

Validation is synced to the store:

```js
store.setStepError('pd_contracts', errors);
store.deleteStepError('pd_contracts');
```

---

## Actions & Permissions

### Add Contract
Shown when:
- `canEdit === true`
- `activeCount < MAX_CONTRACTS`

Action:
```js
router.push({ name: 'pd-contract-add', params: { appId, locale } })
```

### Delete Contract
Shown when:
- `canEdit === true`
- `contract.new_status === 'approved'`

Calls:
```js
api.deleteContract(contractId)
```

### Restore Contract
Shown when:
- `canEdit === true`
- `contract.new_status === 'inactive'`
- `contract.status === 'approved'`

Calls:
```js
api.restoreContract(contractId)
```

---

## Status Display Logic

Priority order for contract status:

1. **Pending Cancel** (`new_status = inactive` + `status = approved`)
2. **Inactive**
3. **Unverified**
4. **Approved**
5. **Fallback**

Severity → style mapping is handled in the card:
- `success` → green
- `warn` → amber
- `danger` → red
- `info` → blue

---

## Summary “Next” Navigation

The card registers its **primary action** so the summary page can route the user to the correct step:

```js
store.registerStepPrimaryAction('pd_contracts', navigateToAddContract);
onBeforeUnmount(() => store.unregisterStepPrimaryAction('pd_contracts'));
```

**Fallback:** root element includes `data-step-id="pd_contracts"` for scroll targeting.

---

## Loading Keys

| Purpose | Loading Key |
|---------|-------------|
| Initial load | `pd_contracts` |
| Add | `pd_contract-adding` |
| Delete | `pd_contract-deleting-{id}` |
| Restore | `pd_contract-restoring-{id}` |

---

## UI Notes

- The “Add Work Contract” card appears **without** a secondary title above it.
- The card shows a view-only empty state message when the application is not editable and there are no contracts.
- The main header is hidden in the empty-state branch; the empty state renders its own `Work Contracts` header.
- Contract file links use `VITE_WEB_BASE_URL` + `contract_copy_link`.

---

## Related Docs

- [Professional Diver Work Contracts Guide](../requirements/professional-diver-work-contracts.md)
- [useApplicationStore.md](../composables/useApplicationStore.md)
- [Payload System](../reference/payload-system.md)
