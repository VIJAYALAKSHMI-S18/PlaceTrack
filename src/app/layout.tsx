import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rathinam Global University — Placement & Career Portal",
  description: "Official Campus Placement, Recruitment Drives, and ATS Matching Portal for Rathinam Global University (RGU).",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0F172A] text-[#F8FAFC] antialiased selection:bg-[#6366F1] selection:text-white">
        {children}
      </body>
    </html>
  );
}
