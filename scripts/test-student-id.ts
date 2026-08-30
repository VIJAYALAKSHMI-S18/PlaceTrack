import prisma from "../src/lib/prisma";
import { getStudentById } from "../src/services/student.service";

async function main() {
  const student = await prisma.student.findUnique({
    where: { id: "cmtflvg1b000noj5nc58s2mow" },
  });
  console.log("Direct Prisma query for student:", student ? student.name : "NULL");

  const serviceStudent = await getStudentById("cmtflvg1b000noj5nc58s2mow");
  console.log("Service getStudentById:", serviceStudent ? serviceStudent.name : "NULL");

  if (!student) {
    const anyStudent = await prisma.student.findFirst();
    console.log("First available student in DB:", anyStudent ? `${anyStudent.name} (ID: ${anyStudent.id})` : "NO STUDENTS");
  }
}

main().finally(() => prisma.$disconnect());
