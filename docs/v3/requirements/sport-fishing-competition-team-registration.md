# Sport Fishing Competition Team Registration Requirements

**Scope:** v3 sport fishing competition team applications  
**Application type:** `sport-fishing-competition-team-registration`  
**Primary pages:** `TeamUpsert.vue`, `ParticipantAdd.vue`, `ApplicationSummary.vue`

---

## Overview

Sport Fishing Competition Team Registration lets an authenticated user create or update a team application for a sport fishing event, manage team participants, upload required documents, and submit the application from the shared v3 application summary.

Confirmed from current code:
- Create route: `sport-fishing-register`
- Update route: `fishing-team-update`
- Participant add route: `fishing-participant-add`
- Summary route: `app-summary`
- The summary layout is configured in `src/v3/config/application-config.js`.

---

## Business Requirements

1. **Team Required**
   - The application must have team information.
   - At least one team name must be present for summary validation.

2. **Participants Required**
   - Minimum participants: 3.
   - Maximum participants: 5.
   - Participants can be added only while the application is editable.

3. **Required Files**
   - Boat Registration Certificate
   - Boat Driver License
   - Boat Owner Identity
   - Medical Examination

4. **Application Summary**
   - The application is reviewed and submitted through `ApplicationSummary.vue`.
   - Blocking validation is reported by cards through `useApplicationStore`.

5. **Fees**
   - If quotations are present in payload, `ApplicationFeesCard` displays fee details and payment actions.

---

## Functional Requirements

### FR-1: Create or Update Team

The team form uses `src/v3/pages/applications/sport-fishing/TeamUpsert.vue`.

The schema is defined in:

```text
src/v3/schema/applications/sportFishingTeam.js
```

Documented fields include:
- `team_name_ar`
- `team_name_en`
- `boat_name`
- `boat_owner_name`
- `boat_owner_identity_number`
- `boat_captain_name`
- `boat_registration_number`
- `boat_hull_number`
- `boat_operating_port`
- `boat_length_cm`
- `boat_width_cm`
- `boat_mmsi`

### FR-2: Show Team Summary

`SFTeamCard.vue` displays:
- Team captain
- Team names
- Fishing category when available
- Boat information
- Boat owner information
- Registration and hull numbers
- MMSI
- Boat dimensions in meters
- Operating port

The edit action routes to `fishing-team-update` when `store.canModifyApplication.value` is true.

### FR-3: Manage Participants

`ParticipantAdd.vue` adds participants through `useEventsApplicationsApi().sportFishingAddParticipant`.

Participant schema fields:
- `athlete_id`
- `role`
- `employee_number`
- `leave_responsible`

`SFParticipantsCard.vue`:
- Reads participants from `store.payload.sf_participants.value`.
- Requires at least 3 participants.
- Allows at most 5 participants.
- Registers a primary action that routes to `fishing-participant-add`.
- Deletes participants through `sportFishingDeleteParticipant`.

### FR-4: Upload Required Files

Required file validation is handled by the shared files flow and the `files` payload key.

Required files for this application type:
- Boat Registration Certificate
- Boat Driver License
- Boat Owner Identity
- Medical Examination

### FR-5: Submit Application

The shared summary page enables submit only when all blocking steps are valid.

Blocking steps configured for this application type:
- `sf_team`
- `sf_participants`
- `files`

---

## Payload Contract

Configured payload keys:

```js
[
  "event",
  "sf_team",
  "sf_participants",
  "files",
  "quotations",
  "actions"
]
```

---

## Related Docs

- [Sport Fishing Competition Team Registration Specs](../specs/sport-fishing-competition-team-registration.md)
- [ApplicationSummary Page](../pages/ApplicationSummary.md)
- [Payload System](../reference/payload-system.md)
- [Application Fees Card Requirements](./application-fees-card.md)

