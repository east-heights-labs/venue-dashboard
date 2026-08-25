"use client";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-[#9B93C8]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            h-10 px-3 rounded-lg text-sm
            bg-[#0F0F1A] border text-[#F0EDFF] placeholder-[#5A5380]
            transition-all duration-150 outline-none
            ${error
              ? "border-[#EF4444] focus:border-[#EF4444] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]"
              : "border-[#1E1E35] focus:border-[#7C3AED] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.15)]"
            }
            ${className}
          `}
          {...props}
        />
        {error && <span className="text-xs text-[#EF4444]">{error}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";
