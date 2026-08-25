/**
 * Auth helpers — client-side session management.
 * JWT stored in localStorage (not cookie) to avoid third-party cookie blocking.
 * Sent as Authorization: Bearer header on every API request.
 */

export interface VenueSession {
  accountId: string;
  venueId: string;
  venueName: string;
  venueCity: string;
  venueLat: number;
  venueLng: number;
  email: string;
  role: string;
}

const SESSION_KEY = "onstage_venue_session";
const TOKEN_KEY = "onstage_venue_token";

export function saveSession(session: VenueSession) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getSession(): VenueSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

export function isLoggedIn(): boolean {
  return getSession() !== null;
}

export function saveToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function formatTime(timeStr: string | null): string {
  if (!timeStr) return "—";
  const [h, m] = timeStr.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}
