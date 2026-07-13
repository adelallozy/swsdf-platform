// FILE: src/v3/utils/units.js
// TOKEN: UTIL-UNITS-v1-2025-10-15
// Unit helpers (length)
// JS-only, no dependencies.

/**
 * Convert centimeters (number|string) → meters string (e.g., 250 => "2.5").
 * Returns '' for null/undefined/invalid.
 */
export function cmToMetersString(v) {
  if (v === null || v === undefined || v === "") return "";
  const n = Number(v);
  if (!Number.isFinite(n)) return "";
  return (n / 100).toString();
}

/**
 * Convert meters string (e.g., "2.5") → integer centimeters (e.g., 250).
 * Accepts comma as decimal separator. Returns null for empty/invalid.
 */
export function metersStringToCmInt(s) {
  if (s === null || s === undefined || s === "") return null;
  const n = Number(String(s).replace(",", "."));
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100);
}
