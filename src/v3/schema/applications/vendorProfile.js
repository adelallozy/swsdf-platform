import {
  custom,
  maxLength,
  minLength,
  number,
  pipe,
  regex,
  string,
  union,
} from "valibot";

const isSelected = (message) =>
  custom(
    (value) => value !== null && value !== undefined && value !== "",
    message
  );

export function makeVendorProfileSchema() {
  return {
    name_ar: {
      type: "text",
      label: "Company Name (Arabic)",
      value: "",
      validation: pipe(
        string("Arabic company name is required"),
        minLength(3, "Arabic company name must be at least 3 characters"),
        maxLength(200, "Arabic company name must be under 200 characters")
      ),
      attrs: { maxlength: 200, dir: "rtl", inputmode: "text" },
      placeholder: "Enter company name in Arabic",
      required: true,
    },

    name_en: {
      type: "text",
      label: "Company Name (English)",
      value: "",
      validation: pipe(
        string("English company name is required"),
        minLength(3, "English company name must be at least 3 characters"),
        maxLength(200, "English company name must be under 200 characters")
      ),
      attrs: { maxlength: 200, inputmode: "text" },
      placeholder: "Enter company name in English",
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
        const vatTin = String(value || "").trim();
        return !vatTin || /^\d{15}$/.test(vatTin);
      }, "VAT registration number must be exactly 15 digits"),
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

    postal_code: {
      type: "text",
      label: "Postal Code",
      value: "",
      validation: pipe(
        string("Postal code is required"),
        minLength(1, "Postal code is required"),
        maxLength(12, "Postal code must be under 12 characters")
      ),
      attrs: { maxlength: 12, inputmode: "text" },
      placeholder: "Enter postal code",
      required: true,
    },

    address: {
      type: "textarea",
      label: "Address",
      value: "",
      validation: pipe(
        string("Address is required"),
        minLength(1, "Address is required"),
        maxLength(255, "Address must be under 255 characters")
      ),
      attrs: { maxlength: 255, rows: 4 },
      placeholder: "Enter company address",
      required: true,
    },

    telephone: {
      type: "text",
      label: "Phone",
      value: "",
      validation: pipe(
        string("Phone is required"),
        minLength(7, "Phone must be at least 7 characters"),
        maxLength(20, "Phone must be under 20 characters"),
        regex(/^[0-9+()\-\s]{7,20}$/, "Please enter a valid phone number")
      ),
      attrs: { maxlength: 20, inputmode: "tel" },
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
        maxLength(254, "Email must be under 254 characters"),
        regex(
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          "Please enter a valid email address"
        )
      ),
      attrs: { inputmode: "email", maxlength: 254 },
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
          return (
            parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:"
          );
        } catch {
          return false;
        }
      }, "Please enter a valid website URL"),
      attrs: { maxlength: 255, inputmode: "url" },
      placeholder: "Enter website URL",
      required: false,
    },

    services: {
      type: "multiselect",
      label: "Services",
      value: [],
      options: [],
      validation: custom(
        (value) => Array.isArray(value) && value.length > 0,
        "Select at least one service"
      ),
      attrs: { display: "chip", filter: true },
      placeholder: "Select services",
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

export function serializeVendorProfile(data = {}) {
  return {
    name_ar: String(data.name_ar || "").trim(),
    name_en: String(data.name_en || "").trim(),
    unified_number: String(data.unified_number || "").trim(),
    cr_number: String(data.cr_number || "").trim(),
    cr_expiry_date: String(data.cr_expiry_date || "").trim(),
    vat_tin: String(data.vat_tin || "").trim(),
    city_id: castNullableNumber(data.city_id),
    postal_code: String(data.postal_code || "").trim(),
    address: String(data.address || "").trim(),
    telephone: String(data.telephone || "").trim(),
    email: String(data.email || "").trim(),
    website: String(data.website || "").trim(),
    services: Array.isArray(data.services) ? data.services : [],
  };
}
