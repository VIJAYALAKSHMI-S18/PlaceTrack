import { EligibilityResult, EligibilityStatus } from "@/types";
import { evaluateAtsScore, AtsEvaluationInput } from "./ats.service";

export interface StudentEligibilityInput {
  department: string;
  studentType: string;
  sslcPercentage: number;
  hscPercentage: number;
  ugPercentage: number;
  pgPercentage?: number | null;
  cgpa?: number | null;
  backlogs: number;
  graduationYear?: number | null;
  resumeText: string;
  skills?: string[];
  placementStatus?: string;
  placedCompanyName?: string | null;
  placedDriveId?: string | null;
}

export interface DriveEligibilityCriteria {
  driveId?: string;
  companyName?: string;
  eligibleDepartments: string[];
  minimumCgpa?: number | null;
  maximumBacklogs?: number | null;
  eligibleGraduationYears?: number[];
  minimumUgPercentage?: number | null;
  minimumHscPercentage?: number | null;
  minimumSslcPercentage?: number | null;
  minimumAtsScore: number;
  jobDescriptionSummary?: string | null;
  requiredSkills?: string[];
  preferredSkills?: string[];
  conditionalTolerance?: number; // e.g. 5 points
}

const DEPARTMENT_ALIASES: Record<string, string[]> = {
  CSE: ["CSE", "COMPUTER SCIENCE", "COMPUTER SCIENCE AND ENGINEERING", "CS", "CYBER SECURITY", "SOFTWARE ENGINEERING"],
  IT: ["IT", "INFORMATION TECHNOLOGY", "INFO TECH"],
  AIDS: ["AIDS", "AI&DS", "AI & DS", "ARTIFICIAL INTELLIGENCE AND DATA SCIENCE", "ARTIFICIAL INTELLIGENCE & DATA SCIENCE", "DATA SCIENCE", "AI", "ML"],
  ECE: ["ECE", "ELECTRONICS AND COMMUNICATION", "ELECTRONICS AND COMMUNICATION ENGINEERING", "ELECTRONICS & COMMUNICATION"],
  EEE: ["EEE", "ELECTRICAL AND ELECTRONICS", "ELECTRICAL AND ELECTRONICS ENGINEERING", "ELECTRICAL & ELECTRONICS"],
  MECH: ["MECH", "MECHANICAL", "MECHANICAL ENGINEERING"],
  CIVIL: ["CIVIL", "CIVIL ENGINEERING"],
  BBA: ["BBA", "BUSINESS ADMINISTRATION", "MANAGEMENT", "MBA"],
  COMMERCE: ["COMMERCE", "B.COM", "BCOM", "FINANCE"],
  BIOTECH: ["BIOTECH", "BIOTECHNOLOGY", "BIO TECH"],
};

export function isDepartmentEligible(studentDeptRaw: string, eligibleDeptsRaw: string[]): boolean {
  if (!eligibleDeptsRaw || eligibleDeptsRaw.length === 0) return true;
  const eligibleUpper = eligibleDeptsRaw.map((d) => d.trim().toUpperCase());
  if (eligibleUpper.includes("ALL")) return true;

  const sUpper = studentDeptRaw.trim().toUpperCase();

  // 1. Direct match
  if (eligibleUpper.includes(sUpper)) return true;

  // 2. Substring & Alias matching
  for (const eligible of eligibleUpper) {
    if (eligible === sUpper) return true;
    const aliases = DEPARTMENT_ALIASES[eligible] || [];
    if (aliases.some((a) => a === sUpper || sUpper.includes(a) || a.includes(sUpper))) {
      return true;
    }
  }

  // 3. Reverse lookup
  for (const [canonical, aliases] of Object.entries(DEPARTMENT_ALIASES)) {
    if (aliases.some((a) => a === sUpper || sUpper.includes(a))) {
      if (eligibleUpper.includes(canonical) || eligibleUpper.some((e) => aliases.includes(e))) {
        return true;
      }
    }
  }

  return false;
}

export function evaluateStudentEligibility(
  student: StudentEligibilityInput,
  drive: DriveEligibilityCriteria
): EligibilityResult {
  const reasons: string[] = [];
  let passedAcademic = true;

  // 0. Institutional Policy: Placed Students are NOT eligible for other company drives
  const isAlreadyPlaced = student.placementStatus === "PLACED" || student.placementStatus === "MULTIPLE_OFFERS";
  const isDifferentDrive = drive.driveId && student.placedDriveId && student.placedDriveId !== drive.driveId;
  const isDifferentCompany = drive.companyName && student.placedCompanyName && student.placedCompanyName.toLowerCase() !== drive.companyName.toLowerCase();

  if (isAlreadyPlaced && (isDifferentDrive || isDifferentCompany)) {
    passedAcademic = false;
    reasons.push(
      `Already Placed at ${student.placedCompanyName || "another corporate partner"} — Ineligible for other drives under Institutional One Student, One Job Policy`
    );
  }

  // 1. Department Check with full alias resolution
  if (!isDepartmentEligible(student.department, drive.eligibleDepartments)) {
    passedAcademic = false;
    reasons.push(`Department mismatch: Expected ${drive.eligibleDepartments.join(", ")}, got ${student.department}`);
  }

  // 2. Minimum UG Percentage Check
  if (drive.minimumUgPercentage !== null && drive.minimumUgPercentage !== undefined) {
    if (student.ugPercentage < drive.minimumUgPercentage) {
      passedAcademic = false;
      reasons.push(
        `UG Percentage below threshold: Required ${drive.minimumUgPercentage}%, student has ${student.ugPercentage}%`
      );
    }
  }

  // 3. Minimum CGPA Check (if specified)
  if (drive.minimumCgpa !== null && drive.minimumCgpa !== undefined && student.cgpa !== null && student.cgpa !== undefined) {
    if (student.cgpa < drive.minimumCgpa) {
      passedAcademic = false;
      reasons.push(`CGPA below threshold: Required ${drive.minimumCgpa}, student has ${student.cgpa}`);
    }
  }

  // 4. Minimum HSC Percentage Check
  if (drive.minimumHscPercentage !== null && drive.minimumHscPercentage !== undefined) {
    if (student.hscPercentage < drive.minimumHscPercentage) {
      passedAcademic = false;
      reasons.push(
        `HSC Percentage below threshold: Required ${drive.minimumHscPercentage}%, student has ${student.hscPercentage}%`
      );
    }
  }

  // 5. Minimum SSLC Percentage Check
  if (drive.minimumSslcPercentage !== null && drive.minimumSslcPercentage !== undefined) {
    if (student.sslcPercentage < drive.minimumSslcPercentage) {
      passedAcademic = false;
      reasons.push(
        `SSLC Percentage below threshold: Required ${drive.minimumSslcPercentage}%, student has ${student.sslcPercentage}%`
      );
    }
  }

  // 6. Backlogs Check
  const maxAllowedBacklogs = drive.maximumBacklogs ?? 0;
  if (student.backlogs > maxAllowedBacklogs) {
    passedAcademic = false;
    reasons.push(
      `Backlogs exceeded: Allowed maximum ${maxAllowedBacklogs}, student has ${student.backlogs}`
    );
  }

  // 7. Graduation Year Check
  if (
    drive.eligibleGraduationYears &&
    drive.eligibleGraduationYears.length > 0 &&
    student.graduationYear
  ) {
    if (!drive.eligibleGraduationYears.includes(student.graduationYear)) {
      passedAcademic = false;
      reasons.push(
        `Graduation year ineligible: Expected ${drive.eligibleGraduationYears.join(", ")}, student is ${student.graduationYear}`
      );
    }
  }

  // 8. Calculate ATS Resume Score
  const atsInput: AtsEvaluationInput = {
    studentResumeText: student.resumeText,
    studentSkills: student.skills,
    studentCgpa: student.cgpa,
    studentUgPercentage: student.ugPercentage,
    jdSummary: drive.jobDescriptionSummary,
    requiredSkills: drive.requiredSkills || [],
    preferredSkills: drive.preferredSkills || [],
  };
  const breakdown = evaluateAtsScore(atsInput);

  const minAts = drive.minimumAtsScore || 70;
  const tolerance = drive.conditionalTolerance ?? 5;
  const passedAts = breakdown.atsScore >= minAts;

  // 9. Combine Academic & ATS Rules
  // CRITICAL RULE: High ATS score CANNOT bypass academic failures
  let eligibilityStatus: EligibilityStatus = "ELIGIBLE";

  if (!passedAcademic) {
    eligibilityStatus = "NOT_ELIGIBLE";
  } else if (passedAts) {
    eligibilityStatus = "ELIGIBLE";
    reasons.push("All academic criteria and ATS threshold satisfied.");
  } else if (breakdown.atsScore >= minAts - tolerance) {
    eligibilityStatus = "CONDITIONALLY_ELIGIBLE";
    reasons.push(
      `ATS Score ${breakdown.atsScore} is within conditional tolerance (${minAts - tolerance} - ${minAts}) while academic criteria passed.`
    );
  } else {
    eligibilityStatus = "NOT_ELIGIBLE";
    reasons.push(`ATS Score ${breakdown.atsScore} is below required threshold of ${minAts}.`);
  }

  return {
    eligibilityStatus,
    eligibilityReasons: reasons,
    passedAcademic,
    passedAts,
    breakdown,
  };
}
