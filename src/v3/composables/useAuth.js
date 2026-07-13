// src/v3/composables/useAuth.js
// Vue 3 composable for authentication with reliable refresh in background tabs.
// - Reactive state: user, token, isAuthenticated
// - Methods: initAuth, signIn, signOut, refreshToken, maybeRefresh
// - Features: axios header sync for legacy code, localStorage persistence,
//             deadline-based refresh + wake-up checks (visibility/focus/online/storage),
//             duplicate refresh guard, optional drift detection watchdog.

import { ref } from "vue";
import axios from "axios";

import { useErrorHandler } from "@/v3/composables/useErrorHandler.js";
import { bus, AUTH_SIGNOUT } from "@/v3/lib/bus.js";

// ---- Environment ------------------------------------------------------------
const API_URL = import.meta.env.VITE_API_URL;
const SIGN_IN = import.meta.env.VITE_AUTHENTICATOR_SIGN_IN;
const SIGN_OUT = import.meta.env.VITE_AUTHENTICATOR_SIGN_OUT;
const VERIFY_TOKEN = import.meta.env.VITE_AUTHENTICATOR_VERIFY_TOKEN;

// ---- Storage Keys (keep compatibility) -------------------------------------
const USER_KEY = "user";
const TOKEN_KEY = "jwt";
const TOKEN_EXPIRY_KEY = "jwt_expiry";

const COMPAT_USER = "user-data"; // compatibility for swsdf web_app
const COMPAT_TOKEN = "jwt_token";
const COMPAT_EXPIRY = "jwt_token_expiry";

// ---- i18n header helper (optional) -----------------------------------------
const acceptedLanguages = { ar: "ar-SA", en: "en-US" };
const getLocale = () => {
  const l = localStorage.getItem("locale");
  return acceptedLanguages?.[l] || l || "en";
};

// ---- Reactive state ---------------------------------------------------------
export const user = ref(null);
export const token = ref(null);
export const isAuthenticated = ref(false);

// ---- Internals --------------------------------------------------------------
let tokenExpiry = null; // number (ms since epoch) or null
let refreshTimer = null; // setTimeout handle
let isRefreshing = false; // guard duplicate refreshes
let refreshPromise = null; // share in-flight refresh
let listenersBound = false; // bind global listeners once
let driftInterval = null; // optional drift watchdog

// Refresh window: refresh when <= 5 minutes remain
const REFRESH_WINDOW_MS = 300_000;
const MIN_SCHEDULE_MS = 5_000; // never schedule less than 5s
const ENABLE_DRIFT_WATCH = true;
const DRIFT_CHECK_MS = 60_000; // watchdog tick

const { capture } = useErrorHandler();

// ---- Helper: Parse expiry timestamp -----------------------------------------
/**
 * Parses expiry timestamp and ensures it's in milliseconds.
 * Handles both seconds (10 digits) and milliseconds (13 digits) formats.
 */
function parseExpiry(expiryValue) {
  if (!expiryValue) return null;

  const expiry = Number(expiryValue);

  // Invalid number
  if (isNaN(expiry) || expiry <= 0) return null;

  // If it's in seconds (10 digits or less), convert to milliseconds
  // If it's already in milliseconds (13 digits), use as-is
  // Threshold: 10000000000 = Sep 2001 in seconds, Jan 1970 in ms
  const result = expiry < 10000000000 ? expiry * 1000 : expiry;

  // console.log('🔢 Parsed expiry:', {
  //     input: expiryValue,
  //     parsed: expiry,
  //     output: result,
  //     outputDate: new Date(result).toISOString()
  // })

  return result;
}

// ---- Helper: Format time remaining ------------------------------------------
function formatTimeRemaining(ms) {
  if (ms <= 0) return "expired";
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

// ---- Axios legacy sync ------------------------------------------------------
function setAxiosAuthHeader(jwt) {
  if (jwt) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${jwt}`;
    // console.log('✅ Axios auth header set')
  } else {
    delete axios.defaults.headers.common["Authorization"];
    // console.log('🗑️ Axios auth header cleared')
  }
}

// ---- Persistence ------------------------------------------------------------
function saveAuthToStorage() {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user.value ?? null));
    localStorage.setItem(TOKEN_KEY, token.value ?? "");
    localStorage.setItem(TOKEN_EXPIRY_KEY, String(tokenExpiry ?? ""));

    // Compatibility keys for legacy support
    localStorage.setItem(COMPAT_TOKEN, token.value ?? "");
    localStorage.setItem(COMPAT_EXPIRY, String(tokenExpiry ?? ""));
    localStorage.setItem(COMPAT_USER, JSON.stringify(user.value ?? null));

    // console.log('💾 Auth saved to storage', {
    //     hasToken: !!token.value,
    //     hasUser: !!user.value,
    //     expiry: tokenExpiry ? new Date(tokenExpiry).toISOString() : null
    // })
  } catch (error) {
    capture("Storage Error", {
      context: "saveAuthToStorage",
      error: error.message,
    });
  }
}

function clearAuthStorage() {
  try {
    const keys = [
      USER_KEY,
      TOKEN_KEY,
      TOKEN_EXPIRY_KEY,
      COMPAT_TOKEN,
      COMPAT_EXPIRY,
      COMPAT_USER,
    ];

    for (const k of keys) {
      localStorage.removeItem(k);
    }

    // console.log('🗑️ Auth storage cleared')
  } catch (error) {
    capture("Storage Error", {
      context: "clearAuthStorage",
      error: error.message,
    });
  }
}

// ---- Scheduling -------------------------------------------------------------
function scheduleTokenRefresh() {
  clearTimeout(refreshTimer);

  if (!tokenExpiry) {
    // console.log('⏸️ No token expiry set, skipping refresh schedule')
    return;
  }

  const now = Date.now();
  const timeUntilExpiry = tokenExpiry - now;
  const delay = Math.max(MIN_SCHEDULE_MS, timeUntilExpiry - REFRESH_WINDOW_MS);

  // console.log('⏰ Token refresh scheduling:', {
  //     now: new Date(now).toISOString(),
  //     expiry: new Date(tokenExpiry).toISOString(),
  //     timeUntilExpiry: formatTimeRemaining(timeUntilExpiry),
  //     refreshWindow: formatTimeRemaining(REFRESH_WINDOW_MS),
  //     calculatedDelay: formatTimeRemaining(delay),
  //     willRefreshAt: new Date(now + delay).toISOString()
  // })

  if (delay > 0 && timeUntilExpiry > 0) {
    // console.log(`⏰ Scheduling token refresh in ${formatTimeRemaining(delay)}`)
    refreshTimer = setTimeout(refreshToken, delay);
  } else {
    // Token is about to expire or already expired
    console.log("⚠️ Token expired or about to expire, refreshing immediately");
    refreshToken();
  }
}

function cancelSchedules() {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
    console.log("⏹️ Refresh timer cancelled");
  }

  if (driftInterval) {
    clearInterval(driftInterval);
    driftInterval = null;
    console.log("⏹️ Drift watchdog stopped");
  }
}

// ---- Wake-up decisions ------------------------------------------------------
export async function maybeRefresh() {
  // console.log('🔄 maybeRefresh triggered')

  // No auth or no expiry? nothing to do
  if (!token.value || !tokenExpiry) {
    // console.log('⏭️ No token or expiry, skipping refresh')
    return;
  }

  const now = Date.now();
  const timeLeft = tokenExpiry - now;

  // console.log('🔍 Checking if refresh needed:', {
  //     timeLeft: formatTimeRemaining(timeLeft),
  //     refreshWindow: formatTimeRemaining(REFRESH_WINDOW_MS),
  //     needsRefresh: timeLeft <= REFRESH_WINDOW_MS
  // })

  // If already expired, or within refresh window, refresh now.
  if (timeLeft <= REFRESH_WINDOW_MS) {
    // console.log('🔄 Token within refresh window, refreshing now')
    try {
      await refreshToken();
    } catch (error) {
      capture("Refresh Error", {
        context: "maybeRefresh",
        error: error.message,
      });
      // console.error('❌ maybeRefresh failed:', error)
    }
  } else {
    // Otherwise, ensure we have a timer scheduled roughly for T-REFRESH_WINDOW
    // console.log('✅ Token still valid, ensuring refresh is scheduled')
    scheduleTokenRefresh();
  }
}

// ---- Event listeners (visibility, focus, online, storage, drift) -----------
function bindWakeupListeners() {
  if (listenersBound) {
    // console.log('👂 Wake-up listeners already bound')
    return;
  }

  listenersBound = true;
  // console.log('👂 Binding wake-up listeners')

  // Tab becomes visible
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      // console.log('👁️ Tab became visible')
      maybeRefresh();
    }
  });

  // Window focus
  window.addEventListener("focus", () => {
    // console.log('🎯 Window focused')
    maybeRefresh();
  });

  // Back online
  window.addEventListener("online", () => {
    // console.log('🌐 Back online')
    maybeRefresh();
  });

  // Cross-tab sync via storage
  window.addEventListener("storage", (e) => {
    if (
      e.key === TOKEN_KEY ||
      e.key === TOKEN_EXPIRY_KEY ||
      e.key === USER_KEY
    ) {
      // console.log('🔄 Storage event detected, syncing auth state', { key: e.key })
      // Re-hydrate from storage and attempt refresh if needed
      hydrateFromStorage();
      maybeRefresh();
    }
  });

  // Optional drift watchdog: detects long throttling / sleep
  if (ENABLE_DRIFT_WATCH) {
    let lastTick = Date.now();
    driftInterval = setInterval(() => {
      const now = Date.now();
      const drift = now - lastTick - DRIFT_CHECK_MS;
      lastTick = now;

      if (drift > 30_000) {
        // Significant drift: likely background throttling or system sleep
        // console.log('⏰ Significant time drift detected:', {
        //     drift: formatTimeRemaining(drift),
        //         message: 'Likely system sleep or background throttling'
        // })
        maybeRefresh();
      }
    }, DRIFT_CHECK_MS);

    // console.log('⏰ Drift watchdog started')
  }
}

// ---- Hydration --------------------------------------------------------------
export function hydrateFromStorage() {
  // console.log('💧 Hydrating auth state from storage')

  try {
    const t = localStorage.getItem(TOKEN_KEY);
    const u = localStorage.getItem(USER_KEY);
    const e = localStorage.getItem(TOKEN_EXPIRY_KEY);

    token.value = t || null;
    isAuthenticated.value = !!t;

    if (t) {
      setAxiosAuthHeader(t);
    }

    if (u) {
      try {
        user.value = JSON.parse(u);
      } catch (error) {
        console.error("❌ Failed to parse user data:", error);
        user.value = null;
        capture("Storage Error", {
          context: "hydrateFromStorage - parse user",
          error: error.message,
        });
      }
    } else {
      user.value = null;
    }

    tokenExpiry = e ? parseExpiry(e) : null;

    // console.log('✅ Hydration complete:', {
    //     hasToken: !!token.value,
    //     hasUser: !!user.value,
    //     expiry: tokenExpiry ? new Date(tokenExpiry).toISOString() : null,
    //     isAuthenticated: isAuthenticated.value
    // })
  } catch (error) {
    // console.error('❌ Hydration failed:', error)
    capture("Storage Error", {
      context: "hydrateFromStorage",
      error: error.message,
    });
    token.value = null;
    user.value = null;
    tokenExpiry = null;
    isAuthenticated.value = false;
  }
}

// ---- Public Methods ---------------------------------------------------------
export function initAuth() {
  // console.log('🚀 Initializing auth system')
  hydrateFromStorage();
  bindWakeupListeners();
  scheduleTokenRefresh();
  // console.log('✅ Auth system initialized')
}

export async function signIn(credentials) {
  // console.log('🔐 Attempting sign-in')

  try {
    const res = await fetch(API_URL + SIGN_IN, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
        "Accept-Language": getLocale(),
      },
      body: JSON.stringify(credentials),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "Unknown error");
      // console.error('❌ Sign-in failed:', {
      //     status: res.status,
      //         statusText: res.statusText,
      //             response: errorText
      // })
      capture("API Request Failure", {
        context: "SignIn",
        meta: {
          status: res.status,
          statusText: res.statusText,
          response: errorText,
        },
      });
      throw new Error(res.statusText || "Sign-in failed");
    }

    const data = await res.json();

    // console.log('📦 Sign-in response received:', {
    //     hasJwt: !!data?.jwt,
    //     hasUser: !!data?.user,
    //     hasExpiry: !!data?.jwt_expiry,
    //     keys: Object.keys(data)
    // })

    if (!data || !data.jwt) {
      // console.error('❌ Invalid sign-in response: missing jwt')
      capture("API Response Error", {
        context: "SignIn",
        meta: { message: "Invalid token in response" },
      });
      throw new Error("Invalid sign-in response");
    }

    // Extract data using the correct keys
    user.value = data.user ?? null;
    token.value = data.jwt ?? null;
    tokenExpiry = parseExpiry(data.jwt_expiry);

    // console.log('✅ Sign-in successful:', {
    //     hasUser: !!user.value,
    //     hasToken: !!token.value,
    //     expiry: tokenExpiry ? new Date(tokenExpiry).toISOString() : null,
    //     expiresIn: tokenExpiry ? formatTimeRemaining(tokenExpiry - Date.now()) : null
    // })

    saveAuthToStorage();
    isAuthenticated.value = !!token.value;
    setAxiosAuthHeader(token.value);
    scheduleTokenRefresh();

    return { success: true, userData: data };
  } catch (error) {
    // console.error('❌ Sign-in error:', error)
    capture("Sign-in Error", {
      context: "signIn",
      error: error.message,
    });

    isAuthenticated.value = false;
    setAxiosAuthHeader(null);
    return { success: false, errorMessage: error?.message || "Sign-in error" };
  }
}

export async function signOut(reason = "unknown") {
  // console.log('🚪 Signing out:', reason)

  try {
    await fetch(API_URL + SIGN_OUT, {
      method: "GET",
      credentials: "include",
      headers: {
        accept: "application/json",
        "Accept-Language": getLocale(),
      },
    });
    // console.log('✅ Sign-out API call successful')
  } catch (error) {
    // console.error('⚠️ Sign-out API call failed (continuing with local cleanup):', error)
    capture("Sign-out Error", {
      context: "signOut",
      error: error.message,
    });
    // best effort; still clear locally
  }

  cancelSchedules();
  user.value = null;
  token.value = null;
  tokenExpiry = null;
  isAuthenticated.value = false;
  setAxiosAuthHeader(null);
  clearAuthStorage();

  // console.log('✅ Sign-out complete')

  // Notify the app to handle navigation/UI
  bus.emit(AUTH_SIGNOUT, { reason });
}

export async function refreshToken() {
  if (isRefreshing && refreshPromise) {
    // console.log('⏳ Refresh already in progress, waiting...')
    return refreshPromise;
  }

  // console.log('🔄 Starting token refresh')
  isRefreshing = true;

  refreshPromise = (async () => {
    try {
      // If we truly have no token/expiry, sign out
      if (!token.value || !tokenExpiry) {
        console.error("❌ No token or expiry to refresh");
        throw new Error("No token to refresh");
      }

      const res = await fetch(API_URL + VERIFY_TOKEN, {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token.value}`,
          "Content-Type": "application/json",
          accept: "application/json",
          "Accept-Language": getLocale(),
        },
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => "Unknown error");
        console.error("❌ Token refresh failed:", {
          status: res.status,
          statusText: res.statusText,
          response: errorText,
        });
        capture("Token Refresh Error", {
          context: "refreshToken",
          meta: {
            status: res.status,
            statusText: res.statusText,
            response: errorText,
          },
        });
        throw new Error(`Token refresh failed: ${res.status}`);
      }

      const data = await res.json();

      // console.log('📦 Refresh response received:', {
      //     hasJwt: !!data?.jwt,
      //     hasUser: !!data?.user,
      //     hasExpiry: !!data?.jwt_expiry,
      //     keys: Object.keys(data)
      // })

      if (!data?.jwt) {
        console.error("❌ Invalid refresh response: missing jwt");
        capture("API Response Error", {
          context: "refreshToken",
          meta: { message: "Invalid token in response" },
        });
        throw new Error("Invalid token payload");
      }

      // Extract data using the correct keys
      user.value = data.user ?? null;
      token.value = data.jwt ?? null;
      tokenExpiry = parseExpiry(data.jwt_expiry);

      // console.log('✅ Token refreshed successfully:', {
      //     expiry: tokenExpiry ? new Date(tokenExpiry).toISOString() : null,
      //     expiresIn: tokenExpiry ? formatTimeRemaining(tokenExpiry - Date.now()) : null
      // })

      setAxiosAuthHeader(token.value);
      saveAuthToStorage();
      isAuthenticated.value = true;
      scheduleTokenRefresh();

      return true;
    } catch (error) {
      console.error("❌ Token refresh error:", error);
      capture("Token Refresh Error", {
        context: "refreshToken",
        error: error.message,
      });
      // Hard sign out on refresh failure
      await signOut("refresh_failed");
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ---- Utility: manual token injection (rarely needed) ------------------------
// If you must set token/user programmatically (SSO callback etc.)
export function setAuthManually({ jwt, jwt_expiry, userData }) {
  // console.log('🔧 Setting auth manually')

  token.value = jwt ?? null;
  tokenExpiry = parseExpiry(jwt_expiry);
  user.value = userData ?? null;
  isAuthenticated.value = !!jwt;

  setAxiosAuthHeader(token.value);
  saveAuthToStorage();
  scheduleTokenRefresh();

  // console.log('✅ Auth set manually:', {
  //     hasToken: !!token.value,
  //     hasUser: !!user.value,
  //     expiry: tokenExpiry ? new Date(tokenExpiry).toISOString() : null
  // })
}
