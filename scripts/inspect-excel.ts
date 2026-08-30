import * as XLSX from "xlsx";

function inspect() {
  try {
    const wb1 = XLSX.readFile("100_Students_List.xlsx");
    console.log("=== 100_Students_List.xlsx ===");
    console.log("Sheets:", wb1.SheetNames);
    const data1 = XLSX.utils.sheet_to_json(wb1.Sheets[wb1.SheetNames[0]]);
    console.log("Total Student Rows:", data1.length);
    console.log("Columns:", Object.keys(data1[0] as any));
    console.log("Sample Row 0:", data1[0]);
    console.log("Sample Row 1:", data1[1]);
  } catch (e: any) {
    console.error("Error reading students xlsx:", e.message);
  }

  try {
    const wb2 = XLSX.readFile("Companies_List.xlsx");
    console.log("\n=== Companies_List.xlsx ===");
    console.log("Sheets:", wb2.SheetNames);
    const data2 = XLSX.utils.sheet_to_json(wb2.Sheets[wb2.SheetNames[0]]);
    console.log("Total Company Rows:", data2.length);
    console.log("Columns:", Object.keys(data2[0] as any));
    console.log("Sample Row 0:", data2[0]);
    console.log("Sample Row 1:", data2[1]);
    console.log("Sample Row 2:", data2[2]);
  } catch (e: any) {
    console.error("Error reading companies xlsx:", e.message);
  }
}

inspect();
