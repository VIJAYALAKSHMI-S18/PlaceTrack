import { z } from "zod";

export const driveCreateSchema = z.object({
  company_id: z.string().min(1, "Company ID is required"),
  job_title: z.string().min(1, "Job title is required"),
  job_role: z.string().nullable().optional(),
  drive_date: z.string().or(z.date()).nullable().optional(),
  drive_location: z.string().nullable().optional(),
  drive_type: z.enum(["ON_CAMPUS", "OFF_CAMPUS", "VIRTUAL", "POOLED"]).default("ON_CAMPUS"),
  eligible_departments: z.array(z.string()).min(1, "At least one department is required"),
  minimum_cgpa: z.coerce.number().min(0).max(10).nullable().optional(),
  maximum_backlogs: z.coerce.number().int().min(0).default(0),
  eligible_graduation_years: z.array(z.number()).optional(),
  minimum_ug_percentage: z.coerce.number().min(0).max(100).nullable().optional(),
  minimum_hsc_percentage: z.coerce.number().min(0).max(100).nullable().optional(),
  minimum_sslc_percentage: z.coerce.number().min(0).max(100).nullable().optional(),
  minimum_ats_score: z.coerce.number().min(0).max(100).default(70),
  job_description_summary: z.string().nullable().optional(),
  jd_pdf_url: z.string().url("Invalid JD PDF URL").nullable().optional().or(z.literal("")),
  official_careers_url: z.string().url("Invalid Official Careers URL").nullable().optional().or(z.literal("")),
  ctc_lpa: z.coerce.number().min(0).nullable().optional(),
  drive_status: z.enum(["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"]).default("UPCOMING"),
  opportunity_status: z.enum(["OPEN", "CLOSED"]).default("OPEN"),
  required_skills: z.array(z.string()).optional(),
  preferred_skills: z.array(z.string()).optional(),
});

export const driveUpdateSchema = driveCreateSchema.partial();
