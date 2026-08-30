import React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-1.5 block text-xs font-medium text-[#94A3B8]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full rounded-lg border border-[#1E293B] bg-[#0F172A] px-3.5 py-2 text-sm text-[#F8FAFC] placeholder-[#64748B] transition-colors focus:border-[#6366F1] focus:outline-none focus:ring-1 focus:ring-[#6366F1] disabled:opacity-50",
            error && "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]",
            className
          )}
          {...props}
        />
        {helperText && !error && (
          <p className="mt-1 text-xs text-[#64748B]">{helperText}</p>
        )}
        {error && <p className="mt-1 text-xs text-[#EF4444]">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: { label: string; value: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, children, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-1.5 block text-xs font-medium text-[#94A3B8]">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            "w-full rounded-lg border border-[#1E293B] bg-[#0F172A] px-3.5 py-2 text-sm text-[#F8FAFC] transition-colors focus:border-[#6366F1] focus:outline-none focus:ring-1 focus:ring-[#6366F1] disabled:opacity-50",
            error && "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]",
            className
          )}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#111827] text-white">
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error && <p className="mt-1 text-xs text-[#EF4444]">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";
