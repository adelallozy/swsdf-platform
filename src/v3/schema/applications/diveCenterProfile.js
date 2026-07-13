import {
  custom,
  maxLength,
  minLength,
  number,
  picklist,
  pipe,
  regex,
  string,
  union,
} from "valibot";

const LOCATION_TYPE_VALUES = [
  "commercial_shop",
  "private_beach",
  "on_marina",
];

const LOCATION_TYPE_OPTIONS = [
  { label: "Commercial shop", value: "commercial_shop" },
  { label: "Private beach", value: "private_beach" },
  { label: "On marina", value: "on_marina" },
];

const LOCATION_COORDINATES_PATTERN =
  /^-?\d{1,3}\.\d{1,},-?\d{1,3}\.\d{1,}$/;

const isSelected = (message) =>
  custom(
    (value) => value !== null && value !== undefined && value !== "",
    message
  );

export function makeDiveCenterProfileSchema() {
  return {
    name_ar: {
      type: "text",
      label: "Center Name (Arabic)",
      value: "",
      validation: pipe(
        string("Arabic center name is required"),
        minLength(3, "Arabic center name must be at least 3 characters"),
        maxLength(200, "Arabic center name must be under 200 characters")
      ),
      attrs: { maxlength: 200, dir: "rtl", inputmode: "text" },
      placeholder: "Enter center name in Arabic",
      required: true,
    },

    name_en: {
      type: "text",
      label: "Center Name (English)",
      value: "",
      validation: pipe(
        string("English center name is required"),
        minLength(3, "English center name must be at least 3 characters"),
        maxLength(200, "English center name must be under 200 characters")
      ),
      attrs: { maxlength: 200, inputmode: "text" },
      placeholder: "Enter center name in English",
      required: true,
    },

    unified_number: {
      type: "text",
      label: "Unified Number",
      value: "",
      validation: pipe(
        string("Unified number is required"),
        regex(/^\d{10}$/, "Unified number must be exactly 10 digits")
      ),
      attrs: { maxlength: 10, inputmode: "numeric" },
      placeholder: "Enter unified number",
      required: true,
    },

    cr_number: {
      type: "text",
      label: "Commercial Registration Number",
      value: "",
      validation: pipe(
        string("Commercial registration number is required"),
        regex(
          /^\d{10}$/,
          "Commercial registration number must be exactly 10 digits"
        )
      ),
      attrs: { maxlength: 10, inputmode: "numeric" },
      placeholder: "Enter commercial registration number",
      required: true,
    },

    cr_expiry_date: {
      type: "DatePicker",
      label: "Commercial Registration Expiry Date",
      value: "",
      validation: pipe(
        string("Commercial registration expiry date is required"),
        minLength(1, "Commercial registration expiry date is required"),
        maxLength(10, "Commercial registration expiry date must be valid")
      ),
      attrs: {
        placeholder: "YYYY-MM-DD",
      },
      placeholder: "YYYY-MM-DD",
      required: true,
    },

    vat_tin: {
      type: "text",
      label: "VAT Registration Number",
      value: "",
      validation: custom((value) => {
        const normalizedValue = String(value || "").trim();
        if (!normalizedValue) {
          return true;
        }

        return /^\d{15}$/.test(normalizedValue);
      }, "Please enter a valid VAT registration number"),
      attrs: { maxlength: 15, inputmode: "numeric" },
      placeholder: "Enter 15-digit VAT registration number",
      required: false,
    },

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

    location_type: {
      type: "select",
      label: "Location Type",
      value: "commercial_shop",
      options: LOCATION_TYPE_OPTIONS,
      validation: pipe(
        string("Location type is required"),
        picklist(LOCATION_TYPE_VALUES, "Select a valid location type")
      ),
      attrs: { optionLabel: "label", optionValue: "value" },
      placeholder: "Select location type",
      required: true,
    },

    telephone: {
      type: "text",
      label: "Phone",
      value: "",
      validation: pipe(
        string("Phone is required"),
        minLength(1, "Phone is required"),
        maxLength(10, "Phone number must be under 10 characters"),
        regex(/^0*[15]\d{8}$/, "Please enter a valid phone number")
      ),
      attrs: { maxlength: 10, inputmode: "tel" },
      placeholder: "Enter phone number",
      required: true,
    },

    email: {
      type: "email",
      label: "Email",
      value: "",
      validation: pipe(
        string("Email is required"),
        minLength(1, "Email is required"),
        maxLength(240, "Email must be under 240 characters"),
        regex(
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          "Please enter a valid email address"
        )
      ),
      attrs: { inputmode: "email", maxlength: 240 },
      placeholder: "Enter email address",
      required: true,
    },

    website: {
      type: "text",
      label: "Website",
      value: "",
      validation: custom((value) => {
        const normalizedValue = String(value || "").trim();
        if (!normalizedValue) {
          return true;
        }

        const urlValue = normalizedValue.includes("://")
          ? normalizedValue
          : `https://${normalizedValue}`;

        try {
          const parsedUrl = new URL(urlValue);
          return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
        } catch (error) {
          return false;
        }
      }, "Please enter a valid website URL"),
      attrs: { maxlength: 120, inputmode: "url" },
      placeholder: "Enter website URL",
      required: false,
    },

    address: {
      type: "textarea",
      label: "Center Address",
      value: "",
      validation: pipe(
        string("Address is required"),
        minLength(1, "Address is required"),
        maxLength(100, "Address must be under 100 characters")
      ),
      attrs: { maxlength: 100, rows: 4 },
      placeholder: "Enter center address",
      required: true,
    },

    location_coordinates: {
      type: "LocationPicker",
      label: "Center Location on Map",
      value: "",
      validation: pipe(
        string("Center location is required"),
        minLength(1, "Center location is required"),
        regex(
          LOCATION_COORDINATES_PATTERN,
          "Center location must be selected from the map"
        )
      ),
      attrs: {
        height: "360px",
        zoom: 10,
        country: "sa",
      },
      placeholder: "Search for a place",
      required: true,
    },
  };
}

function castNullableNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsedValue = Number(value);
  return Number.isNaN(parsedValue) ? value : parsedValue;
}

export function serializeDiveCenterProfile(data = {}) {
  return {
    name_ar: String(data.name_ar || "").trim(),
    name_en: String(data.name_en || "").trim(),
    unified_number: String(data.unified_number || "").trim(),
    cr_number: String(data.cr_number || "").trim(),
    cr_expiry_date: String(data.cr_expiry_date || "").trim(),
    vat_tin: String(data.vat_tin || "").trim(),
    region_id: castNullableNumber(data.region_id),
    city_id: castNullableNumber(data.city_id),
    location_type: String(data.location_type || "commercial_shop"),
    telephone: String(data.telephone || "").trim(),
    email: String(data.email || "").trim(),
    website: String(data.website || "").trim(),
    address: String(data.address || "").trim(),
    location_coordinates: String(data.location_coordinates || "")
      .trim()
      .replace(/\s+/g, ""),
  };
}
