import * as XLSX from "xlsx";

const wb = XLSX.readFile("Companies_List.xlsx");
const sheet = wb.Sheets[wb.SheetNames[0]];
const data: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log("Headers:", data[1]);
console.log("\nCompany Rows:");
for (let i = 2; i < data.length; i++) {
  const row = data[i];
  if (row && row[1] && row[1] !== "Company Name") {
    console.log(`[${row[0]}] Company: ${row[1]} | Role: ${row[2]} | CTC: ${row[3]} | JD PDF Link: ${row[10]}`);
  }
}
