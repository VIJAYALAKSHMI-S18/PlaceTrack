import prisma from "@/lib/prisma";
import { StudentExcelRow, PlacementStatus } from "@/types";
import { studentExcelSchema } from "@/validators/student.validator";
import { Prisma } from "@prisma/client";

export interface StudentFilterParams {
  search?: string;
  department?: string;
  studentType?: string;
  placementStatus?: string;
  isTerminated?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export async function getStudents(params: StudentFilterParams) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, Math.min(100, params.limit || 10));
  const skip = (page - 1) * limit;

  const where: Prisma.StudentWhereInput = {};

  if (params.isTerminated) {
    where.deleted_at = { not: null };
  } else {
    where.deleted_at = null;
  }

  if (params.department && params.department !== "ALL") {
    where.department = { equals: params.department };
  }

  if (params.studentType && params.studentType !== "ALL") {
    where.student_type = { equals: params.studentType };
  }

  if (params.placementStatus && params.placementStatus !== "ALL") {
    where.placement_status = params.placementStatus as PlacementStatus;
  }

  if (params.search && params.search.trim()) {
    const term = params.search.trim();
    where.OR = [
      { name: { contains: term } },
      { register_number: { contains: term } },
      { email: { contains: term } },
      { phone_number: { contains: term } },
      { department: { contains: term } },
    ];
  }

  const orderBy: Prisma.StudentOrderByWithRelationInput = {};
  const sortField = params.sortBy || "created_at";
  const sortDirection = params.sortOrder || "desc";
  (orderBy as any)[sortField] = sortDirection;

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      select: {
        id: true,
        name: true,
        register_number: true,
        department: true,
        student_type: true,
        email: true,
        phone_number: true,
        sslc_percentage: true,
        hsc_percentage: true,
        ug_percentage: true,
        pg_percentage: true,
        resume_url: true,
        self_intro_url: true,
        linkedin_url: true,
        github_url: true,
        portfolio_url: true,
        photo_url: true,
        graduation_year: true,
        cgpa: true,
        backlogs: true,
        placement_status: true,
        skills: true,
        created_at: true,
        updated_at: true,
        deleted_at: true,
        _count: {
          select: {
            offers: true,
            driveApplications: true,
          },
        },
      },
    }),
    prisma.student.count({ where }),
  ]);

  return {
    students,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getStudentById(id: string) {
  return prisma.student.findUnique({
    where: { id },
    include: {
      offers: {
        include: {
          company: true,
          drive: true,
        },
        orderBy: { offer_date: "desc" },
      },
      evaluations: {
        include: {
          drive: {
            include: {
              company: true,
            },
          },
        },
        orderBy: { evaluated_at: "desc" },
      },
      driveApplications: {
        include: {
          drive: {
            include: {
              company: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
      },
    },
  });
}

export async function createStudent(data: any) {
  return prisma.student.create({
    data: {
      name: data.name,
      register_number: data.register_number,
      department: data.department,
      student_type: data.student_type,
      email: data.email,
      phone_number: data.phone_number,
      sslc_percentage: Number(data.sslc_percentage),
      hsc_percentage: Number(data.hsc_percentage),
      ug_percentage: Number(data.ug_percentage),
      pg_percentage: data.pg_percentage ? Number(data.pg_percentage) : null,
      resume_url: data.resume_url || null,
      self_intro_url: data.self_intro_url || null,
      linkedin_url: data.linkedin_url || null,
      github_url: data.github_url || null,
      portfolio_url: data.portfolio_url || null,
      graduation_year: data.graduation_year ? Number(data.graduation_year) : null,
      cgpa: data.cgpa ? Number(data.cgpa) : null,
      backlogs: data.backlogs !== undefined ? Number(data.backlogs) : 0,
      placement_status: data.placement_status || "NOT_PLACED",
      skills: Array.isArray(data.skills) ? JSON.stringify(data.skills) : data.skills || null,
      parsed_resume_text: data.parsed_resume_text || null,
    },
  });
}

export async function updateStudent(id: string, data: any) {
  const updateData: any = { ...data };
  if (data.sslc_percentage !== undefined) updateData.sslc_percentage = Number(data.sslc_percentage);
  if (data.hsc_percentage !== undefined) updateData.hsc_percentage = Number(data.hsc_percentage);
  if (data.ug_percentage !== undefined) updateData.ug_percentage = Number(data.ug_percentage);
  if (data.pg_percentage !== undefined) updateData.pg_percentage = data.pg_percentage ? Number(data.pg_percentage) : null;
  if (data.cgpa !== undefined) updateData.cgpa = data.cgpa ? Number(data.cgpa) : null;
  if (data.backlogs !== undefined) updateData.backlogs = Number(data.backlogs);
  if (data.graduation_year !== undefined) updateData.graduation_year = data.graduation_year ? Number(data.graduation_year) : null;
  if (Array.isArray(data.skills)) updateData.skills = JSON.stringify(data.skills);

  return prisma.student.update({
    where: { id },
    data: updateData,
  });
}

export async function softDeleteStudent(id: string) {
  return prisma.student.update({
    where: { id },
    data: { deleted_at: new Date() },
  });
}

export async function restoreStudent(id: string) {
  return prisma.student.update({
    where: { id },
    data: { deleted_at: null },
  });
}

/**
 * Validates and previews Excel import rows before committing to DB
 */
export async function validateExcelImport(rows: any[]) {
  const validRows: StudentExcelRow[] = [];
  const invalidRows: { row: number; data: any; errors: string[] }[] = [];
  const duplicateRegisterNumbersInFile = new Set<string>();
  const duplicateEmailsInFile = new Set<string>();

  const seenRegs = new Set<string>();
  const seenEmails = new Set<string>();

  // Check in-file duplicates first: count occurrences
  const regCounts = new Map<string, number>();
  const emailCounts = new Map<string, number>();

  for (let i = 0; i < rows.length; i++) {
    const reg = String(rows[i].register_number || "").trim().toUpperCase();
    const email = String(rows[i].email || "").trim().toLowerCase();

    if (reg) regCounts.set(reg, (regCounts.get(reg) || 0) + 1);
    if (email) emailCounts.set(email, (emailCounts.get(email) || 0) + 1);
  }

  for (const [reg, count] of regCounts.entries()) {
    if (count > 1) duplicateRegisterNumbersInFile.add(reg);
  }
  for (const [email, count] of emailCounts.entries()) {
    if (count > 1) duplicateEmailsInFile.add(email);
  }

  // Check existing in database
  const allRegs = Array.from(seenRegs);
  const allEmails = Array.from(seenEmails);

  const existingInDb = await prisma.student.findMany({
    where: {
      OR: [
        { register_number: { in: allRegs } },
        { email: { in: allEmails } },
      ],
    },
    select: { register_number: true, email: true },
  });

  const dbRegs = new Set(existingInDb.map((s) => s.register_number.toUpperCase()));
  const dbEmails = new Set(existingInDb.map((s) => s.email.toLowerCase()));

  for (let i = 0; i < rows.length; i++) {
    const raw = rows[i];
    const rowNum = i + 1;
    const rowErrors: string[] = [];

    const reg = String(raw.register_number || "").trim().toUpperCase();
    const email = String(raw.email || "").trim().toLowerCase();

    if (duplicateRegisterNumbersInFile.has(reg)) {
      rowErrors.push(`Duplicate register number '${reg}' found within import file`);
    }
    if (duplicateEmailsInFile.has(email)) {
      rowErrors.push(`Duplicate email '${email}' found within import file`);
    }
    if (dbRegs.has(reg)) {
      rowErrors.push(`Register number '${reg}' already exists in database`);
    }
    if (dbEmails.has(email)) {
      rowErrors.push(`Email '${email}' already exists in database`);
    }

    const parsed = studentExcelSchema.safeParse(raw);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        rowErrors.push(`${issue.path.join(".")}: ${issue.message}`);
      }
    }

    if (rowErrors.length > 0) {
      invalidRows.push({ row: rowNum, data: raw, errors: rowErrors });
    } else if (parsed.success) {
      validRows.push(parsed.data);
    }
  }

  return {
    totalRows: rows.length,
    validCount: validRows.length,
    invalidCount: invalidRows.length,
    duplicatesCount: duplicateRegisterNumbersInFile.size + duplicateEmailsInFile.size + dbRegs.size,
    validRows,
    invalidRows,
  };
}

/**
 * Commits pre-validated Excel rows to database in a transaction
 */
export async function commitExcelImport(rows: StudentExcelRow[]) {
  const operations = rows.map((row) =>
    prisma.student.create({
      data: {
        name: row.name,
        register_number: row.register_number,
        department: row.department,
        student_type: row.student_type,
        email: row.email,
        phone_number: String(row.phone_number),
        sslc_percentage: Number(row.sslc_percentage),
        hsc_percentage: Number(row.hsc_percentage),
        ug_percentage: Number(row.ug_percentage),
        pg_percentage: row.pg_percentage ? Number(row.pg_percentage) : null,
        resume_url: row.resume_url || null,
        self_intro_url: row.self_intro_url || null,
        linkedin_url: row.linkedin_url || null,
        github_url: row.github_url || null,
        portfolio_url: row.portfolio_url || null,
        photo_url: (row as any).photo_url || null,
        cgpa: Math.round((Number(row.ug_percentage) / 10) * 100) / 100,
        backlogs: 0,
        placement_status: "NOT_PLACED",
      },
    })
  );

  return prisma.$transaction(operations);
}
