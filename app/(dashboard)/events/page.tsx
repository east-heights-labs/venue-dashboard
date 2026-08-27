"use client";
import useSWR from "swr";
import Link from "next/link";
import { venueApi, VenueEvent } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { formatDate, formatTime } from "@/lib/auth";
import { Badge } from "@/components/ui/Badge";

export default function EventsPage() {
  const { data, isLoading, mutate } = useSWR("venue-events-all", () => venueApi.getEvents());

  const upcoming = (data?.events ?? [])
    .filter((e: VenueEvent) => !e.is_cancelled && e.event_date >= new Date().toISOString().split("T")[0])
    .sort((a: VenueEvent, b: VenueEvent) => a.event_date.localeCompare(b.event_date));

  const past = (data?.events ?? [])
    .filter((e: VenueEvent) => e.event_date < new Date().toISOString().split("T")[0])
    .sort((a: VenueEvent, b: VenueEvent) => b.event_date.localeCompare(a.event_date));

  async function handleCancel(id: string, title: string) {
    if (!window.confirm(`Cancel "${title}"? This will mark the event as cancelled for fans.`)) return;
    await venueApi.updateEvent(id, { is_cancelled: true });
    mutate();
  }

  return (
    <div className="flex-1 overflow-y-auto p-7">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F0EDFF]">Events</h1>
          <p className="text-sm text-[#9B93C8] mt-1">Your custom event listings</p>
        </div>
        <Link href="/events/new">
          <Button variant="primary">+ New Event</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-[#0F0F1A] border border-[#1E1E35] rounded-xl p-4">
              <div className="skeleton h-5 w-48 mb-2" />
              <div className="skeleton h-3 w-32" />
            </div>
          ))}
        </div>
      ) : upcoming.length === 0 && past.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[#9B93C8] text-sm">No custom events yet.</p>
          <p className="text-[#5A5380] text-xs mt-1">Add shows that aren't in Ticketmaster or JamBase.</p>
          <Link href="/events/new" className="mt-4 inline-block">
            <Button variant="primary" size="sm">+ New Event</Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {upcoming.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-[#5A5380] uppercase tracking-widest mb-3">Upcoming</h2>
              <div className="flex flex-col gap-2">
                {upcoming.map((event: VenueEvent) => (
                  <EventRow key={event.id} event={event} onCancel={handleCancel} />
                ))}
              </div>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-[#5A5380] uppercase tracking-widest mb-3">Past</h2>
              <div className="flex flex-col gap-2 opacity-60">
                {past.slice(0, 10).map((event: VenueEvent) => (
                  <EventRow key={event.id} event={event} onCancel={handleCancel} past />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function EventRow({ event, onCancel, past }: { event: VenueEvent; onCancel: (id: string, title: string) => void; past?: boolean }) {
  return (
    <div className="bg-[#0F0F1A] border border-[#1E1E35] rounded-xl px-5 py-4 flex items-center gap-4 hover:border-[#2D2D50] transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#F0EDFF] truncate">{event.title}</p>
        <p className="text-xs text-[#9B93C8] mt-0.5">{formatDate(event.event_date)}</p>
      </div>

      <div className="shrink-0 text-right">
        {event.stage_time ? (
          <div>
            <Badge variant="confirmed" />
            <p className="text-xs text-[#9B93C8] mt-1">{formatTime(event.stage_time)}</p>
          </div>
        ) : (
          <Badge variant="unconfirmed" />
        )}
      </div>

      {!past && (
        <div className="shrink-0 flex gap-2">
          <Link href={`/events/${event.id}`}>
            <Button variant="secondary" size="sm">Edit</Button>
          </Link>
          <Button variant="danger" size="sm" onClick={() => onCancel(event.id, event.title)}>Cancel</Button>
        </div>
      )}
    </div>
  );
}
