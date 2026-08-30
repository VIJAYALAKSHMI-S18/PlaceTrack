import prisma from "../src/lib/prisma";

async function main() {
  const drive = await prisma.placementDrive.findFirst({
    where: {
      company: { company_name: { contains: "Oracle" } }
    },
    include: {
      company: true,
      evaluations: {
        include: { student: true }
      },
      offers: {
        include: { student: true }
      }
    }
  });

  if (!drive) {
    console.log("No Oracle drive found");
    return;
  }

  console.log("Drive:", drive.job_title);
  console.log("Eligible Depts:", drive.eligible_departments);
  console.log("Min UG %:", drive.min_ug_percentage);
  console.log("Min 10th %:", drive.min_10th_percentage);
  console.log("Min 12th %:", drive.min_12th_percentage);
  console.log("Max Backlogs:", drive.max_active_backlogs);
  console.log("Min ATS:", drive.minimum_ats_score);
  console.log("Required Skills:", drive.required_skills);
  console.log("Offers count:", drive.offers.length);

  const eligibleCount = drive.evaluations.filter(e => e.eligibility_status === "ELIGIBLE").length;
  const conditionalCount = drive.evaluations.filter(e => e.eligibility_status === "CONDITIONAL").length;
  const notEligibleCount = drive.evaluations.filter(e => e.eligibility_status === "NOT_ELIGIBLE").length;

  console.log(`Evaluations -> Total: ${drive.evaluations.length} | Eligible: ${eligibleCount} | Conditional: ${conditionalCount} | Not Eligible: ${notEligibleCount}`);

  console.log("\nSample 5 Evaluations:");
  for (const ev of drive.evaluations.slice(0, 5)) {
    console.log(`Student: ${ev.student.name} (${ev.student.department}) | Status: ${ev.eligibility_status} | ATS: ${ev.ats_score} | Reasons: ${ev.evaluation_reasons}`);
  }

  console.log("\nPlaced Students on this drive:");
  for (const off of drive.offers) {
    const ev = drive.evaluations.find(e => e.student_id === off.student_id);
    console.log(`Placed: ${off.student.name} (${off.student.department}, UG: ${off.student.ug_percentage}%) | Status: ${ev?.eligibility_status} | ATS: ${ev?.ats_score} | Reasons: ${ev?.evaluation_reasons}`);
  }
}

main().finally(() => prisma.$disconnect());
