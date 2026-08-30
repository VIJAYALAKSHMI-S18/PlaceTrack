import { requireRole } from "@/lib/rbac";
import { DashboardShell } from "@/components/navigation/DashboardShell";
import prisma from "@/lib/prisma";
import { OffersTrackerClient } from "@/components/offers/OffersTrackerClient";

export const dynamic = "force-dynamic";

export default async function PlacementTeamOffersPage() {
  const user = await requireRole(["PLACEMENT_TEAM", "ADMIN"]);

  const offers = await prisma.offer.findMany({
    include: {
      student: true,
      company: true,
      drive: true,
    },
    orderBy: { offer_date: "desc" },
  });

  return (
    <DashboardShell role="PLACEMENT_TEAM" user={user}>
      <OffersTrackerClient initialOffers={offers} title="Offers Tracking (Placement Team)" />
    </DashboardShell>
  );
}
