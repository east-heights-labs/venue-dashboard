"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Toast } from "@/components/ui/Toast";
import { venueApi } from "@/lib/api";
import { formatTime } from "@/lib/auth";

interface ShowCardProps {
  event: {
    id: string;
    title: string;
    doors_time: string | null;
    stage_time: string | null;
    source: "venue" | "ticketmaster" | "jambase" | string;
    ticket_url?: string | null;
    event_date?: string | null;
  };
  isVenueOwned?: boolean;
  venueId?: string;
  onUpdated?: () => void;
}

interface StageTimeForm {
  stage_time: string;
  doors_time: string;
}

export function ShowCard({ event, isVenueOwned, venueId, onUpdated }: ShowCardProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [currentStageTime, setCurrentStageTime] = useState(event.stage_time);
  const [currentDoorsTime, setCurrentDoorsTime] = useState(event.doors_time);

  const isConfirmed = event.source === "venue" || saved;
  const hasStageTime = Boolean(currentStageTime);

  const { register, handleSubmit } = useForm<StageTimeForm>({
    defaultValues: {
      stage_time: event.stage_time?.slice(0, 5) ?? "",
      doors_time: event.doors_time?.slice(0, 5) ?? "",
    },
  });

  const sourceLabel =
    event.source === "ticketmaster" ? "Ticketmaster"
    : event.source === "jambase" ? "JamBase"
    : "Custom listing";

  async function onSave(data: StageTimeForm) {
    setSaving(true);
    setSaveError("");
    try {
      if (isVenueOwned) {
        await venueApi.updateEvent(event.id, {
          stage_time: data.stage_time || undefined,
          doors_time: data.doors_time || undefined,
        });
      } else {
        if (!venueId) throw new Error("venueId required for stage report");
        await venueApi.submitVenueStageReport(venueId, {
          artist_name: event.title,
          stage_time: data.stage_time,
          doors_time: data.doors_time || undefined,
          event_id: event.id,
          event_date: event.event_date ?? undefined,
        });
      }
      setCurrentStageTime(data.stage_time);
      setCurrentDoorsTime(data.doors_time || currentDoorsTime);
      setSaved(true);
      setEditing(false);
      setShowToast(true);
      onUpdated?.();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Save failed — try again");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className={`
        bg-[#0F0F1A] border rounded-xl transition-all duration-150
        ${editing ? "border-[#7C3AED]/40" : "border-[#1E1E35] hover:border-[#2A2A45]"}
      `}>

        {!editing ? (
          /* ── Collapsed / display row ── */
          <div className="flex items-center gap-4 px-4 py-3.5">

            {/* Time block */}
            <div className="w-14 shrink-0 text-center">
              {hasStageTime ? (
                <>
                  <div className="text-[15px] font-bold text-[#F0EDFF] leading-tight tabular-nums">
                    {formatTime(currentStageTime!)}
                  </div>
                  <div className="text-[9px] font-semibold uppercase tracking-wider text-[#5A5380] mt-0.5">
                    on stage
                  </div>
                </>
              ) : (
                <>
                  <div className="text-[14px] font-bold text-[#F59E0B] leading-tight">
                    {currentDoorsTime ? formatTime(currentDoorsTime) : "--:--"}
                  </div>
                  <div className="text-[9px] font-semibold uppercase tracking-wider text-[#5A5380] mt-0.5">
                    {currentDoorsTime ? "doors" : "no time"}
                  </div>
                </>
              )}
            </div>

            {/* Vertical divider */}
            <div className="w-px self-stretch bg-[#1E1E35] shrink-0" />

            {/* Show info */}
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-bold text-[#F0EDFF] truncate leading-tight">
                {event.title}
              </div>
              <div className="text-[11px] text-[#9B93C8] mt-0.5 truncate">
                {currentDoorsTime ? `Doors ${formatTime(currentDoorsTime)}` : "Doors TBD"}
                {" · "}
                {sourceLabel}
              </div>
            </div>

            {/* Status badge */}
            {isConfirmed ? (
              <span className="shrink-0 text-[10px] font-bold px-2 py-1 rounded-full bg-[rgba(124,58,237,0.12)] text-[#A78BFA] border border-[rgba(124,58,237,0.25)]">
                ✓ Confirmed
              </span>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="shrink-0 text-[10px] font-bold px-2 py-1 rounded-full bg-[rgba(245,158,11,0.12)] text-[#F59E0B] border border-[rgba(245,158,11,0.25)] hover:bg-[rgba(245,158,11,0.2)] transition-colors cursor-pointer"
              >
                Set time →
              </button>
            )}

            {/* Edit / more actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setEditing(true)}
                title="Edit stage time"
                className="w-7 h-7 flex items-center justify-center rounded-md bg-[#16162A] border border-[#1E1E35] text-[#9B93C8] hover:text-[#F0EDFF] hover:border-[#7C3AED]/50 transition-all text-[12px]"
              >
                ✏️
              </button>
            </div>
          </div>

        ) : (
          /* ── Expanded edit form ── */
          <form onSubmit={handleSubmit(onSave)} className="px-4 py-4">
            <div className="flex items-center gap-3 mb-3">
              <p className="text-[13px] font-semibold text-[#F0EDFF] flex-1 truncate">{event.title}</p>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="text-[11px] text-[#5A5380] hover:text-[#9B93C8] transition-colors"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#9B93C8] mb-1.5 uppercase tracking-wider">
                  Doors open
                </label>
                <input
                  type="text"
                  placeholder="20:00"
                  maxLength={5}
                  {...register("doors_time")}
                  className="w-full h-9 px-3 rounded-lg text-[13px] bg-[#16162A] border border-[#1E1E35] text-[#F0EDFF] placeholder-[#5A5380] focus:border-[#7C3AED] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)] outline-none transition-all tabular-nums"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#9B93C8] mb-1.5 uppercase tracking-wider">
                  Show starts
                </label>
                <input
                  type="text"
                  placeholder="21:30"
                  maxLength={5}
                  {...register("stage_time")}
                  className="w-full h-9 px-3 rounded-lg text-[13px] bg-[#16162A] border border-[#1E1E35] text-[#F0EDFF] placeholder-[#5A5380] focus:border-[#7C3AED] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)] outline-none transition-all tabular-nums"
                />
              </div>
            </div>

            <p className="text-[11px] text-[#5A5380] mb-3">
              Fans will see: <span className="text-[#9B93C8]">{event.title}</span> — <span className="text-[#A78BFA]">Venue Confirmed ✓</span>
            </p>

            {saveError && (
              <p className="text-[11px] text-[#EF4444] bg-[rgba(239,68,68,0.08)] border border-[#EF4444]/20 rounded-lg px-3 py-2 mb-3">
                {saveError}
              </p>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[12px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving…" : "Save Stage Times"}
              </button>
            </div>
          </form>
        )}
      </div>

      <Toast
        message="Stage times saved. Fans will see this update immediately."
        show={showToast}
        variant="success"
        onDone={() => setShowToast(false)}
      />
    </>
  );
}

export function ShowCardSkeleton() {
  return (
    <div className="bg-[#0F0F1A] border border-[#1E1E35] rounded-xl px-4 py-3.5 flex items-center gap-4">
      <div className="w-14 flex flex-col items-center gap-1">
        <div className="skeleton h-4 w-10" />
        <div className="skeleton h-2 w-8" />
      </div>
      <div className="w-px self-stretch bg-[#1E1E35]" />
      <div className="flex-1 flex flex-col gap-1.5">
        <div className="skeleton h-4 w-40" />
        <div className="skeleton h-3 w-28" />
      </div>
      <div className="skeleton h-6 w-20 rounded-full" />
      <div className="skeleton h-7 w-7 rounded-md" />
    </div>
  );
}
