import { pipe, string, minLength, maxLength, regex } from "valibot";

const ACCOUNT_TYPE_OPTIONS = [
  { label: "Personal", value: "personal" },
  { label: "Business", value: "business" },
];

export function makeSignUpSchema() {
  return {
    account_type: {
      type: "radioTiles",
      label: "Account type",
      value: "",
      options: ACCOUNT_TYPE_OPTIONS,
      validation: pipe(
        string("Account type is required"),
        minLength(1, "Account type is required")
      ),
      attrs: {
        class: "account-type-tiles",
      },
      required: true,
    },

    alias: {
      type: "text",
      label: "Account name",
      value: "",
      validation: pipe(
        string("Account name is required"),
        minLength(1, "Account name is required"),
        maxLength(20, "Account name must not exceed 20 characters")
      ),
      attrs: {
        placeholder: "Enter your account name",
        autocomplete: "nickname",
        maxlength: 20,
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
