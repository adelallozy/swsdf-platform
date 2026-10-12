// src/v3/schema/applications/jetskiParticipation.js
// Field contract mirrors EventsAppsJetskiParticipationsTable validation:
// - racer_number: required string, max 240
// - races: non-empty array of racing category names
// - work_leave: optional string, max 240
import {
  pipe,
  string,
  minLength,
  maxLength,
  array,
  union,
  literal,
} from "valibot";

// allow empty string for optional text fields
const optionalStr = (s) => union([literal(""), s]);

export const makeJetskiParticipationSchema = () => ({
  races: {
    type: "multiselect",
    label: "Racing categories",
    value: [],
    options: [],
    required: true,
    validation: pipe(
      array(string()),
      minLength(1, "Select at least one racing category")
    ),
    attrs: {
      optionLabel: "label",
      optionValue: "value",
    },
    placeholder: "Racing categories",
  },
  racer_number: {
    type: "text",
    label: "Racer Number",
    value: "",
    required: true,
    placeholder: "Racer Number",
    validation: pipe(
      string("Racer Number is required"),
      minLength(1, "Racer Number is required"),
      maxLength(240, "Racer Number must be 240 characters or fewer")
    ),
    attrs: { maxlength: 240 },
  },
  work_leave: {
    type: "text",
    label: "Work leave",
    value: "",
    placeholder: "Work leave",
    validation: optionalStr(
      pipe(string(), maxLength(240, "Work leave must be 240 characters or fewer"))
    ),
    attrs: { maxlength: 240 },
  },
});
