import * as XLSX from "xlsx";

const wb = XLSX.readFile("Companies_List.xlsx");
const sheet = wb.Sheets[wb.SheetNames[0]];
const data: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

for (let i = 1; i < data.length; i++) {
  const row = data[i];
  if (row && row[1]) {
    console.log(`[${row[0]}] ${row[1]} | Opp Status: ${row[5]} | Job Status: ${row[6]}`);
  }
}
