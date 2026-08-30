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
}

export interface DriveEligibilityCriteria {
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

export function evaluateStudentEligibility(
  student: StudentEligibilityInput,
  drive: DriveEligibilityCriteria
): EligibilityResult {
  const reasons: string[] = [];
  let passedAcademic = true;

  // 1. Department Check
  const normalizedEligibleDepts = drive.eligibleDepartments.map((d) => d.trim().toUpperCase());
  const studentDept = student.department.trim().toUpperCase();
  if (
    normalizedEligibleDepts.length > 0 &&
    !normalizedEligibleDepts.includes("ALL") &&
    !normalizedEligibleDepts.includes(studentDept)
  ) {
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
