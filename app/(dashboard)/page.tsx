"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import Link from "next/link";
import { getSession, formatDate, formatTime } from "@/lib/auth";
import { venueApi, TmEvent, VenueEvent, CommunityReport } from "@/lib/api";
import { ShowCard, ShowCardSkeleton } from "@/components/cards/ShowCard";
import { Topbar } from "@/components/layout/Topbar";

type AnyEvent = (TmEvent | VenueEvent) & { source: string; title: string; doors_time: string | null; stage_time?: string | null };

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export default function TonightPage() {
  const router = useRouter();
  const [session, setSession] = useState<ReturnType<typeof getSession>>(null);
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);

  useEffect(() => {
    const s = getSession();
    if (!s) router.replace("/login");
    else setSession(s);
  }, [router]);

  // Fetch events near venue for selected date
  const { data: nearbyData, isLoading: nearbyLoading, mutate: mutateNearby } = useSWR(
    session ? ["tonight-nearby", session.venueId, selectedDate] : null,
    () => {
      const d = new Date(selectedDate + "T12:00:00");
      const dateStr = d.toISOString().split("T")[0];
      return fetch(
        `${process.env.NEXT_PUBLIC_API_BASE ?? "https://ehl-backend-vercel.vercel.app"}/api/events?lat=${session!.venueLat}&lng=${session!.venueLng}&radius=0.5&date=${dateStr}`
      ).then(r => r.json());
    }
  );

  // Venue's own custom events
  const { data: ownData, isLoading: ownLoading, mutate: mutateOwn } = useSWR(
    session ? ["venue-events", session.venueId] : null,
    () => venueApi.getEvents()
  );

  // Followers
  const { data: followerData } = useSWR(
    session ? "followers" : null,
    () => venueApi.getFollowers(),
    { revalidateOnFocus: false }
  );

  // Community reports
  const { data: reportsData, mutate: mutateReports } = useSWR(
    session ? "community-pending" : null,
    () => venueApi.getCommunityReports("pending"),
    { refreshInterval: 60000 }
  );

  if (!session) return null;

  const isLoading = nearbyLoading || ownLoading;

  // Merge events for selected date
  const nearbyRaw = (nearbyData?.events ?? []) as TmEvent[];
  const venueNearby: AnyEvent[] = nearbyRaw.filter(e =>
    (e.venue as TmEvent["venue"])?.id === session.venueId ||
    (e.venue as TmEvent["venue"])?.name?.toLowerCase().includes(session.venueName.toLowerCase().slice(0, 6))
  );

  const ownForDate: AnyEvent[] = (ownData?.events ?? []).filter(
    (e: VenueEvent) => e.event_date === selectedDate && !e.is_cancelled
  ).map((e: VenueEvent) => ({ ...e, source: "venue" as const }));

  const seenTitles = new Set<string>();
  const allShows: AnyEvent[] = [];
  [...ownForDate, ...venueNearby].forEach(e => {
    const key = e.title.toLowerCase().trim();
    if (!seenTitles.has(key)) { seenTitles.add(key); allShows.push(e); }
  });

  // Stats
  const confirmedCount = allShows.filter(e => e.source === "venue" || (e as TmEvent).estimated_stage_time).length;
  const pendingStageTime = allShows.filter(e => e.source !== "venue" && !(e as TmEvent).estimated_stage_time).length;
  const followerTotal = followerData?.total ?? 0;
  const followerWeekly = followerData?.daily?.slice(-7).reduce((s, d) => s + d.count, 0) ?? 0;
  const pendingReports = reportsData?.reports ?? [];

  const isToday = selectedDate === today;

  async function handleConfirmReport(id: string) {
    await venueApi.confirmReport(id);
    mutateReports();
  }
  async function handleFlagReport(id: string) {
    await venueApi.flagReport(id);
    mutateReports();
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Topbar
        title={isToday ? "Tonight" : fmtDate(selectedDate)}
        subtitle={isToday ? fmtDate(today) : undefined}
        actions={
          <>
            <button
              onClick={() => setSelectedDate(d => addDays(d, -1))}
              className="px-3 py-1.5 rounded-lg text-[12px] font-medium text-[#9B93C8] border border-[#1E1E35] hover:border-[#7C3AED]/40 hover:text-[#F0EDFF] transition-all"
            >
              ← Previous
            </button>
            {selectedDate !== today && (
              <button
                onClick={() => setSelectedDate(today)}
                className="px-3 py-1.5 rounded-lg text-[12px] font-medium text-[#7C3AED] border border-[#7C3AED]/30 hover:bg-[rgba(124,58,237,0.08)] transition-all"
              >
                Today
              </button>
            )}
            <button
              onClick={() => setSelectedDate(d => addDays(d, 1))}
              className="px-3 py-1.5 rounded-lg text-[12px] font-medium text-[#9B93C8] border border-[#1E1E35] hover:border-[#7C3AED]/40 hover:text-[#F0EDFF] transition-all"
            >
              Next →
            </button>
            <Link href="/events/new">
              <button className="px-4 py-1.5 rounded-lg text-[12px] font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] text-white transition-colors">
                + Add Show
              </button>
            </Link>
          </>
        }
      />

      <div className="flex-1 overflow-y-auto">
        <div className="px-10 py-6">

          {/* ── Stat cards ── */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <StatCard
              label="Tonight's Shows"
              value={isLoading ? "—" : String(allShows.length)}
              sub={isLoading ? "" : `${confirmedCount} confirmed · ${pendingStageTime} pending`}
            />
            <StatCard
              label="Followers"
              value={String(followerTotal)}
              sub={followerWeekly > 0 ? `↑ ${followerWeekly} this week` : "No new this week"}
              valueColor="text-[#7C3AED]"
              subColor={followerWeekly > 0 ? "text-[#22C55E]" : undefined}
            />
            <StatCard
              label="Fan Reports"
              value={String(pendingReports.length)}
              sub="Pending your review"
              valueColor={pendingReports.length > 0 ? "text-[#F59E0B]" : undefined}
              href="/community"
            />
            <StatCard
              label="Stage Times Set"
              value={isLoading ? "—" : `${confirmedCount}/${allShows.length}`}
              sub={pendingStageTime > 0 ? `${pendingStageTime} still using estimate` : "All times confirmed"}
            />
          </div>

          {/* ── Two-column layout ── */}
          <div className="grid grid-cols-[1fr_320px] gap-4 items-start">

            {/* Left: shows list */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[11px] font-bold text-[#5A5380] uppercase tracking-wider">Shows</h2>
              </div>

              {isLoading ? (
                <div className="flex flex-col gap-2">
                  <ShowCardSkeleton /><ShowCardSkeleton /><ShowCardSkeleton />
                </div>
              ) : allShows.length === 0 ? (
                <div className="bg-[#0F0F1A] border border-[#1E1E35] rounded-xl p-10 text-center">
                  <p className="text-[#9B93C8] text-sm">No shows for this date.</p>
                  <p className="text-[#5A5380] text-xs mt-1">Add a custom listing if there's a show not in Ticketmaster or JamBase.</p>
                  <Link href="/events/new" className="mt-4 inline-block">
                    <button className="px-4 py-2 rounded-lg bg-[#7C3AED] text-white text-[12px] font-semibold hover:bg-[#6D28D9] transition-colors">
                      + Add Show
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {allShows.map(event => (
                    <ShowCard
                      key={event.id}
                      event={{
                        id: event.id,
                        title: event.title,
                        doors_time: event.doors_time,
                        stage_time: (event as VenueEvent).stage_time ?? (event as TmEvent).estimated_stage_time ?? null,
                        source: event.source,
                        ticket_url: (event as TmEvent).ticket_url,
                        event_date: selectedDate,
                      }}
                      isVenueOwned={event.source === "venue"}
                      venueId={session.venueId}
                      onUpdated={() => { mutateNearby(); mutateOwn(); }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right: panels */}
            <div className="flex flex-col gap-3">

              {/* Fan reports panel */}
              <div className="bg-[#0F0F1A] border border-[#1E1E35] rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#1E1E35]">
                  <span className="text-[11px] font-bold text-[#F0EDFF] uppercase tracking-wider">Fan Reports</span>
                  <Link href="/community" className="text-[11px] text-[#7C3AED] hover:text-[#A78BFA] transition-colors">
                    View all →
                  </Link>
                </div>
                {pendingReports.length === 0 ? (
                  <div className="px-4 py-6 text-center text-[12px] text-[#5A5380]">No pending reports</div>
                ) : (
                  pendingReports.slice(0, 5).map((r: CommunityReport) => (
                    <div key={r.id} className="flex items-center gap-3 px-4 py-3 border-b border-[#1E1E3520] last:border-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-semibold text-[#F0EDFF] truncate">{r.artist_name}</div>
                        <div className="text-[11px] text-[#9B93C8]">
                          {r.stage_time ? `Fan says: ${formatTime(r.stage_time)} stage` : "Time reported"}
                        </div>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          onClick={() => handleConfirmReport(r.id)}
                          className="text-[10px] font-bold px-2 py-1 rounded bg-[rgba(34,197,94,0.12)] text-[#22C55E] hover:bg-[rgba(34,197,94,0.2)] transition-colors"
                        >✓</button>
                        <button
                          onClick={() => handleFlagReport(r.id)}
                          className="text-[10px] font-bold px-2 py-1 rounded bg-[rgba(239,68,68,0.10)] text-[#EF4444] hover:bg-[rgba(239,68,68,0.18)] transition-colors"
                        >✕</button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Follower trend panel */}
              <div className="bg-[#0F0F1A] border border-[#1E1E35] rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#1E1E35]">
                  <span className="text-[11px] font-bold text-[#F0EDFF] uppercase tracking-wider">Followers (30d)</span>
                  <Link href="/followers" className="text-[11px] text-[#7C3AED] hover:text-[#A78BFA] transition-colors">
                    Details →
                  </Link>
                </div>
                <FollowerSparkline daily={followerData?.daily ?? []} />
              </div>

              {/* QR teaser panel */}
              <div className="bg-[#0F0F1A] border border-[#1E1E35] rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#1E1E35]">
                  <span className="text-[11px] font-bold text-[#F0EDFF] uppercase tracking-wider">Your QR Code</span>
                  <Link href="/qr" className="text-[11px] text-[#7C3AED] hover:text-[#A78BFA] transition-colors">
                    Download →
                  </Link>
                </div>
                <div className="flex items-center gap-3 px-4 py-3">
                  <QRMock />
                  <p className="text-[11px] text-[#9B93C8] leading-relaxed">
                    Post at your venue. Fans scan to follow and get stage time alerts.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Subcomponents ────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, valueColor, subColor, href
}: {
  label: string;
  value: string;
  sub?: string;
  valueColor?: string;
  subColor?: string;
  href?: string;
}) {
  const inner = (
    <div className={`
      bg-[#0F0F1A] border border-[#1E1E35] rounded-xl p-4 flex flex-col gap-1
      transition-colors duration-150
      ${href ? "cursor-pointer hover:border-[#7C3AED]/30" : ""}
    `}>
      <div className="text-[10px] font-bold text-[#5A5380] uppercase tracking-wider">{label}</div>
      <div className={`text-[26px] font-extrabold leading-none mt-1 ${valueColor ?? "text-[#F0EDFF]"}`}>{value}</div>
      {sub && <div className={`text-[11px] mt-0.5 ${subColor ?? "text-[#9B93C8]"}`}>{sub}</div>}
    </div>
  );
  if (href) return <Link href={href}>{inner}</Link>;
  return inner;
}

function FollowerSparkline({ daily }: { daily: { date: string; count: number }[] }) {
  if (daily.length === 0) {
    return (
      <div className="px-4 py-5 text-center text-[11px] text-[#5A5380]">No follower data yet</div>
    );
  }
  // Show last 5 weekly buckets — group into 5 chunks
  const chunkSize = Math.max(1, Math.floor(daily.length / 5));
  const buckets: { label: string; count: number }[] = [];
  for (let i = 0; i < 5; i++) {
    const chunk = daily.slice(i * chunkSize, (i + 1) * chunkSize);
    buckets.push({
      label: chunk[0]?.date?.slice(5) ?? "",
      count: chunk.reduce((s, d) => s + d.count, 0),
    });
  }
  const max = Math.max(...buckets.map(b => b.count), 1);
  const cumulative = daily.reduce((s, d) => s + d.count, 0);

  return (
    <div className="px-4 py-3 flex flex-col gap-2">
      {buckets.map((b, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="text-[10px] text-[#5A5380] w-10 text-right shrink-0">{b.label}</div>
          <div className="flex-1 h-1.5 bg-[#1E1E35] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#7C3AED] rounded-full transition-all"
              style={{ width: `${Math.max(4, (b.count / max) * 100)}%` }}
            />
          </div>
          <div className={`text-[11px] w-8 shrink-0 text-right ${i === buckets.length - 1 ? "font-bold text-[#7C3AED]" : "text-[#9B93C8]"}`}>
            +{b.count}
          </div>
        </div>
      ))}
      <div className="text-[10px] text-[#5A5380] mt-1 text-right">{cumulative} total new this period</div>
    </div>
  );
}

function QRMock() {
  const dots = [1,0,1,0,0,1,1,0,1,0,1,0,1,0,0,1,0,1,1,0,1,0,0,0,1];
  return (
    <div className="w-12 h-12 bg-[#1E1E35] rounded-lg p-1.5 grid grid-cols-5 gap-0.5 shrink-0">
      {dots.map((d, i) => (
        <div key={i} className={`rounded-[1px] ${d ? "bg-[#7C3AED]" : "bg-transparent"}`} />
      ))}
    </div>
  );
}
