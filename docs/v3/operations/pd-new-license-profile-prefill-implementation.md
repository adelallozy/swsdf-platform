# Professional Diver New License Profile Prefill

**Status:** Implemented in current v3 code  
**Source:** promoted from the old planning notes and verified against current v3 code  
**Current component:** `src/v3/pages/applications/professional-divers/NewLicense.vue`

---

## Purpose

The Professional Diver New License page preloads the current user's profile before rendering the MasterForm. This restores the legacy prefill behavior while keeping the v3 schema-driven form flow.

---

## Confirmed Current Implementation

The current implementation:
- Loads regions and cities from `GET_REGIONS_CITIES`.
- Builds `region_id`, `city_id`, and `nationality` form options before rendering the form.
- Fetches the professional diver license profile from `PROFESSIONAL_DIVERS_APPS_GET_LICENSE_PROFILE`.
- Normalizes profile values through `normalizeProfileInitialValues(profile)`.
- Sets `initialValues` for `MasterForm`.
- Filters city options when the profile has `region_id`.
- Submits the final profile payload to `PROFESSIONAL_DIVERS_APPS_CREATE_LICENSE`.
- Redirects successful creations to `app-summary`.

---

## API Contract

### Profile Prefill Endpoint

Configured through:

```js
PROFESSIONAL_DIVERS_APPS_GET_LICENSE_PROFILE
```

Current fallback value in `src/v3/config/apiEndpoints.js`:

```js
professional-divers-applications/new-license-profile
```

Expected successful response shape:

```json
{
  "profile": {
    "id": 123,
    "user_id": 456,
    "name_ar": "Arabic Name",
    "name_en": "English Name",
    "identity_number": "1234567890",
    "nationality": "Saudi",
    "gender": "Male",
    "birthdate": "1990-01-01",
    "mobile": "966512345678",
    "email": "user@example.com",
    "region_id": 1,
    "city_id": 10,
    "address": "Street address",
    "status": "Active"
  }
}
```

### Conflict Behavior

Confirmed from the current component:
- A `409` with `application.id` redirects to `app-summary`.
- A `409` without `application.id` redirects to `professional-diver-license`.
- The user is shown the backend message when available.

---

## Form Data Flow

1. Component mounts.
2. `withLoading('profile-initializing', initialize)` starts.
3. Address options are loaded.
4. Nationality options are loaded.
5. Profile prefill endpoint is called.
6. If `profile` exists, `initialValues` is set from `normalizeProfileInitialValues(profile)`.
7. If `profile.region_id` exists, cities are filtered to that region.
8. MasterForm receives `schema`, `formOptions`, and `initialValues`.
9. On submit, `serializeProfile(formData)` builds the payload.
10. The application is created and the user is sent to `app-summary`.

---

## Error Handling

Confirmed from current code:
- `409`: notify and redirect to either the existing application summary or license profile page.
- `422`: apply server validation errors to MasterForm and show a validation notification.
- Other submit failures: capture with context `ProfessionalDiverNewLicense.onSubmit`.
- Non-conflict initialization failures: capture with context `ProfessionalDiverNewLicense.initialize`, notify, and redirect to `workspace`.

---

## Notes

- The old plan references `src/v3/pages/professional-divers/ProfessionalDiverNewLicense.vue`; the current component path is `src/v3/pages/applications/professional-divers/NewLicense.vue`.
- `VITE_PROFESSIONAL_DIVERS_APPS_GET_LICENSE_PROFILE` exists in `.env`.
- `address` is prefilled for display, but `serializeProfile()` currently omits `address` from the submitted payload.

---

## Related Docs

- [Professional Diver New License Requirements](../requirements/professional-diver-new-license.md)
- [Professional Diver New License Specs](../specs/professional-diver-new-license.md)
- [MasterForm Guide](../guides/masterform-guide.md)
- [User Profile Schema](../../../src/v3/schema/userProfile.js)
