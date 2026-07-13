# API Endpoints Naming Convention Guide

## Overview

This document provides a comprehensive guide for naming API endpoints in environment variables (`.env` file) and JavaScript constants. Following these conventions ensures consistency, readability, and maintainability across the project.

## Current State Analysis

### Current .env Variable Patterns

The current `.env` file uses multiple inconsistent naming patterns:

```bash
# Pattern 1: VITE_MODULE_ACTION_ENTITY
VITE_AUTHENTICATOR_SIGN_IN=users/login
VITE_AUTHENTICATOR_SIGN_OUT=users/login
VITE_AUTHENTICATOR_VERIFY_TOKEN=users/verify-token

# Pattern 2: VITE_MODULE_ENTITY_ACTION
VITE_USERS_SIGN_UP=users/sign-up
VITE_USERS_FORGOT_PASSWORD=users/forgot-password
VITE_USER_DOCUMENTS=users/get-documents

# Pattern 3: VITE_MODULE_ENTITY (inconsistent)
VITE_CONTENT_INDEX=content/index
VITE_NEWS_POSTS_INDEX=content/news-index
VITE_GET_COMMON_CITIES=commons/common_cities

# Pattern 4: VITE_MODULE_ENTITY_ENTITY_ACTION (verbose)
VITE_COMPETITION_GET_ATHLETE_PARTICIPATION=competitions-applications/get-athlete-participation
VITE_COMPETITION_GET_RACING_CATEGORIES=competitions-applications/get_racing_categories

# Pattern 5: VITE_MODULE_ENTITY_ACTION (with typos)
VITE_COMPITION_NEW_JETSKY_APPLICATION=events-applications/new-jetski-application/  # "COMPITION" typo
VITE_COMPITION_UPDATE_JETSKY_APPLICATION=events-applications/update-jetski-participation/

# Pattern 6: VITE_MODULE_ENTITY_ENTITY (inconsistent)
VITE_APPS_DIVING_CENTERS_FIND=active-diving-centers/find/
VITE_APPS_DIVING_CENTERS_INDEX=active-diving-centers/index/

# Pattern 7: VITE_MODULE_ENTITY_ENTITY_ENTITY (very verbose)
VITE_APPLICATIONS_PROFESSIONAL_DIVERS_CONTRACTS_REGISTER=applications-professional-divers-contracts/register/
VITE_APPLICATIONS_PROFESSIONAL_DIVERS_CONTRACTS_CANCEL=applications-professional-divers-contracts/cancel/
```

### Issues with Current Naming

1. **Inconsistent Patterns**: Multiple naming patterns make it hard to predict variable names
2. **Typos**: "COMPITION" instead of "COMPETITION", "ATHLTETES" instead of "ATHLETES"
3. **Verbosity**: Some names are excessively long and redundant
4. **Inconsistent Action Placement**: Actions appear in different positions (beginning, middle, end)
5. **Inconsistent Use of "GET"**: Some variables include "GET" in the name, others don't
6. **Inconsistent Module Prefixes**: "VITE_APPS_" vs "VITE_" for same domain
7. **Missing Semantic Clarity**: Names don't clearly indicate what the endpoint does

## Recommended Naming Convention

### Pattern: `VITE_{MODULE}_{ENTITY}_{ACTION}`

This pattern provides consistency and clarity:

```bash
# Format: VITE_{MODULE}_{ENTITY}_{ACTION}
# Where:
# - MODULE: High-level domain (AUTH, USERS, APPLICATIONS, EVENTS, etc.)
# - ENTITY: Specific resource (PROFILE, MEMBERSHIP, APPLICATION, etc.)
# - ACTION: HTTP verb or action (GET, CREATE, UPDATE, DELETE, LIST, etc.)
```

### Examples

#### Authentication
```bash
# Current → Recommended
VITE_AUTHENTICATOR_SIGN_IN → VITE_AUTH_SIGN_IN
VITE_AUTHENTICATOR_SIGN_OUT → VITE_AUTH_SIGN_OUT
VITE_AUTHENTICATOR_VERIFY_TOKEN → VITE_AUTH_VERIFY_TOKEN
VITE_USERS_SIGN_UP → VITE_AUTH_SIGN_UP
VITE_USERS_FORGOT_PASSWORD → VITE_AUTH_FORGOT_PASSWORD
VITE_USERS_RESET_PASSWORD → VITE_AUTH_RESET_PASSWORD
VITE_USER_DOCUMENTS → VITE_USERS_GET_DOCUMENTS
```

#### Applications
```bash
# Current → Recommended
VITE_APPLICATION_BY_ID → VITE_APPLICATIONS_GET_BY_ID
VITE_APPLICATION_SUBMIT_URL → VITE_APPLICATIONS_SUBMIT
VITE_APPLICATION_RECALL_URL → VITE_APPLICATIONS_RECALL
VITE_APPLICATION_DELETE_URL → VITE_APPLICATIONS_DELETE
VITE_APPLICATION_PICK_URL → VITE_APPLICATIONS_PICK
VITE_DELETE_APPLICATION → VITE_APPLICATIONS_DELETE_BY_ID
```

#### Application Files
```bash
# Current → Recommended
VITE_APPLICATION_FILES_GET → VITE_APPLICATION_FILES_GET
VITE_APPLICATION_FILES_NEW → VITE_APPLICATION_FILES_CREATE
VITE_APPLICATION_FILES_REMOVE → VITE_APPLICATION_FILES_DELETE
VITE_APPLICATION_FILES_BY_APPLICATION_ID → VITE_APPLICATION_FILES_GET_BY_APP_ID
```

#### Competitions
```bash
# Current → Recommended
VITE_GET_COMPETITION → VITE_COMPETITIONS_GET_BY_ID
VITE_GET_ATHLETE_PARTICIPATION → VITE_COMPETITIONS_GET_ATHLETE_PARTICIPATION
VITE_GET_RACING_CATEGORIES → VITE_COMPETITIONS_GET_RACING_CATEGORIES
VITE_JETSKI_PARTICIPATION → VITE_COMPETITIONS_GET_JETSKI_PARTICIPATION
VITE_GET_ONGOING_COMPETITIONS → VITE_COMPETITIONS_GET_ONGOING
VITE_GET_COMPETITION_REGISTRATIONS → VITE_COMPETITIONS_GET_APPROVED_REGISTRATIONS
```

#### Jetski Races
```bash
# Current → Recommended
VITE_SAVE_JETSKI_RACE → VITE_JETSKI_RACES_SAVE
VITE_ADD_JETSKI_RACE → VITE_JETSKI_RACES_CREATE
VITE_GET_JETSKI_RACES_LIST → VITE_JETSKI_RACES_LIST
VITE_GET_JETSKI_RACE → VITE_JETSKI_RACES_GET_BY_ID
VITE_DELETE_JETSKI_RACE → VITE_JETSKI_RACES_DELETE
```

#### Diving Centers
```bash
# Current → Recommended
VITE_DIVING_CENTERS_VIEW → VITE_DIVING_CENTERS_VIEW
VITE_DIVING_CENTERS_INDEX → VITE_DIVING_CENTERS_LIST
VITE_LICENSED_DIVE_CENTERS → VITE_DIVING_CENTERS_GET_LICENSED
VITE_LICENSED_DIVE_CENTERS_BASIC → VITE_DIVING_CENTERS_GET_LICENSED_BASIC
VITE_LICENSED_DIVE_CENTERS_REINSPECT → VITE_DIVING_CENTERS_REINSPECT
```

#### Diving Centers Applications
```bash
# Current → Recommended
VITE_UPDATE_DIVING_CENTER_PROFILE → VITE_DIVING_CENTERS_APPS_UPDATE_PROFILE
VITE_ADD_DIVING_CENTER_PROFILE → VITE_DIVING_CENTERS_APPS_CREATE_MEMBERSHIP
VITE_DIVING_CENTERS_APPS_SUBMIT → VITE_DIVING_CENTERS_APPS_SUBMIT
VITE_DIVING_CENTERS_APPS_RECALL → VITE_DIVING_CENTERS_APPS_RECALL
VITE_DIVING_CENTERS_APPS_DELETE → VITE_DIVING_CENTERS_APPS_DELETE
```

#### Events
```bash
# Current → Recommended
VITE_EVENTS_PICK → VITE_EVENTS_PICK
VITE_EVENTS_BY_ID → VITE_EVENTS_GET_BY_ID
VITE_COMPITION_NEW_JETSKY_APPLICATION → VITE_EVENTS_JETSKI_CREATE_APPLICATION
VITE_COMPITION_UPDATE_JETSKY_APPLICATION → VITE_EVENTS_JETSKI_UPDATE_APPLICATION
VITE_COMPITION_NEW_UNDERWATER_PHOTOGRAPHY_APPLICATION → VITE_EVENTS_UNDERWATER_PHOTOGRAPHY_CREATE_APPLICATION
VITE_COMPITION_UPDATE_UNDERWATER_PHOTOGRAPHY_APPLICATION → VITE_EVENTS_UNDERWATER_PHOTOGRAPHY_UPDATE_APPLICATION
```

#### Athletes
```bash
# Current → Recommended
VITE_ATHLTETES_NEW_MEMBERSHIP → VITE_ATHLETES_CREATE_MEMBERSHIP
VITE_ATHLTETES_MEMBERSHIP_RENEW → VITE_ATHLETES_RENEW_MEMBERSHIP
VITE_ATHLTETES_UPDATE_SPORT → VITE_ATHLETES_UPDATE_SPORT
VITE_ATHLTETES_PROFILE_RELATIVES → VITE_ATHLETES_GET_RELATIVES
VITE_ATHLTETES_PROFILE → VITE_ATHLETES_GET_PROFILE
```

#### Professional Divers
```bash
# Current → Recommended
VITE_GET_PROFESSIONAL_DIVER → VITE_PROFESSIONAL_DIVERS_GET_BY_USER
VITE_PROFESSIONAL_DIVERS_PICK → VITE_PROFESSIONAL_DIVERS_PICK
VITE_PROFESSIONAL_DIVERS_NEW_LICENSE → VITE_PROFESSIONAL_DIVERS_APPS_CREATE_LICENSE
VITE_PROFESSIONAL_DIVERS_RENEW_APPLICATION → VITE_PROFESSIONAL_DIVERS_APPS_RENEW_LICENSE
VITE_PROFESSIONAL_DIVER_NEW_MEMBERSHIP → VITE_PROFESSIONAL_DIVERS_MEMBERSHIPS_CREATE
VITE_PROFESSIONAL_DIVER_MEMBERSHIP_CANCEL → VITE_PROFESSIONAL_DIVERS_MEMBERSHIPS_CANCEL
VITE_PROFESSIONAL_DIVER_MEMBERSHIP_RESTORE → VITE_PROFESSIONAL_DIVERS_MEMBERSHIPS_RESTORE
```

## JavaScript Constants Naming

### Pattern: `{MODULE}_{ENTITY}_{ACTION}`

JavaScript constants should follow the same pattern without the `VITE_` prefix:

```javascript
// Authentication
export const AUTH_SIGN_IN = import.meta.env.VITE_AUTH_SIGN_IN;
export const AUTH_SIGN_OUT = import.meta.env.VITE_AUTH_SIGN_OUT;
export const AUTH_VERIFY_TOKEN = import.meta.env.VITE_AUTH_VERIFY_TOKEN;

// Applications
export const APPLICATIONS_GET_BY_ID = import.meta.env.VITE_APPLICATIONS_GET_BY_ID;
export const APPLICATIONS_SUBMIT = import.meta.env.VITE_APPLICATIONS_SUBMIT;
export const APPLICATIONS_RECALL = import.meta.env.VITE_APPLICATIONS_RECALL;
export const APPLICATIONS_DELETE = import.meta.env.VITE_APPLICATIONS_DELETE;

// Application Files
export const APPLICATION_FILES_GET = import.meta.env.VITE_APPLICATION_FILES_GET;
export const APPLICATION_FILES_CREATE = import.meta.env.VITE_APPLICATION_FILES_CREATE;
export const APPLICATION_FILES_DELETE = import.meta.env.VITE_APPLICATION_FILES_DELETE;
```

## Action Verbs

Use consistent action verbs:

| HTTP Method | Action | Description |
|-------------|--------|-------------|
| GET | `GET` | Retrieve a single resource |
| GET | `LIST` | Retrieve multiple resources |
| GET | `SEARCH` | Search resources with filters |
| POST | `CREATE` | Create a new resource |
| PUT/PATCH | `UPDATE` | Update an existing resource |
| DELETE | `DELETE` | Delete a resource |
| POST | `SUBMIT` | Submit an application/form |
| POST | `RECALL` | Recall/withdraw a submission |
| POST | `RENEW` | Renew a membership/license |
| POST | `CANCEL` | Cancel a membership/subscription |
| POST | `RESTORE` | Restore a deleted/canceled item |
| POST | `REACTIVATE` | Reactivate an inactive item |
| POST | `REGISTER` | Register a new item |
| POST | `VERIFY` | Verify a token/email |
| POST | `FORGOT_PASSWORD` | Initiate password reset |
| POST | `RESET_PASSWORD` | Complete password reset |

## Module Categories

### Core Modules
- `AUTH` - Authentication and authorization
- `USERS` - User management
- `APPLICATIONS` - Generic application endpoints
- `APPLICATION_FILES` - File management for applications

### Domain-Specific Modules
- `COMPETITIONS` - Competition management
- `JETSKI_RACES` - Jetski race specific endpoints
- `DIVING_CENTERS` - Diving center management
- `DIVING_CENTERS_APPS` - Diving center applications
- `EVENTS` - Event management
- `ATHLETES` - Athlete management
- `PROFESSIONAL_DIVERS` - Professional diver management
- `PROFESSIONAL_DIVERS_APPS` - Professional diver applications
- `PROFESSIONAL_DIVERS_MEMBERSHIPS` - Professional diver memberships
- `PROFESSIONAL_DIVERS_CONTRACTS` - Professional diver contracts
- `INVOICES` - Invoice management
- `QUOTATIONS` - Quotation management
- `FREEDIVING` - Freediving specific endpoints

## Best Practices

### 1. Use HTTP Method as Action
```bash
# Good
VITE_APPLICATIONS_GET_BY_ID
VITE_APPLICATIONS_CREATE
VITE_APPLICATIONS_UPDATE
VITE_APPLICATIONS_DELETE

# Avoid
VITE_GET_APPLICATION
VITE_CREATE_APPLICATION
VITE_UPDATE_APPLICATION
VITE_DELETE_APPLICATION
```

### 2. Be Consistent with Pluralization
```bash
# Good - Use plural for collections
VITE_APPLICATIONS_GET_BY_ID
VITE_DIVING_CENTERS_LIST
VITE_EVENTS_GET_BY_ID

# Good - Use singular for single actions
VITE_AUTH_SIGN_IN
VITE_USERS_GET_PROFILE
VITE_APPLICATIONS_SUBMIT
```

### 3. Use Clear, Descriptive Names
```bash
# Good
VITE_APPLICATIONS_GET_BY_ID
VITE_APPLICATIONS_SUBMIT
VITE_APPLICATIONS_RECALL

# Avoid - Too verbose
VITE_APPLICATIONS_GET_APPLICATION_BY_ID
VITE_APPLICATIONS_SUBMIT_APPLICATION
VITE_APPLICATIONS_RECALL_APPLICATION

# Avoid - Too vague
VITE_APPLICATIONS_GET
VITE_APPLICATIONS_SUBMIT
VITE_APPLICATIONS_RECALL
```

### 4. Use Snake_Case for All Names
```bash
# Good
VITE_APPLICATIONS_GET_BY_ID
VITE_DIVING_CENTERS_APPS_CREATE_MEMBERSHIP

# Avoid
VITE_APPLICATIONSGetByID
VITE-diving-centers-apps-create-membership
```

### 5. Include Placeholders for Dynamic Values
```bash
# Good - Clear placeholder naming
VITE_APPLICATIONS_GET_BY_ID=applications/by-id/{appId}
VITE_EVENTS_GET_BY_ID=events/by-id/{targetId}
VITE_APPLICATION_FILES_GET_BY_APP_ID=applications-files/by-application-id/{appId}

# Avoid - Unclear placeholder naming
VITE_APPLICATIONS_GET=applications/by-id/{id}
VITE_EVENTS_GET=events/by-id/{id}
```

### 6. Group Related Endpoints
```bash
# Authentication
VITE_AUTH_SIGN_IN=users/login
VITE_AUTH_SIGN_OUT=users/login
VITE_AUTH_VERIFY_TOKEN=users/verify-token
VITE_AUTH_SIGN_UP=users/sign-up
VITE_AUTH_FORGOT_PASSWORD=users/forgot-password
VITE_AUTH_RESET_PASSWORD=users/reset-password

# Applications
VITE_APPLICATIONS_GET_BY_ID=applications/by-id/{appId}
VITE_APPLICATIONS_SUBMIT=applications/execute/submit/{appId}
VITE_APPLICATIONS_RECALL=applications/execute/recall/{appId}
VITE_APPLICATIONS_DELETE=applications/delete/{appId}
VITE_APPLICATIONS_PICK=applications/pick/{appId}
```

### 7. Avoid Redundancy in Names
```bash
# Good
VITE_APPLICATIONS_GET_BY_ID
VITE_APPLICATIONS_SUBMIT
VITE_APPLICATIONS_RECALL

# Avoid - Redundant "APPLICATION" suffix
VITE_APPLICATIONS_GET_APPLICATION_BY_ID
VITE_APPLICATIONS_SUBMIT_APPLICATION
VITE_APPLICATIONS_RECALL_APPLICATION
```

## Migration Strategy

### Phase 1: Create New Constants (Non-Breaking)
1. Create new constants with recommended names alongside old ones
2. Keep both old and new variables in `.env` file
3. Update code to use new constants gradually

### Phase 2: Update Code
1. Update imports to use new constants
2. Test thoroughly after each update
3. Remove old constants from code

### Phase 3: Clean Up
1. Remove old variables from `.env` file
2. Update documentation
3. Commit changes

## Example Migration

### Before
```bash
# .env
VITE_APPLICATION_BY_ID=applications/by-id/{appId}
VITE_APPLICATION_SUBMIT_URL=applications/execute/submit/{appId}
```

```javascript
// apiEndpoints.js
export const APPLICATION_BY_ID = import.meta.env.VITE_APPLICATION_BY_ID;
export const APPLICATION_SUBMIT_URL = import.meta.env.VITE_APPLICATION_SUBMIT_URL;
```

### After
```bash
# .env
VITE_APPLICATIONS_GET_BY_ID=applications/by-id/{appId}
VITE_APPLICATIONS_SUBMIT=applications/execute/submit/{appId}
```

```javascript
// apiEndpoints.js
export const APPLICATIONS_GET_BY_ID = import.meta.env.VITE_APPLICATIONS_GET_BY_ID;
export const APPLICATIONS_SUBMIT = import.meta.env.VITE_APPLICATIONS_SUBMIT;
```

## Summary

### Key Principles
1. **Consistency**: Use the same pattern for all endpoints
2. **Clarity**: Names should clearly indicate what the endpoint does
3. **Simplicity**: Avoid unnecessary verbosity
4. **Predictability**: Follow the pattern so developers can guess names
5. **Maintainability**: Easy to understand and modify

### Recommended Pattern
```
VITE_{MODULE}_{ENTITY}_{ACTION}
```

Where:
- `MODULE` = High-level domain (AUTH, USERS, APPLICATIONS, etc.)
- `ENTITY` = Specific resource (PROFILE, MEMBERSHIP, APPLICATION, etc.)
- `ACTION` = HTTP verb or action (GET, CREATE, UPDATE, DELETE, LIST, etc.)

### Benefits
- ✅ Consistent naming across the project
- ✅ Easy to find and understand endpoints
- ✅ Reduced cognitive load for developers
- ✅ Better autocomplete in IDEs
- ✅ Easier to maintain and refactor
- ✅ Clear separation of concerns
