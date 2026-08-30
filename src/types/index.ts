export type Role = "ADMIN" | "MANAGER" | "PLACEMENT_TEAM";

export type PlacementStatus = "NOT_PLACED" | "PLACED" | "MULTIPLE_OFFERS" | "WITHDRAWN";

export type CompanyStatus = "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED" | "ARCHIVED";

export type SubmissionStatus = "PENDING" | "APPROVED" | "REJECTED";

export type DriveType = "ON_CAMPUS" | "OFF_CAMPUS" | "VIRTUAL" | "POOLED";

export type DriveStatus = "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";

export type OpportunityStatus = "OPEN" | "CLOSED";

export type DriveStudentStatus =
  | "APPLIED"
  | "SHORTLISTED"
  | "REJECTED"
  | "ATTENDED"
  | "CLEARED_ROUND_1"
  | "CLEARED_ROUND_2"
  | "OFFERED";

export type EligibilityStatus =
  | "ELIGIBLE"
  | "CONDITIONALLY_ELIGIBLE"
  | "NOT_ELIGIBLE"
  | "EVALUATION_FAILED";

export type OfferStatus = "OFFERED" | "ACCEPTED" | "REJECTED" | "JOINED";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  departmentId?: string | null;
  phone?: string | null;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  errors?: Record<string, string[]>;
}

export interface StudentExcelRow {
  name: string;
  register_number: string;
  department: string;
  student_type: string;
  email: string;
  phone_number: string;
  sslc_percentage: number;
  hsc_percentage: number;
  ug_percentage: number;
  pg_percentage?: number | null;
  resume_url?: string | null;
  self_intro_url?: string | null;
  linkedin_url?: string | null;
  github_url?: string | null;
  portfolio_url?: string | null;
}

export interface AtsScoreBreakdown {
  atsScore: number;
  skillMatchScore: number;
  semanticMatchScore: number;
  educationScore: number;
  experienceScore: number;
  projectScore: number;
  matchedSkills: string[];
  missingSkills: string[];
}

export interface EligibilityResult {
  eligibilityStatus: EligibilityStatus;
  eligibilityReasons: string[];
  passedAcademic: boolean;
  passedAts: boolean;
  breakdown: AtsScoreBreakdown;
}

export interface DriveStatistics {
  studentsParticipated: number;
  studentsSelected: number;
  totalOffers: number;
  highestCtc: number;
  averageCtc: number;
  lowestCtc: number;
}
