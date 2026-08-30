import { z } from "zod";

export const offerCreateSchema = z.object({
  student_id: z.string().min(1, "Student ID is required"),
  company_id: z.string().min(1, "Company ID is required"),
  placement_drive_id: z.string().nullable().optional(),
  job_role: z.string().min(1, "Job role is required"),
  offer_date: z.string().or(z.date()).optional(),
  ctc_lpa: z.coerce.number().min(0, "CTC must be positive"),
  offer_status: z.enum(["OFFERED", "ACCEPTED", "REJECTED", "JOINED"]).default("OFFERED"),
  offer_letter_url: z.string().url("Invalid offer letter URL").nullable().optional().or(z.literal("")),
});

export const offerUpdateSchema = offerCreateSchema.partial();
