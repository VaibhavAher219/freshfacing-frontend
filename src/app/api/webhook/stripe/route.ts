import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";

const RAILWAY_URL =
  process.env.RAILWAY_URL ||
  "https://freshfacing-pipeline-production.up.railway.app";
const FULFILL_SECRET = process.env.FULFILL_SECRET || "";

function verifyStripeSignature(
  payload: string,
  sig: string,
  secret: string,
): boolean {
  const t = sig
    .split(",")
    .find((p) => p.startsWith("t="))
    ?.slice(2);
  const v1 = sig
    .split(",")
    .find((p) => p.startsWith("v1="))
    ?.slice(3);
  if (!t || !v1) return false;
  const expected = createHmac("sha256", secret)
    .update(`${t}.${payload}`)
    .digest("hex");
  return expected === v1;
}

export async function POST(request: NextRequest) {
  const WEBHOOK_SECRET = (process.env.STRIPE_WEBHOOK_SECRET ?? "").trim();
  const rawBody = await request.text();
  const sig = request.headers.get("stripe-signature") ?? "";

  if (!verifyStripeSignature(rawBody, sig, WEBHOOK_SECRET)) {
    console.error("Webhook signature failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: { type: string; data: { object: Record<string, unknown> } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    if (session.payment_status !== "paid")
      return NextResponse.json({ ok: true });

    const meta = (session.metadata as Record<string, string>) || {};
    const customer_details =
      (session.customer_details as Record<string, string>) || {};
    const slug = meta.slug || "";
    const email = meta.email || customer_details.email || "";
    const public_url = meta.public_url || "";
    const session_id = (session.id as string) || "";
    const plan = meta.plan || "monthly";

    if (!slug) {
      console.error("[webhook] no slug in metadata — cannot fulfill");
      return NextResponse.json({ ok: true });
    }

    fetch(`${RAILWAY_URL}/fulfill-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(FULFILL_SECRET ? { "X-Fulfill-Secret": FULFILL_SECRET } : {}),
      },
      body: JSON.stringify({ slug, email, public_url, session_id, plan }),
    }).catch((e) => console.error("[webhook] fulfill call failed:", e));
  }

  return NextResponse.json({ ok: true });
}
