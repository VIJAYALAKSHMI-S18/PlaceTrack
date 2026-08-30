import * as XLSX from "xlsx";
import * as path from "path";

async function syncCompanyOfferCounts() {
  console.log("==================================================");
  console.log("SYNCHRONIZING COMPANY OFFER COUNTS WITH PLACED STUDENTS");
  console.log("==================================================");

  const compPath = path.join(process.cwd(), "Companies_List.xlsx");
  const studPath = path.join(process.cwd(), "100_Students_List.xlsx");

  const wbStud = XLSX.readFile(studPath);
  const pSheet = wbStud.Sheets[wbStud.SheetNames[1]]; // 'Placements & Drives (100)'
  const placementRows: any[][] = XLSX.utils.sheet_to_json(pSheet, { header: 1 });

  // Map of Company Name -> Array of placed students
  const companyPlacedStudents = new Map<string, { roll: string; name: string; role: string; ctc: number; date: string }[]>();

  for (let r = 1; r < placementRows.length; r++) {
    const row = placementRows[r];
    if (!row || !row[0]) continue;

    const rollNo = String(row[0]).trim();
    const studentName = String(row[1]).trim();
    const compPlaced = String(row[3] || "").trim();
    const roleOffered = String(row[4] || "").trim();
    const ctc = parseFloat(String(row[5] || "0")) || 0;
    const placementDate = String(row[8] || "Aug 30, 2026").trim();

    if (compPlaced && compPlaced !== "-" && compPlaced !== "Company Placed") {
      if (!companyPlacedStudents.has(compPlaced)) {
        companyPlacedStudents.set(compPlaced, []);
      }
      companyPlacedStudents.get(compPlaced)!.push({
        roll: rollNo,
        name: studentName,
        role: roleOffered,
        ctc,
        date: placementDate,
      });
    }
  }

  console.log("Placed Students per Company found in 100_Students_List.xlsx:");
  for (const [comp, list] of companyPlacedStudents.entries()) {
    console.log(`- ${comp}: ${list.length} students placed`);
  }

  // Update Companies_List.xlsx
  const wbComp = XLSX.readFile(compPath);
  const compSheet = wbComp.Sheets[wbComp.SheetNames[0]];
  const compRows: any[][] = XLSX.utils.sheet_to_json(compSheet, { header: 1 });

  let updatedCount = 0;
  for (let r = 4; r < compRows.length; r++) {
    const row = compRows[r];
    if (!row || !row[1]) continue;

    const compName = String(row[1]).trim();
    const placedList = companyPlacedStudents.get(compName) || [];

    // Col 7: Placed Students Count
    row[7] = placedList.length;

    // Col 8: Placed Students Details
    if (placedList.length > 0) {
      row[8] = placedList.map((s) => `${s.name} (${s.roll})`).join(", ");
    } else {
      row[8] = "Drive Scheduled - In Progress";
    }

    updatedCount++;
    console.log(`Updated "${compName}": Count = ${row[7]} | Details = ${String(row[8]).slice(0, 60)}...`);
  }

  const updatedCompSheet = XLSX.utils.aoa_to_sheet(compRows);
  wbComp.Sheets[wbComp.SheetNames[0]] = updatedCompSheet;
  XLSX.writeFile(wbComp, compPath);

  console.log(`\nSuccessfully updated ${updatedCount} companies in Companies_List.xlsx with exact matching placed student counts!`);
}

syncCompanyOfferCounts().catch(console.error);
