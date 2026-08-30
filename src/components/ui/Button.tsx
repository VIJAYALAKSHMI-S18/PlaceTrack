import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "outline" | "ghost" | "success";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0F172A] disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-gradient-to-r from-[#7C2D87] to-[#0284C7] hover:from-[#6B21A8] hover:to-[#0369A1] text-white focus:ring-[#7C2D87] shadow-sm shadow-purple-900/20",
    secondary: "bg-[#1E293B] hover:bg-[#334155] text-[#F8FAFC] border border-[#334155] focus:ring-[#64748B]",
    success: "bg-[#84CC16] hover:bg-[#65A30D] text-slate-950 font-semibold focus:ring-[#84CC16]",
    danger: "bg-[#EF4444] hover:bg-[#DC2626] text-white focus:ring-[#EF4444]",
    outline: "bg-transparent border border-[#1E293B] hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] focus:ring-[#7C2D87]",
    ghost: "bg-transparent hover:bg-[#1E293B]/60 text-[#94A3B8] hover:text-[#F8FAFC]",
  };

  const sizes = {
    sm: "px-2.5 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2.5",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};
