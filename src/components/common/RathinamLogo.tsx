import React from "react";

interface RathinamLogoProps {
  className?: string;
}

export const RathinamLogo: React.FC<RathinamLogoProps> = ({ className = "h-16 w-auto" }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 880 140"
      className={className}
      style={{ display: "inline-block", maxWidth: "100%", height: "auto" }}
      aria-label="Rathinam Global Deemed to be University - NAAC Grade A++ Accredited"
    >
      <defs>
        <linearGradient id="ringOrange" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
        <linearGradient id="ringBlue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
        <linearGradient id="ringGreen" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A3E635" />
          <stop offset="100%" stopColor="#65A30D" />
        </linearGradient>
        <linearGradient id="fullBarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="25%" stopColor="#8B2490" />
          <stop offset="50%" stopColor="#0084CA" />
          <stop offset="100%" stopColor="#84BD00" />
        </linearGradient>
      </defs>

      {/* 1. LEFT: THE 3 ICONIC RATHINAM CIRCLES / RINGS EMBLEM */}
      <g transform="translate(10, 10)">
        <text x="50" y="14" textAnchor="middle" fontFamily="'Brush Script MT', 'Segoe Script', cursive, sans-serif" fontStyle="italic" fontSize="11" fill="#E2E8F0" letterSpacing="0.5">Celebrate life</text>

        {/* Top Ring (Orange) */}
        <circle cx="50" cy="38" r="17" fill="none" stroke="url(#ringOrange)" strokeWidth="7" />
        <circle cx="50" cy="38" r="4.5" fill="#FB923C" />

        {/* Bottom Left Ring (Blue) */}
        <circle cx="32" cy="70" r="17" fill="none" stroke="url(#ringBlue)" strokeWidth="7" />
        <circle cx="32" cy="70" r="4.5" fill="#38BDF8" />

        {/* Bottom Right Ring (Green) */}
        <circle cx="68" cy="70" r="17" fill="none" stroke="url(#ringGreen)" strokeWidth="7" />
        <circle cx="68" cy="70" r="4.5" fill="#A3E635" />

        {/* Brand Name Under Rings */}
        <text x="50" y="104" textAnchor="middle" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="13" fill="#8B2490" letterSpacing="1">
          RATHIN<tspan fill="#F97316">@</tspan>M
        </text>
      </g>

      {/* Vertical Divider 1 */}
      <line x1="115" y1="15" x2="115" y2="120" stroke="#475569" strokeWidth="2" strokeLinecap="round" />

      {/* 2. MIDDLE: RGU & GLOBAL UNIVERSITY TYPOGRAPHY */}
      <g transform="translate(130, 10)">
        <text x="0" y="70" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="74" fill="#8B2490" letterSpacing="-1">R</text>
        <text x="49" y="70" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="74" fill="#0084CA" letterSpacing="-1">G</text>
        <text x="112" y="70" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="74" fill="#84BD00" letterSpacing="-1">U</text>

        <g transform="translate(176, 8)">
          <text x="0" y="20" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="19" fill="#8B2490" letterSpacing="1.2">
            RATHIN<tspan fill="#F97316">@</tspan>M
          </text>

          <g transform="translate(0, 25)">
            <text x="0" y="18" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="21" fill="#0084CA" letterSpacing="1">GL</text>
            <circle cx="41" cy="11.5" r="8" fill="none" stroke="#0084CA" strokeWidth="2"/>
            <ellipse cx="41" cy="11.5" rx="4.2" ry="8" fill="none" stroke="#0084CA" strokeWidth="1.2"/>
            <line x1="33" y1="11.5" x2="49" y2="11.5" stroke="#0084CA" strokeWidth="1.2"/>
            <text x="52" y="18" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="21" fill="#0084CA" letterSpacing="1">BAL</text>
          </g>

          <text x="0" y="58" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="700" fontSize="12" fill="#84BD00" letterSpacing="0.5">Deemed to be</text>
          <text x="0" y="72" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="14" fill="#FFFFFF" letterSpacing="1.5">UNIVERSITY</text>
        </g>

        <rect x="0" y="82" width="330" height="3.5" rx="1.5" fill="url(#fullBarGrad)" />

        <text x="165" y="98" textAnchor="middle" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="700" fontSize="8.5" fill="#94A3B8" letterSpacing="0.6">
          (DECLARED UNDER SECTION 3 OF UGC ACT, 1956)
        </text>

        <g transform="translate(165, 113)">
          <line x1="-130" y1="-3.5" x2="-68" y2="-3.5" stroke="#64748B" strokeWidth="1"/>
          <text x="0" y="0" textAnchor="middle" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="600" fontSize="9.5" fill="#E2E8F0" letterSpacing="0.5">
            University of the Future
          </text>
          <line x1="68" y1="-3.5" x2="130" y2="-3.5" stroke="#64748B" strokeWidth="1"/>
        </g>
      </g>

      {/* Vertical Divider 2 */}
      <line x1="535" y1="15" x2="535" y2="120" stroke="#475569" strokeWidth="2" strokeLinecap="round" />

      {/* 3. RIGHT: NAAC GRADE A++ ACCREDITED */}
      <g transform="translate(565, 15)">
        <text x="0" y="34" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="36" fill="#8B2490" letterSpacing="2">NAAC</text>
        <text x="0" y="66" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="32" fill="#FFFFFF" letterSpacing="2">GRADE</text>

        <g transform="translate(148, 66)">
          <text x="0" y="0" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="68" fill="#8B2490">A</text>
          <text x="48" y="-14" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="38" fill="#FFFFFF">++</text>
        </g>

        <line x1="0" y1="84" x2="295" y2="84" stroke="#8B2490" strokeWidth="2.5" />

        <text x="147" y="103" textAnchor="middle" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="13" fill="#FFFFFF" letterSpacing="7">
          ACCREDITED
        </text>
      </g>
    </svg>
  );
};
