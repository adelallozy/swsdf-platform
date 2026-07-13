# UserProfileUpsert - Missing Features Analysis

## Missing Validation Rules

### 1. Arabic Name Validation
**Missing**: Arabic-only regex validation for `name_ar`
- **Required**: `/^([\u0600-\u065F\u066A-\u06EF\u06FA-\u06FF]{2,}\s+){2,}([\u0600-\u065F\u066A-\u06EF\u06FA-\u06FF]{2,}\s*)$/`
- **Impact**: Users can enter non-Arabic characters in Arabic name field

### 2. English Name Validation
**Missing**: English-only regex validation for `name_en`
- **Required**: `/^([a-zA-Z]{2,}\s+){2,}([a-zA-Z]{2,}\s*)$/`
- **Impact**: Users can enter non-English characters in English name field

### 3. Mobile Format Validation
**Missing**: KSA mobile format validation for `mobile`
- **Required**: `/^0*5\d{8}$/`
- **Impact**: Users can enter invalid mobile numbers

### 4. Age Validation Implementation
**Missing**: Age validation (minimum 12 years) is not called in form submission
- **Function exists** but never invoked in `UserProfileUpsert.vue`
- **Impact**: Users under 12 years old can submit the form

### 5. City Required Validation
**Missing**: City field has no required validation
- **Required**: Custom validation to ensure city is not null/undefined/empty
- **Impact**: Users can submit form without selecting a city

### 6. Email Format Validation
**Missing**: Email format validation for `email` field
- **Required**: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- **Impact**: Users can enter invalid email addresses

## Missing Template Features

### 7. Template Condition
**Missing**: `v-if="application?.requirements?.files"` condition
- **Impact**: Component renders when it shouldn't based on application requirements

### 8. Navigation Route
**Missing**: Navigation to "application-home" route after submission
- **Current**: Navigates to "app-summary"
- **Impact**: May break expected user flow

### 9. Event Emission
**Missing**: `emitter.emit("getApplication")` after successful submission
- **Impact**: Other components may not refresh application data

---

**Document Version**: 2.0  
**Last Updated**: 2026-01-06  
**Focus**: Only missing features from legacy component
