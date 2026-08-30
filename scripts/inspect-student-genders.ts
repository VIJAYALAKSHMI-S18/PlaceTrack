import * as XLSX from "xlsx";
import * as path from "path";

const filePath = path.join(process.cwd(), "100_Students_List.xlsx");
const wb = XLSX.readFile(filePath);
const sheet = wb.Sheets[wb.SheetNames[0]];
const data: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

const students: any[] = [];
for (let i = 4; i < data.length; i++) {
  const row = data[i];
  if (row && row[0]) {
    students.push({
      roll: row[0],
      name: row[1],
      dept: row[2],
      gender: row[3],
      currentPhoto: row[17],
    });
  }
}

console.log(`Total students parsed: ${students.length}`);
console.log("Sample first 10 students:", students.slice(0, 10));
