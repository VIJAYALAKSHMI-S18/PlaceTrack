"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Lock, Mail, Shield, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const json = await res.json();
      if (json.success) {
        router.push(json.data.redirectUrl || "/admin/dashboard");
        router.refresh();
      } else {
        setError(json.message || "Invalid credentials.");
      }
    } catch {
      setError("An unexpected network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const setDemoAccount = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError("");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#7C2D87]/25 via-[#0B0F19] to-[#05070D] p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Rathinam Branding & Logo */}
        <div className="text-center space-y-4">
          <div className="inline-flex rounded-3xl bg-gradient-to-b from-[#1E1B4B]/80 via-[#0F172A]/90 to-[#0B0F19] p-5 shadow-2xl shadow-purple-950/60 border border-purple-500/30 backdrop-blur-xl transition-transform duration-300 hover:scale-[1.02]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/rgu-logo.svg"
              alt="Rathinam Global University Logo"
              className="h-16 w-auto object-contain max-w-[340px] drop-shadow-[0_8px_20px_rgba(168,85,247,0.3)]"
            />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-wide text-[#F8FAFC]">
              RATHINAM GLOBAL DEEMED TO BE UNIVERSITY
            </h1>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <p className="text-[11px] font-bold tracking-widest bg-gradient-to-r from-purple-400 via-sky-400 to-cyan-300 bg-clip-text text-transparent uppercase">
                Placement & Career Development Cell
              </p>
            </div>
            <p className="text-xs text-[#94A3B8] mt-1.5">
              Campus Recruitment Drives, Student ATS Matching & Offer Tracking Portal
            </p>
          </div>
        </div>

        {/* Login Form Card */}
        <Card className="border-[#1E293B] bg-[#111827] p-6 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 p-3 text-xs text-[#EF4444]">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#94A3B8]">
                Official Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[#64748B]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@college.edu or demo email"
                  required
                  className="w-full rounded-lg border border-[#1E293B] bg-[#0F172A] pl-9 pr-3 py-2 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:border-[#6366F1] focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#94A3B8]">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-[#64748B]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-lg border border-[#1E293B] bg-[#0F172A] pl-9 pr-3 py-2 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:border-[#6366F1] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-[#94A3B8] cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#1E293B] bg-[#0F172A] text-[#6366F1] focus:ring-[#6366F1]"
                />
                Remember session
              </label>
              <span className="text-[#818CF8] hover:underline cursor-pointer">
                Forgot password?
              </span>
            </div>

            <Button
              type="submit"
              className="w-full font-semibold shadow-lg shadow-purple-900/25"
              isLoading={loading}
            >
              Sign In to PlaceTrack Portal
            </Button>
          </form>

          {/* Quick Demo Accounts Selection */}
          <div className="mt-6 border-t border-[#1E293B] pt-4">
            <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              Quick Demo Accounts (Development)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDemoAccount("admin@example.com", "admin123")}
                className="rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 p-2 text-center text-[10px] font-bold text-[#EF4444] transition hover:bg-[#EF4444]/20"
              >
                ADMIN
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount("manager@example.com", "manager123")}
                className="rounded-lg border border-[#F59E0B]/30 bg-[#F59E0B]/10 p-2 text-center text-[10px] font-bold text-[#F59E0B] transition hover:bg-[#F59E0B]/20"
              >
                MANAGER
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount("placement@example.com", "placement123")}
                className="rounded-lg border border-[#3B82F6]/30 bg-[#3B82F6]/10 p-2 text-center text-[10px] font-bold text-[#818CF8] transition hover:bg-[#3B82F6]/20"
              >
                TEAM
              </button>
            </div>
          </div>
        </Card>

        {/* Security assurance */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-[#64748B]">
          <Shield className="h-3.5 w-3.5 text-[#10B981]" />
          <span>Encrypted Session • Role-Based Server Authorization</span>
        </div>
      </div>
    </div>
  );
}
