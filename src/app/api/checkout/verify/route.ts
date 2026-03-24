import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const RAILWAY_URL =
  process.env.RAILWAY_URL ||
  "https://freshfacing-pipeline-production.up.railway.app";
const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://xfshkmpmdvfnphtornwe.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function sbHeaders() {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };
}

async function getExistingJob(sessionId: string): Promise<string | null> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/leads?stripe_session_id=eq.${sessionId}&select=job_id`,
      { headers: sbHeaders() },
    );
    const rows = await res.json();
    return rows?.[0]?.job_id || null;
  } catch {
    return null;
  }
}

async function triggerPipeline(
  url: string,
  email: string,
  sessionId: string,
): Promise<string> {
  const hostname = new URL(
    url.startsWith("http") ? url : "https://" + url,
  ).hostname.replace("www.", "");
  const business_name = hostname.split(".")[0].replace(/-/g, " ");

  const railwayRes = await fetch(`${RAILWAY_URL}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, business_name, city: "", state: "" }),
  });
  const { job_id } = await railwayRes.json();

  if (SUPABASE_KEY && job_id) {
    fetch(`${SUPABASE_URL}/rest/v1/leads?job_id=eq.${job_id}`, {
      method: "PATCH",
      headers: sbHeaders(),
      body: JSON.stringify({ email, stripe_session_id: sessionId }),
    }).catch(() => {});
  }

  return job_id;
}

export async function GET(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  try {
    const sessionId = request.nextUrl.searchParams.get("session_id");
    if (!sessionId) {
      return NextResponse.json(
        { error: "session_id required" },
        { status: 400 },
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not complete" },
        { status: 402 },
      );
    }

    const existingJobId = await getExistingJob(sessionId);
    if (existingJobId) {
      return NextResponse.json({ job_id: existingJobId });
    }

    const url = session.metadata?.url;
    const email = session.metadata?.email || session.customer_email;
    if (!url) {
      return NextResponse.json(
        { error: "Missing url in session metadata" },
        { status: 400 },
      );
    }

    const job_id = await triggerPipeline(url, email || "", sessionId);
    return NextResponse.json({ job_id });
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json({ error: "Failed to verify" }, { status: 500 });
  }
}
