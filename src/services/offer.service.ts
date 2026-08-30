import prisma from "@/lib/prisma";
import { OfferStatus, PlacementStatus, Role } from "@/types";
import { logAudit } from "@/lib/audit";

export interface OfferFilterParams {
  studentId?: string;
  companyId?: string;
  driveId?: string;
  offerStatus?: string;
  page?: number;
  limit?: number;
}

export async function getOffers(params: OfferFilterParams) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, Math.min(100, params.limit || 10));
  const skip = (page - 1) * limit;

  const where: any = {};
  if (params.studentId) where.student_id = params.studentId;
  if (params.companyId) where.company_id = params.companyId;
  if (params.driveId) where.placement_drive_id = params.driveId;
  if (params.offerStatus && params.offerStatus !== "ALL") where.offer_status = params.offerStatus as OfferStatus;

  const [offers, total] = await Promise.all([
    prisma.offer.findMany({
      where,
      skip,
      take: limit,
      include: {
        student: true,
        company: true,
        drive: true,
      },
      orderBy: { offer_date: "desc" },
    }),
    prisma.offer.count({ where }),
  ]);

  return {
    offers,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function syncStudentPlacementStatus(studentId: string) {
  const activeOffers = await prisma.offer.findMany({
    where: {
      student_id: studentId,
      offer_status: { in: ["OFFERED", "ACCEPTED", "JOINED"] },
    },
  });

  let status: PlacementStatus = "NOT_PLACED";
  if (activeOffers.length === 1) {
    status = "PLACED";
  } else if (activeOffers.length > 1) {
    status = "MULTIPLE_OFFERS";
  }

  await prisma.student.update({
    where: { id: studentId },
    data: { placement_status: status },
  });
}

export async function createOffer(
  data: any,
  user?: { id: string; role: Role; email: string }
) {
  const offer = await prisma.offer.create({
    data: {
      student_id: data.student_id,
      company_id: data.company_id,
      placement_drive_id: data.placement_drive_id || null,
      job_role: data.job_role,
      offer_date: data.offer_date ? new Date(data.offer_date) : new Date(),
      ctc_lpa: Number(data.ctc_lpa),
      offer_status: (data.offer_status as OfferStatus) || "OFFERED",
      offer_letter_url: data.offer_letter_url || null,
    },
    include: {
      student: true,
      company: true,
    },
  });

  // Sync student placement status
  await syncStudentPlacementStatus(data.student_id);

  if (user) {
    await logAudit({
      userId: user.id,
      userEmail: user.email,
      role: user.role,
      action: "CREATED_OFFER",
      entity: "Offer",
      entityId: offer.id,
      newValue: {
        student: offer.student.name,
        company: offer.company.company_name,
        ctc_lpa: offer.ctc_lpa,
      },
    });
  }

  return offer;
}

export async function updateOffer(
  id: string,
  data: any,
  user?: { id: string; role: Role; email: string }
) {
  const oldOffer = await prisma.offer.findUnique({ where: { id } });
  const updateData: any = { ...data };
  if (data.ctc_lpa !== undefined) updateData.ctc_lpa = Number(data.ctc_lpa);
  if (data.offer_date) updateData.offer_date = new Date(data.offer_date);

  const updated = await prisma.offer.update({
    where: { id },
    data: updateData,
  });

  if (oldOffer) {
    await syncStudentPlacementStatus(oldOffer.student_id);
  }

  if (user) {
    await logAudit({
      userId: user.id,
      userEmail: user.email,
      role: user.role,
      action: "UPDATED_OFFER",
      entity: "Offer",
      entityId: id,
      oldValue: oldOffer,
      newValue: updated,
    });
  }

  return updated;
}
