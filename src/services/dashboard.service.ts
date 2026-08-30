import prisma from "@/lib/prisma";

export async function getAdminDashboardStats() {
  const [
    totalStudents,
    placedStudents,
    multipleOfferStudents,
    totalCompanies,
    pendingCompanies,
    approvedCompanies,
    completedDrives,
    upcomingDrives,
    ongoingDrives,
    totalOffers,
    offers,
    placementTeamCount,
    departments,
    recentDrives,
    recentSubmissions,
    studentsList,
    companiesList,
    drivesList,
    offersList,
  ] = await Promise.all([
    prisma.student.count({ where: { deleted_at: null } }),
    prisma.student.count({ where: { deleted_at: null, placement_status: "PLACED" } }),
    prisma.student.count({ where: { deleted_at: null, placement_status: "MULTIPLE_OFFERS" } }),
    prisma.company.count({ where: { deleted_at: null } }),
    prisma.company.count({ where: { deleted_at: null, status: "PENDING_APPROVAL" } }),
    prisma.company.count({ where: { deleted_at: null, status: "APPROVED" } }),
    prisma.placementDrive.count({ where: { deleted_at: null, drive_status: "COMPLETED", company: { status: "APPROVED" } } }),
    prisma.placementDrive.count({ where: { deleted_at: null, drive_status: "UPCOMING", company: { status: "APPROVED" } } }),
    prisma.placementDrive.count({ where: { deleted_at: null, drive_status: "ONGOING", company: { status: "APPROVED" } } }),
    prisma.offer.count(),
    prisma.offer.findMany({ select: { ctc_lpa: true, company: { select: { company_name: true } } } }),
    prisma.user.count({ where: { role: "PLACEMENT_TEAM", isActive: true, deletedAt: null } }),
    prisma.student.groupBy({
      by: ["department", "placement_status"],
      where: { deleted_at: null },
      _count: true,
    }),
    prisma.placementDrive.findMany({
      where: { deleted_at: null, company: { status: "APPROVED" } },
      take: 5,
      orderBy: { created_at: "desc" },
      include: { company: true },
    }),
    prisma.companySubmission.findMany({
      where: { status: "PENDING" },
      take: 5,
      orderBy: { created_at: "desc" },
      include: { company: true, submittedBy: true },
    }),
    prisma.student.findMany({
      where: { deleted_at: null },
      orderBy: { register_number: "asc" },
    }),
    prisma.company.findMany({
      where: { deleted_at: null, status: "APPROVED" },
      orderBy: { company_name: "asc" },
    }),
    prisma.placementDrive.findMany({
      where: { deleted_at: null, drive_status: "COMPLETED", company: { status: "APPROVED" } },
      include: { company: true },
      orderBy: { drive_date: "desc" },
    }),
    prisma.offer.findMany({
      include: { student: true, company: true },
      orderBy: { offer_date: "desc" },
    }),
  ]);

  const totalPlaced = placedStudents + multipleOfferStudents;
  const placementPercentage =
    totalStudents > 0 ? Math.round((totalPlaced / totalStudents) * 1000) / 10 : 0;

  const ctcs = offers.map((o) => o.ctc_lpa).filter((c) => c > 0);
  const highestPackage = ctcs.length > 0 ? Math.max(...ctcs) : 0;
  const lowestPackage = ctcs.length > 0 ? Math.min(...ctcs) : 0;
  const averagePackage =
    ctcs.length > 0 ? Math.round((ctcs.reduce((a, b) => a + b, 0) / ctcs.length) * 100) / 100 : 0;

  // Department-wise stats
  const deptMap: Record<string, { total: number; placed: number }> = {};
  departments.forEach((d) => {
    if (!deptMap[d.department]) deptMap[d.department] = { total: 0, placed: 0 };
    deptMap[d.department].total += d._count;
    if (d.placement_status === "PLACED" || d.placement_status === "MULTIPLE_OFFERS") {
      deptMap[d.department].placed += d._count;
    }
  });

  const departmentPlacementStats = Object.keys(deptMap).map((dept) => ({
    department: dept,
    total: deptMap[dept].total,
    placed: deptMap[dept].placed,
    unplaced: deptMap[dept].total - deptMap[dept].placed,
    percentage:
      deptMap[dept].total > 0
        ? Math.round((deptMap[dept].placed / deptMap[dept].total) * 100)
        : 0,
  }));

  // CTC Package distribution
  const packageDistribution = [
    { range: "< 4 LPA", count: ctcs.filter((c) => c < 4).length },
    { range: "4 - 7 LPA", count: ctcs.filter((c) => c >= 4 && c < 7).length },
    { range: "7 - 10 LPA", count: ctcs.filter((c) => c >= 7 && c < 10).length },
    { range: "10 - 15 LPA", count: ctcs.filter((c) => c >= 10 && c < 15).length },
    { range: "15+ LPA", count: ctcs.filter((c) => c >= 15).length },
  ];

  // Company-wise offers
  const companyOfferMap: Record<string, number> = {};
  offers.forEach((o) => {
    const cname = o.company?.company_name || "Unknown";
    companyOfferMap[cname] = (companyOfferMap[cname] || 0) + 1;
  });

  const companyOfferStats = Object.entries(companyOfferMap)
    .map(([company, offersCount]) => ({ company, offers: offersCount }))
    .sort((a, b) => b.offers - a.offers)
    .slice(0, 8);

  return {
    overview: {
      totalStudents,
      placedStudents: totalPlaced,
      notPlacedStudents: totalStudents - totalPlaced,
      placementPercentage,
      totalCompanies,
      pendingCompanies,
      approvedCompanies,
      completedDrives,
      upcomingDrives,
      ongoingDrives,
      totalOffers,
      highestPackage,
      averagePackage,
      lowestPackage,
      placementTeamMembers: placementTeamCount,
    },
    departmentPlacementStats,
    packageDistribution,
    companyOfferStats,
    recentDrives,
    recentSubmissions,
    studentsList,
    companiesList,
    drivesList,
    offersList,
  };
}

export async function getManagerDashboardStats() {
  const stats = await getAdminDashboardStats();
  return {
    overview: {
      totalStudents: stats.overview.totalStudents,
      totalCompanies: stats.overview.totalCompanies,
      approvedCompanies: stats.overview.approvedCompanies,
      pendingCompanies: stats.overview.pendingCompanies,
      completedDrives: stats.overview.completedDrives,
      upcomingDrives: stats.overview.upcomingDrives,
      totalOffers: stats.overview.totalOffers,
      placementPercentage: stats.overview.placementPercentage,
      averagePackage: stats.overview.averagePackage,
      highestPackage: stats.overview.highestPackage,
    },
    departmentPlacementStats: stats.departmentPlacementStats,
    packageDistribution: stats.packageDistribution,
    recentDrives: stats.recentDrives,
    studentsList: stats.studentsList,
    companiesList: stats.companiesList,
    drivesList: stats.drivesList,
    offersList: stats.offersList,
  };
}

export async function getPlacementTeamDashboardStats(userId: string) {
  const stats = await getAdminDashboardStats();
  let mySubmissions = await prisma.companySubmission.findMany({
    where: { submitted_by_id: userId },
    take: 5,
    orderBy: { created_at: "desc" },
    include: { company: true },
  });

  // If this specific officer hasn't created one yet, show recent placement team submissions
  if (mySubmissions.length === 0) {
    mySubmissions = await prisma.companySubmission.findMany({
      take: 5,
      orderBy: { created_at: "desc" },
      include: { company: true },
    });
  }

  return {
    overview: {
      totalStudents: stats.overview.totalStudents,
      totalCompanies: stats.overview.totalCompanies,
      approvedCompanies: stats.overview.approvedCompanies,
      pendingApprovals: stats.overview.pendingCompanies,
      upcomingDrives: stats.overview.upcomingDrives,
      completedDrives: stats.overview.completedDrives,
      totalOffers: stats.overview.totalOffers,
      studentsPlaced: stats.overview.placedStudents,
      studentsNotPlaced: stats.overview.notPlacedStudents,
    },
    recentDrives: stats.recentDrives,
    mySubmissions,
    companyOfferStats: stats.companyOfferStats,
    studentsList: stats.studentsList,
    companiesList: stats.companiesList,
    drivesList: stats.drivesList,
    offersList: stats.offersList,
  };
}
