// src/v3/utils/dates.js
// UTIL-DATES-v1-2025-10-14

/**
 * Normalize a date-like value to `YYYY-MM-DD`.
 * Accepts Date or string. Returns '' if invalid/missing.
 */
export function toYmd(input) {
  if (!input) return "";
  try {
    const dt = input instanceof Date ? input : new Date(input);
    if (isNaN(dt.getTime())) return "";
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const d = String(dt.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  } catch {
    return "";
  }
}
