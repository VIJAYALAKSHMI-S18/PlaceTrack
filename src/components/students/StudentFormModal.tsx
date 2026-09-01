"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { Input, Select } from "../ui/Input";
import { Button } from "../ui/Button";

interface StudentFormModalProps {
  isOpen: boolean;
  student?: any | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  student,
  onClose,
  onSuccess,
}) => {
  const isEdit = !!student;
  const [formData, setFormData] = useState({
    name: "",
    register_number: "",
    department: "CSE",
    student_type: "Regular",
    email: "",
    phone_number: "",
    sslc_percentage: "",
    hsc_percentage: "",
    ug_percentage: "",
    pg_percentage: "",
    cgpa: "",
    backlogs: "0",
    graduation_year: "2025",
    placement_status: "NOT_PLACED",
    resume_url: "",
    self_intro_url: "",
    linkedin_url: "",
    github_url: "",
    portfolio_url: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || "",
        register_number: student.register_number || "",
        department: student.department || "CSE",
        student_type: student.student_type || "Regular",
        email: student.email || "",
        phone_number: student.phone_number || "",
        sslc_percentage: student.sslc_percentage?.toString() || "",
        hsc_percentage: student.hsc_percentage?.toString() || "",
        ug_percentage: student.ug_percentage?.toString() || "",
        pg_percentage: student.pg_percentage?.toString() || "",
        cgpa: student.cgpa?.toString() || "",
        backlogs: (student.backlogs ?? 0).toString(),
        graduation_year: student.graduation_year?.toString() || "2025",
        placement_status: student.placement_status || "NOT_PLACED",
        resume_url: student.resume_url || "",
        self_intro_url: student.self_intro_url || "",
        linkedin_url: student.linkedin_url || "",
        github_url: student.github_url || "",
        portfolio_url: student.portfolio_url || "",
      });
    }
  }, [student]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const url = isEdit ? `/api/students/${student.id}` : "/api/students";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          sslc_percentage: Number(formData.sslc_percentage),
          hsc_percentage: Number(formData.hsc_percentage),
          ug_percentage: Number(formData.ug_percentage),
          pg_percentage: formData.pg_percentage ? Number(formData.pg_percentage) : null,
          cgpa: formData.cgpa ? Number(formData.cgpa) : null,
          backlogs: Number(formData.backlogs || 0),
          graduation_year: formData.graduation_year ? Number(formData.graduation_year) : null,
        }),
      });

      const json = await res.json();
      if (json.success) {
        onSuccess();
      } else {
        if (json.errors) {
          const flatErr: Record<string, string> = {};
          Object.entries(json.errors).forEach(([k, v]: any) => {
            flatErr[k] = Array.isArray(v) ? v[0] : v;
          });
          setErrors(flatErr);
        } else {
          alert(json.message || "Failed to save student record.");
        }
      }
    } catch {
      alert("Error occurred while saving student.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Student Profile" : "Add New Student"}
      description="Enter exact academic and profile parameters."
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Full Name *"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
          />
          <Input
            label="Register Number *"
            name="register_number"
            value={formData.register_number}
            onChange={handleChange}
            error={errors.register_number}
            required
            disabled={isEdit}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Select
            label="Department *"
            name="department"
            value={formData.department}
            onChange={handleChange}
          >
            <option value="CSE">Computer Science (CSE)</option>
            <option value="IT">Information Tech (IT)</option>
            <option value="AIDS">AI & Data Science (AIDS)</option>
            <option value="ECE">Electronics (ECE)</option>
            <option value="MECH">Mechanical (MECH)</option>
            <option value="EEE">Electrical (EEE)</option>
          </Select>

          <Select
            label="Student Type *"
            name="student_type"
            value={formData.student_type}
            onChange={handleChange}
          >
            <option value="Regular">Regular</option>
            <option value="Lateral Entry">Lateral Entry</option>
          </Select>

          <Input
            label="Graduation Year"
            name="graduation_year"
            type="number"
            value={formData.graduation_year}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Email Address *"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
          />
          <Input
            label="Phone Number *"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            error={errors.phone_number}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Input
            label="SSLC % *"
            name="sslc_percentage"
            type="number"
            step="0.1"
            value={formData.sslc_percentage}
            onChange={handleChange}
            error={errors.sslc_percentage}
            required
          />
          <Input
            label="HSC % *"
            name="hsc_percentage"
            type="number"
            step="0.1"
            value={formData.hsc_percentage}
            onChange={handleChange}
            error={errors.hsc_percentage}
            required
          />
          <Input
            label="UG % *"
            name="ug_percentage"
            type="number"
            step="0.1"
            value={formData.ug_percentage}
            onChange={handleChange}
            error={errors.ug_percentage}
            required
          />
          <Input
            label="PG % (Optional)"
            name="pg_percentage"
            type="number"
            step="0.1"
            value={formData.pg_percentage}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            label="CGPA"
            name="cgpa"
            type="number"
            step="0.01"
            value={formData.cgpa}
            onChange={handleChange}
          />
          <Input
            label="Current Backlogs"
            name="backlogs"
            type="number"
            value={formData.backlogs}
            onChange={handleChange}
          />
          <Select
            label="Placement Status"
            name="placement_status"
            value={formData.placement_status}
            onChange={handleChange}
          >
            <option value="NOT_PLACED">Not Placed</option>
            <option value="PLACED">Placed</option>
            <option value="MULTIPLE_OFFERS">Multiple Offers</option>
            <option value="WITHDRAWN">Withdrawn</option>
          </Select>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Resume URL"
            name="resume_url"
            value={formData.resume_url}
            onChange={handleChange}
            error={errors.resume_url}
          />
          <Input
            label="Self Introduction Video URL"
            name="self_intro_url"
            value={formData.self_intro_url}
            onChange={handleChange}
            error={errors.self_intro_url}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            label="LinkedIn URL"
            name="linkedin_url"
            value={formData.linkedin_url}
            onChange={handleChange}
            error={errors.linkedin_url}
          />
          <Input
            label="GitHub URL"
            name="github_url"
            value={formData.github_url}
            onChange={handleChange}
            error={errors.github_url}
          />
          <Input
            label="Portfolio URL"
            name="portfolio_url"
            value={formData.portfolio_url}
            onChange={handleChange}
            error={errors.portfolio_url}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            {isEdit ? "Update Student" : "Create Student"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
