# MasterForm Component Guide

## Overview

MasterForm is a dynamic, schema-driven form component that handles validation, error display, and form submission. This guide provides professional notes on usage patterns, best practices, and common pitfalls.

**Note:** This is a usage guide, not component implementation. For full component code, refer to [`src/v3/components/Forms/MasterForm.vue`](../../../src/v3/components/Forms/MasterForm.vue).

**Related Guides:**
- [Translation Guide](./translation-guide.md) - i18n best practices for forms
- [Schema Building Guide](./schema-building-guide.md) - schema structure and field patterns
- [Forms Index](../reference/forms-index.md) - form examples and related components

**Source of truth:** This guide is the canonical reference for MasterForm usage and schema building in v3. Other docs should link here instead of duplicating guidance.

---

## Table of Contents

1. [Component Overview](#component-overview)
2. [Basic Usage](#basic-usage)
3. [Schema Definition](#schema-definition)
4. [Validation](#validation)
5. [Type Handling](#type-handling)
6. [Error Handling](#error-handling)
7. [Common Patterns](#common-patterns)
8. [Common Pitfalls](#common-pitfalls)
9. [Best Practices](#best-practices)

---

## Component Overview

### Purpose

MasterForm provides:
- Schema-driven form rendering
- Real-time validation with Valibot
- Error summary display
- Server error integration (422)
- Dynamic field loading
- Accessibility support
- i18n support

### Key Features

- **Dynamic Fields:** Supports text, email, password, number, textarea, select, multiselect, autocomplete, DatePicker, file, PhotoInput, radioTiles, TagsInput
- **Validation:** Real-time field validation with Valibot schemas
- **Error Display:** Field-level errors + summary message
- **Server Errors:** Automatic integration with 422 validation responses
- **Lazy Loading:** Field components loaded on demand
- **Accessibility:** ARIA labels, keyboard navigation, screen reader support

### Data Model & Reactivity

MasterForm copies `schema` once on mount and keeps current user input in `formData`.
- `schema[key].value` is the **initial** value only.
- `formOptions` overrides `schema.options` and is reactive.
- `initialValues` updates `formData` for existing fields.
- Changing `schema` after mount does **not** update rendered fields; remount the form (e.g., change `:key`) for structural changes.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `schema` | `Object` | Yes | Static form schema defining fields and initial values (read once on mount) |
| `formOptions` | `Object` | No | Dynamic options for select/multiselect fields; overrides `schema.options` (Reactive) |
| `initialValues` | `Object` | No | Initial data to populate the form; deep-watched and applied to existing fields (Reactive) |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `submit` | `{ formData: Object }` | Emitted when form submitted and valid |
| `validity` | `{ isValid: boolean, errors: Object }` | Emitted on validation state change |
| `field-change` | `{ key: String, value: Any }` | Emitted when a field value changes (for cascading logic) |

### Exposed Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `submitForm` | `()` | Trigger form submission |
| `validateForm` | `()` | Validate all fields, returns boolean |
| `getFormData` | `()` | Get current form data snapshot |
| `setFieldValue` | `(key: string, value: any)` | Update a field programmatically |
| `getErrors` | `()` | Get current validation errors |
| `applyServerErrors` | `(errors: Object)` | Apply server validation errors (422) |
| `showErrors` | `()` | Show error summary |
| `hideErrors` | `()` | Hide error summary |

---

## Basic Usage

### Minimal Example

```vue
<template>
  <MasterForm
    ref="formRef"
    :schema="formSchema"
    :initialValues="initialData"
    @submit="handleSubmit"
    @validity="handleValidity"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { pipe, string, minLength } from 'valibot'
import MasterForm from '@/v3/components/Forms/MasterForm.vue'

const formRef = ref(null)
const isFormValid = ref(false)
const initialData = ref({})

// 1. Static Schema (Structure)
const formSchema = {
  name: {
    type: 'text',
    label: 'Name',
    value: '', // Default value
    required: true,
    validation: pipe(
      string('Name is required'),
      minLength(1, 'Name is required')
    )
  }
}

// 2. Load Data (Initial Values)
onMounted(async () => {
  // Simulate API call
  initialData.value = { name: 'John Doe' }
})

function handleValidity({ isValid }) {
  isFormValid.value = isValid
}

function handleSubmit({ formData }) {
  console.log('Form submitted:', formData)
}

function submitForm() {
  if (formRef.value) {
    formRef.value.submitForm()
  }
}
</script>
```

### With Submit Button

```vue
<template>
  <div>
    <MasterForm
      ref="formRef"
      :schema="formSchema"
      @submit="handleSubmit"
    />

    <div class="tw-flex tw-gap-2 tw-mt-4">
      <button
        @click="submitForm"
        :disabled="!isFormValid || isSubmitting"
        class="tw-px-4 tw-py-2 tw-bg-primary tw-text-white tw-rounded-lg"
      >
        Submit
      </button>
      <button
        @click="resetForm"
        class="tw-px-4 tw-py-2 tw-bg-gray-200 tw-text-gray-700 tw-rounded-lg"
      >
        Cancel
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import MasterForm from '@/v3/components/Forms/MasterForm.vue'

const formRef = ref(null)
const isFormValid = ref(false)
const isSubmitting = ref(false)

const formSchema = { /* ... */ }

function handleValidity({ isValid }) {
  isFormValid.value = isValid
}

function submitForm() {
  if (formRef.value) {
    formRef.value.submitForm()
  }
}

async function handleSubmit({ formData }) {
  try {
    isSubmitting.value = true
    await saveData(formData)
  } catch (err) {
    if (err.status === 422 && formRef.value) {
      formRef.value.applyServerErrors(err.errors)
    }
  } finally {
    isSubmitting.value = false
  }
}

function resetForm() {
  // Reset via MasterForm API (schema values are initial only)
  Object.keys(formSchema).forEach(key => {
    formRef.value?.setFieldValue(key, formSchema[key].value ?? null)
  })
  formRef.value?.hideErrors()
}
</script>
```

---

## Schema Definition

### Schema Structure

```javascript
const formSchema = {
  fieldName: {
    type: 'text',              // Field type
    label: 'Field Label',      // Display label (translatable)
    placeholder: 'Enter value', // Placeholder text (translatable)
    value: '',                 // Initial value
    required: true,            // Show asterisk indicator
    options: [],               // Options for select/multiselect
    attrs: {},                 // Additional component attributes
    validation: pipe(...)      // Valibot validation schema
  }
}
```

### Schema Properties Reference

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | String | Yes | Field type (text, email, password, number, select, multiselect, autocomplete, DatePicker, file, PhotoInput, radioTiles, TagsInput, textarea) |
| `label` | String | Yes | Field label (translatable key) |
| `placeholder` | String | No | Placeholder text (translatable key) |
| `value` | Any | Yes | Initial field value |
| `required` | Boolean | No | Show asterisk indicator (default: false) |
| `options` | Array | No | Options for select, multiselect, autocomplete, radioTiles, and any custom field that consumes options |
| `attrs` | Object | No | Additional component attributes |
| `validation` | ValibotSchema | No | Validation schema |

**Translation behavior:**
- `label`, `placeholder`, and validation messages are treated as i18n keys.
- `attrs.placeholder` is also translated (when present).
- If a key is missing in the locale file, the raw string is rendered.

### Field Types

#### Text Input
```javascript
{
  type: 'text',
  label: 'Name',
  value: '',
  required: true,
  validation: pipe(string(), minLength(1))
}
```

#### Email Input
```javascript
{
  type: 'email',
  label: 'Email',
  value: '',
  validation: pipe(string(), email('Invalid email'))
}
```

#### Textarea
```javascript
{
  type: 'textarea',
  label: 'Description',
  value: '',
  attrs: { rows: 4, maxlength: 1000 },
  validation: pipe(string(), maxLength(1000))
}
```

#### Select Dropdown
```javascript
{
  type: 'select',
  label: 'Region',
  value: null,
  options: [
    { id: 1, name: 'Riyadh' },
    { id: 2, name: 'Jeddah' }
  ],
  validation: pipe(string(), picklist(['1', '2'])),
  attrs: {
    optionLabel: 'name',
    optionValue: 'id',
    filter: true
  }
}
// Note: Options can also be passed via the `formOptions` prop
```

**Notes:**
- MasterForm resolves options shaped as `{ label, value }` or `{ name, id }` automatically.
- If your option shape is different, set `attrs.optionLabel` and `attrs.optionValue` or map to `{ label, value }`.
- `formOptions` overrides `schema.options` at runtime.

#### Multiselect
```javascript
{
  type: 'multiselect',
  label: 'Skills',
  value: [],
  options: ['Skill 1', 'Skill 2'],
  validation: pipe(
    custom((v) => Array.isArray(v)),
    custom((v) => v.length > 0, 'Select at least one skill')
  )
}
```

#### DatePicker
```javascript
{
  type: 'DatePicker',
  label: 'Birthdate',
  value: '', // Model value is YYYY-MM-DD or empty string
  validation: pipe(
    string('Birthdate is required'),
    minLength(1, 'Birthdate is required'),
    maxLength(10, 'Birthdate must be valid date')
  ),
  attrs: {
    placeholder: 'DD-MM-YYYY',
    minDate: new Date('1900-01-01'),
    maxDate: new Date()
  },
  placeholder: 'DD-MM-YYYY',
  required: true
}
```

**Important Notes:**
- Use `type: 'DatePicker'` (NOT `'date'`)
- Initialize `value` as empty string `''` (NOT `null`)
- **Model value format:** `YYYY-MM-DD` (stored in `formData`)
- **Input display format:** `dd-mm-yy` in the UI; manual input expects `DD-MM-YYYY`
- Manual input requires a full 4-digit year; no auto-complete
- Validation should use `string()` with `minLength(1)` and `maxLength(10)`; add regex if you need strict `YYYY-MM-DD`
- Optional dates should have `required: false`
- Use `attrs.placeholder` to show the input hint (`DD-MM-YYYY`)
- Use `attrs.minDate` and `attrs.maxDate` to restrict date range (optional)
- Backend APIs may expect a different format; transform on submit if needed

#### File Upload
```javascript
{
  type: 'file',
  label: 'Photo',
  value: null,
  attrs: {
    accept: 'image/png,image/jpeg',
    maxSize: 2 * 1024 * 1024
  },
  validation: pipe(
    custom((v) => v instanceof File),
    custom((v) => v.size <= 2 * 1024 * 1024)
  )
}
```

**Notes:**
- Uses `src/v3/components/Forms/FileUploader.vue`
- Emits `validationError` for file constraints; MasterForm displays it automatically
- Value is a `File` object or `null`

#### PhotoInput
```javascript
{
  type: 'PhotoInput',
  label: 'Profile Photo',
  value: null,
  attrs: {
    aspectRatio: '1:1',
    maxSize: 2 * 1024 * 1024,
    description: 'Square photo, max 2MB'
  },
  validation: pipe(
    custom((value) => value instanceof File, 'Photo is required')
  )
}
```

**Notes:**
- Uses `src/v3/components/Forms/PhotoInput.vue`
- Emits `validationError` for file constraints; MasterForm displays it automatically
- Value is a `File` object or `null`

#### Autocomplete
```javascript
{
  type: 'autocomplete',
  label: 'Title',
  value: '',
  options: ['Option 1', 'Option 2', 'Option 3'],
  validation: pipe(
    string('Title is required'),
    minLength(1, 'Title is required'),
    maxLength(240, 'Maximum 240 characters')
  ),
  attrs: {
    dropdown: true,           // Show dropdown button
    completeOnFocus: true,   // Show all options on focus
    forceSelection: false,   // Allow custom values
    maxlength: 240
  }
}
```

**Notes:**
- Uses `primevue/autocomplete`
- Options can be string array or object array
- Options come from `formOptions` when provided (fallback to `schema.options`)
- `dropdown: true` adds dropdown button inside input
- `completeOnFocus: true` shows all options when field focused
- `forceSelection: false` allows custom values not in options
- MasterForm automatically handles `@complete` event for filtering
- `filteredOptions` property stores filtered results
- Supports RTL layout

#### Tags Input

Use `TagsInput` when the UI value should stay a canonical string array such as `languages`, `skills`, or other free-form tags.

```javascript
{
  type: 'TagsInput',
  label: 'Languages',
  value: [],
  placeholder: 'Enter a language',
  attrs: {
    addOnBlur: true,
    separator: ',',
    allowDuplicate: false
  },
  validation: custom(
    (value) => Array.isArray(value) && value.length > 0,
    'At least one language is required'
  )
}
```

**Notes:**
- `TagsInput` stores its value as a string array.
- Prefer `TagsInput` over wiring `InputChips` directly into `MasterForm`.
- `attrs.separator` controls commit splitting such as `,`.
- `attrs.addOnBlur: true` commits the pending input when the field loses focus.
- `attrs.allowDuplicate: false` keeps tags unique.
- Serialize array values directly at the endpoint boundary, for example `languages[]`.

#### Radio Tiles

Single-select `radioTiles` returns one scalar value. This is the default mode.

```javascript
{
  type: 'radioTiles',
  label: 'Gender',
  value: null,
  options: [
    { value: 'male', label: 'Male', icon: 'pi-user' },
    { value: 'female', label: 'Female', icon: 'pi-user-female' }
  ],
  validation: pipe(string(), picklist(['male', 'female']))
}
```

Multi-select `radioTiles` is also supported. In this mode, the field behaves like checkbox tiles and the value must be an array.

```javascript
{
  type: 'radioTiles',
  label: 'Administrator Role',
  value: [],
  options: [
    { value: 'Owner', label: 'Owner' },
    { value: 'Manager', label: 'Manager' }
  ],
  attrs: {
    multiple: true
  },
  validation: custom(
    (value) => Array.isArray(value) && value.length > 0,
    'Administrator role is required'
  )
}
```

**Notes:**
- Omit `attrs.multiple` for the default single-value mode.
- Set `attrs.multiple: true` when the user may select more than one tile.
- In single mode, use scalar validation such as `string()` + `picklist(...)`.
- In multiple mode, use array-aware validation such as `custom((value) => Array.isArray(value) && value.length > 0, ...)`.
- Keep `value`, `initialValues`, and submit serialization aligned with the chosen mode.

---

## Validation

### Validation Flow

1. **On Blur:** Validate field when user leaves field
2. **On Input:** Re-validate if field has errors
3. **On Change:** Validate field when value changes
4. **On Submit:** Validate all fields

### Validation Timing

```javascript
// Validation happens automatically:
// - Field blur: validate(field)
// - Field input (if has errors): validate(field)
// - Field change: validate(field)
// - Form submit: validateForm()

// No need to manually trigger validation
```

### Validation Schema

```javascript
import { pipe, string, minLength, maxLength, email, regex, picklist, custom, union, number } from 'valibot'

// Required string
validation: pipe(
  string('Field is required'),
  minLength(1, 'Field is required')
)

// String with length constraints
validation: pipe(
  string(),
  minLength(3, 'Must be at least 3 characters'),
  maxLength(50, 'Must be under 50 characters')
)

// Email format
validation: pipe(
  string('Email is required'),
  email('Invalid email format')
)

// Pattern matching
validation: pipe(
  string(),
  regex(/^\d{10}$/, 'Must be 10 digits')
)

// Select validation
validation: pipe(
  string('Select an option'),
  picklist(['1', '2', '3'], 'Select a valid option')
)

// Numeric options (API returns numbers)
validation: pipe(
  union([string(), number()]),
  picklist([1, 2, 3], 'Select a valid option')
)

// Custom validation
validation: pipe(
  custom((value) => value instanceof File, 'File is required'),
  custom((value) => value.size <= 2 * 1024 * 1024, 'Max 2MB')
)
```

### Error Messages

```javascript
// Error messages are user-friendly and translatable
validation: pipe(
  string('Identity number is required'),           // Fallback message
  minLength(10, 'Identity number is required'),    // Specific message
  regex(/^[12]\d{9}$/, 'Must start with 1 or 2') // Pattern message
)
```

**Note:** MasterForm renders field errors and the summary using i18n. If a message key is missing in the locale file, the raw string is shown.

---

## Type Handling

### String vs Number IDs

APIs often return numeric IDs. Accept both types in validation and align picklists to the actual option values.

```javascript
validation: pipe(
  union([string('Field is required'), number('Field is required')]),
  picklist([1, 2, 3], 'Select a valid option')
)
```

### Date Handling (DatePicker)

- Model value is a `YYYY-MM-DD` string or `''`.
- Transform to API format on submit if your backend expects something else.

```javascript
export function serializeData(data) {
  return {
    birthdate: data.birthdate // Already YYYY-MM-DD
  }
}
```

### File Handling

- File inputs return `File` objects (or `null`).
- Use `FormData` when uploading files.

```javascript
export function serializeForUpload(data) {
  const form = new FormData()
  form.append('photo', data.photo)
  return form
}
```

---

## Error Handling

### Client-Side Errors

MasterForm automatically displays client-side validation errors:
- Field-level errors below each field
- Summary message at top of form when errors exist

```vue
<!-- Error summary (automatic) -->
<Message v-if="showSummary && hasErrors" severity="danger">
  <div>
    <div>Please fix the following errors:</div>
    <ul>
      <li v-for="msg in summaryMessages">{{ msg }}</li>
    </ul>
  </div>
</Message>

<!-- Field errors (automatic) -->
<div v-if="err('fieldName')" class="p-error">
  {{ err('fieldName') }}
</div>
```

### Server-Side Errors (422)

```javascript
async function handleSubmit({ formData }) {
  try {
    await apiPost('/endpoint', formData)
  } catch (err) {
    // Apply server validation errors to form
    if (err.status === 422 && formRef.value) {
      formRef.value.applyServerErrors(err.errors)
    }
  }
}
```

**Server Error Format:**
```javascript
{
  fieldName: ['Error message 1', 'Error message 2'],
  anotherField: ['Error message']
}
```

### Error Display Control

```javascript
// Show error summary
formRef.value?.showErrors()

// Hide error summary
formRef.value?.hideErrors()

// Get current errors
const errors = formRef.value?.getErrors()
// { fieldName: 'Error message', anotherField: 'Another error' }
```

### Validity Tracking

```javascript
// Track form validity
function handleValidity({ isValid, errors }) {
  isFormValid.value = isValid
  formErrors.value = errors
}

// Disable submit button when invalid
<button :disabled="!isFormValid">Submit</button>
```

---

## Common Patterns

### Pattern 1: Dynamic Options (Trinity Architecture)

Instead of mutating the schema, pass dynamic options via the `formOptions` prop. MasterForm reads `schema` once on mount, so keep it static.

```vue
<template>
  <MasterForm :schema="schema" :formOptions="formOptions" />
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 1. Static Schema
const schema = {
  region_id: { type: 'select', label: 'Region', options: [], ... }
}

// 2. Reactive Options
const formOptions = ref({
  region_id: []
})

onMounted(async () => {
  const regions = await apiGet('/regions')
  // Update options reactively
  formOptions.value.region_id = regions
})
</script>
```

### Pattern 2: Cascading Selects (Region → City)

Use `@field-change` to detect changes and update `formOptions` for dependent fields.

```vue
<template>
  <MasterForm
    :schema="schema"
    :formOptions="formOptions"
    @field-change="onFieldChange"
  />
</template>

<script setup>
const cities = ref([]) // All cities

function onFieldChange({ key, value }) {
  if (key === 'region_id') {
     // 1. Reset dependent field value
    formRef.value?.setFieldValue('city_id', null)

    // 2. Filter options based on selection
    if (value) {
      formOptions.value.city_id = cities.value.filter(c => c.region_id === value)
    } else {
      formOptions.value.city_id = [] // Or show all
    }
  }
}
</script>
```

### Pattern 3: Conditional Fields (Remount)

MasterForm does not react to schema structure changes after mount. If you must change fields, remount the form with a new `:key` and schema variant.

```vue
<template>
  <MasterForm
    :key="formVariant"
    :schema="schemas[formVariant]"
    :formOptions="formOptions"
    @field-change="onFieldChange"
  />
</template>

<script setup>
const formVariant = ref('base')
const schemas = {
  base: makeBaseSchema(),
  withCity: makeSchemaWithCity()
}

function onFieldChange({ key, value }) {
  if (key === 'has_city') {
    formVariant.value = value ? 'withCity' : 'base'
  }
}
</script>
```

**Note:** Remounting resets form state. Prefer splitting the form or showing conditional UI outside MasterForm when possible.

### Pattern 4: Form Reset

```javascript
const defaults = { name: '', region_id: null, city_id: null }

function resetForm() {
  // Reset via initialValues (reactive)
  initialValues.value = { ...defaults }

  // Hide errors
  formRef.value?.hideErrors()
}
```

---

## Common Pitfalls

### Pitfall 1: Null Schema

**Problem:**
```javascript
const schema = ref(null) // ❌ Wrong
```

**Error:** `Invalid prop: type check failed for prop "schema". Expected Object, got Null`

**Solution:**
```javascript
const schema = ref(makeMySchema()) // ✅ Correct
```

**Why:** MasterForm expects an Object, not Null.

---

### Pitfall 2: Missing minLength for Required Fields

**Problem:**
```javascript
validation: pipe(string(), maxLength(10)) // ❌ Missing minLength
```

**Issue:** Field shows "required" error even when filled

**Solution:**
```javascript
validation: pipe(
  string('Field is required'),
  minLength(1, 'Field is required'),
  maxLength(10, 'Max 10 characters')
)
```

**Why:** `string()` alone doesn't check for empty strings.

---

### Pitfall 3: Type Mismatch in Select Options

**Problem:**
```javascript
// API returns numbers, but validation only accepts strings
validation: pipe(string()) // ❌ Only strings

// Error: Invalid type: Expected string but received number
```

**Solution:**
```javascript
validation: pipe(
  union([string(), number()]), // ✅ Accept both
  picklist([1, 2, 3], 'Select a valid option')
)
```

**Why:** APIs often return numeric IDs. Use `union()` to accept both types.

---

### Pitfall 4: Options Showing as Objects

**Problem:**
```javascript
// Select shows [object Object] instead of labels
options: [{ id: 1, name: 'Option 1' }] // ❌ Missing optionLabel/optionValue
```

**Solution:**
```javascript
options: [{ id: 1, name: 'Option 1' }],
attrs: {
  optionLabel: 'name', // ✅ Specify label property
  optionValue: 'id'    // ✅ Specify value property
}
```

**Why:** MasterForm defaults to `label/value` or `name/id`. If your option shape differs, map it or set `attrs.optionLabel/optionValue`.

---

### Pitfall 5: Rebuilding or Mutating Schema After Mount

**Problem:**
Re-creating or mutating the schema after mount does not update the rendered form, and can reset user input.

**Solution:**
Keep schema static.
1. Update options via reactive `formOptions`.
2. Update values via reactive `initialValues` or `setFieldValue`.
3. If you must change structure, remount MasterForm with a new `:key` (this resets state).

**Why:** MasterForm reads `schema` once; current input lives in `formData`.

---

### Pitfall 6: Reading Current Input from `schema.value`

**Problem:**
```javascript
const regionId = schema.value.region_id?.value // ❌ Initial value only
```

**Solution:**
Use `@field-change`, `getFormData()`, or the `onSubmit` payload for current values.

```javascript
const formData = formRef.value?.getFormData()
```

**Why:** `schema[key].value` is only the initial value; it does not update with user input.

---

### Pitfall 7: Identity Number Type Mismatch

**Problem:**
```javascript
// API returns identity number as integer (1234567890)
// Validation expects string
identity_number: {
  value: 1234567890, // ❌ Number
  validation: pipe(string()) // Expects string
}
```

**Solution:**
```javascript
// Convert to string when serializing
export function serializeData(data) {
  return {
    ...data,
    identity_number: String(data.identity_number || '').trim()
  }
}

// Or initialize as string
identity_number: {
  value: '', // ✅ String
  validation: pipe(
    string(),
    minLength(10),
    regex(/^[12]\d{9}$/)
  )
}
```

**Why:** Type mismatches between API response and validation cause failures.

---

### Pitfall 8: City Options Not Updating

**Problem:**
City dropdown doesn't update when region is selected.

**Solution:**
Use `@field-change` to update `formOptions.city_id`.

```javascript
function onFieldChange({ key, value }) {
  if (key === 'region_id') {
     // Reset city
    formRef.value?.setFieldValue('city_id', null)
    
    // Filter cities
    formOptions.value.city_id = cities.value.filter(c => c.region_id === value)
  }
}
```

**Why:** Options must be reactive. Modifying schema.options deeply might not trigger reactivity in some cases, but `formOptions` is designed for this.

---

### Pitfall 9: Translation Key Not Found

**Problem:**
```javascript
// Translation shows key instead of translated text
{{ $t('errors.pleaseFix') }} // ❌ Nested key not in translation file
```

**Solution:**
```javascript
// Use English words as keys (website translation guide)
{{ $t('Please fix the following errors') }} // ✅ Direct key
```

**Why:** Website's translation strategy uses English words as keys, not nested structures.

---

### Pitfall 10: Not Handling Server Errors

**Problem:**
```javascript
// Server validation errors (422) not displayed to user
async function handleSubmit({ formData }) {
  await apiPost('/endpoint', formData) // ❌ No error handling
}
```

**Solution:**
```javascript
async function handleSubmit({ formData }) {
  try {
    await apiPost('/endpoint', formData)
  } catch (err) {
    // Apply server validation errors to form
    if (err.status === 422 && formRef.value) {
      formRef.value.applyServerErrors(err.errors)
    }
  }
}
```

**Why:** Users need to see server-side validation errors.

---

### Pitfall 11: Forgetting to Import Functions

**Problem:**
```javascript
// ReferenceError: apiPost is not defined
await apiPost('/endpoint', data) // ❌ Not imported
```

**Solution:**
```javascript
// Import all needed functions
import { apiGet, apiPost, apiDelete } from '@/v3/services/httpClient'
```

**Why:** Always import functions before using them.

---

### Pitfall 12: Validation Pipe Syntax Error

**Problem:**
```javascript
validation:pipe(string(), maxLength(10)) // ❌ Missing space
```

**Solution:**
```javascript
validation: pipe(string(), maxLength(10)) // ✅ Correct
```

**Why:** JavaScript syntax errors prevent the schema from loading.

---

## Best Practices

### 1. Always Initialize Schema

```javascript
// ❌ Bad
const schema = ref(null)

// ✅ Good
const schema = ref(makeMySchema())

// ✅ Good (with options)
const schema = ref(makeMySchema({ regions: [], cities: [] }))
```

### 2. Keep Schema Static (Remount for Structural Changes)

```javascript
// ✅ Good - create schema once
const schema = ref(makeMySchema())

// Use formOptions/initialValues for dynamic data
```

If you must change the schema structure, remount the form with a new `:key` (this resets state).

### 3. Track Form Validity

```javascript
const isFormValid = ref(false)

function handleValidity({ isValid }) {
  isFormValid.value = isValid
}

// Disable submit button when invalid
<button :disabled="!isFormValid">Submit</button>
```

### 4. Handle Server Errors Properly

```javascript
async function handleSubmit({ formData }) {
  try {
    await apiPost('/endpoint', formData)
    // Success handling
  } catch (err) {
    if (err.status === 422 && formRef.value) {
      formRef.value.applyServerErrors(err.errors)
    } else {
      // Handle other errors
    }
  }
}
```

### 5. Provide Clear Error Messages

```javascript
// ❌ Bad - generic error
validation: pipe(string(), minLength(10))

// ✅ Good - descriptive error
validation: pipe(
  string('Identity number is required'),
  minLength(10, 'Identity number must be 10 digits'),
  regex(/^[12]\d{9}$/, 'Identity number must start with 1 or 2')
)
```

### 6. Use Union for Type Flexibility

```javascript
// ❌ Bad - only accepts strings
validation: pipe(string())

// ✅ Good - accepts strings or numbers
validation: pipe(union([string(), number()]))
```

### 7. Validate File Size and Type

```javascript
// ❌ Bad - no validation
validation: pipe(custom((v) => v instanceof File))

// ✅ Good - comprehensive validation
validation: pipe(
  custom((v) => v instanceof File, 'File is required'),
  custom((v) => v.size <= 2 * 1024 * 1024, 'File size must be less than 2MB'),
  custom((v) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf']
    return allowedTypes.includes(v.type)
  }, 'File must be PNG, JPEG, or PDF')
)
```

### 8. Use picklist for Select Options

```javascript
// ❌ Bad - no validation of selected value
validation: pipe(string())

// ✅ Good - validates against allowed values
validation: pipe(
  string('Select an option'),
  picklist(['option1', 'option2', 'option3'], 'Select a valid option')
)
```

### 9. Handle Empty Options Gracefully

```javascript
// ❌ Bad - validation fails when no options
validation: pipe(
  string(),
  picklist(options.map(o => o.value), 'Select a valid option')
)

// ✅ Good - conditional validation
validation: options.length > 0
  ? pipe(
      string(),
      picklist(options.map(o => o.value), 'Select a valid option')
    )
  : pipe(union([string(), number()]))
```

### 10. Test Edge Cases

```javascript
// Test these scenarios:
// - Empty form submission
// - Invalid data types
// - Missing required fields
// - Maximum length exceeded
// - Invalid file types
// - File too large
// - Invalid date ranges
// - Invalid email format
// - Invalid phone format
// - Cascading selects (region → city)
// - Server validation errors (422)
// - Network errors
```

---

## Quick Reference

### Schema Template

```javascript
const formSchema = {
  fieldName: {
    type: 'text',
    label: 'Field Label',
    placeholder: 'Enter value',
    value: '',
    required: true,
    options: [],
    attrs: {},
    validation: pipe(string(), minLength(1))
  }
}
```

### Validation Cheatsheet

```javascript
// Required string
pipe(string('Field is required'), minLength(1, 'Field is required'))

// String with length
pipe(string(), minLength(3), maxLength(50))

// Email
pipe(string(), email('Invalid email'))

// Phone number
pipe(string(), regex(/^05\d{8}$/, 'Invalid phone number'))

// Saudi ID
pipe(string(), minLength(10), maxLength(10), regex(/^[12]\d{9}$/))

// Required select
pipe(string('Field is required'), picklist(['1', '2'], 'Select a valid option'))

// Optional select
pipe(union([string(), number()]))

// Required file
pipe(custom((v) => v instanceof File, 'File is required'))

// File with size limit
pipe(
  custom((v) => v instanceof File),
  custom((v) => v.size <= 2 * 1024 * 1024, 'Max 2MB')
)
```

### Common Patterns

```javascript
// Static schema
const schema = makeMySchema()

// Dynamic options + initial values
const formOptions = ref({ region_id: [], city_id: [] })
const initialValues = ref({})

// Update dependent options from field-change
function onFieldChange({ key, value }) {
  if (key === 'region_id') {
    formRef.value?.setFieldValue('city_id', null)
    formOptions.value.city_id = cities.value.filter(c => c.region_id === value)
  }
}

// Handle server errors
if (err.status === 422 && formRef.value) {
  formRef.value.applyServerErrors(err.errors)
}

// Read current input
const currentData = formRef.value?.getFormData()
```

---

## Related Documentation

- [Forms Index](../reference/forms-index.md) - component sources and form examples
- [Translation Guide](./translation-guide.md) - i18n best practices and strategy
- [Schema Building Guide](./schema-building-guide.md) - schema design patterns
- [Valibot Documentation](https://valibot.dev/) - Validation library reference

---

## Checklist

Before deploying a form with MasterForm:

- [ ] Schema is initialized (not null)
- [ ] All required fields have `required: true`
- [ ] All fields have proper validation
- [ ] Select options use `{ label, value }` or `{ name, id }`, or set `attrs.optionLabel/optionValue`
- [ ] Type mismatches handled (string vs number)
- [ ] DatePicker values are stored as `YYYY-MM-DD` strings
- [ ] File size and type validation added
- [ ] Translation keys exist in ar.json (see [Translation Guide](./translation-guide.md))
- [ ] Cascading selects update correctly
- [ ] Schema is treated as static; use `formOptions`/`initialValues` or remount intentionally
- [ ] Server errors (422) handled with `applyServerErrors()`
- [ ] Form validity tracked with `@validity` event
- [ ] Submit button disabled when invalid
- [ ] Error messages are user-friendly
- [ ] RTL/LTR layout tested
- [ ] Mobile responsiveness tested
- [ ] Accessibility (keyboard, screen reader) tested

---

**Last Updated:** January 6, 2026
**Version:** 1.0
**Status:** Complete
