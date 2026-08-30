import prisma from "./src/lib/prisma";

async function verify() {
  console.log("Verifying authenticated API request to /api/students...");
  const loginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@example.com", password: "admin123" }),
  });

  const cookieHeader = loginRes.headers.get("set-cookie");
  const cookie = cookieHeader ? cookieHeader.split(";")[0] : "";
  console.log("Login Status:", loginRes.status, "| Cookie:", cookie);

  const res = await fetch("http://localhost:3000/api/students?page=1&limit=10&isTerminated=false", {
    headers: { Cookie: cookie },
  });

  const json = await res.json();
  console.log("API /api/students Status:", res.status);
  console.log("Returned Data Count:", json.data?.length, "Total Count:", json.meta?.total);
  if (json.data && json.data.length > 0) {
    console.log("Sample First Student:", {
      name: json.data[0].name,
      reg: json.data[0].register_number,
      dept: json.data[0].department,
      photo: json.data[0].photo_url,
    });
  }
}

verify().catch(console.error);
