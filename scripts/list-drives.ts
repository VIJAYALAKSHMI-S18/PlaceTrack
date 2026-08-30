import prisma from "../src/lib/prisma";

async function main() {
  const drives = await prisma.placementDrive.findMany({
    include: { company: true },
    orderBy: { created_at: "asc" }
  });

  console.log("Current Active Drives in DB:");
  for (const d of drives) {
    console.log(`Company: ${d.company?.company_name} | Role: ${d.job_title} | ID: ${d.id} | Link: http://localhost:3000/drives/${d.id}`);
  }
}

main().finally(() => prisma.$disconnect());
