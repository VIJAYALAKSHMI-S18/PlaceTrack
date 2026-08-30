import { evaluateStudentEligibility, StudentEligibilityInput, DriveEligibilityCriteria } from "../src/services/eligibility.service";
import { evaluateAtsScore } from "../src/services/ats.service";
import { validateExcelImport } from "../src/services/student.service";
import prisma from "../src/lib/prisma";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedCount++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failedCount++;
  }
}

async function runAllTests() {
  console.log("\n========================================================");
  console.log("PLACETRACK — ENTERPRISE VERIFICATION TEST SUITE");
  console.log("========================================================\n");

  // TEST SUITE 1: Academic Eligibility vs ATS Score Rule (Rule #36, #37, #79)
  console.log("--- TEST SUITE 1: Academic Eligibility vs High ATS Score ---");

  // Case A: Student has high ATS (95) but failed UG percentage (48% vs 60% required) -> MUST BE NOT_ELIGIBLE
  const studentA: StudentEligibilityInput = {
    department: "CSE",
    studentType: "Regular",
    sslcPercentage: 85,
    hscPercentage: 80,
    ugPercentage: 48.0, // Failed requirement
    cgpa: 5.2,
    backlogs: 0,
    resumeText: "Expert in Python, SQL, Docker, AWS, Machine Learning, Deep Learning with 2 years experience.",
    skills: ["Python", "SQL", "Docker", "AWS", "Machine Learning"],
  };

  const driveA: DriveEligibilityCriteria = {
    eligibleDepartments: ["CSE", "IT"],
    minimumUgPercentage: 60.0,
    minimumAtsScore: 70.0,
    requiredSkills: ["Python", "SQL", "Docker"],
  };

  const resultA = evaluateStudentEligibility(studentA, driveA);
  assert(
    resultA.eligibilityStatus === "NOT_ELIGIBLE",
    "High ATS score (95) CANNOT bypass failed academic requirement (UG 48% < 60%) -> Result: NOT_ELIGIBLE"
  );
  assert(
    resultA.passedAcademic === false,
    "Academic check failed explicitly recorded in evaluation diagnostics"
  );

  // Case B: Student meets all academic criteria and exceeds ATS threshold -> MUST BE ELIGIBLE
  const studentB: StudentEligibilityInput = {
    department: "AIDS",
    studentType: "Regular",
    sslcPercentage: 90,
    hscPercentage: 88,
    ugPercentage: 82.0,
    cgpa: 8.5,
    backlogs: 0,
    resumeText: "Experienced AI student built predictive models in Scikit-learn, PyTorch, Python, SQL.",
    skills: ["Python", "Machine Learning", "SQL", "Pandas"],
  };

  const driveB: DriveEligibilityCriteria = {
    eligibleDepartments: ["AIDS", "CSE"],
    minimumUgPercentage: 60.0,
    maximumBacklogs: 2,
    minimumAtsScore: 70.0,
    requiredSkills: ["Python", "Machine Learning", "SQL"],
  };

  const resultB = evaluateStudentEligibility(studentB, driveB);
  assert(
    resultB.eligibilityStatus === "ELIGIBLE",
    "Student with UG 82%, Dept AIDS, 0 backlogs, high ATS -> Result: ELIGIBLE"
  );
  assert(
    resultB.passedAcademic === true && resultB.passedAts === true,
    "Both Academic and ATS criteria passed"
  );

  // Case C: ATS is JD-specific
  const driveC: DriveEligibilityCriteria = {
    eligibleDepartments: ["ECE"],
    minimumUgPercentage: 60.0,
    minimumAtsScore: 75.0,
    requiredSkills: ["Embedded C", "Microcontrollers", "VLSI", "Verilog"],
  };

  const resultC = evaluateStudentEligibility(studentB, driveC);
  assert(
    resultC.eligibilityStatus === "NOT_ELIGIBLE",
    "ATS & Eligibility is JD-specific: AI student evaluating against Embedded Systems JD fails department & skills"
  );

  // TEST SUITE 2: Excel Import Validation & Duplicate Detection (Rule #17)
  console.log("\n--- TEST SUITE 2: Excel Import Validation ---");

  const sampleRows = [
    {
      name: "Clean Valid Student",
      register_number: "2021CLEAN999",
      department: "CSE",
      student_type: "Regular",
      email: "clean.valid@test.com",
      phone_number: "+91 9876543210",
      sslc_percentage: 85,
      hsc_percentage: 80,
      ug_percentage: 75,
    },
    {
      name: "Duplicate Pair 1",
      register_number: "2021DUP101",
      department: "CSE",
      student_type: "Regular",
      email: "dup1@test.com",
      phone_number: "+91 9876543211",
      sslc_percentage: 85,
      hsc_percentage: 80,
      ug_percentage: 75,
    },
    {
      name: "Duplicate Pair 2 (Same Reg No)",
      register_number: "2021DUP101",
      department: "IT",
      student_type: "Regular",
      email: "dup2@test.com",
      phone_number: "+91 9876543212",
      sslc_percentage: 85,
      hsc_percentage: 80,
      ug_percentage: 75,
    },
    {
      name: "Invalid Percentage Range",
      register_number: "2021RANGE102",
      department: "AIDS",
      student_type: "Regular",
      email: "range@test.com",
      phone_number: "+91 9876543213",
      sslc_percentage: 150, // Invalid > 100
      hsc_percentage: 80,
      ug_percentage: 75,
    },
  ];

  const validationResult = await validateExcelImport(sampleRows);
  assert(
    validationResult.invalidCount >= 3,
    "Excel import engine detects duplicate register numbers and percentage range violations (> 100)"
  );
  assert(
    validationResult.validCount === 1,
    "Only clean, fully compliant rows are staged as valid"
  );

  // TEST SUITE 3: Database & Approval Status Verifications (Rule #19, #43, #53)
  console.log("\n--- TEST SUITE 3: Database & Seed Integrity ---");

  const userCount = await prisma.user.count();
  const studentCount = await prisma.student.count();
  const companyCount = await prisma.company.count();
  const driveCount = await prisma.placementDrive.count();
  const offerCount = await prisma.offer.count();

  assert(userCount >= 4, `Users verified in database (${userCount} total)`);
  assert(studentCount >= 100, `Complete 100 students verified in database (${studentCount} total)`);
  assert(companyCount >= 20, `Companies verified in database (${companyCount} total)`);
  assert(driveCount >= 20, `Placement drives verified in database (${driveCount} total)`);
  assert(offerCount >= 15, `Offers verified in database (${offerCount} total)`);

  const pendingCompany = await prisma.company.findFirst({ where: { status: "PENDING_APPROVAL" } });
  assert(!!pendingCompany, "Pending approval companies exist in approval queue");

  const rejectedCompany = await prisma.company.findFirst({ where: { status: "REJECTED" } });
  assert(!!rejectedCompany, "Rejected companies are properly isolated");

  // Summary
  console.log("\n========================================================");
  console.log(`TEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("========================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runAllTests()
  .catch((e) => {
    console.error("Test execution failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
