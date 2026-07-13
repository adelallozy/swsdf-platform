# ApplicantPersonalPhotoUpload Page Specification

**Version:** 1.0.3  
**Last Updated:** 2026-01-27  
**Component Path:** `src/v3/pages/applications/ApplicantPersonalPhotoUpload.vue`

---

## Overview

The `ApplicantPersonalPhotoUpload` page allows applicants to upload and crop their personal photo. It integrates with the application store for state management and uses MasterForm with PhotoInput component for the upload interface.

**Important behavior:** The user must crop the selected image to the required aspect ratio before the file is produced and uploaded. The uploaded file is the **cropped output** (resized to the configured canvas size and exported as WebP), so validating the *original* image dimensions/size is not meaningful for this flow.

---

## Component Details

### Location
`src/v3/pages/applications/ApplicantPersonalPhotoUpload.vue`

### Purpose
- Provide a user-friendly interface for uploading personal photos
- Force photo cropping with aspect ratio constraints (100:125) before upload
- Produce a cropped/resized output file (512×640) for upload
- Validate that a photo exists (required field); backend performs final validation
- Submit photo to backend API
- Navigate back to application summary on success
- Handle various error states (validation, 404, 500)

### Dependencies
- **Vue 3 Composition API** - `ref`, `computed`, `onMounted`, `watch`
- **Vue Router** - `useRoute`, `useRouter`
- **useI18n** - Internationalization support
- **useApplicationStore** - Centralized application state management
- **useNotification** - Success/error notifications
- **useErrorHandler** - Error tracking and reporting
- **usePageHeading** - Page heading management
- **MasterForm** - Dynamic form component
- **PhotoInput** - Custom photo upload with cropping
- **Valibot** - Schema validation (`custom` validator)

---

## Props

**None** - This is a page component that receives data from route params and store.

---

## Route Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `appId` | number | Application ID (from `route.params.appId` or `route.params.id`) |

---

## Data Sources

### From useApplicationStore

| Data | Source | Description |
|------|--------|-------------|
| `application` | `store.application.value` | Application metadata |
| `canModifyApplication` | `store.canModifyApplication.value` | Whether application can be edited |
| `user_profile_picture` | `store.payload.user_profile_picture.value` | Existing portrait data |

### Environment Variables

| Variable | Purpose |
|----------|---------|
| `VITE_PROFESSIONAL_DIVERS_UPDATE_APPLICANT_PORTRAIT` | API endpoint for updating portrait |
| `VITE_WEB_BASE_URL` | Base URL for constructing image URLs |

---

## State Management

### Reactive State

```javascript
const schema = ref(buildSchema());           // Form schema
const mfRef = ref(null);                     // MasterForm reference
const formIsValid = ref(false);               // Form validation state
const saving = ref(false);                    // Upload in progress
const initializing = ref(true);               // Page initialization state
```

### Computed Properties

```javascript
const application = computed(() => store.application.value);
const canModifyApplication = computed(() => store.canModifyApplication.value);
const canSubmit = computed(() => formIsValid.value && canModifyApplication.value);
const backRoute = computed(() => ({
  name: 'app-summary',
  params: { appId, locale: locale.value }
}));
```

---

## Form Schema

### Schema Structure

```javascript
function buildSchema() {
  return {
    photo: {
      type: 'PhotoInput',
      label: t('Personal photo'),
      placeholder: t('Drop files here or click to upload'),
      value: null,
      required: true,
      attrs: {
        accept: 'image/png,image/webp,image/jpeg,image/jpg',
        aspectRatio: 100 / 125,
        canvasSize: { width: 512, height: 640 },
        previewSize: { width: 240, height: 300 }
      },
      validation: custom(
        (value) => value instanceof File,
        t('Photo is required')
      )
    }
  };
}
```

### Photo Requirements

| Requirement | Value |
|-------------|-------|
| **Aspect Ratio** | 100:125 (4:5) |
| **Output (Canvas) Size** | 512×640 pixels |
| **Output Format** | WebP (`image/webp`) |
| **Preview Size** | 240×300 pixels |
| **Accepted Formats** | PNG, WebP, JPEG, JPG |

### Photo Guidelines

The component displays the following guidelines to users:

1. Facial features are fully visible from the front.
2. Use a white background with even lighting.
3. Avoid filters, hats, or sunglasses.

---

## Lifecycle Hooks

### onMounted

```javascript
onMounted(async () => {
  setHeading({
    title: t('Upload personal photo'),
    visible: true
  });

  if (!appId) {
    notifyError(t('Application ID is missing'));
    router.replace({
      name: 'applications-index',
      params: { locale: route.params.locale || locale.value }
    });
    initializing.value = false;
    return;
  }

  try {
    await store.loadApplication(appId, {
      withPayload: true,
      payloadKeys: ['user_profile_picture']
    });

    if (!application.value) {
      router.replace({ name: 'error-404' });
      return;
    }

    if (!canModifyApplication.value) {
      notifyError(t('Application cannot be modified'));
      router.push(backRoute.value);
      return;
    }
  } catch (err) {
    capture(err, {
      context: 'ApplicationPhotoUpload.onMounted',
      fallback: 'Failed to load application',
      meta: { appId }
    });
    notifyError(t('Failed to load application'));
    router.replace({
      name: 'applications-index',
      params: { locale: route.params.locale || locale.value }
    });
    return;
  } finally {
    initializing.value = false;
  }
});
```

### Initialization Flow

1. Set page heading
2. Validate `appId` exists
3. Load application with `user_profile_picture` payload
4. Check if application exists
5. Check if application is modifiable
6. Handle errors appropriately

---

## Methods

### buildSchema()
```javascript
function buildSchema() {
  return {
    photo: {
      type: 'PhotoInput',
      label: t('Personal photo'),
      placeholder: t('Drop files here or click to upload'),
      value: null,
      required: true,
      attrs: {
        accept: 'image/png,image/webp,image/jpeg,image/jpg',
        aspectRatio: 100 / 125,
        canvasSize: { width: 512, height: 640 },
        previewSize: { width: 240, height: 300 }
      },
      validation: custom(
        (value) => value instanceof File,
        t('Photo is required')
      )
    }
  };
}
```
- Builds form schema dynamically
- Uses current locale for translations
- Returns schema object for MasterForm

### onValidity({ isValid })
```javascript
function onValidity({ isValid }) {
  formIsValid.value = isValid;
}
```
- Called by MasterForm when form validity changes
- Updates `formIsValid` reactive state

### submitProgrammatically()
```javascript
function submitProgrammatically() {
  if (saving.value) return;
  const ok = mfRef.value?.validateForm?.();
  if (!ok) {
    mfRef.value?.showErrors?.();
    return;
  }
  mfRef.value?.submitForm?.();
}
```
- Triggers form submission programmatically
- Validates form before submission
- Shows errors if validation fails

### onSubmit({ formData })
```javascript
async function onSubmit({ formData }) {
  if (saving.value || !appId) return;
  if (!formData?.photo) {
    notifyError(t('Photo is required'));
    return;
  }

  if (!UPDATE_PORTRAIT_URL) {
    capture(new Error('Missing applicant portrait endpoint'), {
      context: 'ApplicationPhotoUpload.submit',
      fallback: 'Upload endpoint missing',
      meta: { appId }
    });
    notifyError(t('Upload service is temporarily unavailable'));
    return;
  }

  const endpoint = `${UPDATE_PORTRAIT_URL}${appId}`;
  const payload = new FormData();
  payload.append('portrait_file', formData.photo);

  try {
    saving.value = true;
    await apiPost(endpoint, payload);

    // Refresh portrait entity if configured
    try {
      await store.loadEntity('portrait', true);
    } catch (_) {
      // Ignore if portrait entity not configured for this application
    }

    notifySuccess(t('Photo uploaded successfully'));
    router.push(backRoute.value);
  } catch (e) {
    if (e?.name === ERROR_TYPES.VALIDATION || e?.status === 422) {
      const errors = { ...(e.validationErrors || e.payload?.errors || {}) };
      if (errors.portrait_file && !errors.photo) {
        errors.photo = errors.portrait_file;
      }
      mfRef.value?.applyServerErrors?.(errors);
      return;
    }

    if (e?.status === 404) {
      router.replace({ name: 'error-404' });
      return;
    }

    if (e?.status >= 500) {
      router.replace({ name: 'server-error' });
      return;
    }

    capture(e, {
      context: 'ApplicationPhotoUpload.submit',
      fallback: 'Failed to upload applicant photo',
      meta: { appId, originalError: e?.message }
    });
    notifyError(t('Failed to upload photo'));
  } finally {
    saving.value = false;
  }
}
```
- Handles photo upload submission
- Validates photo exists
- Constructs FormData with portrait_file
- Sends POST request to backend
- Handles various error scenarios
- Refreshes portrait entity on success
- Navigates to summary page on success

---

## Error Handling

### Error Scenarios

| Error Type | Status Code | Handling |
|------------|-------------|----------|
| **Missing appId** | N/A | Redirect to applications list with error toast |
| **Application not found** | 404 | Redirect to 404 error page |
| **Application not modifiable** | N/A | Redirect to summary with error toast |
| **Validation error** | 422 | Apply server errors to form |
| **Not found** | 404 | Redirect to 404 error page |
| **Server error** | 500+ | Redirect to server error page |
| **Missing endpoint** | N/A | Show error toast, capture error |
| **Generic error** | Other | Capture error, show error toast |

### Error Notification Pattern

```javascript
// Success notification
notifySuccess(t('Photo uploaded successfully'));

// Error notifications
notifyError(t('Photo is required'));
notifyError(t('Application ID is missing'));
notifyError(t('Application cannot be modified'));
notifyError(t('Failed to load application'));
notifyError(t('Upload service is temporarily unavailable'));
notifyError(t('Failed to upload photo'));
```

---

## Template Structure

### 1. Page Container
```vue
<div class="tw-pt-10 tw-pb-24 tw-px-4">
  <section class="tw-max-w-3xl tw-mx-auto tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-[0_8px_30px_rgba(3,87,150,.06)] tw-p-4 sm:tw-p-6 md:tw-p-8">
    <!-- Content -->
  </section>
</div>
```

### 2. Page Title
```vue
<div class="tw-mb-6">
  <h1 class="tw-text-2xl tw-font-bold tw-text-slate-800">
    {{ t('Upload personal photo') }}
  </h1>
  <p class="tw-text-sm tw-text-slate-600 tw-mt-1">
    {{ t('Your photo will be used on membership cards and application documents') }}
  </p>
</div>
```

### 3. Guidelines Section
```vue
<div class="tw-mb-6 tw-rounded-xl tw-border tw-border-amber-200 tw-bg-amber-50 tw-p-4">
  <div class="tw-flex tw-items-start tw-gap-3">
    <i class="pi pi-camera tw-text-amber-600 tw-mt-0.5" aria-hidden="true"></i>
    <div>
      <p class="tw-text-amber-900 tw-font-semibold">
        {{ t('Photo requirements') }}
      </p>
      <ul class="tw-mt-2 tw-space-y-1 tw-text-sm tw-text-amber-900 tw-ps-5 tw-list-disc">
        <li v-for="tip in photoGuidelines" :key="tip">
          {{ t(tip) }}
        </li>
      </ul>
    </div>
  </div>
</div>
```

### 4. Loading State
```vue
<div v-if="initializing" class="tw-text-center tw-py-10">
  <ProgressSpinner style="width: 48px; height: 48px" />
  <p class="tw-text-sm tw-text-slate-500 tw-mt-3">
    {{ t('Loading application...') }}
  </p>
</div>
```

### 5. Form Section
```vue
<div v-else>
  <MasterForm
    ref="mfRef"
    :schema="schema"
    @submit="onSubmit"
    @validity="onValidity"
  />

  <div class="tw-mt-6 tw-flex tw-justify-end tw-gap-4 tw-items-center">
    <router-link
      :to="backRoute"
      class="tw-inline-flex tw-items-center tw-gap-2 tw-text-slate-600 hover:tw-text-slate-900 tw-transition tw-font-medium"
    >
      <i class="pi pi-arrow-left" aria-hidden="true"></i>
      <span>{{ t('Cancel') }}</span>
    </router-link>

    <AppButton
      variant="primary"
      icon="pi pi-upload"
      :disabled="saving || !canSubmit"
      @click="submitProgrammatically"
    >
      <span v-if="!saving">{{ t('Upload photo') }}</span>
      <span v-else class="tw-inline-flex tw-items-center tw-gap-2">
        <span class="lds-dual-ring"></span>{{ t('Common.Saving') }}
      </span>
    </AppButton>
  </div>
</div>
```

---

## Loading States

### 1. Initialization State
- **Trigger:** `initializing.value = true`
- **Duration:** From component mount until application loads
- **Visual:** ProgressSpinner with "Loading application..." text

### 2. Saving State
- **Trigger:** `saving.value = true` during API call
- **Duration:** From submit start until API response
- **Visual:** Button shows loading spinner and "Saving..." text
- **Effect:** Button disabled, prevents double submission

---

## Navigation

### Back Route
```javascript
const backRoute = computed(() => ({
  name: 'app-summary',
  params: { appId, locale: locale.value }
}));
```
- Navigates to application summary page
- Preserves application ID and locale

### Edit Route (from Card)
```javascript
const editRoute = computed(() => ({
  name: 'applicant-personal-photo-upload',
  params: { 
    appId: application.value?.id 
  }
}));
```
- Route name defined in router configuration
- Used by ApplicantPersonalPhotoCard to navigate to upload page

---

## Translation Keys

The following translation keys are used (English → Arabic):

| English Key | Context |
|-------------|---------|
| `Upload personal photo` | Page title |
| `Your photo will be used on membership cards and application documents` | Page subtitle |
| `Photo requirements` | Guidelines section title |
| `Facial features are fully visible from the front.` | Guideline 1 |
| `Use a white background with even lighting.` | Guideline 2 |
| `Avoid filters, hats, or sunglasses.` | Guideline 3 |
| `Loading application...` | Initialization loading text |
| `Personal photo` | Form field label |
| `Drop files here or click to upload` | Form field placeholder |
| `Photo is required` | Validation error |
| `Upload photo` | Submit button text |
| `Cancel` | Cancel button text |
| `Saving` | Saving button text |
| `Photo uploaded successfully` | Success notification |
| `Application ID is missing` | Error notification |
| `Application cannot be modified` | Error notification |
| `Failed to load application` | Error notification |
| `Upload service is temporarily unavailable` | Error notification |
| `Failed to upload photo` | Error notification |

**Note:** According to translation guide, English text is hardcoded in component. Only Arabic translations need to be added to `src/locales/ar.json`.

---

## API Integration

### Upload Endpoint

**URL:** `{VITE_PROFESSIONAL_DIVERS_UPDATE_APPLICANT_PORTRAIT}{appId}`

**Method:** `POST`

**Content-Type:** `multipart/form-data`

**Request Body:**
```javascript
const payload = new FormData();
payload.append('portrait_file', formData.photo);
```

**Success Response:**
- HTTP 200 OK
- Portrait uploaded successfully

**Error Responses:**
- **422 Validation Error:** Invalid file format, size, or validation errors
- **404 Not Found:** Application or endpoint not found
- **500+ Server Error:** Internal server error

### Portrait Refresh

After successful upload, the component attempts to refresh the portrait entity:

```javascript
try {
  await store.loadEntity('portrait', true);
} catch (_) {
  // Ignore if portrait entity not configured for this application
}
```

This ensures that `ApplicantPersonalPhotoCard` displays the updated photo immediately.

---

## Integration with useApplicationStore

### Payload Loading Pattern

The component loads `user_profile_picture` with the application:

```javascript
await store.loadApplication(appId, {
  withPayload: true,
  payloadKeys: ['user_profile_picture']
});
```

This follows the same pattern as `UserProfileUpsert.vue` for consistency.

### Payload Refresh Pattern

After successful upload, the component refreshes the portrait entity:

```javascript
await store.loadEntity('portrait', true);
```

This ensures that the updated photo is immediately available in the store.

---

## Styling

### Tailwind Classes Used

| Purpose | Classes |
|---------|---------|
| Page Container | `tw-pt-10 tw-pb-24 tw-px-4` |
| Card Container | `tw-max-w-3xl tw-mx-auto tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-[0_8px_30px_rgba(3,87,150,.06)] tw-p-4 sm:tw-p-6 md:tw-p-8` |
| Title | `tw-text-2xl tw-font-bold tw-text-slate-800` |
| Subtitle | `tw-text-sm tw-text-slate-600 tw-mt-1` |
| Guidelines Box | `tw-mb-6 tw-rounded-xl tw-border tw-border-amber-200 tw-bg-amber-50 tw-p-4` |
| Guidelines Title | `tw-text-amber-900 tw-font-semibold` |
| Guidelines List | `tw-mt-2 tw-space-y-1 tw-text-sm tw-text-amber-900 tw-ps-5 tw-list-disc` |
| Button Container | `tw-mt-6 tw-flex tw-justify-end tw-gap-4 tw-items-center` |

### Design System Compliance

- **Tailwind Prefix:** All classes use `tw-` prefix
- **RTL Support:** Compatible with RTL layouts
- **Responsive:** Uses responsive breakpoints (`sm:`, `md:`)
- **Accessibility:** Includes `aria-hidden="true"` for decorative icons

---

## Accessibility

### ARIA Attributes
- `aria-hidden="true"` on decorative icons

### Keyboard Navigation
- Cancel link is focusable via keyboard
- Submit button is focusable via keyboard
- Proper tab order maintained

### Focus Management
- Form fields receive focus appropriately
- Error messages are announced to screen readers

---

## Browser Support

- Modern browsers with ES6+ support
- Requires Vue 3 Composition API support
- Requires FileReader API for image preview
- Requires FormData API for file upload

---

## Testing Considerations

### Unit Tests
- Test schema building with different locales
- Test computed properties (canSubmit, backRoute)
- Test form validation logic
- Test error handling for various scenarios

### Integration Tests
- Test application loading with payload
- Test photo upload flow
- Test navigation after successful upload
- Test error handling and notifications
- Test portrait refresh after upload

### E2E Tests
- Test complete upload flow from summary to upload page
- Test photo cropping functionality
- Test form validation errors
- Test success notification and navigation
- Test error scenarios (404, 500, validation)

### Visual Tests
- Verify responsive layout on different screen sizes
- Verify RTL layout
- Verify loading states
- Verify error message display

---

## Security Considerations

### File Validation
- Accept only specific image formats (PNG, WebP, JPEG, JPG)
- The uploaded file is always generated from the cropper canvas (512×640), so the original selection size/dimensions are not validated here
- No client-side size validation is required because the output is always a fixed-size canvas image
- Server-side validation required (client-side can be bypassed)

### CSRF Protection
- Ensure backend validates CSRF tokens
- Use secure HTTP headers

### File Storage
- Backend should validate file contents (not just extension)
- Backend should sanitize file names
- Backend should store files in secure location

---

## Performance Considerations

### Image Processing
- PhotoInput component handles cropping on client side
- Canvas size limited to 512×640 pixels
- Preview size limited to 240×300 pixels

### API Calls
- Single API call for photo upload
- Optional portrait refresh after upload
- Application loaded with specific payload key only

### Bundle Size
- MasterForm component lazy-loaded
- PhotoInput component lazy-loaded
- No unnecessary dependencies

---

## Related Components

- [`ApplicantPersonalPhotoCard`](../components/ApplicantPersonalPhotoCard.md) - Photo display card
- [`PhotoInput`](../components/PhotoInput.md) - Photo upload with cropping component
- [`MasterForm`](../guides/masterform-guide.md) - Dynamic form component
- [`UserProfileUpsert`](../../../src/v3/pages/applications/UserProfileUpsert.vue) - Similar payload loading pattern

---

## Related Documentation

- [Payload System](../reference/payload-system.md) - Unified payload loading system
- [useApplicationStore](../composables/useApplicationStore.md) - Store documentation
- [Translation Guide](../guides/translation-guide.md) - i18n best practices
- [Global Guide](../guides/global-guide.md) - Project-wide conventions

---

## Changelog

### Version 1.0.3 (2026-01-27)
- Documented that the cropped output is exported as WebP

### Version 1.0.2 (2026-01-27)
- Removed max file size configuration (crop output is fixed-size)

### Version 1.0.1 (2026-01-27)
- Clarified crop-first behavior (uploaded file is the cropped output)
- Documented that max size applies to the cropped output file

### Version 1.0.0 (2025-01-08)
- Initial component specification
- Documented payload loading pattern
- Documented error handling scenarios
- Documented integration with useApplicationStore
