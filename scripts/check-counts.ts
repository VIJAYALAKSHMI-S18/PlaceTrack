import prisma from "../src/lib/prisma";

async function main() {
  const approvedCompanies = await prisma.company.count({ where: { status: "APPROVED", deleted_at: null } });
  const pendingCompanies = await prisma.company.count({ where: { status: "PENDING_APPROVAL", deleted_at: null } });
  const completedDrives = await prisma.placementDrive.count({ where: { drive_status: "COMPLETED", deleted_at: null } });
  const upcomingDrives = await prisma.placementDrive.count({ where: { drive_status: "UPCOMING", deleted_at: null } });
  const totalOffers = await prisma.offer.count();

  console.log({
    approvedCompanies,
    pendingCompanies,
    completedDrives,
    upcomingDrives,
    totalOffers
  });
}

main().finally(() => prisma.$disconnect());
