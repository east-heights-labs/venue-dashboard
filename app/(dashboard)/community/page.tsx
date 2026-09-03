"use client";
import { useState } from "react";
import useSWR from "swr";
import { venueApi, CommunityReport } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { formatTime, formatDate } from "@/lib/auth";

export default function CommunityPage() {
  const [filter, setFilter] = useState<"pending" | "confirmed" | "flagged" | "all">("pending");

  const { data, isLoading, mutate } = useSWR(
    ["community-reports", filter],
    () => venueApi.getCommunityReports(filter)
  );

  const reports = data?.reports ?? [];

  async function handleConfirm(id: string) {
    await venueApi.confirmReport(id);
    mutate();
  }

  async function handleFlag(id: string) {
    await venueApi.flagReport(id);
    mutate();
  }

  return (
    <div className="flex-1 overflow-y-auto px-12 py-7 max-w-screen-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-[#F0EDFF]">Community Reports</h1>
        <p className="text-sm text-[#9B93C8] mt-1">
          Fan-submitted stage times — confirm to make them Venue Confirmed ✓
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 bg-[#0F0F1A] border border-[#1E1E35] rounded-lg p-1 w-fit">
        {(["pending", "confirmed", "flagged", "all"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${
              filter === f
                ? "bg-[#7C3AED] text-white"
                : "text-[#9B93C8] hover:text-[#F0EDFF]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-[#0F0F1A] border border-[#1E1E35] rounded-xl p-4">
              <div className="skeleton h-4 w-40 mb-2" />
              <div className="skeleton h-3 w-24" />
            </div>
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-[#0F0F1A] border border-[#1E1E35] rounded-xl p-8 text-center">
          <p className="text-sm text-[#9B93C8]">
            {filter === "pending" ? "No pending reports" : `No ${filter} reports`}
          </p>
          {filter === "pending" && (
            <p className="text-xs text-[#5A5380] mt-2 max-w-xs mx-auto">
              When fans submit stage times for your shows, they'll appear here.
              Confirming a report promotes it to a Venue Confirmed ✓ badge in the app.
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {reports.map((report: CommunityReport) => (
            <ReportRow
              key={report.id}
              report={report}
              onConfirm={handleConfirm}
              onFlag={handleFlag}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ReportRow({
  report,
  onConfirm,
  onFlag,
}: {
  report: CommunityReport;
  onConfirm: (id: string) => Promise<void>;
  onFlag: (id: string) => Promise<void>;
}) {
  const [acting, setActing] = useState(false);
  const [done, setDone] = useState(false);

  async function act(fn: (id: string) => Promise<void>) {
    setActing(true);
    await fn(report.id);
    setDone(true);
  }

  if (done) return null;

  const isPending = report.status === "pending";

  return (
    <div className={`
      bg-[#0F0F1A] border border-[#1E1E35] rounded-xl px-5 py-4
      flex items-center gap-4 transition-all duration-200
      ${acting ? "opacity-50" : "hover:border-[#2D2D50]"}
    `}>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#F0EDFF] truncate">{report.artist_name}</p>
        <div className="flex gap-3 mt-0.5 text-xs text-[#9B93C8]">
          {report.event_date && <span>{formatDate(report.event_date)}</span>}
          {report.stage_time && (
            <span className="font-mono text-[#F0EDFF]">{formatTime(report.stage_time)}</span>
          )}
        </div>
        {report.submitted_at && (
          <p className="text-[11px] text-[#5A5380] mt-0.5">
            Submitted {new Date(report.submitted_at).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Status badge for non-pending */}
      {!isPending && (
        <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
          report.status === "confirmed"
            ? "text-[#34D399] bg-[#065F46] border border-[#10B981]"
            : "text-[#EF4444] bg-[rgba(239,68,68,0.08)] border border-[#EF4444]/30"
        }`}>
          {report.status}
        </span>
      )}

      {/* Actions for pending */}
      {isPending && (
        <div className="shrink-0 flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => act(onConfirm)}
            disabled={acting}
            className="text-[#34D399] border-[#10B981]/30 hover:border-[#10B981]"
          >
            ✓ Confirm
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => act(onFlag)}
            disabled={acting}
          >
            ✗ Flag
          </Button>
        </div>
      )}
    </div>
  );
}
