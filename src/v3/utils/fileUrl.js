const DEFAULT_FILES_URL =
  import.meta.env.VITE_FILES_BASE_URL ||
  import.meta.env.VITE_MEDIA_BASE_URL ||
  import.meta.env.VITE_WEB_BASE_URL ||
  "";

export function buildFileUrl(path, baseUrl = DEFAULT_FILES_URL) {
  const normalizedPath = String(path || "").trim();

  if (!normalizedPath) {
    return "";
  }

  if (/^https?:\/\//i.test(normalizedPath)) {
    return normalizedPath;
  }

  if (!baseUrl) {
    return normalizedPath;
  }

  const normalizedBase = String(baseUrl).replace(/\/+$/, "");
  const relativePath = normalizedPath.replace(/^\/+/, "");

  return `${normalizedBase}/${relativePath}`;
}
