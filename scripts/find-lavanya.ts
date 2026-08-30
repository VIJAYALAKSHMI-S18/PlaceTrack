import prisma from "../src/lib/prisma";

async function main() {
  const lavanya = await prisma.student.findFirst({
    where: { name: { contains: "Lavanya" } },
    include: { offers: { include: { company: true } } },
  });

  if (lavanya) {
    console.log(`Student: "${lavanya.name}" (${lavanya.register_number}) | ID: ${lavanya.id} | URL: http://localhost:3000/students/${lavanya.id}`);
  }
}

main().finally(() => prisma.$disconnect());
