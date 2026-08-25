"use client";
import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  show: boolean;
  onDone?: () => void;
  variant?: "success" | "error";
}

export function Toast({ message, show, onDone, variant = "success" }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const t = setTimeout(() => {
        setVisible(false);
        setTimeout(() => onDone?.(), 150);
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [show]);

  const border = variant === "success" ? "border-[#10B981]" : "border-[#EF4444]";
  const text = variant === "success" ? "text-[#34D399]" : "text-[#EF4444]";

  return (
    <div
      className={`
        fixed bottom-6 right-6 z-50
        bg-[#16162A] border ${border} ${text}
        rounded-lg px-4 py-3 text-sm font-medium
        transition-all duration-200
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}
      `}
    >
      {message}
    </div>
  );
}
