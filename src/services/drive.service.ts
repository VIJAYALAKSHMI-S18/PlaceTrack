import prisma from "@/lib/prisma";
import { DriveStatus, OpportunityStatus, Role, DriveStatistics } from "@/types";
import { Prisma } from "@prisma/client";
import { evaluateStudentEligibility, DriveEligibilityCriteria, StudentEligibilityInput } from "./eligibility.service";
import { parseJsonSafe } from "@/lib/utils";

export interface DriveFilterParams {
  search?: string;
  companyId?: string;
  driveStatus?: string;
  opportunityStatus?: string;
  department?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export async function getPlacementDrives(params: DriveFilterParams) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, Math.min(100, params.limit || 10));
  const skip = (page - 1) * limit;

  const where: Prisma.PlacementDriveWhereInput = {
    deleted_at: null,
  };

  if (params.companyId) {
    where.company_id = params.companyId;
  }

  if (params.driveStatus && params.driveStatus !== "ALL") {
    where.drive_status = params.driveStatus as DriveStatus;
  }

  if (params.opportunityStatus && params.opportunityStatus !== "ALL") {
    where.opportunity_status = params.opportunityStatus as OpportunityStatus;
  }

  if (params.search && params.search.trim()) {
    const term = params.search.trim();
    where.OR = [
      { job_title: { contains: term } },
      { job_role: { contains: term } },
      { company: { company_name: { contains: term } } },
      { drive_location: { contains: term } },
    ];
  }

  const orderBy: Prisma.PlacementDriveOrderByWithRelationInput = {};
  const sortField = params.sortBy || "created_at";
  const sortDirection = params.sortOrder || "desc";
  (orderBy as any)[sortField] = sortDirection;

  const [drives, total] = await Promise.all([
    prisma.placementDrive.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        company: {
          select: {
            id: true,
            company_name: true,
            location: true,
            industry: true,
            company_logo: true,
            status: true,
          },
        },
        _count: {
          select: {
            students: true,
            evaluations: true,
            offers: true,
          },
        },
      },
    }),
    prisma.placementDrive.count({ where }),
  ]);

  return {
    drives,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getPlacementDriveById(id: string) {
  return prisma.placementDrive.findUnique({
    where: { id },
    include: {
      company: true,
      students: {
        include: {
          student: true,
        },
        orderBy: { created_at: "asc" },
      },
      offers: {
        include: {
          student: true,
        },
        orderBy: { offer_date: "desc" },
      },
      evaluations: {
        include: {
          student: true,
        },
        orderBy: { ats_score: "desc" },
      },
    },
  });
}

export async function createPlacementDrive(data: any, userId?: string) {
  return prisma.placementDrive.create({
    data: {
      company_id: data.company_id,
      job_title: data.job_title,
      job_role: data.job_role || data.job_title,
      drive_date: data.drive_date ? new Date(data.drive_date) : null,
      drive_location: data.drive_location || null,
      drive_type: data.drive_type || "ON_CAMPUS",
      eligible_departments: Array.isArray(data.eligible_departments)
        ? JSON.stringify(data.eligible_departments)
        : data.eligible_departments || "[]",
      minimum_cgpa: data.minimum_cgpa ? Number(data.minimum_cgpa) : null,
      maximum_backlogs: data.maximum_backlogs !== undefined ? Number(data.maximum_backlogs) : 0,
      eligible_graduation_years: Array.isArray(data.eligible_graduation_years)
        ? JSON.stringify(data.eligible_graduation_years)
        : data.eligible_graduation_years || null,
      minimum_ug_percentage: data.minimum_ug_percentage ? Number(data.minimum_ug_percentage) : null,
      minimum_hsc_percentage: data.minimum_hsc_percentage ? Number(data.minimum_hsc_percentage) : null,
      minimum_sslc_percentage: data.minimum_sslc_percentage ? Number(data.minimum_sslc_percentage) : null,
      minimum_ats_score: data.minimum_ats_score ? Number(data.minimum_ats_score) : 70,
      job_description_summary: data.job_description_summary || null,
      jd_pdf_url: data.jd_pdf_url || null,
      official_careers_url: data.official_careers_url || null,
      ctc_lpa: data.ctc_lpa ? Number(data.ctc_lpa) : null,
      drive_status: data.drive_status || "UPCOMING",
      opportunity_status: data.opportunity_status || "OPEN",
      required_skills: Array.isArray(data.required_skills)
        ? JSON.stringify(data.required_skills)
        : data.required_skills || null,
      preferred_skills: Array.isArray(data.preferred_skills)
        ? JSON.stringify(data.preferred_skills)
        : data.preferred_skills || null,
      created_by_id: userId || null,
    },
  });
}

export async function updatePlacementDrive(id: string, data: any) {
  const updateData: any = { ...data };
  if (data.drive_date) updateData.drive_date = new Date(data.drive_date);
  if (Array.isArray(data.eligible_departments)) {
    updateData.eligible_departments = JSON.stringify(data.eligible_departments);
  }
  if (Array.isArray(data.eligible_graduation_years)) {
    updateData.eligible_graduation_years = JSON.stringify(data.eligible_graduation_years);
  }
  if (Array.isArray(data.required_skills)) {
    updateData.required_skills = JSON.stringify(data.required_skills);
  }
  if (Array.isArray(data.preferred_skills)) {
    updateData.preferred_skills = JSON.stringify(data.preferred_skills);
  }
  if (data.minimum_cgpa !== undefined) updateData.minimum_cgpa = data.minimum_cgpa ? Number(data.minimum_cgpa) : null;
  if (data.maximum_backlogs !== undefined) updateData.maximum_backlogs = Number(data.maximum_backlogs);
  if (data.minimum_ug_percentage !== undefined) updateData.minimum_ug_percentage = data.minimum_ug_percentage ? Number(data.minimum_ug_percentage) : null;
  if (data.minimum_hsc_percentage !== undefined) updateData.minimum_hsc_percentage = data.minimum_hsc_percentage ? Number(data.minimum_hsc_percentage) : null;
  if (data.minimum_sslc_percentage !== undefined) updateData.minimum_sslc_percentage = data.minimum_sslc_percentage ? Number(data.minimum_sslc_percentage) : null;
  if (data.minimum_ats_score !== undefined) updateData.minimum_ats_score = Number(data.minimum_ats_score);
  if (data.ctc_lpa !== undefined) updateData.ctc_lpa = data.ctc_lpa ? Number(data.ctc_lpa) : null;

  return prisma.placementDrive.update({
    where: { id },
    data: updateData,
  });
}

export async function calculateDriveStatistics(driveId: string): Promise<DriveStatistics> {
  const [participatedCount, offers] = await Promise.all([
    prisma.driveStudent.count({
      where: { placement_drive_id: driveId },
    }),
    prisma.offer.findMany({
      where: { placement_drive_id: driveId },
      select: { ctc_lpa: true, offer_status: true, student_id: true },
    }),
  ]);

  const uniqueSelected = new Set(offers.map((o) => o.student_id)).size;
  const totalOffers = offers.length;

  if (offers.length === 0) {
    return {
      studentsParticipated: participatedCount,
      studentsSelected: uniqueSelected,
      totalOffers: 0,
      highestCtc: 0,
      averageCtc: 0,
      lowestCtc: 0,
    };
  }

  const ctcs = offers.map((o) => o.ctc_lpa).filter((c) => c > 0);
  const highestCtc = ctcs.length > 0 ? Math.max(...ctcs) : 0;
  const lowestCtc = ctcs.length > 0 ? Math.min(...ctcs) : 0;
  const averageCtc = ctcs.length > 0 ? Math.round((ctcs.reduce((a, b) => a + b, 0) / ctcs.length) * 100) / 100 : 0;

  return {
    studentsParticipated: Math.max(participatedCount, uniqueSelected),
    studentsSelected: uniqueSelected,
    totalOffers,
    highestCtc,
    averageCtc,
    lowestCtc,
  };
}

/**
 * Bulk Evaluate Students against a specific Drive
 */
export async function evaluateAllStudentsForDrive(driveId: string) {
  const drive = await prisma.placementDrive.findUnique({
    where: { id: driveId },
  });
  if (!drive) throw new Error("Placement drive not found.");

  const students = await prisma.student.findMany({
    where: { deleted_at: null },
    include: {
      offers: {
        include: {
          company: true,
          drive: true,
        },
      },
    },
  });

  const criteria: DriveEligibilityCriteria = {
    driveId: drive.id,
    companyName: drive.company?.company_name,
    eligibleDepartments: parseJsonSafe<string[]>(drive.eligible_departments, []),
    minimumCgpa: drive.minimum_cgpa,
    maximumBacklogs: drive.maximum_backlogs,
    eligibleGraduationYears: parseJsonSafe<number[]>(drive.eligible_graduation_years, []),
    minimumUgPercentage: drive.minimum_ug_percentage,
    minimumHscPercentage: drive.minimum_hsc_percentage,
    minimumSslcPercentage: drive.minimum_sslc_percentage,
    minimumAtsScore: drive.minimum_ats_score,
    jobDescriptionSummary: drive.job_description_summary,
    requiredSkills: parseJsonSafe<string[]>(drive.required_skills, []),
    preferredSkills: parseJsonSafe<string[]>(drive.preferred_skills, []),
  };

  const results = [];

  for (const student of students) {
    const acceptedOffer = student.offers?.[0];
    const studentInput: StudentEligibilityInput = {
      department: student.department,
      studentType: student.student_type,
      sslcPercentage: student.sslc_percentage,
      hscPercentage: student.hsc_percentage,
      ugPercentage: student.ug_percentage,
      pgPercentage: student.pg_percentage,
      cgpa: student.cgpa,
      backlogs: student.backlogs,
      graduationYear: student.graduation_year,
      resumeText: student.parsed_resume_text || `${student.name} skills: ${student.skills || ""}`,
      skills: parseJsonSafe<string[]>(student.skills, []),
      placementStatus: student.placement_status,
      placedCompanyName: acceptedOffer?.company?.company_name || null,
      placedDriveId: acceptedOffer?.placement_drive_id || null,
    };

    const evalResult = evaluateStudentEligibility(studentInput, criteria);

    // Upsert into StudentJobEvaluation cache
    const evaluation = await prisma.studentJobEvaluation.upsert({
      where: {
        student_id_placement_drive_id: {
          student_id: student.id,
          placement_drive_id: driveId,
        },
      },
      update: {
        ats_score: evalResult.breakdown.atsScore,
        skill_match_score: evalResult.breakdown.skillMatchScore,
        semantic_match_score: evalResult.breakdown.semanticMatchScore,
        education_score: evalResult.breakdown.educationScore,
        experience_score: evalResult.breakdown.experienceScore,
        project_score: evalResult.breakdown.projectScore,
        matched_skills: JSON.stringify(evalResult.breakdown.matchedSkills),
        missing_skills: JSON.stringify(evalResult.breakdown.missingSkills),
        eligibility_status: evalResult.eligibilityStatus,
        eligibility_reasons: JSON.stringify(evalResult.eligibilityReasons),
        evaluated_at: new Date(),
      },
      create: {
        student_id: student.id,
        placement_drive_id: driveId,
        ats_score: evalResult.breakdown.atsScore,
        skill_match_score: evalResult.breakdown.skillMatchScore,
        semantic_match_score: evalResult.breakdown.semanticMatchScore,
        education_score: evalResult.breakdown.educationScore,
        experience_score: evalResult.breakdown.experienceScore,
        project_score: evalResult.breakdown.projectScore,
        matched_skills: JSON.stringify(evalResult.breakdown.matchedSkills),
        missing_skills: JSON.stringify(evalResult.breakdown.missingSkills),
        eligibility_status: evalResult.eligibilityStatus,
        eligibility_reasons: JSON.stringify(evalResult.eligibilityReasons),
      },
    });

    results.push(evaluation);
  }

  return {
    totalEvaluated: results.length,
    eligibleCount: results.filter((r) => r.eligibility_status === "ELIGIBLE").length,
    conditionalCount: results.filter((r) => r.eligibility_status === "CONDITIONALLY_ELIGIBLE").length,
    notEligibleCount: results.filter((r) => r.eligibility_status === "NOT_ELIGIBLE").length,
    evaluations: results,
  };
}
