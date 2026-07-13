# Athlete Profile Renewal - Component Specifications

**Component:** `AthleteProfile.vue`  
**Location:** `src/v3/pages/athletes/`  
**Route:** `/app/:locale(ar|en)/athlete-profile`  
**Version:** 1.0  
**Last Updated:** 2026-03-12

---

## Overview

The athlete profile page is the v3 user dashboard for existing athlete registrations. It loads the user's athlete identity, portrait, and all sport registrations, then exposes per-sport actions for renewal and, when eligible, membership-to-license upgrade.

A single user may have multiple sports. Each sport card can independently start or resume a renewal application. `jetski` and `flyboard` membership rows may also start a license-upgrade application. Successful action creation or duplicate resume both redirect to `app-summary`.

---

## Scope

### In Scope
- athlete profile dashboard load
- athlete photo and identity header
- multiple sport cards
- renewal action per sport
- license-upgrade action for eligible motorized membership rows
- card download for valid licenses/cards
- redirection into athlete renewal summary flow

### Out of Scope
- editing shared user profile from this page
- editing application sport from this page
- application summary itself
- admin athlete management

---

## Route and Component

- **Route:** `/app/:locale(ar|en)/athlete-profile`
- **Name:** `athlete-profile`
- **Component:** `src/v3/pages/athletes/AthleteProfile.vue`

---

## Data Loading Specification

### Endpoint
- `GET athletes/view`
- Frontend constant: `ATHLETES_GET_PROFILE`

### Expected Response Buckets
- `userProfile`
- `userPicture`
- `sports`

### Header Data Source
The page header uses:
- athlete name from `userProfile`
- identity number from `userProfile.identity_number` or first sport fallback
- athlete number from first sport `user_id` or profile fallback
- photo from `userPicture.portrait_link` or `userPicture.link`

### Media URL Handling
Relative media links are normalized with `MEDIA_BASE_URL`.

---

## Sport Card Specification

Each sport row is transformed into a card with:
- resolved sport code
- resolved sport label
- registration type
- status label
- expiry date
- optional category
- renew button
- optional upgrade-to-license button
- optional download card button

### Sport Labeling
Sport labels are resolved through `getAthleteSportLabel()` from `athleteSport.js`, so the UI does not expose raw backend sport codes.

### Registration Type
`registration_type` is returned by backend and drives the renew button label:
- `membership` -> `Renew membership`
- `license` -> `Renew license`
- fallback -> `Renew`

Renewal flow selection also follows the current athlete row `registration_type`, so motorized sports do not automatically renew as `license` unless the existing record is already a license.

### Status Rendering
Card styling changes by status:
- `Valid`
- `Expired`
- `Terminated`
- generic fallback state

### Renew Visibility Rule
Renew button is shown when:
- the record is not terminated, and
- expiry date exists, and
- expiry date is already passed, or the current date is within 3 calendar months before expiry

The backend athlete profile response provides `can_renew` so the dashboard can follow the same renewal rule enforced by the renew endpoint.

### License Upgrade Visibility Rule
Upgrade button is shown when:
- sport is `jetski` or `flyboard`
- current `registration_type` is `membership`
- record is not terminated

The backend athlete profile response provides `can_upgrade_license` so the dashboard follows the same upgrade rule enforced by the upgrade endpoint.

### Download Button Rule
Download card button is shown only when:
- status is `Valid`
- `card_url` exists after media URL normalization

---

## Action Specification

### Renewal Endpoint
- `POST athletes-applications/renew/{sportCode}`
- Frontend constant: `ATHLETES_RENEW_MEMBERSHIP`

### Success Behavior
- backend returns `application.id`
- page redirects to `app-summary`
- success notification is shown

### Duplicate/In-Progress Behavior
If backend returns `409` with an existing application id:
- user is redirected to that existing `app-summary`
- info notification is shown instead of a hard failure

### Concurrency Rule
Only one sport action may run at a time. The page stores action state and disables concurrent renew/upgrade clicks.

### License Upgrade Endpoint
- `POST athletes-applications/upgrade-license/{sportCode}`
- Frontend constant: `ATHLETES_UPGRADE_LICENSE`

Allowed sports:
- `jetski`
- `flyboard`

Upgrade behavior:
- requires an existing athlete row for the same sport
- requires current `registration_type = membership`
- creates or resumes a `motorized_water_sports_new_license` application
- redirects to `app-summary` on success or duplicate resume

---

## UX and Presentation

### Header Section
The profile page shows:
- athlete photo or initials fallback
- athlete display name
- identity number
- athlete number
- refresh action

### Cards Grid
Sports are rendered in a responsive grid:
- 1 column on small screens
- 2 columns on medium screens
- 3 columns on large screens

### Visual System
The page uses Tailwind utility styling only. Status-specific visual treatment is implemented in the component through helper functions:
- `cardBgBase()`
- `cardBorderClass()`
- `ribbonClass()`
- `meshBlobs()`

---

## Error Handling Specification

### Load Errors
- `404` redirects to athlete instructions route
- other errors show notification and keep the page in error state
- errors are captured with `useErrorHandler`

### Renewal Errors
- generic errors show notification
- `409` with application id redirects to summary
- `409` without application id shows the backend eligibility message
- unexpected errors are captured with context metadata

### Upgrade Errors
- generic errors show notification
- `409` with application id redirects to summary
- `409` without application id shows the backend upgrade rule message
- unexpected errors are captured with context metadata

---

## Backend Dependency

The backend athlete profile response must include:
- `registration_type` for correct renew button labeling
- `can_renew` for the unified 3-month renewal rule
- `can_upgrade_license` for membership-to-license upgrade visibility

Related backend file:
- `api/src/Controller/Api/AthletesController.php`

---

## Related Files

### Frontend
- `src/v3/pages/athletes/AthleteProfile.vue`
- `src/v3/schema/applications/athleteSport.js`
- `src/v3/config/apiEndpoints.js`

### Backend
- `api/src/Controller/Api/AthletesController.php`
- `api/src/Controller/Api/AthletesApplicationsController.php`

---

## Related Documents

- [Athlete Profile Renewal Requirements](../requirements/athlete-profile-renewal.md)
- [Athlete Registration Specs](./athlete-registration.md)
- [Athlete Registration Requirements](../requirements/athlete-registration.md)
