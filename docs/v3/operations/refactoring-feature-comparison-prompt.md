# Professional Diver New License Refactoring - Feature Comparison Task

## Context
We are refactoring the Professional Diver New License application from legacy architecture to v3 architecture. The refactoring involves replacing multiple legacy components with new v3 components while ensuring all features are preserved.

## Original Components (Legacy Architecture)

### 1. NewLicense.vue
**Location:** `src/platform/views/Applications/professional-divers/NewLicense.vue`

**Key Features:**
- **License Validation**: Checks if user already has a license before allowing new application
- **Profile Form**: Uses UserProfileForm component for user profile data entry
- **API Integration**: Uses axios for API calls
- **Loading States**: Shows loader during initial data fetch
- **Submit Handler**: POSTs form data to NEW_LICENSE endpoint
- **Navigation**: Redirects to application-home page after successful submission
- **Error Handling**: Displays toast notifications on errors
- **Breadcrumbs**: Shows navigation breadcrumb trail

**API Endpoints:**
- GET: `VITE_APPS_USERS_PROFILES_PICK` - Fetches user profile
- POST: `VITE_PROFESSIONAL_DIVERS_NEW_LICENSE` - Submits new license application

**Key Logic:**
```javascript
// License check - user should not have existing license
axios.get(USERS_PROFILE).then(setUserProfile).catch(onFetchFailure);

// Submit handler
function submitProfile(values) {
  axios.post(NEW_LICENSE, values)
    .then((res) => {
      router.push({
        name: "application-home",
        params: { id: res.data.application.id }
      });
    });
}
```

### 2. UserProfileForm.vue
**Location:** `src/platform/components/applications/UserProfileForm.vue`

**Key Features:**
- **Profile Information Form**: Collects user's personal information
- **Identity Information**: National ID, date of birth, place of birth
- **Contact Information**: Phone, email, address details
- **Region/City Selection**: Cascading dropdown for region and city
- **Form Validation**: Validates required fields and data formats
- **Submit Event**: Emits submit event with form data
- **Loading State**: Shows loading indicator during submission

**Form Fields Include:**
- First Name (Arabic/English)
- Last Name (Arabic/English)
- National ID
- Date of Birth
- Place of Birth
- Gender
- Phone Number
- Email Address
- Region
- City
- Address Details
- Postal Code

## New Components (v3 Architecture)

### 1. NewLicense.vue (v3)
**Location:** `src/v3/pages/applications/professional-divers/NewLicense.vue`

**Key Features:**
- **Profile Prefill + Pre-validation**: Calls `newLicenseProfile` endpoint to load the active profile and prevent duplicates
- **Profile Form**: Uses MasterForm with user profile schema
- **API Integration**: Uses apiGet/apiPost from httpClient
- **Loading States**: Uses useLoading composable
- **Submit Handler**: Submits to PD license API endpoint
- **Navigation**: Redirects to `app-summary` after successful submission
- **Error Handling**: Uses useErrorHandler composable
- **Notifications**: Uses useNotification composable

**API Endpoints:**
- GET: `/professional-divers-applications/new-license-profile` - Prefill profile + pre-validation
- POST: `/professional-divers-applications/new-license` - Create new license application

### 2. UpdateLicenseInformations.vue (License Information Step)
**Location:** `src/v3/pages/applications/professional-divers/UpdateLicenseInformations.vue`

**Key Features:**
- **Rank + Card Design**: Collects `rank` and `card_design_id` (printing service toggle)
- **Unified Payload**: Prefills from `applications/byId` payload key `pd_license`
- **API Integration**: Saves via `professional-divers-applications/set-services/{appId}`
- **Navigation**: Returns to `app-summary` after save

### 3. PDLicenseInformationCard.vue (Summary Card)
**Location:** `src/v3/components/applications/cards/PDLicenseInformationCard.vue`

**Key Features:**
- Displays `rank` + `card_design_id` from `store.payload.pd_license`
- Status based on `application.progress['Professional Diver Rank']`
- Edit link routes to `pd-license-info-update`

### 4. UserProfileUpsert.vue (Reference Component)
**Location:** `src/v3/pages/applications/UserProfileUpsert.vue`

**Key Features:**
- **Profile Information Form**: Uses MasterForm with user profile schema
- **API Integration**: Uses useApplicationStore for unified entity loading
- **Loading States**: Uses useLoading composable
- **Submit Handler**: Submits to profile API endpoint
- **Error Handling**: Uses useErrorHandler composable
- **Notifications**: Uses useNotification composable

## Task: Feature Comparison and Gap Analysis

### Objective
Perform a comprehensive comparison between the original components and new components to identify:
1. **Missing Features**: Features present in original but not in new implementation
2. **Feature Differences**: Features that work differently between old and new
3. **Additional Features**: Features in new implementation not present in original
4. **Data Flow Differences**: How data flows through the components
5. **Validation Differences**: How validation is handled
6. **API Integration Differences**: How API calls are structured
7. **User Experience Differences**: How the user interacts with the forms

### Analysis Steps

#### Step 1: Read and Analyze Original Components
1. Read `src/platform/views/Applications/professional-divers/NewLicense.vue`
2. Read `src/platform/components/applications/UserProfileForm.vue`
3. Document all features, props, events, methods, and data flow

#### Step 2: Read and Analyze New Components
1. Read `src/v3/pages/applications/professional-divers/NewLicense.vue`
2. Read `src/v3/pages/applications/professional-divers/UpdateLicenseInformations.vue`
3. Read `src/v3/components/applications/cards/PDLicenseInformationCard.vue`
4. Read `src/v3/pages/applications/UserProfileUpsert.vue` (as reference)
5. Read `src/v3/schema/userProfile.js` (schema builder)
6. Document all features, props, events, methods, and data flow

#### Step 3: Compare Component Structure
1. **Template Structure**: Compare HTML structure and component hierarchy
2. **Script Setup**: Compare imports, refs, computed properties, methods
3. **State Management**: Compare how state is managed
4. **Event Handling**: Compare how events are emitted and handled
5. **Form Structure**: Compare form fields and their organization

#### Step 4: Compare Features
For each feature in the original component, check if it exists in the new component:

**NewLicense.vue Features to Check:**
- [ ] License validation logic
- [ ] User profile fetching
- [ ] Profile form display
- [ ] Loading state management
- [ ] Submit handler
- [ ] Error handling
- [ ] Success navigation
- [ ] Breadcrumb display
- [ ] API endpoint configuration
- [ ] Data transformation before submission

**UserProfileForm.vue Features to Check:**
- [ ] All form fields present
- [ ] Field validation rules
- [ ] Cascading select (region/city) behavior
- [ ] Form layout and styling
- [ ] Required field indicators
- [ ] Error message display
- [ ] Submit button state
- [ ] Form data structure

#### Step 5: Compare Data Flow
1. **Initial Load**: How data is loaded when component mounts
2. **User Input**: How user input is captured and stored
3. **Form Submission**: How form data is prepared and submitted
4. **Success Response**: How successful responses are handled
5. **Error Response**: How errors are handled and displayed

#### Step 6: Compare API Integration
1. **API Endpoints**: Compare endpoints used
2. **Request Format**: Compare request structure and headers
3. **Response Format**: Compare how responses are parsed
4. **Error Handling**: Compare how API errors are handled
5. **Loading States**: Compare how loading states are managed

#### Step 7: Compare Validation
1. **Validation Rules**: Compare field validation rules
2. **Validation Timing**: Compare when validation occurs
3. **Error Display**: Compare how validation errors are displayed
4. **Form State**: Compare how form validity is tracked

#### Step 8: Compare User Experience
1. **Loading Indicators**: Compare how loading is shown
2. **Error Messages**: Compare how errors are communicated
3. **Success Feedback**: Compare how success is communicated
4. **Navigation Flow**: Compare how user navigates through the form
5. **Form Layout**: Compare how form is organized and styled

#### Step 9: Identify Gaps
Create a comprehensive list of:
1. **Missing Features**: Features in original not in new
2. **Feature Differences**: Features that work differently
3. **Additional Features**: Features in new not in original
4. **Potential Issues**: Areas that might cause problems
5. **Improvements**: Areas where new implementation is better

#### Step 10: Create Gap Analysis Document
Create a detailed document `docs/v3/operations/refactoring-gap-analysis.md` with:
1. **Executive Summary**: High-level overview of findings
2. **Component Comparison**: Side-by-side comparison of each component
3. **Feature Matrix**: Table showing which features are present/missing
4. **Data Flow Diagram**: Visual representation of data flow differences
5. **Gap Details**: Detailed explanation of each gap
6. **Recommendations**: Action items to address gaps
7. **Risk Assessment**: Potential risks and mitigation strategies

### Required Documentation

#### 1. Feature Comparison Matrix
Create a table like:

| Feature | Original (NewLicense.vue) | New (v3 NewLicense.vue) | Status | Notes |
|---------|---------------------------|----------------------------------------|--------|-------|
| License Validation | ✅ Implemented | ✅ Implemented | ✅ Match | Both check for existing license |
| Profile Fetching | ✅ GET /users/profiles/pick | ✅ GET /pd/applications/new-license/profile | ⚠️ Different | Different endpoints |
| Submit Handler | ✅ POST /pd/new-license | ✅ POST /pd/applications/new-license | ⚠️ Different | Different endpoints |
| ... | ... | ... | ... | ... |

#### 2. Data Flow Comparison
Document how data flows through each component:
- Original: Component → API → Response → Update State
- New: Component → Store → API → Response → Update Store → Update Component

#### 3. API Endpoint Mapping
Map original endpoints to new endpoints:
- `VITE_APPS_USERS_PROFILES_PICK` → `/professional-divers/applications/new-license/profile`
- `VITE_PROFESSIONAL_DIVERS_NEW_LICENSE` → `/professional-divers/applications/new-license`

#### 4. Form Field Mapping
Map form fields from original to new:
- Original field name → New field name → Data type → Validation

#### 5. Validation Rule Comparison
Compare validation rules for each field:
- Original validation → New validation → Match/No Match

### Key Questions to Answer

1. **Does the new component check if user already has a license?**
   - How is this check performed?
   - What happens if user already has a license?
   - Is the error message clear?

2. **Are all profile fields present in the new component?**
   - Are there any missing fields?
   - Are field names consistent?
   - Are field types consistent?

3. **Does the cascading select (region/city) work correctly?**
   - Does it filter cities based on selected region?
   - Does it handle initial data correctly?
   - Does it handle user input correctly?

4. **Is the submit flow the same?**
   - What data is submitted?
   - How is the data transformed?
   - What happens on success?
   - What happens on error?

5. **Are loading states handled the same?**
   - When is loading shown?
   - How is loading displayed?
   - Is user blocked during loading?

6. **Are error messages the same?**
   - What errors are caught?
   - How are errors displayed?
   - Are error messages user-friendly?

7. **Is the navigation flow the same?**
   - Where does user go on success?
   - Where does user go on error?
   - Are breadcrumbs correct?

8. **Are there any breaking changes?**
   - Will existing users notice differences?
   - Are there any regressions?
   - Are there any improvements?

### Success Criteria

The analysis is complete when:
1. ✅ All original components have been read and analyzed
2. ✅ All new components have been read and analyzed
3. ✅ Feature comparison matrix is complete
4. ✅ Data flow comparison is documented
5. ✅ API endpoint mapping is complete
6. ✅ Form field mapping is complete
7. ✅ Validation rule comparison is complete
8. ✅ All gaps have been identified
9. ✅ Recommendations have been made
10. ✅ Gap analysis document is created

### Deliverables

1. **Feature Comparison Matrix**: Table comparing all features
2. **Data Flow Comparison**: Documentation of data flow differences
3. **API Endpoint Mapping**: Mapping of old to new endpoints
4. **Form Field Mapping**: Mapping of old to new form fields
5. **Validation Rule Comparison**: Comparison of validation rules
6. **Gap Analysis Document**: Comprehensive gap analysis with recommendations

### Notes

- **Critical**: Original components MUST NOT be modified during this analysis
- **Focus**: Identify gaps, don't fix them yet
- **Detail**: Be thorough and document everything
- **Clarity**: Use clear, specific language
- **Evidence**: Provide code examples for each finding
- **Context**: Explain why differences matter

### References

- Original component: `src/platform/views/Applications/professional-divers/NewLicense.vue`
- New component: `src/v3/pages/applications/professional-divers/NewLicense.vue`
- Refactoring guide: `docs/v3/guides/refactoring-guide.md`
- Global guide: `docs/v3/guides/global-guide.md`
- MasterForm guide: `docs/v3/guides/masterform-guide.md`
- Payload system: `docs/v3/reference/payload-system.md`
- Issues and fixes: `docs/v3/reference/issues-and-fixes.md`

---

**Start by reading all the components and documenting their features, then perform the comparison analysis.**
