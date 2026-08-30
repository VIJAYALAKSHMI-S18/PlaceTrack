import prisma from "../src/lib/prisma";

async function main() {
  const pendingCompanies = await prisma.company.findMany({
    where: { status: "PENDING_APPROVAL" }
  });
  console.log("Pending Companies in Company table:", pendingCompanies);

  const submissions = await prisma.companySubmission.findMany({
    include: { submittedBy: true }
  });
  console.log("Company Submissions:", submissions);
}

main().finally(() => prisma.$disconnect());
