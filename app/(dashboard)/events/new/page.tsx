"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { venueApi, ApiError } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const schema = z.object({
  title: z.string().min(1, "Event name required"),
  event_date: z.string().min(1, "Date required"),
  doors_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM (e.g. 20:00)").optional().or(z.literal("")),
  stage_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM (e.g. 21:30)").optional().or(z.literal("")),
  ticket_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  price_min: z.string().optional(),
  price_max: z.string().optional(),
  description: z.string().max(500).optional(),
});
type FormData = z.infer<typeof schema>;

export default function NewEventPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { event_date: new Date().toISOString().split("T")[0] },
  });

  async function onSubmit(data: FormData) {
    setServerError("");
    try {
      await venueApi.createEvent({
        title: data.title,
        event_date: data.event_date,
        doors_time: data.doors_time || undefined,
        stage_time: data.stage_time || undefined,
        ticket_url: data.ticket_url || undefined,
        price_min: data.price_min ? Number(data.price_min) : undefined,
        price_max: data.price_max ? Number(data.price_max) : undefined,
        description: data.description || undefined,
      });
      router.push("/events");
    } catch (e) {
      setServerError(e instanceof ApiError ? e.message : "Something went wrong");
    }
  }

  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-[#F0EDFF]">New Event</h1>
        <p className="text-sm text-[#9B93C8] mt-1">Add a show that isn't in Ticketmaster or JamBase</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <Input
          label="Artist / Event Name"
          placeholder="e.g. Turnpike Troubadours"
          error={errors.title?.message}
          {...register("title")}
        />

        <Input
          label="Date"
          type="date"
          error={errors.event_date?.message}
          className="[color-scheme:dark]"
          {...register("event_date")}
        />

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#9B93C8]">Doors open</label>
            <input
              type="text"
              placeholder="20:00"
              maxLength={5}
              {...register("doors_time")}
              className="h-10 px-3 rounded-lg text-sm bg-[#0F0F1A] border border-[#1E1E35] text-[#F0EDFF] placeholder-[#5A5380] focus:border-[#7C3AED] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.15)] outline-none transition-all"
            />
            {errors.doors_time && <p className="text-xs text-[#EF4444]">{errors.doors_time.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#9B93C8]">Show starts</label>
            <input
              type="text"
              placeholder="21:30"
              maxLength={5}
              {...register("stage_time")}
              className="h-10 px-3 rounded-lg text-sm bg-[#0F0F1A] border border-[#1E1E35] text-[#F0EDFF] placeholder-[#5A5380] focus:border-[#7C3AED] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.15)] outline-none transition-all"
            />
          </div>
        </div>

        <Input
          label="Ticket URL (optional)"
          type="url"
          placeholder="https://..."
          error={errors.ticket_url?.message}
          {...register("ticket_url")}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Min Price (optional)"
            type="number"
            placeholder="0"
            {...register("price_min")}
          />
          <Input
            label="Max Price (optional)"
            type="number"
            placeholder="0"
            {...register("price_max")}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#9B93C8]">Description (optional)</label>
          <textarea
            {...register("description")}
            rows={3}
            placeholder="Any extra details fans should know..."
            className="px-3 py-2 rounded-lg text-sm bg-[#0F0F1A] border border-[#1E1E35] text-[#F0EDFF] placeholder-[#5A5380] focus:border-[#7C3AED] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.15)] outline-none transition-all resize-none"
          />
        </div>

        {serverError && (
          <p className="text-xs text-[#EF4444] bg-[rgba(239,68,68,0.08)] border border-[#EF4444]/20 rounded-lg px-3 py-2">
            {serverError}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" loading={isSubmitting}>Create Event</Button>
        </div>
      </form>
    </div>
  );
}
