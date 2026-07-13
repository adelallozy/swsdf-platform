// FILE: src/v3/schema/applications/userProfile.js
// TOKEN: USER-PROFILE-SCHEMA-v3-2025-10-27
import {
  pipe,
  string,
  maxLength,
  minLength,
  picklist,
  custom,
  union,
  number,
  regex,
} from "valibot";

// Helpers
const requiredStr = (s) => s;
const isSelected = (message) =>
  custom(
    (value) => value !== null && value !== undefined && value !== "",
    message
  );
const BLOOD_TYPE_VALUES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const BLOOD_TYPE_OPTIONS = BLOOD_TYPE_VALUES.map((value) => ({
  label: value,
  value,
}));

const SUMMARY_REQUIRED_PROFILE_FIELDS = [
  ["name_ar", "Arabic name is required"],
  ["name_en", "English name is required"],
  ["identity_number", "National ID number is required"],
  ["birthdate", "Birthdate is required"],
  ["gender", "Gender is required"],
  ["blood_type", "Blood type is required"],
  ["nationality", "Nationality is required"],
  ["mobile", "Mobile number is required"],
  ["email", "Email is required"],
  ["region_id", "Region is required"],
  ["city_id", "City is required"],
];

function hasProfileFieldValue(value) {
  return value !== null && value !== undefined && value !== "";
}

export function makeUserProfileSchema() {
  return {
    // --- Names ---
    name_ar: {
      type: "text",
      label: "Full Name (Arabic)",
      value: "",
      validation: pipe(
        string("Arabic name is required"),
        minLength(1, "Arabic name is required"),
        maxLength(100, "Arabic name must be under 100 characters"),
        regex(
          /^([\u0600-\u065F\u066A-\u06EF\u06FA-\u06FF]{2,}\s+){2,}([\u0600-\u065F\u066A-\u06EF\u06FA-\u06FF]{2,}\s*)$/,
          "Arabic name must contain only Arabic characters and at least 3 words"
        )
      ),
      attrs: { maxlength: 100, dir: "rtl", inputmode: "text" },
      placeholder: "Enter full name in Arabic",
      required: true,
    },

    name_en: {
      type: "text",
      label: "Full Name (English)",
      value: "",
      validation: pipe(
        string("English name is required"),
        minLength(1, "English name is required"),
        maxLength(100, "English name must be under 100 characters"),
        regex(
          /^([a-zA-Z]{2,}\s+){2,}([a-zA-Z]{2,}\s*)$/,
          "English name must contain only Latin characters and at least 3 words"
        )
      ),
      attrs: { maxlength: 100, inputmode: "text" },
      placeholder: "Enter full name in English",
      required: true,
    },

    identity_number: {
      type: "text",
      label: "Identity Number",
      value: "",
      validation: pipe(
        string("National ID number is required"),
        minLength(10, "Please enter a correct National ID number"),
        maxLength(10, "Please enter a correct National ID number"),
        regex(/^[12]\d{9}$/, "Please enter a correct National ID number")
      ),
      attrs: { maxlength: 10, placeholder: "Enter 10-digit identity number" },
      placeholder: "Enter 10-digit identity number",
      required: true,
    },

    // --- Identity ---
    // identity_type: { not required at this stage ...
    //     type: 'select',
    //     label: 'Identity Type',
    //     value: '',
    //     options: [
    //         { label: 'National ID', value: 'NationalID' },
    //         { label: 'Iqama (Resident ID)', value: 'Iqama' }
    //     ],
    //     validation: requiredStr(pipe(string(), picklist(['NationalID', 'Iqama'], 'errors.invalidOption'))),
    //     attrs: { optionLabel: 'label', optionValue: 'value', filter: true },
    //     placeholder: 'Select identity type',
    //     required: true
    // },

    // identity_type: { not required at this stage ...
    // identity_expiry: {
    //     type: 'DatePicker',
    //     label: 'Identity Expiry',
    //     value: '',
    //     validation: pipe(string()),
    //     attrs: { placeholder: 'Enter date (DD-MM-YYYY)' },
    //     placeholder: 'Enter date (DD-MM-YYYY)'
    // },

    // --- Personal ---
    birthdate: {
      type: "DatePicker",
      label: "Birthdate",
      value: "",
      validation: pipe(
        string("Birthdate is required"),
        minLength(1, "Birthdate is required"),
        maxLength(10, "Birthdate must be valid date")
      ),
      attrs: { placeholder: "Enter date (DD-MM-YYYY)" },
      placeholder: "Enter date (DD-MM-YYYY)",
      required: true,
    },

    gender: {
      type: "select",
      label: "Gender",
      value: "",
      options: [
        { label: "Male", value: "Male" },
        { label: "Female", value: "Female" },
      ],
      validation: pipe(
        string("Gender is required"),
        picklist(["Male", "Female"], "Select a valid gender")
      ),
      attrs: { optionLabel: "label", optionValue: "value" },
      placeholder: "Select a gender",
      required: true,
    },

    blood_type: {
      type: "select",
      label: "Blood Type",
      value: "",
      options: BLOOD_TYPE_OPTIONS,
      validation: pipe(
        string("Blood type is required"),
        picklist(BLOOD_TYPE_VALUES, "Select a valid blood type")
      ),
      attrs: { optionLabel: "label", optionValue: "value" },
      placeholder: "Select a blood type",
      required: true,
    },

    nationality: {
      type: "autocomplete",
      label: "Nationality",
      value: "",
      options: [],
      validation: pipe(
        string("Nationality is required"),
        minLength(1, "Nationality is required"),
        maxLength(100, "Nationality must be under 100 characters")
      ),
      attrs: {
        dropdown: true,
        maxlength: 100,
        completeOnFocus: true,
        forceSelection: false,
      },
      placeholder: "Enter or select nationality",
      required: true,
    },

    // --- Contacts ---
    mobile: {
      type: "text",
      label: "Mobile Number",
      value: "",
      validation: pipe(
        string("Mobile number is required"),
        minLength(1, "Mobile number is required"),
        maxLength(12, "Mobile number must be under 12 characters"),
        regex(
          /^(?:9665\d{8}|05\d{8})$/,
          "Mobile number must be in KSA format (9665XXXXXXXX or 05XXXXXXXX)"
        )
      ),
      attrs: {
        inputmode: "tel",
        placeholder: "Enter mobile number (9665XXXXXXXX or 05XXXXXXXX)",
      },
      placeholder: "Enter mobile number (9665XXXXXXXX or 05XXXXXXXX)",
      required: true,
    },

    email: {
      type: "email",
      label: "Email",
      value: "",
      validation: pipe(
        string("Email is required"),
        minLength(1, "Email is required"),
        maxLength(255, "Email must be under 255 characters"),
        regex(
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          "Please enter a valid email address"
        )
      ),
      attrs: { inputmode: "email", placeholder: "Enter email address" },
      placeholder: "Enter email address",
      required: true,
    },

    // --- Location ---
    region_id: {
      type: "select",
      label: "Region",
      value: null,
      options: [],
      validation: pipe(
        union([string(), number()], "Region is required"),
        isSelected("Region is required")
      ),
      attrs: { optionLabel: "label", optionValue: "value", filter: true },
      placeholder: "Select a region",
      required: true,
    },

    city_id: {
      type: "select",
      label: "City",
      value: null,
      options: [],
      validation: pipe(
        union([string(), number()], "City is required"),
        isSelected("City is required")
      ),
      attrs: { optionLabel: "label", optionValue: "value", filter: true },
      placeholder: "Select a city",
      required: true,
    },

    address: {
      type: "text",
      label: "Address",
      value: "",
      validation: pipe(
        string(),
        maxLength(255, "Address must be under 255 characters")
      ),
      attrs: { maxlength: 250 },
      placeholder: "Street, district, or neighborhood",
    },
  };
}

export function normalizeProfileInitialValues(profile = {}) {
  return {
    ...profile,
    name_ar: String(profile?.name_ar || ""),
    name_en: String(profile?.name_en || ""),
    identity_number: String(profile?.identity_number || ""),
    birthdate: String(profile?.birthdate || ""),
    gender: String(profile?.gender || ""),
    blood_type: String(profile?.blood_type || ""),
    nationality: String(profile?.nationality || ""),
    mobile: String(profile?.mobile || ""),
    email: String(profile?.email || ""),
    address: String(profile?.address || ""),
    region_id: profile?.region_id ?? null,
    city_id: profile?.city_id ?? null,
  };
}

export function getUserProfileSummaryErrors(
  profile,
  translate = (value) => value
) {
  if (!profile) {
    return [translate("User profile is required")];
  }

  return SUMMARY_REQUIRED_PROFILE_FIELDS.filter(
    ([field]) => !hasProfileFieldValue(profile?.[field])
  ).map(([, message]) => translate(message));
}

// Simplified serialization
export function serializeProfile(data) {
  return {
    name_ar: data.name_ar.trim(),
    name_en: data.name_en.trim(),
    identity_type: data.identity_type,
    identity_number: String(data.identity_number || "").trim(),
    identity_expiry: data.identity_expiry,
    birthdate: data.birthdate,
    gender: data.gender,
    blood_type: data.blood_type,
    nationality: String(data.nationality || "").trim(),
    mobile: data.mobile.trim(),
    email: data.email.trim(),
    region_id: data.region_id,
    city_id: data.city_id,
  };
}
