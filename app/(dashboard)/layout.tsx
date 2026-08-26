"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { getSession, isSessionExpired, clearSession } from "@/lib/auth";
import { venueApi } from "@/lib/api";
import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    // Only runs client-side after hydration — localStorage is available here
    const session = getSession();
    if (!session) {
      router.replace("/login");
    } else if (isSessionExpired()) {
      clearSession();
      router.replace("/login?reason=timeout");
    } else {
      setAuthed(true);
    }
    setReady(true);
  }, [router]);

  const { data } = useSWR(
    authed ? "community-count" : null,
    () => venueApi.getCommunityReports("pending"),
    { refreshInterval: 60000 }
  );
  const pendingCount = data?.count ?? 0;

  // Don't render anything until we've checked auth client-side
  if (!ready || !authed) {
    return (
      <div className="min-h-screen bg-[#07070F] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[#7C3AED]/30 border-t-[#7C3AED] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#07070F]">
      <Sidebar communityCount={pendingCount} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
