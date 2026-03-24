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
  };
}

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

  const rawBody = await request.text();
  const sig = request.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig!, WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status !== "paid")
      return NextResponse.json({ ok: true });

    const url = session.metadata?.url;
    const email = session.metadata?.email || session.customer_email;
    const sessionId = session.id;

    if (!url) return NextResponse.json({ ok: true });

    // idempotency check
    try {
      const existing = await fetch(
        `${SUPABASE_URL}/rest/v1/leads?stripe_session_id=eq.${sessionId}&select=job_id`,
        { headers: sbHeaders() },
      );
      const rows = await existing.json();
      if (rows?.[0]?.job_id) return NextResponse.json({ ok: true });
    } catch {}

    // trigger pipeline
    try {
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

      if (job_id) {
        fetch(`${SUPABASE_URL}/rest/v1/leads?job_id=eq.${job_id}`, {
          method: "PATCH",
          headers: sbHeaders(),
          body: JSON.stringify({ email, stripe_session_id: sessionId }),
        }).catch(() => {});
      }
    } catch (err) {
      console.error("Webhook pipeline trigger failed:", err);
    }
  }

  return NextResponse.json({ ok: true });
}
