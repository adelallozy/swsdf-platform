# Translations Audit Guide

Use this guide when public pages are removed and the locale files need cleanup.

## Purpose

The translation audit is a safe report, not an automatic cleanup tool.

It helps identify:

- translation keys used in source but missing from `en.json` or `ar.json`,
- translation keys that may be unused after a conservative source scan,
- dynamic translation call sites that require manual review.

Do not mass-delete locale keys only because they appear in the unused list. This app translates some values dynamically from menus, breadcrumbs, API data, and reusable components.

## Command

Run from the `swsdf-platform` project root:

```bash
cd /home/adelallozy/workspace/swsdf.sa/swsdf-platform
npm run translations:audit
```

Useful variants:

```bash
npm run translations:audit -- --limit=50
npm run translations:audit -- --all
```

`--limit=50` prints the first 50 items in each section.

`--all` prints every item. This can be long, so use it when you are ready to review the full list.

## Report Sections

### Source files scanned

Number of `.vue`, `.js`, `.ts`, `.jsx`, and `.tsx` files scanned under `src`.

The script skips `src/locales`.

### Direct literal t/$t keys

Keys found in direct translation calls, such as:

```js
t("Submit")
$t("Diving Regulations")
i18n.global.t("Workspace")
```

These are strong evidence that a key is source-used.

### Conservative UI field keys

Strings found in common UI object fields, such as:

```js
{
  label: "Diving Regulations",
  title: "Applications",
  pageTitle: "Workspace",
  placeholder: "Search"
}
```

These are included because some shared components translate object fields later, such as menus, breadcrumbs, and page headings.

### Missing direct literal keys

Example:

```text
en.json missing direct literal keys
```

This means source code calls `t("Some key")`, but that key is not present in that locale file.

Action:

- Add the missing translation if the UI is still active.
- If the source belongs to a removed public page, remove the source/page instead of adding the key.
- Do not confuse this section with unused keys. Missing means code uses the key but the locale does not define it.

### Maybe unused after conservative scan

Example:

```text
ar.json maybe unused after conservative scan
```

This means the locale file contains a key that was not found in direct translation calls or common UI object fields.

Action:

- Treat this as a candidate list only.
- Search the key before deleting it.
- Check dynamic translation call sites.
- Delete only reviewed keys related to removed public pages.

### Dynamic translation call locations

These are calls where the key is not a simple literal.

Examples:

```vue
{{ $t(item) }}
{{ $t(doc.name) }}
{{ t(pageStore.breadcrumb.title) }}
```

These can hide real usage because the key may come from API data, menus, breadcrumbs, stores, or route metadata.

Action:

- Review these locations before deleting keys that look unused.
- Keep keys that can come from backend data or shared UI state.

## Safe Cleanup Workflow

1. Remove one public route/page.
2. Remove its header, footer, home page, and service-card links.
3. Delete only page-specific components/data files with no remaining `src` references.
4. Run:

```bash
npm run translations:audit -- --limit=50
```

5. For any translation key you want to remove, search it:

```bash
rg -n "Exact translation key" src
rg -n "Exact translation key" src/locales
```

6. If the key appears only in locale files and belonged to the removed public page, delete it from both `en.json` and `ar.json`.
7. Run the audit again.
8. Run:

```bash
npm run build
```

## Deletion Rules

Safe to delete when all are true:

- the related public page was removed,
- the key is not found in `src`,
- the key is not used by a dynamic translation source,
- the key is not needed by private/workspace pages,
- the key is removed from both locale files when both define it.

Do not delete when:

- the key is used by workspace/private pages,
- the value may come from API data,
- the key is a status, application type, document name, activity label, breadcrumb, or menu label still in use,
- only one locale has been checked.

## Notes For This Project

- Prefer literal English UI text as translation keys for new or updated website/admin UI.
- Avoid adding new nested translation keys or generated dotted keys.
- Existing nested keys may remain until a specific cleanup pass replaces them safely.
- Public page removal must not touch private/workspace pages.
