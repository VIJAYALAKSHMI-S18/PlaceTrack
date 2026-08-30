import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth, requireApiRole, handleAuthError } from "@/lib/rbac";
import { getOffers, createOffer } from "@/services/offer.service";
import { offerCreateSchema } from "@/validators/offer.validator";

export async function GET(req: NextRequest) {
  try {
    await requireApiAuth();
    const searchParams = req.nextUrl.searchParams;

    const filters = {
      studentId: searchParams.get("studentId") || undefined,
      companyId: searchParams.get("companyId") || undefined,
      driveId: searchParams.get("driveId") || undefined,
      offerStatus: searchParams.get("offerStatus") || undefined,
      page: parseInt(searchParams.get("page") || "1", 10),
      limit: parseInt(searchParams.get("limit") || "10", 10),
    };

    const result = await getOffers(filters);
    return NextResponse.json({
      success: true,
      data: result.offers,
      meta: result.meta,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    // Admin or Placement Team can record offers
    const user = await requireApiRole(["ADMIN", "PLACEMENT_TEAM"]);
    const body = await req.json();

    const validated = offerCreateSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed.",
          errors: validated.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const offer = await createOffer(validated.data, user);
    return NextResponse.json(
      {
        success: true,
        data: offer,
        message: "Offer recorded and student placement status synchronized.",
      },
      { status: 201 }
    );
  } catch (error) {
    return handleAuthError(error);
  }
}
