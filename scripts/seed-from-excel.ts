import * as XLSX from "xlsx";
import prisma from "../src/lib/prisma";
import bcrypt from "bcryptjs";
import { evaluateAtsScore } from "../src/services/ats.service";

async function seedFromExcel() {
  console.log("=================================================");
  console.log("SEEDING PLACETRACK FROM USER EXCEL FILES");
  console.log("=================================================");

  // 1. Reset existing data cleanly
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.studentJobEvaluation.deleteMany({});
  await prisma.driveStudent.deleteMany({});
  await prisma.offer.deleteMany({});
  await prisma.placementDrive.deleteMany({});
  await prisma.companySubmission.deleteMany({});
  await prisma.placementTeam.deleteMany({});
  await prisma.company.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.department.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.systemSettings.deleteMany({});

  // 2. Setup Default System Settings
  await prisma.systemSettings.create({
    data: {
      id: "default",
      ats_skill_weight: 50,
      ats_semantic_weight: 20,
      ats_education_weight: 10,
      ats_experience_weight: 10,
      ats_project_weight: 10,
      default_ats_threshold: 70,
      conditional_tolerance: 5,
    },
  });

  // 3. Create Admin, Manager, and 10 Placement Team accounts
  const salt = await bcrypt.genSalt(10);
  const adminHash = await bcrypt.hash("admin123", salt);
  const managerHash = await bcrypt.hash("manager123", salt);
  const placementHash = await bcrypt.hash("placement123", salt);

  const adminUser = await prisma.user.create({
    data: {
      name: "Dr. Sivasubramaniam",
      email: "admin@example.com",
      passwordHash: adminHash,
      role: "ADMIN",
      phone: "+91 9876543210",
      isActive: true,
    },
  });

  const managerUser = await prisma.user.create({
    data: {
      name: "Jeyakannan",
      email: "manager@example.com",
      passwordHash: managerHash,
      role: "MANAGER",
      phone: "+91 9876543211",
      isActive: true,
    },
  });

  // Exactly 10 Placement Team Members
  const placementTeamMembersData = [
    {
      name: "Prof. M. Anbarasan",
      email: "placement@example.com",
      designation: "Head - Corporate Relations & Placements",
      departments: ["CSE", "IT"],
      phone: "+91 9876543220",
    },
    {
      name: "Dr. K. Senthil Kumar",
      email: "placement2@example.com",
      designation: "Associate Placement Officer",
      departments: ["AIDS", "AIML"],
      phone: "+91 9876543221",
    },
    {
      name: "Prof. R. Priya",
      email: "priya.placement@college.edu",
      designation: "ECE Placement Coordinator",
      departments: ["ECE", "EEE"],
      phone: "+91 9876543222",
    },
    {
      name: "Dr. S. Rajesh",
      email: "rajesh.placement@college.edu",
      designation: "Core Engineering Placement Lead",
      departments: ["MECH", "MCT"],
      phone: "+91 9876543223",
    },
    {
      name: "Prof. N. Divya Bharathi",
      email: "divya.placement@college.edu",
      designation: "IT & Cloud Services Coordinator",
      departments: ["IT", "CSBS"],
      phone: "+91 9876543224",
    },
    {
      name: "Dr. V. Karthikeyan",
      email: "karthik.placement@college.edu",
      designation: "Bio & Chemical Sciences Coordinator",
      departments: ["Biotech", "Chemical"],
      phone: "+91 9876543225",
    },
    {
      name: "Prof. A. Vignesh",
      email: "vignesh.placement@college.edu",
      designation: "Civil & Infrastructure Coordinator",
      departments: ["Civil", "Architecture"],
      phone: "+91 9876543226",
    },
    {
      name: "Dr. G. Lakshmi",
      email: "lakshmi.placement@college.edu",
      designation: "Management & MBA Placement Head",
      departments: ["MBA", "BBA"],
      phone: "+91 9876543227",
    },
    {
      name: "Prof. P. Suresh",
      email: "suresh.placement@college.edu",
      designation: "Computer Applications Coordinator",
      departments: ["MCA", "BCA"],
      phone: "+91 9876543228",
    },
    {
      name: "Dr. T. Meenakshi",
      email: "meenakshi.placement@college.edu",
      designation: "International & Tier-1 Relations",
      departments: ["CSE", "ECE", "AIDS"],
      phone: "+91 9876543229",
    },
  ];

  let placementOfficer = null;
  for (let idx = 0; idx < placementTeamMembersData.length; idx++) {
    const mem = placementTeamMembersData[idx];
    const createdUser = await prisma.user.create({
      data: {
        name: mem.name,
        email: mem.email,
        passwordHash: placementHash,
        role: "PLACEMENT_TEAM",
        phone: mem.phone,
        isActive: true,
        placementTeamProfile: {
          create: {
            designation: mem.designation,
            assigned_departments: JSON.stringify(mem.departments),
          },
        },
      },
    });
    if (idx === 0) placementOfficer = createdUser;
  }

  // 4. Import Students from `100_Students_List.xlsx`
  console.log("\nReading 100_Students_List.xlsx...");
  const studentWb = XLSX.readFile("100_Students_List.xlsx");
  const studentSheet = studentWb.Sheets[studentWb.SheetNames[0]];
  const rawStudentRows: any[] = XLSX.utils.sheet_to_json(studentSheet, { header: 1 });

  // Find header row (usually row index 1)
  let studentHeaderIdx = 1;
  for (let i = 0; i < Math.min(5, rawStudentRows.length); i++) {
    const row = rawStudentRows[i];
    if (row && row.some((cell: any) => String(cell).toLowerCase().includes("roll no") || String(cell).toLowerCase().includes("register"))) {
      studentHeaderIdx = i;
      break;
    }
  }

  const studentHeaders = rawStudentRows[studentHeaderIdx].map((h: any) => String(h || "").trim());
  console.log("Detected Student Headers:", studentHeaders);

  const getCol = (row: any[], headerName: string): any => {
    const idx = studentHeaders.findIndex((h: string) => h.toLowerCase() === headerName.toLowerCase());
    return idx !== -1 ? row[idx] : undefined;
  };

  const departmentsSet = new Set<string>();
  const createdStudentsMap = new Map<string, any>(); // rollNo -> student object
  const seenEmails = new Set<string>();

  for (let r = studentHeaderIdx + 1; r < rawStudentRows.length; r++) {
    const row = rawStudentRows[r];
    if (!row || row.length === 0) continue;

    const rollNo = String(getCol(row, "Roll No") || getCol(row, "Register Number") || "").trim();
    const name = String(getCol(row, "Name") || "").trim();
    if (!rollNo || !name) continue;

    const dept = String(getCol(row, "Department") || "CSE").trim();
    departmentsSet.add(dept);

    const studentType = String(getCol(row, "Student Type") || "Regular").trim();
    const phone = String(getCol(row, "Mobile No") || "+91 9876543210").trim();

    let email = String(getCol(row, "College Email ID") || getCol(row, "Personal Email ID") || "").trim();
    if (!email || seenEmails.has(email.toLowerCase())) {
      email = `${rollNo.toLowerCase().replace(/[^a-z0-9]/g, "")}@college.edu`;
    }
    seenEmails.add(email.toLowerCase());

    const sslc = parseFloat(String(getCol(row, "SSLC %") || "85")) || 85.0;
    const hsc = parseFloat(String(getCol(row, "HSC %") || "80")) || 80.0;
    const ug = parseFloat(String(getCol(row, "UG %") || "75")) || 75.0;
    const pg = getCol(row, "PG %") ? parseFloat(String(getCol(row, "PG %"))) : null;

    const github = getCol(row, "GitHub ID") ? String(getCol(row, "GitHub ID")) : null;
    const resume = getCol(row, "Resume Link") ? String(getCol(row, "Resume Link")) : null;
    const linkedin = getCol(row, "LinkedIn ID") ? String(getCol(row, "LinkedIn ID")) : null;
    const portfolio = getCol(row, "Portfolio") ? String(getCol(row, "Portfolio")) : null;
    const rawPlacementStatus = String(getCol(row, "Placement Status") || "NOT_PLACED").trim().toUpperCase();

    let placementStatus = "NOT_PLACED";
    if (rawPlacementStatus === "PLACED" || rawPlacementStatus === "OFFERED" || rawPlacementStatus === "JOINED") {
      placementStatus = "PLACED";
    } else {
      placementStatus = "NOT_PLACED";
    }

    const cgpa = Math.round((ug / 10) * 100) / 100;
    const studentSkills = [
      dept.includes("AI") || dept.includes("Data") ? ["Python", "Machine Learning", "SQL", "Pandas", "PyTorch", "Git"]
      : dept.includes("CS") || dept.includes("IT") ? ["Java", "Python", "React", "TypeScript", "SQL", "Docker", "Git"]
      : dept.includes("EC") ? ["Embedded C", "C++", "IoT", "MATLAB", "Microcontrollers", "Python"]
      : ["AutoCAD", "SolidWorks", "ANSYS", "Python", "MATLAB"],
    ][0];

    const studentRecord = await prisma.student.create({
      data: {
        name,
        register_number: rollNo,
        department: dept,
        student_type: studentType,
        email,
        phone_number: phone,
        sslc_percentage: sslc,
        hsc_percentage: hsc,
        ug_percentage: ug,
        pg_percentage: pg,
        resume_url: resume,
        linkedin_url: linkedin,
        github_url: github,
        portfolio_url: portfolio,
        cgpa,
        backlogs: 0,
        graduation_year: 2025,
        placement_status: placementStatus,
        skills: JSON.stringify(studentSkills),
        parsed_resume_text: `${name} - Academic aggregate UG ${ug}%, skilled in ${studentSkills.join(", ")}. Developed projects using REST APIs, databases, algorithms, and Git version control.`,
      },
    });

    createdStudentsMap.set(rollNo, studentRecord);
  }

  // Create Departments in DB
  for (const d of departmentsSet) {
    await prisma.department.upsert({
      where: { code: d },
      update: {},
      create: { name: d, code: d },
    });
  }

  console.log(`Successfully imported ${createdStudentsMap.size} students from 100_Students_List.xlsx!`);

  // 5. Import Companies & Drives from `Companies_List.xlsx`
  console.log("\nReading Companies_List.xlsx...");
  const companyWb = XLSX.readFile("Companies_List.xlsx");
  const companySheet = companyWb.Sheets[companyWb.SheetNames[0]];
  const rawCompanyRows: any[] = XLSX.utils.sheet_to_json(companySheet, { header: 1 });

  let companyHeaderIdx = 1;
  for (let i = 0; i < Math.min(5, rawCompanyRows.length); i++) {
    const row = rawCompanyRows[i];
    if (row && row.some((cell: any) => String(cell).toLowerCase().includes("company name"))) {
      companyHeaderIdx = i;
      break;
    }
  }

  const companyHeaders = rawCompanyRows[companyHeaderIdx].map((h: any) => String(h || "").trim());
  console.log("Detected Company Headers:", companyHeaders);

  const getCompCol = (row: any[], headerName: string): any => {
    const idx = companyHeaders.findIndex((h: string) => h.toLowerCase() === headerName.toLowerCase());
    return idx !== -1 ? row[idx] : undefined;
  };

  const createdCompaniesMap = new Map<string, any>();
  const createdDrivesList: any[] = [];

  for (let r = companyHeaderIdx + 1; r < rawCompanyRows.length; r++) {
    const row = rawCompanyRows[r];
    if (!row || row.length === 0) continue;

    const companyName = String(getCompCol(row, "Company Name") || "").trim();
    if (!companyName) continue;

    const jobTitle = String(getCompCol(row, "Job Title / Role") || "Software Engineer").trim();
    const ctc = parseFloat(String(getCompCol(row, "CTC (LPA)") || "8.5")) || 8.5;
    const location = String(getCompCol(row, "Location") || "Bangalore, India").trim();
    const rawOppStatus = String(getCompCol(row, "Opportunity Status") || "DRIVE_COMPLETED").trim();
    const rawJobStatus = String(getCompCol(row, "Job Status") || "APPROVED").trim();
    const placedStudentsDetail = String(getCompCol(row, "Placed Students Details") || "").trim();
    const jdSummary = String(getCompCol(row, "Job Description Summary") || `Recruitment drive for ${jobTitle} at ${companyName}.`).trim();
    const jdPdfUrl = getCompCol(row, "JD PDF Link (Rendering)") ? String(getCompCol(row, "JD PDF Link (Rendering)")) : null;
    const careersUrl = getCompCol(row, "Official Careers Link") ? String(getCompCol(row, "Official Careers Link")) : null;
    const contactEmail = getCompCol(row, "Contact Email") ? String(getCompCol(row, "Contact Email")) : null;
    const contactPhone = getCompCol(row, "Contact Mobile") ? String(getCompCol(row, "Contact Mobile")) : null;

    let companyStatus = "APPROVED";
    if (rawJobStatus.toUpperCase().includes("PENDING")) companyStatus = "PENDING_APPROVAL";
    else if (rawJobStatus.toUpperCase().includes("REJECT")) companyStatus = "REJECTED";

    let driveStatus = "COMPLETED";
    if (rawOppStatus.toUpperCase().includes("UPCOMING")) driveStatus = "UPCOMING";
    else if (rawOppStatus.toUpperCase().includes("ONGOING") || rawOppStatus.toUpperCase().includes("ACTIVE")) driveStatus = "ONGOING";

    // Get or Create Company
    let company = createdCompaniesMap.get(companyName);
    if (!company) {
      company = await prisma.company.create({
        data: {
          company_name: companyName,
          location,
          contact_person_email: contactEmail,
          contact_person_phone: contactPhone,
          company_description: jdSummary,
          status: companyStatus,
          careers_url: careersUrl,
          industry: "Information Technology & Services",
          created_by_id: adminUser.id,
        },
      });
      createdCompaniesMap.set(companyName, company);

      if (companyStatus === "PENDING_APPROVAL") {
        await prisma.companySubmission.create({
          data: {
            company_id: company.id,
            submitted_by_id: placementOfficer!.id,
            status: "PENDING",
          },
        });
      }
    }

    // Create Placement Drive
    const drive = await prisma.placementDrive.create({
      data: {
        company_id: company.id,
        job_title: jobTitle,
        job_role: jobTitle,
        ctc_lpa: ctc,
        drive_location: location,
        drive_date: new Date(Date.now() - Math.floor(Math.random() * 20) * 86400000),
        drive_status: driveStatus,
        opportunity_status: "OPEN",
        eligible_departments: JSON.stringify(["CSE", "IT", "AIDS", "ECE", "MECH", "EEE"]),
        minimum_ug_percentage: 60,
        minimum_ats_score: 70,
        maximum_backlogs: 0,
        job_description_summary: jdSummary,
        jd_pdf_url: jdPdfUrl,
        official_careers_url: careersUrl,
        required_skills: JSON.stringify(["Python", "SQL", "Data Structures", "Git"]),
        preferred_skills: JSON.stringify(["React", "Docker", "Cloud"]),
        created_by_id: adminUser.id,
      },
    });
    createdDrivesList.push(drive);
  }

  // 5.5. Import Individual Student Placement Offers from Sheet 2 of 100_Students_List.xlsx
  console.log("\nReading Placements & Drives (100) sheet from 100_Students_List.xlsx...");
  if (studentWb.SheetNames.length > 1) {
    const placementSheet = studentWb.Sheets[studentWb.SheetNames[1]];
    const rawPlacementRows: any[] = XLSX.utils.sheet_to_json(placementSheet, { header: 1 });

    let pHeaderIdx = 3;
    for (let i = 0; i < Math.min(6, rawPlacementRows.length); i++) {
      const row = rawPlacementRows[i];
      if (row && row.some((cell: any) => String(cell).toLowerCase().includes("company placed") || String(cell).toLowerCase().includes("role offered"))) {
        pHeaderIdx = i;
        break;
      }
    }

    const pHeaders = rawPlacementRows[pHeaderIdx].map((h: any) => String(h || "").trim().toLowerCase());
    console.log("Detected Placement Headers:", pHeaders);

    const getPRow = (row: any[], headerName: string): any => {
      const idx = pHeaders.findIndex((h: string) => h.includes(headerName.toLowerCase()));
      return idx !== -1 ? row[idx] : undefined;
    };

    let offerCreatedCount = 0;
    for (let r = pHeaderIdx + 1; r < rawPlacementRows.length; r++) {
      const row = rawPlacementRows[r];
      if (!row || row.length === 0) continue;

      const rollNo = String(getPRow(row, "roll") || "").trim();
      const compPlaced = String(getPRow(row, "company placed") || "").trim();
      const roleOffered = String(getPRow(row, "role") || "").trim();
      const ctcRaw = getPRow(row, "package") || getPRow(row, "ctc");
      const ctcVal = parseFloat(String(ctcRaw || "0")) || 8.0;
      const rawOfferStatus = String(getPRow(row, "offer status") || "ACCEPTED").trim();
      const rawPlacementDate = String(getPRow(row, "date") || "2026-08-30").trim();
      const placementStatus = String(getPRow(row, "placement status") || "").trim();

      if (!rollNo || !compPlaced || compPlaced === "-" || compPlaced === "N/A") continue;

      const targetStudent = createdStudentsMap.get(rollNo);
      if (!targetStudent) continue;

      // Find company
      let targetCompany = createdCompaniesMap.get(compPlaced);
      if (!targetCompany) {
        // Look by partial name match
        for (const [cName, cObj] of createdCompaniesMap.entries()) {
          if (cName.toLowerCase().includes(compPlaced.toLowerCase()) || compPlaced.toLowerCase().includes(cName.toLowerCase())) {
            targetCompany = cObj;
            break;
          }
        }
      }

      if (!targetCompany) {
        // Create company if missing
        targetCompany = await prisma.company.create({
          data: {
            company_name: compPlaced,
            location: "Bangalore, India",
            status: "APPROVED",
            created_by_id: adminUser.id,
          },
        });
        createdCompaniesMap.set(compPlaced, targetCompany);
      }

      // Find or create drive for that company
      let targetDrive: any = createdDrivesList.find((d: any) => d.company_id === targetCompany.id);
      if (!targetDrive) {
        targetDrive = await prisma.placementDrive.create({
          data: {
            company_id: targetCompany.id,
            job_title: roleOffered || "Software Engineer",
            job_role: roleOffered || "Software Engineer",
            ctc_lpa: ctcVal,
            drive_location: "Campus",
            drive_date: new Date(),
            drive_status: "COMPLETED",
            opportunity_status: "OPEN",
            eligible_departments: JSON.stringify(["CSE", "IT", "AIDS", "ECE", "MECH", "EEE"]),
            minimum_ug_percentage: 60,
            minimum_ats_score: 70,
            maximum_backlogs: 0,
            created_by_id: adminUser.id,
          },
        });
        createdDrivesList.push(targetDrive);
      }

      let offerStatus = "ACCEPTED";
      if (rawOfferStatus.toUpperCase().includes("JOINED")) offerStatus = "JOINED";
      else if (rawOfferStatus.toUpperCase().includes("OFFER")) offerStatus = "OFFERED";
      else if (rawOfferStatus.toUpperCase().includes("REJECT")) offerStatus = "REJECTED";

      const offerDate = !isNaN(Date.parse(rawPlacementDate)) ? new Date(rawPlacementDate) : new Date();

      await prisma.offer.create({
        data: {
          student_id: targetStudent.id,
          company_id: targetCompany.id,
          placement_drive_id: targetDrive.id,
          job_role: roleOffered || targetDrive.job_title,
          ctc_lpa: ctcVal,
          offer_status: offerStatus,
          offer_date: offerDate,
        },
      });

      await prisma.student.update({
        where: { id: targetStudent.id },
        data: { placement_status: "PLACED" },
      });

      await prisma.driveStudent.upsert({
        where: {
          placement_drive_id_student_id: {
            placement_drive_id: targetDrive.id,
            student_id: targetStudent.id,
          },
        },
        update: { status: "OFFERED" },
        create: {
          placement_drive_id: targetDrive.id,
          student_id: targetStudent.id,
          status: "OFFERED",
        },
      });

      offerCreatedCount++;
    }

    console.log(`Successfully mapped ${offerCreatedCount} individual student offers from Placements & Drives sheet!`);
  }

  // Ensure at least one rejected company is in the system
  const rejectedSample = await prisma.company.create({
    data: {
      company_name: "Unverified Recruitment Agency",
      location: "Remote / Unknown",
      status: "REJECTED",
      company_description: "Failed institution security accreditation guidelines.",
      industry: "Staffing & Recruiting",
      created_by_id: placementOfficer!.id,
    },
  });

  await prisma.companySubmission.create({
    data: {
      company_id: rejectedSample.id,
      submitted_by_id: placementOfficer!.id,
      status: "REJECTED",
      rejection_reason: "Third-party staffing agencies not eligible for direct on-campus hiring.",
    },
  });

  console.log(`Successfully imported ${createdCompaniesMap.size} companies & ${createdDrivesList.length} placement drives from Companies_List.xlsx!`);

  // 6. Generate Realistic ATS Evaluations across all imported students and drives
  console.log("\nGenerating ATS resume evaluations for imported student records...");
  const allStudents = Array.from(createdStudentsMap.values());
  for (const drive of createdDrivesList) {
    for (let i = 0; i < Math.min(30, allStudents.length); i++) {
      const st = allStudents[i];
      const reqSkills = ["Python", "SQL", "Data Structures", "Git"];
      const studentSkills: string[] = JSON.parse(st.skills || "[]");

      const matched = reqSkills.filter((rs) =>
        studentSkills.some((ss) => ss.toLowerCase().includes(rs.toLowerCase()))
      );
      const missing = reqSkills.filter(
        (rs) => !studentSkills.some((ss) => ss.toLowerCase().includes(rs.toLowerCase()))
      );

      const skillScore = Math.round((matched.length / reqSkills.length) * 50);
      const semScore = 18;
      const eduScore = Math.min(10, Math.round(st.cgpa || 7.5));
      const expScore = 8;
      const projScore = 8;
      const totalAts = Math.min(100, skillScore + semScore + eduScore + expScore + projScore);

      const passedAcademic = (st.ug_percentage || 0) >= (drive.minimum_ug_percentage || 60) && st.backlogs === 0;
      let status = "NOT_ELIGIBLE";
      if (!passedAcademic) {
        status = "NOT_ELIGIBLE";
      } else if (totalAts >= drive.minimum_ats_score) {
        status = "ELIGIBLE";
      } else if (totalAts >= drive.minimum_ats_score - 5) {
        status = "CONDITIONALLY_ELIGIBLE";
      }

      await prisma.studentJobEvaluation.upsert({
        where: {
          student_id_placement_drive_id: {
            student_id: st.id,
            placement_drive_id: drive.id,
          },
        },
        update: {
          ats_score: totalAts,
          skill_match_score: skillScore,
          semantic_match_score: semScore,
          education_score: eduScore,
          experience_score: expScore,
          project_score: projScore,
          matched_skills: JSON.stringify(matched),
          missing_skills: JSON.stringify(missing),
          eligibility_status: status,
          eligibility_reasons: JSON.stringify(
            passedAcademic
              ? ["Academic prerequisites passed", `ATS score: ${totalAts}`]
              : ["Academic check failed"]
          ),
        },
        create: {
          student_id: st.id,
          placement_drive_id: drive.id,
          ats_score: totalAts,
          skill_match_score: skillScore,
          semantic_match_score: semScore,
          education_score: eduScore,
          experience_score: expScore,
          project_score: projScore,
          matched_skills: JSON.stringify(matched),
          missing_skills: JSON.stringify(missing),
          eligibility_status: status,
          eligibility_reasons: JSON.stringify(
            passedAcademic
              ? ["Academic prerequisites passed", `ATS score: ${totalAts}`]
              : ["Academic check failed"]
          ),
        },
      });
    }
  }

  // 7. Seed Notifications and Audit Logs
  await prisma.notification.createMany({
    data: [
      {
        title: "PlaceTrack Portal Initialized",
        message: "Successfully synchronized 100 student profiles and 20 corporate recruitment partners from Excel master databases.",
        type: "SYSTEM",
        target_role: null,
      },
    ],
  });

  await prisma.auditLog.createMany({
    data: [
      {
        user_id: adminUser.id,
        user_email: adminUser.email,
        role: "ADMIN",
        action: "EXCEL_SYNC_COMPLETE",
        entity: "Database",
        new_value: JSON.stringify({ students: createdStudentsMap.size, companies: createdCompaniesMap.size }),
      },
    ],
  });

  console.log("\n=================================================");
  console.log("PLACETRACK SEED COMPLETED SUCCESSFULLY!");
  console.log("=================================================\n");
}

seedFromExcel()
  .catch((e) => {
    console.error("Excel seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
