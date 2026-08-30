import prisma from "../src/lib/prisma";

async function main() {
  const lavanyaG = await prisma.student.findUnique({
    where: { register_number: "RCAS2024BBA056" },
  });

  if (lavanyaG) {
    console.log(`Student: "${lavanyaG.name}" (${lavanyaG.register_number}) | ID: ${lavanyaG.id} | URL: http://localhost:3000/students/${lavanyaG.id}`);
  }
}

main().finally(() => prisma.$disconnect());
