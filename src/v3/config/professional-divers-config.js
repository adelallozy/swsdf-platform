// VERSION: 1.0.0
// PATH: src/v3/config/professional-divers-config.js

/**
 * Professional Divers Configuration
 *
 * Centralized configuration for Professional Diver application features
 * including memberships, work contracts, and other domain-specific settings.
 */

export const PROFESSIONAL_DIVERS_CONFIG = {
  //============================================================================
  // WORK CONTRACTS CONFIGURATION
  //============================================================================
  workContracts: {
    // Maximum number of active contracts allowed
    maxContracts: 3,

    // Minimum number of contracts required for submission
    minContracts: 1,

    // Contract statuses
    statuses: {
      approved: "Approved",
      unverified: "Unverified",
      inactive: "Inactive",
    },

    // Status display mapping
    statusDisplay: {
      "approved-approved": {
        label: "Approved",
        severity: "success",
      },
      "approved-unverified": {
        label: "Unverified",
        severity: "warn",
      },
      "inactive-approved": {
        label: "Cancellation will be completed after application approval",
        severity: "warn",
      },
      "inactive-inactive": {
        label: "Inactive",
        severity: "danger",
      },
    },
  },

  //============================================================================
  // MEMBERSHIPS CONFIGURATION
  //============================================================================
  memberships: {
    // Minimum number of memberships required
    minMemberships: 1,

    // Membership statuses
    statuses: {
      verified: "Verified",
      unverified: "Unverified",
      canceled: "Canceled",
    },
  },
};

/**
 * Get work contracts configuration
 */
export function getWorkContractsConfig() {
  return PROFESSIONAL_DIVERS_CONFIG.workContracts;
}

/**
 * Get memberships configuration
 */
export function getMembershipsConfig() {
  return PROFESSIONAL_DIVERS_CONFIG.memberships;
}

/**
 * Get max contracts limit
 */
export function getMaxContracts() {
  return PROFESSIONAL_DIVERS_CONFIG.workContracts.maxContracts;
}

/**
 * Get min contracts requirement
 */
export function getMinContracts() {
  return PROFESSIONAL_DIVERS_CONFIG.workContracts.minContracts;
}

export default PROFESSIONAL_DIVERS_CONFIG;
