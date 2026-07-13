import {
  pipe,
  string,
  minLength,
  maxLength,
  regex,
  union,
  literal,
  picklist,
} from "valibot";

const optionalStr = (s) => union([literal(""), s]);

// Saudi national ID or iqama: 10 digits starting with 1 or 2
const saudiId = regex(/^[12]\d{9}$/, "Invalid Saudi national ID format");

export const makeFishingParticipantSchema = () => ({
  athlete_id: {
    type: "text",
    label: "Athlete ID",
    value: "",
    validation: pipe(
      string("This field is required"),
      minLength(10, "Must be at least 10 characters"),
      maxLength(10, "Must not exceed 10 characters"),
      saudiId
    ),
    attrs: {
      inputmode: "numeric",
      maxlength: 10,
      placeholder: "1XXXXXXXXX",
    },
    required: true,
  },

  role: {
    type: "select",
    label: "Role",
    value: "member",
    options: [
      { label: "Member", value: "member" },
      { label: "Team Leader", value: "team-leader" },
    ],
    validation: pipe(
      string("This field is required"),
      picklist(["member", "team-leader"], "Invalid option selected")
    ),
    attrs: {
      optionLabel: "label",
      optionValue: "value",
    },
    placeholder: "Select",
    required: true,
  },

  // Employee Number - OPTIONAL
  employee_number: {
    type: "text",
    label: "Employee Number",
    value: "",
    validation: optionalStr(
      pipe(string(), maxLength(240, "Maximum 240 characters"))
    ),
    attrs: {
      maxlength: 240,
    },
    placeholder: "Enter employee number (optional)",
  },

  // Leave Letter Addressee - OPTIONAL
  leave_responsible: {
    type: "text",
    label: "Leave letter addressee",
    value: "",
    validation: optionalStr(
      pipe(string(), maxLength(240, "Maximum 240 characters"))
    ),
    attrs: {
      maxlength: 240,
    },
    placeholder: "HR Director at Almarai",
  },
});
