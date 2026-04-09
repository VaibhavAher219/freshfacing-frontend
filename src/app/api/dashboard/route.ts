export const dynamic = "force-dynamic";
export const revalidate = 0;

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
    { headers: sbHeaders(), cache: "no-store" },
  );
  const rawLeads = leadsRes.ok ? await leadsRes.json() : [];

  const sbLeads = rawLeads.map((row: Record<string, unknown>) => {
    let notes: Record<string, unknown> = {};
    try {
      notes = JSON.parse((row.notes as string) || "{}");
    } catch {}
    return {
      id: String(row.id),
      url: row.url as string,
      email: row.email as string,
      status: row.status as string,
      audit_score: row.audit_score as number | null,
      created_at: row.created_at as string,
      business_name: (notes.business_name as string) || "",
      public_url: (notes.public_url as string) || "",
      slug: (notes.slug as string) || "",
      source: "supabase" as const,
    };
  });

  // Supabase leads are the source of truth — no CF Pages dependency
  const leads = sbLeads.sort(
    (a: { created_at: string }, b: { created_at: string }) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  // Fetch Stripe subscriptions — filter to FreshFacing price IDs only
  const FF_PRICE_IDS = new Set(
    [process.env.STRIPE_PRICE_ID, process.env.STRIPE_ANNUAL_PRICE_ID].filter(
      Boolean,
    ),
  );
  const subs = await stripe.subscriptions.list({ limit: 100, status: "all" });
  const ffSubs =
    FF_PRICE_IDS.size > 0
      ? subs.data.filter((s) =>
          FF_PRICE_IDS.has(s.items.data[0]?.price?.id ?? ""),
        )
      : subs.data;
  const active = ffSubs.filter((s) => s.status === "active").length;
  const totalRevenue = ffSubs
    .filter((s) => s.status === "active")
    .reduce((sum, s) => sum + (s.items.data[0]?.price?.unit_amount ?? 0), 0);

  const stripeRows = await Promise.all(
    ffSubs.map(async (sub) => {
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

  return NextResponse.json(
    {
      leads,
      stripe: {
        active,
        totalRevenue: totalRevenue / 100,
        subscriptions: stripeRows,
      },
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "CDN-Cache-Control": "no-store",
        "Cloudflare-CDN-Cache-Control": "no-store",
      },
    },
  );
}
