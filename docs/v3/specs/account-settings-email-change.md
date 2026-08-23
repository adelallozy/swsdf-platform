# Account Settings Email Change — Platform Implementation Spec

Platform implementation of the verified-email change flow in Account
Settings (`/app/:locale/account-settings`). Product contract:
[`Docs/Account Registration/account-registration-requirements.md`](../../../../Docs/Account%20Registration/account-registration-requirements.md)
§4.6. Mechanism (endpoints, tokens, rate limits):
[`api/docs/authentication.md`](../../../../api/docs/authentication.md) §6
— dual confirmation, authoritative.

## Flow (dual confirmation)

The switch executes only after BOTH emails are proven:

1. **request** — new email + current password →
   `request-email-change` (password reauth; OTP mailed to the NEW
   address). A restart to an address the user already claimed revives
   that pending row instead of inserting a new one, and any other stale
   pending rows are deleted — abandoned attempts never block a retry.
2. **newCode** — user enters the 6-digit OTP → `verify-email-change`
   (stage 1). Success response carries
   `stage: 'old_email_confirmation_required'`; the API then mails a
   confirmation OTP to the OLD address.
3. **oldCode** — user enters that OTP → `verify-email-change-confirm`
   (stage 2). The API deletes the old address row (the address becomes
   available for registration again), promotes the new one, and returns
   a fresh JWT; the card calls `setAuthManually()` so the stored user
   payload shows the new email.

Recovery: an expired or lost code (either stage) restarts the flow at
**request** (a fresh request invalidates every prior change token and
reuses the existing pending row — same-address retries are never blocked
by uniqueness). A user who lost the OLD mailbox cannot complete the
change — federation support path (inherent to dual confirmation).

## Component

`src/v3/components/Account/EmailChangeCard.vue` — mounted in
`AccountSettings.vue` below the alias/account-type form.

- Phase state machine: `idle → request → newCode → oldCode → idle`.
- Reads the current email from the `useAuth` `user` ref (reactive; shows
  the new address immediately after the switch).
- Paste-safe 6-digit code inputs (same strip-non-digits pattern as
  `VerifyEmail.vue`), `inputmode="numeric"`,
  `autocomplete="one-time-code"`.
- Stage-1 resend re-posts `request-email-change` with the retained
  in-memory password (60s cooldown; password cleared on unmount and on
  completion — never persisted).
- Error mapping: 429 → centered rate-limit banner; 422
  `errors.current_password` / `errors.new_email` / unique-rule
  `errors.email` (mapped onto the new-email field) → per-field messages;
  422 `errors.code` → per-field code error; 401 → silent (centralized
  sign-out owns it).
- Toast strings are literal English keys translated by
  `useNotification`; field/API error strings are literal English phrases
  translated once at the consumption point (`$t(errors.<field>)`).

## Endpoint constants (`src/v3/config/apiEndpoints.js`)

- `AUTH_REQUEST_EMAIL_CHANGE` → `users/request-email-change`
- `AUTH_VERIFY_EMAIL_CHANGE` → `users/verify-email-change`
- `AUTH_VERIFY_EMAIL_CHANGE_CONFIRM` → `users/verify-email-change-confirm`

## Boundary with the unverified flow

This card changes **verified** addresses only. Users without access to a
never-verified signup address use `/auth/change-email` (see
[auth-verification-pages.md](./auth-verification-pages.md)); the API
rejects verified addresses there (uniform 422) and unverified addresses
here.
