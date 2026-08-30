import prisma from "../src/lib/prisma";

async function main() {
  const students = await prisma.student.findMany({
    where: { deleted_at: null },
    take: 15,
    include: { offers: { include: { company: true } } },
    orderBy: { name: "asc" }
  });

  console.log("=== STUDENTS LIVE URLS ===");
  for (const s of students) {
    const offer = s.offers[0];
    console.log(`Student: "${s.name}" (${s.register_number}) | Status: ${s.placement_status} | Offer: ${offer ? `${offer.company.company_name} (${offer.ctc_lpa} LPA)` : "None"} | URL: http://localhost:3000/students/${s.id}`);
  }
}

main().finally(() => prisma.$disconnect());
