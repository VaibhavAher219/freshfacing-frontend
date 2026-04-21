import { NextResponse } from "next/server";

const RAILWAY_URL =
  process.env.RAILWAY_URL ||
  "https://freshfacing-pipeline-production.up.railway.app";

export async function GET() {
  const res = await fetch(`${RAILWAY_URL}/instantly-stats`, {
    next: { revalidate: 0 },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
