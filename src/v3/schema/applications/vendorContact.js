import { maxLength, minLength, pipe, regex, string } from "valibot";

export function makeVendorContactSchema() {
  return {
    position: {
      type: "text",
      label: "Position",
      value: "",
      validation: pipe(
        string("Position is required"),
        minLength(1, "Position is required"),
        maxLength(200, "Position must be under 200 characters")
      ),
      attrs: { maxlength: 200 },
      placeholder: "Enter position",
      required: true,
    },
    name: {
      type: "text",
      label: "Name",
      value: "",
      validation: pipe(
        string("Name is required"),
        minLength(1, "Name is required"),
        maxLength(200, "Name must be under 200 characters")
      ),
      attrs: { maxlength: 200 },
      placeholder: "Enter full name",
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
        regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address")
      ),
      attrs: { maxlength: 254, inputmode: "email" },
      placeholder: "Enter email address",
      required: true,
    },
    mobile: {
      type: "text",
      label: "Mobile Number",
      value: "",
      validation: pipe(
        string("Mobile number is required"),
        minLength(7, "Mobile number must be at least 7 characters"),
        maxLength(20, "Mobile number must be under 20 characters"),
        regex(/^[0-9+()\-\s]{7,20}$/, "Please enter a valid mobile number")
      ),
      attrs: { maxlength: 20, inputmode: "tel" },
      placeholder: "Enter mobile number",
      required: true,
    },
  };
}

export function serializeVendorContact(data = {}) {
  return {
    position: String(data.position || "").trim(),
    name: String(data.name || "").trim(),
    email: String(data.email || "").trim(),
    mobile: String(data.mobile || "").trim(),
  };
}
