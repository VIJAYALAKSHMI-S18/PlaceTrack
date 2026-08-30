import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const total = await prisma.student.count();
  const placed = await prisma.student.count({ where: { placement_status: "PLACED" } });
  const notPlaced = await prisma.student.count({ where: { placement_status: "NOT_PLACED" } });

  console.log("Database Verification -> Total:", total, "PLACED:", placed, "NOT_PLACED:", notPlaced);

  const sampleUnplaced = await prisma.student.findMany({
    where: { placement_status: "NOT_PLACED" },
    select: { name: true, register_number: true, department: true, placement_status: true },
    take: 8,
  });

  console.log("\nSample Unplaced (YET_TO_BE_PLACED) Students:");
  sampleUnplaced.forEach((st) => {
    console.log(`- ${st.name} (${st.register_number}) | Dept: ${st.department} | Status: ${st.placement_status}`);
  });
}

main().finally(async () => {
  await prisma.$disconnect();
});
