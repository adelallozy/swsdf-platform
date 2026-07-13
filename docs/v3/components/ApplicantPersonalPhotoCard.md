# ApplicantPersonalPhotoCard Component Specification

**Version:** 1.0.0  
**Last Updated:** 2025-01-08  
**Component Path:** `src/v3/components/applications/cards/ApplicantPersonalPhotoCard.vue`

---

## Overview

The `ApplicantPersonalPhotoCard` component displays the applicant's personal photo with verification status indicator. It follows the zero-props architecture pattern, reading all data from the centralized `useApplicationStore`.

---

## Component Details

### Location
`src/v3/components/applications/cards/ApplicantPersonalPhotoCard.vue`

### Purpose
- Display applicant's personal photo with proper aspect ratio (100:125)
- Show photo verification status (Verified/Unverified)
- Provide edit link to photo upload page when application is modifiable
- Handle loading and empty states gracefully

### Dependencies
- **Vue 3 Composition API** - `ref`, `computed`, `onMounted`
- **useI18n** - Internationalization support
- **useApplicationStore** - Centralized application state management
- **useLoading** - Loading state management
- **PrimeVue** - ProgressSpinner component

---

## Props

**None** - This component follows the zero-props architecture pattern and reads all data from `useApplicationStore`.

---

## Data Sources

### From useApplicationStore

| Data | Source | Description |
|------|--------|-------------|
| `application` | `store.application.value` | Application metadata (id, stage, etc.) |
| `canModifyApplication` | `store.canModifyApplication.value` | Whether application can be edited |
| `user_profile_picture` | `store.payload.user_profile_picture.value` | Portrait data with link and status |

### Portrait Object Structure

```javascript
{
  link: "/storage/portraits/abc123.jpg",  // Relative path to image
  status: "verified" | "unverified" | "pending" | "approved"  // Verification status
}
```

---

## Computed Properties

### 1. `application`
```javascript
const application = computed(() => store.application.value);
```
- Returns the current application object
- Used for routing to edit page

### 2. `canModifyApplication`
```javascript
const canModifyApplication = computed(() => store.canModifyApplication.value);
```
- Returns `true` if application is in editable stage
- Controls visibility of edit link
- Editable applicant stages: `draft`, `applicant_revision`

### 3. `portrait`
```javascript
const portrait = computed(() => store.payload.user_profile_picture.value);
```
- Returns the portrait object from payload
- Contains `link` (image path) and `status` (verification status)

### 4. `imageUrl`
```javascript
const imageUrl = computed(() => {
  if (!portrait.value?.link) return '';
  return `${WEB_URL}${portrait.value.link}`;
});
```
- Constructs full image URL by combining base URL with relative path
- Returns empty string if no portrait link exists

### 5. `portraitStatus`
```javascript
const portraitStatus = computed(() => {
  if (store.payload.user_profile_picture.value) {
    const status = store.payload.user_profile_picture.value.status;
    const statusLower = String(status).toLowerCase();
    if (statusLower === 'verified' || statusLower === 'approved') {
      return 'active';
    }
    if (statusLower === 'unverified' || statusLower === 'pending') {
      return 'unverified';
    }
  }
  return null;
});
```
- Determines portrait verification status
- Returns `'active'` for verified/approved photos
- Returns `'unverified'` for unverified/pending photos
- Returns `null` if no status or portrait

### 6. `portraitStatusMessage`
```javascript
const portraitStatusMessage = computed(() => {
  const status = portraitStatus.value;
  if (status === 'unverified') {
    return t('Unverified');
  }
  if (status === 'active') {
    return t('Verified');
  }
  return null;
});
```
- Returns user-friendly status message
- Translated via `t()` function for Arabic support

### 7. `statusClass`
```javascript
const statusClass = computed(() => {
  const status = String(portraitStatus.value || '').toLowerCase();
  return status === 'active'
    ? 'tw-bg-emerald-50 tw-text-emerald-700'
    : 'tw-bg-amber-50 tw-text-amber-700';
});
```
- Returns Tailwind classes for status badge styling
- Green (emerald) for active/verified status
- Amber for unverified/pending status

### 8. `statusIcon`
```javascript
const statusIcon = computed(() => {
  const status = String(portraitStatus.value || '').toLowerCase();
  return status === 'active'
    ? 'pi pi-check-circle'
    : 'pi pi-clock';
});
```
- Returns PrimeVue icon class for status indicator
- Check circle for active/verified status
- Clock for unverified/pending status

### 9. `editRoute`
```javascript
const editRoute = computed(() => ({
  name: 'applicant-personal-photo-upload',
  params: { 
    appId: application.value?.id 
  }
}));
```
- Returns route object for photo upload page
- Includes application ID as parameter

---

## Template Structure

### 1. Header Section
```vue
<div class="tw-mb-2 tw-flex tw-items-center tw-justify-between">
  <div class="tw-flex tw-items-center tw-gap-2">
    <i class="pi pi-image tw-text-primary" aria-hidden="true"></i>
    <span class="tw-font-bold tw-text-slate-700 tw-text-xl">{{ t('Personal Picture') }}</span>
  </div>
  
  <!-- Status Badge (if status exists) -->
  <span v-if="portraitStatus" class="tw-px-2 tw-py-1 tw-rounded-full tw-text-xs tw-font-medium" :class="statusClass">
    <i :class="statusIcon" class="tw-mr-1" aria-hidden="true"></i>
    {{ portraitStatusMessage }}
  </span>
  
  <!-- Edit Link (if modifiable) -->
  <router-link
    v-if="canModifyApplication"
    :to="editRoute"
    class="tw-inline-flex tw-items-center tw-gap-2 tw-text-sm tw-font-medium tw-text-primary hover:tw-text-primary-dark"
  >
    <i class="pi pi-pencil" aria-hidden="true"></i>
    {{ t('Edit photo') }}
  </router-link>
</div>
```

### 2. Card Section
```vue
<section class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-p-6 tw-flex tw-justify-center">
  <!-- Loading State -->
  <div v-if="isLoadingKey('user_profile_picture')" class="tw-py-8">
    <ProgressSpinner style="width: 40px; height: 40px" />
  </div>

  <!-- Photo Display -->
  <div v-else-if="portrait?.link" class="tw-relative">
    <img
      :src="imageUrl"
      :alt="t('Personal Picture')"
      class="tw-w-48 tw-h-60 tw-object-cover tw-rounded-lg tw-shadow-md"
    />
  </div>

  <!-- Empty State -->
  <div v-else class="tw-text-center tw-py-8 tw-text-slate-400">
    <i class="pi pi-image tw-text-4xl tw-mb-2" aria-hidden="true"></i>
    <p>{{ t('No photo uploaded') }}</p>
  </div>
</section>
```

---

## States

### 1. Loading State
- **Triggered When:** `isLoadingKey('user_profile_picture')` returns `true`
- **Visual:** ProgressSpinner centered in card
- **User Experience:** Shows loading indicator while portrait data is being fetched

### 2. Photo Display State
- **Triggered When:** `portrait?.link` exists
- **Visual:** Image displayed with 192px width × 240px height (100:125 aspect ratio)
- **Features:**
  - Rounded corners (`tw-rounded-lg`)
  - Shadow effect (`tw-shadow-md`)
  - Object cover for proper scaling
  - Status badge in header (if status exists)

### 3. Empty State
- **Triggered When:** No portrait link exists
- **Visual:** Icon and text message centered in card
- **Message:** "No photo uploaded" (translated)

---

## Status Display

### Status Types

| Status | Badge Color | Icon | Meaning |
|--------|-------------|------|---------|
| `verified` / `approved` | Green (emerald) | Check circle | Photo has been verified |
| `unverified` / `pending` | Amber | Clock | Photo is awaiting verification |
| `null` / other | None | None | No status or unknown |

### Status Badge Design
- **Size:** Extra small text (`tw-text-xs`)
- **Padding:** `tw-px-2 tw-py-1`
- **Shape:** Full rounded pill (`tw-rounded-full`)
- **Font:** Medium weight (`tw-font-medium`)
- **Icon:** Positioned with margin right (`tw-mr-1`)

---

## Loading Management

### Loading Keys
This component uses the `user_profile_picture` loading key from `useLoading`:

```javascript
const { isLoadingKey } = useLoading();

// Check loading state
if (isLoadingKey('user_profile_picture')) {
  // Show loading spinner
}
```

### Loading Source
The loading state is set by:
- `useApplicationStore.loadEntity('portrait', forceReload)` - When loading portrait entity
- `useApplicationStore.loadApplication(appId, { payloadKeys: ['user_profile_picture'] })` - When loading with application

---

## Translation Keys

The following translation keys are used (English → Arabic):

| English Key | Context |
|-------------|---------|
| `Personal Picture` | Card title |
| `Edit photo` | Edit link text |
| `No photo uploaded` | Empty state message |
| `Verified` | Status badge for verified photos |
| `Unverified` | Status badge for unverified photos |

**Note:** According to the translation guide, English text is hardcoded in the component. Only Arabic translations need to be added to `src/locales/ar.json`.

---

## Usage Example

### In ApplicationSummary.vue

```vue
<template>
  <div class="tw-space-y-6">
    <!-- Other cards -->
    
    <ApplicantPersonalPhotoCard />
    
    <!-- More cards -->
  </div>
</template>

<script setup>
import ApplicantPersonalPhotoCard from '@/v3/components/applications/cards/ApplicantPersonalPhotoCard.vue';
</script>
```

### In Other Summary Pages

```vue
<template>
  <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-6">
    <ApplicantPersonalPhotoCard />
    <OtherCard />
  </div>
</template>
```

---

## Integration with useApplicationStore

### Payload Loading Pattern

The component expects `user_profile_picture` to be loaded via:

```javascript
// Option 1: Load with application
await store.loadApplication(appId, {
  withPayload: true,
  payloadKeys: ['user_profile_picture']
});

// Option 2: Load separately
await store.loadEntity('portrait', true);
```

### Payload Mapping

The backend returns `user_profile_picture` which maps to:
```javascript
payload.user_profile_picture.value
```

---

## Styling

### Tailwind Classes Used

| Purpose | Classes |
|---------|---------|
| Container | `tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-p-6 tw-flex tw-justify-center` |
| Image | `tw-w-48 tw-h-60 tw-object-cover tw-rounded-lg tw-shadow-md` |
| Header | `tw-mb-2 tw-flex tw-items-center tw-justify-between` |
| Title | `tw-font-bold tw-text-slate-700 tw-text-xl` |
| Status Badge (Active) | `tw-bg-emerald-50 tw-text-emerald-700` |
| Status Badge (Unverified) | `tw-bg-amber-50 tw-text-amber-700` |

### Design System Compliance

- **Card Pattern:** Follows `docs/v3/style/cards.md`
- **Tailwind Prefix:** All classes use `tw-` prefix
- **RTL Support:** Compatible with RTL layouts
- **Accessibility:** Includes `aria-hidden="true"` for decorative icons

---

## Accessibility

### ARIA Attributes
- `aria-hidden="true"` on decorative icons (image icon, status icon, pencil icon)
- `:alt` attribute on image with translated text

### Keyboard Navigation
- Edit link is focusable via keyboard
- Proper tab order maintained

---

## Browser Support

- Modern browsers with ES6+ support
- Requires Vue 3 Composition API support
- PrimeVue components compatibility

---

## Testing Considerations

### Unit Tests
- Test computed properties with different portrait statuses
- Test loading state rendering
- Test empty state rendering
- Test edit link visibility based on `canModifyApplication`

### Integration Tests
- Test component with actual store data
- Test navigation to edit page
- Test status badge display with different statuses
- Test image URL construction

### Visual Tests
- Verify photo aspect ratio (100:125)
- Verify status badge colors and icons
- Verify responsive layout
- Verify RTL layout

---

## Related Components

- [`ApplicantPersonalPhotoUpload.vue`](../pages/ApplicantPersonalPhotoUpload.md) - Photo upload page
- [`ApplicantProfileCard.vue`](../../../src/v3/components/applications/cards/ApplicantProfileCard.vue) - Similar status display pattern
- [`PhotoInput.vue`](./PhotoInput.md) - Photo input component for forms

---

## Related Documentation

- [Cards Style Guide](../style/cards.md) - Card component styling patterns
- [Payload System](../reference/payload-system.md) - Unified payload loading system
- [useApplicationStore](../composables/useApplicationStore.md) - Store documentation
- [Translation Guide](../guides/translation-guide.md) - i18n best practices

---

## Changelog

### Version 1.0.0 (2025-01-08)
- Initial component specification
- Added status indicator (verified/unverified)
- Documented zero-props architecture
- Documented loading states and data sources
