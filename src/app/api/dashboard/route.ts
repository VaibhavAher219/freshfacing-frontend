export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import Stripe from "stripe";

const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://xfshkmpmdvfnphtornwe.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || "";
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || "";

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

  // Fetch Cloudflare Pages projects
  const cfRes =
    CF_ACCOUNT_ID && CF_API_TOKEN
      ? await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/pages/projects`,
          { headers: { Authorization: `Bearer ${CF_API_TOKEN}` } },
        ).catch(() => null)
      : null;

  const cfData = cfRes?.ok ? await cfRes.json() : null;
  const cfProjects: Array<{
    name: string;
    subdomain: string;
    created_on: string;
  }> = cfData?.result ?? [];

  type SbLead = {
    id: string;
    url: string;
    email: string;
    status: string;
    audit_score: number | null;
    created_at: string;
    business_name: string;
    public_url: string;
    slug: string;
  };
  // Build slug → supabase lead map
  const sbBySlug = new Map<string, SbLead>(
    sbLeads.map((l: SbLead) => [l.slug, l]),
  );
  const sbByUrl = new Map<string, SbLead>(
    sbLeads.map((l: SbLead) => [l.url, l]),
  );

  // Merge: CF is authoritative for deployed sites
  const leads = cfProjects.map((p) => {
    const slug = p.name.replace(/^freshfacing-/, "");
    const publicUrl = `https://${p.subdomain}`;
    const existing: SbLead | undefined =
      sbBySlug.get(slug) ?? sbByUrl.get(slug) ?? sbByUrl.get(publicUrl);
    return {
      id: existing?.id ?? p.name,
      url: existing?.url ?? publicUrl,
      email: existing?.email ?? "",
      status: existing?.status ?? "done",
      audit_score: existing?.audit_score ?? null,
      created_at: existing?.created_at ?? p.created_on,
      business_name:
        existing?.business_name ||
        slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      public_url: publicUrl,
      slug,
    };
  });

  // Add any supabase leads not in CF (running/failed jobs)
  for (const lead of sbLeads) {
    const alreadyIn = leads.some(
      (l) => l.slug === lead.slug || l.id === lead.id,
    );
    if (!alreadyIn) {
      leads.push({
        id: lead.id,
        url: lead.url,
        email: lead.email,
        status: lead.status,
        audit_score: lead.audit_score,
        created_at: lead.created_at,
        business_name: lead.business_name,
        public_url: lead.public_url,
        slug: lead.slug,
      });
    }
  }

  // Sort by created_at desc
  leads.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

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
