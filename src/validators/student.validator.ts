import { z } from "zod";

export const studentExcelSchema = z.object({
  name: z.string().min(1, "Name is required"),
  register_number: z.string().min(1, "Register number is required"),
  department: z.string().min(1, "Department is required"),
  student_type: z.string().min(1, "Student type is required"),
  email: z.string().email("Invalid email format"),
  phone_number: z.string().min(6, "Valid phone number is required"),
  sslc_percentage: z.coerce.number().min(0, "SSLC must be >= 0").max(100, "SSLC must be <= 100"),
  hsc_percentage: z.coerce.number().min(0, "HSC must be >= 0").max(100, "HSC must be <= 100"),
  ug_percentage: z.coerce.number().min(0, "UG must be >= 0").max(100, "UG must be <= 100"),
  pg_percentage: z.coerce.number().min(0).max(100).nullable().optional(),
  resume_url: z.string().url("Invalid Resume URL").nullable().optional().or(z.literal("")),
  self_intro_url: z.string().url("Invalid Self Intro URL").nullable().optional().or(z.literal("")),
  linkedin_url: z.string().url("Invalid LinkedIn URL").nullable().optional().or(z.literal("")),
  github_url: z.string().url("Invalid GitHub URL").nullable().optional().or(z.literal("")),
  portfolio_url: z.string().url("Invalid Portfolio URL").nullable().optional().or(z.literal("")),
});

export const studentCreateSchema = studentExcelSchema.extend({
  cgpa: z.coerce.number().min(0).max(10).nullable().optional(),
  backlogs: z.coerce.number().int().min(0).default(0),
  graduation_year: z.coerce.number().int().min(2000).max(2050).nullable().optional(),
  placement_status: z.enum(["NOT_PLACED", "PLACED", "MULTIPLE_OFFERS", "WITHDRAWN"]).default("NOT_PLACED"),
  skills: z.array(z.string()).optional(),
});

export const studentUpdateSchema = studentCreateSchema.partial();
