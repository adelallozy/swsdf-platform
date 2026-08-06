// FILE: src/v3/services/httpClient.js
// TOKEN: HTTP-CLIENT-v3-2025-10-16-01

import { signOut, token } from "@/v3/composables/useAuth.js";
import { useErrorHandler } from "@/v3/composables/useErrorHandler.js";

const API_URL = import.meta.env.VITE_API_URL;

// Keep error shape & names stable (backward compatible)
export const ERROR_TYPES = Object.freeze({
  VALIDATION: "VALIDATION_ERROR",
  CONFLICT: "CONFLICT_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  HTTP: "HTTP_ERROR",
  TIMEOUT: "TIMEOUT",
});

const acceptedLanguages = { ar: "ar-SA", en: "en-US" };
const { capture } = useErrorHandler();

// ───────────────────────────────────────────────────────────
// Helpers (scoped to this file; not exported)
// ───────────────────────────────────────────────────────────
function getLocale() {
  const l = localStorage.getItem("locale");
  const defaultLocale = import.meta.env.VITE_DEFAULT_LOCALE || "ar";
  return acceptedLanguages?.[l] || l || defaultLocale;
}

async function readJsonSafe(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function makeHeaders(userHeaders = {}, body) {
  const base = {
    Accept: "application/json",
    "Accept-Language": getLocale(),
  };

  if (token?.value) base.Authorization = `Bearer ${token.value}`;

  // If body is JSON, set content-type unless caller already set it.
  // If body is FormData, let the browser set the boundary.
  const headers = { ...base, ...(userHeaders || {}) };
  const isFormData = body instanceof FormData;

  if (!isFormData && !headers["Content-Type"] && !headers["content-type"]) {
    headers["Content-Type"] = "application/json";
  }
  if (isFormData) {
    delete headers["Content-Type"];
    delete headers["content-type"];
  }
  return headers;
}

// ───────────────────────────────────────────────────────────
// Core request
// ───────────────────────────────────────────────────────────
async function apiRequest(url, method = "GET", options = {}) {
  const { body, headers: userHeaders, signal } = options;

  const init = {
    method,
    credentials: "include",
    headers: makeHeaders(userHeaders, body),
    signal,
  };

  // Let fetch handle FormData directly; JSON.stringify otherwise
  if (body !== undefined) {
    init.body = body instanceof FormData ? body : JSON.stringify(body);
  }

  try {
    const res = await fetch(API_URL + url, init);

    // 401 → sign out + bubble
    if (res.status === 401) {
      await signOut("unauthorized");
      const err = new Error("Unauthorized");
      err.name = ERROR_TYPES.UNAUTHORIZED;
      err.status = 401;
      throw err;
    }

    // No Content
    if (res.status === 204) return null;

    // 422 → validation shape (keep backward compatible)
    if (res.status === 422) {
      const json = (await readJsonSafe(res)) || {};
      const validationErrors = Object.fromEntries(
        Object.entries(json?.errors || {})
      );
      const err = new Error(ERROR_TYPES.VALIDATION);
      err.name = ERROR_TYPES.VALIDATION;
      err.status = 422;
      err.validationErrors = validationErrors; // <— callers rely on this
      err.payload = json; // <— also attach raw body for flexibility
      throw err;
    }

    // 409 → conflict; return full body so caller can redirect, etc.
    if (res.status === 409) {
      const json = (await readJsonSafe(res)) || {};
      const statusText = res.statusText || "";
      const err = new Error(
        json?.message || statusText || ERROR_TYPES.CONFLICT
      );
      err.name = ERROR_TYPES.CONFLICT;
      err.status = 409;
      err.conflict = true;
      err.statusText = statusText;

      // Preserve a generic payload container shape used elsewhere.
      err.payload = {
        ...(typeof json === "object" ? json : {}),
        statusText,
        body: typeof json === "object" ? json : { raw: json },
      };
      throw err;
    }

    // Other non-OK → generic HTTP error with payload
    if (!res.ok) {
      const payload = {
        status: res.status,
        statusText: res.statusText,
        url: res.url,
        context: options.context || null,
      };
      const json = await readJsonSafe(res);
      if (json) payload.body = json;

      let message = `HTTP error: ${res.status} ${res.statusText}`;
      if (json?.message) message = json.message;

      const err = new Error(message);
      err.name = ERROR_TYPES.HTTP;
      err.status = res.status;
      err.payload = payload;
      throw err;
    }

    // Success → return JSON or text
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) return await res.json();
    return await res.text();
  } catch (err) {
    // Abort/timeout → normalize name but bubble
    if (err?.name === "AbortError") {
      const e = new Error("Request aborted");
      e.name = ERROR_TYPES.TIMEOUT;
      e.status = 0;
      throw e;
    }

    // Only capture unexpected/network errors here (no status)
    // Expected HTTP errors (422/409/404/5xx) should be handled by the caller.
    if (!err?.status) {
      capture("API Request Error", { err, url, method });
    }
    throw err;
  }
}

// ───────────────────────────────────────────────────────────
// Exported helpers (backward compatible signatures)
// ───────────────────────────────────────────────────────────
export function apiGet(url, options = {}) {
  return apiRequest(url, "GET", options);
}

export function apiPost(url, data = {}, options = {}) {
  return apiRequest(url, "POST", {
    ...options,
    body: data,
  });
}

export function apiPatch(url, data = {}, options = {}) {
  return apiRequest(url, "PATCH", {
    ...options,
    body: data,
  });
}

export function apiPut(url, data = {}, options = {}) {
  return apiRequest(url, "PUT", {
    ...options,
    body: data,
  });
}

export function apiDelete(url, options = {}) {
  return apiRequest(url, "DELETE", options);
}
