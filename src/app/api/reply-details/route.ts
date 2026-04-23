export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";

const RAILWAY_URL =
  process.env.RAILWAY_URL ||
  "https://freshfacing-pipeline-production-c644.up.railway.app";

export async function GET() {
  const res = await fetch(`${RAILWAY_URL}/reply-details`, {
    cache: "no-store",
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
