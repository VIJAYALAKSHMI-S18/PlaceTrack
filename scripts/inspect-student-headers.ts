import * as XLSX from "xlsx";
import * as path from "path";

const filePath = path.join(process.cwd(), "100_Students_List.xlsx");
const wb = XLSX.readFile(filePath);
const sheet = wb.Sheets[wb.SheetNames[0]];
const data: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

for (let i = 0; i < Math.min(data.length, 6); i++) {
  console.log(`Row ${i}:`, data[i]);
}
