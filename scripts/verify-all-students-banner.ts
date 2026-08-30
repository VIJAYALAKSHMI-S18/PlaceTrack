import prisma from "../src/lib/prisma";

async function main() {
  const students = await prisma.student.findMany({
    where: { deleted_at: null },
    include: {
      evaluations: {
        include: {
          drive: {
            include: { company: true },
          },
        },
      },
      offers: true,
    },
  });

  console.log(`Verifying all ${students.length} students...`);
  let allCorrect = true;

  for (const s of students) {
    const completedEvaluations = s.evaluations.filter(
      (e) => e.drive?.company?.status === "APPROVED" && e.drive?.drive_status === "COMPLETED"
    );

    if (completedEvaluations.length !== 19) {
      console.log(`Mismatch for ${s.name}: ${completedEvaluations.length}`);
      allCorrect = false;
    }
  }

  if (allCorrect) {
    console.log(`SUCCESS: All ${students.length} students consistently show exactly 19 Completed Drives Attended!`);
  }
}

main().finally(() => prisma.$disconnect());
