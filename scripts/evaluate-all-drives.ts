import { evaluateAllStudentsForDrive } from "../src/services/drive.service";
import prisma from "../src/lib/prisma";

async function main() {
  const drives = await prisma.placementDrive.findMany({
    include: { company: true }
  });

  console.log(`Evaluating all students across ${drives.length} drives with One Student, One Job policy...`);

  for (const drive of drives) {
    const res = await evaluateAllStudentsForDrive(drive.id);
    console.log(`Drive: "${drive.company.company_name} - ${drive.job_title}" | Total: ${res.totalEvaluated} | Eligible: ${res.eligibleCount} | Conditional: ${res.conditionalCount} | Ineligible: ${res.notEligibleCount}`);
  }
}

main().finally(() => prisma.$disconnect());
