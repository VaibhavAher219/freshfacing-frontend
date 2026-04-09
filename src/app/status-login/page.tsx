"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function LoginForm() {
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/status-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    if (res.ok) {
      window.location.href = searchParams.get("next") || "/status.html";
    } else {
      setError("Wrong password.");
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f7f7f7",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e5e5",
          borderRadius: 12,
          padding: "40px 36px",
          width: 360,
          boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 6 }}>
          Fresh<span style={{ color: "#22c55e" }}>Facing</span>
        </div>
        <div style={{ fontSize: 13, color: "#888", marginBottom: 28 }}>
          Status page — restricted access
        </div>
        <form onSubmit={submit}>
          <input
            type="password"
            placeholder="Password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px",
              border: "1px solid #e5e5e5",
              borderRadius: 6,
              fontSize: 14,
              outline: "none",
              boxSizing: "border-box",
              marginBottom: 12,
            }}
            autoFocus
          />
          {error && (
            <div style={{ color: "#ef4444", fontSize: 12, marginBottom: 10 }}>
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "10px 0",
              background: "#111",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {loading ? "Checking..." : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function StatusLogin() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
