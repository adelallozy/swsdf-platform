# Website To Current App Change Map

Date: 2026-05-20

Purpose: review checklist for matching changed files from `website` into `current_app`.

Source command:

```bash
git -C website status --short
```

Mapping rules:

- `website/src/...` usually maps to `current_app/src/...`.
- `website/docs_website/...` usually maps to `current_app/docs/...`.
- `website/docs_website/v3/payload-system.md` maps to `current_app/docs/v3/reference/payload-system.md`.
- Public website-only paths under `src/website/...` should not be reintroduced into current_app unless explicitly approved.

## Changed Files

| Status | Website path | Current app equivalent | Review note |
|---|---|---|---|
| M | `docs_website/v3/payload-system.md` | `docs/v3/reference/payload-system.md` | Equivalent exists. |
| M | `docs_website/v3/requirements/dive-center-applications.md` | `docs/v3/requirements/dive-center-applications.md` | Equivalent exists. |
| M | `docs_website/v3/requirements/diving-center-new-membership.md` | `docs/v3/requirements/diving-center-new-membership.md` | Equivalent exists. |
| M | `docs_website/v3/specs/professional-diver-license.md` | `docs/v3/specs/professional-diver-license.md` | Equivalent exists. |
| M | `src/composables/useApplicationStore.js` | `src/composables/useApplicationStore.js` | Equivalent exists. |
| M | `src/locales/ar.json` | `src/locales/ar.json` | Equivalent exists. |
| M | `src/locales/en.json` | `src/locales/en.json` | Equivalent exists. |
| M | `src/platform/components/Summary.vue` | `src/platform/components/Summary.vue` | Equivalent exists. |
| M | `src/platform/components/applications/ApplicationActionCard.vue` | `src/platform/components/applications/ApplicationActionCard.vue` | Equivalent exists. |
| M | `src/platform/components/applications/ApplicationCard.vue` | `src/platform/components/applications/ApplicationCard.vue` | Equivalent exists. |
| M | `src/platform/components/applications/ProfileDetails.vue` | `src/platform/components/applications/ProfileDetails.vue` | Equivalent exists. |
| M | `src/platform/components/applications/Summary.vue` | `src/platform/components/applications/Summary.vue` | Equivalent exists. |
| M | `src/platform/components/applications/UserProfileFiles.vue` | `src/platform/components/applications/UserProfileFiles.vue` | Equivalent exists. |
| M | `src/platform/components/applications/compititons/free-diving/AthletesCard.vue` | `src/platform/components/applications/compititons/free-diving/AthletesCard.vue` | Equivalent exists. |
| M | `src/platform/components/applications/compititons/free-diving/WorkLeaveCard.vue` | `src/platform/components/applications/compititons/free-diving/WorkLeaveCard.vue` | Equivalent exists. |
| M | `src/platform/components/applications/compititons/jetsky/Details.vue` | `src/platform/components/applications/compititons/jetsky/Details.vue` | Equivalent exists. |
| M | `src/platform/components/applications/compititons/underwater-photography/Details.vue` | `src/platform/components/applications/compititons/underwater-photography/Details.vue` | Equivalent exists. |
| M | `src/platform/components/applications/professional-diver/MembershipsReview.vue` | `src/platform/components/applications/professional-diver/MembershipsReview.vue` | Equivalent exists. |
| M | `src/platform/components/applications/professional-diver/ProfileDetails.vue` | `src/platform/components/applications/professional-diver/ProfileDetails.vue` | Equivalent exists. |
| M | `src/platform/components/applications/professional-diver/QualificationsReview1.vue` | `src/platform/components/applications/professional-diver/QualificationsReview1.vue` | Equivalent exists. |
| M | `src/platform/components/applications/professional-diver/WorkContracts.vue` | `src/platform/components/applications/professional-diver/WorkContracts.vue` | Equivalent exists. |
| M | `src/platform/components/competitions-applications/CompetitionIntroduction.vue` | `src/platform/components/competitions-applications/CompetitionIntroduction.vue` | Equivalent exists. |
| M | `src/platform/components/diving-centers/Membership.vue` | `src/platform/components/diving-centers/Membership.vue` | Equivalent exists. |
| M | `src/platform/components/widgets/application.vue` | `src/platform/components/widgets/application.vue` | Equivalent exists. |
| M | `src/platform/store/competitionRegistrationApplication.js` | `src/platform/store/competitionRegistrationApplication.js` | Equivalent exists. |
| M | `src/platform/views/Applications/competitions/free-diving/ApplicationReview.vue` | `src/platform/views/Applications/competitions/free-diving/ApplicationReview.vue` | Equivalent exists. |
| M | `src/v3/components/applications/ApplicationCard.vue` | `src/v3/components/applications/ApplicationCard.vue` | Equivalent exists. |
| M | `src/v3/components/applications/cards/ActionsTrackingCard.vue` | `src/v3/components/applications/cards/ActionsTrackingCard.vue` | Equivalent exists. |
| M | `src/v3/components/applications/cards/ApplicationInfoCard.vue` | `src/v3/components/applications/cards/ApplicationInfoCard.vue` | Equivalent exists. |
| M | `src/v3/components/applications/cards/DivingCenterInternationalMembershipsCard.vue` | `src/v3/components/applications/cards/DivingCenterInternationalMembershipsCard.vue` | Equivalent exists. |
| M | `src/v3/composables/application/useApplicationStore.js` | `src/v3/composables/application/useApplicationStore.js` | Equivalent exists. |
| M | `src/v3/composables/useApplicationStore.js` | `src/v3/composables/useApplicationStore.js` | Equivalent exists. |
| M | `src/v3/config/apiEndpoints.js` | `src/v3/config/apiEndpoints.js` | Equivalent exists. |
| M | `src/v3/config/application-config.js` | `src/v3/config/application-config.js` | Equivalent exists. |
| M | `src/v3/pages/app/dive-centers/DiveCenterProfile.vue` | `src/v3/pages/app/dive-centers/DiveCenterProfile.vue` | Equivalent exists. |
| M | `src/v3/pages/applications/ApplicationSummary.vue` | `src/v3/pages/applications/ApplicationSummary.vue` | Equivalent exists. |
| M | `src/v3/pages/applications/dive-centers/NewMembership.vue` | `src/v3/pages/applications/dive-centers/NewMembership.vue` | Equivalent exists. |
| M | `src/v3/pages/applications/professional-divers/AddContract.vue` | `src/v3/pages/applications/professional-divers/AddContract.vue` | Equivalent exists. |
| M | `src/v3/pages/applications/professional-divers/AddMembership.vue` | `src/v3/pages/applications/professional-divers/AddMembership.vue` | Equivalent exists. |
| M | `src/v3/pages/applications/sport-fishing/ParticipantAdd.vue` | `src/v3/pages/applications/sport-fishing/ParticipantAdd.vue` | Equivalent exists. |
| M | `src/v3/pages/invoices/index.vue` | `src/v3/pages/invoices/index.vue` | Equivalent exists. |
| M | `src/v3/pages/professional-divers/ProfessionalDiverProfile.vue` | `src/v3/pages/professional-divers/ProfessionalDiverProfile.vue` | Equivalent exists. |
| M | `src/website/profile/diving-center/show/show/Details.vue` | none | Public website path removed from current_app; do not port by default. |
| ?? | `docs_website/v3/requirements/application-workflow-alignment.md` | none | No current_app equivalent exists yet. Create only if future review needs this replay doc. |
| ?? | `docs_website/v3/specs/application-workflow-alignment.md` | none | No current_app equivalent exists yet. Create only if future review needs this replay doc. |
| ?? | `docs_website/v3/specs/dive-center-applications.md` | `docs/v3/specs/dive-center-applications.md` | Equivalent exists. |
| ?? | `src/v3/utils/applicationWorkflow.js` | `src/v3/utils/applicationWorkflow.js` | Equivalent exists. |

## Review Notes

- This file is a path map, not proof that contents are identical.
- Before copying any website change into current_app, confirm the current_app private-app boundary in `docs/START_HERE.md`.
- For translation work, keep literal English keys in code and add Arabic translations only to `src/locales/ar.json`.
