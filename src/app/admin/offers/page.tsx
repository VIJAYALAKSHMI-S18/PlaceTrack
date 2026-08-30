import { requireRole } from "@/lib/rbac";
import { DashboardShell } from "@/components/navigation/DashboardShell";
import prisma from "@/lib/prisma";
import { OffersTrackerClient } from "@/components/offers/OffersTrackerClient";

export const dynamic = "force-dynamic";

export default async function AdminOffersPage() {
  const user = await requireRole(["ADMIN"]);

  const offers = await prisma.offer.findMany({
    where: { deleted_at: null },
    include: {
      student: true,
      company: true,
      drive: true,
    },
    orderBy: { offer_date: "desc" },
  });

  return (
    <DashboardShell role="ADMIN" user={user}>
      <OffersTrackerClient initialOffers={offers} title="Institutional Offers Tracking" />
    </DashboardShell>
  );
}
