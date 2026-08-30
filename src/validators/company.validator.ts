import { z } from "zod";

export const companyCreateSchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  location: z.string().min(1, "Location is required"),
  website: z.string().url("Invalid website URL").nullable().optional().or(z.literal("")),
  company_size: z.string().nullable().optional(),
  company_address: z.string().nullable().optional(),
  google_maps_location: z.string().nullable().optional(),
  latitude: z.coerce.number().nullable().optional(),
  longitude: z.coerce.number().nullable().optional(),
  formatted_address: z.string().nullable().optional(),
  google_maps_url: z.string().nullable().optional(),
  contact_person_name: z.string().nullable().optional(),
  contact_person_phone: z.string().nullable().optional(),
  contact_person_email: z.string().email("Invalid contact email").nullable().optional().or(z.literal("")),
  company_description: z.string().nullable().optional(),
  company_logo: z.string().nullable().optional(),
  industry: z.string().nullable().optional(),
  founded_year: z.coerce.number().int().min(1800).max(2100).nullable().optional(),
  company_type: z.string().nullable().optional(),
  linkedin_url: z.string().url("Invalid LinkedIn URL").nullable().optional().or(z.literal("")),
  careers_url: z.string().url("Invalid Careers URL").nullable().optional().or(z.literal("")),
});

export const companyUpdateSchema = companyCreateSchema.partial();

export const companyRejectSchema = z.object({
  rejection_reason: z.string().min(3, "Rejection reason is mandatory and must be at least 3 characters"),
});
