// VERSION: 1.2.0
// PATH: src/v3/config/application-config.js

// ────────────────────────────────────────────────────────────────────────────
// ENVIRONMENT VARIABLES
// ────────────────────────────────────────────────────────────────────────────

const EVENTS_BY_ID = import.meta.env.VITE_EVENTS_BY_ID;
const SF_TEAMS_BY_APP_ID = import.meta.env.VITE_EVENTS_SF_TEAMS_BY_APP_ID;
const SF_PARTICIPANTS_BY_APP_ID = import.meta.env
  .VITE_EVENTS_SF_PARTICIPANTS_BY_APP_ID;
const FILES_BY_APP_ID = import.meta.env
  .VITE_APPLICATION_FILES_BY_APPLICATION_ID;
const QUOTATIONS_BY_APP_ID = import.meta.env.VITE_QUOTATIONS_BY_APP_ID;
const ACTIONS_BY_APP_ID = import.meta.env.VITE_APPLICATION_ACTIONS_BY_APP_ID;

// ────────────────────────────────────────────────────────────────────────────
// SHARED/COMMON DATA LOADERS (Used across all application types)
// ────────────────────────────────────────────────────────────────────────────

const COMMON_DATA_LOADERS = {
  files: {
    endpoint: FILES_BY_APP_ID,
    payloadKey: "files",
    loadingKey: "files",
  },
  // quotations: {
  //     endpoint: QUOTATIONS_BY_APP_ID,
  //     payloadKey: 'quotations',
  //     loadingKey: 'quotations'
  // },
};

// ────────────────────────────────────────────────────────────────────────────
// DIVING CENTERS SHARED CONFIG
// ────────────────────────────────────────────────────────────────────────────

const DIVING_CENTER_PAYLOAD_KEYS = [
  "center_profile",
  "active_files",
  "active_international_memberships",
  "application_international_memberships",
  "unverified_international_memberships",
  "center_administrators",
  "files",
  "actions",
];

const DIVING_CENTER_ACCEPTED_FILES = [
  "Logo",
  "Owner National Identity",
  "Manager National Identity",
  "International Membership",
  "National Address",
  "Air Purity Certificate",
  "Maintenance License",
  "Air Compressor Worker Qualifications",
  "Training Course Records",
  "Other",
];

const DIVING_CENTER_SUMMARY_LAYOUT = [
  "ApplicationInfoCard",
  "DivingCenterProfileCard",
  "DivingCenterActivitiesCard",
  "DivingCenterInternationalMembershipsCard",
  "DivingCenterAdministratorsCard",
  "ActiveFilesCard",
  "FilesCard",
  "ActionsTrackingCard",
];

function payloadCollectionValues(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (value && typeof value === "object" && "value" in value) {
    return Array.isArray(value.value) ? value.value : [];
  }

  return [];
}

function diveCenterDerivedRequiredFiles(payload = {}) {
  const memberships = payloadCollectionValues(
    payload?.unverified_international_memberships
  );
  const files = [];

  memberships.forEach((membership) => {
    if (membership?.action !== "register") {
      return;
    }

    const organization =
      typeof membership?.organization === "string"
        ? membership.organization.trim()
        : "";

    if (!organization) {
      return;
    }

    files.push(`${organization} Membership Certificate`);
  });

  return Array.from(new Set(files));
}

function createDivingCenterSteps() {
  return [
    {
      id: "center_profile",
      label: "Center Profile",
      type: "entity",
      blocking: true,
      component: "DivingCenterProfileCard",
    },
    {
      id: "diving_activities",
      label: "Diving Activities",
      type: "entity",
      blocking: true,
      component: "DivingCenterActivitiesCard",
    },
    {
      id: "international_memberships",
      label: "International Memberships",
      type: "entity",
      blocking: true,
      component: "DivingCenterInternationalMembershipsCard",
    },
    {
      id: "center_administrators",
      label: "Administrators",
      type: "entity",
      blocking: true,
      component: "DivingCenterAdministratorsCard",
    },
    {
      id: "files",
      label: "Required Documents",
      type: "files",
      blocking: true,
      component: "FilesCard",
    },
  ];
}

// ────────────────────────────────────────────────────────────────────────────
// APPLICATION WAIVERS
// ────────────────────────────────────────────────────────────────────────────
// Waiver acknowledgement texts keyed by a unique id. Each entry provides
// localized text for both English and Arabic. A flow references a waiver by
// setting `waiverId` in its config below. The frontend renders the text for
// the active locale and blocks submit until the applicant checks the box.
// Text lives here (not in vue-i18n locale files) so it stays a single source
// of truth per waiver id.
export const APPLICATION_WAIVERS = {
  contract_cancellation_acknowledgement: {
    en: "Contract cancellation requires notifying the contracted pro diver through the official channels agreed upon in the contract and settling all outstanding dues.",
    ar: "إلغاء العقد يستوجب إخطار الغواص المحترف المتعاقد عبر القنوات الرسمية المتفق عليها في العقد وتسوية جميع المستحقات المعلقة.",
  },
};

/**
 * Get the waiver config for a given waiver id.
 * @param {string} id - Waiver id
 * @returns {object|null} Waiver config or null if not found
 */
export function getApplicationWaiver(id) {
  if (!id) return null;
  return APPLICATION_WAIVERS[id] || null;
}

// ────────────────────────────────────────────────────────────────────────────
// APPLICATION-SPECIFIC CONFIGURATIONS
// ────────────────────────────────────────────────────────────────────────────

export const APPLICATION_CONFIG = {
  //============================================================================
  // SPORT FISHING COMPETITION TEAM REGISTRATION
  //============================================================================
  "sport-fishing-competition-team-registration": {
    // Display name
    displayName: "Sport Fishing Competition Team Registration",

    // File requirements
    requiredFiles: [
      "Boat Registration Certificate",
      "Boat Driver License",
      "Boat Owner Identity",
      "Medical Examination",
    ],
    acceptedFiles: [
      "Boat Registration Certificate",
      "Boat Driver License",
      "Boat Owner Identity",
      "Medical Examination",
      "Other",
    ],

    // Payload keys for backend loading
    payloadKeys: [
      "event",
      "sf_team",
      "sf_participants",
      "files",
      "quotations",
      "actions",
    ],

    // Workflow steps (execution order)
    steps: [
      {
        id: "sf_team",
        label: "Team Information",
        type: "entity",
        blocking: true,
        component: "SFTeamCard",
        validation: {
          type: "callback",
          handler: "validateTeamInfo",
        },
        actions: {
          edit: {
            route: "fishing-team-update",
            params: ["appId"],
          },
        },
      },
      {
        id: "sf_participants",
        label: "Team Participants",
        type: "entity",
        blocking: true,
        component: "SFParticipantsCard",
        validation: {
          type: "callback",
          handler: "validateParticipants",
          meta: { min: 3, max: 5 },
        },
        actions: {
          add: {
            route: "fishing-participant-add",
            params: ["appId"],
          },
        },
      },
      {
        id: "files",
        label: "Attached Files",
        type: "files",
        blocking: true,
        component: "FilesCard",
        validation: {
          type: "callback",
          handler: "validateRequiredFiles",
        },
        actions: {
          upload: {
            route: "app-new-files",
            params: ["appId"],
          },
        },
      },
      {
        id: "waiver",
        label: "Terms & Conditions",
        type: "waiver",
        blocking: false, // Optional for now
        component: "WaiverCard",
        validation: {
          type: "callback",
          handler: "validateWaiver",
        },
        actions: {
          open: {
            route: "app-waiver",
            params: ["appId"],
          },
        },
      },
    ],

    // Summary page layout (card order)
    summaryLayout: [
      "ApplicationInfoCard",
      "EventInfoCard",
      "SFTeamCard",
      "SFParticipantsCard",
      "FilesCard",
      "ApplicationFeesCard",
      "ActionsTrackingCard",
    ],
    // Data loading strategy
    dataLoaders: {
      event: {
        endpoint: EVENTS_BY_ID,
        payloadKey: "event",
        loadingKey: "event",
      },
      sf_team: {
        endpoint: SF_TEAMS_BY_APP_ID,
        payloadKey: "sf_team",
        loadingKey: "sf_team",
      },
      sf_participants: {
        endpoint: SF_PARTICIPANTS_BY_APP_ID,
        payloadKey: "sf_participants",
        loadingKey: "sf_participants",
        allowEmpty: true,
      },
    },
  },

  //============================================================================
  // ATHLETE REGISTRATION
  //============================================================================
  "athlete-registration": {
    displayName: "Athlete Registration",

    // Payload keys for backend loading
    payloadKeys: [
      "user_profile",
      "user_profile_picture",
      "sport",
      "files",
      "quotations",
      "actions",
    ],

    // Sports list
    sports: [
      "jetski",
      "freediving",
      "flyboard",
      "sport_fishing",
      "underwater_photography",
      "target_shooting",
      "motosurf",
      "powerboat_e1",
      "powerboat_f1",
      "powerboat_f2",
      "powerboat_f4",
      "powerboat_xcat",
    ],

    // File requirements
    requiredFiles: [],
    acceptedFiles: [
      "National Identity",
      "Medical Examination",
      "Racer License",
      "Freediving License",
      "International Membership",
      "Other",
    ],

    // Workflow steps (execution order)
    steps: [
      {
        id: "sport_selection",
        label: "Sport Selection",
        type: "entity",
        blocking: true,
        component: "SportSelectionCard",
        validation: {
          type: "callback",
          handler: "validateSportSelection",
        },
      },
      {
        id: "user_profile",
        label: "Athlete Profile",
        type: "entity",
        blocking: true,
        component: "ApplicantProfileCard",
        validation: {
          type: "callback",
          handler: "validateUserProfile",
        },
        actions: {
          edit: {
            route: "user-profile-update",
            params: ["appId"],
          },
        },
      },
      {
        id: "user_profile_picture",
        label: "Personal Photography",
        type: "entity",
        blocking: true,
        component: "ApplicantPersonalPhotoCard",
        validation: {
          type: "callback",
          handler: "validateAthletePortrait",
        },
        actions: {
          upload: {
            route: "applicant-personal-photo-upload",
            params: ["appId"],
          },
        },
      },
      {
        id: "files",
        label: "Attached Files",
        type: "files",
        blocking: true,
        component: "FilesCard",
        validation: {
          type: "callback",
          handler: "validateRequiredFiles",
        },
        actions: {
          upload: {
            route: "app-new-files",
            params: ["appId"],
          },
        },
      },
    ],

    // Summary page layout (card order)
    summaryLayout: [
      "ApplicationInfoCard",
      "SportSelectionCard",
      "ApplicantProfileCard",
      "ApplicantPersonalPhotoCard",
      "FilesCard",
      // 'QuotationCard',
      "ActionsTrackingCard",
    ],

    // Data loading strategy
    dataLoaders: {
      user_profile_picture: {
        endpoint: "applications-files/personal-picture/{appId}",
        payloadKey: "user_profile_picture",
        loadingKey: "user_profile_picture",
        allowEmpty: true,
      },
    },
  },

  //============================================================================
  // Underwater Photography COMPETITION TEAM REGISTRATION
  //============================================================================
  "underwater-photography-competition-participation": {
    // Display name
    displayName: "Underwater Photography Competition Participation",

    // Payload keys for backend loading
    payloadKeys: [
      "event",
      "sf_team",
      "sf_participants",
      "files",
      "quotations",
      "actions",
    ],

    // File requirements
    requiredFiles: [
      "Participant Diving License",
      "Participant Medical Examination",
      "Buddy National Identity",
      "Buddy Diving License",
      "Buddy Medical Examination",
    ],
    acceptedFiles: ["Medical Examination", "Other"],

    // Workflow steps (execution order)
    steps: [
      {
        id: "sf_team",
        label: "Team Information",
        type: "entity",
        blocking: true,
        component: "SFTeamCard",
        validation: {
          type: "callback",
          handler: "validateTeamInfo",
        },
        actions: {
          edit: {
            route: "fishing-team-update",
            params: ["appId"],
          },
        },
      },

      {
        id: "files",
        label: "Attached Files",
        type: "files",
        blocking: true,
        component: "FilesCard",
        validation: {
          type: "callback",
          handler: "validateRequiredFiles",
        },
        actions: {
          upload: {
            route: "app-new-files",
            params: ["appId"],
          },
        },
      },
      {
        id: "waiver",
        label: "Terms & Conditions",
        type: "waiver",
        blocking: false, // Optional for now
        component: "WaiverCard",
        validation: {
          type: "callback",
          handler: "validateWaiver",
        },
        actions: {
          open: {
            route: "app-waiver",
            params: ["appId"],
          },
        },
      },
    ],

    // Summary page layout (card order)
    summaryLayout: [
      "ApplicationInfoCard",
      "EventInfoCard",
      "SFTeamCard",
      "FilesCard",
      "ApplicationFeesCard",
      "ActionsTrackingCard",
    ],

    // Data loading strategy
    dataLoaders: {
      event: {
        endpoint: EVENTS_BY_ID,
        payloadKey: "event",
        loadingKey: "event",
      },
      sf_team: {
        endpoint: SF_TEAMS_BY_APP_ID,
        payloadKey: "sf_team",
        loadingKey: "sf_team",
      },
      sf_participants: {
        endpoint: SF_PARTICIPANTS_BY_APP_ID,
        payloadKey: "sf_participants",
        loadingKey: "sf_participants",
        allowEmpty: true,
      },
    },
  },

  //============================================================================
  // RECREATIONAL DIVER LICENSE ISSUANCE
  //============================================================================
  "Professional Diver New License": {
    displayName: "Professional Diver New License",

    // Payload keys for backend loading
    payloadKeys: [
      "user_profile",
      "pd_license",
      "user_profile_picture",
      "pd_memberships",
      "pd_contracts",
      "files",
      "quotations",
      "actions",
    ],

    requiredFiles: ["Medical Examination", "National Identity"],
    acceptedFiles: [
      "Medical Examination",
      "International Membership",
      "Work Contract",
      "Other",
    ],

    steps: [
      {
        id: "diver_profile",
        label: "Diver Profile",
        type: "profile",
        blocking: true,
        component: "ApplicantProfileCard",
      },
      {
        id: "pd_memberships",
        label: "Professional Diver International Memberships",
        type: "entity",
        blocking: true,
        component: "PDMembershipsCard",
        validation: {
          type: "callback",
          handler: "validatePDMemberships",
        },
      },
      {
        id: "pd_contracts",
        label: "Professional Diver Work Contracts",
        type: "entity",
        blocking: true,
        component: "PDWorkContractsCard",
        validation: {
          type: "callback",
          handler: "validatePDContracts",
        },
      },
      {
        id: "files",
        label: "Required Documents",
        type: "files",
        blocking: true,
        component: "FilesCard",
      },
      {
        id: "user_profile_picture",
        label: "Personal Photography",
        type: "entity",
        blocking: true,
        component: "ApplicantPersonalPhotoCard",
        validation: {
          type: "callback",
          handler: "validateAthletePortrait",
        },
        actions: {
          upload: {
            route: "applicant-personal-photo-upload",
            params: ["appId"],
          },
        },
      },
    ],

    summaryLayout: [
      "ApplicationInfoCard",
      "ApplicationFeesCard",
      "ApplicantProfileCard",
      "PDLicenseInformationCard",
      "ApplicantPersonalPhotoCard",
      "PDMembershipsCard",
      "PDWorkContractsCard",
      "FilesCard",
      "ActionsTrackingCard",
    ],
  },

  //============================================================================
  // PROFESSIONAL DIVER LICENSE ISSUANCE
  //============================================================================
  "Professional Diver License Renewal": {
    displayName: "Professional Diver License Renewal",

    // Payload keys for backend loading
    payloadKeys: [
      "user_profile",
      "pd_license",
      "user_profile_picture",
      "pd_memberships",
      "pd_contracts",
      "files",
      "quotations",
      "actions",
    ],

    requiredFiles: ["Medical Examination", "National Identity"],

    acceptedFiles: [
      "Medical Examination",
      "International Membership",
      "Work Contract",
      "Other",
    ],

    steps: [
      {
        id: "diver_profile",
        label: "Professional Diver Profile",
        type: "profile",
        blocking: true,
        component: "ProfessionalDiverProfile",
      },
      {
        id: "pd_memberships",
        label: "Professional Diver International Memberships",
        type: "entity",
        blocking: true,
        component: "PDMembershipsCard",
        validation: {
          type: "callback",
          handler: "validatePDMemberships",
        },
      },
      {
        id: "pd_contracts",
        label: "Professional Diver Work Contracts",
        type: "entity",
        blocking: true,
        component: "PDWorkContractsCard",
        validation: {
          type: "callback",
          handler: "validatePDContracts",
        },
      },
      {
        id: "files",
        label: "Required Documents",
        type: "files",
        blocking: true,
        component: "FilesCard",
      },
    ],

    summaryLayout: [
      "ApplicationInfoCard",
      "ApplicationFeesCard",
      "ApplicantProfileCard",
      "PDLicenseInformationCard",
      "ApplicantPersonalPhotoCard",
      "PDMembershipsCard",
      "PDWorkContractsCard",
      "FilesCard",
      "ActionsTrackingCard",
    ],
  },

  //============================================================================
  // RECREATIONAL DIVER LICENSE RENEWAL
  //============================================================================
  "Professional Diver Information Update": {
    displayName: "Professional Diver Information Update",

    // Payload keys for backend loading
    payloadKeys: [
      "user_profile" /*'pd_license' */,
      ,
      "user_profile_picture",
      "pd_memberships",
      "pd_contracts",
      "files",
      "quotations",
      "actions",
    ],

    requiredFiles: [],
    acceptedFiles: [
      "National Identity",
      "International Membership",
      "Work Contract",
      "Other",
    ],

    steps: [
      {
        id: "pd_memberships",
        label: "Professional Diver International Memberships",
        type: "entity",
        blocking: true,
        component: "PDMembershipsCard",
        validation: {
          type: "callback",
          handler: "validatePDMemberships",
        },
      },
      {
        id: "pd_contracts",
        label: "Professional Diver Work Contracts",
        type: "entity",
        blocking: true,
        component: "PDWorkContractsCard",
        validation: {
          type: "callback",
          handler: "validatePDContracts",
        },
      },
      {
        id: "files",
        label: "Required Documents",
        type: "files",
        blocking: true,
        component: "FilesCard",
      },
    ],

    summaryLayout: [
      "ApplicationInfoCard",
      "ApplicationFeesCard",
      "ApplicantProfileCard",
      // 'PDLicenseInformationCard',
      "ApplicantPersonalPhotoCard",
      "PDMembershipsCard",
      "PDWorkContractsCard",
      "FilesCard",
      "ActionsTrackingCard",
    ],
  },

  //============================================================================
  // VENDOR REGISTRATION
  //============================================================================
  "Vendor Registration": {
    displayName: "Vendor Registration",

    payloadKeys: [
      "vendor_profile",
      "vendor_contact_updates",
      "files",
      "actions",
    ],

    requiredFiles: ["Commercial Registration", "National Address"],
    acceptedFiles: [
      "Commercial Registration",
      "VAT Registration Certificate",
      "National Address",
      "Company Profile",
      "Other",
    ],

    steps: [
      {
        id: "vendor_profile",
        label: "Vendor Profile",
        type: "entity",
        blocking: true,
        component: "VendorProfileCard",
      },
      {
        id: "vendor_contact_updates",
        label: "Contact Persons",
        type: "entity",
        blocking: true,
        component: "VendorContactUpdatesCard",
      },
      {
        id: "files",
        label: "Required Documents",
        type: "files",
        blocking: true,
        component: "FilesCard",
      },
    ],

    summaryLayout: [
      "ApplicationInfoCard",
      "VendorProfileCard",
      "VendorContactUpdatesCard",
      "FilesCard",
      "ActionsTrackingCard",
    ],
  },
  "Vendor Profile Update": {
    displayName: "Vendor Profile Update",

    payloadKeys: [
      "vendor_profile",
      "vendor_contact_updates",
      "files",
      "actions",
    ],

    requiredFiles: [],
    acceptedFiles: [
      "Commercial Registration",
      "VAT Registration Certificate",
      "National Address",
      "Company Profile",
      "Other",
    ],

    steps: [
      {
        id: "vendor_profile",
        label: "Vendor Profile",
        type: "entity",
        blocking: true,
        component: "VendorProfileCard",
      },
      {
        id: "vendor_contact_updates",
        label: "Contact Person Actions",
        type: "entity",
        blocking: true,
        component: "VendorContactUpdatesCard",
      },
      {
        id: "files",
        label: "Supporting Documents",
        type: "files",
        blocking: false,
        component: "FilesCard",
      },
    ],

    summaryLayout: [
      "ApplicationInfoCard",
      "VendorProfileCard",
      "VendorContactUpdatesCard",
      "FilesCard",
      "ActionsTrackingCard",
    ],
  },

  //============================================================================
  // DIVING CENTER NEW MEMBERSHIP
  //============================================================================
  "Diving Center New Membership": {
    displayName: "Diving Center New Membership",

    // Summary-first refactor: keep diving-center flows aligned to shared app-summary.
    payloadKeys: [...DIVING_CENTER_PAYLOAD_KEYS],

    requiredFiles: ["Logo"],
    derivedRequiredFiles: diveCenterDerivedRequiredFiles,
    acceptedFiles: [...DIVING_CENTER_ACCEPTED_FILES],
    steps: createDivingCenterSteps(),
    summaryLayout: [...DIVING_CENTER_SUMMARY_LAYOUT],
  },
  "Diving Center Membership Renewal": {
    displayName: "Diving Center Membership Renewal",

    payloadKeys: [...DIVING_CENTER_PAYLOAD_KEYS],

    requiredFiles: ["Logo"],
    derivedRequiredFiles: diveCenterDerivedRequiredFiles,
    acceptedFiles: [...DIVING_CENTER_ACCEPTED_FILES],
    steps: createDivingCenterSteps(),
    summaryLayout: [...DIVING_CENTER_SUMMARY_LAYOUT],
  },

  "Diving Center Information Update": {
    displayName: "Diving Center Information Update",

    requiredFiles: ["Logo"],
    payloadKeys: [...DIVING_CENTER_PAYLOAD_KEYS],
    derivedRequiredFiles: diveCenterDerivedRequiredFiles,

    acceptedFiles: [...DIVING_CENTER_ACCEPTED_FILES],
    steps: createDivingCenterSteps(),
    summaryLayout: [...DIVING_CENTER_SUMMARY_LAYOUT],
  },

  "Diving Center Administrators Update": {
    displayName: "Diving Center Administrators Update",

    payloadKeys: [...DIVING_CENTER_PAYLOAD_KEYS],

    requiredFiles: [],
    derivedRequiredFiles: diveCenterDerivedRequiredFiles,
    acceptedFiles: [...DIVING_CENTER_ACCEPTED_FILES],
    steps: createDivingCenterSteps(),
    summaryLayout: [...DIVING_CENTER_SUMMARY_LAYOUT],
  },

  //============================================================================
  // DIVING CENTER — PROFESSIONAL DIVERS CONTRACTS UPDATES
  // One application per selected professional-diver contract (cancellation).
  // No files. The pd_contracts payload key is loaded by the shared backend
  // ApplicationPayloadComponent::loadPDContracts() for the application.
  //============================================================================
  "Professional Divers Contracts Updates": {
    displayName: "Professional Divers Contracts Updates",

    payloadKeys: ["center_profile", "center_active_contracts", "actions"],

    waiverId: "contract_cancellation_acknowledgement",

    requiredFiles: [],
    acceptedFiles: [],

    steps: [
      {
        id: "pd_contracts",
        label: "Professional Diver Work Contracts",
        type: "entity",
        blocking: true,
        component: "DivingCenterProfessionalDiverContractUpdateCard",
      },
      {
        id: "waiver",
        label: "Waiver & Acknowledgement",
        type: "waiver",
        blocking: true,
        component: "ApplicationWaiver",
      },
    ],

    summaryLayout: [
      "ApplicationInfoCard",
      "DivingCenterProfessionalDiverContractUpdateCard",
      "ApplicationWaiver",
      "ActionsTrackingCard",
    ],
  },

  //============================================================================
  // JETSKI COMPETITION PARTICIPATION
  //============================================================================
  "Jetski Competition Participation": {
    displayName: "Jetski Competition Participation",

    // Payload keys for backend loading
    payloadKeys: [
      "event",
      "participation",
      "user_profile",
      "user_profile_picture",
      "files",
      "quotations",
      "actions",
    ],

    requiredFiles: ["Medical Examination", "National Identity"],
    acceptedFiles: ["Medical Examination", "National Identity", "Other"],

    steps: [
      {
        id: "sport_participation",
        label: "Sport Participation Details",
        type: "entity",
        blocking: true,
        component: "SportParticipation",
        validation: {
          type: "callback",
          handler: "validateSportParticipation",
        },
      },
      {
        id: "user_profile",
        label: "User Profile",
        type: "profile",
        blocking: true,
        component: "ProfileDetails",
        validation: {
          type: "callback",
          handler: "validateUserProfile",
        },
      },
      {
        id: "files",
        label: "Required Documents",
        type: "files",
        blocking: true,
        component: "FilesCard",
        validation: {
          type: "callback",
          handler: "validateRequiredFiles",
        },
      },
    ],

    summaryLayout: [
      "ApplicationInfoCard",
      "EventInfoCard",
      "SportParticipation",
      "ProfileDetails",
      "FilesCard",
      "ApplicationFeesCard",
      "ActionsTrackingCard",
    ],

    dataLoaders: {
      event: {
        endpoint: "/events/{targetId}",
        payloadKey: "event",
        loadingKey: "event",
      },
      participation: {
        endpoint: "/jetski-participations/by-application-id/{appId}",
        payloadKey: "participation",
        loadingKey: "participation",
      },
    },
  },

  "Freediving Competition Participation": {
    displayName: "Freediving Competition Participation",

    // Payload keys for backend loading
    payloadKeys: [
      "event",
      "participation",
      "user_profile",
      "user_profile_picture",
      "files",
      "quotations",
      "actions",
    ],

    requiredFiles: ["Medical Examination"],
    acceptedFiles: ["Medical Examination", "National Identity", "Other"],

    steps: [
      {
        id: "sport_participation",
        label: "Sport Participation Details",
        type: "entity",
        blocking: true,
        component: "SportParticipation",
        validation: {
          type: "callback",
          handler: "validateSportParticipation",
        },
      },
      {
        id: "user_profile",
        label: "User Profile",
        type: "profile",
        blocking: true,
        component: "ProfileDetails",
        validation: {
          type: "callback",
          handler: "validateUserProfile",
        },
      },
      {
        id: "files",
        label: "Required Documents",
        type: "files",
        blocking: true,
        component: "FilesCard",
        validation: {
          type: "callback",
          handler: "validateRequiredFiles",
        },
      },
    ],

    summaryLayout: [
      "ApplicationInfoCard",
      "EventInfoCard",
      "SportParticipation",
      "ProfileDetails",
      "FilesCard",
      "ApplicationFeesCard",
      "ActionsTrackingCard",
    ],

    dataLoaders: {
      event: {
        endpoint: "/events/{targetId}",
        payloadKey: "event",
        loadingKey: "event",
      },
      participation: {
        endpoint: "/jetski-participations/by-application-id/{appId}",
        payloadKey: "participation",
        loadingKey: "participation",
      },
    },
  },
};

const athleteRegistrationConfig = APPLICATION_CONFIG["athlete-registration"];
const athleteRegistrationVariant = (displayName) => ({
  ...athleteRegistrationConfig,
  displayName,
});

const athleteMembershipApplicationConfig = athleteRegistrationVariant(
  "New Athlete Registration"
);
const athleteMembershipRenewalConfig = athleteRegistrationVariant(
  "Athlete Registration Renewal"
);
const athleteLicenseApplicationConfig = athleteRegistrationVariant(
  "Motorized Sports License"
);
athleteMembershipApplicationConfig.requiredFiles = [
  "National Identity",
  "Medical Examination",
];
athleteMembershipApplicationConfig.acceptedFiles = [
  ...athleteRegistrationConfig.acceptedFiles,
];
athleteMembershipRenewalConfig.requiredFiles = ["Medical Examination"];
athleteMembershipRenewalConfig.acceptedFiles = [
  ...athleteRegistrationConfig.acceptedFiles,
];
athleteLicenseApplicationConfig.requiredFiles = [];
athleteLicenseApplicationConfig.acceptedFiles = [
  ...athleteRegistrationConfig.acceptedFiles,
  "Motorized License",
];

APPLICATION_CONFIG["New Athlete Registration"] =
  athleteMembershipApplicationConfig;
APPLICATION_CONFIG["New Athlete License"] = athleteLicenseApplicationConfig;
APPLICATION_CONFIG["Motorized Sports License"] =
  athleteLicenseApplicationConfig;

APPLICATION_CONFIG["Motorized Water Sports New License"] =
  athleteLicenseApplicationConfig;

// Real backend athlete flows all resolve to one of the two active athlete configs.
APPLICATION_CONFIG["water_sports_new_athlete_membership"] =
  athleteMembershipApplicationConfig;
APPLICATION_CONFIG["water_sports_athlete_membership_renewal"] =
  athleteMembershipRenewalConfig;
APPLICATION_CONFIG["motorized_water_sports_new_license"] =
  athleteLicenseApplicationConfig;
APPLICATION_CONFIG["motorized_water_sports_new_athlete_membership"] =
  athleteMembershipApplicationConfig;
APPLICATION_CONFIG["motorized_water_sports_license_renewal"] =
  athleteLicenseApplicationConfig;
APPLICATION_CONFIG["motorized_water_sports_athlete_membership_renewal"] =
  athleteMembershipRenewalConfig;
APPLICATION_CONFIG["Underwater Photography Competition Participation"] =
  APPLICATION_CONFIG["underwater-photography-competition-participation"];

const APPLICATION_DISPLAY_NAME_ALIASES = {
  water_sports_new_athlete_membership: "New Athlete Registration",
  water_sports_athlete_membership_renewal: "Athlete Registration Renewal",
  motorized_water_sports_new_license: "Motorized Sports License",
  motorized_water_sports_new_athlete_membership: "New Athlete Registration",
  motorized_water_sports_license_renewal: "Motorized Sports License",
  motorized_water_sports_athlete_membership_renewal:
    "Athlete Registration Renewal",
  "Athlete Membership Renewal": "Athlete Registration Renewal",
  "Motorized Water Sports License Renewal": "Motorized Sports License",
};

// ────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ────────────────────────────────────────────────────────────────────────────

/**
 * Get configuration for a specific application type
 * @param {string} applicationType - The application type key
 * @returns {Object} Configuration object or empty object if not found
 */
export function getApplicationConfig(applicationType) {
  const config = APPLICATION_CONFIG[applicationType];
  if (!config) {
    // console.warn(`APPLICATION_CONFIG: No configuration found for type "${applicationType}"`);
    return {};
  }
  return config;
}

/**
 * Get human-readable display name for a specific application type
 * @param {string} applicationType - The application type key
 * @returns {string} Human-readable display name or original type if missing
 */
export function getApplicationDisplayName(applicationType) {
  if (!applicationType) {
    return "";
  }

  const config = getApplicationConfig(applicationType);
  return config.displayName || applicationType;
}

export function resolveApplicationDisplayName(flow, purpose) {
  if (flow && APPLICATION_DISPLAY_NAME_ALIASES[flow]) {
    return APPLICATION_DISPLAY_NAME_ALIASES[flow];
  }

  if (purpose && APPLICATION_DISPLAY_NAME_ALIASES[purpose]) {
    return APPLICATION_DISPLAY_NAME_ALIASES[purpose];
  }

  const applicationType = resolveConfiguredApplicationType(flow, purpose);
  return getApplicationDisplayName(applicationType);
}

/**
 * Resolve the best configured application type from flow/purpose values.
 * Prefers flow when it is configured, otherwise falls back to purpose.
 * application.purpose is deprecated for new v3 work and must remain a
 * compatibility fallback only until older flows are fully migrated.
 *
 * @param {string|null|undefined} flow - Application flow value
 * @param {string|null|undefined} purpose - Deprecated legacy application purpose value
 * @returns {string|null} Configured application type key, or the first non-empty value as fallback
 */
export function resolveConfiguredApplicationType(flow, purpose) {
  if (flow && APPLICATION_CONFIG[flow]) {
    return flow;
  }

  if (purpose && APPLICATION_CONFIG[purpose]) {
    return purpose;
  }

  return flow || purpose || null;
}

/**
 * Get all data loaders for an application type
 * Merges application-specific loaders with common loaders
 * @param {string} applicationType - The application type key
 * @returns {Object} Combined data loaders object
 */
export function getDataLoaders(applicationType) {
  const config = APPLICATION_CONFIG[applicationType];

  if (!config) {
    // console.warn(`APPLICATION_CONFIG: No configuration found for type "${applicationType}"`);
    return COMMON_DATA_LOADERS;
  }

  // console.log('***loaders*** :', {
  //     ...COMMON_DATA_LOADERS,
  //     ...(config.dataLoaders || {})
  // });

  // Merge: application-specific loaders + common loaders
  return {
    ...COMMON_DATA_LOADERS,
    ...(config.dataLoaders || {}),
  };
}

/**
 * Get data loader config for a specific entity
 * @param {string} applicationType - The application type key
 * @param {string} entityName - The entity name (e.g., 'sf_team', 'files')
 * @returns {Object|null} Loader configuration or null if not found
 */
export function getDataLoader(applicationType, entityName) {
  const loaders = getDataLoaders(applicationType);
  return loaders[entityName] || null;
}

/**
 * Get steps for a specific application type
 * @param {string} applicationType - The application type key
 * @returns {Array} Array of step objects
 */
export function getSteps(applicationType) {
  const config = getApplicationConfig(applicationType);
  return config.steps || [];
}

/**
 * Get blocking steps only (required for submission)
 * @param {string} applicationType - The application type key
 * @returns {Array} Array of blocking step objects
 */
export function getBlockingSteps(applicationType) {
  const config = getApplicationConfig(applicationType);
  return config?.steps?.filter((s) => s.blocking) || [];
}

/**
 * Get summary layout for a specific application type
 * @param {string} applicationType - The application type key
 * @returns {Array} Array of component names to render
 */
export function getSummaryLayout(applicationType) {
  const config = getApplicationConfig(applicationType);
  return config.summaryLayout || [];
}

/**
 * Get payload keys for a specific application type
 * Used to request specific entities from backend
 * @param {string} applicationType - The application type key
 * @returns {Array} Array of payload key strings
 */
export function getPayloadKeys(applicationType) {
  const config = getApplicationConfig(applicationType);
  return config.payloadKeys || [];
}

/**
 * Get sports list for athlete registration
 * @returns {Array} Array of sport names
 */
export function getSportsList() {
  const config = APPLICATION_CONFIG["athlete-registration"];
  return config?.sports || [];
}

/**
 * Get required files for a specific application type
 * @param {string} applicationType - The application type key
 * @param {Object} payload - Application payload object/store payload
 * @returns {Array} Array of required file names
 */
export function getRequiredFiles(applicationType, payload = {}) {
  const config = getApplicationConfig(applicationType);
  const configuredFiles = Array.isArray(config.requiredFiles)
    ? config.requiredFiles
    : [];
  const derivedFiles =
    typeof config?.derivedRequiredFiles === "function"
      ? config.derivedRequiredFiles(payload) || []
      : [];

  return Array.from(new Set([...configuredFiles, ...derivedFiles]));
}

/**
 * Get accepted files for a specific application type
 * @param {string} applicationType - The application type key
 * @returns {Array} Array of accepted file names
 */
export function getAcceptedFiles(applicationType) {
  const config = getApplicationConfig(applicationType);
  return config.acceptedFiles || [];
}

/**
 * Get data loading configuration (legacy compatibility)
 * @param {string} applicationType - The application type key
 * @returns {Object|null} Data loading config
 */
export function getDataLoadingConfig(applicationType) {
  const config = getApplicationConfig(applicationType);
  return config?.dataLoaders || null;
}

// ────────────────────────────────────────────────────────────────────────────
// DOCUMENTATION
// ────────────────────────────────────────────────────────────────────────────

/*
VERSION: 1.3.0

CHANGES IN v1.3.0:
==================
- Added payloadKeys configuration for all application types
- Renamed 'payLoad' → 'payloadKeys' for consistency
- Added getPayloadKeys() helper function
- Aligned payload keys with backend ApplicationPayloadComponent
- Payload keys now used for unified loading with byId endpoint

CHANGES IN v1.2.0:
==================
- Renamed 'team' → 'sf_team' (Sport Fishing Team)
- Renamed 'participants' → 'sf_participants' (Sport Fishing Participants)
- Updated component names: TeamCard → SFTeamCard, ParticipantsCard → SFParticipantsCard
- Updated component name: ApplicationFiles → FilesCard
- Added COMMON_DATA_LOADERS for shared entities (files, quotations, actions)
- Added getDataLoaders() helper to merge app-specific + common loaders
- Added getDataLoader() helper to get specific entity loader
- Added QuotationCard and ActionsTrackingCard to summaryLayout for all applications
- Preserved ALL application types from original config
- Preserved detailed steps structure with blocking, validation, actions

APPLICATION TYPES INCLUDED:
===========================
1. sport-fishing-competition-team-registration
2. athlete-registration
3. Recreational Diver License Issuance
4. Professional Diver License Issuance
5. Recreational Diver License Renewal
6. Professional Diver License Renewal
7. Diving Center New Membership
8. Jetski Competition Participation

STRUCTURE:
==========
- COMMON_DATA_LOADERS: Shared across all application types (files, quotations, actions)
- APPLICATION_CONFIG: Application-specific configurations
  - displayName: Human-readable name
  - requiredFiles: Required files for submission
  - acceptedFiles: All acceptable file types
  - steps: Detailed step objects with id, label, type, blocking, component, validation, actions
  - summaryLayout: Array of component names to render
  - dataLoaders: Application-specific data loading configuration

HELPER FUNCTIONS:
=================
- getApplicationConfig(type): Get full config for application type
- getDataLoaders(type): Get merged (app-specific + common) data loaders
- getDataLoader(type, entityName): Get specific entity loader
- getSteps(type): Get steps array
- getBlockingSteps(type): Get only blocking steps
- getSummaryLayout(type): Get UI layout components
- getSportsList(): Get sports list for athlete registration
- getRequiredFiles(type): Get required files array
- getAcceptedFiles(type): Get accepted files array
- getDataLoadingConfig(type): Get data loading config (legacy)
*/
