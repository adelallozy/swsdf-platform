# HR Leave Deferred Work - SWSDF Platform

Last updated: 2026-07-15

This file registers employee-facing leave work deferred for the private platform
served under `/app/`. The canonical policy/backend registry is
`api/docs/hr-leave-deferred-work.md`.

## Project Ownership

`swsdf-platform` is the active source project for the private application. The
workspace `current_app` directory is an empty read-only deployment mount and does
not carry a separate implementation backlog.

## Deferred Platform Work

1. Add authenticated employee leave application list, start, form, summary, and
   action routes under the existing `/app/` deployment base.
2. Reuse the existing application store and submit/resubmit/recall actions.
3. Consume canonical leave endpoints from shared endpoint configuration.
4. Display server-derived duration, balance, warnings, and overlap details.
5. Support protected attachments when HRL-D10 is decided.
6. Add approved/rejected/returned state presentation without interpreting
   workflow permissions from display status.

## Decision Dependencies

- HRL-D06 through HRL-D10 determine form and calculation behavior.
- HRL-D11 determines stages, assignees, and applicant actions.
- HRL-D12 determines post-approval notifications and distribution display.

## Constraints

- Do not include `/app` in Vue route definitions.
- Keep new work under `src/v3/**` unless active imports prove otherwise.
- Do not add Axios, local Bearer headers, or a second application store.
- Do not add aliases or normalization for drifting API fields.
- Use literal English translation keys and canonical English API labels.

## Acceptance Checks

- Generated URLs contain exactly one `/app/` prefix.
- Protected pages sign out centrally on `401` and do not show duplicate errors.
- Arabic/English and mobile/desktop flows pass.
- Workflow actions, balance values, and overlap messages match the API.
- Repeated approval cannot surface duplicate registered leave.
