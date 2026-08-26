/**
 * API client for OnStage backend.
 * Uses Authorization: Bearer token (stored in localStorage) for auth.
 * This avoids third-party cookie blocking in modern browsers.
 */

import { getToken, touchActivity } from "./auth";

const BACKEND = process.env.NEXT_PUBLIC_API_BASE ?? "https://ehl-backend-vercel.vercel.app";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string> ?? {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BACKEND}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(body?.error ?? res.statusText, res.status);
  }
  touchActivity(); // reset idle timer on every successful authenticated request
  return res.json();
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const venueApi = {
  /**
   * Login returns the JWT token in the response body (not just cookie).
   * We extract it and store in localStorage.
   */
  login: async (email: string, password: string): Promise<{ token: string }> => {
    const res = await fetch(`${BACKEND}/api/venue/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new ApiError(body?.error ?? res.statusText, res.status);
    }
    const data = await res.json();
    // Token comes from response body; fall back to extracting from cookie header won't work cross-origin
    if (!data.token) {
      throw new ApiError("No token in login response", 401);
    }
    return data;
  },

  logout: () => request("/api/venue/logout", { method: "POST" }),

  getInviteInfo: (token: string) =>
    request<{ email: string; venue_name: string; expires_at: string }>(
      `/api/venue/accept-invite?token=${token}`
    ),

  acceptInvite: async (token: string, password: string): Promise<{ token: string }> => {
    const res = await fetch(`${BACKEND}/api/venue/accept-invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new ApiError(body?.error ?? res.statusText, res.status);
    }
    const data = await res.json();
    if (!data.token) {
      throw new ApiError("No token in response", 401);
    }
    return data;
  },

  me: () =>
    request<{
      account: { id: string; email: string; role: string; last_login: string | null };
      venue: { id: string; name: string; city: string; lat: number; lng: number };
    }>("/api/venue/me"),

  // ---------------------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------------------

  getEvents: () =>
    request<{ events: VenueEvent[]; count: number }>("/api/venue/events"),

  createEvent: (data: CreateEventPayload) =>
    request<{ ok: boolean; event_id: string; created_at: string }>("/api/venue/events", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateEvent: (id: string, data: Partial<CreateEventPayload & { is_cancelled: boolean }>) =>
    request(`/api/venue/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteEvent: (id: string) =>
    request(`/api/venue/events/${id}`, { method: "DELETE" }),

  // ---------------------------------------------------------------------------
  // Community reports
  // ---------------------------------------------------------------------------

  getCommunityReports: (status = "pending") =>
    request<{ reports: CommunityReport[]; count: number }>(
      `/api/venue/community-reports?status=${status}`
    ),

  confirmReport: (id: string) =>
    request(`/api/venue/community-reports/${id}/confirm`, { method: "POST" }),

  flagReport: (id: string) =>
    request(`/api/venue/community-reports/${id}/flag`, { method: "POST" }),

  // ---------------------------------------------------------------------------
  // Followers
  // ---------------------------------------------------------------------------

  getFollowers: () =>
    request<{ total: number; daily: { date: string; count: number }[] }>(
      "/api/venue/followers"
    ),

  // ---------------------------------------------------------------------------
  // Tonight
  // ---------------------------------------------------------------------------

  getTonightEvents: (venueId: string, venueLat: number, venueLng: number) => {
    const today = new Date().toISOString().split("T")[0];
    return request<{ events: TmEvent[]; count: number }>(
      `/api/events?lat=${venueLat}&lng=${venueLng}&radius=0.5&date=${today}`
    );
  },
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface VenueEvent {
  id: string;
  title: string;
  event_date: string;
  doors_time: string | null;
  stage_time: string | null;
  ticket_url: string | null;
  price_min: number | null;
  price_max: number | null;
  description: string | null;
  image_url: string | null;
  is_cancelled: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateEventPayload {
  title: string;
  event_date: string;
  doors_time?: string;
  stage_time?: string;
  ticket_url?: string;
  price_min?: number;
  price_max?: number;
  description?: string;
  image_url?: string;
}

export interface CommunityReport {
  id: string;
  artist_name: string;
  event_date: string | null;
  stage_time: string | null;
  status: "pending" | "confirmed" | "flagged";
  submitted_at: string | null;
  event_id: string | null;
}

export interface TmEvent extends Record<string, unknown> {
  id: string;
  source: string;
  title: string;
  date: string;
  doors_time: string | null;
  estimated_stage_time?: string | null;
  status: string;
  venue: {
    id: string;
    name: string;
    lat: number;
    lng: number;
    city: string;
  };
  headliner: { id: string | null; name: string; uri: string | null };
  ticket_url: string | null;
  popularity: number;
  category: string;
}
