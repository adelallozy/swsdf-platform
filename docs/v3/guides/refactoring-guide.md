# Component Refactoring Guide - v3 Architecture

> **⚠️ CRITICAL REMINDER**: Never modify original legacy components during refactoring. Always create new v3 components alongside the original, test thoroughly, then update routes.

## Quick Reference - Key Points

### ✅ DO (Best Practices)
- **Create new v3 component** in `src/v3/` alongside original
- **Use v3 composables**: `useLoading`, `useNotification`, `useErrorHandler`
- **Use v3 httpClient**: Import `apiGet`, `apiPost` from `@/v3/services/httpClient.js`
- **Use centralized endpoints**: Import from `@/v3/config/apiEndpoints.js`
- **Use v3 components**: `Breadcrumb`, `PageHeading` (auto-read from route metadata)
- **Use router-link for navigation**: Style as button for user-facing navigation
- **Handle errors properly**: `try-catch` with `useErrorHandler.capture()` and `useNotification.error()`
- **Translation pattern**: English hardcoded in component, Arabic in `ar.json` using English phrase as key
- **No `en.json` maintenance**: Add/update Arabic entries only in `src/locales/ar.json` (or approved Arabic bundle)
- **Tailwind prefix**: Always use `tw-` prefix for Tailwind classes
- **Update routes**: Point to new v3 component after testing
- **Public route localization**: For public pages, define routes under `:locale(ar|en)` and pass `params.locale` in route links

### ❌ DON'T (Forbidden)
- **NEVER modify original component** during refactoring
- **DON'T use forbidden dependencies**: axios, vue3-toastify, Pinia, Vuex, Bootstrap, SweetAlert, WOW.js, VeeValidate, Yub
- **DON'T import from deprecated `@/v3/composables/apiClient.js`**
- **DON'T use empty catch blocks** - always handle errors
- **DON'T use programmatic navigation** (`router.push()`) for user-facing buttons - use `router-link` instead
- **DON'T use nested translation keys** - use English phrase as key (e.g., `$t('User Profile')` not `$t('userProfile.title')`)
- **DON'T add new keys to `src/locales/en.json`** - English text stays in component code

### 📋 Essential Imports for v3 Components
```javascript
// API Client
import { apiGet, apiPost, apiPatch, apiPut, apiDelete } from '@/v3/services/httpClient.js';
import { ENDPOINT_NAME } from '@/v3/config/apiEndpoints.js';

// Composables
import { useLoading } from '@/v3/composables/useLoading.js';
import { useNotification } from '@/v3/composables/useNotification.js';
import { useErrorHandler } from '@/v3/composables/useErrorHandler.js';
import usePageHeading from '@/v3/composables/layout/usePageHeading.js';

// Components
import Breadcrumb from '@/v3/components/Layout/Breadcrumb.vue';
import PageHeading from '@/v3/components/Layout/PageHeading.vue';
```

### 🔧 Common Patterns
```javascript
// API Call with Error Handling
const { capture } = useErrorHandler();
const { error: notifyError } = useNotification();
const { withLoading, isLoadingKey } = useLoading();

async function loadData() {
  try {
    const response = await withLoading('data-loading', async () => {
      return await apiGet(ENDPOINT_NAME);
    });
    return response;
  } catch (e) {
    capture(e, {
      context: 'ComponentName.loadData',
      fallback: 'Failed to load data'
    });
    notifyError('Failed to load data');
  }
}

// Navigation Button (router-link styled as button)
<router-link
  :to="{ name: 'route-name', params: { locale: locale.value } }"
  class="base-btn py-2 tw-rounded-lg"
>
  {{ $t('Button Text') }}
</router-link>
```

---

## Overview

This guide documents the rules, patterns, and best practices for refactoring legacy components to v3 architecture. It ensures consistency across the codebase and prevents common pitfalls during refactoring.

**Related Guides:**
- [Global Development Guide](./global-guide.md) - Overall coding standards and forbidden dependencies
- [MasterForm Component Guide](./masterform-guide.md) - Canonical MasterForm usage and schema guidance
- [Translation Guide](./translation-guide.md) - i18n strategy and best practices

---

## Table of Contents

1. [Critical Rules](#critical-rules)
2. [Refactoring Process](#refactoring-process)
3. [Common Patterns](#common-patterns)
4. [Testing Strategy](#testing-strategy)
5. [Documentation Updates](#documentation-updates)
6. [Common Pitfalls](#common-pitfalls)
7. [Checklist](#checklist)
8. [Related Documentation](#related-documentation)

---

## Critical Rules

### Rule 1: Never Modify Original Components During Refactoring

**Rule:** Original legacy components MUST NOT be modified during the refactoring process.

**Why:**
- Original components serve as the baseline for comparison
- Allows testing of new implementation against old behavior
- Enables rollback if issues arise
- Prevents breaking existing functionality before new version is ready

**Process:**
1. Create new v3 component alongside original (e.g., in `src/v3/`)
2. Implement new features and patterns in v3 component
3. Test v3 component thoroughly
4. Update routes to point to v3 component
5. Remove original component ONLY after testing is complete and successful

**Example:**

```javascript
// ❌ WRONG - Don't modify original component
// src/platform/views/Applications/professional-divers/NewLicense.vue

// ✅ CORRECT - Create new v3 component
// src/v3/pages/applications/professional-divers/NewLicense.vue
```

**File Structure During Refactoring:**
```
src/
├── platform/views/Applications/professional-divers/
│   ├── NewLicense.vue              # Original - DO NOT MODIFY
│   └── UserProfileForm.vue        # Legacy component
└── v3/pages/applications/professional-divers/
    ├── NewLicense.vue                  # New v3 component (entry point)
    └── UpdateLicenseInformations.vue   # License information step (rank + card design)
```

**Route Updates:**
```javascript
// Update route to point to v3 component
{
  path: '/:locale(ar|en)/professional-diver-new-license',
  name: 'professional-diver-new-license',
  component: () => import('@/v3/pages/applications/professional-divers/NewLicense.vue') // ✅ New component
  // component: () => import('@/platform/views/Applications/professional-divers/NewLicense.vue') // ❌ Old component
}
```

---

## Refactoring Process

### Phase 1: Analysis

**Goal:** Understand original component behavior and requirements.

**Steps:**
1. Read original component code
2. Identify all features and functionality
3. Document API endpoints used
4. Identify dependencies and composables
5. Note any special patterns or workarounds

**Deliverables:**
- Feature list
- API endpoint documentation
- Dependency inventory

### Phase 2: Planning

**Goal:** Create detailed implementation plan.

**Steps:**
1. Review v3 architecture patterns
2. Identify appropriate v3 components and composables
3. Design new component structure
4. Plan data flow and state management
5. Identify potential issues and solutions

**Deliverables:**
- Implementation plan document
- Component structure diagram
- Data flow documentation

### Phase 3: Implementation

**Goal:** Build new v3 component.

**Steps:**
1. Create new component file in `src/v3/`
2. Import v3 composables and components
3. Implement core functionality
4. Apply v3 patterns (no forbidden dependencies)
5. Handle edge cases and errors properly

**Deliverables:**
- New v3 component
- Sub-components (if needed)
- Schema files (if needed)

### Phase 4: Testing

**Goal:** Verify new component works correctly.

**Steps:**
1. Test all user flows
2. Test error scenarios
3. Test edge cases
4. Compare behavior with original component
5. Performance testing

**Deliverables:**
- Test results document
- Bug fixes (if any)
- Performance metrics

### Phase 5: Integration

**Goal:** Connect new component to application.

**Steps:**
1. Update routes
2. Update navigation links
3. Update breadcrumbs
4. Test navigation
5. Verify no broken links

**Deliverables:**
- Updated route configuration
- Updated navigation components
- Integration test results

### Phase 6: Cleanup

**Goal:** Remove legacy code after successful deployment.

**Steps:**
1. Verify new component is working in production
2. Remove original component file
3. Remove unused legacy dependencies
4. Update documentation
5. Remove from build process (if applicable)

**Deliverables:**
- Removed files
- Updated documentation
- Clean codebase

---

## Common Patterns

### Pattern 1: Schema-Driven Forms

**Use Case:** Forms with dynamic fields and validation.

**v3 Pattern:** Follow the canonical MasterForm guide for schema structure, data flow, and validation:
- [MasterForm Component Guide](./masterform-guide.md)

### Pattern 2: Cascading Selects (Region → City)

**Use Case:** Dependent dropdown options.

**v3 Pattern:** Use `formOptions` + `@field-change` patterns from the MasterForm guide:
- [MasterForm Component Guide](./masterform-guide.md#common-patterns)

### Pattern 3: API Integration

**Use Case:** Making HTTP requests to backend.

**v3 Pattern:**
```javascript
import { apiGet, apiPost } from '@/v3/services/httpClient.js';
import { useNotification } from '@/v3/composables/useNotification.js';
import { useErrorHandler } from '@/v3/composables/useErrorHandler.js';

const { success: notifySuccess, error: notifyError } = useNotification();
const { capture } = useErrorHandler();

async function loadData() {
  try {
    const response = await apiGet('endpoint');
    return response;
  } catch (e) {
    capture(e, {
      context: 'ComponentName.loadData',
      fallback: 'Failed to load data'
    });
    notifyError('Failed to load data');
  }
}

async function submitData(data) {
  try {
    const response = await apiPost('endpoint', data);
    notifySuccess('Data saved successfully');
    return response;
  } catch (e) {
    if (e.status === 422) {
      // Handle validation errors
      formRef.value?.applyServerErrors?.(e.errors);
      notifyError('Please fix validation errors');
      return;
    }
    capture(e, {
      context: 'ComponentName.submitData',
      fallback: 'Failed to save data',
      meta: { data }
    });
    notifyError('Failed to save data');
  }
}
```

**Key Points:**
- Use `apiGet`, `apiPost` from httpClient (NOT axios)
- Use `useNotification` for user feedback (NOT vue3-toastify)
- `useNotification` translates summary/detail when the key exists in locale files
- Pass English keys (e.g., `Failed to save data`) and add Arabic translations in `src/locales/ar.json`
- Use `useErrorHandler` for error logging
- Handle 422 validation errors with `applyServerErrors`
- Handle other errors with `capture`

### Pattern 4: Loading States

**Use Case:** Show loading indicators during async operations.

**v3 Pattern:**
```javascript
import { useLoading } from '@/v3/composables/useLoading.js';

const { withLoading, isLoadingKey } = useLoading();

const initializing = computed(() => isLoadingKey('data-loading'));
const submitting = computed(() => isLoadingKey('data-submitting'));

async function loadData() {
  await withLoading('data-loading', async () => {
    const response = await apiGet('endpoint');
    return response;
  });
}

async function submitData(data) {
  await withLoading('data-submitting', async () => {
    const response = await apiPost('endpoint', data);
    return response;
  });
}
```

**Template:**
```vue
<div v-if="initializing" class="tw-flex tw-justify-center tw-py-16">
  <i class="pi pi-spinner tw-animate-spin tw-text-3xl tw-text-primary"></i>
</div>

<button :disabled="submitting" @click="submitData">
  <span v-if="!submitting">Submit</span>
  <span v-else>
    <i class="pi pi-spinner tw-animate-spin"></i>
    <span>Submitting</span>
  </span>
</button>
```

**Key Points:**
- Use `useLoading` composable for loading states
- Use `isLoadingKey` to check specific loading states
- Show loading indicators in UI
- Disable buttons during loading

### Pattern 5: Navigation

**Use Case:** Navigate between pages.

**v3 Pattern:**
```javascript
import { useRouter } from 'vue-router';

const router = useRouter();
const { locale } = useI18n();

// Navigate to page
router.push({
  name: 'page-name',
  params: { id: itemId, locale: locale.value }
});

// Navigate back
router.replace({ name: 'workspace', params: { locale: locale.value } });

// Navigate to error page
router.replace({ name: 'error-404' });
```

**Key Points:**
- Use `router.push` for forward navigation
- Use `router.replace` for redirects
- Always include `locale` in params
- Use route names (not paths)

---

## MasterForm Integration

MasterForm guidance is centralized to avoid duplication. Use the canonical guide for schema structure, data flow, DatePicker behavior, and troubleshooting:
- [MasterForm Component Guide](./masterform-guide.md)

---

## Testing Strategy

### Unit Testing

**Test Scenarios:**
1. Component renders correctly
2. Form validation works
3. Submit with valid data
4. Submit with invalid data
5. Error handling works
6. Loading states display correctly
7. Navigation works correctly

### Integration Testing

**Test Scenarios:**
1. API integration works
2. Data loads from API correctly
3. Data saves to API correctly
4. Server errors display correctly
5. Navigation to/from component works

### Regression Testing

**Test Scenarios:**
1. Compare new component behavior with original
2. Verify all features work the same way
3. Check for missing functionality
4. Verify performance is similar or better

### Browser Testing

**Test Browsers:**
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

**Test Devices:**
- Desktop (1920x1080)
- Tablet (768x1024)
- Mobile (375x667)

---

## Documentation Updates

### Update Component Documentation

When creating a new v3 component:
1. Document component purpose and features
2. Document props and events
3. Document API endpoints used
4. Document dependencies
5. Provide usage examples

### Update Architecture Documentation

When implementing new patterns:
1. Update relevant guides
2. Add new patterns to pattern library
3. Document breaking changes
4. Update migration guides

### Update Global Guide

When adding new rules or standards:
1. Add to [Global Development Guide](./global-guide.md)
2. Update forbidden dependencies list
3. Update allowed alternatives
4. Add new best practices

---

## Common Pitfalls

### Pitfall 1: Modifying Original Component

**Problem:** Making changes to legacy component during refactoring.

**Impact:**
- Loses baseline for comparison
- Makes rollback impossible
- Breaks existing functionality prematurely

**Solution:** Create new v3 component alongside original.

### Pitfall 2: Using Forbidden Dependencies

**Problem:** Importing axios, vue3-toastify, Pinia, Vuex, etc.

**Impact:**
- Violates coding standards
- May cause build errors
- Inconsistent with v3 architecture

**Solution:** Use v3 composables and services.

### Pitfall 3: Skipping MasterForm Guidance

**Problem:** Implementing forms without following the canonical MasterForm guide.

**Impact:**
- Schema reactivity issues
- Date format mismatches
- Cascading selects not updating

**Solution:** Follow the [MasterForm Component Guide](./masterform-guide.md).

### Pitfall 4: Skipping Error Handling

**Problem:** Not handling API errors properly.

**Impact:**
- Errors not shown to users
- Application crashes
- No feedback on failures

**Solution:** Use `try-catch` with `useErrorHandler` and `useNotification`.

---

## Checklist

Before starting refactoring:

- [ ] Read and understand original component
- [ ] Identify all features and functionality
- [ ] Document API endpoints
- [ ] Create implementation plan
- [ ] Review v3 architecture patterns
- [ ] Identify appropriate v3 components

During refactoring:

- [ ] Create new v3 component file
- [ ] Import v3 composables and components
- [ ] Implement core functionality
- [ ] Apply v3 patterns
- [ ] Handle errors properly
- [ ] Test all user flows

Before integration:

- [ ] Update routes
- [ ] Update navigation links
- [ ] Test navigation
- [ ] Verify no broken links

Before cleanup:

- [ ] Test new component thoroughly
- [ ] Compare behavior with original
- [ ] Verify all features work
- [ ] Performance testing
- [ ] Browser testing

After cleanup:

- [ ] Remove original component
- [ ] Remove unused legacy dependencies
- [ ] Update documentation
- [ ] Update architecture guides
- [ ] Communicate changes to team

---

## Related Documentation

- [Global Development Guide](./global-guide.md) - Overall coding standards
- [MasterForm Component Guide](./masterform-guide.md) - Canonical MasterForm usage and schema guidance
- [Translation Guide](./translation-guide.md) - i18n best practices
- [Issues and Fixes](../reference/issues-and-fixes.md) - Common issues and solutions

---

**Last Updated:** January 29, 2026
**Version:** 1.0
**Status:** Active
