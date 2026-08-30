import prisma from "./src/lib/prisma";

async function testFetch() {
  const loginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@example.com", password: "password123" }),
  });
  const cookie = loginRes.headers.get("set-cookie");
  console.log("Login Cookie:", cookie ? "Obtained" : "Failed");

  const res = await fetch("http://localhost:3000/api/students?page=1&limit=10&isTerminated=false", {
    headers: { Cookie: cookie || "" },
  });
  const json = await res.json();
  console.log("api/students Response Status:", res.status);
  console.log("api/students Response JSON:", json);
}

testFetch().catch(console.error);
