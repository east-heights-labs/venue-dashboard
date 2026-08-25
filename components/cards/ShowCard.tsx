"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { venueApi, VenueEvent } from "@/lib/api";
import { formatTime } from "@/lib/auth";

interface ShowCardProps {
  event: {
    id: string;
    title: string;
    doors_time: string | null;
    stage_time: string | null;
    source: "venue" | "ticketmaster" | "jambase" | string;
    ticket_url?: string | null;
  };
  isVenueOwned?: boolean;
  onUpdated?: () => void;
}

interface StageTimeForm {
  stage_time: string;
  doors_time: string;
}

export function ShowCard({ event, isVenueOwned, onUpdated }: ShowCardProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [currentStageTime, setCurrentStageTime] = useState(event.stage_time);

  const isConfirmed = event.source === "venue" || saved;

  const { register, handleSubmit, formState: { errors } } = useForm<StageTimeForm>({
    defaultValues: {
      stage_time: event.stage_time?.slice(0, 5) ?? "",
      doors_time: event.doors_time?.slice(0, 5) ?? "",
    },
  });

  async function onSave(data: StageTimeForm) {
    setSaving(true);
    try {
      await venueApi.updateEvent(event.id, {
        stage_time: data.stage_time || undefined,
        doors_time: data.doors_time || undefined,
      });
      setCurrentStageTime(data.stage_time);
      setSaved(true);
      setEditing(false);
      setShowToast(true);
      onUpdated?.();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="bg-[#0F0F1A] border border-[#1E1E35] rounded-xl p-5 hover:border-[#2D2D50] transition-colors">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-[#F0EDFF] truncate">{event.title}</h3>
            {event.doors_time && (
              <p className="text-xs text-[#9B93C8] mt-0.5">Doors: {formatTime(event.doors_time)}</p>
            )}
          </div>
          {isConfirmed && <Badge variant="confirmed" animate={saved} />}
        </div>

        <div className="h-px bg-[#1E1E35] mb-3" />

        {/* Stage time display */}
        {!editing ? (
          <div className="flex items-center justify-between">
            <div>
              {currentStageTime ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-[#9B93C8]">Stage:</span>
                  <span className="font-mono text-sm text-[#F0EDFF]">{formatTime(currentStageTime)}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-base">⚠️</span>
                  <span className="text-sm text-[#9B93C8]">No stage time posted</span>
                </div>
              )}
            </div>

            {isVenueOwned ? (
              <Button
                variant={currentStageTime ? "secondary" : "primary"}
                size="sm"
                onClick={() => setEditing(true)}
              >
                {currentStageTime ? "Edit Stage Time" : "+ Add Stage Times"}
              </Button>
            ) : (
              <Button variant="primary" size="sm" onClick={() => setEditing(true)}>
                {currentStageTime ? "Edit Stage Time" : "+ Add Stage Times"}
              </Button>
            )}
          </div>
        ) : (
          /* Inline editor */
          <form onSubmit={handleSubmit(onSave)} className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[#9B93C8]">Doors open</label>
                <input
                  type="time"
                  {...register("doors_time")}
                  className="h-10 px-3 rounded-lg text-sm bg-[#0F0F1A] border border-[#1E1E35] text-[#F0EDFF] focus:border-[#7C3AED] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.15)] outline-none transition-all [color-scheme:dark]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[#9B93C8]">Show starts</label>
                <input
                  type="time"
                  {...register("stage_time")}
                  className="h-10 px-3 rounded-lg text-sm bg-[#0F0F1A] border border-[#1E1E35] text-[#F0EDFF] focus:border-[#7C3AED] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.15)] outline-none transition-all [color-scheme:dark]"
                />
              </div>
            </div>

            {/* Preview */}
            <p className="text-xs text-[#5A5380]">
              Fans will see: <span className="text-[#9B93C8]">{event.title}</span> — Venue Confirmed ✓
            </p>

            <div className="flex gap-2 justify-end">
              <Button variant="secondary" size="sm" type="button" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" loading={saving}>
                Save
              </Button>
            </div>
          </form>
        )}
      </div>

      <Toast
        message="Stage times saved."
        show={showToast}
        variant="success"
        onDone={() => setShowToast(false)}
      />
    </>
  );
}

export function ShowCardSkeleton() {
  return (
    <div className="bg-[#0F0F1A] border border-[#1E1E35] rounded-xl p-5">
      <div className="skeleton h-5 w-48 mb-2" />
      <div className="skeleton h-3 w-24 mb-4" />
      <div className="h-px bg-[#1E1E35] mb-3" />
      <div className="flex justify-between items-center">
        <div className="skeleton h-4 w-32" />
        <div className="skeleton h-8 w-28" />
      </div>
    </div>
  );
}
