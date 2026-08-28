"use client";

interface TopbarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function Topbar({ title, subtitle, actions }: TopbarProps) {
  return (
    <div className="h-14 border-b border-[#1E1E35] flex items-center gap-3 px-12 sticky top-0 bg-[#07070F] z-10 shrink-0">
      <div className="flex items-baseline gap-3">
        <h1 className="text-[15px] font-bold text-[#F0EDFF]">{title}</h1>
        {subtitle && (
          <span className="text-[13px] text-[#5A5380]">{subtitle}</span>
        )}
      </div>
      {actions && (
        <div className="ml-auto flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}
