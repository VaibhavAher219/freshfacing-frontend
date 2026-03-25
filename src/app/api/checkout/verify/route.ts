import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://xfshkmpmdvfnphtornwe.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function sbHeaders() {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
  };
}

export async function GET(request: NextRequest) {
  const stripe = new Stripe((process.env.STRIPE_SECRET_KEY ?? "").trim(), {
    httpClient: Stripe.createNodeHttpClient(),
  });

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

    const job_id = session.metadata?.job_id;
    const public_url = session.metadata?.public_url;
    const slug = session.metadata?.slug || "";
    const email =
      session.metadata?.email || session.customer_details?.email || "";

    return NextResponse.json({ job_id, public_url, slug, email });
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json({ error: "Failed to verify" }, { status: 500 });
  }
}
