"use client";

import React, { useState } from "react";
import { Image as ImageIcon, ExternalLink } from "lucide-react";

interface CandidatePhotoBadgeProps {
  photoUrl?: string | null;
  name: string;
}

function getDirectImageUrl(url?: string | null): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed || trimmed === "N/A" || trimmed === "-" || trimmed.includes("dummy")) return null;

  // Google Drive URL conversion
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

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return null;
}

export const CandidatePhotoBadge: React.FC<CandidatePhotoBadgeProps> = ({ photoUrl, name }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const directUrl = getDirectImageUrl(photoUrl);

  if (!directUrl || hasError) {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-purple-500/40 bg-[#111827] shadow-lg shadow-purple-950/30 h-16 w-16 shrink-0 transition-transform duration-200 hover:scale-105">
      <img
        src={directUrl}
        alt={name}
        className={`h-full w-full object-cover transition-opacity duration-300 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
      />
    </div>
  );
};
