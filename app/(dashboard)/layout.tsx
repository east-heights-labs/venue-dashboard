"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { getSession } from "@/lib/auth";
import { venueApi } from "@/lib/api";
import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!getSession()) {
      router.replace("/login");
    }
  }, [router]);

  // Poll pending community reports count for sidebar badge
  const { data } = useSWR(
    "community-count",
    () => venueApi.getCommunityReports("pending"),
    { refreshInterval: 60000 }
  );
  const pendingCount = data?.count ?? 0;

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
