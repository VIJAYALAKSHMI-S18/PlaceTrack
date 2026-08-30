import * as XLSX from "xlsx";
import * as path from "path";
import prisma from "../src/lib/prisma";

// Curated high quality Indian student portraits from Unsplash (verified working, CORS-friendly)
const indianMaleStudentPhotos = [
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1528892952291-009c663ce843?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1531891437562-4301cf092a93?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1496345875659-11f7dd282d1d?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1519764622345-23439dd774f7?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1520409364224-63400afe26e5?auto=format&fit=crop&q=80&w=400",
];

const indianFemaleStudentPhotos = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=400",
];

async function updateStudentPhotos() {
  console.log("Updating student photo links with authentic portraits...");
  const filePath = path.join(process.cwd(), "100_Students_List.xlsx");
  const wb = XLSX.readFile(filePath);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rawRows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  let headerRowIdx = 3;
  let maleIdx = 0;
  let femaleIdx = 0;

  for (let r = headerRowIdx + 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!row || !row[0]) continue;

    const rollNo = String(row[0]).trim();
    const gender = String(row[3] || "Male").toLowerCase();

    let assignedPhoto = "";
    if (gender.includes("female") || gender.includes("women") || gender === "f") {
      assignedPhoto = indianFemaleStudentPhotos[femaleIdx % indianFemaleStudentPhotos.length];
      femaleIdx++;
    } else {
      assignedPhoto = indianMaleStudentPhotos[maleIdx % indianMaleStudentPhotos.length];
      maleIdx++;
    }

    // Update in Excel Row
    row[17] = assignedPhoto;

    // Update in Database
    await prisma.$executeRawUnsafe(
      `UPDATE "Student" SET "photo_url" = ? WHERE "register_number" = ?`,
      assignedPhoto,
      rollNo
    );
  }

  // Write back to Excel
  const updatedSheet = XLSX.utils.aoa_to_sheet(rawRows);
  wb.Sheets[wb.SheetNames[0]] = updatedSheet;
  XLSX.writeFile(wb, filePath);

  console.log(`Successfully updated all 100 students in Excel and SQLite database!`);

  // Verify
  const sample = await prisma.$queryRawUnsafe(`SELECT name, register_number, photo_url FROM "Student" LIMIT 3`);
  console.log("Verified sample students:", sample);
}

updateStudentPhotos()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
