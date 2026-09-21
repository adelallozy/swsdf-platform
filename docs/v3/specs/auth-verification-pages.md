# Auth Verification Pages — Platform Implementation Spec

Platform implementation of the public authentication pages under
`/app/:locale/auth/`. Product contract:
[`Docs/Account Registration/account-registration-requirements.md`](../../../../Docs/Account%20Registration/account-registration-requirements.md).
Mechanism (endpoints, tokens, rate limits):
[`api/docs/authentication.md`](../../../../api/docs/authentication.md) — this
document describes only the platform side and defers to both.

## Routes

| Route | Name | Component | Notes |
|---|---|---|---|
| `/app/:locale/auth/sign-in` | `sign-in` | `SignIn.vue` | On `403 verification_required` redirects to `verify-email` with `?email=` |
| `/app/:locale/auth/verify-email` | `verify-email` | `VerifyEmail.vue` | Needs `?email=` query param; redirects to sign-in without it |
| `/app/:locale/auth/change-email` | `change-email` | `ChangeEmail.vue` | Password-based unverified-email correction; carries `?email=` |

All are `meta.guest: true` children of the locale-prefixed `auth` route
(`Auth.vue` layout). Route paths stay relative to `import.meta.env.BASE_URL`
(no `/app` prefix in route definitions).

## Endpoint constants (`src/v3/config/apiEndpoints.js`)

- `AUTH_SEND_VERIFICATION_CODE` → `users/send-verification-code`
- `AUTH_VERIFY_CODE` → `users/verify-code`
- `AUTH_CHANGE_UNVERIFIED_EMAIL` → `users/change-unverified-email`

## VerifyEmail.vue — states

1. **Pre-send**: shows the account email from `?email=`; user clicks
   **Send verification code** (no code is ever mailed automatically).
2. **Code entry**: 6-digit input (`inputmode="numeric"`,
   `autocomplete="one-time-code"`, paste-safe digit stripping via `@paste`
   + `watch`), 60s resend cooldown, instruction list, 429 rate-limit
   banner.
3. **Verified**: `verify-code` success → `setAuthManually()` completes
   sign-in and navigates to `/`.

Both pre-send and code-entry states render a prominent amber banner —
**"Don't have access to this email?"** — linking to
`change-email?email=<current>` for users whose registered address is
mistyped or inaccessible.

## ChangeEmail.vue — unverified-email correction

Serves product requirement §4.6 (API mechanism:
`api/docs/authentication.md` §6.5).

- Fields: current email (prefilled from `?email=`), password, new email.
  The OTP mailed to the new address is the confirmation that the address
  is correct — there is no confirm-email field.
- Client-side validation covers required fields, email format, and
  new ≠ current.
- Submits `{email, password, new_email}` to `AUTH_CHANGE_UNVERIFIED_EMAIL`.
- Error mapping: 429 → centered rate-limit banner; 422
  `errors.password` / `errors.new_email` (and the unique-rule `errors.email`,
  mapped onto the new-email field) → per-field messages translated at the
  consumption point; 403 `account_suspended` → inline error.
- On success: toast + redirect to `verify-email?email=<new>` in the
  pre-send state. No OTP is sent automatically — the user must click
  **Send verification code** for the replacement address (§4.6).

## Translation contract

All UI text uses literal English keys; Arabic lives in `src/locales/ar.json`.
API-returned error strings are literal English phrases translated exactly
once at the consumption point (`$t(errors.<field>)`); the shared unique-rule
message `This email is already registered.` and `Unable to change email` are
covered there. Toast strings passed to `useNotification` are translated
internally by that composable.
