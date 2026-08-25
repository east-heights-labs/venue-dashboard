"use client";

// Community reports — fan-submitted stage times for this venue.
// Backend endpoint not yet built. Placeholder with correct UI structure.

export default function CommunityPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-[#F0EDFF]">Community Reports</h1>
        <p className="text-sm text-[#9B93C8] mt-1">Fan-submitted stage times — confirm or flag</p>
      </div>

      <div className="bg-[#0F0F1A] border border-[#1E1E35] rounded-xl p-8 text-center">
        <p className="text-sm text-[#9B93C8]">No pending reports</p>
        <p className="text-xs text-[#5A5380] mt-2">
          When fans submit stage times for your venue, they'll appear here for your review.
          Confirming a report promotes it to a Venue Confirmed ✓ badge in the app.
        </p>
      </div>
    </div>
  );
}
