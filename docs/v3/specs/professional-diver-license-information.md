# Professional Diver License Information - Form & Card Specifications

**Components:**
- `UpdateLicenseInformations.vue` (`src/v3/pages/applications/professional-divers/UpdateLicenseInformations.vue`)
- `PDLicenseInformationCard.vue` (`src/v3/components/applications/cards/PDLicenseInformationCard.vue`)

**Version:** 1.0  
**Last Updated:** 2026-01-26  

---

## Overview

The Professional Diver **License Informations** step is part of the Professional Diver application process (New License / Renewal / Information Update).

It covers:
- **Rank** selection (`rank`)
- **Card Design** selection (`card_design_id`) to decide whether printing service is required

The data is:
- **edited** via `UpdateLicenseInformations.vue`
- **reviewed** on the application summary via `PDLicenseInformationCard.vue`

---

## Data Contract

### Fields

| Field | Type | Required | Notes |
|------|------|----------|------|
| `rank` | string | Yes | One of: `Divemaster`, `Snorkel Guide`, `Assistant Instructor`, `EFR Instructor`, `Instructor`, `Instructor Trainer` |
| `card_design_id` | number\|string | Yes | `0` = Only Digital, `1` = Hard Copy |

### Backend Storage (Reference)
- Rank is stored in `applications_professional_divers.rank`.
- Card design selection is stored as `card_design_id` (combined into `pd_license` payload).

---

## APIs

### 1) Load Application + License Payload

Used by `UpdateLicenseInformations.vue` to prefill the form:

```
GET /applications/byId/{appId}?with-payload=true&payload[]=pd_license
```

**Frontend payload key:** `pd_license`  
**Frontend store ref:** `store.payload.pd_license`

> This replaces the legacy `professional-divers-applications/pick-relatives` response field `professionalDiverRank`.

### 2) Save License Information (Rank + Card Design)

Used by `UpdateLicenseInformations.vue` on submit:

```
POST /professional-divers-applications/set-services/{appId}
```

**Request body example:**
```json
{
  "rank": "Divemaster",
  "card_design_id": 0
}
```

**Behavior:**
- If `card_design_id > 0`, backend adds service `License Card Printing`.
- If `card_design_id == 0`, backend removes that service.
- Backend updates application progress for `Professional Diver Rank`.

---

## UI/UX Rules

### Card Layout (v3)
- **Do not** use `base-card` in v3.
- Section heading is **outside** the white card (see global card pattern).
- The summary card shows:
  - Rank
  - Card design label (Only Digital / Hard Copy)
  - Status pill based on `application.progress['Professional Diver Rank']`
    - The UI displays a **neutral** label for `Submitted` (e.g., "In progress") to avoid confusion with application submission.

### Navigation
- Summary card edit link routes to `pd-license-info-update`.
- After successful save, user returns to `app-summary`.

---

## Validation

### Client Validation (MasterForm / Valibot)
The form enforces:
- Rank is required and must be one of the allowed values.
- Card design is required and must be `0` or `1` (string or number).

### Server Validation (422)
If server returns validation errors, the form must call:
- `mfRef.value.applyServerErrors(errors)`

---

## Translation Requirements (Arabic only)

Per v3 translation rules:
- English strings stay in code.
- Add Arabic translations in `src/locales/ar.json` only.

Minimum keys for this step:
```json
{
  "License Informations": "معلومات الترخيص",
  "Professional Diver Rank": "مستوى الغواص المحترف",
  "Card Design": "تصميم البطاقة",
  "Only Digital": "نسخة رقمية فقط",
  "Hard Copy": "بطاقة مطبوعة",

  "Professional Diver Rank is required": "مستوى الغواص المحترف مطلوب",
  "Select a valid rank": "اختر مستوى صحيح",
  "Card Design is required": "تصميم البطاقة مطلوب",
  "Select a valid card design": "اختر تصميم البطاقة الصحيح",

  "License information updated successfully": "تم تحديث معلومات الترخيص بنجاح"
}
```

