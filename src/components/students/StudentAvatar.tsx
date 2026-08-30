"use client";

import React, { useState } from "react";
import { User, ExternalLink, Image as ImageIcon } from "lucide-react";

interface StudentAvatarProps {
  photoUrl?: string | null;
  name: string;
  registerNumber?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  showPhotoLink?: boolean;
}

export function getDirectDriveImageUrl(url?: string | null): string | null {
  if (!url || typeof url !== "string") return null;

  const trimmed = url.trim();
  if (!trimmed || trimmed === "N/A" || trimmed === "-" || trimmed.includes("dummy")) return null;

  // Google Drive format: convert to direct image stream
  const fileIdMatch =
    trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/id=([a-zA-Z0-9_-]+)/);
  if (
    fileIdMatch &&
    fileIdMatch[1] &&
    (trimmed.includes("drive.google.com") || trimmed.includes("docs.google.com"))
  ) {
    const fileId = fileIdMatch[1];
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  // Any direct HTTP/HTTPS image URL (Unsplash, Cloudinary, AWS S3, etc.)
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  return trimmed;
}

export const StudentAvatar: React.FC<StudentAvatarProps> = ({
  photoUrl,
  name,
  registerNumber,
  size = "md",
  className = "",
  showPhotoLink = false,
}) => {
  const [imageError, setImageError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const directUrl = getDirectDriveImageUrl(photoUrl);

  const sizeClasses = {
    xs: "h-7 w-7 text-[10px]",
    sm: "h-9 w-9 text-xs",
    md: "h-11 w-11 text-sm",
    lg: "h-16 w-16 text-base",
    xl: "h-20 w-20 text-xl",
    "2xl": "h-28 w-28 text-3xl",
  };

  const getInitials = (str: string) => {
    if (!str) return "ST";
    const parts = str.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="relative inline-flex items-center group">
      <div
        className={`relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-950 via-[#1E293B] to-slate-900 flex items-center justify-center font-bold text-white shadow-md select-none shrink-0 ${
          sizeClasses[size]
        } ${className}`}
      >
        {directUrl && !imageError ? (
          <>
            {!imgLoaded && (
              <span className="text-purple-300 font-bold">{getInitials(name)}</span>
            )}
            <img
              src={directUrl}
              alt={name}
              className={`h-full w-full object-cover transition-opacity duration-300 ${
                imgLoaded ? "opacity-100" : "opacity-0 absolute inset-0"
              }`}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImageError(true)}
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
            />
          </>
        ) : (
          <span className="bg-gradient-to-br from-purple-400 to-sky-400 bg-clip-text text-transparent font-black">
            {getInitials(name)}
          </span>
        )}
      </div>

      {showPhotoLink && photoUrl && (
        <a
          href={photoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 inline-flex items-center gap-1 text-[11px] font-semibold text-purple-400 hover:text-purple-300 transition"
          title="Open Official Candidate Photo Link"
        >
          <ImageIcon className="h-3.5 w-3.5" /> View Photo <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );
};
