import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// GET /api/checkout?site=<cloudflare_url>&plan=monthly|annual
// Used by "Get Started" buttons on generated sites — no email needed, Stripe collects it
function makeStripe() {
  return new Stripe((process.env.STRIPE_SECRET_KEY ?? "").trim(), {
    httpClient: Stripe.createNodeHttpClient(),
  });
}

function getPriceId(plan: string) {
  if (plan === "annual") {
    return (process.env.STRIPE_ANNUAL_PRICE_ID ?? "").trim();
  }
  return (process.env.STRIPE_PRICE_ID ?? "").trim();
}

export async function GET(request: NextRequest) {
  const stripe = makeStripe();
  const BASE_URL = (
    process.env.NEXT_PUBLIC_BASE_URL || "https://freshfacing.com"
  ).trim();

  const site = request.nextUrl.searchParams.get("site") || "";
  const plan = request.nextUrl.searchParams.get("plan") || "monthly";
  const PRICE_ID = getPriceId(plan);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      metadata: { public_url: site, plan },
      success_url: `${BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: site || `${BASE_URL}/`,
    });

    return NextResponse.redirect(session.url!, { status: 303 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Checkout GET error:", msg);
    return NextResponse.json(
      { error: "Failed to create checkout", detail: msg },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const stripe = makeStripe();
  const BASE_URL = (
    process.env.NEXT_PUBLIC_BASE_URL || "https://freshfacing.com"
  ).trim();

  try {
    const { url, email, job_id, public_url, plan } = await request.json();
    if (!url || !email) {
      return NextResponse.json(
        { error: "url and email required" },
        { status: 400 },
      );
    }

    const PRICE_ID = getPriceId(plan || "monthly");

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      metadata: {
        url,
        email,
        job_id: job_id || "",
        public_url: public_url || "",
        plan: plan || "monthly",
      },
      success_url: `${BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/`,
    });

    return NextResponse.json({ checkout_url: session.url });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Checkout POST error:", msg);
    return NextResponse.json(
      { error: "Failed to create checkout", detail: msg },
      { status: 500 },
    );
  }
}
