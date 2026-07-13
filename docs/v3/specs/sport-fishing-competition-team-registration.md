# Sport Fishing Competition Team Registration Specs

**Application type:** `sport-fishing-competition-team-registration`  
**Config source:** `src/v3/config/application-config.js`

---

## Source Files

| Area | File |
|---|---|
| Create/update team page | `src/v3/pages/applications/sport-fishing/TeamUpsert.vue` |
| Add participant page | `src/v3/pages/applications/sport-fishing/ParticipantAdd.vue` |
| Team schema | `src/v3/schema/applications/sportFishingTeam.js` |
| Participant schema | `src/v3/schema/applications/fishingParticipant.js` |
| Team summary card | `src/v3/components/applications/cards/SFTeamCard.vue` |
| Participants summary card | `src/v3/components/applications/cards/SFParticipantsCard.vue` |
| API composable | `src/v3/composables/application/useEventsApplicationsApi.js` |
| Shared summary page | `src/v3/pages/applications/ApplicationSummary.vue` |

---

## Routes

| Route name | Purpose |
|---|---|
| `sport-fishing-register` | Create team application for an event |
| `fishing-team-update` | Update team information for an existing application |
| `fishing-participant-add` | Add a participant to the team |
| `app-summary` | Review, complete, and submit the application |

---

## Application Config

Configured summary layout:

```js
[
  "ApplicationInfoCard",
  "EventInfoCard",
  "SFTeamCard",
  "SFParticipantsCard",
  "FilesCard",
  "ApplicationFeesCard",
  "ActionsTrackingCard"
]
```

Configured blocking steps:

| Step ID | Component | Action route |
|---|---|---|
| `sf_team` | `SFTeamCard` | `fishing-team-update` |
| `sf_participants` | `SFParticipantsCard` | `fishing-participant-add` |
| `files` | `FilesCard` | `app-new-files` |

Configured file requirements:

```js
[
  "Boat Registration Certificate",
  "Boat Driver License",
  "Boat Owner Identity",
  "Medical Examination"
]
```

---

## Team Schema

`makeSportFishingTeamSchema()` defines team and boat fields.

Validation notes confirmed from schema:
- `boat_owner_identity_number` uses a 10-digit pattern.
- `boat_mmsi` uses a 9-digit pattern.
- Boat length and width are entered in meters with up to two decimal places.
- Several text fields allow empty string and cap length.

---

## Participant Schema

`makeFishingParticipantSchema()` defines:

| Field | Type | Required | Notes |
|---|---|---|---|
| `athlete_id` | text | Yes | 10 digits starting with 1 or 2 |
| `role` | select | Yes | `member` or `team-leader` |
| `employee_number` | text | No | Max 240 characters |
| `leave_responsible` | text | No | Max 240 characters |

---

## Summary Cards

### `SFTeamCard`

Reads from:

```js
store.payload.sf_team.value
```

Validation:
- If team data exists, at least one of `team_name_ar` or `team_name_en` is required.
- Validation errors are synced through `store.setStepError('sf_team', errors)`.

Primary action:
- `store.registerStepPrimaryAction('sf_team', editTeam)`

### `SFParticipantsCard`

Reads from:

```js
store.payload.sf_participants.value
```

Validation:
- Minimum participants: 3.
- Maximum participants: 5.
- Validation errors are synced through `store.setStepError('sf_participants', errors)`.

Primary action:
- `store.registerStepPrimaryAction('sf_participants', navigateToAdd)`

Delete behavior:
- Uses `sportFishingDeleteParticipant(participant.id)`.
- Reloads payload through `store.reloadApplicationPayload()`.

---

## API Endpoints

Endpoint constants are defined in `src/v3/config/apiEndpoints.js` and consumed by `useEventsApplicationsApi.js`.

Confirmed sport fishing operations:
- Load event
- Create sport fishing team
- Update sport fishing team
- Load team by application
- Fetch participants
- Add participant
- Delete participant

---

## Related Docs

- [Sport Fishing Competition Team Registration Requirements](../requirements/sport-fishing-competition-team-registration.md)
- [ApplicationSummary Page](../pages/ApplicationSummary.md)
- [Payload System](../reference/payload-system.md)
- [Application Fees Card Specs](./application-fees-card.md)

