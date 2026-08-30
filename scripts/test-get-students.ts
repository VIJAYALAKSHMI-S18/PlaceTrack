import prisma from "../src/lib/prisma";
import { getStudents } from "../src/services/student.service";

async function test() {
  const count = await prisma.student.count();
  console.log("Total students in DB:", count);
  const res = await getStudents({ page: 1, limit: 10, isTerminated: false });
  console.log("getStudents result count:", res.students.length, "Total:", res.meta.total);
  if (res.students.length > 0) {
    console.log("First student:", res.students[0].name, res.students[0].register_number, res.students[0].photo_url);
  }
}

test().catch(console.error).finally(() => prisma.$disconnect());
