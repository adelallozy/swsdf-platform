// LAST UPDATED: 2026-02-02
import { pipe, string, minLength, maxLength, custom } from "valibot";

/**
 * Professional Diver Membership Schema
 *
 * Schema for adding international memberships to professional diver applications
 *
 * @returns {Object} Schema definition for MasterForm
 */

// Unique list of all titles from all organizations (no duplicates)
const ALL_TITLES = [
  "Dive Guide",

  "Divemaster",
  "Instructor",
  "Assistant Instructor",
  "Assistant Instructor Trainer",
  "Divemaster Instructor",
  "Instructor Level 1",
  "Instructor Level 2",
  "Instructor Trainer",
  "Advanced EANx Instructor",
  "Advanced Freediver Instructor",
  "Advanced Freediving Instructor",
  "Advanced Gas Blender Instructor",
  "Advanced Instructor",
  "Advanced Nitrox Instructor",
  "Advanced Open Water Instructor",
  "Advanced Rebreather Instructor",
  "Advanced Trimix Instructor",

  "Boat & Drift Instructor",
  "Boat Diver Instructor",
  "Boat Diving Instructor",
  "Buoyancy Instructor",
  "CCR Instructor",
  "Cave Instructor",
  "Course Director",
  "Course Director Trainer",
  "Decompression Procedures Instructor",
  "Deep Diver Instructor",
  "Deep Diving Instructor",
  "Deep Instructor",
  "Digital Imaging Instructor",

  "Dry Suit Instructor",
  "Ecology Instructor",
  "Emergency Oxygen Provider Instructor",
  "Equipment Instructor",
  "Equipment Techniques Instructor",
  "Freediver Instructor",
  "Freediving Instructor",
  "Freediving Instructor Trainer",
  "Full Cave Instructor",
  "Gas Blender Instructor",
  "Ice Diver Instructor",
  "IDC Staff Instructor",

  "Marine Ecology Instructor",
  "Master Freediver Instructor",
  "Master Freediving Instructor",
  "Master Instructor",
  "Master Scuba Diver Trainer",
  "Night Diver Instructor",
  "Night Diving Instructor",
  "Night Instructor",
  "Nitrox Instructor",
  "Open Water Scuba Instructor",
  "Open Water Scuba Diver Instructor",
  "Peak Performance Buoyancy Instructor",
  "Perfect Buoyancy Instructor",
  "Photographer Instructor",
  "Photo & Video Instructor",
  "Rebreather Instructor",
  "Rescue Instructor",
  "Search & Recovery Instructor",
  "Search and Recovery Instructor",
  "Sidemount Instructor",
  "Specialty Instructor",
  "Tec Deep Instructor",
  "Technical Cave Instructor",
  "Technical Instructor",
  "Technical Sidemount Instructor",
  "Tec Trimix Instructor",
  "Tec Trimix Trainer",
  "Trimix Instructor",
  "Wreck Diver Instructor",
  "Wreck Diving Instructor",
  "Wreck Instructor",

  "First Aid Instructor",
].sort();

export const makePDMembershipSchema = () => ({
  organization: {
    type: "select",
    label: "Organization",
    value: "",
    options: [
      { label: "PADI", value: "PADI" },
      { label: "SSI", value: "SSI" },
      { label: "NAUI", value: "NAUI" },
      { label: "SDI/TDI", value: "SDI_TDI" },
      { label: "RAID", value: "RAID" },
      { label: "IANTD", value: "IANTD" },
      { label: "SNSI", value: "SNSI" },
    ],
    validation: pipe(
      string("Organization is required"),
      minLength(1, "Organization is required")
    ),
    attrs: {
      optionLabel: "label",
      optionValue: "value",
    },
    placeholder: "Select organization",
    required: true,
  },

  diving_type: {
    type: "select",
    label: "Diving Type",
    value: "",
    options: [
      { label: "Recreational", value: "Recreational" },
      { label: "Technical", value: "Technical" },
      { label: "Freediving", value: "Freediving" },
    ],
    validation: pipe(
      string("Diving type is required"),
      minLength(1, "Diving type is required")
    ),
    attrs: {
      optionLabel: "label",
      optionValue: "value",
    },
    placeholder: "Select diving type",
    required: true,
  },

  title: {
    type: "autocomplete",
    label: "Qualification Level",
    value: "",
    options: ALL_TITLES,
    validation: pipe(
      string("Title is required"),
      minLength(1, "Title is required"),
      maxLength(240, "Maximum 240 characters"),
      custom(
        (v) => /^[A-Za-z\s&\-]+$/.test(v),
        "Enter your diving rank using English letters, exactly as shown on your membership card or profile page"
      )
    ),
    attrs: {
      dropdown: true,
      maxlength: 240,
      completeOnFocus: true,
      forceSelection: false,
      pattern: "[A-Za-z\\s&\\-]+",
    },
    placeholder: "Enter or select title",
    required: true,
  },

  membership_number: {
    type: "text",
    label: "Membership Number",
    value: "",
    validation: pipe(
      string("Membership number is required"),
      minLength(1, "Membership number is required"),
      maxLength(80, "Maximum 80 characters")
    ),
    attrs: {
      maxlength: 80,
    },
    required: true,
  },

  membership_copy: {
    type: "file",
    label: "Membership File",
    value: null,
    validation: pipe(
      custom((v) => v instanceof File, "Membership copy is required"),
      custom(
        (v) => v.size <= 2 * 1024 * 1024,
        "File size must be less than 2MB"
      )
    ),
    attrs: {
      accept: "image/png,image/jpeg,application/pdf",
      maxSize: 2 * 1024 * 1024,
    },
    required: true,
  },
});
