import * as XLSX from "xlsx";

const wb2 = XLSX.readFile("Companies_List.xlsx");
const sheet2 = wb2.Sheets[wb2.SheetNames[0]];
const data2: any[] = XLSX.utils.sheet_to_json(sheet2, { header: 1 });

console.log("Header row:", data2[1]);
console.log("\nCompanies and Placed Details:");
for (let i = 2; i < data2.length; i++) {
  const row = data2[i];
  if (row && row.length > 0) {
    console.log(`[Row ${i}] Company: ${row[1]} | Placed Detail: "${row[8]}" | Placed Count: ${row[7]}`);
  }
}

const wb1 = XLSX.readFile("100_Students_List.xlsx");
const sheet1 = wb1.Sheets[wb1.SheetNames[0]];
const data1: any[] = XLSX.utils.sheet_to_json(sheet1, { header: 1 });
console.log("\nSample Students Roll Numbers in 100_Students_List.xlsx:");
for (let i = 2; i < Math.min(20, data1.length); i++) {
  const row = data1[i];
  if (row) {
    console.log(`[Student ${i}] Roll: "${row[0]}" | Name: "${row[1]}" | Placement Status: "${row[18]}"`);
  }
}
