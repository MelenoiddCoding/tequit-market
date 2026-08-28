import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const response = NextResponse.json({ ok: true });
  response.cookies.set("tequit_demo_role", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: new URL(request.url).protocol === "https:",
    expires: new Date(0),
    maxAge: 0,
    path: "/",
  });
  return response;
}
