import { pipe, string, minLength, maxLength, regex } from "valibot";

export function makeSignUpSchema() {
  return {
    first_name: {
      type: "text",
      label: "First name",
      value: "",
      validation: pipe(
        string("First name is required"),
        minLength(1, "First name is required"),
        maxLength(100, "First name must not exceed 100 characters")
      ),
      attrs: {
        placeholder: "Enter your first name",
        autocomplete: "given-name",
        maxlength: 100,
      },
      required: true,
    },

    last_name: {
      type: "text",
      label: "Last name",
      value: "",
      validation: pipe(
        string("Last name is required"),
        minLength(1, "Last name is required"),
        maxLength(100, "Last name must not exceed 100 characters")
      ),
      attrs: {
        placeholder: "Enter your last name",
        autocomplete: "family-name",
        maxlength: 100,
      },
      required: true,
    },

    email: {
      type: "email",
      label: "Email",
      value: "",
      validation: pipe(
        string("Email is required"),
        minLength(1, "Email is required"),
        maxLength(255, "Email must be under 255 characters"),
        regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address")
      ),
      attrs: {
        type: "email",
        placeholder: "Enter your email",
        autocomplete: "email",
        inputmode: "email",
        maxlength: 255,
      },
      required: true,
    },

    password: {
      type: "password",
      label: "Password",
      value: "",
      componentProps: {
        toggleMask: true,
        feedback: false,
      },
      validation: pipe(
        string("Password is required"),
        minLength(6, "Password must be at least 6 characters")
      ),
      attrs: {
        type: "password",
        placeholder: "Enter your password",
        autocomplete: "new-password",
      },
      required: true,
    },

    password_confirmation: {
      type: "password",
      label: "Confirm password",
      value: "",
      componentProps: {
        toggleMask: true,
        feedback: false,
      },
      validation: pipe(
        string("Password confirmation is required"),
        minLength(1, "Password confirmation is required")
      ),
      attrs: {
        type: "password",
        placeholder: "Re-enter your password",
        autocomplete: "new-password",
      },
      required: true,
    },
  };
}
