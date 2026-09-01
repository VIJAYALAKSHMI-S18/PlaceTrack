"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/navigation/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CheckCircle2 } from "lucide-react";

export default function PlacementTeamAddCompanyPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    company_name: "",
    location: "",
    website: "",
    company_size: "1,000-5,000 employees",
    company_address: "",
    google_maps_url: "",
    contact_person_name: "",
    contact_person_phone: "",
    contact_person_email: "",
    company_description: "",
    industry: "Information Technology & Cloud",
    founded_year: "2016",
    careers_url: "",
    linkedin_url: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          founded_year: formData.founded_year ? Number(formData.founded_year) : null,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSubmitted(true);
      } else {
        alert(json.message || "Failed to add company.");
      }
    } catch {
      alert("Error occurred while adding company.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardShell role="PLACEMENT_TEAM">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Add Recruiting Company
          </h1>
          <p className="text-xs font-medium text-slate-600">
            SUBMIT NEW ENTERPRISE FOR ADMIN APPROVAL
          </p>
        </div>

        {submitted ? (
          <Card className="p-8 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#10B981]/20 text-[#10B981]">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Company Submitted Successfully!</h3>
            <p className="mx-auto max-w-md text-xs text-slate-600">
              '{formData.company_name}' has been submitted for Admin verification. It will appear across active drives as soon as approved.
            </p>
            <div className="pt-4">
              <Button onClick={() => router.push("/placement-team/companies")}>
                Return to Companies Directory
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Company Name *"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Primary Location / City *"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Select
                  label="Industry *"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                >
                  <option value="Information Technology & Cloud">IT & Cloud</option>
                  <option value="Software & Technology">Software & Technology</option>
                  <option value="Enterprise SaaS">Enterprise SaaS</option>
                  <option value="Semiconductors & Telecommunications">Semiconductors</option>
                  <option value="Artificial Intelligence">Artificial Intelligence</option>
                </Select>

                <Select
                  label="Company Size"
                  name="company_size"
                  value={formData.company_size}
                  onChange={handleChange}
                >
                  <option value="10-50 employees">10-50 employees</option>
                  <option value="50-200 employees">50-200 employees</option>
                  <option value="500-1,000 employees">500-1,000 employees</option>
                  <option value="1,000-5,000 employees">1,000-5,000 employees</option>
                  <option value="10,000+ employees">10,000+ employees</option>
                </Select>

                <Input
                  label="Founded Year"
                  name="founded_year"
                  type="number"
                  value={formData.founded_year}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Input
                  label="Contact Person"
                  name="contact_person_name"
                  value={formData.contact_person_name}
                  onChange={handleChange}
                />
                <Input
                  label="Contact Email"
                  name="contact_person_email"
                  type="email"
                  value={formData.contact_person_email}
                  onChange={handleChange}
                />
                <Input
                  label="Contact Phone"
                  name="contact_person_phone"
                  value={formData.contact_person_phone}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Website URL"
                  name="website"
                  placeholder="https://..."
                  value={formData.website}
                  onChange={handleChange}
                />
                <Input
                  label="Google Maps URL"
                  name="google_maps_url"
                  placeholder="https://maps.google.com/..."
                  value={formData.google_maps_url}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                  Company Description
                </label>
                <textarea
                  name="company_description"
                  rows={3}
                  value={formData.company_description}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-900 focus:border-[#0284C7] focus:outline-none"
                  placeholder="Recruitment focus, hiring profiles, and tech stack..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <Button type="button" variant="secondary" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={loading}>
                  Submit for Approval
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}
