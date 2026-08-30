import React from "react";
import { LucideIcon, Inbox } from "lucide-react";
import { Button } from "./Button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#1E293B] bg-[#111827]/40 p-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1E293B]/80 text-[#818CF8]">
        <Icon className="h-7 w-7" />
      </div>
      <h4 className="mt-4 text-base font-semibold text-[#F8FAFC]">{title}</h4>
      <p className="mt-1 max-w-sm text-xs text-[#94A3B8]">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm" className="mt-5">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`animate-pulse rounded-lg bg-[#1E293B]/60 ${className}`} />
  );
};
