# Applications Index UI Requirements

**Feature:** Applicant applications list (`My Applications`)
**Primary route:** `/app/{locale}/applications`
**Primary page:** `src/v3/pages/applications/ApplicationsIndex.vue`
**Primary card:** `src/v3/components/applications/ApplicationCard.vue`
**Last updated:** 2026-07-12
**Task list:** [Applications Index UI Task List](../operations/applications-index-ui-task-list.md)

## Purpose

The applications index must let an applicant quickly understand what applications exist, their current user-facing status, whether action is required, and how to open the relevant application. The page must feel like a compact private workspace rather than a public marketing page.

## Scope

This requirement covers:

- private-app header behavior around the applications page
- breadcrumb structure and navigation boundaries
- page heading and vertical spacing
- application card hierarchy and actions
- responsive list/grid behavior
- compact private-platform footer behavior
- accessibility and Arabic/English layout behavior

It does not change application workflow rules, status values, API contracts, payment behavior, or application permissions.

## Navigation Requirements

### NAV-1: Public website boundary

- The SWSDF logo in the private-app header and footer must navigate to the public website.
- The breadcrumb `Home` item must navigate to the public website.
- Public website URLs must use `VITE_WEB_BASE_URL`:
  - development: `http://localhost:8910/`
  - production: `https://swsdf.sa/`
- The current locale must be appended when the public website uses localized roots, for example `/ar` or `/en`.
- Public website links must use normal anchors and must not inherit Vue Router's `/app/` base.

### NAV-2: Private workspace boundary

- Links labeled `Workspace` must navigate inside the private application to `/app/`.
- Private links must use named Vue Router routes rather than hardcoded `/app` paths.
- No generated URL may contain `/app/app/...`.
- Do not pass a `locale` route parameter to routes whose path does not declare `:locale`.

### NAV-3: Breadcrumb hierarchy

- The applications index breadcrumb should read: `Home > Workspace > My Applications`.
- `Home` is an external public-website link.
- `Workspace` is an internal link to `AppRoot`.
- `My Applications` is the current item and must not be a link.
- Duplicate route titles such as repeated `Workspace` or `Applications` must not appear.
- Breadcrumb direction, separators, and alignment must follow the current locale.

## Layout Requirements

### LAYOUT-1: Header must not cover content

- The private-app header is sticky and remains in normal document flow.
- The layout must not add a fixed-header offset that creates excessive blank space.
- Full-page screenshots and print output must not place the header over application cards.
- The header must not include an empty hamburger control or mobile drawer when no private navigation items require it.
- The header is limited to the public-site logo, language switch, and account menu.
- The profile trigger uses the same neutral resting treatment as the language control, with clear hover, focus, and open states.

### LAYOUT-2: Compact page heading

- The page heading is rendered by the shared `PageHeading` component in `MainLayout.vue`.
- Pages set the title and subtitle via `usePageHeading().setHeading()`.
- The heading should include:
  - `My Applications`
  - a short explanation such as `Track your submitted requests and required actions.`
- Pages must not duplicate the heading with their own `<h1>` or container wrapper.
- The first application row should begin without excessive blank space.
- Desktop spacing between the header/heading region and first card row should normally remain within 32-48px.

### LAYOUT-3: Responsive grid

- Desktop: up to three application cards per row.
- Tablet: two cards per row.
- Mobile: one card per row.
- Grid gaps must remain consistent at each breakpoint.
- Cards use `tw-items-stretch` for equal-height rows with bottom-aligned actions.
- Metadata uses a soft neutral background instead of separator lines.

## Application Card Requirements

### CARD-1: Information hierarchy

Each card must prioritize information in this order:

1. application number and user-facing status (compact top row)
2. application display title (full-width row beneath the top row)
3. submission date/time
4. relevant secondary action or invoice link
5. primary `View application` action

The title and status must remain visually distinct and must not collide when the title wraps. The application number and status share a compact top row so the title has the full card width.

### CARD-2: Status presentation

- Display one prominent current user-facing `status`.
- Do not use workflow `stage` as the applicant-facing status label.
- Approved/completed states use success styling.
- Rejected states use danger styling.
- Pending/review/payment-required states use warning or information styling.
- Draft and neutral states use neutral styling.
- Status badges must meet readable text contrast and must not rely on color alone; icon or text must communicate meaning.

### CARD-3: Secondary workflow information

- If the latest action or workflow detail is useful, display it under a clear label such as `Latest action`.
- Do not place two competing status badges at the same hierarchy level.
- Invoice access appears only when an invoice exists and the user is allowed to view it.

### CARD-4: Date and time

- Submission date and time should use one compact localized line where practical.
- Arabic display should use a readable format such as `03 فبراير 2026، 12:38 م`.
- English display should use an equivalent localized format.
- Raw backend timestamps must not be shown directly.

### CARD-5: Primary action

- The card's primary action label must be `View application`, not only `View`.
- The action must be visually obvious and placed consistently at the card bottom.
- Arrow/icon direction must follow RTL/LTR direction.
- The entire card must not become an ambiguous click target when it contains separate invoice or workflow links.
- Focus and hover states must be visible.

## Optional List Controls

- Add filtering only when it improves a real list of applications; do not add decorative controls without behavior.
- If introduced, the initial filter set should be small: `All`, `Under review`, `Approved`, and `Rejected`.
- Search should be added only when application titles/numbers can be searched reliably on the current loaded dataset or through an API contract.
- Filters and search must work in Arabic and English and remain keyboard accessible.

## Footer Requirements

- The authenticated private application should use a compact footer.
- The footer must not visually outweigh the page's primary content.
- Required content is limited to federation identity, compact social links, copyright, and domain.
- Full public-site promotional navigation remains on the public website.
- Social links may be retained only as a compact secondary icon row.
- The footer logo links to the localized public website root.
- Do not add redundant public-website or Workspace button blocks to the footer.

## Translation Requirements

- UI code passes literal English text to `t()` or `$t()`.
- Arabic translations belong in `src/locales/ar.json`.
- Do not introduce nested or generated keys for card statuses, actions, breadcrumbs, or controls.
- API-backed statuses and titles should arrive as canonical English display phrases before translation.
- Do not add Arabic strings as translation keys to suppress warnings from already-localized API data.

## Accessibility Requirements

- Heading hierarchy begins with one page-level `h1`.
- Breadcrumb navigation has an accessible label.
- Status badges are understandable without color.
- Links and buttons have descriptive text and visible keyboard focus.
- Interactive targets should be at least 44px high where practical.
- Content must remain usable at 200% browser zoom and at a 320px viewport width.
- Arabic uses RTL alignment and English uses LTR alignment without manually reversing semantic content order.

## Acceptance Criteria

- Header does not cover cards at any supported viewport size.
- Breadcrumb is exactly `Home > Workspace > My Applications`, with correct external/internal destinations.
- The heading region no longer produces excessive vertical whitespace.
- Cards have consistent title, status, metadata, and action sections.
- Status meaning is clear and uses the user-facing `status` value.
- Date/time is localized and compact.
- Primary action reads `View application` and has correct RTL/LTR icon direction.
- Desktop, tablet, and mobile layouts meet the defined column behavior.
- Footer is visibly more compact than the current public-style footer.
- Header is a compact sticky workspace bar with no unused hamburger or public-site menu.
- Profile trigger matches the language control at rest and preserves visible hover/focus/open states.
- No new vue-i18n missing-key warnings are introduced.
- `npm run translations:audit -- --limit=50` and `npm run build` complete successfully.
