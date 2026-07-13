# Athlete Profile Renewal - Requirements and Specifications

**Component:** `AthleteProfile.vue`  
**Route:** `/app/:locale(ar|en)/athlete-profile`  
**Version:** 1.0  
**Last Updated:** 2026-03-12

---

## 1. Business Requirements

### 1.1 Core Goal
Existing athletes must be able to review their current sport registrations and start renewal applications per sport from one consolidated dashboard. Eligible `jetski` and `flyboard` membership rows must also be able to start a license application from the same dashboard.

### 1.2 Multiple Sports
- An athlete may hold registrations in multiple sports
- The dashboard must render each sport independently
- Renewal must be initiated per sport, not globally

### 1.3 Renewal Variants
The renewal dashboard must support both membership and license renewals.

The UI must not assume all athlete renewals are licenses.

Renewal type must follow the existing athlete row `registration_type`, not sport motorization alone.

### 1.4 Resume Existing Renewal
If a renewal application for the selected sport already exists and is still in progress, the user must be redirected to that existing application summary rather than blocked without guidance.

### 1.5 Unified Completion Path
Once a renewal application is created or resumed, completion must happen in the shared `app-summary` flow used by athlete applications.

### 1.6 License Upgrade Eligibility
Only `jetski` and `flyboard` membership registrations may start a license application from athlete profile.

The dashboard must not show upgrade for:
- non-motorized sports
- existing license rows
- terminated rows

---

## 2. Functional Requirements

### FR-1: Profile Dashboard Load
**Priority:** Critical  
**Description:** Load athlete profile header and sport registrations from backend.

**Acceptance Criteria:**
- Page loads `userProfile`, `userPicture`, and `sports`
- Athlete header displays name and identity number when available
- Photo uses portrait image or initials fallback

### FR-2: Multi-Sport Rendering
**Priority:** Critical  
**Description:** Render one card per sport registration.

**Acceptance Criteria:**
- Empty state shown when no sports exist
- Each card shows at least sport name, status, and expiry date
- Category is displayed when available
- Registration type badge is displayed when available

### FR-3: Human-Friendly Sport Labels
**Priority:** High  
**Description:** Sport cards must use resolved labels instead of raw sport codes.

**Acceptance Criteria:**
- `sport_fishing` is not shown raw in UI
- label resolution uses the athlete sport helper
- unknown codes fall back to humanized text rather than raw underscore format when possible

### FR-4: Renew Action
**Priority:** Critical  
**Description:** Start renewal for a selected sport.

**Acceptance Criteria:**
- Renew button posts to `athletes-applications/renew/{sportCode}`
- Button label reflects registration type when known
- Success redirects to `app-summary`
- Success notification is shown

### FR-5: Renew Availability Rule
**Priority:** High  
**Description:** Only show renewal when the sport is eligible by date rule.

**Acceptance Criteria:**
- Renew button is visible when expiry is within 3 calendar months
- Renew button is visible when already expired
- Renew button is hidden when expiry is farther than 3 calendar months away
- Renew button is hidden when the registration is terminated
- Renew button is hidden when expiry date is missing

### FR-6: Duplicate/In-Progress Renewal Handling
**Priority:** Critical  
**Description:** Resume existing renewal applications when backend reports conflict.

**Acceptance Criteria:**
- `409` with application id redirects to `app-summary`
- user receives an informational notification
- no duplicate renewal request continues running after redirect

### FR-7: Download Valid Card
**Priority:** Medium  
**Description:** Allow downloading card for valid registrations when a card file exists.

**Acceptance Criteria:**
- Download button appears only for `Valid` rows
- Button is disabled if no card URL exists
- Button opens card in a new tab/window

### FR-8: Single Active Renewal Operation
**Priority:** Medium  
**Description:** Prevent parallel renew submissions.

**Acceptance Criteria:**
- only one renew button can be in loading state at a time
- other renew actions are disabled while one request is active

### FR-9: License Upgrade Action
**Priority:** High  
**Description:** Start license application from eligible `jetski` and `flyboard` membership rows.

**Acceptance Criteria:**
- Upgrade button posts to `athletes-applications/upgrade-license/{sportCode}`
- Button appears only for eligible rows
- Success redirects to `app-summary`
- Duplicate/in-progress upgrade redirects to existing `app-summary`
- User receives success or informational notification

### FR-10: Single Active Sport Action
**Priority:** Medium  
**Description:** Prevent renew and upgrade actions from running in parallel.

**Acceptance Criteria:**
- only one sport action may be in loading state at a time
- renew and upgrade buttons are disabled while another sport action is running

---

## 3. Non-Functional Requirements

### NFR-1: Shared Routing Consistency
- Renewal creation and duplicate resume must both land in `app-summary`
- The dashboard must not send athlete renewals to legacy athlete application review pages

### NFR-2: Internationalization
- Sport labels, status labels, button labels, and notices must use i18n-aware rendering
- Arabic and English must both be supported

### NFR-3: Error Handling
- Load failures must show user feedback
- Unexpected errors must be captured with context for debugging
- `404` athlete-not-found condition must redirect cleanly

### NFR-4: Maintainability
- Sport label logic must reuse the shared athlete sport helper
- Renewal type label must use backend `registration_type`, not guessed strings in frontend

---

## 4. Technical Requirements

### 4.1 Frontend Files
- `src/v3/pages/athletes/AthleteProfile.vue`
- `src/v3/schema/applications/athleteSport.js`
- `src/v3/config/apiEndpoints.js`

### 4.2 Backend Files
- `api/src/Controller/Api/AthletesController.php`
- `api/src/Controller/Api/AthletesApplicationsController.php`

### 4.3 Endpoints
- `GET athletes/view`
- `POST athletes-applications/renew/{sportCode}`
- `POST athletes-applications/upgrade-license/{sportCode}`

### 4.4 Required Backend Fields
Each sport row returned to the dashboard must provide enough data for rendering and renew logic, including:
- `id`
- `sport`
- `status`
- `expiry_date`
- `can_renew`
- `can_upgrade_license`
- `registration_type`
- optional `category`
- optional `card_url`

---

## 5. Acceptance Checklist

1. Open `/app/ar/athlete-profile`
2. Confirm profile header renders athlete name and identity information
3. Confirm all sports are rendered as separate cards
4. Confirm sport labels are human-readable
5. Confirm membership rows show renew label for membership
6. Confirm license rows show renew label for license
7. Start renewal on one sport and confirm redirect to `app-summary`
8. Trigger duplicate/in-progress renewal and confirm redirect to the existing `app-summary`
9. Start license upgrade on eligible `jetski` or `flyboard` membership row and confirm redirect to `app-summary`
10. Trigger duplicate/in-progress upgrade and confirm redirect to the existing `app-summary`
11. Confirm valid rows can download card when `card_url` exists

---

## 6. Related Documents

- [Athlete Profile Renewal Specs](../specs/athlete-profile-renewal.md)
- [Athlete Registration Specs](../specs/athlete-registration.md)
- [Athlete Registration Requirements](./athlete-registration.md)
