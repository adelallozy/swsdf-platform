// src/v3/schema/applications/sportFishingTeam.js
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

// allow empty string for optional text fields
const optionalStr = (s) => union([literal(""), s]);

// light/fast patterns
const tenDigits = regex(/^\d{10}$/, "errors.tenDigits"); // identity
const nineDigits = regex(/^\d{9}$/, "errors.nineDigits"); // MMSI
const meters2dp = regex(/^\d{1,3}(\.\d{1,2})?$/, "errors.metersFormat");

export const makeSportFishingTeamSchema = () => ({
  // --- Team ---
  team_name_ar: {
    type: "text",
    label: "SportFishingTeam.TeamNameAr",
    value: "",
    validation: optionalStr(pipe(string(), maxLength(250, "errors.max250"))),
    attrs: { maxlength: 250 },
    placeholder: "SportFishingTeam.TeamNameArPh",
    required: true,
  },
  team_name_en: {
    type: "text",
    label: "SportFishingTeam.TeamNameEn",
    value: "",
    validation: optionalStr(pipe(string(), maxLength(250, "errors.max250"))),
    attrs: { maxlength: 250 },
    placeholder: "SportFishingTeam.TeamNameEnPh",
  },

  // --- Category (SINGLE select) ---
  // fishing_category: {
  //     type: 'select',
  //     label: 'SportFishingTeam.FishingCategory',
  //     value: '', // IMPORTANT: single string, not array
  //     options: [
  //         { label: 'Popping', value: 'popping' },
  //         { label: 'Jigging', value: 'jigging' }
  //     ],
  //     validation: pipe(
  //         string('errors.required'),                                  // must be string
  //         picklist(['popping', 'jigging'], 'errors.invalidOption')    // and one of…
  //     ),
  //     attrs: {
  //         // NO 'multiple' here. Keep it single-select.
  //         optionLabel: 'label',
  //         optionValue: 'value',
  //         filter: true
  //     },
  //     placeholder: 'Select',
  //     required: true
  // },

  // --- Boat (UI in meters; convert to *_cm int before submit) ---
  boat_name: {
    type: "text",
    label: "SportFishingTeam.BoatName",
    value: "",
    validation: optionalStr(pipe(string(), maxLength(250, "errors.max250"))),
    attrs: { maxlength: 250 },
    placeholder: "SportFishingTeam.BoatNamePH",
  },
  boat_owner_name: {
    type: "text",
    label: "SportFishingTeam.BoatOwnerName",
    value: "",
    validation: optionalStr(pipe(string(), maxLength(250, "errors.max250"))),
    attrs: { maxlength: 250 },
    placeholder: "SportFishingTeam.BoatOwnerNamePH",
    required: true,
  },
  boat_owner_identity_number: {
    type: "text",
    label: "SportFishingTeam.BoatOwnerIdentity",
    value: "",
    validation: optionalStr(pipe(string(), tenDigits)),
    attrs: { inputmode: "numeric", maxlength: 10 },
    placeholder: "0000000000",
    required: true,
  },
  boat_captain_name: {
    type: "text",
    label: "SportFishingTeam.BoatCaptainName",
    value: "",
    validation: optionalStr(pipe(string(), maxLength(250, "errors.max250"))),
    attrs: { maxlength: 250 },
    placeholder: "SportFishingTeam.BoatCaptainNamePH",
  },
  boat_registration_number: {
    type: "text",
    label: "SportFishingTeam.BoatRegistrationNumber",
    value: "",
    validation: optionalStr(pipe(string(), maxLength(250, "errors.max250"))),
    attrs: { maxlength: 250 },
    placeholder: "SportFishingTeam.BoatRegistrationNumberPH",
  },
  boat_hull_number: {
    type: "text",
    label: "SportFishingTeam.BoatHullNumber",
    value: "",
    validation: optionalStr(pipe(string(), maxLength(250, "errors.max250"))),
    attrs: { maxlength: 250 },
    placeholder: "SportFishingTeam.BoatHullNumberPH",
  },
  boat_operating_port: {
    type: "text",
    label: "SportFishingTeam.BoatOperatingPort",
    value: "",
    validation: optionalStr(pipe(string(), maxLength(160, "errors.max160"))),
    attrs: { maxlength: 160 },
    placeholder: "SportFishingTeam.BoatOperatingPortPH",
  },

  // displayed in meters in UI
  boat_length_cm: {
    type: "text",
    label: "SportFishingTeam.LengthM",
    value: "",
    validation: optionalStr(pipe(string(), meters2dp)),
    attrs: { inputmode: "decimal" },
    placeholder: "0.00",
  },
  boat_width_cm: {
    type: "text",
    label: "SportFishingTeam.WidthM",
    value: "",
    validation: optionalStr(pipe(string(), meters2dp)),
    attrs: { inputmode: "decimal" },
    placeholder: "0.00",
  },

  boat_mmsi: {
    type: "text",
    label: "SportFishingTeam.BoatMMSI",
    value: "",
    validation: optionalStr(pipe(string(), nineDigits)),
    attrs: { inputmode: "numeric", maxlength: 9 },
    placeholder: "XXXXXXXXX",
  },
});
