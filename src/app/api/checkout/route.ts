import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

function makeStripe() {
  return new Stripe((process.env.STRIPE_SECRET_KEY ?? "").trim(), {
    httpClient: Stripe.createNodeHttpClient(),
  });
}

function getPriceId(plan: string) {
  if (plan === "annual")
    return (process.env.STRIPE_ANNUAL_PRICE_ID ?? "").trim();
  return (process.env.STRIPE_PRICE_ID ?? "").trim();
}

/** Extract slug from a freshfacing.com/slug or freshfacing-{slug}.pages.dev URL */
function slugFromPublicUrl(publicUrl: string): string {
  try {
    const u = new URL(
      publicUrl.startsWith("http") ? publicUrl : "https://" + publicUrl,
    );
    // freshfacing.com/slug → slug
    const parts = u.pathname.replace(/^\//, "").split("/");
    if (parts[0]) return parts[0];
    // freshfacing-{slug}.pages.dev → slug
    const host = u.hostname;
    if (host.endsWith(".pages.dev")) {
      const sub = host.replace(".pages.dev", "");
      if (sub.startsWith("freshfacing-"))
        return sub.replace("freshfacing-", "");
    }
    return host.replace("www.", "").replace(/\./g, "-");
  } catch {
    return "";
  }
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
      metadata: { public_url: site, plan, slug: slugFromPublicUrl(site) },
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
    const slug = slugFromPublicUrl(public_url || url);

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
        slug,
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
