import { NextRequest, NextResponse } from "next/server";

const RAILWAY_URL =
  process.env.RAILWAY_URL ||
  "https://freshfacing-pipeline-production.up.railway.app";

export async function POST(request: NextRequest) {
  try {
    const {
      url,
      email,
      first_name,
      last_name,
      business_name: bizName,
    } = await request.json();
    if (!url || !email) {
      return NextResponse.json(
        { error: "url and email are required" },
        { status: 400 },
      );
    }

    const hostname = new URL(
      url.startsWith("http") ? url : "https://" + url,
    ).hostname.replace("www.", "");
    const business_name =
      (bizName || "").trim() || hostname.split(".")[0].replace(/-/g, " ");

    const railwayRes = await fetch(`${RAILWAY_URL}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        business_name,
        city: "",
        state: "",
        first_name: first_name || "",
        last_name: last_name || "",
        email,
      }),
    });
    const { job_id } = await railwayRes.json();
    return NextResponse.json({ job_id });
  } catch (error) {
    console.error("Lead error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
