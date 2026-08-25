"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { clearSession, getSession } from "@/lib/auth";
import { venueApi } from "@/lib/api";

const NAV = [
  { href: "/",            label: "Tonight",           icon: "🎵" },
  { href: "/events",     label: "Events",            icon: "📅" },
  { href: "/community",  label: "Community Reports", icon: "💬" },
  { href: "/qr",         label: "QR Code",           icon: "📲" },
  { href: "/followers",  label: "Followers",         icon: "👥" },
];

export function Sidebar({ communityCount = 0 }: { communityCount?: number }) {
  const pathname = usePathname();
  const router = useRouter();
  const session = getSession();
  const [collapsed, setCollapsed] = useState(false);

  async function handleLogout() {
    await venueApi.logout().catch(() => {});
    clearSession();
    router.push("/login");
  }

  return (
    <aside
      className={`
        flex flex-col h-screen sticky top-0 border-r border-[#1E1E35]
        bg-[#0F0F1A] transition-all duration-200 shrink-0
        ${collapsed ? "w-16" : "w-60"}
      `}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-[#1E1E35]">
        {!collapsed && (
          <span className="text-base font-extrabold tracking-tight text-[#F0EDFF]">
            On<span className="text-[#7C3AED]">Stage</span>
          </span>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="text-[#5A5380] hover:text-[#F0EDFF] transition-colors ml-auto"
          aria-label="Toggle sidebar"
        >
          {collapsed ? "→" : "←"}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 flex flex-col gap-0.5 px-2 overflow-y-auto">
        {NAV.map(({ href, label, icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-150 relative
                ${active
                  ? "bg-[rgba(124,58,237,0.08)] text-[#7C3AED] before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[3px] before:bg-[#7C3AED] before:rounded-r"
                  : "text-[#9B93C8] hover:text-[#F0EDFF] hover:bg-[#16162A]"
                }
              `}
            >
              <span className="text-base shrink-0">{icon}</span>
              {!collapsed && (
                <span className="flex-1 truncate">
                  {label}
                  {label === "Community Reports" && communityCount > 0 && (
                    <span className="ml-2 text-[10px] bg-[#7C3AED] text-white rounded-full px-1.5 py-0.5">
                      {communityCount}
                    </span>
                  )}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: settings + venue info */}
      <div className="border-t border-[#1E1E35] px-2 py-3 flex flex-col gap-0.5">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#9B93C8] hover:text-[#F0EDFF] hover:bg-[#16162A] transition-all"
        >
          <span className="text-base shrink-0">⚙️</span>
          {!collapsed && <span>Settings</span>}
        </Link>

        {!collapsed && session && (
          <div className="px-3 pt-2 pb-1">
            <p className="text-xs font-semibold text-[#F0EDFF] truncate">{session.venueName}</p>
            <p className="text-[11px] text-[#5A5380] truncate">{session.email}</p>
            <button
              onClick={handleLogout}
              className="mt-2 text-[11px] text-[#5A5380] hover:text-[#EF4444] transition-colors"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
