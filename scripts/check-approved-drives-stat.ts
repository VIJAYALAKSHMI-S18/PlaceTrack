import { getManagerDashboardStats } from "../src/services/dashboard.service";
import prisma from "../src/lib/prisma";

async function main() {
  const stats = await getManagerDashboardStats();
  console.log("Updated Manager Overview Stats:", stats.overview);
}

main().finally(() => prisma.$disconnect());
