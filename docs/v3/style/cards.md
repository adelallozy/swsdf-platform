# Card Styling Guide

Applies to every application “card” rendered inside `ApplicationSummary.vue`, including `EventInfoCard.vue`, `SFParticipantsCard.vue`, `ApplicantPersonalPhotoCard.vue`, and `ActionsTrackingCard.vue`. Use this doc with the component specs so every card stays consistent.

## 1. Layout & Structure
- **Topology**: wrap the whole card block in a plain `<div>`; the heading row sits **outside** the white shell (see `EventInfoCard.vue:6-32`).
- **Heading Row**:
  - `tw-mb-2 tw-flex tw-items-center tw-gap-2` (or `tw-justify-between` when adding actions like `ApplicantPersonalPhotoCard.vue:3-15`).
  - Include a Prime icon with `aria-hidden="true"`.
  - Heading text uses `tw-font-bold tw-text-slate-700 tw-text-xl`.
- **Action links/buttons**: align them on the right using `tw-inline-flex tw-items-center tw-gap-2 tw-text-sm tw-font-medium`. Use router-links for navigation, `AppButton` for operations.
- **Card anatomy is not mandatory**: do not create separate header, body, and
  footer regions for a simple item. A file, attachment, person, or action should
  normally be one flat row with its identity, state, metadata, and actions on
  the same visual plane.

## 2. Card Shell
- Shared shell classes: `tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm`.
- Padding defaults to `tw-p-5` for dense grids and `tw-p-6` when centering a single item (photo card).
- No extra wrappers—the summary page already sets spacing.
- Do not nest cards or bordered panels inside the shell.
- Do not use horizontal divider lines inside the shell or between ordinary
  rows. Express grouping through spacing, typography, alignment, and restrained
  background tint.
- Operational records keep identity, status, key evidence, and the next action
  together. Dense lists may alternate between two quiet background tones that
  do not encode status.

## 3. Content Layout
- **Grids**: `tw-grid sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-4`. Use `sm:tw-col-span-2` for wide fields (e.g., participant leave addressee at `SFParticipantsCard.vue:224-233`).
- **Labels/values**: labels use `tw-text-sm tw-text-slate-500`, values `tw-font-medium tw-text-slate-700` (or `tw-text-slate-800` when emphasized).
- **Lists/Pills**: `tw-flex tw-flex-wrap tw-gap-2` with `tw-rounded-full tw-bg-slate-100` chips, as in racing categories.
- **Media blocks**: center single assets and clamp width (`tw-w-48 tw-h-60 tw-object-cover tw-rounded-lg`).

## 4. State Blocks
- **Loading**: duplicate the heading row, then render the shell with a centered spinner using `pi pi-spinner tw-animate-spin tw-text-2xl tw-text-slate-400`. The loading key must match the loader (`'sf_participants'`, `'user_profile_picture'`, etc.).
- **Empty**: white shell with centered icon/text (use `tw-text-slate-500` copy). Ensure the string exists in locales.
- **Validation notices**: place above the card and use `tw-p-3 tw-bg-amber-50 tw-border tw-border-amber-200 tw-rounded-lg` with `pi pi-info-circle` icons as in the participants warning block.

## 5. Actions & CTAs
- Inline buttons (edit/delete) live in the heading row; use subtle colors and disabled opacity states (`tw-inline-flex tw-items-center tw-gap-2 tw-px-3 tw-py-1.5`).
- For repeated items, keep item-specific actions beside that item; do not create
  an action footer below it.
- Block CTAs (add participant) use dashed borders: `tw-border-2 tw-border-dashed tw-border-slate-300` with centered contents.

## 6. Typography & Icons
- Always pair icons with text and mark them `aria-hidden="true"`.
- Numerals stay in English even for Arabic UI (global rule).

## 7. RTL & Responsiveness
- Flex/grid layouts should not assume LTR margins. Prime icons mirror automatically, and the timeline in `ActionsTrackingCard` must align to the reading edge.
- Use responsive grid classes instead of manual widths to keep cards legible on mobile.

## 8. References
- `ApplicantPersonalPhotoCard.vue` – media card with edit action.
- `EventInfoCard.vue` – canonical metadata grid plus loading shell.
- `SFTeamCard.vue` / `SFParticipantsCard.vue` – validation blocks, repeated participant cards, CTA patterns.
- `docs/v3/specs/ActionsTrackingCard.md` – applies these styles to timelines.
