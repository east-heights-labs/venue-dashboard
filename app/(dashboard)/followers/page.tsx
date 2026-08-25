"use client";
import useSWR from "swr";
import { venueApi } from "@/lib/api";
import { getSession } from "@/lib/auth";

export default function FollowersPage() {
  const session = getSession();
  const { data, isLoading } = useSWR("followers", () => venueApi.getFollowers());

  const total = data?.total ?? 0;
  const daily = data?.daily ?? [];

  // Simple sparkline: find max for scaling
  const max = Math.max(...daily.map(d => d.count), 1);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-[#F0EDFF]">Followers</h1>
        <p className="text-sm text-[#9B93C8] mt-1">Fans following {session?.venueName}</p>
      </div>

      <div className="grid gap-4 max-w-xl">
        {/* Total count card */}
        <div className="bg-[#0F0F1A] border border-[#1E1E35] rounded-xl p-8 text-center">
          {isLoading ? (
            <div className="skeleton h-12 w-24 mx-auto" />
          ) : (
            <>
              <p className="text-5xl font-bold text-[#7C3AED]">{total.toLocaleString()}</p>
              <p className="text-sm text-[#9B93C8] mt-2">total followers</p>
            </>
          )}
        </div>

        {/* 30-day activity */}
        {daily.length > 0 && (
          <div className="bg-[#0F0F1A] border border-[#1E1E35] rounded-xl p-6">
            <h2 className="text-sm font-semibold text-[#F0EDFF] mb-4">Last 30 Days</h2>
            <div className="flex items-end gap-1 h-16">
              {daily.map(d => (
                <div
                  key={d.date}
                  title={`${d.date}: ${d.count} new`}
                  className="flex-1 bg-[#7C3AED] rounded-t opacity-80 hover:opacity-100 transition-opacity min-h-[2px]"
                  style={{ height: `${Math.max(2, (d.count / max) * 100)}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-[#5A5380]">
              <span>{daily[0]?.date}</span>
              <span>{daily[daily.length - 1]?.date}</span>
            </div>
          </div>
        )}

        {total === 0 && !isLoading && (
          <div className="bg-[#0F0F1A] border border-[#1E1E35] rounded-xl p-6">
            <h2 className="text-sm font-semibold text-[#F0EDFF] mb-2">How to get followers</h2>
            <p className="text-xs text-[#5A5380] leading-relaxed">
              Put your QR code where fans wait — bar rail, entrance, bathroom, table cards.
              Fans scan once and follow your venue. They get push notifications when you post
              stage times or announce new shows.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
