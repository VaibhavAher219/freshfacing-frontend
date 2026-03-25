import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const RAILWAY_URL =
  process.env.RAILWAY_URL ||
  "https://freshfacing-pipeline-production.up.railway.app";

function makeStripe() {
  return new Stripe((process.env.STRIPE_SECRET_KEY ?? "").trim(), {
    httpClient: Stripe.createNodeHttpClient(),
  });
}

export async function POST(request: NextRequest) {
  const stripe = makeStripe();
  const WEBHOOK_SECRET = (process.env.STRIPE_WEBHOOK_SECRET ?? "").trim();

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

    const email =
      session.metadata?.email || session.customer_details?.email || "";
    const slug = session.metadata?.slug || "";
    const public_url = session.metadata?.public_url || "";
    const session_id = session.id;

    if (!slug) {
      console.error("[webhook] no slug in metadata — cannot fulfill");
      return NextResponse.json({ ok: true });
    }

    // Fire-and-forget — Railway handles watermark removal + email
    fetch(`${RAILWAY_URL}/fulfill-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, email, public_url, session_id }),
    }).catch((e) => console.error("[webhook] fulfill call failed:", e));
  }

  return NextResponse.json({ ok: true });
}
