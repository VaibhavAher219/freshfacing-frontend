import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// GET /api/checkout?site=<cloudflare_url>
// Used by "Get Started" buttons on generated sites — no email needed, Stripe collects it
export async function GET(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const PRICE_ID = process.env.STRIPE_PRICE_ID!;
  const BASE_URL =
    process.env.NEXT_PUBLIC_BASE_URL || "https://freshfacing.com";

  const site = request.nextUrl.searchParams.get("site") || "";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      metadata: { public_url: site },
      success_url: `${BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: site || `${BASE_URL}/`,
    });

    return NextResponse.redirect(session.url!, { status: 303 });
  } catch (error) {
    console.error("Checkout GET error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const PRICE_ID = process.env.STRIPE_PRICE_ID!;
  const BASE_URL =
    process.env.NEXT_PUBLIC_BASE_URL || "https://freshfacing.com";

  try {
    const { url, email, job_id, public_url } = await request.json();
    if (!url || !email) {
      return NextResponse.json(
        { error: "url and email required" },
        { status: 400 },
      );
    }

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
      },
      success_url: `${BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/`,
    });

    return NextResponse.json({ checkout_url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout" },
      { status: 500 },
    );
  }
}
