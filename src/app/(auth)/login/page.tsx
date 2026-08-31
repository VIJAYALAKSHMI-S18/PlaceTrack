"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Lock, Mail, Shield, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { RathinamLogo } from "@/components/common/RathinamLogo";

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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0F172A] via-[#0369A1] to-[#0284C7] p-4 relative overflow-hidden">
      {/* Decorative Blue ambient glow orbs */}
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-sky-400/20 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-blue-600/30 blur-3xl" />

      <div className="relative z-10 w-full max-w-md space-y-6">
        {/* Rathinam Branding & Logo */}
        <div className="text-center space-y-3">
          <div className="flex justify-center transition-transform duration-300 hover:scale-105">
            <RathinamLogo className="h-16 sm:h-20 w-auto max-w-[440px] drop-shadow-xl" isDark={true} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-wide text-white drop-shadow-md">
              RATHINAM GLOBAL UNIVERSITY
            </h1>
            <p className="text-xs font-semibold uppercase tracking-wider text-sky-200">
              Campus Placement & Career Development Portal
            </p>
          </div>
        </div>

        {/* Crisp White Login Card */}
        <Card className="border border-white/60 bg-white p-7 shadow-2xl rounded-2xl">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600 font-medium">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Official Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@rathinam.ac.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 pl-9 pr-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#0284C7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0284C7]/20 shadow-sm transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 pl-9 pr-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#0284C7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0284C7]/20 shadow-sm transition"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[#0284C7] focus:ring-[#0284C7]"
                />
                <span className="text-xs text-slate-600 font-medium">Remember session</span>
              </label>
            </div>

            <Button
              type="submit"
              isLoading={loading}
              className="w-full bg-gradient-to-r from-[#0284C7] to-[#0369A1] hover:from-[#0369A1] hover:to-[#075985] text-white py-2.5 font-bold text-sm shadow-lg shadow-sky-500/25"
            >
              Sign In to Placement Portal
            </Button>
          </form>

          {/* Quick Demo Accounts Helper */}
          <div className="mt-6 border-t border-slate-100 pt-4">
            <p className="text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">
              Instant Demo Access
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDemoAccount("admin@example.com", "admin123")}
                className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-center text-xs font-bold text-slate-700 transition hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount("manager@example.com", "manager123")}
                className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-center text-xs font-bold text-slate-700 transition hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
              >
                Manager
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount("placement@example.com", "placement123")}
                className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-center text-xs font-bold text-slate-700 transition hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
              >
                Placement
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
