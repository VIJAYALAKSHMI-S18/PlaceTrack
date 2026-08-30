import * as XLSX from "xlsx";

const wb = XLSX.readFile("100_Students_List.xlsx");
const sheet1 = wb.Sheets[wb.SheetNames[0]];
const data1: any[] = XLSX.utils.sheet_to_json(sheet1, { header: 1 });
let placedCount = 0;
let yetToPlaceCount = 0;
for (let i = 2; i < data1.length; i++) {
  const row = data1[i];
  if (row && row[0] && row[0] !== "Roll No") {
    const status = String(row[18] || "").trim().toUpperCase();
    if (status === "PLACED") placedCount++;
    else yetToPlaceCount++;
  }
}
console.log("Sheet 1 Counts -> Placed:", placedCount, "Unplaced / Yet to be placed:", yetToPlaceCount);
