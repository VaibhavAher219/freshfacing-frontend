"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [state, setState] = useState<
    "verifying" | "building" | "done" | "error"
  >("verifying");
  const [siteUrl, setSiteUrl] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pollJob = useCallback((id: string) => {
    setState("building");
    const poll = setInterval(async () => {
      try {
        const res = await fetch("/api/jobs/" + id);
        const job = await res.json();
        if (job.status === "done" && job.public_url) {
          clearInterval(poll);
          setSiteUrl(job.public_url);
          setState("done");
        } else if (job.status === "failed") {
          clearInterval(poll);
          setError(job.error || "Something went wrong");
          setState("error");
        }
      } catch {}
    }, 5000);
  }, []);

  useEffect(() => {
    if (!sessionId) {
      setError("No session ID found");
      setState("error");
      return;
    }

    fetch("/api/checkout/verify?session_id=" + sessionId)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          setState("error");
          return;
        }
        setJobId(data.job_id);
        pollJob(data.job_id);
      })
      .catch(() => {
        setError("Failed to verify payment");
        setState("error");
      });
  }, [sessionId, pollJob]);

  return (
    <div
      style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        background: "#faf7f2",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          background: "#fff",
          border: "1px solid #e8e2d9",
          borderRadius: "16px",
          padding: "48px",
          maxWidth: "520px",
          width: "100%",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "2.5rem", marginBottom: "16px" }}>
          {state === "verifying" && "⏳"}
          {state === "building" && "🔨"}
          {state === "done" && "✅"}
          {state === "error" && "❌"}
        </div>

        <h1
          style={{
            fontFamily: "'Newsreader', Georgia, serif",
            fontSize: "1.75rem",
            color: "#1a1a1a",
            marginBottom: "12px",
          }}
        >
          {state === "verifying" && "Confirming payment…"}
          {state === "building" && "Building your site…"}
          {state === "done" && "Your site is ready."}
          {state === "error" && "Something went wrong"}
        </h1>

        <p
          style={{
            color: "#6b7c6b",
            fontSize: "15px",
            lineHeight: "1.6",
            marginBottom: "24px",
          }}
        >
          {state === "verifying" && "Verifying your payment with Stripe."}
          {state === "building" &&
            "This usually takes 2–3 minutes. Hang tight — we're scraping, analyzing, and generating your premium site."}
          {state === "done" &&
            "Your new website has been generated and deployed. Click below to view it."}
          {state === "error" && (error || "Our team has been notified.")}
        </p>

        {state === "building" && (
          <div
            style={{
              display: "flex",
              gap: "6px",
              justifyContent: "center",
              marginBottom: "24px",
            }}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#5c7a5c",
                  animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
        )}

        {state === "done" && siteUrl && (
          <a
            href={siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              background: "#5c7a5c",
              color: "#fff",
              padding: "14px 32px",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "15px",
            }}
          >
            View My New Site →
          </a>
        )}

        {state === "error" && (
          <a
            href="/"
            style={{
              display: "inline-block",
              background: "#5c7a5c",
              color: "#fff",
              padding: "14px 32px",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "15px",
            }}
          >
            Go Back Home
          </a>
        )}

        <p style={{ marginTop: "24px", fontSize: "12px", color: "#aaa" }}>
          {jobId && `Job ID: ${jobId}`}
        </p>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
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
