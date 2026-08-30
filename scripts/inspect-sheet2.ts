import * as XLSX from "xlsx";

const wb = XLSX.readFile("100_Students_List.xlsx");
console.log("Sheet names in 100_Students_List.xlsx:", wb.SheetNames);
if (wb.SheetNames.length > 1) {
  const sheet2 = wb.Sheets[wb.SheetNames[1]];
  const rows: any[] = XLSX.utils.sheet_to_json(sheet2, { header: 1 });
  console.log(`Total rows in ${wb.SheetNames[1]}:`, rows.length);
  for (let i = 0; i < Math.min(30, rows.length); i++) {
    console.log(`[Row ${i}]`, rows[i]);
  }
}
