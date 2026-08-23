import { pipe, string, minLength, maxLength } from "valibot";

const ACCOUNT_TYPE_OPTIONS = [
  { label: "Personal", value: "personal" },
  { label: "Business", value: "business" },
];

export function makeAccountSettingsSchema({
  accountType = "",
  canChangeAccountType = true,
  accountTypeOptions = {},
} = {}) {
  const schema = {
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
        autocomplete: "name",
        maxlength: 20,
      },
      required: true,
    },
  };

  // A locked account type (e.g. `mixed`, or one with existing domain
  // relationships) cannot be changed — hide the selector entirely instead
  // of showing a disabled input plus a technical "account type is locked"
  // banner. The user keeps the alias field and the email-change card.
  // Soft locks (canChangeAccountType === true with some options blocked)
  // still render the selector with the disallowed options disabled.
  if (canChangeAccountType) {
    schema.account_type = {
      type: "radioTiles",
      label: "Account type",
      value: accountType,
      options: ACCOUNT_TYPE_OPTIONS.map((option) => ({
        ...option,
        disabled: accountTypeOptions[option.value]?.allowed === false,
      })),
      validation: pipe(
        string("Account type is required"),
        minLength(1, "Account type is required")
      ),
      attrs: {
        class: "account-type-tiles",
      },
      required: true,
    };
  }

  return schema;
}
