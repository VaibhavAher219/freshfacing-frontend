"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const S: Record<string, React.CSSProperties> = {
  page: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    background: "#faf7f2",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
  },
  card: {
    background: "#fff",
    border: "1px solid #e8e2d9",
    borderRadius: "16px",
    padding: "48px",
    maxWidth: "520px",
    width: "100%",
    textAlign: "center",
  },
  h1: {
    fontFamily: "'Newsreader', Georgia, serif",
    fontSize: "1.75rem",
    color: "#1a1a1a",
    marginBottom: "12px",
    fontWeight: 700,
  },
  sub: {
    color: "#6b7c6b",
    fontSize: "15px",
    lineHeight: "1.6",
    marginBottom: "28px",
  },
  btn: {
    display: "inline-block",
    background: "#c9a52a",
    color: "#111",
    padding: "14px 32px",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: 700,
    fontSize: "15px",
    border: "none",
    cursor: "pointer",
    width: "100%",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    border: "1.5px solid #e8e2d9",
    borderRadius: "8px",
    fontSize: "15px",
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
    marginBottom: "12px",
  },
  label: {
    display: "block",
    textAlign: "left",
    fontSize: "12px",
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#888",
    marginBottom: "6px",
  },
  divider: { border: "none", borderTop: "1px solid #eee", margin: "28px 0" },
  siteLink: {
    display: "inline-block",
    color: "#5c7a5c",
    fontWeight: 600,
    fontSize: "14px",
    wordBreak: "break-all",
    marginBottom: "24px",
  },
};

type Stage = "verifying" | "ready" | "domain-form" | "domain-sent" | "error";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [stage, setStage] = useState<Stage>("verifying");
  const [siteUrl, setSiteUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [email, setEmail] = useState("");
  const [domain, setDomain] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sessionId) {
      setError("No session ID");
      setStage("error");
      return;
    }
    fetch("/api/checkout/verify?session_id=" + sessionId)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          setStage("error");
          return;
        }
        setSiteUrl(data.public_url || "");
        setSlug(data.slug || "");
        setEmail(data.email || "");
        setStage("ready");
      })
      .catch(() => {
        setError("Failed to verify payment");
        setStage("error");
      });
  }, [sessionId]);

  async function submitDomain() {
    if (!domain.trim()) return;
    setSubmitting(true);
    try {
      await fetch("/api/claim-domain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, domain: domain.trim(), email }),
      });
      setStage("domain-sent");
    } catch {
      setError("Failed to submit — email us at hello@freshfacing.com");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={S.page}>
      <div style={S.card}>
        {stage === "verifying" && (
          <>
            <div style={{ fontSize: "2rem", marginBottom: "16px" }}>⏳</div>
            <h1 style={S.h1}>Confirming payment…</h1>
            <p style={S.sub}>Just a second.</p>
          </>
        )}

        {stage === "ready" && (
          <>
            <div style={{ fontSize: "2rem", marginBottom: "16px" }}>🎉</div>
            <h1 style={S.h1}>Payment confirmed.</h1>
            <p style={S.sub}>
              Your watermark-free site is live. Check your email for the link.
            </p>
            {siteUrl && (
              <a
                href={siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={S.siteLink}
              >
                {siteUrl}
              </a>
            )}
            <hr style={S.divider} />
            <p style={{ ...S.sub, marginBottom: "20px" }}>
              <strong>Want it on your own domain?</strong>
              <br />
              Enter your domain and we&apos;ll send you the one DNS record to
              add.
            </p>
            <button style={S.btn} onClick={() => setStage("domain-form")}>
              Set up my domain →
            </button>
          </>
        )}

        {stage === "domain-form" && (
          <>
            <div style={{ fontSize: "2rem", marginBottom: "16px" }}>🌐</div>
            <h1 style={S.h1}>Your domain</h1>
            <p style={S.sub}>
              We&apos;ll attach it to your site and email you the DNS record to
              add.
            </p>
            <label style={S.label}>Domain name</label>
            <input
              style={S.input}
              placeholder="yourbusiness.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitDomain()}
            />
            <button
              style={{ ...S.btn, opacity: submitting ? 0.6 : 1 }}
              onClick={submitDomain}
              disabled={submitting}
            >
              {submitting ? "Sending…" : "Send DNS instructions →"}
            </button>
            {error && (
              <p
                style={{
                  color: "#c0392b",
                  fontSize: "13px",
                  marginTop: "12px",
                }}
              >
                {error}
              </p>
            )}
          </>
        )}

        {stage === "domain-sent" && (
          <>
            <div style={{ fontSize: "2rem", marginBottom: "16px" }}>📬</div>
            <h1 style={S.h1}>Check your inbox.</h1>
            <p style={S.sub}>
              DNS instructions sent to <strong>{email}</strong>.<br />
              One CNAME record and your site goes live on{" "}
              <strong>{domain}</strong>.
            </p>
            {siteUrl && (
              <a
                href={siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...S.btn, marginTop: "8px" } as React.CSSProperties}
              >
                View site in the meantime →
              </a>
            )}
          </>
        )}

        {stage === "error" && (
          <>
            <div style={{ fontSize: "2rem", marginBottom: "16px" }}>❌</div>
            <h1 style={S.h1}>Something went wrong</h1>
            <p style={S.sub}>{error || "Our team has been notified."}</p>
            <a href="/" style={S.btn}>
              Go Back
            </a>
          </>
        )}
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            fontFamily: "sans-serif",
            textAlign: "center",
            padding: "80px",
          }}
        >
          Loading…
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
