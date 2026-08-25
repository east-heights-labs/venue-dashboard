"use client";
import { getSession } from "@/lib/auth";

export default function FollowersPage() {
  const session = getSession();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-[#F0EDFF]">Followers</h1>
        <p className="text-sm text-[#9B93C8] mt-1">Fans who follow {session?.venueName}</p>
      </div>

      <div className="bg-[#0F0F1A] border border-[#1E1E35] rounded-xl p-8 text-center">
        <p className="text-4xl font-bold text-[#7C3AED]">0</p>
        <p className="text-sm text-[#9B93C8] mt-2">followers</p>
        <p className="text-xs text-[#5A5380] mt-4 max-w-xs mx-auto">
          Followers grow when fans scan your QR code or discover your venue in the app.
          Put your QR code where fans wait — bar, door, tables.
        </p>
      </div>
    </div>
  );
}
