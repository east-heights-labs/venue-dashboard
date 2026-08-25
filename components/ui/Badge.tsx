"use client";
import { useEffect, useState } from "react";

interface BadgeProps {
  variant: "confirmed" | "community" | "unconfirmed";
  animate?: boolean;
}

export function Badge({ variant, animate = false }: BadgeProps) {
  const [glow, setGlow] = useState(false);

  useEffect(() => {
    if (animate && variant === "confirmed") {
      setGlow(true);
      const t = setTimeout(() => setGlow(false), 700);
      return () => clearTimeout(t);
    }
  }, [animate, variant]);

  const styles = {
    confirmed: "bg-[#065F46] text-[#34D399] border-[#10B981]",
    community: "bg-[rgba(245,158,11,0.12)] text-[#F59E0B] border-[#F59E0B]/30",
    unconfirmed: "text-[#5A5380] border-transparent bg-transparent",
  };

  const labels = {
    confirmed: "Venue Confirmed ✓",
    community: "Community Report",
    unconfirmed: "Unconfirmed",
  };

  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 rounded
        text-[11px] font-semibold uppercase tracking-widest
        border transition-all duration-150
        ${styles[variant]}
        ${glow ? "badge-glow" : ""}
      `}
    >
      {labels[variant]}
    </span>
  );
}

export function SkeletonBadge() {
  return <span className="skeleton h-5 w-32 inline-block" />;
}
