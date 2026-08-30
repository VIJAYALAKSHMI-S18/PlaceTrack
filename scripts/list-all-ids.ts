import prisma from "../src/lib/prisma";

async function main() {
  const companies = await prisma.company.findMany({
    where: { deleted_at: null },
    include: { drives: true },
    orderBy: { company_name: "asc" }
  });

  console.log("=== COMPANIES ===");
  for (const c of companies) {
    console.log(`Company: "${c.company_name}" | Company ID: ${c.id} | URL: http://localhost:3000/companies/${c.id}`);
    for (const d of c.drives) {
      console.log(`   -> Drive: "${d.job_title}" | Drive ID: ${d.id} | URL: http://localhost:3000/drives/${d.id}`);
    }
  }
}

main().finally(() => prisma.$disconnect());
