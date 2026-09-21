// VERSION: 1.0.0
// PATH: src/v3/config/apiEndpoints.js
// Centralized API endpoints configuration - Single source of truth for all API endpoints
// All endpoints are imported from .env file

// ──────────────────────────────────────────────────────────────────────────────
// BASE URLS
// ──────────────────────────────────────────────────────────────────────────────

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://swsdf.sa/api";
export const API_URL = import.meta.env.VITE_API_URL || "https://swsdf.sa/api/";
export const WEB_BASE_URL =
  import.meta.env.VITE_WEB_BASE_URL || "https://swsdf.sa/";
export const MEDIA_BASE_URL = import.meta.env.VITE_MEDIA_BASE_URL || "/";
export const FILES_BASE_URL =
  import.meta.env.VITE_FILES_BASE_URL ||
  import.meta.env.VITE_MEDIA_BASE_URL ||
  import.meta.env.VITE_WEB_BASE_URL ||
  "https://swsdf.sa/";

// ──────────────────────────────────────────────────────────────────────────────
// AUTHENTICATION ENDPOINTS
// ──────────────────────────────────────────────────────────────────────────────

export const AUTH_SIGN_IN =
  import.meta.env.VITE_AUTHENTICATOR_SIGN_IN || "users/login";
export const AUTH_SIGN_OUT =
  import.meta.env.VITE_AUTHENTICATOR_SIGN_OUT || "users/login";
export const AUTH_VERIFY_TOKEN =
  import.meta.env.VITE_AUTHENTICATOR_VERIFY_TOKEN || "users/verify-token";
export const AUTH_SIGN_UP =
  import.meta.env.VITE_USERS_SIGN_UP || "users/sign-up";
export const AUTH_FORGOT_PASSWORD =
  import.meta.env.VITE_USERS_FORGOT_PASSWORD || "users/forgot-password";
export const AUTH_RESET_PASSWORD =
  import.meta.env.VITE_RESET_PASSWORD_URL || "users/reset-password";
export const AUTH_SEND_VERIFICATION_CODE =
  import.meta.env.VITE_SEND_VERIFICATION_CODE || "users/send-verification-code";
export const AUTH_VERIFY_CODE =
  import.meta.env.VITE_VERIFY_CODE || "users/verify-code";
export const AUTH_CHANGE_UNVERIFIED_EMAIL =
  import.meta.env.VITE_CHANGE_UNVERIFIED_EMAIL ||
  "users/change-unverified-email";
export const AUTH_REQUEST_EMAIL_CHANGE =
  import.meta.env.VITE_REQUEST_EMAIL_CHANGE || "users/request-email-change";
export const AUTH_VERIFY_EMAIL_CHANGE =
  import.meta.env.VITE_VERIFY_EMAIL_CHANGE || "users/verify-email-change";
export const AUTH_VERIFY_EMAIL_CHANGE_CONFIRM =
  import.meta.env.VITE_VERIFY_EMAIL_CHANGE_CONFIRM ||
  "users/verify-email-change-confirm";
export const AUTH_GET_DOCUMENTS =
  import.meta.env.VITE_USER_DOCUMENTS || "users/get-documents";
export const AUTH_UPDATE_ACCOUNT =
  import.meta.env.VITE_UPDATE_ACCOUNT || "users/update-account";

// ──────────────────────────────────────────────────────────────────────────────
// CONTENT ENDPOINTS
// ──────────────────────────────────────────────────────────────────────────────

export const CONTENT_VIEW_ARTICLE =
  import.meta.env.VITE_CONTENT_VIEW_ARTICLE || "content/view-article/{slug}";

// ──────────────────────────────────────────────────────────────────────────────
// COMMON ENDPOINTS
// ──────────────────────────────────────────────────────────────────────────────

export const GET_COMMON_CITIES =
  import.meta.env.VITE_GET_COMMON_CITIES || "commons/common_cities";
export const GET_REGIONS_CITIES =
  import.meta.env.VITE_GET_REGIONS_CITIES || "addresses/common";
// ──────────────────────────────────────────────────────────────────────────────
// COMPETITIONS ENDPOINTS
// ──────────────────────────────────────────────────────────────────────────────

export const COMPETITIONS_GET_BY_ID =
  import.meta.env.VITE_GET_COMPETITION || "competitions/get-competition";
export const COMPETITIONS_GET_ATHLETE_PARTICIPATION =
  import.meta.env.VITE_GET_ATHLETE_PARTICIPATION ||
  "competitions-applications/get-athlete-participation";
export const COMPETITIONS_GET_RACING_CATEGORIES =
  import.meta.env.VITE_GET_RACING_CATEGORIES ||
  "competitions-applications/get_racing_categories";
export const COMPETITIONS_GET_JETSKI_PARTICIPATION =
  import.meta.env.VITE_JETSKI_PARTICIPATION ||
  "competitions-applications/jetski-participation";
export const COMPETITIONS_GET_ATHLETE_REGISTRATION =
  import.meta.env.VITE_COMPETITION_GET_ATHLETE_REGISTRATION ||
  "competitions-applications/get-athlete-registration/";
export const COMPETITIONS_CREATE_ATHLETE_REGISTRATION =
  import.meta.env.VITE_COMPETITION_ATHLETE_NEW_REGISTRATION ||
  "competitions-applications/new-athlete-registration/";
export const COMPETITIONS_GET_FISHING_TEAM_REGISTRATION =
  import.meta.env.VITE_COMPETITION_GET_FISHING_TEAM_REGISTRATION ||
  "competitions-applications/get-fishing_team_registration/";
export const COMPETITIONS_CREATE_REGISTRATION =
  import.meta.env.VITE_COMPETITION_NEW_REGISTRATION ||
  "competitions-applications/new-registration/";
export const COMPETITIONS_UPDATE_REGISTRATION =
  import.meta.env.VITE_COMPETITION_UPDATE_REGISTRATION ||
  "competitions-applications/update-registration/";
export const COMPETITIONS_SUBMIT_REGISTRATION =
  import.meta.env.VITE_COMPETITION_SUBMIT_REGISTRATION_APPLICATION ||
  "competitions-applications/submit-registration/";
export const COMPETITIONS_GET_ONGOING =
  import.meta.env.VITE_GET_ONGOING_COMPETITIONS || "competitions/ongoing/";
export const COMPETITIONS_GET_APPROVED_REGISTRATIONS =
  import.meta.env.VITE_GET_COMPETITION_REGISTRATIONS ||
  "competitions/approved-registrations/";

// ──────────────────────────────────────────────────────────────────────────────
// DIVING CENTERS ENDPOINTS
// ──────────────────────────────────────────────────────────────────────────────

export const DIVING_CENTERS_VIEW =
  import.meta.env.VITE_DIVING_CENTERS_VIEW || "diving-centers/";
export const DIVING_CENTERS_LIST =
  import.meta.env.VITE_DIVING_CENTERS_INDEX || "diving-centers/index";
export const DIVING_CENTERS_GET_LICENSED =
  import.meta.env.VITE_LICENSED_DIVE_CENTERS ||
  "diving-centers/get-licensed-centers";
export const DIVING_CENTERS_GET_LICENSED_BASIC =
  import.meta.env.VITE_LICENSED_DIVE_CENTERS_BASIC ||
  "dive-centers/get-licensed-centers-basic";
export const DIVING_CENTERS_REINSPECT =
  import.meta.env.VITE_LICENSED_DIVE_CENTERS_REINSPECT ||
  "diving-centers-inspections/reinspect";
// Diving Centers Applications
export const DIVING_CENTERS_APPS_UPDATE_PROFILE =
  import.meta.env.VITE_UPDATE_DIVING_CENTER_PROFILE ||
  "diving-centers-applications/update-profile/";
export const DIVING_CENTERS_APPS_CREATE_MEMBERSHIP =
  import.meta.env.VITE_ADD_DIVING_CENTER_PROFILE ||
  "diving-centers-applications/new-membership";
export const DIVING_CENTERS_APPS_PICK_MEMBERSHIP =
  import.meta.env.VITE_PICK_DIVING_CENTER_MEMBERSHIP_APPLICATION ||
  "diving-centers-applications/";
export const DIVING_CENTERS_APPS_GET_MEMBERSHIP_OPTIONS =
  import.meta.env.VITE_DIVING_CENTERS_APPS_MEMBERSHIP_OPTIONS ||
  "diving-centers-applications/membership-options";
export const DIVING_CENTERS_APPS_RENEW_MEMBERSHIP =
  import.meta.env.VITE_DIVING_CENTERS_APPS_RENEW ||
  "diving-centers-applications/membership-renewal/";
export const DIVING_CENTERS_APPS_PICK =
  import.meta.env.VITE_DIVING_CENTERS_APPS_PICK ||
  "diving-centers-applications/";
export const DIVING_CENTERS_APPS_SAVE_ACTIVITIES =
  import.meta.env.VITE_DIVING_CENTERS_APPS_SAVE_ACTIVITES ||
  "diving-centers-applications/save-activites/";
export const DIVING_CENTERS_APPS_ADD_INTERNATIONAL_MEMBERSHIP =
  import.meta.env.VITE_DIVING_CENTERS_APPS_ADD_INTERNATIONAL_MEMBERSHIP ||
  "diving-centers-applications/add-international-membership/";
export const DIVING_CENTERS_APPS_REMOVE_INTERNATIONAL_MEMBERSHIP =
  import.meta.env.VITE_DIVING_CENTERS_APPS_REMOVE_INTERNATIONAL_MEMBERSHIP ||
  "diving-centers-applications/remove-international-memberhsip/";
export const DIVING_CENTERS_APPS_CREATE_UPDATE =
  import.meta.env.VITE_DIVING_CENTERS_APPS_NEW_UPDATE ||
  "diving-centers-applications/new-update/";
export const DIVING_CENTERS_APPS_CREATE_ADMIN_UPDATE =
  import.meta.env.VITE_DIVING_CENTERS_APPS_NEW_ADMIN_UPDATE ||
  "diving-centers-applications/new-admin-update/";
// NOTE: Assumption — backend initiation endpoint for the
// "Professional Divers Contracts Updates" flow (one application per
// professional-diver contract) is POST {endpoint}{centerId}/{contractId}.
// If the backend agent ships a different dashed route under
// diving-centers-applications, override VITE_DIVING_CENTERS_APPS_PD_CONTRACTS_UPDATE
// in .env or update this fallback to match.
export const DIVING_CENTERS_APPS_PD_CONTRACTS_UPDATE =
  import.meta.env.VITE_DIVING_CENTERS_APPS_PD_CONTRACTS_UPDATE ||
  "diving-centers-applications/professional-divers-contracts-update/";

// Add a contract to an existing cancellation application
export const DIVING_CENTERS_APPS_ADD_CONTRACT_CANCELLATION =
  "diving-centers-applications/add-contract-cancellation/";

// Remove a contract from a cancellation application (un-select)
export const DIVING_CENTERS_APPS_REMOVE_CONTRACT_CANCELLATION =
  "diving-centers-applications/remove-contract-cancellation/";

// Admin Profile Endpoints
export const DIVING_CENTERS_ADMIN_FIND =
  import.meta.env.VITE_APPS_DIVING_CENTERS_FIND ||
  "active-diving-centers/find/";
export const DIVING_CENTERS_ADMIN_LIST =
  import.meta.env.VITE_APPS_DIVING_CENTERS_INDEX ||
  "active-diving-centers/index/";
export const DIVING_CENTERS_ADMIN_GET_PERMITTED =
  import.meta.env.VITE_APPS_DIVING_CENTERS_PERMITTED_DIVE_CENTER ||
  "diving-centers/permitted-centers";
export const DIVING_CENTERS_ADMIN_CREATE_PROFILE =
  import.meta.env.VITE_APPS_DIVING_CENTERS_ADD_ADMIN_PROFILE ||
  "diving-centers-applications/new-admin-profile/";
export const DIVING_CENTERS_ADMIN_UPDATE_PROFILE =
  import.meta.env.VITE_APPS_DIVING_CENTERS_UPDATE_ADMIN_PROFILE ||
  "diving-centers-applications/update-admin-profile/";
export const DIVING_CENTERS_ADMIN_CANCEL =
  import.meta.env.VITE_APPS_DIVING_CENTERS_CANCEL_ADMIN ||
  "diving-centers-applications/cancel-admin-profile/";
export const DIVING_CENTERS_ADMIN_RESTORE =
  import.meta.env.VITE_APPS_DIVING_CENTERS_ADMIN_RESTORE ||
  "diving-centers-applications/restore-admin-profile/";

// ──────────────────────────────────────────────────────────────────────────────
// VENDORS ENDPOINTS
// ──────────────────────────────────────────────────────────────────────────────

export const VENDORS_APPS_CREATE_REGISTRATION =
  import.meta.env.VITE_VENDORS_APPS_CREATE_REGISTRATION ||
  "vendors-applications/new-registration";
export const VENDORS_APPS_GET_REGISTRATION_OPTIONS =
  import.meta.env.VITE_VENDORS_APPS_GET_REGISTRATION_OPTIONS ||
  "vendors-applications/registration-options";
export const VENDORS_APPS_UPDATE_PROFILE =
  import.meta.env.VITE_VENDORS_APPS_UPDATE_PROFILE ||
  "vendors-applications/update-profile/";
export const VENDORS_INDEX = import.meta.env.VITE_VENDORS_INDEX || "vendors";

// ─── Vendor RFPs (requests for proposal) ──────────────────────────────
export const RFPS_INDEX = import.meta.env.VITE_RFPS_INDEX || "rfps";
export const RFPS_VIEW = import.meta.env.VITE_RFPS_VIEW || "rfps/{id}";
export const RFPS_DOCUMENT_DOWNLOAD =
  import.meta.env.VITE_RFPS_DOCUMENT_DOWNLOAD ||
  "rfps/{id}/documents/{documentId}/download";
export const RFPS_UPLOAD_NDA =
  import.meta.env.VITE_RFPS_UPLOAD_NDA || "rfps/{id}/nda";
export const RFPS_REMOVE_NDA =
  import.meta.env.VITE_RFPS_REMOVE_NDA || "rfps/{id}/nda/remove";
// ─── Vendor RFP offer (single offer flow: upload, submit, recall) ───────
export const RFPS_OFFER_UPLOAD_TOKEN =
  import.meta.env.VITE_RFPS_OFFER_UPLOAD_TOKEN || "rfps/{id}/offer/upload-token";
export const RFPS_OFFER_ATTACH_FILE =
  import.meta.env.VITE_RFPS_OFFER_ATTACH_FILE || "rfps/{id}/offer/files";
export const RFPS_OFFER_REMOVE_FILE =
  import.meta.env.VITE_RFPS_OFFER_REMOVE_FILE ||
  "rfps/{id}/offer/files/{fileRowId}/remove";
export const RFPS_OFFER_FILE_DOWNLOAD =
  import.meta.env.VITE_RFPS_OFFER_FILE_DOWNLOAD ||
  "rfps/{id}/offer/files/{fileRowId}/download";
export const RFPS_OFFER_SUBMIT =
  import.meta.env.VITE_RFPS_OFFER_SUBMIT || "rfps/{id}/offer/submit";
export const RFPS_OFFER_RECALL =
  import.meta.env.VITE_RFPS_OFFER_RECALL || "rfps/{id}/offer/recall";
export const VENDORS_PICK =
  import.meta.env.VITE_VENDORS_PICK || "vendors/view/";
export const VENDORS_APPS_CREATE_PROFILE_UPDATE =
  import.meta.env.VITE_VENDORS_APPS_CREATE_PROFILE_UPDATE ||
  "vendors-applications/new-profile-update/";
export const VENDORS_APPS_ADD_CONTACT_UPDATE =
  import.meta.env.VITE_VENDORS_APPS_ADD_CONTACT_UPDATE ||
  "vendors-applications/add-contact-update/";
export const VENDORS_APPS_DEACTIVATE_CONTACT_UPDATE =
  import.meta.env.VITE_VENDORS_APPS_DEACTIVATE_CONTACT_UPDATE ||
  "vendors-applications/deactivate-contact-update/";
export const VENDORS_APPS_REACTIVATE_CONTACT_UPDATE =
  import.meta.env.VITE_VENDORS_APPS_REACTIVATE_CONTACT_UPDATE ||
  "vendors-applications/reactivate-contact-update/";
export const VENDORS_APPS_DELETE_CONTACT_UPDATE =
  import.meta.env.VITE_VENDORS_APPS_DELETE_CONTACT_UPDATE ||
  "vendors-applications/delete-contact-update/";

// ──────────────────────────────────────────────────────────────────────────────
// EVENTS ENDPOINTS
// ──────────────────────────────────────────────────────────────────────────────

export const EVENTS_PICK = import.meta.env.VITE_EVENTS_PICK || "events/pick/";
export const EVENTS_GET_BY_ID =
  import.meta.env.VITE_EVENTS_BY_ID || "events/by-id/{targetId}";
export const EVENTS_SF_TEAMS_GET_BY_APP_ID =
  import.meta.env.VITE_EVENTS_SF_TEAMS_BY_APP_ID ||
  "events-fishing-teams/by-application-id/{appId}";
export const EVENTS_SF_TEAMS_CREATE =
  import.meta.env.VITE_EVENTS_SF_TEAMS_CREATE_URL ||
  "events-fishing-teams/create/{targetId}";
export const EVENTS_SF_TEAMS_UPDATE =
  import.meta.env.VITE_EVENTS_SF_TEAMS_UPDATE_URL ||
  "events-fishing-teams/update/{appId}";
export const EVENTS_SF_PARTICIPANTS_GET_BY_APP_ID =
  import.meta.env.VITE_EVENTS_SF_PARTICIPANTS_BY_APP_ID ||
  "events-fishing-participants/by-application-id/{appId}";
export const EVENTS_SF_PARTICIPANTS_ADD =
  import.meta.env.VITE_EVENTS_SF_PARTICIPANTS_ADD_URL ||
  "events-fishing-participants/add/{appId}";
export const EVENTS_SF_PARTICIPANTS_DELETE =
  import.meta.env.VITE_EVENTS_SF_PARTICIPANTS_DELETE_URL ||
  "events-fishing-participants/{participantId}";
export const EVENTS_SF_PARTICIPANTS_BASE =
  import.meta.env.VITE_FISHING_PARTICIPANTS_BASE ||
  "events-fishing-participants/";

// Jetski Competition Events
export const EVENTS_JETSKI_CREATE_APPLICATION =
  import.meta.env.VITE_COMPITION_NEW_JETSKY_APPLICATION ||
  "events-applications/new-jetski-application/";
export const EVENTS_JETSKI_UPDATE_APPLICATION =
  import.meta.env.VITE_COMPITION_UPDATE_JETSKY_APPLICATION ||
  "events-applications/update-jetski-participation/";

// Underwater Photography Events
export const EVENTS_UNDERWATER_PHOTOGRAPHY_CREATE_APPLICATION =
  import.meta.env.VITE_COMPITION_NEW_UNDERWATER_PHOTOGRAPHY_APPLICATION ||
  "events-applications/new-underwater-photography-application/";
export const EVENTS_UNDERWATER_PHOTOGRAPHY_UPDATE_APPLICATION =
  import.meta.env.VITE_COMPITION_UPDATE_UNDERWATER_PHOTOGRAPHY_APPLICATION ||
  "events-applications/update-underwater-photography-participation/";

// Freediving Events
export const EVENTS_FREEDIVING_CREATE_APPLICATION =
  import.meta.env.VITE_COMPITION_NEW_FREEDIVING_APPLICATION ||
  "events-applications/new-freediving-application/";
export const EVENTS_FREEDIVING_CREATE_PARTICIPANT =
  import.meta.env.VITE_COMPITION_NEW_FREEDIVING_PARTICIPANT ||
  "events-applications/new-freediving-participant/";
export const EVENTS_FREEDIVING_DELETE_PARTICIPANT =
  import.meta.env.VITE_COMPITION_DELETE_FREEDIVING_PARTICIPANT ||
  "events-applications/delete-freediving-participant/";
export const EVENTS_FREEDIVING_GET_RELATIVES =
  import.meta.env.VITE_COMPITION_FREEDIVING_PICK_RELATIVES ||
  "events-applications/pick-relatives/";
export const EVENTS_FREEDIVING_CREATE_WORK_LEAVE =
  import.meta.env.VITE_COMPITION_FREEDIVING_NEW_WORK_LEAVE ||
  "events-applications/new-work-leave/";
export const EVENTS_FREEDIVING_DELETE_WORK_LEAVE =
  import.meta.env.VITE_COMPITION_FREEDIVING_DELETE_WORK_LEAVE ||
  "events-applications/delete-work-leave/";

// Sport Fishing Events
export const EVENTS_SPORT_FISHING_CREATE_TEAM =
  import.meta.env.VITE_SPORT_FISHING_EVENTS_NEW_TEAM_REGISTRATION ||
  "competitions-applications/new-sport-fishing-team/";
export const EVENTS_SPORT_FISHING_CREATE_MEMBER =
  import.meta.env.VITE_SPORT_FISHING_EVENTS_NEW_MEMBER_REGISTRATION ||
  "competitions-applications/new-sport-fishing-member/";
export const EVENTS_SPORT_FISHING_UPDATE_MEMBER =
  import.meta.env.VITE_SPORT_FISHING_EVENTS_UPDATE_MEMBER_REGISTRATION ||
  "competitions-applications/update-member-registration/";

// ──────────────────────────────────────────────────────────────────────────────
// ATHLETES ENDPOINTS
// ──────────────────────────────────────────────────────────────────────────────

export const ATHLETES_CREATE_MEMBERSHIP =
  import.meta.env.VITE_ATHLTETES_NEW_MEMBERSHIP || "athletes-applications/new";
export const ATHLETES_RENEW_MEMBERSHIP =
  import.meta.env.VITE_ATHLTETES_MEMBERSHIP_RENEW ||
  "athletes-applications/renew/";
export const ATHLETES_UPGRADE_LICENSE =
  import.meta.env.VITE_ATHLTETES_LICENSE_UPGRADE ||
  "athletes-applications/upgrade-license/";
export const ATHLETES_UPDATE_SPORT =
  import.meta.env.VITE_ATHLTETES_UPDATE_SPORT ||
  "athletes-applications/update-sport/";
export const ATHLETES_GET_RELATIVES =
  import.meta.env.VITE_ATHLTETES_PROFILE_RELATIVES ||
  "athletes-applications/pick-relatives/";
export const ATHLETES_GET_PROFILE =
  import.meta.env.VITE_ATHLTETES_PROFILE || "athletes/view";

// ──────────────────────────────────────────────────────────────────────────────
// PROFESSIONAL DIVERS ENDPOINTS
// ──────────────────────────────────────────────────────────────────────────────

export const PROFESSIONAL_DIVERS_GET_BY_USER =
  import.meta.env.VITE_GET_PROFESSIONAL_DIVER ||
  "professional-divers/get-by-user";
export const PROFESSIONAL_DIVERS_PICK =
  import.meta.env.VITE_PROFESSIONAL_DIVERS_PICK || "professional-divers/pick";
export const PROFESSIONAL_DIVERS_APPS_UPDATE =
  import.meta.env.VITE_PROFESSIONAL_DIVERS_UPDATE_APPLICATION ||
  "professional-divers-applications/new-update";
export const PROFESSIONAL_DIVERS_APPS_RENEW_LICENSE =
  import.meta.env.VITE_PROFESSIONAL_DIVERS_RENEW_APPLICATION ||
  "professional-divers-applications/renew-license";
export const PROFESSIONAL_DIVERS_APPS_ACTIVATE =
  import.meta.env.VITE_PROFESSIONAL_DIVERS_ACTIVATE ||
  "professional-divers-applications/activate";
export const PROFESSIONAL_DIVERS_APPS_CARD_REQUEST =
  import.meta.env.VITE_PROFESSIONAL_DIVERS_CARD_REQUEST ||
  "professional-divers-applications/card-request";
export const PROFESSIONAL_DIVERS_APPS_CANCEL_REQUEST =
  import.meta.env.VITE_PROFESSIONAL_DIVERS_CANCEL_REQUEST ||
  "professional-divers-applications/cancel-request";
export const PROFESSIONAL_DIVERS_APPS_CREATE_LICENSE =
  import.meta.env.VITE_PROFESSIONAL_DIVERS_NEW_LICENSE ||
  "professional-divers-applications/new-license";
export const PROFESSIONAL_DIVERS_APPS_DELETE_QUALIFICATION =
  import.meta.env.VITE_PROFESSIONAL_DIVERS_DELETE_QUALIFICATION ||
  "professional-divers-applications/delete-qualification/";
export const PROFESSIONAL_DIVERS_APPS_GET_RELATIVES =
  import.meta.env.VITE_PROFESSIONAL_DIVERS_PICK_RELATIVES ||
  "professional-divers-applications/pick-relatives/";
export const PROFESSIONAL_DIVERS_APPS_UPDATE_PORTRAIT =
  import.meta.env.VITE_PROFESSIONAL_DIVERS_UPDATE_APPLICANT_PORTRAIT ||
  "applications/update-applicant-portrait/";
export const PROFESSIONAL_DIVERS_APPS_SET_SERVICES =
  import.meta.env.VITE_PROFESSIONAL_DIVERS_SET_SERVICES ||
  "professional-divers-applications/set-services/";
export const PROFESSIONAL_DIVERS_APPS_RESTORE_QUALIFICATION =
  import.meta.env.VITE_RESTORE_PROFESSIONAL_DIVER_QUALIFICATION ||
  "professional-divers-applications/restore-qualification/";

// Professional Diver Applications
export const PROFESSIONAL_DIVERS_APPS_CREATE =
  import.meta.env.VITE_NEW_APPLICATION || "applications/new-application";
export const PROFESSIONAL_DIVERS_APPS_GET =
  import.meta.env.VITE_GET_NEW_APPLICATION || "applications/new-application/";
export const PROFESSIONAL_DIVERS_APPS_GET_LICENSE_PROFILE =
  import.meta.env.VITE_PROFESSIONAL_DIVERS_APPS_GET_LICENSE_PROFILE ||
  "professional-divers-applications/new-license-profile";
export const PROFESSIONAL_DIVERS_APPS_UPDATE_MEMBERSHIPS =
  import.meta.env.VITE_PROFESSIONAL_DIVER_INTERNATIONAL_MEMBERSHIPS_UPDATE ||
  "applications/new-application/professional-diver-qualifications-update";
export const PROFESSIONAL_DIVERS_APPS_UPDATE_CONTRACTS =
  import.meta.env.VITE_PROFESSIONAL_DIVER_WORK_CONTRACTS_UPDATE ||
  "applications/new-application/professional-diver-qualifications-update";

// Professional Diver Memberships
export const PROFESSIONAL_DIVERS_MEMBERSHIPS_GET_BY_APP =
  import.meta.env.VITE_PRO_DIVER_MEMBERSHIPS_BY_APP ||
  "professional-diver-memberships/by-application-id/";
export const PROFESSIONAL_DIVERS_MEMBERSHIPS_CREATE =
  import.meta.env.VITE_PROFESSIONAL_DIVER_NEW_MEMBERSHIP ||
  "professional-diver-memberships/new/";
export const PROFESSIONAL_DIVERS_MEMBERSHIPS_CANCEL =
  import.meta.env.VITE_PROFESSIONAL_DIVER_MEMBERSHIP_CANCEL ||
  "professional-diver-memberships/cancel/";
export const PROFESSIONAL_DIVERS_MEMBERSHIPS_RESTORE =
  import.meta.env.VITE_PROFESSIONAL_DIVER_MEMBERSHIP_RESTORE ||
  "professional-diver-memberships/reactivate/";

// Professional Diver Contracts
export const PROFESSIONAL_DIVERS_CONTRACTS_REGISTER =
  import.meta.env.VITE_APPLICATIONS_PROFESSIONAL_DIVERS_CONTRACTS_REGISTER ||
  "applications-professional-divers-contracts/register/";
export const PROFESSIONAL_DIVERS_CONTRACTS_CANCEL =
  import.meta.env.VITE_APPLICATIONS_PROFESSIONAL_DIVERS_CONTRACTS_CANCEL ||
  "applications-professional-divers-contracts/cancel/";
export const PROFESSIONAL_DIVERS_CONTRACTS_REACTIVATE =
  import.meta.env.VITE_APPLICATIONS_PROFESSIONAL_DIVERS_CONTRACTS_REACTIVE ||
  "applications-professional-divers-contracts/reactivate/";

// ──────────────────────────────────────────────────────────────────────────────
// APPLICATIONS ENDPOINTS
// ──────────────────────────────────────────────────────────────────────────────

export const APPLICATIONS_GET_BY_ID =
  import.meta.env.VITE_APPLICATION_BY_ID || "applications/by-id/{appId}";
export const APPLICATIONS_GET_ACTIONS =
  import.meta.env.VITE_APPLICATION_ACTIONS_BY_APP_ID ||
  "applications/actions-by-application-id/{appId}";
export const APPLICATIONS_SUBMIT =
  import.meta.env.VITE_APPLICATION_SUBMIT_URL ||
  "applications/execute/submit/{appId}";
export const APPLICATIONS_RESUBMIT =
  import.meta.env.VITE_APPLICATION_RESUBMIT_URL ||
  "applications/execute/resubmit/{appId}";
export const APPLICATIONS_RECALL =
  import.meta.env.VITE_APPLICATION_RECALL_URL ||
  "applications/execute/recall/{appId}";
export const APPLICATIONS_DELETE =
  import.meta.env.VITE_APPLICATION_DELETE_URL || "applications/delete/{appId}";
export const APPLICATIONS_PICK =
  import.meta.env.VITE_APPLICATION_PICK_URL || "applications/pick/{appId}";
export const APPLICATIONS_PICK_BY_ID =
  import.meta.env.VITE_APPLICATIONS_PICK || "applications/pick/";
export const APPLICATIONS_DELETE_BY_ID =
  import.meta.env.VITE_DELETE_APPLICATION || "applications/delete";

// ──────────────────────────────────────────────────────────────────────────────
// APPLICATION FILES ENDPOINTS
// ──────────────────────────────────────────────────────────────────────────────

export const APPLICATION_FILES_GET =
  import.meta.env.VITE_APPLICATION_FILES_GET ||
  "applications-files/by-application-id/";
export const APPLICATION_FILES_CREATE =
  import.meta.env.VITE_APPLICATION_FILES_NEW || "applications-files/new/";
export const APPLICATION_FILES_DELETE =
  import.meta.env.VITE_APPLICATION_FILES_REMOVE || "applications-files/remove/";
export const APPLICATION_FILES_GET_BY_APP_ID =
  import.meta.env.VITE_APPLICATION_FILES_BY_APPLICATION_ID ||
  "applications-files/by-application-id/{appId}";

// ──────────────────────────────────────────────────────────────────────────────
// INVOICES ENDPOINTS
// ──────────────────────────────────────────────────────────────────────────────

export const INVOICES_GET_BY_ID =
  import.meta.env.VITE_INVOICES_REVIEW || "invoices/get-by-id/";
export const QUOTATIONS_GET_BY_ID =
  import.meta.env.VITE_QUOTATIONS_BYID || "invoices/get-by-id/";
export const QUOTATIONS_UPDATE_PAYMENT =
  import.meta.env.VITE_QUOTATIONS_CHECK_PAYMENT || "invoices/update-payment/";
export const PAYLINK_CHECK_PAYMENT =
  import.meta.env.VITE_PAYLINK_CHECH_PAYMENT || "paylink/check-payment/";

// ──────────────────────────────────────────────────────────────────────────────
// USERS ENDPOINTS
// ──────────────────────────────────────────────────────────────────────────────

export const USERS_UPDATE_PROFILE =
  import.meta.env.VITE_APPS_USERS_UPDATE_USER_PROFILE ||
  "applications/update-user-profile/";
export const USERS_GET_PROFILE =
  import.meta.env.VITE_APPS_USERS_PROFILES_PICK || "applications/user-profile/";
export const USERS_GET_PROFILE_BY_ID =
  import.meta.env.VITE_USERS_PROFILES_PICK || "users/profile";

// ──────────────────────────────────────────────────────────────────────────────
// MEDIA ENDPOINTS
// ──────────────────────────────────────────────────────────────────────────────

export const MEDIA_LICENSE_CARD_SVG =
  import.meta.env.VITE_LICENSE_CARD_SVG ||
  "platform/media/applications/licens-card-raw-front.svg";
export const MEDIA_LICENSE_CARD_IMG =
  import.meta.env.VITE_LICENSE_CARD_IMG ||
  "applications_files/assets/licens-card-raw-front.jpg";

// ──────────────────────────────────────────────────────────────────────────────
// REGULATIONS ENDPOINTS
// ──────────────────────────────────────────────────────────────────────────────

export const DIVING_REGULATIONS_GET =
  import.meta.env.VITE_DIVING_REGULATIONS_URL || "/data/regulations.json";

// ──────────────────────────────────────────────────────────────────────────────
// DOCUMENTATION
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Centralized API Endpoints Configuration
 * =========================================
 *
 * This file serves as the single source of truth for all API endpoints in the application.
 * All endpoints are imported from environment variables defined in the .env file.
 *
 * USAGE:
 * ======
 * import { AUTH_SIGN_IN, APPLICATION_BY_ID } from '@/v3/config/apiEndpoints';
 *
 * // Use in API calls
 * await apiGet(AUTH_SIGN_IN);
 * await apiGet(APPLICATION_BY_ID.replace('{appId}', appId));
 *
 * BENEFITS:
 * =========
 * 1. Single source of truth for all API endpoints
 * 2. Easy to maintain and update endpoints
 * 3. Type-safe endpoint references
 * 4. Centralized fallback values
 * 5. Environment-specific configuration
 *
 * ENDPOINT CATEGORIES:
 * ====================
 * - Base URLs
 * - Authentication
 * - Content
 * - Common
 * - Competitions
 * - Diving Centers
 * - Events
 * - Athletes
 * - Professional Divers
 * - Applications
 * - Application Files
 * - Invoices
 * - Users
 * - Freediving
 * - Media
 * - Regulations
 */
