/**
 * API client for OnStage backend.
 * All requests go through /api/* (Next.js proxy) to avoid CORS + keep credentials server-side.
 */

const BACKEND = process.env.NEXT_PUBLIC_API_BASE ?? "https://ehl-backend-vercel.vercel.app";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BACKEND}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(body?.error ?? res.statusText, res.status);
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const venueApi = {
  login: (email: string, password: string) =>
    request("/api/venue/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  logout: () => request("/api/venue/logout", { method: "POST" }),

  getInviteInfo: (token: string) =>
    request<{ email: string; venue_name: string; expires_at: string }>(
      `/api/venue/accept-invite?token=${token}`
    ),

  acceptInvite: (token: string, password: string) =>
    request("/api/venue/accept-invite", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    }),

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
  // Tonight (venue-scoped events for today from main events endpoint)
  // ---------------------------------------------------------------------------

  getTonightEvents: (venueId: string, venueLat: number, venueLng: number) => {
    const today = new Date().toISOString().split("T")[0];
    return request<{ events: Event[]; count: number }>(
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
