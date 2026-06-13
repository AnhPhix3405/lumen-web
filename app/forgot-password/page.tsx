"use client";

import { useState } from "react";
import { sendVerifyCode } from "@/lib/auth-api";
import { ApiError } from "@/lib/api-client";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await sendVerifyCode(email);
      setSent(true);
    } catch (err) {
      if (err instanceof ApiError) setError(`[${err.status}] ${err.message}`);
      else setError("Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={s.main}>
      <div style={s.card}>
        <div style={s.icon}>🔑</div>
        <h1 style={s.title}>Reset your password</h1>
        <p style={s.sub}>
          Enter your email and we&apos;ll send you a verification code to reset your password.
        </p>

        {sent ? (
          <div className="alert alert-success" style={{ marginBottom: 16 }}>
            ✅ A verification code has been sent to <strong>{email}</strong>. Check your inbox.
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={s.form}>
            <div className="field">
              <label htmlFor="fp-email">Email address</label>
              <input
                id="fp-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input"
              />
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: 8 }}>
              {loading ? "Sending…" : "Send reset code"}
            </button>
          </form>
        )}

        <p style={s.link}>
          Remember your password?{" "}
          <Link href="/login" style={s.linkAnchor}>Back to login</Link>
        </p>
      </div>
    </main>
  );
}

const s: Record<string, React.CSSProperties> = {
  main: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    padding: "24px 16px",
    background: "var(--bg)",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 20,
    padding: "40px 36px",
  },
  icon: { fontSize: 36, marginBottom: 16, textAlign: "center" },
  title: { margin: "0 0 8px", fontSize: 22, fontWeight: 700, color: "#fff", textAlign: "center" },
  sub: { fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 24, textAlign: "center", lineHeight: 1.6 },
  form: { display: "flex", flexDirection: "column", gap: 14 },
  link: { marginTop: 24, fontSize: 13, color: "rgba(255,255,255,0.4)", textAlign: "center" },
  linkAnchor: { color: "#a5b4fc", textDecoration: "none" },
};
