"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import Link from "next/link";
import { getSession, formatDate } from "@/lib/auth";
import { venueApi, TmEvent, VenueEvent } from "@/lib/api";
import { ShowCard, ShowCardSkeleton } from "@/components/cards/ShowCard";
import { Button } from "@/components/ui/Button";

type AnyEvent = (TmEvent | VenueEvent) & { source: string; title: string; doors_time: string | null; stage_time?: string | null };

export default function TonightPage() {
  const router = useRouter();
  const session = getSession();
  const today = new Date().toISOString().split("T")[0];

  // Redirect if no session
  useEffect(() => {
    if (!session) router.replace("/login");
  }, [session, router]);

  // Fetch tonight's events near the venue
  const { data: nearbyData, isLoading: nearbyLoading, mutate: mutateNearby } = useSWR(
    session ? ["tonight-nearby", session.venueId] : null,
    () => venueApi.getTonightEvents(session!.venueId, session!.venueLat, session!.venueLng)
  );

  // Fetch venue's own custom events
  const { data: ownData, isLoading: ownLoading, mutate: mutateOwn } = useSWR(
    session ? ["venue-events", session.venueId] : null,
    () => venueApi.getEvents()
  );

  if (!session) return null;

  const isLoading = nearbyLoading || ownLoading;

  // Merge: nearby TM/JamBase events + own venue events for today
  const nearbyRaw = (nearbyData?.events ?? []) as unknown as TmEvent[];
  const nearbyEvents: AnyEvent[] = nearbyRaw.filter(
    (e) => (e.venue as TmEvent["venue"])?.id === session.venueId ||
            (e.venue as TmEvent["venue"])?.name?.toLowerCase().includes(session.venueName.toLowerCase().slice(0, 6))
  );

  const ownTonightEvents: AnyEvent[] = (ownData?.events ?? []).filter(
    (e: VenueEvent) => e.event_date === today && !e.is_cancelled
  ).map((e: VenueEvent) => ({ ...e, source: "venue" as const }));

  // Deduplicate by title (rough)
  const seenTitles = new Set<string>();
  const allTonight: AnyEvent[] = [];
  [...ownTonightEvents, ...nearbyEvents].forEach(e => {
    const key = e.title.toLowerCase().trim();
    if (!seenTitles.has(key)) {
      seenTitles.add(key);
      allTonight.push(e);
    }
  });

  const hasEvents = allTonight.length > 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-[#F0EDFF]">{session.venueName}</h1>
        <p className="text-sm text-[#9B93C8] mt-1">Tonight — {formatDate(today)}</p>
      </div>

      {/* Tonight's shows */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-[#F0EDFF]">Tonight's Shows</h2>
          <Link href="/events/new">
            <Button variant="secondary" size="sm">+ Add Show</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-3">
            <ShowCardSkeleton />
            <ShowCardSkeleton />
          </div>
        ) : !hasEvents ? (
          <div className="bg-[#0F0F1A] border border-[#1E1E35] rounded-xl p-8 text-center">
            <p className="text-[#9B93C8] text-sm">No shows tonight from your data sources.</p>
            <p className="text-[#5A5380] text-xs mt-1">Add a custom listing if there's a show not in Ticketmaster or JamBase.</p>
            <Link href="/events/new" className="mt-4 inline-block">
              <Button variant="primary" size="sm">+ Add Show</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-3">
            {allTonight.map(event => (
              <ShowCard
                key={event.id}
                event={{
                  id: event.id,
                  title: event.title,
                  doors_time: event.doors_time,
                  stage_time: (event as VenueEvent).stage_time ?? (event as TmEvent).estimated_stage_time ?? null,
                  source: event.source,
                  ticket_url: (event as TmEvent).ticket_url,
                }}
                isVenueOwned={event.source === "venue"}
                onUpdated={() => { mutateNearby(); mutateOwn(); }}
              />
            ))}
          </div>
        )}
      </section>

      {/* Community reports teaser */}
      <CommunityReportTeaser venueId={session.venueId} />
    </div>
  );
}

function CommunityReportTeaser({ venueId }: { venueId: string }) {
  // Placeholder — full community page handles this
  return (
    <section>
      <div className="bg-[#0F0F1A] border border-[#1E1E35] rounded-xl p-5 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[#F0EDFF]">Community Reports</h3>
          <p className="text-xs text-[#9B93C8] mt-0.5">Fan-submitted stage times waiting for your review</p>
        </div>
        <Link href="/community">
          <Button variant="secondary" size="sm">Review →</Button>
        </Link>
      </div>
    </section>
  );
}
