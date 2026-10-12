# Website Pages Inventory
- Source: `src/router/index.js`
- Generated: `2026-10-09 18:29:36`
## Counts
- Total route records: 84
- Page routes (leaf component): 64
- Layout routes (component + children): 4
- Group routes (children only): 1
- Redirect-only routes: 15
- Unique route components: 62
## Unique Components By Prefix
- `v3/pages`: 38
- `platform/views`: 14
- `v3/components`: 7
- `v3/layouts`: 2
- `website/profile`: 1
## Page Routes
| Path | Name | Type | Component | Redirect |
| --- | --- | --- | --- | --- |
| `/:locale(ar\|en)` | `workspace-index` | `page` | `@/website/profile/index.vue` |  |
| `/:locale(ar\|en)/account-settings` | `account-settings` | `page` | `@/v3/pages/AccountSettings.vue` |  |
| `/:locale(ar\|en)/applications` | `applications-index` | `page` | `@/v3/pages/applications/ApplicationsIndex.vue` |  |
| `/:locale(ar\|en)/applications/:appId(\d+)/add-fishing-participant` | `fishing-participant-add` | `page` | `@/v3/pages/applications/sport-fishing/ParticipantAdd.vue` |  |
| `/:locale(ar\|en)/applications/:appId(\d+)/athletes/update-sport` | `athlete-sport-selection` | `page` | `@/v3/pages/applications/athletes/UpdateAthleteSport.vue` |  |
| `/:locale(ar\|en)/applications/:appId(\d+)/dive-centers/activities/edit` | `dive-center-activities-edit` | `page` | `@/v3/pages/applications/dive-centers/UpdateActivities.vue` |  |
| `/:locale(ar\|en)/applications/:appId(\d+)/dive-centers/administrators/:profileId(\d+)/edit` | `dive-center-administrator-edit` | `page` | `@/v3/pages/applications/dive-centers/DCAdministratorUpsert.vue` |  |
| `/:locale(ar\|en)/applications/:appId(\d+)/dive-centers/administrators/add` | `dive-center-administrator-add` | `page` | `@/v3/pages/applications/dive-centers/DCAdministratorUpsert.vue` |  |
| `/:locale(ar\|en)/applications/:appId(\d+)/dive-centers/international-memberships/add` | `dive-center-international-membership-add` | `page` | `@/v3/pages/applications/dive-centers/AddInternationalMembership.vue` |  |
| `/:locale(ar\|en)/applications/:appId(\d+)/dive-centers/profile/edit` | `dive-center-profile-edit` | `page` | `@/v3/pages/applications/dive-centers/UpdateCenterProfile.vue` |  |
| `/:locale(ar\|en)/applications/:appId(\d+)/file-upload` | `application-file-upload` | `page` | `@/v3/pages/applications/ApplicationFileUpload.vue` |  |
| `/:locale(ar\|en)/applications/:appId(\d+)/new-files` | `app-new-files` | `page` | `@/v3/pages/applications/ApplicationFiles.vue` |  |
| `/:locale(ar\|en)/applications/:appId(\d+)/professional-divers/add-contract` | `pd-contract-add` | `page` | `@/v3/pages/applications/professional-divers/AddContract.vue` |  |
| `/:locale(ar\|en)/applications/:appId(\d+)/professional-divers/add-membership` | `pd-membership-add` | `page` | `@/v3/pages/applications/professional-divers/AddMembership.vue` |  |
| `/:locale(ar\|en)/applications/:appId(\d+)/professional-divers/update-license-informations` | `pd-license-info-update` | `page` | `@/v3/pages/applications/professional-divers/UpdateLicenseInformations.vue` |  |
| `/:locale(ar\|en)/applications/:appId(\d+)/summary` | `app-summary` | `page` | `@/v3/pages/applications/ApplicationSummary.vue` |  |
| `/:locale(ar\|en)/applications/:appId(\d+)/vendors/contact-updates/add` | `vendor-contact-update-add` | `page` | `@/v3/pages/applications/vendors/AddVendorContactUpdate.vue` |  |
| `/:locale(ar\|en)/applications/:appId(\d+)/vendors/profile/edit` | `vendor-profile-edit` | `page` | `@/v3/pages/applications/vendors/UpdateVendorProfile.vue` |  |
| `/:locale(ar\|en)/applications/:appId(\d+)/waiver` | `app-waiver` | `page` | `@/v3/pages/applications/Waiver.vue` |  |
| `/:locale(ar\|en)/applications/:appId/personal-photo-upload` | `applicant-personal-photo-upload` | `page` | `@/v3/pages/applications/ApplicantPersonalPhotoUpload.vue` |  |
| `/:locale(ar\|en)/applications/:id(\d+)/add-new-athlete` | `add-new-athletes` | `page` | `@/platform/views/Applications/AddAthletes.vue` |  |
| `/:locale(ar\|en)/applications/:id(\d+)/add-new-file` | `add-new-file` | `page` | `@/v3/components/Applications/UploadFiles.vue` |  |
| `/:locale(ar\|en)/applications/:id(\d+)/add-working-leave` | `add-working-leave` | `page` | `@/platform/views/Applications/competitions/free-diving/NewWorkLeave.vue` |  |
| `/:locale(ar\|en)/applications/:id(\d+)/freediving-competition-application` | `freediving-competition-application` | `page` | `@/platform/views/Applications/competitions/free-diving/ApplicationReview.vue` |  |
| `/:locale(ar\|en)/applications/:id(\d+)/new-file` | `new-application-file` | `page` | `@/v3/components/Applications/UploadFiles.vue` |  |
| `/:locale(ar\|en)/applications/:id(\d+)/underwater-photography-competition-application` | `underwater-photography-competition-application` | `page` | `@/platform/views/Applications/competitions/underwater-photography/ApplicationReview.vue` |  |
| `/:locale(ar\|en)/applications/:id(\d+)/update-jetsky-competition-application/:event` | `update-jetsky-competition-application` | `page` | `@/v3/pages/applications/jetski/ParticipationUpsert.vue` |  |
| `/:locale(ar\|en)/applications/:id(\d+)/update-license-informations` | `professional-diver-application-license-informations` | `page` | `@/platform/views/Applications/professional-divers/LicenseInformations.vue` |  |
| `/:locale(ar\|en)/applications/:id(\d+)/update-underwater-participation-competition-application/:participantId` | `update-underwater-participation-competition-application` | `page` | `@/platform/views/Applications/competitions/underwater-photography/UpdateInformation.vue` |  |
| `/:locale(ar\|en)/applications/:id(\d+)/update-user-photo` | `update-user-photo` | `page` | `@/v3/pages/applications/ApplicationPhotoUpload.vue` |  |
| `/:locale(ar\|en)/applications/:id(\d+)/update-user-profile` | `update-user-profile` | `page` | `@/platform/views/Applications/UpdateUserProfile.vue` |  |
| `/:locale(ar\|en)/applications/athlete-new-registration` | `athlete-new-registration` | `page` | `@/v3/pages/applications/athletes/NewAthlete.vue` |  |
| `/:locale(ar\|en)/applications/diving-centers-new-membership` | `diving-centers-new-membership` | `page` | `@/v3/pages/applications/dive-centers/NewMembership.vue` |  |
| `/:locale(ar\|en)/applications/fishing-new-team-registration/:eventId(\d+)` | `fishing-new-team-registration` | `page` | `@/v3/pages/applications/sport-fishing/TeamUpsert.vue` |  |
| `/:locale(ar\|en)/applications/freediving-competition-registration/:id(\d+)` | `freediving-competition-registration` | `page` | `@/platform/views/Applications/competitions/free-diving/NewRegistration.vue` |  |
| `/:locale(ar\|en)/applications/jetsky-competition-registration/:event` | `jetsky-competition-registration` | `page` | `@/v3/pages/applications/jetski/ParticipationUpsert.vue` |  |
| `/:locale(ar\|en)/applications/professional-diver-new-license` | `professional-diver-new-license` | `page` | `@/v3/pages/applications/professional-divers/NewLicense.vue` |  |
| `/:locale(ar\|en)/applications/sport-fishing-register/:eventId(\d+)` | `sport-fishing-register` | `page` | `@/v3/pages/applications/sport-fishing/TeamUpsert.vue` |  |
| `/:locale(ar\|en)/applications/sport-fishing-team-update/:appId(\d+)` | `fishing-team-update` | `page` | `@/v3/pages/applications/sport-fishing/TeamUpsert.vue` |  |
| `/:locale(ar\|en)/applications/underwater-photography-competition-registration/:event` | `underwaterunderwater-competition-registration-photography-competition-registration` | `page` | `@/platform/views/Applications/competitions/underwater-photography/NewRegistration.vue` |  |
| `/:locale(ar\|en)/applications/underwater-photography-competition-registration/:eventId(\d+)` | `underwater-photography-competition-registration` | `page` | `@/platform/views/Applications/competitions/underwater-photography/NewRegistration.vue` |  |
| `/:locale(ar\|en)/applications/user-profile-edit/:appId(\d+)` | `user-profile-edit` | `page` | `@/v3/pages/applications/UserProfileUpsert.vue` |  |
| `/:locale(ar\|en)/applications/vendor-registration` | `vendor-registration` | `page` | `@/v3/pages/applications/vendors/NewRegistration.vue` |  |
| `/:locale(ar\|en)/athlete-profile` | `athlete-profile` | `page` | `@/v3/pages/athletes/AthleteProfile.vue` |  |
| `/:locale(ar\|en)/athlete-registration` | `athlete-registration` | `page` | `@/platform/views/athletes/Profile.vue` |  |
| `/:locale(ar\|en)/auth/change-email` | `change-email` | `page` | `@/v3/components/Authentication/ChangeEmail.vue` |  |
| `/:locale(ar\|en)/auth/forgot-password` | `forgot-password` | `page` | `@/v3/components/Authentication/ForgotPassword.vue` |  |
| `/:locale(ar\|en)/auth/reset-password/:token?` | `reset-password ` | `page` | `@/v3/components/Authentication/ResetPassword.vue` |  |
| `/:locale(ar\|en)/auth/sign-in` | `sign-in` | `page` | `@/v3/components/Authentication/SignIn.vue` |  |
| `/:locale(ar\|en)/auth/sign-up` | `sign-up` | `page` | `@/v3/components/Authentication/SignUp.vue` |  |
| `/:locale(ar\|en)/auth/verify-email` | `verify-email` | `page` | `@/v3/components/Authentication/VerifyEmail.vue` |  |
| `/:locale(ar\|en)/dive-center/:id(\d+)` | `diving-center-show` | `page` | `@/v3/pages/app/dive-centers/DiveCenterProfile.vue` |  |
| `/:locale(ar\|en)/dive-centers` | `diving-center-membership` | `page` | `@/v3/pages/app/dive-centers/DiveCentersIndex.vue` |  |
| `/:locale(ar\|en)/invoice-review/:id(\d+)` | `invoice-review` | `page` | `@/platform/views/invoices/Review.vue` |  |
| `/:locale(ar\|en)/invoices/:id(\d+)` | `invoice-view` | `page` | `@/v3/pages/invoices/index.vue` |  |
| `/:locale(ar\|en)/invoices/view/:id(\d+)` | `quotation-view` | `page` | `@/v3/pages/quotations/QuotationItemsView.vue` |  |
| `/:locale(ar\|en)/paylink/confirm-payment` | `confirm-paylink-payment` | `page` | `@/platform/views/paylink/ConfirmPayment.vue` |  |
| `/:locale(ar\|en)/payments/confirm-payment/:id(\d+)` | `confirm-payment` | `page` | `@/v3/pages/payments/ConfirmPayment.vue` |  |
| `/:locale(ar\|en)/professional-diver-license` | `professional-diver-license` | `page` | `@/v3/pages/professional-divers/ProfessionalDiverProfile.vue` |  |
| `/:locale(ar\|en)/rfps` | `vendor-rfps` | `page` | `@/v3/pages/app/rfps/RfpsIndex.vue` |  |
| `/:locale(ar\|en)/rfps/:id(\d+)` | `vendor-rfp-view` | `page` | `@/v3/pages/app/rfps/RfpView.vue` |  |
| `/:locale(ar\|en)/rfps/:id(\d+)/upload` | `vendor-rfp-upload` | `page` | `@/v3/pages/app/rfps/RfpUpload.vue` |  |
| `/:locale(ar\|en)/vendors` | `vendor-profile` | `page` | `@/v3/pages/app/vendors/VendorProfileView.vue` |  |
| `/404/:redirect(.*)?` | `error-404` | `page` | `@/v3/pages/system/NotFound404.vue` |  |
## Layout Routes
| Path | Name | Type | Component | Redirect |
| --- | --- | --- | --- | --- |
| `/:locale(ar\|en)` | `AppRoot` | `layout` | `@/v3/layouts/MainLayout.vue` | `(function)` |
| `/:locale(ar\|en)/applications` | `applications` | `layout` | `@/platform/views/Applications/Home.vue` | `(function)` |
| `/:locale(ar\|en)/applications/:id(\d+)` | `application-home` | `layout` | `@/platform/views/Applications/Application.vue` |  |
| `/:locale(ar\|en)/auth` |  | `layout` | `@/v3/layouts/Auth.vue` | `(function)` |
## Group Routes
| Path | Name | Type | Component | Redirect |
| --- | --- | --- | --- | --- |
| `/:locale(ar\|en)/paylink` | `paylink-index` | `group` |  |  |
## Redirect Routes
| Path | Name | Type | Component | Redirect |
| --- | --- | --- | --- | --- |
| `/` |  | `redirect` |  | `(function)` |
| `/:locale(ar\|en)/applications/:appId(\d+)/dive-centers/administrators/edit` |  | `redirect` |  | `(function)` |
| `/:locale(ar\|en)/applications/:id(\d+)/athletes-membership-profile` | `athletes-membership-profile` | `redirect` |  | `(function)` |
| `/:locale(ar\|en)/applications/:id(\d+)/update-athletes-sport` | `update-athletes-sport` | `redirect` |  | `(function)` |
| `/:locale(ar\|en)/applications/new-athlete` | `new-athlete` | `redirect` |  | `(function)` |
| `/:locale(ar\|en)/platform` | `platform-index` | `redirect` |  | `(function)` |
| `/:locale(ar\|en)/platform-applications` | `platform-applications` | `redirect` |  | `(function)` |
| `/:locale(ar\|en)/user-applications` | `user-applications` | `redirect` |  | `(function)` |
| `/:pathMatch(.*)*` | `not-found` | `redirect` |  | `(function)` |
| `/404` | `404` | `redirect` |  | `{"name":"error-404"}` |
| `/auth/:pathMatch(.*)*` |  | `redirect` |  | `(function)` |
| `/paylink/confirm-payment` |  | `redirect` |  | `(function)` |
| `/payments/confirm-payment/:id(\d+)` |  | `redirect` |  | `(function)` |
| `/quotations/pay-invoice/:id(\d+)` |  | `redirect` |  | `(function)` |
| `/workspace` | `workspace` | `redirect` |  | `(function)` |
## Notes
- This inventory is derived from the Vue Router configuration and may include legacy redirects.
- Regenerate this file by running: `node scripts/generate-pages-inventory.js`