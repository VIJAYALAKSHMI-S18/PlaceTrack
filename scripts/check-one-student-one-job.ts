import prisma from "../src/lib/prisma";

async function main() {
  const vertexDrive = await prisma.placementDrive.findFirst({
    where: { company: { company_name: "Vertex AI Solutions" } },
    include: {
      evaluations: {
        include: {
          student: true,
        },
      },
    },
  });

  if (vertexDrive) {
    const total = vertexDrive.evaluations.length;
    const eligible = vertexDrive.evaluations.filter((e) => e.eligibility_status === "ELIGIBLE").length;
    const conditionally = vertexDrive.evaluations.filter((e) => e.eligibility_status === "CONDITIONALLY_ELIGIBLE").length;
    const notEligible = vertexDrive.evaluations.filter((e) => e.eligibility_status === "NOT_ELIGIBLE").length;

    console.log(`=== Vertex AI Solutions (${vertexDrive.job_title}) ===`);
    console.log(`Total Evaluated: ${total}`);
    console.log(`Eligible: ${eligible}`);
    console.log(`Conditionally Eligible: ${conditionally}`);
    console.log(`Not Eligible: ${notEligible}`);

    const placedSample = vertexDrive.evaluations.find((e) => e.student.placement_status === "PLACED");
    if (placedSample) {
      console.log(`\nSample Placed Student: ${placedSample.student.name} (${placedSample.student.register_number})`);
      console.log(`Placement Status: ${placedSample.student.placement_status}`);
      console.log(`Eligibility for Vertex AI: ${placedSample.eligibility_status}`);
      console.log(`Reasons: ${placedSample.eligibility_reasons}`);
    }

    const unplacedSample = vertexDrive.evaluations.find((e) => e.student.placement_status === "UNPLACED" && e.eligibility_status === "ELIGIBLE");
    if (unplacedSample) {
      console.log(`\nSample Unplaced Eligible Student: ${unplacedSample.student.name} (${unplacedSample.student.register_number})`);
      console.log(`Placement Status: ${unplacedSample.student.placement_status}`);
      console.log(`Eligibility for Vertex AI: ${unplacedSample.eligibility_status}`);
      console.log(`Reasons: ${unplacedSample.eligibility_reasons}`);
    }
  }
}

main().finally(() => prisma.$disconnect());
