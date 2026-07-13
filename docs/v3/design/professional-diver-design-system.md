# Professional Diver Design System

This document outlines the styling patterns, components, and design tokens used in the **Professional Diver** module (Profile and License Validation pages). Use this as a reference for future development to maintain visual consistency.

## 1. Core Visuals

### Background
The module uses a fixed "Mesh Gradient" background to create depth and a premium feel.

```css
.mesh-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  opacity: 0.8;
  background:
    radial-gradient(900px 500px at 12% 18%, rgba(14,165,233,0.12), transparent 60%),
    radial-gradient(800px 420px at 85% 12%, rgba(34,211,238,0.1), transparent 62%),
    radial-gradient(700px 380px at 25% 85%, rgba(59,130,246,0.08), transparent 60%),
    radial-gradient(600px 340px at 75% 78%, rgba(2,132,199,0.08), transparent 60%);
  z-index: 0;
}
```

### Glassmorphism Cards
Main containers use a glassmorphic effect with blurred transparency and subtle white borders.

-   **Classes**: `tw-bg-white/90 tw-backdrop-blur-xl tw-border tw-border-white/60 tw-shadow-xl tw-rounded-[2.5rem]`
-   **Usage**: Wraps the main profile info or validation results.

## 2. Typography

### Headings
-   **Style**: Extra Bold, Slate 800, Tight Tracking.
-   **Classes**: `tw-text-3xl md:tw-text-4xl tw-font-extrabold tw-text-slate-800 tw-tracking-tight tw-leading-tight`

### Labels (Metadata)
-   **Style**: Small, Bold, Uppercase, Wide Tracking, Slate 400.
-   **Classes**: `tw-text-[10px] sm:tw-text-xs tw-font-bold tw-text-slate-400 tw-uppercase tw-tracking-wide`

### Values (Data)
-   **Style**: Standard text size, Bold, Slate 800.
-   **Classes**: `tw-text-sm sm:tw-text-base tw-font-bold tw-text-slate-800`
-   **Monospaced**: Use `tw-font-mono` for IDs or License Numbers.

## 3. UI Components

### Stat Cards
Used to display individual key-value data points (e.g., Rank, Status).

-   **Container**: `tw-bg-white tw-border tw-border-slate-100 tw-rounded-2xl tw-p-5 tw-shadow-sm`
-   **Hover Effect**: `tw-shadow-md -tw-translate-y-1 tw-border-slate-200` (transition duration-300)
-   **Icon Box**:
    -   Size: `tw-w-12 tw-h-12`
    -   Shape: `tw-rounded-xl`
    -   Align: Flex center
    -   **Color Variants**:
        -   **Indigo**: `tw-bg-indigo-50 tw-text-indigo-600`
        -   **Orange**: `tw-bg-orange-50 tw-text-orange-600`
        -   **Rose**: `tw-bg-rose-50 tw-text-rose-600`
        -   **Teal**: `tw-bg-teal-50 tw-text-teal-600`

### Status Indicators
Consistent color mapping for diver statuses.

| Status | Color | Tailwind Classes |
| :--- | :--- | :--- |
| **Valid** | Emerald | `tw-bg-emerald-500` |
| **Expired** | Red | `tw-bg-red-500` |
| **Terminated** | Red | `tw-bg-red-500` |
| **Unknown/Other** | Slate | `tw-bg-slate-400` |

### Profile Photo
-   **Container**: `tw-rounded-2xl tw-overflow-hidden tw-shadow-2xl`
-   **Aspect Ratio**: approx 5:6 (e.g., 200px x 240px)
-   **Glow**: Animated gradient blur behind the photo (`tw-blur-xl tw-opacity-0 group-hover:tw-opacity-100`).
-   **Protection**: disable drag/context menu via `pointer-events-none` overlay or handlers.

## 4. Animations

### Fade Up
Standard entry animation for content blocks.

```css
.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
```

## 5. Buttons & Inputs

-   **Inputs**: Large touch target (`tw-py-3.5`), light border (`tw-border-slate-200`), focus ring in Sky color.
-   **Buttons**:
    -   **Primary**: Sky 600 (`tw-bg-sky-600`), Shadow Sky 200 (`tw-shadow-sky-200`), Rounded XL.
    -   **Hover**: Lift effect (`-tw-translate-y-[2px]`).

---
*Generated based on the current `ProfessionalDiverProfile.vue` implementation and v3 professional-diver documentation.*
