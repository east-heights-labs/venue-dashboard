"use client";
import { getSession } from "@/lib/auth";

export default function SettingsPage() {
  const session = getSession();

  return (
    <div className="flex-1 overflow-y-auto p-7">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-[#F0EDFF]">Settings</h1>
        <p className="text-sm text-[#9B93C8] mt-1">Venue profile and account</p>
      </div>

      <div className="max-w-xl flex flex-col gap-4">
        <div className="bg-[#0F0F1A] border border-[#1E1E35] rounded-xl p-6">
          <h2 className="text-sm font-semibold text-[#F0EDFF] mb-4">Venue</h2>
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[#9B93C8]">Name</span>
              <span className="text-[#F0EDFF]">{session?.venueName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9B93C8]">City</span>
              <span className="text-[#F0EDFF]">{session?.venueCity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9B93C8]">Venue ID</span>
              <span className="font-mono text-xs text-[#5A5380]">{session?.venueId}</span>
            </div>
          </div>
        </div>

        <div className="bg-[#0F0F1A] border border-[#1E1E35] rounded-xl p-6">
          <h2 className="text-sm font-semibold text-[#F0EDFF] mb-4">Account</h2>
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[#9B93C8]">Email</span>
              <span className="text-[#F0EDFF]">{session?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9B93C8]">Role</span>
              <span className="text-[#F0EDFF] capitalize">{session?.role}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
