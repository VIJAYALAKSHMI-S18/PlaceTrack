import prisma from "../src/lib/prisma";

async function main() {
  const st = await prisma.student.findFirst();
  if (st) {
    const res = await fetch(`http://localhost:3000/students/${st.id}`);
    console.log(`Student Profile Page Status for "${st.name}":`, res.status);
  }
}

main().finally(() => prisma.$disconnect());
