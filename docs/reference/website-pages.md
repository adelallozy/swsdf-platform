# Website Pages Inventory
- Source: `src/router/index.js`
- Generated: `2026-05-19 20:04:59`
## Counts
- Total route records: 88
- Page routes (leaf component): 62
- Layout routes (component + children): 4
- Group routes (children only): 3
- Redirect-only routes: 19
- Unique route components: 60
## Unique Components By Prefix
- `v3/pages`: 29
- `platform/views`: 23
- `v3/components`: 5
- `v3/layouts`: 2
- `website/profile`: 1
## Page Routes
| Path | Name | Type | Component | Redirect |
| --- | --- | --- | --- | --- |
| `/:locale(ar\|en)/auth/forgot-password` | `forgot-password` | `page` | `@/v3/components/Authentication/ForgotPassword.vue` |  |
| `/:locale(ar\|en)/auth/reset-password/:token?` | `reset-password ` | `page` | `@/v3/components/Authentication/ResetPassword.vue` |  |
| `/:locale(ar\|en)/auth/sign-in` | `sign-in` | `page` | `@/v3/components/Authentication/SignIn.vue` |  |
| `/:locale(ar\|en)/auth/sign-up` | `sign-up` | `page` | `@/v3/components/Authentication/SignUp.vue` |  |
| `/404/:redirect(.*)?` | `error-404` | `page` | `@/v3/pages/system/NotFound404.vue` |  |
| `/app` | `workspace-index` | `page` | `@/website/profile/index.vue` |  |
| `/app/:locale(ar\|en)/applications` | `applications-index` | `page` | `@/v3/pages/applications/ApplicationsIndex.vue` |  |
| `/app/:locale(ar\|en)/applications/:appId(\d+)/add-fishing-participant` | `fishing-participant-add` | `page` | `@/v3/pages/applications/sport-fishing/ParticipantAdd.vue` |  |
| `/app/:locale(ar\|en)/applications/:appId(\d+)/athletes/update-sport` | `athlete-sport-selection` | `page` | `@/v3/pages/applications/athletes/UpdateAthleteSport.vue` |  |
| `/app/:locale(ar\|en)/applications/:appId(\d+)/dive-centers/activities/edit` | `dive-center-activities-edit` | `page` | `@/v3/pages/applications/dive-centers/UpdateActivities.vue` |  |
| `/app/:locale(ar\|en)/applications/:appId(\d+)/dive-centers/administrators/:profileId(\d+)/edit` | `dive-center-administrator-edit` | `page` | `@/v3/pages/applications/dive-centers/DCAdministratorUpsert.vue` |  |
| `/app/:locale(ar\|en)/applications/:appId(\d+)/dive-centers/administrators/add` | `dive-center-administrator-add` | `page` | `@/v3/pages/applications/dive-centers/DCAdministratorUpsert.vue` |  |
| `/app/:locale(ar\|en)/applications/:appId(\d+)/dive-centers/international-memberships/add` | `dive-center-international-membership-add` | `page` | `@/v3/pages/applications/dive-centers/AddInternationalMembership.vue` |  |
| `/app/:locale(ar\|en)/applications/:appId(\d+)/dive-centers/profile/edit` | `dive-center-profile-edit` | `page` | `@/v3/pages/applications/dive-centers/UpdateCenterProfile.vue` |  |
| `/app/:locale(ar\|en)/applications/:appId(\d+)/file-upload` | `application-file-upload` | `page` | `@/v3/pages/applications/ApplicationFileUpload.vue` |  |
| `/app/:locale(ar\|en)/applications/:appId(\d+)/new-files` | `app-new-files` | `page` | `@/v3/pages/applications/ApplicationFiles.vue` |  |
| `/app/:locale(ar\|en)/applications/:appId(\d+)/professional-divers/add-contract` | `pd-contract-add` | `page` | `@/v3/pages/applications/professional-divers/AddContract.vue` |  |
| `/app/:locale(ar\|en)/applications/:appId(\d+)/professional-divers/add-membership` | `pd-membership-add` | `page` | `@/v3/pages/applications/professional-divers/AddMembership.vue` |  |
| `/app/:locale(ar\|en)/applications/:appId(\d+)/professional-divers/update-license-informations` | `pd-license-info-update` | `page` | `@/v3/pages/applications/professional-divers/UpdateLicenseInformations.vue` |  |
| `/app/:locale(ar\|en)/applications/:appId(\d+)/summary` | `app-summary` | `page` | `@/v3/pages/applications/ApplicationSummary.vue` |  |
| `/app/:locale(ar\|en)/applications/:appId(\d+)/waiver` | `app-waiver` | `page` | `@/v3/pages/applications/Waiver.vue` |  |
| `/app/:locale(ar\|en)/applications/:appId/personal-photo-upload` | `applicant-personal-photo-upload` | `page` | `@/v3/pages/applications/ApplicantPersonalPhotoUpload.vue` |  |
| `/app/:locale(ar\|en)/applications/athlete-new-registration` | `athlete-new-registration` | `page` | `@/v3/pages/applications/athletes/NewAthlete.vue` |  |
| `/app/:locale(ar\|en)/applications/professional-diver-new-license` | `professional-diver-new-license` | `page` | `@/v3/pages/applications/professional-divers/NewLicense.vue` |  |
| `/app/:locale(ar\|en)/applications/sport-fishing-register/:eventId(\d+)` | `sport-fishing-register` | `page` | `@/v3/pages/applications/sport-fishing/TeamUpsert.vue` |  |
| `/app/:locale(ar\|en)/applications/sport-fishing-team-update/:appId(\d+)` | `fishing-team-update` | `page` | `@/v3/pages/applications/sport-fishing/TeamUpsert.vue` |  |
| `/app/:locale(ar\|en)/applications/user-profile-edit/:appId(\d+)` | `user-profile-edit` | `page` | `@/v3/pages/applications/UserProfileUpsert.vue` |  |
| `/app/:locale(ar\|en)/dive-center/:id(\d+)` | `diving-center-show` | `page` | `@/v3/pages/app/dive-centers/DiveCenterProfile.vue` |  |
| `/app/:locale(ar\|en)/dive-centers` | `diving-center-membership` | `page` | `@/v3/pages/app/dive-centers/DiveCentersIndex.vue` |  |
| `/app/:locale(ar\|en)/invoice-review/:id(\d+)` | `invoice-review` | `page` | `@/platform/views/invoices/Review.vue` |  |
| `/app/:locale(ar\|en)/invoices/:id(\d+)` | `invoice-view` | `page` | `@/v3/pages/invoices/index.vue` |  |
| `/app/applications/:id(\d+)/add-new-athlete` | `add-new-athletes` | `page` | `@/platform/views/Applications/AddAthletes.vue` |  |
| `/app/applications/:id(\d+)/add-new-file` | `add-new-file` | `page` | `@/v3/components/Applications/UploadFiles.vue` |  |
| `/app/applications/:id(\d+)/add-professional-diver-contract` | `add-professional-diver-contract` | `page` | `@/platform/views/Applications/professional-divers/AddWorkContract.vue` |  |
| `/app/applications/:id(\d+)/add-professional-diver-international-qualification` | `add-professional-diver-international-qualification` | `page` | `@/platform/views/Applications/professional-divers/AddQualification.vue` |  |
| `/app/applications/:id(\d+)/add-professional-diver-international-qualifications` | `add-professional-diver-international-qualifications` | `page` | `@/platform/views/Applications/professional-divers/AddProfissionalQualification.vue` |  |
| `/app/applications/:id(\d+)/add-working-leave` | `add-working-leave` | `page` | `@/platform/views/Applications/competitions/free-diving/NewWorkLeave.vue` |  |
| `/app/applications/:id(\d+)/freediving-competition-application` | `freediving-competition-application` | `page` | `@/platform/views/Applications/competitions/free-diving/ApplicationReview.vue` |  |
| `/app/applications/:id(\d+)/jetsky-competition-application` | `jetsky-competition-application` | `page` | `@/platform/views/Applications/competitions/jetsky/ApplicationReview.vue` |  |
| `/app/applications/:id(\d+)/new-file` | `new-application-file` | `page` | `@/v3/components/Applications/UploadFiles.vue` |  |
| `/app/applications/:id(\d+)/professional-diver` | `professional-diver-application-review` | `page` | `@/platform/views/Applications/professional-divers/ApplicationReview.vue` |  |
| `/app/applications/:id(\d+)/professional-diver-work-contract` | `professional-diver-work-contract` | `page` | `@/platform/views/Applications/professional-divers/WorkContract.vue` |  |
| `/app/applications/:id(\d+)/register-professional-diver-contract` | `register-professional-diver-contract` | `page` | `@/platform/views/Applications/professional-divers/AddWorkContract.vue` |  |
| `/app/applications/:id(\d+)/underwater-photography-competition-application` | `underwater-photography-competition-application` | `page` | `@/platform/views/Applications/competitions/underwater-photography/ApplicationReview.vue` |  |
| `/app/applications/:id(\d+)/update-jetsky-competition-application/:event` | `update-jetsky-competition-application` | `page` | `@/platform/views/Applications/competitions/jetsky/UpdateInformation.vue` |  |
| `/app/applications/:id(\d+)/update-license-informations` | `professional-diver-application-license-informations` | `page` | `@/platform/views/Applications/professional-divers/LicenseInformations.vue` |  |
| `/app/applications/:id(\d+)/update-underwater-participation-competition-application/:participantId` | `update-underwater-participation-competition-application` | `page` | `@/platform/views/Applications/competitions/underwater-photography/UpdateInformation.vue` |  |
| `/app/applications/:id(\d+)/update-user-photo` | `update-user-photo` | `page` | `@/v3/pages/applications/ApplicationPhotoUpload.vue` |  |
| `/app/applications/:id(\d+)/update-user-picture` | `update-user-picture` | `page` | `@/platform/views/Applications/ApplicantPicture.vue` |  |
| `/app/applications/:id(\d+)/update-user-profile` | `update-user-profile` | `page` | `@/platform/views/Applications/UpdateUserProfile.vue` |  |
| `/app/applications/diving-centers-new-membership` | `diving-centers-new-membership` | `page` | `@/v3/pages/applications/dive-centers/NewMembership.vue` |  |
| `/app/applications/fishing-new-team-registration/:eventId(\d+)` | `fishing-new-team-registration` | `page` | `@/v3/pages/applications/sport-fishing/TeamUpsert.vue` |  |
| `/app/applications/freediving-competition-registration/:id(\d+)` | `freediving-competition-registration` | `page` | `@/platform/views/Applications/competitions/free-diving/NewRegistration.vue` |  |
| `/app/applications/jetsky-competition-registration/:event` | `jetsky-competition-registration` | `page` | `@/platform/views/Applications/competitions/jetsky/NewRegistration.vue` |  |
| `/app/applications/underwater-photography-competition-registration/:event` | `underwaterunderwater-competition-registration-photography-competition-registration` | `page` | `@/platform/views/Applications/competitions/underwater-photography/NewRegistration.vue` |  |
| `/app/applications/underwater-photography-competition-registration/:eventId(\d+)` | `underwater-photography-competition-registration` | `page` | `@/platform/views/Applications/competitions/underwater-photography/NewRegistration.vue` |  |
| `/app/athlete-profile` | `athlete-profile` | `page` | `@/v3/pages/athletes/AthleteProfile.vue` |  |
| `/app/athlete-registration` | `athlete-registration` | `page` | `@/platform/views/athletes/Profile.vue` |  |
| `/app/invoices/view/:id(\d+)` | `quotation-view` | `page` | `@/v3/pages/quotations/QuotationItemsView.vue` |  |
| `/app/paylink/confirm-payment` | `confirm-paylink-payment` | `page` | `@/platform/views/paylink/ConfirmPayment.vue` |  |
| `/app/payments/confirm-payment/:id(\d+)` | `confirm-payment` | `page` | `@/v3/pages/payments/ConfirmPayment.vue` |  |
| `/app/professional-diver-license` | `professional-diver-license` | `page` | `@/v3/pages/professional-divers/ProfessionalDiverProfile.vue` |  |
## Layout Routes
| Path | Name | Type | Component | Redirect |
| --- | --- | --- | --- | --- |
| `/:locale(ar\|en)/auth` |  | `layout` | `@/v3/layouts/Auth.vue` | `(function)` |
| `/app` | `AppRoot` | `layout` | `@/v3/layouts/MainLayout.vue` | `{"name":"workspace-index"}` |
| `/app/applications` | `applications` | `layout` | `@/platform/views/Applications/Home.vue` | `{"name":"applications-index","params":{"locale":"ar"}}` |
| `/app/applications/:id(\d+)` | `application-home` | `layout` | `@/platform/views/Applications/Application.vue` |  |
## Group Routes
| Path | Name | Type | Component | Redirect |
| --- | --- | --- | --- | --- |
| `/app/:locale(ar\|en)` | `web-app-index` | `group` |  | `(function)` |
| `/app/:locale(ar\|en)/applications` | `platform-applications` | `group` |  | `(function)` |
| `/app/paylink` | `paylink-index` | `group` |  |  |
## Redirect Routes
| Path | Name | Type | Component | Redirect |
| --- | --- | --- | --- | --- |
| `/` |  | `redirect` |  | `/app` |
| `/:locale(ar\|en)/invoice-review/:id(\d+)` |  | `redirect` |  | `(function)` |
| `/:locale(ar\|en)/invoices/:id(\d+)` |  | `redirect` |  | `(function)` |
| `/:locale(ar\|en)/platform` | `platform-index` | `redirect` |  | `(function)` |
| `/:pathMatch(.*)*` | `not-found` | `redirect` |  | `(function)` |
| `/404` | `404` | `redirect` |  | `{"name":"error-404"}` |
| `/app/:locale(ar\|en)/applications/:appId(\d+)/dive-centers/administrators/edit` |  | `redirect` |  | `(function)` |
| `/app/:locale(ar\|en)/athlete-profile` |  | `redirect` |  | `(function)` |
| `/app/:locale(ar\|en)/invoices/view/:id(\d+)` |  | `redirect` |  | `(function)` |
| `/app/:locale(ar\|en)/professional-diver-license` |  | `redirect` |  | `(function)` |
| `/app/applications` | `user-applications` | `redirect` |  | `{"name":"applications-index","params":{"locale":"ar"}}` |
| `/app/applications/:id(\d+)/athletes-membership-profile` | `athletes-membership-profile` | `redirect` |  | `(function)` |
| `/app/applications/:id(\d+)/update-athletes-sport` | `update-athletes-sport` | `redirect` |  | `(function)` |
| `/app/applications/new-athlete` | `new-athlete` | `redirect` |  | `(function)` |
| `/auth/:pathMatch(.*)*` |  | `redirect` |  | `(function)` |
| `/paylink/confirm-payment` |  | `redirect` |  | `{"name":"confirm-paylink-payment"}` |
| `/payments/confirm-payment/:id(\d+)` |  | `redirect` |  | `(function)` |
| `/quotations/pay-invoice/:id(\d+)` |  | `redirect` |  | `(function)` |
| `/workspace` | `workspace` | `redirect` |  | `{"name":"AppRoot"}` |
## Notes
- This inventory is derived from the Vue Router configuration and may include legacy redirects.
- Regenerate this file by running: `node scripts/generate-pages-inventory.js`