import React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "lg",
}) => {
  if (!isOpen) return null;

  const maxWidths = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative z-50 w-full overflow-hidden rounded-2xl border border-[#1E293B] bg-[#111827] p-6 shadow-2xl transition-all",
          maxWidths[maxWidth]
        )}
      >
        <div className="flex items-start justify-between pb-4">
          <div>
            <h3 className="text-lg font-bold text-[#F8FAFC]">{title}</h3>
            {description && (
              <p className="mt-1 text-xs text-[#94A3B8]">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#F8FAFC]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[80vh] overflow-y-auto pr-1">{children}</div>
      </div>
    </div>
  );
};
