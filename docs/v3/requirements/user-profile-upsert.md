# User Profile Management - Business Requirements & Technical Specifications

## 1. Business Requirements

### 1.1 Core Functionality
- Users must be able to create or update their personal profile information as part of an application process
- Profile information must be available in both Arabic and English (bilingual support)
- Identity verification is required for all users with specific validation rules
- Profile data must be tied to a specific application context
- Dynamic region and city selection based on Saudi Arabia administrative divisions

### 1.2 Identity Requirements
- **Identity Type**: Must be either "National ID" or "Iqama" (no other options)
- **National ID**: Must start with '1' followed by 9 digits (total 10 digits)
- **Iqama**: Must start with '2' followed by 9 digits (total 10 digits)
- **Iqama Expiry**: Required for Iqama (not required for National ID)
- **Age Requirement**: Users must be at least 12 years old (based on birthdate)

### 1.3 Data Requirements
- **Names**: Both Arabic and English names are required (not optional)
- **Mobile Number**: Must follow KSA format (9665XXXXXXXX or 05XXXXXXXX)
- **Email**: Must be in standard email format
- **Nationality**: Must be full nationality name (e.g., "Saudi Arabian" instead of "SA")
- **Gender**: Must be either Male or Female

### 1.4 User Experience
- Clear error messages for validation failures
- Form must be responsive and mobile-friendly
- Required fields clearly marked with asterisks
- Arabic fields properly aligned for RTL layout
- Success messages after profile updates

## 2. Technical Specifications

### 2.1 Component Architecture

| Component | Purpose | Location |
|-----------|---------|----------|
| `UserProfileUpsert.vue` | Main component handling form UI and submission | `src/v3/pages/applications/UserProfileUpsert.vue` |
| `userProfile.js` | Schema definition for profile form | `src/v3/schema/userProfile.js` |
| `MasterForm.vue` | Reusable form component handling validation | `src/v3/components/Forms/MasterForm.vue` |
| `httpClient.js` | API client for making requests | `src/v3/services/httpClient.js` |

### 2.2 Schema Definition (`userProfile.js`)

#### 2.2.1 Validation Rules

- **Name Fields**:
  - `name_ar`: Required, Arabic script only, max 100 characters
  - `name_en`: Required, max 100 characters

- **Identity**:
  - `identity_type`: Required, must be 'NationalID' or 'Iqama'
  - `identity_number`: Required, 10 digits, regex validation: `^[12]\d{9}$` (starts with 1 or 2)
  - `identity_expiry`: Required for Iqama, must be valid date

- **Personal**:
  - `birthdate`: Required, must be valid date, user must be ≥12 years old
  - `gender`: Required, must be 'Male' or 'Female'
  - `nationality`: Required, must be full nationality name (e.g., "Saudi Arabian")

- **Contacts**:
  - `mobile`: Required, KSA format (9665XXXXXXXX or 05XXXXXXXX)
  - `email`: Required, valid email format

- **Location**:
  - `region_id`: Required, must be selected from available options
  - `city_id`: Required, must be selected from available options based on region

#### 2.2.2 Supported Input Types

Supported input types are documented in the [MasterForm Component Guide](../guides/masterform-guide.md).

#### 2.2.3 Dynamic Options

Dynamic options for this form:
- **Regions/Cities**: Loaded from `addresses/common`
- **Options**: Passed via `formOptions`
- **Filtering**: Cities are filtered on `@field-change` when region changes
- See [MasterForm Component Guide](../guides/masterform-guide.md#common-patterns) for the canonical pattern

### 2.3 API Integration

#### 2.3.1 API Endpoint
- `POST /api/v1/apps/users/profiles/{appId}`
- Handles both create and update operations
- Uses `VITE_APPS_USERS_UPDATE_USER_PROFILE` environment variable
- Returns 200 on success, 400/422 on validation errors, 409 if profile exists

#### 2.3.2 Address Data Endpoint
- `GET /api/v1/addresses/common`
- Returns regions and cities data for dynamic selection
- Expected response structure:
  ```json
  {
    "cities": [
      {
          "id": 1,
          "region_id": 7,
          "name": "TABUK"
      },
      {
          "id": 3,
          "region_id": 1,
          "name": "RIYADH"
      }
    ],
    "regions": [
      {
          "id": 1,
          "name": "Riyadh"
      },
      {
          "id": 2,
          "name": "Makkah"
      }
    ]
  }
  ```
- Region object: `{ id, name }`
- City object: `{ id, name, region_id }`

#### 2.3.3 Error Handling

| HTTP Status | Error Type | Handling |
|-------------|------------|----------|
| 400/422 | Validation Error | Display field-specific errors |
| 404 | Application not found | Redirect to applications index |
| 409 | Profile already exists | Show "A profile already exists" message |
| 500+ | Server error | Redirect to server error page |

### 2.4 Data Flow

#### 2.4.1 Component Initialization
- Load application using `useApplicationStore` with selective payload loading
- **Force reload application with user_profile payload if not already loaded**
- Check if user can modify the application
- Load user_profile from payload (no separate `loadEntity()` call needed)
- Populate `initialValues` with existing profile data (schema stays static)
- Set page title to "Update Profile" or "Create Profile"

#### 2.4.2 Form Population
- Check if `store.payload.user_profile.value` is null or has data
- If null = create mode (no profile exists)
- If has data = edit mode (profile exists)
- Populate `initialValues` with existing profile data

#### 2.4.3 Form Submission
- Validate form using MasterForm
- Serialize data using `serializeProfile`
- Submit to API endpoint using `apiPost`
- Handle success or error responses
- Navigate to summary page (will load with full payload automatically)

### 2.5 Security Considerations

- Input validation prevents malicious data
- API requests are authenticated
- Sensitive data (identity numbers) handled securely
- All API endpoints require proper authorization
- All user input is sanitized before storage
- Passwords are never stored in plain text (not applicable for this feature)

### 2.6 Testing Requirements

- Unit tests for validation rules
- Integration tests for form submission
- UI tests for form rendering and error handling
- Internationalization tests for all language strings
- Mobile responsiveness testing
- RTL testing for Arabic support

## 3. Implementation Notes

### 3.1 The form uses a single API endpoint that handles both create and update operations
- The schema definition includes all validation rules and UI attributes
- The MasterForm component handles all validation and rendering
- The component uses application store to gate editability
- All user-facing strings are internationalized using `$t()` function

### 3.2 The form uses a single API endpoint that handles both create and update operations
- The schema definition includes all validation rules and UI attributes
- The MasterForm component handles all validation and rendering
- The component uses application store to gate editability
- All user-facing strings are internationalized using `$t()` function

### 3.3 Profile data is loaded using selective payload loading via `payloadKeys: ['user_profile']`
- Only loads user_profile (minimal initial payload)
- Simple logic: null = create mode, data = edit mode
- No full reload after submit (summary page auto-loads)
- All input types are limited to supported types in MasterForm (see [MasterForm Component Guide](../guides/masterform-guide.md))
- Nationality field uses full nationality name instead of ISO-2 code
- Identity number validation is simplified to check length and starting digit
- Age validation checks for minimum age of 12 years
- Date fields use DatePicker component (model value `YYYY-MM-DD`)
- All form fields are properly labeled with required indicators
- Error messages are clear and user-friendly

### 3.4 Dynamic Region/City Loading

Dynamic region/city selection:
- Regions and cities are loaded from `addresses/common` endpoint
- Options are passed via `formOptions`
- Cities are filtered on `@field-change` when region changes
- City value is reset via `setFieldValue` when region changes
- Schema remains static; no rebuild required

### 3.5 Uses unified application loading with force reload capability
- Single HTTP request for initial load with selective payload
- **Forces reload when user_profile is missing from already loaded application**
- Optimized for minimal data transfer
- Form validation is performed client-side before submission
- Error handling is efficient and doesn't cause unnecessary API calls
- The component is optimized for fast rendering

## 4. Validation Rules

### 4.1 Identity Validation
- **National ID**: Must be 10 digits starting with '1'
- **Iqama**: Must be 10 digits starting with '2'
- **Iqama Expiry**: Required when identity type is Iqama, must be a valid future date

### 4.2 Personal Information Validation
- **Birthdate**: Must be a valid date, user must be at least 12 years old
- **Gender**: Must be either "Male" or "Female"
- **Nationality**: Must be a valid nationality name (e.g., "Saudi Arabian")

### 4.3 Contact Information Validation
- **Mobile**: Must follow KSA format (9665XXXXXXXX or 05XXXXXXXX)
- **Email**: Must be a valid email format

### 4.4 Location Validation
- **Region**: Must be selected from available options
- **City**: Must be selected from available options based on selected region

## 5. Error Messages

| Error Key | English Message | Arabic Translation |
|------------|-----------------|-------------------|
| `errors.required` | "This field is required" | "هذا الحقل مطلوب" |
| `errors.max100` | "Maximum 100 characters" | "الحد الأقصى 100 حرف" |
| `errors.max10` | "Maximum 10 characters" | "الحد الأقصى 10 أحرف" |
| `errors.nationalStarts1` | "National ID must start with 1" | "يجب أن يبدأ رقم الهوية الوطنية بـ1" |
| `errors.iqamaStarts2` | "Iqama must start with 2" | "يجب أن يبدأ رقم الإقامة بـ2" |
| `errors.minAge12` | "Must be at least 12 years old" | "يجب أن يكون عمرك 12 سنة على الأقل" |
| `errors.invalidOption` | "Invalid option selected" | "اختيار غير صحيح" |
| `errors.dateYmd` | "Invalid date format (YYYY-MM-DD)" | "تنسيق تاريخ غير صحيح (YYYY-MM-DD)" |
| `errors.mobileKsa` | "Invalid mobile number format" | "تنسيق رقم الهاتف غير صحيح" |

## 6. API Request/Response Examples

### 6.1 Create Profile Request
```json
{
  "name_ar": "محمد علي",
  "name_en": "Mohammed Ali",
  "identity_type": "NationalID",
  "identity_number": "1234567890",
  "birthdate": "1990-01-15",
  "gender": "Male",
  "nationality": "Saudi Arabian",
  "mobile": "966501234567",
  "email": "m.ali@example.com",
  "region_id": "1",
  "city_id": "10"
}
```

### 6.2 Update Profile Request
```json
{
  "name_ar": "محمد علي أحمد",
  "name_en": "Mohammed Ali Ahmed",
  "identity_type": "Iqama",
  "identity_number": "2123456789",
  "identity_expiry": "2028-12-31",
  "birthdate": "1990-01-15",
  "gender": "Male",
  "nationality": "Saudi Arabian",
  "mobile": "966501234567",
  "email": "m.ali@example.com",
  "region_id": "1",
  "city_id": "10"
}
```

### 6.3 Success Response
```json
{
  "status": "success",
  "message": "Profile updated successfully",
  "data": {
    "id": 123,
    "application_id": 456,
    "name_ar": "محمد علي أحمد",
    "name_en": "Mohammed Ali Ahmed",
    "identity_type": "Iqama",
    "identity_number": "2123456789",
    "identity_expiry": "2028-12-31",
    "birthdate": "1990-01-15",
    "gender": "Male",
    "nationality": "Saudi Arabian",
    "mobile": "966501234567",
    "email": "m.ali@example.com",
    "region_id": "1",
    "city_id": "10"
  }
}
```

## 7. Localization Requirements

All user-facing strings must be translated using `$t()` function with the following format:

```javascript
$t('Full Name (Arabic)')
```

The English string "Full Name (Arabic)" will be used as the translation key in the locale files. The corresponding Arabic translation should be added to `src/locales/ar.json`:

```json
{
  "Full Name (Arabic)": "الاسم الكامل (العربي)"
}
```

This ensures consistent formatting and avoids camelCase keys.

## 8. Accessibility Requirements

1. All form fields have proper labels
2. Required fields are clearly marked with asterisks
3. Error messages are accessible to screen readers
4. Form has proper keyboard navigation
5. All interactive elements have appropriate ARIA attributes
6. Color contrast meets WCAG 2.1 AA standards
7. Form is responsive for all screen sizes
8. All interactive elements have appropriate ARIA attributes

## 9. Performance Considerations

1. Profile data is loaded efficiently using selective payload loading (only `user_profile`)
2. Only necessary data is fetched for profile (minimal initial payload)
3. Loading states are properly handled
4. API calls are optimized for minimal data transfer
5. Form validation is performed client-side before submission
6. Error handling is efficient and doesn't cause unnecessary API calls
7. The component is optimized for fast rendering
8. No full reload after submit (summary page auto-loads)
9. Single HTTP request for initial load (no separate `loadEntity()` call)

## 10. Unified Entity Loading

### 10.1 Loading Strategy

The component uses **selective payload loading** to optimize performance:

```javascript
// Load application with only user_profile (minimal payload)
await store.loadApplication(appId, {
  withPayload: true,
  payloadKeys: ['user_profile'] // Only load user_profile
});
```

### 10.2 Profile Detection

```javascript
// Check profile from payload
const profile = store.payload.user_profile.value;

// If null = create mode (no profile exists)
// If has data = edit mode (profile exists)
```

### 10.3 Benefits

- **Fast Initial Load**: Only loads `user_profile` (minimal payload)
- **Simple Logic**: null = create mode, data = edit mode
- **No Separate Loading**: No need for `loadEntity()` calls
- **Summary Auto-Load**: Summary page loads with full payload automatically
- **Single HTTP Request**: One request instead of multiple requests
- **Optimized Performance**: Minimal data transfer for initial load
- **Better UX**: Immediate form availability with minimal data

## 11. After Submission

```javascript
// Save profile
await apiPost(endpoint, payload);
success('Profile updated successfully');

// Navigate to summary (will load with full payload automatically)
router.push({ name: 'app-summary', params: { appId, locale } });
```

This document provides a comprehensive guide for implementing and maintaining the User Profile Management feature, ensuring it meets all business requirements while following the project's technical standards and architecture.
