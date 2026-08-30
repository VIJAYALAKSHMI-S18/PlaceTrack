import prisma from "../src/lib/prisma";

async function main() {
  const company = await prisma.company.findFirst();
  if (company) {
    const res = await fetch(`http://localhost:3000/companies/${company.id}`);
    console.log(`Company Details Page Status for "${company.company_name}":`, res.status);
  }
}

main().finally(() => prisma.$disconnect());
