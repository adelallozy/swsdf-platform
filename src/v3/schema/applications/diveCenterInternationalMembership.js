import { custom, maxLength, minLength, pipe, string } from "valibot";

const DIVING_TYPE_OPTIONS = [
  { label: "Recreational Diving", value: "Recreational Diving" },
  { label: "Freediving", value: "Freediving" },
  { label: "Technical Diving", value: "Technical Diving" },
];

export function makeDiveCenterInternationalMembershipSchema(
  organizations = []
) {
  return {
    organization: {
      type: "select",
      label: "Organization",
      value: "",
      options: organizations,
      validation: pipe(
        string("Organization is required"),
        minLength(1, "Organization is required")
      ),
      attrs: {
        optionLabel: "label",
        optionValue: "value",
        filter: true,
      },
      placeholder: "Select organization",
      required: true,
    },

    number: {
      type: "text",
      label: "Membership Number",
      value: "",
      validation: pipe(
        string("Membership number is required"),
        minLength(1, "Membership number is required"),
        maxLength(80, "Membership number must be under 80 characters")
      ),
      attrs: {
        maxlength: 80,
      },
      placeholder: "Enter membership number",
      required: true,
    },

    diving_type: {
      type: "multiselect",
      label: "Diving Type",
      value: [],
      options: DIVING_TYPE_OPTIONS,
      validation: custom(
        (value) => Array.isArray(value) && value.length > 0,
        "Diving type is required"
      ),
      attrs: {
        optionLabel: "label",
        optionValue: "value",
        display: "chip",
      },
      placeholder: "Select diving types",
      required: true,
    },

    expiry_date: {
      type: "DatePicker",
      label: "Expiry Date",
      value: "",
      validation: pipe(
        string("Expiry date is required"),
        minLength(1, "Expiry date is required"),
        maxLength(10, "Expiry date must be a valid date")
      ),
      attrs: {
        placeholder: "YYYY-MM-DD",
      },
      placeholder: "YYYY-MM-DD",
      required: true,
    },
  };
}
