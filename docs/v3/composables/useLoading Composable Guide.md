# useLoading Composable Guide

**File:** `src/v3/composables/useLoading.js`  
**Purpose:** Centralized loading state management using dynamic keys

---

## Overview

`useLoading` is a Vue 3 composable that manages loading states across the application using a **key-based system**. Instead of creating individual `ref(false)` for each loading state, you use string keys to track multiple concurrent operations.

This composable uses **module-scoped state**, meaning all components share the same loading registry.

---

## API Reference

### Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `withLoading` | `(key: string, asyncFn: Function)` | `Promise<any>` | Wraps async operation with loading tracking |
| `isLoadingKey` | `(key: string)` | `boolean` | Check if specific key is loading |
| `startLoading` | `(key: string)` | `void` | Manually start loading for key |
| `stopLoading` | `(key: string)` | `void` | Manually stop loading for key |

### Computed Properties

| Property | Type | Description |
|----------|------|-------------|
| `isLoading` | `ComputedRef<boolean>` | True if ANY operation is loading |
| `isFetching` | `ComputedRef<boolean>` | True if any fetch operation is loading |
| `isMutating` | `ComputedRef<boolean>` | True if any mutation is loading |

---

## Loading Key Naming Convention

**Format:** `{entity}-{action}[-{id}]`

### Fetch Operations (suffixes)

- `-fetching`
- `-loading`
- `-getting`

```javascript
'application'
'event-loading'
'team-fetching'
'participants-loading'
'files'
```

### Mutation Operations (suffixes)

- `-submit`
- `-creating`
- `-updating`
- `-deleting`
- `-adding`
- `-removing`

```javascript
'application-submitting'
'application-recalling'
'application-deleting'
'team-creating'
'team-updating'
'participant-adding'
'participant-deleting'
'file-uploading'
```

### Granular Control (with IDs)

```javascript
'participant-deleting-123'
'file-uploading-456'
'comment-updating-789'
```

---

## Basic Usage

### Import

```javascript
import { useLoading } from '@/v3/composables/useLoading';
```

### Simple Async Operation

```javascript
const { withLoading, isLoadingKey } = useLoading();

async function loadData() {
    const data = await withLoading('data-fetching', async () => {
        return await apiGet('/api/data');
    });
    return data;
}
```

### Check Loading State in Template

```vue
<template>
    <Button
        :loading="isLoadingKey('data-fetching')"
        @click="loadData"
    >
        Load Data
    </Button>
</template>
```

---

## Usage with useApplicationStore

The `useApplicationStore` uses `useLoading` internally for ALL async operations. This eliminates the need for separate loading refs like `submitting`, `recalling`, `deleting`.

### Inside useApplicationStore

```javascript
// FILE: src/v3/composables/application/useApplicationStore.js

import { useLoading } from '@/v3/composables/useLoading.js';
import { apiGet, apiPost, apiDelete } from '@/v3/services/httpClient.js';

const { withLoading, isLoadingKey } = useLoading();

// Load application
async function loadApplication(appId, options = {}) {
  return await withLoading('application', async () => {
    const url = import.meta.env.VITE_APPLICATION_BY_ID.replace('{appId}', appId);
    const response = await apiGet(url);
    application.value = response?.application;
    return application.value;
  });
}

// Submit application
async function submitApplication(appId) {
  return await withLoading('application-submitting', async () => {
    const url = import.meta.env.VITE_APPLICATION_SUBMIT_URL.replace('{appId}', appId);
    return await apiPost(url, {});
  });
}

// Delete participant
async function deleteParticipant(participantId) {
    return await withLoading(`participant-deleting-${participantId}`, async () => {
        const url = import.meta.env.VITE_PARTICIPANTS_DELETE.replace('{id}', participantId);
        return await apiDelete(url);
    });
}

// Export loading check
export function useApplicationStore() {
    return {
        // ... other exports
        isLoadingKey,
    };
}
```

### In Components Using the Store

```vue
<script setup>
import { onMounted } from 'vue';
import { useApplicationStore } from '@/v3/composables/application/useApplicationStore.js';

const {
    application,
    loadApplication,
    submitApplication,
    isLoadingKey
} = useApplicationStore();

// Load on mount
onMounted(async () => {
    await loadApplication(props.appId);
});
</script>

<template>
    <!-- Page loading overlay -->
    <div v-if="isLoadingKey('application')" class="loading-overlay">
        <ProgressSpinner />
    </div>

    <!-- Content when loaded -->
    <div v-else>
        <h1>{{ application.title }}</h1>

        <!-- Submit button with loading state -->
        <Button
            :loading="isLoadingKey('application-submitting')"
            :disabled="!canSubmit"
            @click="submitApplication(application.id)"
        >
            Submit Application
        </Button>
    </div>
</template>
```

---

## Usage in Standalone Pages

For pages that don't use `useApplicationStore`, import `useLoading` directly.

### Example: Competitions Index Page

```vue
<script setup>
import { ref, onMounted } from 'vue';
import { useLoading } from '@/v3/composables/useLoading';
import { apiGet } from '@/v3/services/httpClient';

const { withLoading, isLoadingKey, isLoading } = useLoading();

const competitions = ref([]);

async function loadCompetitions() {
    const data = await withLoading('competitions-fetching', async () => {
        const response = await apiGet('/api/competitions');
        return response.data;
    });
    competitions.value = data;
}

async function deleteCompetition(id) {
    await withLoading(`competition-deleting-${id}`, async () => {
        await apiDelete(`/api/competitions/${id}`);
    });
    // Reload after delete
    await loadCompetitions();
}

onMounted(() => {
    loadCompetitions();
});
</script>

<template>
    <!-- Global page loading -->
    <div v-if="isLoadingKey('competitions-fetching')" class="page-loader">
        <ProgressSpinner />
        <p>Loading competitions...</p>
    </div>

    <!-- Content -->
    <div v-else>
        <DataTable :value="competitions">
            <Column field="name" header="Name" />
            <Column header="Actions">
                <template #body="{ data }">
                    <Button
                        icon="pi pi-trash"
                        :loading="isLoadingKey(`competition-deleting-${data.id}`)"
                        @click="deleteCompetition(data.id)"
                    />
                </template>
            </Column>
        </DataTable>
    </div>
</template>
```

---

## Usage in Card Components

Card components that are part of ApplicationSummary read loading state from the store.

### Example: ParticipantsCard

```vue
<script setup>
import { computed, watch, onMounted } from 'vue';
import { useApplicationStore } from '@/v3/composables/useApplicationStore';

const props = defineProps({
    appId: { type: [String, Number], required: true }
});

const { t } = useI18n();
const {
    payload,
    setStepError,
    deleteStepError,
    isLoadingKey,
    reloadPayloadData
} = useApplicationStore();

// Read from store payload
const participants = computed(() => payload.participants.value || []);

// Validation
const validationErrors = computed(() => {
    const errors = [];
    if (participants.value.length < 3) {
        errors.push(t('Minimum 3 participants required'));
    }
    if (participants.value.length > 5) {
        errors.push(t('Maximum 5 participants allowed'));
    }
    return errors;
});

// Sync validation with store
watch(
    validationErrors,
    (errors) => {
        if (errors.length > 0) {
            setStepError('participants', errors);
        } else {
            deleteStepError('participants');
        }
    },
    { immediate: true }
);

// Delete participant
async function handleDelete(participantId) {
    await deleteParticipant(participantId);
    await reloadPayloadData(props.appId);
}
</script>

<template>
    <Card>
        <template #title>Participants</template>
        <template #content>
            <!-- Loading state -->
            <div v-if="isLoadingKey('participants-fetching')">
                <Skeleton height="2rem" class="mb-2" />
                <Skeleton height="2rem" class="mb-2" />
                <Skeleton height="2rem" />
            </div>

            <!-- Content -->
            <div v-else>
                <div
                    v-for="participant in participants"
                    :key="participant.id"
                    class="participant-row"
                >
                    <span>{{ participant.name }}</span>
                    <Button
                        icon="pi pi-trash"
                        :loading="isLoadingKey(`participant-deleting-${participant.id}`)"
                        @click="handleDelete(participant.id)"
                    />
                </div>
            </div>
        </template>
    </Card>
</template>
```

---

## Global Loading Indicator

Use `isLoading` computed property to show a global loading indicator when ANY operation is active.

```vue
<script setup>
import { useLoading } from '@/v3/composables/useLoading';

const { isLoading } = useLoading();
</script>

<template>
    <!-- Global loading overlay -->
    <div v-if="isLoading" class="global-loading-overlay">
        <ProgressSpinner />
    </div>

    <!-- App content -->
    <router-view />
</template>

<style scoped>
.global-loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
}
</style>
```

---

## Fetch vs Mutation Detection

Use `isFetching` and `isMutating` to distinguish between read and write operations.

```vue
<script setup>
const { isFetching, isMutating } = useLoading();
</script>

<template>
    <!-- Show different messages based on operation type -->
    <Toast v-if="isFetching" severity="info">
        Loading data...
    </Toast>

    <Toast v-if="isMutating" severity="warn">
        Saving changes...
    </Toast>
</template>
```

**Detection Logic:**

- `isFetching`: Keys containing `fetch`, `load`, or `get`
- `isMutating`: Keys containing `creat`, `updat`, `delet`, or `submit`

---

## Common Patterns

### Pattern 1: Sequential Operations

```javascript
async function loadAllData() {
    // Load in sequence
    await withLoading('application', async () => {
        await loadApplication(appId);
    });

    await withLoading('event-fetching', async () => {
        await loadEvent(targetId);
    });

    await withLoading('participants-fetching', async () => {
        await loadParticipants(appId);
    });
}
```

### Pattern 2: Parallel Operations

```javascript
async function loadAllDataParallel() {
    await Promise.all([
        withLoading('event-fetching', () => loadEvent(targetId)),
        withLoading('team-fetching', () => loadTeam(appId)),
        withLoading('participants-fetching', () => loadParticipants(appId))
    ]);
}
```

### Pattern 3: Reload After Mutation

```javascript
async function deleteAndReload(id) {
    // Delete
    await withLoading(`item-deleting-${id}`, async () => {
        await apiDelete(`/api/items/${id}`);
    });

    // Reload list
    await withLoading('items-fetching', async () => {
        items.value = await apiGet('/api/items');
    });
}
```

### Pattern 4: Form Submission

```javascript
async function handleSubmit() {
    const success = await withLoading('form-submit', async () => {
        try {
            await apiPost('/api/items', formData.value);
            return true;
        } catch (error) {
            handleError(error);
            return false;
        }
    });

    if (success) {
        router.push({ name: 'items-index' });
    }
}
```

---

## Best Practices

### DO

1. Use descriptive key names following the convention
2. Use ID suffix for item-specific operations
3. Always use `withLoading` for async operations
4. Check loading state before allowing user actions

### DON'T

1. Don't create separate `ref(false)` for loading states
2. Don't use generic keys like `'loading'` or `'busy'`
3. Don't forget to handle errors inside `withLoading`
4. Don't mix manual `startLoading/stopLoading` with `withLoading`

---

## Migration from Manual Loading Refs

### Before (Old Pattern)

```javascript
const loading = ref(false);
const submitting = ref(false);

async function loadData() {
    loading.value = true;
    try {
        data.value = await apiGet('/api/data');
    } finally {
        loading.value = false;
    }
}

async function submit() {
    submitting.value = true;
    try {
        await apiPost('/api/submit', data.value);
    } finally {
        submitting.value = false;
    }
}
```

### After (useLoading Pattern)

```javascript
const { withLoading, isLoadingKey } = useLoading();

async function loadData() {
    data.value = await withLoading('data-fetching', async () => {
        return await apiGet('/api/data');
    });
}

async function submit() {
    await withLoading('form-submit', async () => {
        await apiPost('/api/submit', data.value);
    });
}

// In template: use isLoadingKey('data-fetching') and isLoadingKey('form-submit')
```

---

## Summary

| Scenario | Use |
|----------|-----|
| Any async operation | `withLoading(key, fn)` |
| Check specific operation | `isLoadingKey(key)` |
| Global loading indicator | `isLoading` |
| Distinguish read/write | `isFetching` / `isMutating` |
| With useApplicationStore | Import `isLoadingKey` from store |
| Standalone page | Import `useLoading` directly |

---

**Last Updated:** 2025-12-02  
**Maintained By:** Frontend Team
