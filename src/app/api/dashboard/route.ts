import { NextResponse } from "next/server";
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

export async function GET() {
  const stripe = new Stripe((process.env.STRIPE_SECRET_KEY ?? "").trim(), {
    httpClient: Stripe.createNodeHttpClient(),
  });

  // Fetch leads from Supabase
  const leadsRes = await fetch(
    `${SUPABASE_URL}/rest/v1/leads?select=*&order=created_at.desc&limit=200`,
    { headers: sbHeaders() },
  );
  const rawLeads = leadsRes.ok ? await leadsRes.json() : [];

  const leads = rawLeads.map((row: Record<string, unknown>) => {
    let notes: Record<string, unknown> = {};
    try {
      notes = JSON.parse((row.notes as string) || "{}");
    } catch {}
    return {
      id: row.id,
      url: row.url,
      email: row.email,
      status: row.status,
      audit_score: row.audit_score,
      created_at: row.created_at,
      business_name: notes.business_name || "",
      public_url: notes.public_url || "",
      slug: notes.slug || "",
    };
  });

  // Fetch Stripe subscriptions
  const subs = await stripe.subscriptions.list({ limit: 100, status: "all" });
  const active = subs.data.filter((s) => s.status === "active").length;
  const totalRevenue = subs.data
    .filter((s) => s.status === "active")
    .reduce((sum, s) => sum + (s.items.data[0]?.price?.unit_amount ?? 0), 0);

  const stripeRows = await Promise.all(
    subs.data.map(async (sub) => {
      const customer =
        typeof sub.customer === "string"
          ? await stripe.customers.retrieve(sub.customer)
          : sub.customer;
      const email = "deleted" in customer ? "" : (customer.email ?? "");
      return {
        id: sub.id,
        email,
        status: sub.status,
        amount: (sub.items.data[0]?.price?.unit_amount ?? 0) / 100,
        created: sub.created,
        current_period_end:
          (sub as unknown as { current_period_end?: number })
            .current_period_end ?? 0,
      };
    }),
  );

  return NextResponse.json({
    leads,
    stripe: {
      active,
      totalRevenue: totalRevenue / 100,
      subscriptions: stripeRows,
    },
  });
}
