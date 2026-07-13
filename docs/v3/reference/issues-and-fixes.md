# MasterForm and User Profile Implementation - Issues and Fixes

**Note:** This document is a historical log. For canonical MasterForm guidance, use [MasterForm Component Guide](../guides/masterform-guide.md).

## Overview
This document captures the issues encountered and fixes applied while implementing dynamic region/city loading in the user profile form, following patterns from diving site and diving center examples.

## Issues Encountered and Fixes

### 1. Translation Key Issue

**Problem**: Website's MasterForm was using a nested translation key `$t('errors.pleaseFix')` which doesn't follow the website's translation guide that requires using English words as translation keys.

**Location**: [`src/v3/components/Forms/MasterForm.vue`](../../../src/v3/components/Forms/MasterForm.vue)

**Fix Applied**:
```vue
<!-- Before -->
{{ $t('errors.pleaseFix') || 'Please fix the following errors:' }}

<!-- After -->
{{ $t('Please fix the following errors') || 'Please fix the following errors:' }}
```

**Reference**: See [Translation Guide](../guides/translation-guide.md) for the website's translation strategy.

---

### 2. Missing API Import

**Problem**: `apiPost` was not imported in UserProfileUpsert.vue, causing a ReferenceError when trying to submit the form.

**Location**: [`src/v3/pages/applications/UserProfileUpsert.vue`](../../../src/v3/pages/applications/UserProfileUpsert.vue)

**Fix Applied**:
```javascript
// Before
import { ERROR_TYPES, apiGet } from '@/v3/services/httpClient.js';

// After
import { ERROR_TYPES, apiGet, apiPost } from '@/v3/services/httpClient.js';
```

---

### 3. Schema Initialization Issue

**Problem**: Schema was initialized as `null`, causing MasterForm to receive an invalid prop type. The component expects an Object but was receiving Null.

**Location**: [`src/v3/pages/applications/UserProfileUpsert.vue`](../../../src/v3/pages/applications/UserProfileUpsert.vue)

**Fix Applied**:
```javascript
// Before
const schema = ref(null);

// After
const schema = ref(makeUserProfileSchema());
```

---

### 4. Validation Helper Issue

**Problem**: The `requiredStr` helper function was causing validation issues by wrapping validation pipes incorrectly.

**Location**: [`src/v3/schema/userProfile.js`](../../../src/v3/schema/userProfile.js)

**Fix Applied**:
```javascript
// Before
const requiredStr = (s) => pipe(string('errors.required'), s);

// After
const requiredStr = (s) => s;
```

This allows each field to use its own validation pipe without the problematic wrapper.

---

### 5. Missing minLength Import

**Problem**: `minLength` was used in validation but not imported from valibot.

**Location**: [`src/v3/schema/userProfile.js`](../../../src/v3/schema/userProfile.js)

**Fix Applied**:
```javascript
// Before
import { pipe, string, maxLength, picklist, custom, union, literal } from 'valibot';

// After
import { pipe, string, minLength, picklist, custom, union, literal, number, regex } from 'valibot';
```

---

### 6. Identity Number Validation Issue

**Problem**: Identity number was showing as required even when it had a value. The validation was too permissive and didn't properly validate the format.

**Location**: [`src/v3/schema/userProfile.js`](../../../src/v3/schema/userProfile.js)

**Fix Applied**:
```javascript
// Before
identity_number: {
    type: 'text',
    label: 'Identity Number',
    value: '',
    validation: requiredStr(pipe(string(), maxLength(10, 'errors.max10'))),
    // ...
}

// After
identity_number: {
    type: 'text',
    label: 'Identity Number',
    value: '',
    validation: pipe(
        string('Identity number is required'),
        minLength(10, 'Identity number is required'),
        maxLength(10, 'Identity number must be 10 digits'),
        regex(/^[12]\d{9}$/, 'Identity number must be 10 digits starting with 1 or 2')
    ),
    // ...
}
```

**Note**: The regex pattern `/^[12]\d{9}$/` ensures exactly 10 digits starting with 1 or 2.

---

### 7. Birthdate, Gender, Nationality, Mobile, Email Validation Issues

**Problem**: These fields were using the problematic `requiredStr` helper, causing validation issues similar to identity_number.

**Location**: [`src/v3/schema/userProfile.js`](../../../src/v3/schema/userProfile.js)

**Fix Applied**:
```javascript
// Before
birthdate: {
    type: 'DatePicker',
    label: 'Birthdate',
    value: '',
    validation: requiredStr(pipe(string(), maxLength(10, 'errors.date')),
    // ...
}

// After
birthdate: {
    type: 'DatePicker',
    label: 'Birthdate',
    value: '',
    validation: pipe(
        string('Birthdate is required'),
        minLength(1, 'Birthdate is required'),
        maxLength(10, 'Birthdate must be valid date')
    ),
    // ...
}
```

Applied to all affected fields: birthdate, gender, nationality, mobile, email.

---

### 8. Region/City Type Mismatch Issue

**Problem**: Region and city values from API are numbers, but validation was only accepting strings, causing "Invalid type: Expected string but received number" errors.

**Location**: [`src/v3/schema/userProfile.js`](../../../src/v3/schema/userProfile.js)

**Fix Applied**:
```javascript
// Before
region_id: {
    type: 'select',
    label: 'Region',
    value: null,
    options: regionOptions,
    validation: pipe(string()),
    // ...
}

// After
region_id: {
    type: 'select',
    label: 'Region',
    value: null,
    options: regionOptions,
    validation: regionOptions.length > 0
        ? pipe(
              union([string('Region is required'), number('Region is required')]),
              picklist(regionOptions.map((o) => o.value), 'Select a valid region')
            )
        : pipe(union([string(), number()])),
    // ...
}

city_id: {
    type: 'select',
    label: 'City',
    value: null,
    options: cityOptions,
    validation: pipe(string()),
    // ...
}
```

**Note**: Using `union([string(), number()])` allows the validation to accept both types.

---

### 9. Identity Number Type Conversion Issue

**Problem**: Identity number comes from API as an integer, but needs to be sent as a string to the API. The validation expects a string, but the value type is number.

**Location**: [`src/v3/schema/userProfile.js`](../../../src/v3/schema/userProfile.js)

**Fix Applied**:
```javascript
// Before
export function serializeProfile(data) {
    return {
        // ...
        identity_number: data.identity_number.trim(),
        // ...
    };
}

// After
export function serializeProfile(data) {
    return {
        // ...
        identity_number: String(data.identity_number || '').trim(),
        // ...
    };
}
```

**Note**: Using `String(data.identity_number || '')` ensures the value is always converted to a string, even if null or undefined.

---

### 10. API Endpoint Issue

**Problem**: The address endpoint was referenced as `VITE_ADDRESSES_COMMON` environment variable, but the actual endpoint is `addresses/common`.

**Location**: [`src/v3/pages/applications/UserProfileUpsert.vue`](../../../src/v3/pages/applications/UserProfileUpsert.vue)

**Fix Applied**:
```javascript
// Before
const addressResponse = await apiGet(import.meta.env.VITE_ADDRESSES_COMMON);

// After
const addressResponse = await apiGet('addresses/common');
```

---

### 11. Missing Address Field Validation

**Problem**: The address field was missing proper validation and had a typo in the validation pipe.

**Location**: [`src/v3/schema/userProfile.js`](../../../src/v3/schema/userProfile.js)

**Fix Applied**:
```javascript
// Before
address: {
    type: 'text',
    label: 'Address',
    value: '',
    validation:pipe(string(), maxLength(255, 'errors.max255')),
    attrs: { maxlength: 250 },
    placeholder: 'Street, district, etc.'
}

// After
address: {
    type: 'text',
    label: 'Address',
    value: '',
    validation: pipe(string(), maxLength(255, 'Address must be under 255 characters')),
    attrs: { maxlength: 250 },
    placeholder: 'Street, district, etc.'
}
```

---

## Pattern: Dynamic Region/City Loading

### Implementation Overview

The dynamic region/city loading follows the pattern established in diving site and diving center upsert pages:

1. **Load Address Data**: Fetch regions and cities from `addresses/common` endpoint
2. **Build Schema**: Pass regions and cities to `makeUserProfileSchema()`
3. **Watch Region Changes**: Update city options when region changes
4. **Filter Cities**: Show only cities in the selected region
5. **Clear Invalid Cities**: Clear city value if no longer valid

### Key Functions

```javascript
// Schema builder
export function makeUserProfileSchema(regions = [], cities = []) {
    const regionOptions = (Array.isArray(regions) ? regions : []).map((r) => ({
        label: r?.name || r?.label || String(r?.id ?? r?.value ?? ''),
        value: r?.id ?? r?.value ?? r
    }));

    const cityOptions = (Array.isArray(cities) ? cities : []).map((c) => ({
        label: c?.name || c?.label || String(c?.id ?? c?.value ?? ''),
        value: c?.id ?? c?.value ?? c,
        region_id: c?.region_id
    }));

    return {
        // ... fields with regionOptions and cityOptions
        region_id: {
            type: 'select',
            label: 'Region',
            value: null,
            options: regionOptions,
            validation: regionOptions.length > 0
                ? pipe(
                      union([string('Region is required'), number('Region is required')]),
                      picklist(regionOptions.map((o) => o.value), 'Select a valid region')
                  )
                : pipe(union([string(), number()])),
            attrs: { optionLabel: 'label', optionValue: 'value', filter: true },
            placeholder: 'Select region',
            required: true
        },
        city_id: {
            type: 'select',
            label: 'City',
            value: null,
            options: cityOptions,
            validation: pipe(union([string(), number()])),
            attrs: { optionLabel: 'label', optionValue: 'value', filter: true, disabled: true },
            placeholder: 'Select city',
            required: true
        }
    };
}

// Dynamic city updater
export function updateCityOptionsForRegion(schema, regionId, cities = []) {
    if (!schema?.city_id) return;

    const hasRegion = regionId !== null && regionId !== undefined && regionId !== '';
    const filtered = hasRegion
        ? (Array.isArray(cities) ? cities : []).filter((city) => Number(city?.region_id) === Number(regionId))
        : [];

    schema.city_id.options = filtered
        .map((city) => ({
            label: city?.name ?? '',
            value: city?.id
        }))
        .filter((option) => option.value !== undefined && option.value !== null);

    // Enable/disable city select based on whether cities are available
    schema.city_id.attrs.disabled = !hasRegion || filtered.length === 0;

    // Clear city value if it's no longer in filtered options
    if (!schema.city_id.options.some((option) => option.value === schema.city_id.value)) {
        schema.city_id.value = null;
    }
}
```

---

## Best Practices Applied

### 1. Validation Patterns
- Use direct `pipe()` chains instead of wrapper functions
- Include `minLength()` validation where appropriate
- Use `regex()` for pattern validation (e.g., phone numbers, identity numbers)
- Use `union()` to accept multiple types when needed
- Provide clear, user-friendly error messages

### 2. Type Handling
- Convert API responses to appropriate types before validation
- Use `String(value || '')` for optional fields to handle null/undefined
- Use `union([string(), number()])` for fields that can be either type

### 3. Schema Management
- Initialize schema with default values to prevent null prop errors
- Preserve existing form values when rebuilding schema
- Use reactive references for dynamic option updates

### 4. API Integration
- Use correct endpoint paths (relative URLs for same-origin requests)
- Import all required functions (apiGet, apiPost, etc.)
- Handle loading states properly
- Display appropriate error messages for different HTTP status codes

### 5. Translation Strategy
- Follow the website's translation guide: use English words as keys
- Only add Arabic translations to `src/locales/ar.json`
- Use `$t('English Word')` for translatable strings
- Use hardcoded English text for default/English interface

---

## Testing Checklist

When implementing similar features in the future:

- [ ] Verify schema is initialized with default values, not null
- [ ] Test validation with both string and number inputs
- [ ] Verify dynamic city options update correctly on region change
- [ ] Test that city value is cleared when selecting a different region
- [ ] Verify identity number validation accepts valid formats
- [ ] Test that all required fields show asterisks
- [ ] Verify error messages are properly translated
- [ ] Test form submission with valid and invalid data
- [ ] Verify API endpoint is correct
- [ ] Test that form values are preserved during schema updates

---

## Related Documentation

- [User Profile Requirements](../requirements/user-profile-upsert.md) - User profile requirements and technical specifications
- [Translation Guide](../guides/translation-guide.md) - Translation strategy for website components
- [Diving center profile schema](../../../src/v3/schema/applications/diveCenterProfile.js) - Diving center schema example
- [Dive Center Profile Update](../../../src/v3/pages/applications/dive-centers/UpdateCenterProfile.vue) - Dynamic region/city form example
- [Sport Fishing Team Upsert](../../../src/v3/pages/applications/sport-fishing/TeamUpsert.vue) - MasterForm upsert example

---

## Lessons Learned

1. **Always initialize reactive state**: Never pass `null` to components that expect objects
2. **Import what you use**: Check all imports before using functions
3. **Type safety matters**: API responses may have different types than expected - convert appropriately
4. **Validation should be comprehensive**: Cover all edge cases with proper error messages
5. **Follow established patterns**: Don't reinvent the wheel - use patterns from similar components
6. **Test incrementally**: Fix issues one at a time and verify each fix
7. **Document your decisions**: Create documentation for future reference

---

## Conclusion

The dynamic region/city loading feature has been successfully implemented following the patterns from diving site and diving center examples. All validation issues have been resolved, and the component now properly handles:
- Dynamic region and city selection
- Proper type validation for both string and number inputs
- Identity number validation with regex pattern matching
- Form value preservation during schema updates
- Correct API endpoint usage
- Proper error handling and user feedback

This implementation provides a solid foundation for future form enhancements and maintains consistency with the rest of the application.
