"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { venueApi, ApiError } from "@/lib/api";
import { saveSession, saveToken } from "@/lib/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const schema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirm: z.string(),
}).refine(d => d.password === d.confirm, {
  message: "Passwords don't match",
  path: ["confirm"],
});
type FormData = z.infer<typeof schema>;

function AcceptInviteContent() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") ?? "";

  const [inviteInfo, setInviteInfo] = useState<{ email: string; venue_name: string } | null>(null);
  const [tokenError, setTokenError] = useState("");
  const [serverError, setServerError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!token) { setTokenError("No invite token found."); return; }
    venueApi.getInviteInfo(token)
      .then(setInviteInfo)
      .catch(() => setTokenError("This invite link is invalid or has expired."));
  }, [token]);

  async function onSubmit(data: FormData) {
    setServerError("");
    try {
      const { token: jwt } = await venueApi.acceptInvite(token, data.password);
      saveToken(jwt);
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
      router.push("/");
    } catch (e) {
      setServerError(e instanceof ApiError ? e.message : "Something went wrong");
    }
  }

  return (
    <div className="min-h-screen bg-[#07070F] flex items-center justify-center px-4">
      <div className="fixed inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(124,58,237,0.08) 0%, transparent 70%)" }}
      />

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#F0EDFF]">
            On<span className="text-[#7C3AED]">Stage</span>
          </h1>
          <p className="mt-2 text-sm text-[#9B93C8]">Set up your venue account</p>
        </div>

        <div className="bg-[#0F0F1A] border border-[#1E1E35] rounded-xl p-8 flex flex-col gap-5">
          {tokenError ? (
            <div className="text-sm text-[#EF4444] text-center py-4">{tokenError}</div>
          ) : !inviteInfo ? (
            <div className="flex flex-col gap-3">
              <div className="skeleton h-4 w-48" />
              <div className="skeleton h-4 w-32" />
            </div>
          ) : (
            <>
              <div>
                <h2 className="text-base font-semibold text-[#F0EDFF]">Welcome, {inviteInfo.venue_name}</h2>
                <p className="text-xs text-[#5A5380] mt-0.5">Setting up account for {inviteInfo.email}</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <Input
                  label="Create Password"
                  type="password"
                  placeholder="8+ characters"
                  autoComplete="new-password"
                  error={errors.password?.message}
                  {...register("password")}
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="Same as above"
                  autoComplete="new-password"
                  error={errors.confirm?.message}
                  {...register("confirm")}
                />

                {serverError && (
                  <p className="text-xs text-[#EF4444] bg-[rgba(239,68,68,0.08)] border border-[#EF4444]/20 rounded-lg px-3 py-2">
                    {serverError}
                  </p>
                )}

                <Button type="submit" loading={isSubmitting} className="w-full mt-1">
                  Activate Account
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#07070F]" />}>
      <AcceptInviteContent />
    </Suspense>
  );
}
