"use client";

import React, { useState, useEffect } from "react";
import { DashboardShell } from "@/components/navigation/DashboardShell";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Sliders, Save, CheckCircle2 } from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>({
    ats_skill_weight: 50,
    ats_semantic_weight: 20,
    ats_education_weight: 10,
    ats_experience_weight: 10,
    ats_project_weight: 10,
    default_ats_threshold: 70,
    conditional_tolerance: 5,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const json = await res.json();
        if (json.data) setSettings(json.data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings((prev: any) => ({ ...prev, [e.target.name]: Number(e.target.value) }));
    setSaved(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (json.success) {
        setSaved(true);
      } else {
        alert(json.message || "Failed to update settings.");
      }
    } catch {
      alert("Error occurred while saving settings.");
    } finally {
      setSaving(false);
    }
  };

  const totalWeight =
    (settings.ats_skill_weight || 0) +
    (settings.ats_semantic_weight || 0) +
    (settings.ats_education_weight || 0) +
    (settings.ats_experience_weight || 0) +
    (settings.ats_project_weight || 0);

  return (
    <DashboardShell role="ADMIN">
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            System Configuration & ATS Engine Settings
          </h1>
          <p className="text-xs font-medium text-slate-600">
            CONFIGURE WEIGHTED SCORING ENGINE PARAMETERS AND ELIGIBILITY TOLERANCES
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* ATS Weights Card */}
          <Card className="space-y-4">
            <CardHeader>
              <div>
                <CardTitle>ATS Resume Matching Engine Weights</CardTitle>
                <CardDescription>
                  Configure relative percentage contributions towards candidate ATS scores (Total must equal 100%).
                </CardDescription>
              </div>
              <div
                className={`rounded-lg px-3 py-1 text-xs font-bold ${
                  totalWeight === 100
                    ? "bg-[#10B981]/15 text-[#10B981]"
                    : "bg-[#EF4444]/15 text-[#EF4444]"
                }`}
              >
                Total Weight: {totalWeight}%
              </div>
            </CardHeader>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              <Input
                label="Skill Match Weight (%)"
                name="ats_skill_weight"
                type="number"
                value={settings.ats_skill_weight}
                onChange={handleChange}
                required
              />
              <Input
                label="Semantic Context Match (%)"
                name="ats_semantic_weight"
                type="number"
                value={settings.ats_semantic_weight}
                onChange={handleChange}
                required
              />
              <Input
                label="Education / CGPA Weight (%)"
                name="ats_education_weight"
                type="number"
                value={settings.ats_education_weight}
                onChange={handleChange}
                required
              />
              <Input
                label="Experience / Internship (%)"
                name="ats_experience_weight"
                type="number"
                value={settings.ats_experience_weight}
                onChange={handleChange}
                required
              />
              <Input
                label="Project Relevance (%)"
                name="ats_project_weight"
                type="number"
                value={settings.ats_project_weight}
                onChange={handleChange}
                required
              />
            </div>
          </Card>

          {/* Eligibility Thresholds */}
          <Card className="space-y-4">
            <CardHeader>
              <div>
                <CardTitle>Eligibility & Conditional Tolerance Rules</CardTitle>
                <CardDescription>
                  Thresholds for classifying candidates as ELIGIBLE vs CONDITIONALLY_ELIGIBLE.
                </CardDescription>
              </div>
            </CardHeader>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Default Minimum ATS Threshold Score"
                name="default_ats_threshold"
                type="number"
                value={settings.default_ats_threshold}
                onChange={handleChange}
                required
              />
              <Input
                label="Conditional Eligibility Tolerance (Points Below Min)"
                name="conditional_tolerance"
                type="number"
                value={settings.conditional_tolerance}
                onChange={handleChange}
                required
              />
            </div>
          </Card>

          <div className="flex items-center justify-end gap-3">
            {saved && (
              <span className="flex items-center gap-1 text-xs text-[#10B981]">
                <CheckCircle2 className="h-4 w-4" /> Settings saved successfully!
              </span>
            )}
            <Button
              type="submit"
              disabled={saving || totalWeight !== 100}
              isLoading={saving}
            >
              <Save className="h-4 w-4" /> Save System Settings
            </Button>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}
