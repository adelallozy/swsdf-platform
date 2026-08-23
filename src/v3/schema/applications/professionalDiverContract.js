// VERSION: 1.0.0
// PATH: src/v3/schema/applications/professionalDiverContract.js

import {
  pipe,
  string,
  minLength,
  maxLength,
  custom,
  union,
  number,
} from "valibot";

/**
 * Professional Diver Work Contract Schema
 *
 * Defines structure and validation rules for work contract data
 *
 * @returns {Object} Schema definition for MasterForm
 */

export const makePDContractSchema = (diveCenters = []) => ({
  dive_center_id: {
    type: "select",
    label: "Diving Center",
    value: null,
    options: diveCenters,
    validation: pipe(
      union([string(), number()], "Diving Center is required"),
      custom((v) => v !== null && v !== "", "Diving Center is required")
    ),
    attrs: {
      optionLabel: "name",
      optionValue: "id",
      filter: true,
    },
    placeholder: "Select diving center",
    required: true,
  },

  start_date: {
    type: "DatePicker",
    label: "Contract Start Date",
    value: "",
    validation: pipe(
      string("Contract Start Date is required"),
      minLength(1, "Contract Start Date is required"),
      maxLength(10, "Contract Start Date must be valid date")
    ),
    attrs: {
      placeholder: "YYYY-MM-DD",
    },
    placeholder: "YYYY-MM-DD",
    required: true,
  },

  end_date: {
    type: "DatePicker",
    label: "Contract End Date",
    value: "",
    validation: pipe(
      string("Contract End Date must be a valid date"),
      maxLength(10, "Contract End Date must be a valid date")
    ),
    attrs: {
      placeholder: "YYYY-MM-DD",
    },
    placeholder: "YYYY-MM-DD (optional)",
    required: false,
  },

  contract_copy: {
    type: "file",
    label: "Work Contract Copy",
    value: null,
    validation: pipe(
      custom((v) => v instanceof File, "Work Contract Copy is required"),
      custom((v) => {
        const validTypes = [
          "application/pdf",
          "image/png",
          "image/jpeg",
          "image/jpg",
          "image/gif",
        ];
        return validTypes.includes(v.type);
      }, "Only PDF and image files (PNG, JPEG, JPG, GIF) are accepted"),
      custom(
        (v) => v.size <= 2 * 1024 * 1024,
        "File size must be less than 2MB"
      )
    ),
    attrs: {
      accept: "image/png,image/jpeg,image/jpg,image/gif,application/pdf",
      maxSize: 2 * 1024 * 1024,
    },
    required: true,
  },
});

/**
 * Legacy export for backward compatibility
 * @deprecated Use makePDContractSchema() instead
 */
export const professionalDiverContractSchema = makePDContractSchema();

export default professionalDiverContractSchema;
