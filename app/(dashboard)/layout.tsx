"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { getSession, isSessionExpired, clearSession } from "@/lib/auth";
import { venueApi } from "@/lib/api";
import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    // Runs only client-side after hydration
    setMounted(true);
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    if (isSessionExpired()) {
      clearSession();
      router.replace("/login?reason=timeout");
      return;
    }
    setAuthed(true);
  }, [router]);

  const { data } = useSWR(
    authed ? "community-count" : null,
    () => venueApi.getCommunityReports("pending"),
    { refreshInterval: 60000 }
  );
  const pendingCount = data?.count ?? 0;

  // Before hydration: render invisible shell so Next.js has valid HTML to serve
  // After hydration: show spinner until auth confirmed, then render dashboard
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#07070F]" />
    );
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#07070F] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[#7C3AED]/30 border-t-[#7C3AED] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#07070F]">
      <Sidebar communityCount={pendingCount} />
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}
