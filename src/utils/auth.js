export function getToken() {
  try {
    return localStorage.getItem("token") || "";
  } catch {
    return "";
  }
}

function safeJsonParse(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function base64UrlDecode(str) {
  try {
    const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "===".slice((base64.length + 3) % 4);
    const decoded = atob(padded);
    return decodeURIComponent(
      decoded
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
  } catch {
    return "";
  }
}

export function decodeJwt(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  const payloadStr = base64UrlDecode(parts[1]);
  return safeJsonParse(payloadStr);
}

export function getStoredAuthUser() {
  try {
    return safeJsonParse(localStorage.getItem("auth_user"));
  } catch {
    return null;
  }
}

/** Merge fields into `auth_user` (e.g. after profile mode switch). */
export function mergeStoredAuthUser(partial) {
  if (!partial || typeof partial !== "object") return;
  const cur = getStoredAuthUser() || {};
  try {
    localStorage.setItem("auth_user", JSON.stringify({ ...cur, ...partial }));
  } catch {
    // ignore storage errors
  }
}

export function resolveAuthUserId() {
  const stored = getStoredAuthUser();
  const storedId =
    stored?.id || stored?._id || stored?.userId || stored?.user?._id || stored?.user?.id;
  if (storedId) return String(storedId);

  const token = getToken();
  const payload = decodeJwt(token);
  const jwtId =
    payload?.id ||
    payload?._id ||
    payload?.userId ||
    payload?.uid ||
    payload?.sub;
  if (jwtId) return String(jwtId);

  return "";
}

const GUEST_STORAGE_KEY = "chatprox_guest";

export function getGuestProfile() {
  try {
    return safeJsonParse(localStorage.getItem(GUEST_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function isGuest() {
  if (isLoggedIn()) return false;
  const guest = getGuestProfile();
  return Boolean(guest && guest.active);
}

export function enterAsGuest(profile = {}) {
  const payload = {
    active: true,
    name: String(profile.name || "Guest").trim() || "Guest",
    gender: profile.gender || "",
    age: profile.age || "",
    city: profile.city || "",
    startedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore storage errors
  }
  return payload;
}

export function clearGuest() {
  try {
    localStorage.removeItem(GUEST_STORAGE_KEY);
  } catch {
    // ignore storage errors
  }
}

export function isLoggedIn() {
  return Boolean(getToken());
}

/** Logged-in member or browsing guest. */
export function canBrowseApp() {
  return isLoggedIn() || isGuest();
}

/** Features that send, pay, or manage an account. */
export function canUseMemberFeatures() {
  return isLoggedIn();
}

export function guestAllowedPath(pathname = "") {
  const path = String(pathname || "");
  return path === "/live" || path.startsWith("/live/");
}

/** `Authorization: Bearer …` for API calls (empty object if no token). */
export function bearerAuthHeader() {
  const token = getToken();
  if (!token) return {};
  const value = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  return { Authorization: value };
}

export function authJsonHeaders() {
  return { ...bearerAuthHeader(), "Content-Type": "application/json" };
}

/**
 * Absolute in-app path (no user id in URL).
 * @example appRoute("live/abc") => "/live/abc"
 */
export function appRoute(subPath = "") {
  const clean = String(subPath || "").replace(/^\/+/, "");
  return clean ? `/${clean}` : "/";
}

