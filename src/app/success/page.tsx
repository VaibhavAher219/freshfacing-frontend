"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [state, setState] = useState<"verifying" | "done" | "error">(
    "verifying",
  );
  const [siteUrl, setSiteUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        setSiteUrl(data.public_url);
        setState("done");
      })
      .catch(() => {
        setError("Failed to verify payment");
        setState("error");
      });
  }, [sessionId]);

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
        {state === "verifying" && (
          <>
            <div style={{ fontSize: "2rem", marginBottom: "16px" }}>⏳</div>
            <h1
              style={{
                fontFamily: "'Newsreader', Georgia, serif",
                fontSize: "1.75rem",
                color: "#1a1a1a",
                marginBottom: "12px",
              }}
            >
              Confirming payment…
            </h1>
            <p style={{ color: "#6b7c6b", fontSize: "15px" }}>Just a second.</p>
          </>
        )}

        {state === "done" && (
          <>
            <div style={{ fontSize: "2rem", marginBottom: "16px" }}>🎉</div>
            <h1
              style={{
                fontFamily: "'Newsreader', Georgia, serif",
                fontSize: "1.75rem",
                color: "#1a1a1a",
                marginBottom: "12px",
              }}
            >
              Your site is live.
            </h1>
            <p
              style={{
                color: "#6b7c6b",
                fontSize: "15px",
                lineHeight: "1.6",
                marginBottom: "28px",
              }}
            >
              Payment confirmed. Your new website is ready to go.
            </p>
            {siteUrl && (
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
                View My Site →
              </a>
            )}
          </>
        )}

        {state === "error" && (
          <>
            <div style={{ fontSize: "2rem", marginBottom: "16px" }}>❌</div>
            <h1
              style={{
                fontFamily: "'Newsreader', Georgia, serif",
                fontSize: "1.75rem",
                color: "#1a1a1a",
                marginBottom: "12px",
              }}
            >
              Something went wrong
            </h1>
            <p
              style={{
                color: "#6b7c6b",
                fontSize: "15px",
                marginBottom: "28px",
              }}
            >
              {error || "Our team has been notified."}
            </p>
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
