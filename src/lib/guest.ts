const GUEST_ID_KEY = "socal_guest_id";
const OFFER_AT_KEY = "socal_offer_at";
export const OFFER_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
const YEAR_SECONDS = 60 * 60 * 24 * 365;

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function readCookie(name: string) {
  if (typeof document === "undefined") return "";
  const match = document.cookie.split("; ").find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : "";
}

function writeCookie(name: string, value: string, maxAge = YEAR_SECONDS) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function getGuestId() {
  if (typeof window === "undefined") return "";
  const fromStorage = localStorage.getItem(GUEST_ID_KEY) || "";
  const fromCookie = readCookie(GUEST_ID_KEY);
  const existing = isUuid(fromStorage) ? fromStorage : isUuid(fromCookie) ? fromCookie : "";
  const id = existing || crypto.randomUUID();
  if (id !== fromStorage) localStorage.setItem(GUEST_ID_KEY, id);
  if (id !== fromCookie) writeCookie(GUEST_ID_KEY, id);
  return id;
}

export function markOfferSubmitted() {
  if (typeof window === "undefined") return;
  const at = String(Date.now());
  localStorage.setItem(OFFER_AT_KEY, at);
  writeCookie(OFFER_AT_KEY, at);
}

export function hasRecentOffer() {
  if (typeof window === "undefined") return false;
  const raw = localStorage.getItem(OFFER_AT_KEY) || readCookie(OFFER_AT_KEY);
  const at = Number(raw);
  if (!Number.isFinite(at) || at <= 0) return false;
  return Date.now() - at < OFFER_WINDOW_MS;
}
