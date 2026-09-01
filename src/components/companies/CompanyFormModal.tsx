"use client";

import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { Input, Select } from "../ui/Input";
import { Button } from "../ui/Button";
import { Role } from "@/types";
import { MapPin, Building, Globe } from "lucide-react";

interface CompanyFormModalProps {
  isOpen: boolean;
  role: Role;
  onClose: () => void;
  onSuccess: () => void;
}

export const CompanyFormModal: React.FC<CompanyFormModalProps> = ({
  isOpen,
  role,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    company_name: "",
    location: "",
    website: "",
    company_size: "1,000-5,000 employees",
    company_address: "",
    formatted_address: "",
    google_maps_url: "",
    contact_person_name: "",
    contact_person_phone: "",
    contact_person_email: "",
    company_description: "",
    industry: "Information Technology & Cloud",
    founded_year: "2015",
    careers_url: "",
    linkedin_url: "",
  });
  const [loading, setLoading] = useState(false);

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
        alert(
          role === "ADMIN"
            ? "Company created and approved successfully."
            : "Company submitted for Admin approval queue."
        );
        onSuccess();
      } else {
        alert(json.message || "Failed to submit company.");
      }
    } catch {
      alert("Error occurred while saving company.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={role === "ADMIN" ? "Add New Recruiting Company" : "Submit Company for Admin Approval"}
      description={
        role === "ADMIN"
          ? "Admin created companies are approved directly."
          : "Company will be reviewed by the Placement Admin before becoming active."
      }
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Company Name *"
            name="company_name"
            placeholder="e.g. Acme Tech Solutions"
            value={formData.company_name}
            onChange={handleChange}
            required
          />
          <Input
            label="Primary Location / City *"
            name="location"
            placeholder="e.g. Bangalore, Karnataka"
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
            <option value="Consulting & Services">Consulting & Services</option>
          </Select>

          <Select
            label="Company Size"
            name="company_size"
            value={formData.company_size}
            onChange={handleChange}
          >
            <option value="10-50 employees">10-50 employees</option>
            <option value="50-200 employees">50-200 employees</option>
            <option value="200-1,000 employees">200-1,000 employees</option>
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

        {/* Location & Google Maps Abstraction */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0284C7]">
            <MapPin className="h-4 w-4" /> Location & Map Integration
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="Office Campus Address"
              name="company_address"
              placeholder="e.g. RMZ Tech Park, Whitefield"
              value={formData.company_address}
              onChange={handleChange}
            />
            <Input
              label="Google Maps URL / Coordinates Fallback"
              name="google_maps_url"
              placeholder="https://maps.google.com/?q=..."
              value={formData.google_maps_url}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            label="Contact Person Name"
            name="contact_person_name"
            placeholder="e.g. HR Director / Recruiter"
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

        {/* Links */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            label="Official Website URL"
            name="website"
            placeholder="https://example.com"
            value={formData.website}
            onChange={handleChange}
          />
          <Input
            label="Official Careers Page URL"
            name="careers_url"
            placeholder="https://example.com/careers"
            value={formData.careers_url}
            onChange={handleChange}
          />
          <Input
            label="LinkedIn Company URL"
            name="linkedin_url"
            placeholder="https://linkedin.com/company/..."
            value={formData.linkedin_url}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-600">
            Company Overview / Description
          </label>
          <textarea
            name="company_description"
            rows={3}
            value={formData.company_description}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-900 focus:border-[#0284C7] focus:outline-none"
            placeholder="Describe company operations, recruitment domain, and tech stack..."
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            {role === "ADMIN" ? "Create & Approve Company" : "Submit for Approval"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
