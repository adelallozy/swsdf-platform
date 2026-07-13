// src/v3/composables/apiClient.js

import { ref } from "vue";
import axios from "axios";

import { useErrorHandler } from "@/v3/composables/useErrorHandler.js";

const API_URL = import.meta.env.VITE_API_URL;
const SIGN_IN = import.meta.env.VITE_AUTHENTICATOR_SIGN_IN;
const SIGN_OUT = import.meta.env.VITE_AUTHENTICATOR_SIGN_OUT;
const VERIFY_TOKEN = import.meta.env.VITE_AUTHENTICATOR_VERIFY_TOKEN;

const USER_KEY = "user";
const TOKEN_KEY = "jwt_token"; // 'jwt';
const TOKEN_EXPIRY_KEY = "jwt_token_expiry"; // 'jwt_expiry';

const { capture } = useErrorHandler();

const user = ref(null);
const token = ref(null);
const isAuthenticated = ref(false);

let tokenExpiry = null;
let refreshTokenTimeout = null;

export const ERROR_TYPES = Object.freeze({
  VALIDATION: "VALIDATION_ERROR",
  CONFLICT: "CONFLICT_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  HTTP: "HTTP_ERROR",
  TIMEOUT: "TIMEOUT",
});

const acceptedLanguages = {
  ar: "ar-SA",
  en: "en-US",
};

const locale = localStorage.getItem("locale");

const loadUserFromLocalStorage = () => {
  const storedToken = localStorage.getItem(TOKEN_KEY);
  if (!storedToken) return;

  token.value = storedToken;

  const storedUser = localStorage.getItem(USER_KEY);
  if (storedUser) {
    user.value = JSON.parse(storedUser);
  }

  const storedTokenExpiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
  if (storedToken && storedTokenExpiry) {
    tokenExpiry = parseInt(storedTokenExpiry, 10);
    scheduleTokenRefresh();
  }
};

const saveUserToLocalStorage = () => {
  localStorage.setItem(USER_KEY, JSON.stringify(user.value));
  localStorage.setItem(TOKEN_KEY, token.value);
  localStorage.setItem(TOKEN_EXPIRY_KEY, tokenExpiry.toString());

  // this for swsdf web_app compatible
  localStorage.setItem("jwt_token", token.value);
  localStorage.setItem("jwt_token_expiry", tokenExpiry.toString());
  localStorage.setItem("user-data", JSON.stringify(user.value));
};

const clearLocalStorage = () => {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);

  localStorage.removeItem("jwt_token");
  localStorage.removeItem("jwt_token_expiry");
  localStorage.removeItem("user-data");
};

const signIn = async (credentials) => {
  try {
    const response = await fetch(API_URL + SIGN_IN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      credentials: "include", // Include cookies in the request
      body: JSON.stringify(credentials),
    });

    if (response.status == 204 || response.status == 204) {
      return null;
    }

    if (response.status == 404) {
      capture("API Request Failure", {
        context: "SignIn",
        meta: {
          where: "SignIn",
          endPoint: API_URL + SIGN_IN,
          status: response.statusText,
        },
      });
    }

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const data = await response.json();

    user.value = data.user;
    token.value = data.jwt;
    tokenExpiry = data.jwt_expiry * 1000;

    saveUserToLocalStorage();
    scheduleTokenRefresh();

    // axios should be removed from all the project ..
    axios.defaults.headers.common["Authorization"] = `Bearer ${data.jwt}`;

    isAuthenticated.value = true;
    return { success: true, userData: data }; // Return the user data and a success status
  } catch (error) {
    isAuthenticated.value = false;
    return { success: false, errorMessage: error.message };
  }
};

const signOut = async () => {
  try {
    await fetch(API_URL + SIGN_OUT, {
      method: "GET",
      credentials: "include", // Include cookies in the request
    });
  } catch (error) {
    console.error("Error during sign-out:", error);
  }

  user.value = null;
  token.value = null;
  tokenExpiry = null;

  isAuthenticated.value = false;

  clearLocalStorage();
  clearTimeout(refreshTokenTimeout);

  isAuthenticated.value = false;
};

const isTokenNearExpiry = () => {
  const now = Date.now();
  return tokenExpiry - now < 60000; // 1 minute before expiry
};

const refreshToken = async () => {
  try {
    const response = await fetch(API_URL + VERIFY_TOKEN, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.value}`,
        "Content-Type": "application/json",
        accept: "application/json",
      },
      credentials: "include", // Include cookies in the request
    });

    const data = await response.json();

    if (!data.token) {
      throw new Error("Invalid token");
    }

    token.value = data.jwt;
    tokenExpiry = data.jwt_expiry * 1000;

    saveUserToLocalStorage();
    scheduleTokenRefresh();

    isAuthenticated.value = true;
  } catch (error) {
    signOut();
    isAuthenticated.value = false;
  }
};

const scheduleTokenRefresh = () => {
  clearTimeout(refreshTokenTimeout);

  if (!tokenExpiry) return;

  const now = Date.now();
  const delay = tokenExpiry - now - 60000 * 2; // 2 minute before expiry

  refreshTokenTimeout = setTimeout(refreshToken, delay);
};

const handleUnauthorizedRequest = () => {
  signOut();
  isAuthenticated.value = false;
};

const apiRequest = async (url, method = "GET", options = {}) => {
  let headers = {};
  if (token.value) {
    headers.Authorization = `Bearer ${token.value}`;
  }

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  headers["Accept-Language"] = acceptedLanguages?.[locale] || locale || "en";
  headers["Accept"] = "application/json";

  options.headers = { ...headers, ...options.headers };
  options.credentials = "include";

  try {
    const response = await fetch(API_URL + url, { method, ...options });

    // Unauthorized
    if (response.status === 401) {
      handleUnauthorizedRequest();
      throw Object.assign(new Error("Unauthorized"), { status: 401 });
    }

    // No Content
    if (response.status === 204) return null;

    // Validation errors
    if (response.status === 422) {
      const errorData = await response.json();
      const validationErrors = {};

      for (const [key, value] of Object.entries(errorData.errors)) {
        validationErrors[key] = value;
      }

      throw Object.assign(new Error(ERROR_TYPES.VALIDATION), {
        validationErrors,
        status: 422,
      });
    }

    // Conflict
    if (response.status === 409) {
      throw Object.assign(new Error(ERROR_TYPES.CONFLICT), {
        conflict: true,
        status: 409,
      });
    }

    // Generic errors
    if (!response.ok) {
      const payload = {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        context: options.context || null,
      };

      let message = `HTTP error! status: ${response.statusText}`;
      try {
        const json = await response.json();
        payload.body = json;
        if (json?.message) message = json.message;
      } catch {
        payload.body = null;
      }

      throw Object.assign(new Error(message), { meta: payload });
    }

    // Parse response safely
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      return await response.json();
    }
    return await response.text();
  } catch (error) {
    throw error;
  }
};

const apiGet = async (url, options = {}) => {
  return apiRequest(url, "GET", options);
};

const apiPost = async (url, data = {}, options = {}) => {
  options.headers = { "Content-Type": "application/json", ...options.headers };
  // If there are files in the payload, do not stringify
  if (data instanceof FormData) {
    delete options.headers["Content-Type"]; // Let Fetch handle the Content-Type for FormData
    options.body = data;
  } else {
    options.body = JSON.stringify(data);
  }

  return apiRequest(url, "POST", options);
};

const apiPatch = async (url, data = {}, options = {}) => {
  options.headers = { "Content-Type": "application/json", ...options.headers };
  if (data instanceof FormData) {
    delete options.headers["Content-Type"]; // Let Fetch handle the Content-Type for FormData
    options.body = data;
  } else {
    options.body = JSON.stringify(data);
  }

  return apiRequest(url, "PATCH", options);
};

export default function useApiClient() {
  loadUserFromLocalStorage();
  scheduleTokenRefresh();

  return {
    signIn,
    signOut,
    isAuthenticated,
    user,
    token,
    apiGet,
    apiPost,
    apiPatch,
  };
}

// apiClient Documentation
// File: src/composables/apiClient.js

/**
 * This composable provides a centralized way to make authenticated API requests
 * using native Fetch API while managing JWT tokens, refresh schedules, and user state.
 *
 * It supports basic operations: GET, POST, PATCH. It also includes token management,
 * auto-refresh, and logout on 401 unauthorized responses.
 *
 * The implementation avoids tight coupling with any UI framework or library (such as Axios or PrimeVue).
 */

// ✅ IMPLEMENTED FEATURES
/**
 * 1. `signIn(credentials)`
 *     - Authenticates the user and stores token + user data + expiry.
 *     - Triggers background token refresh logic.
 *
 * 2. `signOut()`
 *     - Clears user session and local storage.
 *
 * 3. `refreshToken()`
 *     - Uses stored token to get a new token before expiry.
 *     - Automatically scheduled.
 *
 * 4. `apiRequest()`
 *     - Generic method to call APIs using fetch.
 *     - Injects Authorization headers and handles locale.
 *
 * 5. `apiGet(url)` / `apiPost(url, data)` / `apiPatch(url, data)`
 *     - Simple wrappers over `apiRequest()`.
 *
 * 6. Token + language headers handled globally.
 *
 * 7. JWT stored and managed securely in localStorage.
 */

// ⚠️ MISSING / FUTURE FUNCTIONALITIES
/**
 * 1. Error Normalization
 *    - Transform errors (server/validation/network) into structured format
 *    - Recommended for use with `useErrorHandler`
 *    - e.g. { type: 'validation', message: 'Invalid input', details: { ... } }
 *
 * 2. File Upload Progress
 *    - Support progress tracking (using `XMLHttpRequest` or `fetch` with streams)
 *    - Needed for large files or user feedback
 *
 * 3. Retry with Backoff
 *    - Auto retry on certain transient errors (e.g. 502, network timeout)
 *    - Configurable with exponential backoff
 *
 * 4. Timeout Support
 *    - Custom timeout per request using `AbortController`
 *    - Helpful to prevent hanging API calls
 *
 * 5. Cancelable Requests
 *    - Allow Vue components to cancel pending requests on unmount
 *
 * 6. Advanced Error Hooking
 *    - Option to register global hooks for logging/reporting
 *    - e.g. reportError(error, context)
 *
 * 7. Upload/Download Helpers
 *    - Download files as blobs, force download, or open in new tab
 *    - Upload with metadata support and progress UI
 *
 * 8. Bearer Token Injection as Interceptor (Optional Migration)
 *    - Move to Axios-like abstraction for cleaner middlewares
 *
 * 9. CSRF Protection
 *    - If required, implement cookie-based CSRF token support
 *
 * 10. Multi-User Profile Support (future scoped)
 *    - If multiple user contexts are supported later, refactor accordingly
 */

// 🔌 RECOMMENDED INTEGRATIONS
/**
 * - `useErrorHandler()` composable: to handle and display errors gracefully.
 * - Toast system or `ToastNotifier` component: to show API feedback to user.
 * - Vue Router navigation guards (if needed): to protect routes using `isAuthenticated`.
 */
