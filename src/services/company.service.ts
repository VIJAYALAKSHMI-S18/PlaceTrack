import prisma from "@/lib/prisma";
import { CompanyStatus, Role } from "@/types";
import { Prisma } from "@prisma/client";
import { createNotification } from "@/lib/notifications";
import { logAudit } from "@/lib/audit";

export interface CompanyFilterParams {
  search?: string;
  status?: string;
  industry?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onlyApproved?: boolean;
}

export async function getCompanies(params: CompanyFilterParams) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, Math.min(100, params.limit || 10));
  const skip = (page - 1) * limit;

  const where: Prisma.CompanyWhereInput = {
    deleted_at: null,
  };

  if (params.onlyApproved) {
    where.status = "APPROVED";
  } else if (params.status && params.status !== "ALL") {
    where.status = params.status as CompanyStatus;
  }

  if (params.industry && params.industry !== "ALL") {
    where.industry = { equals: params.industry };
  }

  if (params.search && params.search.trim()) {
    const term = params.search.trim();
    where.OR = [
      { company_name: { contains: term } },
      { location: { contains: term } },
      { industry: { contains: term } },
    ];
  }

  const orderBy: Prisma.CompanyOrderByWithRelationInput = {};
  const sortField = params.sortBy || "created_at";
  const sortDirection = params.sortOrder || "desc";
  (orderBy as any)[sortField] = sortDirection;

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        _count: {
          select: {
            drives: true,
            offers: true,
          },
        },
      },
    }),
    prisma.company.count({ where }),
  ]);

  return {
    companies,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getCompanyById(id: string) {
  return prisma.company.findUnique({
    where: { id },
    include: {
      drives: {
        where: { deleted_at: null },
        include: {
          _count: {
            select: {
              students: true,
              offers: true,
              evaluations: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
      },
      submissions: {
        include: {
          submittedBy: {
            select: { id: true, name: true, email: true, role: true },
          },
          reviewedBy: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { created_at: "desc" },
      },
      offers: {
        include: {
          student: true,
        },
        orderBy: { offer_date: "desc" },
      },
    },
  });
}

export async function createCompany(
  data: any,
  user: { id: string; role: Role; name: string; email: string }
) {
  // CRITICAL RULE: If created by MANAGER or PLACEMENT_TEAM, status MUST be PENDING_APPROVAL
  const status: CompanyStatus = user.role === "ADMIN" ? (data.status || "APPROVED") : "PENDING_APPROVAL";

  const company = await prisma.company.create({
    data: {
      company_name: data.company_name,
      location: data.location,
      website: data.website || null,
      company_size: data.company_size || null,
      company_address: data.company_address || null,
      google_maps_location: data.google_maps_location || null,
      latitude: data.latitude ? Number(data.latitude) : null,
      longitude: data.longitude ? Number(data.longitude) : null,
      formatted_address: data.formatted_address || null,
      google_maps_url: data.google_maps_url || null,
      contact_person_name: data.contact_person_name || null,
      contact_person_phone: data.contact_person_phone || null,
      contact_person_email: data.contact_person_email || null,
      company_description: data.company_description || null,
      company_logo: data.company_logo || null,
      industry: data.industry || null,
      founded_year: data.founded_year ? Number(data.founded_year) : null,
      company_type: data.company_type || null,
      linkedin_url: data.linkedin_url || null,
      careers_url: data.careers_url || null,
      status,
      created_by_id: user.id,
    },
  });

  // If pending approval, create submission record & notify admin
  if (status === "PENDING_APPROVAL") {
    await prisma.companySubmission.create({
      data: {
        company_id: company.id,
        submitted_by_id: user.id,
        status: "PENDING",
      },
    });

    await createNotification({
      title: "New Company Approval Request",
      message: `${user.name} (${user.role}) submitted '${company.company_name}' for Admin approval.`,
      type: "COMPANY_APPROVAL_REQUEST",
      targetRole: "ADMIN",
    });
  }

  await logAudit({
    userId: user.id,
    userEmail: user.email,
    role: user.role,
    action: "CREATED_COMPANY",
    entity: "Company",
    entityId: company.id,
    newValue: { company_name: company.company_name, status: company.status },
  });

  return company;
}

export async function updateCompany(
  id: string,
  data: any,
  user: { id: string; role: Role; email: string }
) {
  const oldCompany = await prisma.company.findUnique({ where: { id } });

  const updateData: any = { ...data };
  if (data.founded_year !== undefined) updateData.founded_year = data.founded_year ? Number(data.founded_year) : null;
  if (data.latitude !== undefined) updateData.latitude = data.latitude ? Number(data.latitude) : null;
  if (data.longitude !== undefined) updateData.longitude = data.longitude ? Number(data.longitude) : null;

  // Non-admins cannot change status directly
  if (user.role !== "ADMIN" && data.status) {
    delete updateData.status;
  }

  const updated = await prisma.company.update({
    where: { id },
    data: updateData,
  });

  await logAudit({
    userId: user.id,
    userEmail: user.email,
    role: user.role,
    action: "UPDATED_COMPANY",
    entity: "Company",
    entityId: id,
    oldValue: oldCompany,
    newValue: updated,
  });

  return updated;
}

export async function softDeleteCompany(
  id: string,
  user: { id: string; role: Role; email: string }
) {
  const oldCompany = await prisma.company.findUnique({ where: { id } });

  const updated = await prisma.company.update({
    where: { id },
    data: { deleted_at: new Date() },
  });

  await logAudit({
    userId: user.id,
    userEmail: user.email,
    role: user.role,
    action: "DELETED_COMPANY",
    entity: "Company",
    entityId: id,
    oldValue: oldCompany,
    newValue: { deleted_at: updated.deleted_at },
  });

  return updated;
}

/**
 * Admin Approval Workflow
 */
export async function getCompanySubmissions(status?: string) {
  const where: Prisma.CompanySubmissionWhereInput = {};
  if (status && status !== "ALL") {
    where.status = status as any;
  }

  return prisma.companySubmission.findMany({
    where,
    include: {
      company: true,
      submittedBy: {
        select: { id: true, name: true, email: true, role: true },
      },
      reviewedBy: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { created_at: "desc" },
  });
}

export async function approveCompanySubmission(
  submissionId: string,
  adminUser: { id: string; role: Role; email: string; name: string }
) {
  const submission = await prisma.companySubmission.findUnique({
    where: { id: submissionId },
    include: { company: true, submittedBy: true },
  });

  if (!submission) {
    throw new Error("Submission request not found.");
  }

  const [updatedSub, updatedCompany] = await prisma.$transaction([
    prisma.companySubmission.update({
      where: { id: submissionId },
      data: {
        status: "APPROVED",
        reviewed_by_id: adminUser.id,
        reviewed_at: new Date(),
      },
    }),
    prisma.company.update({
      where: { id: submission.company_id },
      data: { status: "APPROVED" },
    }),
  ]);

  // Notify submitter
  await createNotification({
    title: "Company Approved",
    message: `Your company '${submission.company.company_name}' was approved by ${adminUser.name}.`,
    type: "COMPANY_APPROVED",
    targetUserId: submission.submitted_by_id,
  });

  await logAudit({
    userId: adminUser.id,
    userEmail: adminUser.email,
    role: adminUser.role,
    action: "APPROVED_COMPANY",
    entity: "Company",
    entityId: submission.company_id,
    newValue: { company_name: submission.company.company_name, status: "APPROVED" },
  });

  return { submission: updatedSub, company: updatedCompany };
}

export async function rejectCompanySubmission(
  submissionId: string,
  rejectionReason: string,
  adminUser: { id: string; role: Role; email: string; name: string }
) {
  if (!rejectionReason || !rejectionReason.trim()) {
    throw new Error("Rejection reason is mandatory.");
  }

  const submission = await prisma.companySubmission.findUnique({
    where: { id: submissionId },
    include: { company: true, submittedBy: true },
  });

  if (!submission) {
    throw new Error("Submission request not found.");
  }

  const [updatedSub, updatedCompany] = await prisma.$transaction([
    prisma.companySubmission.update({
      where: { id: submissionId },
      data: {
        status: "REJECTED",
        rejection_reason: rejectionReason,
        reviewed_by_id: adminUser.id,
        reviewed_at: new Date(),
      },
    }),
    prisma.company.update({
      where: { id: submission.company_id },
      data: { status: "REJECTED" },
    }),
  ]);

  // Notify submitter with rejection reason
  await createNotification({
    title: "Company Rejected",
    message: `Company '${submission.company.company_name}' was rejected. Reason: ${rejectionReason}`,
    type: "COMPANY_REJECTED",
    targetUserId: submission.submitted_by_id,
  });

  await logAudit({
    userId: adminUser.id,
    userEmail: adminUser.email,
    role: adminUser.role,
    action: "REJECTED_COMPANY",
    entity: "Company",
    entityId: submission.company_id,
    newValue: {
      company_name: submission.company.company_name,
      status: "REJECTED",
      rejectionReason,
    },
  });

  return { submission: updatedSub, company: updatedCompany };
}
