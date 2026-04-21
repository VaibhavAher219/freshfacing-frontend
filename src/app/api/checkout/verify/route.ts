import { NextRequest, NextResponse } from "next/server";

const RAILWAY_URL =
  process.env.RAILWAY_URL ||
  "https://freshfacing-pipeline-production.up.railway.app";

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");
  if (!sessionId)
    return NextResponse.json({ error: "session_id required" }, { status: 400 });

  const res = await fetch(
    `${RAILWAY_URL}/checkout/verify?session_id=${encodeURIComponent(sessionId)}`,
  );
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
