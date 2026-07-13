# SWSDF App Pages List

This document lists all pages of the SWSDF private platform. All app routes are under `/app`. Authentication routes are at the root level. For the complete auto-generated route inventory, see `../../reference/website-pages.md`.

## Table of Contents

- [App (Authenticated)](#app-authenticated)
- [Authentication (Guest)](#authentication-guest)
- [System Pages](#system-pages)

---

## App (Authenticated)

All routes below are children of `/app` and require authentication. The root `/` redirects to `/app`.

### Workspace

| Route | Route Name | Component | Description |
|-------|-----------|-----------|-------------|
| `/app` | `workspace-index` | `website/profile/index.vue` | User workspace dashboard |
| `/app/athlete-registration` | `athlete-registration` | `platform/views/athletes/Profile.vue` | Athlete profile workspace page |

### Applications (Legacy workspace routes)

| Route | Route Name | Component | Description |
|-------|-----------|-----------|-------------|
| `/app/applications` | `applications` | `platform/views/Applications/Home.vue` | Applications hub (redirects to `applications-index`) |
| `/app/applications/diving-centers-new-membership` | `diving-centers-new-membership` | `v3/pages/applications/dive-centers/NewMembership.vue` | New diving center membership application |
| `/app/applications/freediving-competition-registration/:id` | `freediving-competition-registration` | `platform/views/Applications/competitions/free-diving/NewRegistration.vue` | Freediving competition registration |
| `/app/applications/jetsky-competition-registration/:event` | `jetsky-competition-registration` | `platform/views/Applications/competitions/jetsky/NewRegistration.vue` | Jetsky competition registration |
| `/app/applications/underwater-photography-competition-registration/:eventId` | `underwater-photography-competition-registration` | `platform/views/Applications/competitions/underwater-photography/NewRegistration.vue` | Underwater photography competition registration |
| `/app/applications/fishing-new-team-registration/:eventId` | `fishing-new-team-registration` | `v3/pages/applications/sport-fishing/TeamUpsert.vue` | Sport fishing team registration |
| `/app/applications/new-athlete` | `new-athlete` | Redirect | Compatibility route that redirects to `athlete-new-registration` |
| `/app/applications/:id/professional-diver` | `professional-diver-application-review` | `platform/views/Applications/professional-divers/ApplicationReview.vue` | Professional diver application review |
| `/app/applications/:id` | `application-home` | `platform/views/Applications/Application.vue` | Application details hub |

### Application Detail Sub-routes (under `/app/applications/:id`)

| Route | Route Name | Component | Description |
|-------|-----------|-----------|-------------|
| `/app/applications/:id/freediving-competition-application` | `freediving-competition-application` | `platform/views/Applications/competitions/free-diving/ApplicationReview.vue` | Freediving competition review |
| `/app/applications/:id/jetsky-competition-application` | `jetsky-competition-application` | `platform/views/Applications/competitions/jetsky/ApplicationReview.vue` | Jetsky competition review |
| `/app/applications/:id/underwater-photography-competition-application` | `underwater-photography-competition-application` | `platform/views/Applications/competitions/underwater-photography/ApplicationReview.vue` | Underwater photography review |
| `/app/applications/:id/update-jetsky-competition-application/:event` | `update-jetsky-competition-application` | `platform/views/Applications/competitions/jetsky/UpdateInformation.vue` | Update jetsky competition info |
| `/app/applications/:id/update-underwater-participation-competition-application/:participantId` | `update-underwater-participation-competition-application` | `platform/views/Applications/competitions/underwater-photography/UpdateInformation.vue` | Update underwater photo info |
| `/app/applications/:id/add-working-leave` | `add-working-leave` | `platform/views/Applications/competitions/free-diving/NewWorkLeave.vue` | Add working leave |
| `/app/applications/:id/update-user-profile` | `update-user-profile` | `platform/views/Applications/UpdateUserProfile.vue` | Update applicant profile |
| `/app/applications/:id/update-user-picture` | `update-user-picture` | `platform/views/Applications/ApplicantPicture.vue` | Update applicant picture |
| `/app/applications/:id/update-user-photo` | `update-user-photo` | `v3/pages/applications/ApplicationPhotoUpload.vue` | Upload applicant photo |
| `/app/applications/:id/update-license-informations` | `professional-diver-application-license-informations` | `platform/views/Applications/professional-divers/LicenseInformations.vue` | PD license informations |
| `/app/applications/:id/add-new-athlete` | `add-new-athletes` | `platform/views/Applications/AddAthletes.vue` | Add new athletes |
| `/app/applications/:id/add-professional-diver-contract` | `add-professional-diver-contract` | `platform/views/Applications/professional-divers/AddWorkContract.vue` | Add PD work contract |
| `/app/applications/:id/register-professional-diver-contract` | `register-professional-diver-contract` | `platform/views/Applications/professional-divers/AddWorkContract.vue` | Register PD contract |
| `/app/applications/:id/professional-diver-work-contract` | `professional-diver-work-contract` | `platform/views/Applications/professional-divers/WorkContract.vue` | PD work contract view |
| `/app/applications/:id/add-professional-diver-international-qualification` | `add-professional-diver-international-qualification` | `platform/views/Applications/professional-divers/AddQualification.vue` | Add PD international qualification |
| `/app/applications/:id/add-professional-diver-international-qualifications` | `add-professional-diver-international-qualifications` | `platform/views/Applications/professional-divers/AddProfissionalQualification.vue` | Add PD international qualifications |
| `/app/applications/:id/new-file` | `new-application-file` | `v3/components/Applications/UploadFiles.vue` | Upload new file |
| `/app/applications/:id/add-new-file` | `add-new-file` | `v3/components/Applications/UploadFiles.vue` | Add new file |

### Platform App (v3)

| Route | Route Name | Component | Description |
|-------|-----------|-----------|-------------|
| `/app/:locale(ar\|en)/applications` | `applications-index` | `v3/pages/applications/ApplicationsIndex.vue` | Platform applications list |
| `/app/:locale(ar\|en)/applications/athlete-new-registration` | `athlete-new-registration` | `v3/pages/applications/athletes/NewAthlete.vue` | Athlete registration create page |
| `/app/:locale(ar\|en)/applications/:appId/athletes/update-sport` | `athlete-sport-selection` | `v3/pages/applications/athletes/UpdateAthleteSport.vue` | Athlete sport update page |
| `/app/:locale(ar\|en)/applications/:appId/summary` | `app-summary` | `v3/pages/applications/ApplicationSummary.vue` | Application summary |
| `/app/:locale(ar\|en)/applications/:appId/waiver` | `app-waiver` | `v3/pages/applications/Waiver.vue` | Application waiver |
| `/app/:locale(ar\|en)/applications/:appId/new-files` | `app-new-files` | `v3/pages/applications/ApplicationFiles.vue` | Application files |
| `/app/:locale(ar\|en)/applications/:appId/file-upload` | `application-file-upload` | `v3/pages/applications/ApplicationFileUpload.vue` | Application file upload |
| `/app/:locale(ar\|en)/applications/:appId/personal-photo-upload` | `applicant-personal-photo-upload` | `v3/pages/applications/ApplicantPersonalPhotoUpload.vue` | Applicant photo upload |
| `/app/:locale(ar\|en)/applications/professional-diver-new-license` | `professional-diver-new-license` | `v3/pages/applications/professional-divers/NewLicense.vue` | New professional diver license application |
| `/app/:locale(ar\|en)/applications/sport-fishing-register/:eventId` | `sport-fishing-register` | `v3/pages/applications/sport-fishing/TeamUpsert.vue` | Sport fishing registration |
| `/app/:locale(ar\|en)/applications/sport-fishing-team-update/:appId` | `fishing-team-update` | `v3/pages/applications/sport-fishing/TeamUpsert.vue` | Sport fishing team update |
| `/app/:locale(ar\|en)/applications/user-profile-edit/:appId` | `user-profile-edit` | `v3/pages/applications/UserProfileUpsert.vue` | User profile edit |
| `/app/:locale(ar\|en)/applications/:appId/dive-centers/profile/edit` | `dive-center-profile-edit` | `v3/pages/applications/dive-centers/UpdateCenterProfile.vue` | Dive-center profile edit page |
| `/app/:locale(ar\|en)/applications/:appId/dive-centers/activities/edit` | `dive-center-activities-edit` | `v3/pages/applications/dive-centers/UpdateActivities.vue` | Dive-center activities edit page |
| `/app/:locale(ar\|en)/applications/:appId/dive-centers/administrators/add` | `dive-center-administrator-add` | `v3/pages/applications/dive-centers/DCAdministratorUpsert.vue` | Add dive-center administrator |
| `/app/:locale(ar\|en)/applications/:appId/dive-centers/administrators/:profileId/edit` | `dive-center-administrator-edit` | `v3/pages/applications/dive-centers/DCAdministratorUpsert.vue` | Edit dive-center administrator |
| `/app/:locale(ar\|en)/applications/:appId/dive-centers/international-memberships/add` | `dive-center-international-membership-add` | `v3/pages/applications/dive-centers/AddInternationalMembership.vue` | Add international membership |
| `/app/:locale(ar\|en)/applications/:appId/add-fishing-participant` | `fishing-participant-add` | `v3/pages/applications/sport-fishing/ParticipantAdd.vue` | Add fishing participant |
| `/app/:locale(ar\|en)/applications/:appId/professional-divers/add-membership` | `pd-membership-add` | `v3/pages/applications/professional-divers/AddMembership.vue` | Add PD membership |
| `/app/:locale(ar\|en)/applications/:appId/professional-divers/add-contract` | `pd-contract-add` | `v3/pages/applications/professional-divers/AddContract.vue` | Add PD contract |
| `/app/:locale(ar\|en)/applications/:appId/professional-divers/update-license-informations` | `pd-license-info-update` | `v3/pages/applications/professional-divers/UpdateLicenseInformations.vue` | Update PD license info |
| `/app/:locale(ar\|en)/dive-centers` | `diving-center-membership` | `v3/pages/app/dive-centers/DiveCentersIndex.vue` | Dive centers list |
| `/app/:locale(ar\|en)/dive-center/:id` | `diving-center-show` | `v3/pages/app/dive-centers/DiveCenterProfile.vue` | Dive center profile |
| `/app/:locale(ar\|en)/professional-diver-license` | `professional-diver-license` | `v3/pages/professional-divers/ProfessionalDiverProfile.vue` | Professional diver profile |
| `/app/:locale(ar\|en)/athlete-profile` | `athlete-profile` | `v3/pages/athletes/AthleteProfile.vue` | Athlete profile and renewal dashboard |

### Invoices

| Route | Route Name | Component | Description |
|-------|-----------|-----------|-------------|
| `/app/invoices/view/:id` | `quotation-view` | `v3/pages/quotations/QuotationItemsView.vue` | Invoice details |
| `/app/:locale(ar\|en)/invoices/:id` | `invoice-view` | `v3/pages/invoices/index.vue` | Invoice viewing |
| `/app/:locale(ar\|en)/invoice-review/:id` | `invoice-review` | `platform/views/invoices/Review.vue` | Invoice review |

### Payment

| Route | Route Name | Component | Description |
|-------|-----------|-----------|-------------|
| `/app/payments/confirm-payment/:id` | `confirm-payment` | `v3/pages/payments/ConfirmPayment.vue` | Confirm payment for applications |
| `/app/paylink/confirm-payment` | `confirm-paylink-payment` | `platform/views/paylink/ConfirmPayment.vue` | Paylink payment confirmation |

---

## Authentication (Guest)

| Route | Route Name | Component | Description |
|-------|-----------|-----------|-------------|
| `/:locale(ar\|en)/auth/sign-in` | `sign-in` | `v3/components/Authentication/SignIn.vue` | User sign in |
| `/:locale(ar\|en)/auth/sign-up` | `sign-up` | `v3/components/Authentication/SignUp.vue` | User registration |
| `/:locale(ar\|en)/auth/reset-password/:token?` | `reset-password` | `v3/components/Authentication/ResetPassword.vue` | Reset password |
| `/:locale(ar\|en)/auth/forgot-password` | `forgot-password` | `v3/components/Authentication/ForgotPassword.vue` | Forgot password form |

---

## System Pages

| Route | Route Name | Component | Description |
|-------|-----------|-----------|-------------|
| `/404` | `404` | Redirect | 404 redirect |
| `/404/:redirect(.*)?` | `error-404` | `v3/pages/system/NotFound404.vue` | 404 error page |
| `/:pathMatch(.*)*` | `not-found` | Redirect | Catch-all redirect to 404 |

---

## Backward Compatibility Redirects

| Old Route | Redirects To | Notes |
|-----------|-------------|-------|
| `/workspace` | `/app` | Legacy workspace path |
| `/:locale/platform` | `/app` | Legacy platform path |
| `/quotations/pay-invoice/:id` | `/app/:locale/invoice-review/:id` | Payment flow redirect |
| `/payments/confirm-payment/:id` | `/app/payments/confirm-payment/:id` | Payment redirect |
| `/paylink/confirm-payment` | `/app/paylink/confirm-payment` | Paylink redirect |
| `/:locale/invoices/:id` | `/app/:locale/invoices/:id` | Invoice redirect |
| `/:locale/invoice-review/:id` | `/app/:locale/invoice-review/:id` | Invoice review redirect |
| `/auth/*` | `/:locale/auth/*` | Auth locale resolution |

---

## Last Updated

2026-05-13
