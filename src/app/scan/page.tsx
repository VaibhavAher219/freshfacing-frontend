"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";

// ─── types ───────────────────────────────────────────────────────────────────
type AuditItem = {
  passed: boolean;
  severity: "fail" | "warn";
  pass_text: string;
  fail_text: string;
  statText: string;
};

type Step = "url" | "scanning" | "results" | "generating" | "done" | "error";

// ─── helpers ─────────────────────────────────────────────────────────────────
function buildFullUrl(raw: string) {
  const u = raw.trim();
  return u.startsWith("http") ? u : "https://" + u;
}

function cleanDomain(raw: string) {
  try {
    return new URL(buildFullUrl(raw)).hostname.replace("www.", "");
  } catch {
    return raw.trim();
  }
}

function parsePageSpeed(
  data: Record<string, unknown>,
  url: string,
): AuditItem[] {
  const lhr = (data.lighthouseResult as Record<string, unknown>) || {};
  const cats = (lhr.categories as Record<string, { score: number }>) || {};
  const audits =
    (lhr.audits as Record<string, { score: number; numericValue?: number }>) ||
    {};

  const viewport = audits["viewport"]?.score === 1;
  const fontSizes = audits["font-size"]?.score !== 0;
  const fcp = audits["first-contentful-paint"]?.numericValue ?? 0;
  const speedSec = (fcp / 1000).toFixed(1);
  const seoScore = cats.seo ? Math.round(cats.seo.score * 100) : 0;
  const isHttps = audits["is-on-https"]?.score === 1 || url.startsWith("https");
  const isCrawlable = audits["is-crawlable"]?.score !== 0;
  const robotsTxt = audits["robots-txt"]?.score === 1;
  const structuredData = audits["structured-data-item"]?.score === 1;
  const linkAudit = audits["link-text"]?.score !== 0;
  const tapTargets = audits["tap-targets"]?.score !== 0;
  const images =
    audits["uses-optimized-images"]?.score !== 0 ||
    audits["offscreen-images"]?.score !== 0;

  return [
    {
      passed: viewport && fontSizes,
      severity: "fail",
      pass_text: "Renders correctly on mobile",
      fail_text: "Broken or hard to use on smartphones",
      statText:
        viewport && fontSizes ? "Looks good" : "63% of visits are mobile",
    },
    {
      passed: fcp < 3000,
      severity: "fail",
      pass_text: `Loads in ${speedSec}s`,
      fail_text: `Takes ${speedSec}s to load — visitors leave after 3`,
      statText: speedSec + "s",
    },
    {
      passed: isHttps,
      severity: "warn",
      pass_text: "SSL certificate active",
      fail_text: 'No SSL — browsers warn visitors it\'s "not secure"',
      statText: isHttps ? "Active" : "Missing",
    },
    {
      passed: (isCrawlable && robotsTxt) || seoScore >= 70,
      severity: "fail",
      pass_text: "Indexable by Google",
      fail_text: "Google may not be able to find your pages",
      statText: seoScore ? `SEO: ${seoScore}/100` : "Needs work",
    },
    {
      passed: structuredData,
      severity: "warn",
      pass_text: "Structured data for AI search",
      fail_text: "ChatGPT & Perplexity can't recommend your business",
      statText: structuredData ? "Structured" : "Not structured",
    },
    {
      passed: linkAudit,
      severity: "fail",
      pass_text: "Links properly configured",
      fail_text: "Misconfigured links — visitors hit dead ends",
      statText: linkAudit ? "Good" : "Issues found",
    },
    {
      passed: tapTargets,
      severity: "warn",
      pass_text: "Mobile tap targets sized correctly",
      fail_text: "Buttons too small to tap on mobile",
      statText: tapTargets ? "Good" : "Too small",
    },
    {
      passed: images,
      severity: "warn",
      pass_text: "Images optimized",
      fail_text: "Unoptimized images slow your site",
      statText: images ? "Optimized" : "Needs work",
    },
  ];
}

function fallbackResults(url: string): AuditItem[] {
  const isHttps = url.startsWith("https");
  return [
    {
      passed: false,
      severity: "warn",
      pass_text: "",
      fail_text: "Could not fully test mobile compatibility",
      statText: "Pending",
    },
    {
      passed: false,
      severity: "warn",
      pass_text: "",
      fail_text: "Could not measure page speed remotely",
      statText: "Pending",
    },
    {
      passed: isHttps,
      severity: "warn",
      pass_text: "URL uses HTTPS",
      fail_text: "No HTTPS — visitors see a security warning",
      statText: isHttps ? "Active" : "Missing",
    },
    {
      passed: false,
      severity: "warn",
      pass_text: "",
      fail_text: "Google indexing status unknown",
      statText: "Pending",
    },
    {
      passed: false,
      severity: "warn",
      pass_text: "",
      fail_text: "AI search visibility needs review",
      statText: "Pending",
    },
    {
      passed: true,
      severity: "warn",
      pass_text: "Full link check pending",
      fail_text: "",
      statText: "Pending",
    },
    {
      passed: false,
      severity: "warn",
      pass_text: "",
      fail_text: "Tap target sizing needs device test",
      statText: "Pending",
    },
    {
      passed: false,
      severity: "warn",
      pass_text: "",
      fail_text: "Image optimization check pending",
      statText: "Pending",
    },
  ];
}

// ─── inner component (needs useSearchParams) ─────────────────────────────────
function ScanFlow() {
  const params = useSearchParams();
  const [step, setStep] = useState<Step>("url");
  const [urlInput, setUrlInput] = useState(params.get("url") || "");
  const [domain, setDomain] = useState("");
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<AuditItem[]>([]);
  const [scanMsg, setScanMsg] = useState("Connecting to site...");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [prefilling, setPrefilling] = useState(false);

  async function prefillBusinessName(raw: string) {
    if (!raw.trim() || businessName.trim()) return;
    setPrefilling(true);
    try {
      const res = await fetch(
        `/api/prefill?url=${encodeURIComponent(raw.trim())}`,
      );
      const data = await res.json();
      if (data.name && !businessName.trim()) setBusinessName(data.name);
    } catch {
      /* ignore */
    } finally {
      setPrefilling(false);
    }
  }

  const [jobId, setJobId] = useState("");
  const [publicUrl, setPublicUrl] = useState("");
  const [genStatus, setGenStatus] = useState("We're on it.");

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scanMessages = [
    "Connecting to site...",
    "Checking mobile compatibility...",
    "Testing page load speed...",
    "Looking for SSL certificate...",
    "Checking Google index status...",
    "Scanning for AI search structure...",
    "Checking contact & call buttons...",
    "Reviewing content freshness...",
    "Calculating your score...",
  ];

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  async function runScan() {
    if (!urlInput.trim()) return;
    const full = buildFullUrl(urlInput);
    const d = cleanDomain(urlInput);
    setDomain(d);
    setStep("scanning");

    let i = 0;
    const msgInterval = setInterval(() => {
      if (i < scanMessages.length) setScanMsg(scanMessages[i++]);
    }, 800);

    try {
      const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(full)}&category=PERFORMANCE&category=ACCESSIBILITY&category=BEST_PRACTICES&category=SEO&strategy=MOBILE`;
      const res = await fetch(apiUrl);
      const data = await res.json();
      clearInterval(msgInterval);
      const items = parsePageSpeed(data, full);
      finishScan(items);
    } catch {
      clearInterval(msgInterval);
      finishScan(fallbackResults(full));
    }
  }

  function finishScan(items: AuditItem[]) {
    setResults(items);
    const passed = items.filter((r) => r.passed).length;
    const s = Math.max(5, Math.round((passed / items.length) * 100));
    setScore(s);
    setStep("results");
  }

  async function submitForm() {
    if (!firstName.trim()) return;
    if (!businessName.trim()) return;
    if (!email.includes("@")) return;

    const full = buildFullUrl(urlInput);
    setStep("generating");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: full,
          email,
          first_name: firstName,
          last_name: lastName,
          business_name: businessName,
        }),
      });
      const { job_id } = await res.json();
      if (!job_id) {
        setStep("error");
        return;
      }
      setJobId(job_id);

      pollRef.current = setInterval(async () => {
        try {
          const r = await fetch("/api/jobs/" + job_id);
          const job = await r.json();
          if (job.status === "done" && job.public_url) {
            clearInterval(pollRef.current!);
            setPublicUrl(job.public_url);
            setStep("done");
          } else if (job.status === "failed") {
            clearInterval(pollRef.current!);
            setGenStatus("Something went wrong — please try again.");
            setStep("error");
          }
        } catch {
          /* keep polling */
        }
      }, 5000);
    } catch {
      setStep("error");
    }
  }

  async function claimSite() {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: buildFullUrl(urlInput),
        email,
        job_id: jobId,
        public_url: publicUrl,
      }),
    });
    const { checkout_url } = await res.json();
    if (checkout_url) window.location.href = checkout_url;
  }

  const scoreColor =
    score < 45 ? "#ef4444" : score < 70 ? "#f59e0b" : "#22c55e";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0d0f0d",
        color: "#faf7f2",
        fontFamily: "Inter, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus { outline: 2px solid #5c7a5c; outline-offset: 2px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:.3; transform:scale(.8); } 50% { opacity:1; transform:scale(1); } }
        @keyframes fadein { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .fade-in { animation: fadein 0.4s ease both; }
      `}</style>

      {/* Header */}
      <header
        style={{
          padding: "20px 32px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <a
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <rect width="26" height="26" rx="5" fill="#5c7a5c" />
            <path
              d="M7 8.5h12M7 13h7.5M7 17.5h9.5"
              stroke="#faf7f2"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="20" cy="17.5" r="3" fill="#e8a830" />
          </svg>
          <span
            style={{
              fontFamily: "Syne, sans-serif",
              fontWeight: 800,
              fontSize: "1.1rem",
            }}
          >
            fresh
            <em style={{ color: "#5c7a5c", fontStyle: "italic" }}>facing</em>
          </span>
        </a>
      </header>

      {/* Main */}
      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "48px 20px 80px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 560 }}>
          {/* ── STEP: URL input ── */}
          {step === "url" && (
            <div className="fade-in">
              <div style={{ marginBottom: 32 }}>
                <p
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#5c7a5c",
                    marginBottom: 10,
                  }}
                >
                  Free Site Audit
                </p>
                <h1
                  style={{
                    fontFamily: "Syne, sans-serif",
                    fontWeight: 800,
                    fontSize: "clamp(1.6rem,4vw,2.2rem)",
                    lineHeight: 1.15,
                    marginBottom: 12,
                  }}
                >
                  See exactly what&apos;s wrong
                  <br />
                  with your site
                </h1>
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "rgba(255,255,255,0.45)",
                    lineHeight: 1.6,
                  }}
                >
                  Drop your URL and we&apos;ll run a full audit — mobile, speed,
                  SEO, AI visibility. Then we&apos;ll build you a free preview.
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 0,
                  background: "#1a1c1a",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onBlur={(e) => prefillBusinessName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && runScan()}
                  placeholder="yourbusiness.com"
                  autoFocus
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    padding: "14px 16px",
                    color: "#faf7f2",
                    fontSize: "0.95rem",
                    fontFamily: "inherit",
                    outline: "none",
                  }}
                />
                <button
                  onClick={runScan}
                  style={{
                    background: "#5c7a5c",
                    color: "#fff",
                    border: "none",
                    padding: "14px 22px",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    whiteSpace: "nowrap",
                  }}
                >
                  Scan My Site →
                </button>
              </div>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "rgba(255,255,255,0.3)",
                  marginTop: 10,
                }}
              >
                No sign-up. Results in seconds.
              </p>
            </div>
          )}

          {/* ── STEP: Scanning ── */}
          {step === "scanning" && (
            <div
              className="fade-in"
              style={{ textAlign: "center", padding: "60px 0" }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  border: "3px solid rgba(92,122,92,0.2)",
                  borderTopColor: "#5c7a5c",
                  borderRadius: "50%",
                  animation: "spin 0.9s linear infinite",
                  margin: "0 auto 24px",
                }}
              />
              <p
                style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.45)" }}
              >
                {scanMsg}
              </p>
            </div>
          )}

          {/* ── STEP: Results + form ── */}
          {step === "results" && (
            <div className="fade-in">
              <div
                style={{
                  marginBottom: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "rgba(255,255,255,0.35)",
                      marginBottom: 2,
                    }}
                  >
                    {domain}
                  </p>
                  <p
                    style={{
                      fontFamily: "Syne, sans-serif",
                      fontWeight: 800,
                      fontSize: "1rem",
                    }}
                  >
                    Site Health Report
                  </p>
                </div>
                <div
                  style={{
                    background: scoreColor + "18",
                    border: `1px solid ${scoreColor}44`,
                    color: scoreColor,
                    borderRadius: 6,
                    padding: "4px 12px",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                  }}
                >
                  {score}/100
                </div>
              </div>

              {/* audit items */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  marginBottom: 20,
                }}
              >
                {results.map((r, i) => {
                  const icon = r.passed
                    ? "✅"
                    : r.severity === "fail"
                      ? "❌"
                      : "⚠️";
                  const text = r.passed ? r.pass_text : r.fail_text;
                  const bg = r.passed
                    ? "rgba(92,122,92,0.08)"
                    : r.severity === "fail"
                      ? "rgba(239,68,68,0.07)"
                      : "rgba(245,158,11,0.07)";
                  const border = r.passed
                    ? "rgba(92,122,92,0.2)"
                    : r.severity === "fail"
                      ? "rgba(239,68,68,0.2)"
                      : "rgba(245,158,11,0.2)";
                  return (
                    <div
                      key={i}
                      style={{
                        background: bg,
                        border: `1px solid ${border}`,
                        borderRadius: 6,
                        padding: "10px 14px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <span style={{ fontSize: "0.95rem" }}>{icon}</span>
                        <span
                          style={{
                            fontSize: "0.82rem",
                            color: "rgba(255,255,255,0.75)",
                          }}
                        >
                          {text}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "rgba(255,255,255,0.3)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {r.statText}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* intake form */}
              <div
                style={{
                  background: "#1a1c1a",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10,
                  padding: "20px",
                }}
              >
                <p
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    marginBottom: 4,
                  }}
                >
                  Want us to fix all of this?
                </p>
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: "rgba(255,255,255,0.4)",
                    marginBottom: 14,
                  }}
                >
                  We&apos;ll build you a free preview — no credit card, no
                  commitment.
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    style={{
                      background: "#111",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 6,
                      padding: "10px 12px",
                      color: "#faf7f2",
                      fontSize: "0.83rem",
                      fontFamily: "inherit",
                    }}
                  />
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    style={{
                      background: "#111",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 6,
                      padding: "10px 12px",
                      color: "#faf7f2",
                      fontSize: "0.83rem",
                      fontFamily: "inherit",
                    }}
                  />
                </div>
                <input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder={
                    prefilling ? "Fetching business name…" : "Business name"
                  }
                  style={{
                    width: "100%",
                    background: "#111",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 6,
                    padding: "10px 12px",
                    color: "#faf7f2",
                    fontSize: "0.83rem",
                    fontFamily: "inherit",
                    marginBottom: 8,
                  }}
                />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="your@email.com"
                  style={{
                    width: "100%",
                    background: "#111",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 6,
                    padding: "10px 12px",
                    color: "#faf7f2",
                    fontSize: "0.83rem",
                    fontFamily: "inherit",
                    marginBottom: 12,
                  }}
                />
                <button
                  onClick={submitForm}
                  style={{
                    width: "100%",
                    background: "#5c7a5c",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    padding: "12px",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Get My Free Preview →
                </button>
              </div>

              <div style={{ textAlign: "center", marginTop: 12 }}>
                <button
                  onClick={() => {
                    setStep("url");
                    setUrlInput("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "0.75rem",
                    color: "rgba(255,255,255,0.3)",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Check a different site
                </button>
              </div>
            </div>
          )}

          {/* ── STEP: Generating ── */}
          {step === "generating" && (
            <div
              className="fade-in"
              style={{ textAlign: "center", padding: "60px 0" }}
            >
              <p
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontWeight: 800,
                  fontSize: "1.5rem",
                  marginBottom: 12,
                }}
              >
                We&apos;re on it.
              </p>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "rgba(255,255,255,0.4)",
                  marginBottom: 32,
                }}
              >
                Your preview will appear right here when it&apos;s ready.
              </p>
              <div
                style={{ display: "flex", gap: 8, justifyContent: "center" }}
              >
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: "#5c7a5c",
                      animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── STEP: Done ── */}
          {step === "done" && (
            <div className="fade-in">
              <div style={{ marginBottom: 16 }}>
                <p
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "#5c7a5c",
                    marginBottom: 6,
                  }}
                >
                  Live Preview
                </p>
                <h2
                  style={{
                    fontFamily: "Syne, sans-serif",
                    fontWeight: 800,
                    fontSize: "1.4rem",
                    marginBottom: 4,
                  }}
                >
                  Your new site is ready.
                </h2>
                <p
                  style={{
                    fontSize: "0.82rem",
                    color: "rgba(255,255,255,0.4)",
                  }}
                >
                  Here&apos;s what it looks like. Claim it for $20/mo to keep it
                  live.
                </p>
              </div>

              {/* iframe preview */}
              <div
                style={{
                  border: "2px solid #5c7a5c",
                  borderRadius: 10,
                  overflow: "hidden",
                  marginBottom: 14,
                }}
              >
                <iframe
                  src={publicUrl}
                  style={{
                    width: "100%",
                    height: 480,
                    border: "none",
                    display: "block",
                  }}
                  loading="lazy"
                />
              </div>

              {/* live link */}
              <div
                style={{
                  background: "#1a1c1a",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8,
                  padding: "12px 16px",
                  marginBottom: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <span
                  style={{
                    fontSize: "0.78rem",
                    color: "rgba(255,255,255,0.4)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {publicUrl}
                </span>
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    flexShrink: 0,
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    color: "#5c7a5c",
                    textDecoration: "none",
                    border: "1px solid #5c7a5c",
                    borderRadius: 4,
                    padding: "4px 12px",
                  }}
                >
                  Open →
                </a>
              </div>

              {/* CTA */}
              <button
                onClick={claimSite}
                style={{
                  width: "100%",
                  background: "#5c7a5c",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "14px",
                  fontSize: "1rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Claim This Site — $20/mo →
              </button>
              <p
                style={{
                  fontSize: "0.72rem",
                  color: "rgba(255,255,255,0.25)",
                  textAlign: "center",
                  marginTop: 10,
                }}
              >
                No contracts. Cancel anytime.
              </p>
            </div>
          )}

          {/* ── STEP: Error ── */}
          {step === "error" && (
            <div
              className="fade-in"
              style={{ textAlign: "center", padding: "60px 0" }}
            >
              <p
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontWeight: 800,
                  fontSize: "1.2rem",
                  marginBottom: 10,
                }}
              >
                Something went wrong.
              </p>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "rgba(255,255,255,0.4)",
                  marginBottom: 24,
                }}
              >
                {genStatus}
              </p>
              <button
                onClick={() => setStep("url")}
                style={{
                  background: "#5c7a5c",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "10px 24px",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ─── page export ─────────────────────────────────────────────────────────────
export default function ScanPage() {
  return (
    <Suspense>
      <ScanFlow />
    </Suspense>
  );
}
