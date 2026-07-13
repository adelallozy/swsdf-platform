// FILE: src/v3/utils/url-join.js
export function joinBase(base, path) {
  if (!path) return "";
  if (!base) return path;
  if (/^https?:\/\//i.test(path)) return path;
  const a = String(base).replace(/\/+$/, "");
  const b = String(path).replace(/^\/+/, "");
  return `${a}/${b}`;
}
