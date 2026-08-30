import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { Role, SessionUser } from "@/types";

export class AuthError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number = 401) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AuthError";
  }
}

export class ForbiddenError extends Error {
  statusCode: number;
  constructor(message: string = "You do not have permission to perform this action.") {
    super(message);
    this.statusCode = 403;
    this.name = "ForbiddenError";
  }
}

/**
 * Server-side guard to guarantee user is authenticated.
 * Returns SessionUser or throws/returns 401.
 */
export async function requireAuth(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new AuthError("Authentication required. Please log in.");
  }
  return user;
}

/**
 * Server-side guard to guarantee user has one of the allowed roles.
 * Returns SessionUser or throws 403 ForbiddenError.
 */
export async function requireRole(allowedRoles: Role[]): Promise<SessionUser> {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw new ForbiddenError("You do not have permission to perform this action.");
  }
  return user;
}

/**
 * Helper to handle auth errors and return standard JSON error responses.
 */
export function handleAuthError(error: unknown): NextResponse {
  if (error instanceof ForbiddenError) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 403 }
    );
  }
  if (error instanceof AuthError) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 401 }
    );
  }
  return NextResponse.json(
    {
      success: false,
      message: "Internal server error occurred.",
    },
    { status: 500 }
  );
}

/**
 * Role capability matrix
 */
export const ROLE_PERMISSIONS = {
  ADMIN: {
    canViewDashboard: true,
    canManageStudents: true,
    canDeleteStudents: true,
    canImportStudents: true,
    canManageCompanies: true,
    canApproveCompanies: true,
    canRejectCompanies: true,
    canDeleteCompanies: true,
    canManageDrives: true,
    canManagePlacementTeam: true,
    canManageOffers: true,
    canViewReports: true,
    canExportReports: true,
    canViewAuditLogs: true,
    canManageSettings: true,
  },
  MANAGER: {
    canViewDashboard: true,
    canManageStudents: false, // Read only
    canDeleteStudents: false,
    canImportStudents: false,
    canManageCompanies: false, // Can only view and submit for approval
    canApproveCompanies: false,
    canRejectCompanies: false,
    canDeleteCompanies: false,
    canManageDrives: false, // View only
    canManagePlacementTeam: false, // View only
    canManageOffers: false, // View only
    canViewReports: true,
    canExportReports: true,
    canViewAuditLogs: false,
    canManageSettings: false,
  },
  PLACEMENT_TEAM: {
    canViewDashboard: true,
    canManageStudents: false, // View only
    canDeleteStudents: false,
    canImportStudents: false,
    canManageCompanies: true, // Can submit and update assigned
    canApproveCompanies: false,
    canRejectCompanies: false,
    canDeleteCompanies: false,
    canManageDrives: true, // Can create/update permitted drives & track
    canManagePlacementTeam: false,
    canManageOffers: true,
    canViewReports: true,
    canExportReports: false,
    canViewAuditLogs: false,
    canManageSettings: false,
  },
} as const;

export function hasPermission(role: Role, permission: keyof typeof ROLE_PERMISSIONS["ADMIN"]): boolean {
  return ROLE_PERMISSIONS[role]?.[permission] ?? false;
}
