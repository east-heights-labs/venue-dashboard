"use client";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, children, className = "", disabled, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed";

    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-5 text-sm",
    };

    const variants = {
      primary:
        "bg-[#7C3AED] hover:bg-[#6D28D9] hover:scale-[1.01] text-white border border-transparent",
      secondary:
        "bg-transparent border border-[#2D2D50] text-[#9B93C8] hover:border-[#7C3AED] hover:text-[#F0EDFF]",
      ghost: "bg-transparent border-0 text-[#9B93C8] hover:text-[#F0EDFF] hover:bg-[#16162A] px-2",
      danger: "bg-transparent border-0 text-[#EF4444] hover:bg-[rgba(239,68,68,0.08)] px-2",
    };

    return (
      <button
        ref={ref}
        className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {children}
          </span>
        ) : children}
      </button>
    );
  }
);
Button.displayName = "Button";
