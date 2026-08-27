"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearSession, getSession } from "@/lib/auth";
import { venueApi } from "@/lib/api";

// SVG icon components — inline, no icon library dependency
function IconTonight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 19V6l12-3v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="15" r="3"/>
    </svg>
  );
}
function IconEvents() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}
function IconCommunity() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}
function IconQR() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
    </svg>
  );
}
function IconFollowers() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}
function IconSettings() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06-.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  );
}
function IconLogout() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}

const NAV = [
  { href: "/",           label: "Tonight",           Icon: IconTonight },
  { href: "/events",     label: "Events",            Icon: IconEvents },
  { href: "/community",  label: "Community Reports", Icon: IconCommunity },
  { href: "/qr",         label: "QR Code",           Icon: IconQR },
  { href: "/followers",  label: "Followers",         Icon: IconFollowers },
];

export function Sidebar({ communityCount = 0 }: { communityCount?: number }) {
  const pathname = usePathname();
  const router = useRouter();
  const session = getSession();

  async function handleLogout() {
    await venueApi.logout().catch(() => {});
    clearSession();
    router.push("/login");
  }

  return (
    <aside className="flex flex-col w-[220px] min-w-[220px] h-screen sticky top-0 border-r border-[#1E1E35] bg-[#0F0F1A] shrink-0">

      {/* Logo */}
      <div className="flex items-center px-5 h-14 border-b border-[#1E1E35]">
        <span className="text-[17px] font-extrabold tracking-tight text-[#F0EDFF]">
          On<span className="text-[#7C3AED]">Stage</span>
        </span>
      </div>

      {/* Venue identity — top of sidebar, not buried at bottom */}
      {session && (
        <div className="px-5 py-3 border-b border-[#1E1E35]">
          <p className="text-[12px] font-bold text-[#F0EDFF] truncate leading-tight">{session.venueName}</p>
          <p className="text-[11px] text-[#5A5380] truncate mt-0.5">{session.email}</p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 py-2 px-2 flex flex-col gap-0.5 overflow-y-auto">
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium
                transition-all duration-150 relative
                ${active
                  ? "bg-[rgba(124,58,237,0.10)] text-[#7C3AED] before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-[3px] before:bg-[#7C3AED] before:rounded-r"
                  : "text-[#9B93C8] hover:text-[#F0EDFF] hover:bg-[#16162A]"
                }
              `}
            >
              <span className="shrink-0"><Icon /></span>
              <span className="flex-1 truncate">{label}</span>
              {label === "Community Reports" && communityCount > 0 && (
                <span className="text-[10px] font-bold bg-[#7C3AED] text-white rounded-full px-1.5 py-0.5 leading-none">
                  {communityCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: settings + logout */}
      <div className="border-t border-[#1E1E35] px-2 py-2 flex flex-col gap-0.5">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-[#9B93C8] hover:text-[#F0EDFF] hover:bg-[#16162A] transition-all"
        >
          <span className="shrink-0"><IconSettings /></span>
          <span>Settings</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-[12px] text-[#5A5380] hover:text-[#EF4444] hover:bg-[rgba(239,68,68,0.06)] transition-all w-full text-left"
        >
          <span className="shrink-0"><IconLogout /></span>
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
