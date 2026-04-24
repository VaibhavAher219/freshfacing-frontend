"use client";

import { useEffect, useState, useCallback } from "react";

type Lead = {
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

type Subscription = {
  id: string;
  email: string;
  status: string;
  amount: number;
  created: number;
  current_period_end: number;
};

type DashData = {
  leads: Lead[];
  stripe: {
    active: number;
    totalRevenue: number;
    subscriptions: Subscription[];
  };
};

const STATUS_COLOR: Record<string, string> = {
  // pipeline statuses
  site_built: "#2d6a4f",
  converted: "#1a5c8a",
  new: "#b07d00",
  done: "#2d6a4f",
  running: "#b07d00",
  failed: "#c0392b",
  sold: "#6b21a8",
  // stripe statuses
  active: "#2d6a4f",
  canceled: "#888",
  past_due: "#c0392b",
};

const STATUS_LABEL: Record<string, string> = {
  new: "pending",
  converted: "rebuilt",
  sold: "sold",
  site_built: "site built",
  done: "done",
  running: "running",
  failed: "failed",
};

function fmt(ts: string | number) {
  const d = typeof ts === "number" ? new Date(ts * 1000) : new Date(ts);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

type CampaignStats = {
  leads: number;
  sent: number;
  replies: number;
  positive_replies: number;
  bounced: number;
  completed: number;
};

type ReplyDetail = {
  email: string;
  subject: string;
  preview: string;
  timestamp: string;
  is_positive: boolean;
  old_site: string | null;
  new_site: string | null;
};

export default function Dashboard() {
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [tab, setTab] = useState<"leads" | "stripe" | "costs">("leads");
  const [campaign, setCampaign] = useState<CampaignStats | null>(null);
  const [modal, setModal] = useState<"replies" | "positive" | null>(null);
  const [replyDetails, setReplyDetails] = useState<ReplyDetail[] | null>(null);
  const [replyLoading, setReplyLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [r, cr] = await Promise.all([
        fetch("/api/dashboard", { cache: "no-store" }),
        fetch("/api/instantly-stats", { cache: "no-store" }),
      ]);
      if (r.ok) setData(await r.json());
      if (cr.ok) setCampaign(await cr.json());
      setLastRefresh(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  const openModal = useCallback(
    async (type: "replies" | "positive") => {
      setModal(type);
      if (replyDetails) return;
      setReplyLoading(true);
      try {
        const r = await fetch("/api/reply-details", { cache: "no-store" });
        if (r.ok) {
          const d = await r.json();
          setReplyDetails(d.replies ?? []);
        }
      } finally {
        setReplyLoading(false);
      }
    },
    [replyDetails],
  );

  useEffect(() => {
    load();
    const interval = setInterval(load, 60 * 1000);
    return () => clearInterval(interval);
  }, [load]);

  return (
    <div
      style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        background: "#faf7f2",
        minHeight: "100vh",
        padding: "32px 24px",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 28,
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "'Newsreader', Georgia, serif",
                fontSize: "1.6rem",
                fontWeight: 700,
                color: "#1a1a1a",
                margin: 0,
              }}
            >
              FreshFacing Dashboard
            </h1>
            {lastRefresh && (
              <p style={{ fontSize: 12, color: "#999", margin: "4px 0 0" }}>
                Last refreshed {lastRefresh.toLocaleTimeString()} ·
                auto-refreshes every 60s
              </p>
            )}
          </div>
          <button
            onClick={load}
            disabled={loading}
            style={{
              background: "#1a1a1a",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 20px",
              fontWeight: 600,
              fontSize: 14,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {/* Stat cards */}
        {data && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 16,
              marginBottom: 28,
            }}
          >
            {[
              { label: "Total Leads", value: data.leads.length },
              {
                label: "Sites Generated",
                value: data.leads.filter((l) => !!l.public_url).length,
              },
              { label: "Active Subscriptions", value: data.stripe.active },
              {
                label: "Monthly Revenue",
                value: `$${data.stripe.totalRevenue.toFixed(0)}`,
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  background: "#fff",
                  border: "1px solid #e8e2d9",
                  borderRadius: 12,
                  padding: "20px 24px",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#888",
                    marginBottom: 8,
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontSize: "1.8rem",
                    fontWeight: 700,
                    color: "#1a1a1a",
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Campaign stats */}
        {campaign && (
          <div style={{ marginBottom: 28 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#aaa",
                marginBottom: 10,
              }}
            >
              Instantly Campaign
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: 12,
              }}
            >
              {[
                {
                  label: "In Campaign",
                  value: campaign.leads,
                  pct: null,
                  clickType: null,
                },
                {
                  label: "Emails Sent",
                  value: campaign.sent,
                  pct: null,
                  clickType: null,
                },
                {
                  label: "Replies",
                  value: campaign.replies,
                  pct: campaign.sent ? campaign.replies / campaign.sent : null,
                  clickType: "replies" as const,
                },
                {
                  label: "Positive Replies",
                  value: campaign.positive_replies,
                  pct: campaign.sent
                    ? campaign.positive_replies / campaign.sent
                    : null,
                  clickType: "positive" as const,
                },
                {
                  label: "Bounced",
                  value: campaign.bounced,
                  pct: campaign.sent ? campaign.bounced / campaign.sent : null,
                  clickType: null,
                },
                {
                  label: "Completed",
                  value: campaign.completed,
                  pct: campaign.leads
                    ? campaign.completed / campaign.leads
                    : null,
                  clickType: null,
                },
              ].map(({ label, value, pct, clickType }) => (
                <div
                  key={label}
                  onClick={() => clickType && openModal(clickType)}
                  style={{
                    background: "#fff",
                    border: "1px solid #e8e2d9",
                    borderRadius: 12,
                    padding: "16px 20px",
                    cursor: clickType ? "pointer" : "default",
                    transition: "border-color 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (clickType)
                      (e.currentTarget as HTMLDivElement).style.borderColor =
                        "#1a1a1a";
                  }}
                  onMouseLeave={(e) => {
                    if (clickType)
                      (e.currentTarget as HTMLDivElement).style.borderColor =
                        "#e8e2d9";
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "#aaa",
                      marginBottom: 6,
                    }}
                  >
                    {label}
                    {clickType && (
                      <span style={{ marginLeft: 4, color: "#ccc" }}>↗</span>
                    )}
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "baseline", gap: 8 }}
                  >
                    <div
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: 700,
                        color: "#1a1a1a",
                      }}
                    >
                      {value}
                    </div>
                    {pct !== null && (
                      <div
                        style={{ fontSize: 12, fontWeight: 600, color: "#888" }}
                      >
                        {(pct * 100).toFixed(1)}%
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {(["leads", "stripe", "costs"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "8px 18px",
                borderRadius: 8,
                border: "1.5px solid",
                borderColor: tab === t ? "#1a1a1a" : "#e8e2d9",
                background: tab === t ? "#1a1a1a" : "#fff",
                color: tab === t ? "#fff" : "#555",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {t === "leads"
                ? "Leads & Sites"
                : t === "stripe"
                  ? "Stripe Subscriptions"
                  : "Cost Breakdown"}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading && !data ? (
          <div
            style={{ textAlign: "center", padding: "60px 0", color: "#888" }}
          >
            Loading…
          </div>
        ) : data && tab === "leads" ? (
          <div
            style={{
              background: "#fff",
              border: "1px solid #e8e2d9",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#faf7f2",
                    borderBottom: "1px solid #e8e2d9",
                  }}
                >
                  {["Date", "URL", "Business", "Email", "Status", "Site"].map(
                    (h) => (
                      <th
                        key={h}
                        style={{
                          padding: "12px 16px",
                          textAlign: "left",
                          fontWeight: 600,
                          fontSize: 11,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          color: "#888",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {data.leads
                  .filter(
                    (lead) =>
                      /^[a-zA-Z0-9]/.test(lead.url || "") &&
                      lead.status !== "new",
                  )
                  .map((lead, i) => (
                    <tr
                      key={lead.id}
                      style={{
                        borderBottom: "1px solid #f0ece6",
                        background: i % 2 === 0 ? "#fff" : "#fdfcfa",
                      }}
                    >
                      <td
                        style={{
                          padding: "12px 16px",
                          whiteSpace: "nowrap",
                          color: "#888",
                        }}
                      >
                        {fmt(lead.created_at)}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          maxWidth: 180,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <a
                          href={`https://${lead.url?.replace(/^[^a-zA-Z0-9]*(?:https?:\/\/)?/, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#1a1a1a", textDecoration: "none" }}
                        >
                          {lead.url?.replace(
                            /^[^a-zA-Z0-9]*(?:https?:\/\/)?/,
                            "",
                          )}
                        </a>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#555" }}>
                        {lead.business_name || "—"}
                      </td>
                      <td style={{ padding: "12px 16px", color: "#555" }}>
                        {lead.email || "—"}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span
                          style={{
                            background: `${STATUS_COLOR[lead.status] || "#888"}18`,
                            color: STATUS_COLOR[lead.status] || "#888",
                            padding: "3px 10px",
                            borderRadius: 20,
                            fontWeight: 600,
                            fontSize: 11,
                          }}
                        >
                          {STATUS_LABEL[lead.status] || lead.status || "—"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {lead.public_url ? (
                          <a
                            href={lead.public_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: "#5c7a5c",
                              fontWeight: 600,
                              textDecoration: "none",
                            }}
                          >
                            View →
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                {data.leads.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        padding: "40px 16px",
                        textAlign: "center",
                        color: "#aaa",
                      }}
                    >
                      No leads yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : data && tab === "stripe" ? (
          <div
            style={{
              background: "#fff",
              border: "1px solid #e8e2d9",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#faf7f2",
                    borderBottom: "1px solid #e8e2d9",
                  }}
                >
                  {[
                    "Started",
                    "Email",
                    "Status",
                    "Amount",
                    "Renews",
                    "Stripe",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontWeight: 600,
                        fontSize: 11,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color: "#888",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.stripe.subscriptions.map((sub, i) => (
                  <tr
                    key={sub.id}
                    style={{
                      borderBottom: "1px solid #f0ece6",
                      background: i % 2 === 0 ? "#fff" : "#fdfcfa",
                    }}
                  >
                    <td
                      style={{
                        padding: "12px 16px",
                        whiteSpace: "nowrap",
                        color: "#888",
                      }}
                    >
                      {fmt(sub.created)}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#555" }}>
                      {sub.email || "—"}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          background: `${STATUS_COLOR[sub.status] || "#888"}18`,
                          color: STATUS_COLOR[sub.status] || "#888",
                          padding: "3px 10px",
                          borderRadius: 20,
                          fontWeight: 600,
                          fontSize: 11,
                        }}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        color: "#1a1a1a",
                        fontWeight: 600,
                      }}
                    >
                      ${sub.amount}/mo
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        whiteSpace: "nowrap",
                        color: "#888",
                      }}
                    >
                      {fmt(sub.current_period_end)}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <a
                        href={`https://dashboard.stripe.com/test/subscriptions/${sub.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#5c7a5c",
                          fontWeight: 600,
                          textDecoration: "none",
                        }}
                      >
                        View →
                      </a>
                    </td>
                  </tr>
                ))}
                {data.stripe.subscriptions.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        padding: "40px 16px",
                        textAlign: "center",
                        color: "#aaa",
                      }}
                    >
                      No subscriptions yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : tab === "costs" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Variable costs */}
            <div
              style={{
                background: "#fff",
                border: "1px solid #e8e2d9",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid #e8e2d9",
                  display: "flex",
                  alignItems: "baseline",
                  gap: 12,
                }}
              >
                <span
                  style={{ fontWeight: 700, fontSize: 14, color: "#1a1a1a" }}
                >
                  Variable — per site generated
                </span>
                <span style={{ fontSize: 12, color: "#888" }}>
                  measured via count_tokens API · April 2026
                </span>
              </div>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#faf7f2",
                      borderBottom: "1px solid #e8e2d9",
                    }}
                  >
                    {[
                      "Tool",
                      "What it does",
                      "Calls/site",
                      "Unit price",
                      "Cost/site",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "10px 16px",
                          textAlign: "left",
                          fontWeight: 600,
                          fontSize: 11,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          color: "#888",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      tool: "Claude Haiku 4.5",
                      what: "Image classify, text extract, color, vibe, reviews, demographics, market, audit",
                      calls: "8 calls",
                      unit: "$1/M in · $5/M out",
                      cost: "$0.0197",
                      highlight: false,
                    },
                    {
                      tool: "Claude Sonnet 4.6",
                      what: "Generate full HTML site",
                      calls: "1 call",
                      unit: "$3/M in · $15/M out",
                      cost: "$0.2705",
                      highlight: true,
                    },
                    {
                      tool: "Firecrawl",
                      what: "Scrape homepage + 6 subpages",
                      calls: "~7 pages",
                      unit: "$0.00083/page",
                      cost: "$0.0058",
                      highlight: false,
                    },
                    {
                      tool: "Exa AI",
                      what: "Research, reviews, demographics, competitors",
                      calls: "4 searches",
                      unit: "$7/1K queries",
                      cost: "$0.0280",
                      highlight: false,
                    },
                    {
                      tool: "Apify",
                      what: "Screenshot of homepage",
                      calls: "1 run",
                      unit: "~$0.01/run",
                      cost: "$0.0100",
                      highlight: false,
                    },
                    {
                      tool: "Stripe",
                      what: "Process payment",
                      calls: "per conversion",
                      unit: "2.9% + $0.30",
                      cost: "per txn only",
                      highlight: false,
                    },
                  ].map((row, i) => (
                    <tr
                      key={row.tool}
                      style={{
                        borderBottom: "1px solid #f0ece6",
                        background: row.highlight
                          ? "#f0f7f0"
                          : i % 2 === 0
                            ? "#fff"
                            : "#fdfcfa",
                      }}
                    >
                      <td
                        style={{
                          padding: "11px 16px",
                          fontWeight: 600,
                          color: "#1a1a1a",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row.tool}
                      </td>
                      <td style={{ padding: "11px 16px", color: "#555" }}>
                        {row.what}
                      </td>
                      <td
                        style={{
                          padding: "11px 16px",
                          color: "#888",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row.calls}
                      </td>
                      <td
                        style={{
                          padding: "11px 16px",
                          color: "#888",
                          whiteSpace: "nowrap",
                          fontFamily: "monospace",
                        }}
                      >
                        {row.unit}
                      </td>
                      <td
                        style={{
                          padding: "11px 16px",
                          fontWeight: 700,
                          color: "#1a1a1a",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row.cost}
                      </td>
                    </tr>
                  ))}
                  <tr
                    style={{
                      background: "#faf7f2",
                      borderTop: "2px solid #e8e2d9",
                    }}
                  >
                    <td
                      colSpan={4}
                      style={{
                        padding: "11px 16px",
                        fontWeight: 700,
                        color: "#1a1a1a",
                      }}
                    >
                      Variable total
                    </td>
                    <td
                      style={{
                        padding: "11px 16px",
                        fontWeight: 700,
                        color: "#1a1a1a",
                      }}
                    >
                      $0.334/site
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Flat infra */}
            <div
              style={{
                background: "#fff",
                border: "1px solid #e8e2d9",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid #e8e2d9",
                }}
              >
                <span
                  style={{ fontWeight: 700, fontSize: 14, color: "#1a1a1a" }}
                >
                  Flat monthly infra
                </span>
              </div>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#faf7f2",
                      borderBottom: "1px solid #e8e2d9",
                    }}
                  >
                    {["Tool", "What it does", "Plan", "Cost/mo"].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "10px 16px",
                          textAlign: "left",
                          fontWeight: 600,
                          fontSize: 11,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          color: "#888",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      tool: "Railway",
                      what: "Hosts the pipeline server",
                      plan: "Hobby",
                      cost: "$5–10/mo",
                    },
                    {
                      tool: "Supabase",
                      what: "Database, leads, site cache",
                      plan: "Free (until ~50K sites)",
                      cost: "$0",
                    },
                    {
                      tool: "Cloudflare Pages",
                      what: "Deploys generated HTML sites",
                      plan: "Free (500 builds/mo)",
                      cost: "$0",
                    },
                    {
                      tool: "Resend",
                      what: "Post-purchase welcome email",
                      plan: "Free (3K/mo)",
                      cost: "$0",
                    },
                    {
                      tool: "Sending Infra (cold outreach)",
                      what: "12 domains · 116 mailboxes · 34K/day capacity · Medium tier · 70% Microsoft / 30% Google",
                      plan: "Microsoft 365 (4d/100mb) + Google Workspace (8d/16mb)",
                      cost: "$256/mo",
                    },
                  ].map((row, i) => (
                    <tr
                      key={row.tool}
                      style={{
                        borderBottom: "1px solid #f0ece6",
                        background: i % 2 === 0 ? "#fff" : "#fdfcfa",
                      }}
                    >
                      <td
                        style={{
                          padding: "11px 16px",
                          fontWeight: 600,
                          color: "#1a1a1a",
                        }}
                      >
                        {row.tool}
                      </td>
                      <td style={{ padding: "11px 16px", color: "#555" }}>
                        {row.what}
                      </td>
                      <td style={{ padding: "11px 16px", color: "#888" }}>
                        {row.plan}
                      </td>
                      <td
                        style={{
                          padding: "11px 16px",
                          fontWeight: 700,
                          color: "#1a1a1a",
                        }}
                      >
                        {row.cost}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Sending infra breakdown */}
            <div
              style={{
                background: "#fff",
                border: "1px solid #e8e2d9",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid #e8e2d9",
                  display: "flex",
                  alignItems: "baseline",
                  gap: 12,
                }}
              >
                <span
                  style={{ fontWeight: 700, fontSize: 14, color: "#1a1a1a" }}
                >
                  Sending infrastructure breakdown
                </span>
                <span style={{ fontSize: 12, color: "#888" }}>
                  cold outreach · 1,000/day · Medium tier
                </span>
              </div>
              {/* Stats row */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  borderBottom: "1px solid #e8e2d9",
                }}
              >
                {[
                  { label: "Domains", value: "12" },
                  { label: "Mailboxes", value: "116" },
                  { label: "Daily capacity", value: "34K" },
                ].map((s) => (
                  <div
                    key={s.label}
                    style={{
                      padding: "16px 20px",
                      borderRight: "1px solid #e8e2d9",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: 700,
                        color: "#1a1a1a",
                      }}
                    >
                      {s.value}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "#888",
                        marginTop: 4,
                      }}
                    >
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
              {/* Provider breakdown */}
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                }}
              >
                <tbody>
                  {[
                    {
                      provider: "Microsoft 365",
                      detail: "4 domains · 100 mailboxes · 70% of volume",
                      cost: "$200/mo",
                      share: 70,
                      color: "#0078d4",
                    },
                    {
                      provider: "Google Workspace",
                      detail: "8 domains · 16 mailboxes · 30% of volume",
                      cost: "$56/mo",
                      share: 30,
                      color: "#ea4335",
                    },
                  ].map((row, i) => (
                    <tr
                      key={row.provider}
                      style={{
                        borderBottom: "1px solid #f0ece6",
                        background: i % 2 === 0 ? "#fff" : "#fdfcfa",
                      }}
                    >
                      <td
                        style={{
                          padding: "13px 16px",
                          fontWeight: 600,
                          color: "#1a1a1a",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <span
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              background: row.color,
                              display: "inline-block",
                              flexShrink: 0,
                            }}
                          />
                          {row.provider}
                        </div>
                      </td>
                      <td style={{ padding: "13px 16px", color: "#555" }}>
                        {row.detail}
                      </td>
                      <td style={{ padding: "13px 16px", width: 120 }}>
                        <div
                          style={{
                            background: "#f0f0f0",
                            borderRadius: 4,
                            height: 6,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              background: row.color,
                              width: `${row.share}%`,
                              height: "100%",
                            }}
                          />
                        </div>
                        <div
                          style={{ fontSize: 11, color: "#888", marginTop: 3 }}
                        >
                          {row.share}%
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "13px 20px",
                          fontWeight: 700,
                          color: "#1a1a1a",
                          textAlign: "right",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row.cost}
                      </td>
                    </tr>
                  ))}
                  <tr
                    style={{
                      background: "#faf7f2",
                      borderTop: "2px solid #e8e2d9",
                    }}
                  >
                    <td
                      colSpan={3}
                      style={{
                        padding: "11px 16px",
                        fontWeight: 700,
                        color: "#1a1a1a",
                      }}
                    >
                      Total sending infra
                    </td>
                    <td
                      style={{
                        padding: "11px 20px",
                        fontWeight: 700,
                        color: "#1a1a1a",
                        textAlign: "right",
                      }}
                    >
                      $256/mo
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div
              style={{
                background: "#fff",
                border: "1px solid #e8e2d9",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid #e8e2d9",
                }}
              >
                <span
                  style={{ fontWeight: 700, fontSize: 14, color: "#1a1a1a" }}
                >
                  Total cost per site
                </span>
              </div>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#faf7f2",
                      borderBottom: "1px solid #e8e2d9",
                    }}
                  >
                    {[
                      "Volume",
                      "Variable",
                      "Infra (amortized)",
                      "Total/site",
                      "Monthly bill",
                      "Gross margin @ $20/mo",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "10px 16px",
                          textAlign: "left",
                          fontWeight: 600,
                          fontSize: 11,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          color: "#888",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      vol: "10/mo",
                      variable: "$0.334",
                      infra: "$0.50",
                      total: "$0.834",
                      monthly: "$8",
                      margin: "95.8%",
                    },
                    {
                      vol: "100/mo",
                      variable: "$0.334",
                      infra: "$0.05",
                      total: "$0.384",
                      monthly: "$38",
                      margin: "98.1%",
                    },
                    {
                      vol: "500/mo",
                      variable: "$0.334",
                      infra: "$0.01",
                      total: "$0.344",
                      monthly: "$172",
                      margin: "98.3%",
                    },
                  ].map((row, i) => (
                    <tr
                      key={row.vol}
                      style={{
                        borderBottom: "1px solid #f0ece6",
                        background: i % 2 === 0 ? "#fff" : "#fdfcfa",
                      }}
                    >
                      <td
                        style={{
                          padding: "11px 16px",
                          fontWeight: 600,
                          color: "#1a1a1a",
                        }}
                      >
                        {row.vol}
                      </td>
                      <td style={{ padding: "11px 16px", color: "#555" }}>
                        {row.variable}
                      </td>
                      <td style={{ padding: "11px 16px", color: "#555" }}>
                        {row.infra}
                      </td>
                      <td
                        style={{
                          padding: "11px 16px",
                          fontWeight: 700,
                          color: "#1a1a1a",
                        }}
                      >
                        {row.total}
                      </td>
                      <td style={{ padding: "11px 16px", color: "#555" }}>
                        {row.monthly}
                      </td>
                      <td
                        style={{
                          padding: "11px 16px",
                          fontWeight: 700,
                          color: "#2d6a4f",
                        }}
                      >
                        {row.margin}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Key insight */}
            <div
              style={{
                background: "#fffbf0",
                border: "1px solid #e8d9a0",
                borderRadius: 12,
                padding: "16px 20px",
                fontSize: 13,
                color: "#7a5c00",
              }}
            >
              <strong>Key insight:</strong> Sonnet 4.6 output = $0.24 of every
              $0.334 variable cost (72%). Haiku&apos;s 8 calls combined cost
              $0.02 — rounding error. Token counts measured via Anthropic
              count_tokens API on real Advanced Dental Hoboken data (10,180
              input / 16,000 output tokens for Sonnet call).
            </div>
          </div>
        ) : null}
      </div>

      {/* Reply modal */}
      {modal && (
        <div
          onClick={() => setModal(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 16,
              width: "100%",
              maxWidth: 720,
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Modal header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #e8e2d9",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 15, color: "#1a1a1a" }}>
                {modal === "replies" ? "All Replies" : "Positive Replies"}
              </div>
              <button
                onClick={() => setModal(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 20,
                  cursor: "pointer",
                  color: "#888",
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            {/* Modal body */}
            <div style={{ overflowY: "auto", flex: 1 }}>
              {replyLoading ? (
                <div
                  style={{ padding: 40, textAlign: "center", color: "#888" }}
                >
                  Loading…
                </div>
              ) : !replyDetails || replyDetails.length === 0 ? (
                <div
                  style={{ padding: 40, textAlign: "center", color: "#888" }}
                >
                  No replies found.
                </div>
              ) : (
                replyDetails
                  .filter((r) => (modal === "replies" ? true : r.is_positive))
                  .map((r, i) => (
                    <div
                      key={r.email}
                      style={{
                        padding: "16px 24px",
                        borderBottom: "1px solid #f0ece6",
                        background: i % 2 === 0 ? "#fff" : "#fdfcfa",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 6,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: 13,
                              color: "#1a1a1a",
                            }}
                          >
                            {r.email}
                          </span>
                          {r.is_positive && (
                            <span
                              style={{
                                background: "#e8f5ee",
                                color: "#2d6a4f",
                                fontSize: 10,
                                fontWeight: 700,
                                padding: "2px 8px",
                                borderRadius: 20,
                                letterSpacing: "0.06em",
                                textTransform: "uppercase",
                              }}
                            >
                              positive
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: 11, color: "#aaa" }}>
                          {r.timestamp
                            ? new Date(r.timestamp).toLocaleDateString(
                                "en-US",
                                { month: "short", day: "numeric" },
                              )
                            : ""}
                        </span>
                      </div>
                      {r.subject && (
                        <div
                          style={{
                            fontSize: 12,
                            color: "#555",
                            marginBottom: 4,
                          }}
                        >
                          {r.subject}
                        </div>
                      )}
                      {r.preview && (
                        <div
                          style={{
                            fontSize: 12,
                            color: "#888",
                            marginBottom: 8,
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {r.preview.slice(0, 200)}
                          {r.preview.length > 200 ? "…" : ""}
                        </div>
                      )}
                      <div style={{ display: "flex", gap: 12 }}>
                        {r.old_site && (
                          <a
                            href={`https://${r.old_site.replace(/^https?:\/\//, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: 12,
                              color: "#888",
                              textDecoration: "none",
                              border: "1px solid #e8e2d9",
                              borderRadius: 6,
                              padding: "3px 10px",
                            }}
                          >
                            Old site →
                          </a>
                        )}
                        {r.new_site && (
                          <a
                            href={r.new_site}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: 12,
                              color: "#2d6a4f",
                              fontWeight: 600,
                              textDecoration: "none",
                              border: "1px solid #b7d9c8",
                              borderRadius: 6,
                              padding: "3px 10px",
                            }}
                          >
                            New site →
                          </a>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
