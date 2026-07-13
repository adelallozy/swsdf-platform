import {
  custom,
  maxLength,
  minLength,
  pipe,
  regex,
  string,
} from "valibot";

const ADMINISTRATOR_ROLE_OPTIONS = [
  { label: "Owner", value: "Owner" },
  { label: "Manager", value: "Manager" },
];

function normalizeStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => String(item || "").trim())
    .filter(Boolean);
}

function buildFileValidator(message, isRequired) {
  return custom((value) => {
    if (!isRequired()) {
      return true;
    }

    if (value instanceof File) {
      return true;
    }

    return typeof value === "string" && value.trim().length > 0;
  }, message);
}

export function makeDiveCenterAdministratorSchema({
  isManagerSelected = () => false,
} = {}) {
  return {
    roles: {
      type: "radioTiles",
      label: "Administrator Role",
      value: [],
      options: ADMINISTRATOR_ROLE_OPTIONS,
      validation: custom(
        (value) =>
          Array.isArray(value) &&
          value.length > 0 &&
          value.every((role) =>
            ADMINISTRATOR_ROLE_OPTIONS.some((option) => option.value === role)
          ),
        "Administrator role is required"
      ),
      attrs: {
        multiple: true,
        class: "administrator-role-tiles",
      },
      required: true,
    },

    name_ar: {
      type: "text",
      label: "Name (Arabic)",
      value: "",
      validation: pipe(
        string("Arabic name is required"),
        minLength(1, "Arabic name is required"),
        maxLength(240, "Arabic name must be under 240 characters")
      ),
      attrs: {
        maxlength: 240,
        dir: "rtl",
      },
      placeholder: "Enter administrator name in Arabic",
      required: true,
    },

    name_en: {
      type: "text",
      label: "Name (English)",
      value: "",
      validation: pipe(
        string("English name is required"),
        minLength(1, "English name is required"),
        maxLength(240, "English name must be under 240 characters")
      ),
      attrs: {
        maxlength: 240,
      },
      placeholder: "Enter administrator name in English",
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
        regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address")
      ),
      attrs: {
        maxlength: 240,
        inputmode: "email",
      },
      placeholder: "Enter administrator email",
      required: true,
    },

    identity_number: {
      type: "text",
      label: "Identity Number",
      value: "",
      validation: pipe(
        string("Identity number is required"),
        regex(/^[127]\d{9}$/, "Please enter a valid identity number")
      ),
      attrs: {
        maxlength: 10,
        inputmode: "numeric",
      },
      placeholder: "Enter identity number",
      required: true,
    },

    mobile: {
      type: "text",
      label: "Phone",
      value: "",
      validation: pipe(
        string("Phone is required"),
        regex(/^0*[15]\d{8}$/, "Please enter a valid phone number")
      ),
      attrs: {
        maxlength: 10,
        inputmode: "tel",
      },
      placeholder: "Enter phone number",
      required: true,
    },

    languages: {
      type: "TagsInput",
      label: "Languages",
      value: [],
      validation: custom((value) => {
        if (!isManagerSelected()) {
          return true;
        }

        return normalizeStringArray(value).length > 0;
      }, "At least one language is required for managers"),
      attrs: {
        addOnBlur: true,
        separator: ",",
        allowDuplicate: false,
      },
      placeholder: "Enter a language",
      required: false,
    },

    identity_file: {
      type: "file",
      label: "Identity Copy",
      value: null,
      validation: buildFileValidator(
        "Identity copy is required",
        () => true
      ),
      attrs: {
        accept: "image/png,image/webp,image/jpeg,image/jpg,application/pdf",
        maxSize: 2 * 1024 * 1024,
      },
      placeholder: "Choose identity copy",
      required: true,
    },

    cv_file: {
      type: "file",
      label: "CV",
      value: null,
      validation: buildFileValidator(
        "CV is required for managers",
        () => isManagerSelected()
      ),
      attrs: {
        accept: "image/png,image/webp,image/jpeg,image/jpg,application/pdf",
        maxSize: 2 * 1024 * 1024,
      },
      placeholder: "Choose CV",
      required: false,
    },
  };
}

export function normalizeDiveCenterAdministratorInitialValues(
  administrator = {},
  webUrl = ""
) {
  const identityLink = String(administrator?.identity_link || "").trim();
  const cvLink = String(administrator?.cv_link || "").trim();

  return {
    roles: normalizeStringArray(administrator?.roles),
    name_ar: String(administrator?.name_ar || ""),
    name_en: String(administrator?.name_en || ""),
    email: String(administrator?.email || ""),
    identity_number: String(administrator?.identity_number || ""),
    mobile: String(administrator?.mobile || ""),
    languages: normalizeStringArray(administrator?.languages),
    identity_file: identityLink ? `${webUrl}${identityLink}` : null,
    cv_file: cvLink ? `${webUrl}${cvLink}` : null,
  };
}

export function serializeDiveCenterAdministratorFormData(formData = {}) {
  const payload = new FormData();
  const roles = normalizeStringArray(formData.roles);

  roles.forEach((role) => {
    payload.append("roles[]", role);
  });

  [
    "name_ar",
    "name_en",
    "email",
    "identity_number",
    "mobile",
  ].forEach((field) => {
    payload.append(field, String(formData?.[field] || "").trim());
  });

  normalizeStringArray(formData?.languages).forEach((language) => {
    payload.append("languages[]", language);
  });

  if (formData?.identity_file instanceof File) {
    payload.append("identity_file", formData.identity_file);
  }

  if (formData?.cv_file instanceof File) {
    payload.append("cv_file", formData.cv_file);
  }

  return payload;
}
