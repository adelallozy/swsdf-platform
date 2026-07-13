# Applications Index UI Task List

**Requirements:** [Applications Index UI Requirements](../requirements/applications-index-ui.md)
**Primary route:** `/app/{locale}/applications`
**Status:** Core UI phases complete; optional filtering and final verification pending
**Last updated:** 2026-07-12

## Goal

Implement the approved applications-index UI improvements without changing application workflow, API permissions, or canonical status/stage behavior.

## Likely Active Files

- `src/v3/pages/applications/ApplicationsIndex.vue`
- `src/v3/components/applications/ApplicationCard.vue`
- `src/v3/components/Layout/Breadcrumb.vue`
- `src/v3/composables/layout/useBreadcrumb.js`
- `src/v3/layouts/MainLayout.vue`
- `src/layout/header/Header.vue`
- `src/layout/footer/Footer.vue`
- `src/router/index.js`
- `src/locales/ar.json`
- `.env.development`
- `.env.production`

Confirm imports and route usage before editing files outside `src/v3/**`.

## Phase 1: Reproduce And Baseline

- [ ] Open `/app/ar/applications` and `/app/en/applications` at desktop, tablet, and mobile widths.
- [ ] Capture current header height, heading spacing, card heights, and footer height.
- [ ] Confirm whether the header overlay occurs during normal scrolling, full-page screenshots, or both.
- [ ] Record the exact current breadcrumb items and their destinations.
- [ ] Confirm which card fields are available: display title, status, number, submitted date, latest action, and quotation/invoice.
- [ ] Check browser console for router and vue-i18n warnings before implementation.

## Phase 2: Navigation And Breadcrumbs

- [x] Keep header and footer logos linked to `${VITE_WEB_BASE_URL}{locale}` using external anchors.
- [x] Ensure the breadcrumb `Home` item uses the same external public-site URL.
- [x] Ensure every `Workspace` link uses `{ name: 'AppRoot' }` and stays inside `/app/`.
- [x] Generate breadcrumb items from public `Home` plus matched private routes.
- [x] Confirm the applications page renders exactly `Home > Workspace > My Applications` after route-meta deduplication.
- [x] Mark the final breadcrumb item as current text rather than a link.
- [x] Add accessible labels to external home, header, footer, social, and account controls.
- [x] Verify separators and item order in both RTL and LTR.
- [x] Confirm no navigation emits `Discarded invalid param(s) "locale"`.

## Phase 3: Header And Page Spacing

- [x] Inspect the active header positioning rules and containing layout.
- [x] Replace overlay-prone fixed behavior with a stable sticky header in normal document flow.
- [x] Remove the obsolete fixed-header offset and use compact page padding in `MainLayout.vue`.
- [x] Remove the empty mobile drawer and hamburger control.
- [x] Redesign the account trigger/dropdown and match its neutral resting state to the language switch.
- [x] Consolidate breadcrumb, title, description, and count into one compact heading region via shared `PageHeading` component.
- [x] Reduce top and bottom whitespace by removing the fixed-header offset and redundant container wrappers.
- [x] Verify full-page screenshots no longer place the header across application cards.

## Phase 4: Applications Page Heading

- [x] Render `h1` with `My Applications` via shared `PageHeading` component and `usePageHeading().setHeading()`.
- [x] Add concise supporting text: `Track your submitted requests and required actions.`
- [ ] Display the application count using the loaded list data.
- [x] Ensure empty/loading/error states do not cause heading layout shifts.
- [x] Add literal-English translation keys and Arabic values for new text.

## Phase 5: Application Card Structure

- [x] Refactor the card into explicit header, metadata, secondary-action, and primary-action sections.
- [x] Keep title and status readable when titles wrap to multiple lines.
- [x] Place application number and status in a compact top row; title gets its own full-width row beneath.
- [x] Display only the canonical applicant-facing `status` as the prominent badge.
- [x] Map existing canonical statuses to success, danger, warning/info, and neutral visual variants.
- [x] Include icon/text semantics so status does not depend only on color.
- [x] Show latest action only when it adds useful information and label it clearly.
- [x] Show invoice link only when invoice data exists.
- [x] Replace `View` with `View application`.
- [x] Align the primary action consistently at the card bottom via `margin-top: auto`.
- [x] Correct action icon direction for RTL/LTR.
- [x] Add visible hover and keyboard-focus styles.
- [x] Use a soft neutral background for metadata instead of separator lines.

## Phase 6: Date Formatting

- [x] Identify the canonical submission field used by the page (`submitted_at` where available).
- [x] Use `Intl.DateTimeFormat` with the active locale and Riyadh timezone.
- [x] Present date and time compactly instead of as multiple raw lines.
- [x] Handle missing or invalid timestamps without displaying `Invalid Date`.
- [ ] Verify Arabic and English numeral/date behavior with product expectations.

## Phase 7: Responsive Grid

- [x] Implement three columns on large desktop, two on tablet, and one on mobile.
- [x] Keep card gaps and outer container widths consistent with the current design system.
- [x] Use `tw-items-stretch` for equal-height cards with bottom-aligned actions.
- [x] If equal-height rows are retained, use flex/grid sections so actions align without hiding content.
- [ ] Test long Arabic and English titles at 320px, 768px, and desktop widths.

## Phase 8: Compact Private Footer

- [x] Define the private footer around federation identity, compact social links, copyright, and domain.
- [x] Keep the footer logo linked to the public website.
- [x] Remove the redundant footer navigation buttons; workspace navigation remains available in the application header and breadcrumbs.
- [x] Reduce vertical padding and replace oversized background artwork with a compact water-line accent.
- [x] Keep social links as a compact secondary icon row without restoring the oversized public promotional footer.
- [x] Ensure copyright remains readable and localized.

## Phase 9: Optional Filtering

- [ ] Confirm the number of applications and user need before implementing filters.
- [ ] If approved, add functional filters for `All`, `Under review`, `Approved`, and `Rejected`.
- [ ] Define which canonical statuses belong to each filter without using workflow `stage` for applicant display.
- [ ] Add search only if the loaded data/API supports reliable title or application-number search.
- [ ] Preserve selected controls across locale changes only if required.

## Phase 10: Translation And Contract Cleanup

- [ ] Run `npm run translations:audit -- --limit=50` before and after UI changes.
- [ ] Use literal English keys for every new label.
- [ ] Do not add Arabic mirror keys for API values such as Arabic application titles.
- [ ] Record backend contract issues when API-backed values arrive already localized instead of canonical English display phrases.
- [ ] Confirm card status translations exist for the statuses present in test data.

## Phase 11: Verification

- [ ] Run `node scripts/generate-pages-inventory.js` if routes or route metadata change.
- [ ] Run `npm run translations:audit -- --limit=50`.
- [x] Run `npm run build` after all card and page redesign changes.
- [ ] Test direct navigation and browser refresh at `/app/ar/applications` and `/app/en/applications`.
- [ ] Test public `Home` and logo links in development and production-mode builds.
- [ ] Test internal `Workspace`, application, and invoice links for exactly one `/app` prefix.
- [x] Verify no header overlay at desktop/mobile widths and during full-page capture.
- [ ] Verify keyboard navigation, focus indicators, zoom at 200%, and 320px viewport layout.
- [x] Capture Arabic and English before/after screenshots for review.

## Completion Criteria

- [ ] All acceptance criteria in the linked requirements document pass.
- [ ] No application workflow or API behavior changed unintentionally.
- [ ] No new router, console, or vue-i18n warnings remain in the tested flow.
- [ ] Documentation reflects the final implemented behavior and file locations.
