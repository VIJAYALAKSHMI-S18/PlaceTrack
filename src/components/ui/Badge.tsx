import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "danger" | "info" | "neutral" | "primary";
  className?: string;
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "neutral",
  className,
  size = "sm",
}) => {
  const variants = {
    success: "bg-[#84CC16]/20 text-[#A3E635] border-[#84CC16]/40",
    warning: "bg-[#F97316]/20 text-[#FB923C] border-[#F97316]/40",
    danger: "bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30",
    info: "bg-[#0EA5E9]/20 text-[#38BDF8] border-[#0EA5E9]/40",
    primary: "bg-[#7C2D87]/20 text-[#D8B4FE] border-[#7C2D87]/40",
    neutral: "bg-[#1E293B] text-[#94A3B8] border-[#334155]",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs font-semibold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
};
