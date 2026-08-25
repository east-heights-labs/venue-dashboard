"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { venueApi, ApiError } from "@/lib/api";
import { saveSession, saveToken } from "@/lib/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password required"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // Clear server error when user starts typing again
  const watchedFields = watch();
  useEffect(() => {
    setServerError("");
  }, [watchedFields.email, watchedFields.password]);

  async function onSubmit(data: FormData) {
    setServerError("");
    try {
      const { token } = await venueApi.login(data.email, data.password);
      saveToken(token);
      const me = await venueApi.me();
      saveSession({
        accountId: me.account.id,
        venueId: me.venue.id,
        venueName: me.venue.name,
        venueCity: me.venue.city,
        venueLat: me.venue.lat,
        venueLng: me.venue.lng,
        email: me.account.email,
        role: me.account.role,
      });
      router.push("/dashboard");
    } catch (e) {
      setServerError(e instanceof ApiError ? e.message : "Something went wrong");
    }
  }

  return (
    <div className="min-h-screen bg-[#07070F] flex items-center justify-center px-4">
      {/* Subtle radial glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(124,58,237,0.08) 0%, transparent 70%)" }}
      />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#F0EDFF]">
            On<span className="text-[#7C3AED]">Stage</span>
          </h1>
          <p className="mt-2 text-sm text-[#9B93C8]">Venue Dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-[#0F0F1A] border border-[#1E1E35] rounded-xl p-8 flex flex-col gap-5">
          <div>
            <h2 className="text-base font-semibold text-[#F0EDFF]">Sign in</h2>
            <p className="text-xs text-[#5A5380] mt-0.5">Enter your venue account credentials</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@yourvenue.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              autoComplete="off"
              error={errors.password?.message}
              {...register("password")}
            />

            {serverError && (
              <p className="text-xs text-[#EF4444] bg-[rgba(239,68,68,0.08)] border border-[#EF4444]/20 rounded-lg px-3 py-2">
                {serverError}
              </p>
            )}

            <Button type="submit" loading={isSubmitting} className="w-full mt-1">
              Sign in
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-[#5A5380] mt-6">
          No account? Your invite link was sent by East Heights Labs.
        </p>
      </div>
    </div>
  );
}
