import * as XLSX from "xlsx";
import * as path from "path";
import prisma from "../src/lib/prisma";

async function analyze() {
  const compPath = path.join(process.cwd(), "Companies_List.xlsx");
  const studPath = path.join(process.cwd(), "100_Students_List.xlsx");

  const wbComp = XLSX.readFile(compPath);
  const compSheet = wbComp.Sheets[wbComp.SheetNames[0]];
  const compRows: any[][] = XLSX.utils.sheet_to_json(compSheet, { header: 1 });

  const wbStud = XLSX.readFile(studPath);
  console.log("100_Students_List.xlsx Sheet Names:", wbStud.SheetNames);
  
  const studSheet = wbStud.Sheets[wbStud.SheetNames[0]];
  const studRows: any[][] = XLSX.utils.sheet_to_json(studSheet, { header: 1 });

  let placementsRows: any[][] = [];
  if (wbStud.SheetNames.length > 1) {
    const pSheet = wbStud.Sheets[wbStud.SheetNames[1]];
    placementsRows = XLSX.utils.sheet_to_json(pSheet, { header: 1 });
  }

  console.log("=== COMPANIES LIST ROWS ===");
  // S.No, Company Name, Job Title, CTC, Location, Opp Status, Job Status, Placed Count, Placed Details
  const companyOfferCounts = new Map<string, { count: number; details: string }>();
  for (let i = 4; i < compRows.length; i++) {
    const row = compRows[i];
    if (row && row[1]) {
      const compName = String(row[1]).trim();
      const placedCount = Number(row[7] || 0);
      const details = String(row[8] || "");
      companyOfferCounts.set(compName, { count: placedCount, details });
      console.log(`Company: "${compName}" | Placed Count: ${placedCount} | Details: ${details.slice(0, 50)}...`);
    }
  }

  console.log("\n=== PLACEMENTS & DRIVES SHEET ROWS ===");
  const studentOfferByCompany = new Map<string, number>();
  for (let i = 1; i < placementsRows.length; i++) {
    const row = placementsRows[i];
    if (row && row[0]) {
      const compPlaced = String(row[3] || "").trim();
      studentOfferByCompany.set(compPlaced, (studentOfferByCompany.get(compPlaced) || 0) + 1);
    }
  }
  for (const [comp, cnt] of studentOfferByCompany.entries()) {
    console.log(`Student Offers for "${comp}": ${cnt}`);
  }

  console.log("\n=== DB OFFERS BY COMPANY ===");
  const dbOffers = await prisma.offer.groupBy({
    by: ["company_id"],
    _count: { id: true },
  });
  for (const o of dbOffers) {
    const comp = await prisma.company.findUnique({ where: { id: o.company_id } });
    console.log(`DB Offers for "${comp?.company_name}": ${o._count.id} (Company placed_students_count field: ${comp?.placed_students_count})`);
  }
}

analyze().catch(console.error).finally(() => prisma.$disconnect());
