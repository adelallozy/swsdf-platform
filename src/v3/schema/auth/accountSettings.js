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
  return {
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

    account_type: {
      type: "radioTiles",
      label: "Account type",
      value: accountType,
      options: ACCOUNT_TYPE_OPTIONS.map((option) => ({
        ...option,
        disabled: accountTypeOptions[option.value]?.allowed === false,
      })),
      validation: canChangeAccountType
        ? pipe(
            string("Account type is required"),
            minLength(1, "Account type is required")
          )
        : undefined,
      attrs: {
        class: "account-type-tiles",
        disabled: !canChangeAccountType,
      },
      required: canChangeAccountType,
    },
  };
}
