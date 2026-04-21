export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";

const RAILWAY_URL =
  process.env.RAILWAY_URL ||
  "https://freshfacing-pipeline-production.up.railway.app";

export async function GET() {
  const res = await fetch(`${RAILWAY_URL}/dashboard`, { cache: "no-store" });
  const data = await res.json();
  return NextResponse.json(data, {
    status: res.status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "CDN-Cache-Control": "no-store",
    },
  });
}
