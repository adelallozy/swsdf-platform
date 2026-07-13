# ActionsTrackingCard Specification

**File**: `src/v3/components/applications/cards/ActionsTrackingCard.vue`
**Token**: `ACTIONS-CARD-v3.4.0`

## 1. Overview
The `ActionsTrackingCard` component displays a timeline of actions related to the application. It is designed to be mobile-friendly, RTL-compatible, and follows the "Participants card" styling pattern.

## 2. Data Source
*   **Primary**: `store.payload.actions`
*   **Fallbacks**: `store.payload.application_actions` (array or single object)
*   **Filtering**: **No front-end filtering**. The component displays all items provided by the back-end (which filters to user-related actions).
*   **Sorting**: **Newest first** (descending by parsed timestamp).

## 3. Data Fields
The component accepts canonical action objects with the following fields:
1.  `created_at` (`YYYY-MM-DD HH:mm`, treated as `+03:00`)
2.  `action_key` - Action label key
3.  `notes` (or `description`) - Notes/message
4.  `id` (optional, used as key)

## 4. UI Specifications
*   **Heading**: "Action History" (localized), left-aligned, **outside the card border** (bold label line above the white card).
*   **Structure**: No outer wrapper card. Each timeline item renders a **single white card**.
*   **Timeline**:
    *   PrimeVue Timeline component.
    *   `layout="vertical"`
    *   `align="right"` (LTR) / `align="left"` (RTL)
    *   Opposite slot hidden.
    *   Reduced gutters and connector spacing for mobile density.
*   **Item Content**:
    *   **Action Label**: Bold, truncated if long.
    *   **Notes**: Wraps/word-breaks.
    *   **Timestamp**: `HH:mm` (24-hour) and `YYYY-MM-DD` **inside the card** at the edge.
*   **Formatting**:
    *   **Timezone**: `Asia/Riyadh`
    *   **Numerals**: **English numerals enforced** everywhere (even in Arabic UI).
    *   **Date**: `toYmd` (YYYY-MM-DD)
    *   **Time**: `HH:mm` (24-hour)
*   **Excluded Elements**:
    *   No "Performed by" field.
    *   No day headers.
    *   No refresh button (loading owned by store).

## 5. Visual Accents & Icons
Important actions have distinct styling:

| Action Type | Accent Color | Icon |
| :--- | :--- | :--- |
| **Reject / Application Reject** | Red | `pi-times` |
| **Applicant Notice** | Amber/Yellow | `pi-exclamation-circle` |
| **Issue Fee Invoice** | Blue/Cyan | `pi-wallet` |
| **Return to Applicant** | Orange | `pi-undo` |
| *Submit* | (Default) | `pi-send` |
| *Default/Success* | (Default) | `pi-check-circle` |

## 6. States
*   **Empty**: Centered empty state when no actions.
*   **Loading**: Handled by store. Component may attempt one-time reload on mount if empty.

## 7. Accessibility
*   Icons: `aria-hidden="true"`
*   Time block: Plain text.
*   Heading: Semantic label.

## 8. Integration
*   Included in `ApplicationSummary.vue` via `summaryLayout`.
*   Data loaded via `COMMON_DATA_LOADERS` (`actions` loader).
