import { NextRequest, NextResponse } from "next/server";

const RAILWAY_URL =
  process.env.RAILWAY_URL ||
  "https://freshfacing-pipeline-production.up.railway.app";

export async function GET(request: NextRequest) {
  const site = request.nextUrl.searchParams.get("site") || "";
  const plan = request.nextUrl.searchParams.get("plan") || "monthly";
  const email = request.nextUrl.searchParams.get("email") || "";

  const res = await fetch(
    `${RAILWAY_URL}/checkout?site=${encodeURIComponent(site)}&plan=${plan}&email=${encodeURIComponent(email)}`,
    { redirect: "manual" },
  );

  if (res.status === 303 || res.status === 301 || res.status === 302) {
    return NextResponse.redirect(res.headers.get("location")!, { status: 303 });
  }

  const data = await res.json();
  if (data.url) return NextResponse.redirect(data.url, { status: 303 });
  return NextResponse.json(data, { status: res.status });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const res = await fetch(`${RAILWAY_URL}/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
