"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { Input, Select } from "../ui/Input";
import { Button } from "../ui/Button";

interface DriveFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const DriveFormModal: React.FC<DriveFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [companies, setCompanies] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    company_id: "",
    job_title: "",
    job_role: "",
    ctc_lpa: "8.5",
    drive_date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
    drive_location: "Campus Main Auditorium",
    drive_type: "ON_CAMPUS",
    minimum_ug_percentage: "60",
    minimum_cgpa: "6.5",
    maximum_backlogs: "0",
    minimum_ats_score: "70",
    eligible_departments: ["CSE", "IT", "AIDS"],
    required_skills: "Python, SQL, React, Git",
    preferred_skills: "Docker, AWS",
    job_description_summary: "",
    jd_pdf_url: "",
    official_careers_url: "",
    drive_status: "UPCOMING",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchApprovedCompanies();
  }, []);

  const fetchApprovedCompanies = async () => {
    try {
      const res = await fetch("/api/companies?onlyApproved=true&limit=100");
      if (res.ok) {
        const json = await res.json();
        setCompanies(json.data || []);
        if (json.data && json.data.length > 0) {
          setFormData((prev) => ({ ...prev, company_id: json.data[0].id }));
        }
      }
    } catch {
      // ignore
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDeptToggle = (dept: string) => {
    setFormData((prev) => {
      const exists = prev.eligible_departments.includes(dept);
      return {
        ...prev,
        eligible_departments: exists
          ? prev.eligible_departments.filter((d) => d !== dept)
          : [...prev.eligible_departments, dept],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company_id) {
      alert("Please select a company.");
      return;
    }
    setLoading(true);

    try {
      const reqSkills = formData.required_skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const prefSkills = formData.preferred_skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch("/api/drives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          ctc_lpa: Number(formData.ctc_lpa),
          minimum_ug_percentage: Number(formData.minimum_ug_percentage),
          minimum_cgpa: Number(formData.minimum_cgpa),
          maximum_backlogs: Number(formData.maximum_backlogs),
          minimum_ats_score: Number(formData.minimum_ats_score),
          required_skills: reqSkills,
          preferred_skills: prefSkills,
        }),
      });

      const json = await res.json();
      if (json.success) {
        alert("Placement drive scheduled successfully.");
        onSuccess();
      } else {
        alert(json.message || "Failed to schedule drive.");
      }
    } catch {
      alert("Error occurred while scheduling drive.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Placement Drive / Job Opportunity"
      description="Define job parameters, required skills, and multi-tier eligibility criteria."
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Recruiting Company *"
            name="company_id"
            value={formData.company_id}
            onChange={handleChange}
            required
          >
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.company_name} ({c.location})
              </option>
            ))}
          </Select>

          <Input
            label="Job Title / Role *"
            name="job_title"
            placeholder="e.g. Software Engineer - Backend"
            value={formData.job_title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            label="Package CTC (LPA) *"
            name="ctc_lpa"
            type="number"
            step="0.1"
            value={formData.ctc_lpa}
            onChange={handleChange}
            required
          />
          <Input
            label="Drive Date *"
            name="drive_date"
            type="date"
            value={formData.drive_date}
            onChange={handleChange}
            required
          />
          <Select
            label="Drive Type *"
            name="drive_type"
            value={formData.drive_type}
            onChange={handleChange}
          >
            <option value="ON_CAMPUS">On Campus</option>
            <option value="OFF_CAMPUS">Off Campus</option>
            <option value="VIRTUAL">Virtual / Remote</option>
            <option value="POOLED">Pooled Drive</option>
          </Select>
        </div>

        {/* Academic Eligibility Criteria */}
        <div className="rounded-xl border border-[#1E293B] bg-[#0F172A] p-4 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-[#818CF8]">
            Academic & ATS Eligibility Prerequisite Criteria
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#94A3B8]">
              Eligible Departments *
            </label>
            <div className="flex flex-wrap gap-2">
              {["CSE", "IT", "AIDS", "ECE", "MECH", "EEE"].map((dept) => {
                const isSelected = formData.eligible_departments.includes(dept);
                return (
                  <button
                    type="button"
                    key={dept}
                    onClick={() => handleDeptToggle(dept)}
                    className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                      isSelected
                        ? "bg-[#6366F1] text-white"
                        : "bg-[#1E293B] text-[#94A3B8] hover:bg-[#334155]"
                    }`}
                  >
                    {dept}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 pt-1">
            <Input
              label="Min UG % *"
              name="minimum_ug_percentage"
              type="number"
              value={formData.minimum_ug_percentage}
              onChange={handleChange}
              required
            />
            <Input
              label="Min CGPA"
              name="minimum_cgpa"
              type="number"
              step="0.1"
              value={formData.minimum_cgpa}
              onChange={handleChange}
            />
            <Input
              label="Max Allowed Backlogs"
              name="maximum_backlogs"
              type="number"
              value={formData.maximum_backlogs}
              onChange={handleChange}
            />
            <Input
              label="Min ATS Score (0-100) *"
              name="minimum_ats_score"
              type="number"
              value={formData.minimum_ats_score}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Skills & JD Info */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Required Skills (Comma separated)"
            name="required_skills"
            placeholder="Python, SQL, Machine Learning, Git"
            value={formData.required_skills}
            onChange={handleChange}
          />
          <Input
            label="Preferred Skills (Comma separated)"
            name="preferred_skills"
            placeholder="Docker, Kubernetes, AWS"
            value={formData.preferred_skills}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="JD PDF URL / Document"
            name="jd_pdf_url"
            placeholder="https://example.com/jds/swe_jd.pdf"
            value={formData.jd_pdf_url}
            onChange={handleChange}
          />
          <Input
            label="Official Careers / Application Link"
            name="official_careers_url"
            placeholder="https://company.com/jobs/..."
            value={formData.official_careers_url}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#94A3B8]">
            Job Description Summary
          </label>
          <textarea
            name="job_description_summary"
            rows={3}
            value={formData.job_description_summary}
            onChange={handleChange}
            className="w-full rounded-lg border border-[#1E293B] bg-[#0F172A] p-3 text-xs text-[#F8FAFC] focus:border-[#6366F1] focus:outline-none"
            placeholder="Key responsibilities, domain details, technical environment..."
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1E293B]">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            Schedule Placement Drive
          </Button>
        </div>
      </form>
    </Modal>
  );
};
