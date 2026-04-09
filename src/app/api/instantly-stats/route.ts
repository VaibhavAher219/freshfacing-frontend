import { NextResponse } from "next/server";

const INSTANTLY_API_KEY =
  process.env.INSTANTLY_API_KEY ||
  "OTNiZmFlMGMtMzk0Mi00MzllLWIxYmEtYWVkZDBlNWVhYjliOmFPS3JhSUJIUEhDaA==";
const CAMPAIGN_ID =
  process.env.INSTANTLY_CAMPAIGN_ID || "343598a5-5496-4db7-99d1-063513915fc4";

export async function GET() {
  const res = await fetch(
    `https://api.instantly.ai/api/v2/campaigns/analytics?id=${CAMPAIGN_ID}`,
    {
      headers: { Authorization: `Bearer ${INSTANTLY_API_KEY}` },
      next: { revalidate: 0 },
    },
  );
  if (!res.ok) return NextResponse.json({ error: "failed" }, { status: 502 });
  const data = await res.json();
  const c = Array.isArray(data) ? data[0] : data;
  return NextResponse.json({
    leads: c.leads_count ?? 0,
    sent: c.emails_sent_count ?? 0,
    opens: c.open_count_unique ?? 0,
    replies: c.reply_count_unique ?? 0,
    bounced: c.bounced_count ?? 0,
    completed: c.completed_count ?? 0,
  });
}
