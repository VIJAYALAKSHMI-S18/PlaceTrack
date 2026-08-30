import * as XLSX from "xlsx";
import * as path from "path";
import prisma from "../src/lib/prisma";

async function populateStudentPhotos() {
  console.log("Populating student photo URLs from 100_Students_List.xlsx...");
  const filePath = path.join(process.cwd(), "100_Students_List.xlsx");
  const wb = XLSX.readFile(filePath);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rawRows: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  let headerRowIdx = -1;
  for (let i = 0; i < Math.min(rawRows.length, 10); i++) {
    const row = rawRows[i] || [];
    if (row.some((cell: any) => String(cell).toLowerCase().includes("roll no") || String(cell).toLowerCase().includes("register number"))) {
      headerRowIdx = i;
      break;
    }
  }

  if (headerRowIdx === -1) {
    console.error("Could not find header row in 100_Students_List.xlsx");
    return;
  }

  const headers: string[] = rawRows[headerRowIdx].map((h: any) => String(h || "").trim());
  const rollNoCol = headers.findIndex((h) => h.toLowerCase().includes("roll no") || h.toLowerCase().includes("register"));
  const photoCol = headers.findIndex((h) => h.toLowerCase().includes("photo") || h.toLowerCase().includes("image"));

  console.log(`Found headers at row ${headerRowIdx}: Roll No col index = ${rollNoCol}, Photo col index = ${photoCol}`);

  let updatedCount = 0;
  for (let i = headerRowIdx + 1; i < rawRows.length; i++) {
    const row = rawRows[i];
    if (!row || !row[rollNoCol]) continue;

    const rollNo = String(row[rollNoCol]).trim();
    const photoUrl = photoCol !== -1 && row[photoCol] ? String(row[photoCol]).trim() : null;

    if (photoUrl) {
      await prisma.$executeRawUnsafe(
        `UPDATE "Student" SET "photo_url" = ? WHERE "register_number" = ?`,
        photoUrl,
        rollNo
      );
      updatedCount++;
    }
  }

  console.log(`Successfully populated photo URLs for ${updatedCount} students!`);

  // Verify sample
  const sample: any[] = await prisma.$queryRawUnsafe(`SELECT name, register_number, photo_url FROM "Student" LIMIT 3`);
  console.log("Sample Students with Photo URLs:", sample);
}

populateStudentPhotos()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
