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
  // stripe statuses
  active: "#2d6a4f",
  canceled: "#888",
  past_due: "#c0392b",
};

function fmt(ts: string | number) {
  const d = typeof ts === "number" ? new Date(ts * 1000) : new Date(ts);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function Dashboard() {
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [tab, setTab] = useState<"leads" | "stripe" | "costs">("leads");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/dashboard", { cache: "no-store" });
      const d = await r.json();
      setData(d);
      setLastRefresh(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

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
                {data.leads.map((lead, i) => (
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
                        href={`https://${lead.url?.replace(/^https?:\/\//, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#1a1a1a", textDecoration: "none" }}
                      >
                        {lead.url?.replace(/^https?:\/\//, "")}
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
                        {lead.status || "—"}
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
    </div>
  );
}
