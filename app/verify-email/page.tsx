"use client";

import { useState } from "react";
import { verifyEmail, sendVerifyCode } from "@/lib/auth-api";
import { ApiError } from "@/lib/api-client";
import Link from "next/link";

export default function VerifyEmailPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code" | "done">("email");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      await sendVerifyCode(email);
      setStep("code");
    } catch (err) {
      if (err instanceof ApiError) setError(`[${err.status}] ${err.message}`);
      else setError("Failed to send code.");
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await verifyEmail(email, code);
      setStep("done");
    } catch (err) {
      if (err instanceof ApiError) setError(`[${err.status}] ${err.message}`);
      else setError("Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={s.main}>
      <div style={s.card}>
        <div style={s.icon}>✉️</div>
        <h1 style={s.title}>Verify your email</h1>

        {step === "done" ? (
          <div style={{ textAlign: "center" }}>
            <div className="alert alert-success" style={{ marginBottom: 20 }}>
              🎉 Your email has been verified!
            </div>
            <Link href="/login" className="btn btn-primary">Go to Login</Link>
          </div>
        ) : step === "email" ? (
          <form onSubmit={handleSend} style={s.form}>
            <p style={s.sub}>Enter the email address associated with your account.</p>
            <div className="field">
              <label htmlFor="ve-email">Email address</label>
              <input
                id="ve-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input"
              />
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <button type="submit" disabled={sending} className="btn btn-primary">
              {sending ? "Sending code…" : "Send verification code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} style={s.form}>
            <p style={s.sub}>
              A 6-digit code was sent to <strong style={{ color: "#a5b4fc" }}>{email}</strong>.
              Enter it below.
            </p>
            <div className="field">
              <label htmlFor="ve-code">Verification code</label>
              <input
                id="ve-code"
                type="text"
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                className="input"
                autoComplete="one-time-code"
                style={{ textAlign: "center", letterSpacing: "0.3em", fontSize: 18 }}
              />
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? "Verifying…" : "Verify email"}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => { setStep("email"); setError(null); setCode(""); }}
            >
              ← Change email
            </button>
          </form>
        )}

        <p style={s.link}>
          Already verified?{" "}
          <Link href="/login" style={{ color: "#a5b4fc", textDecoration: "none" }}>Sign in</Link>
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
  title: { margin: "0 0 20px", fontSize: 22, fontWeight: 700, color: "#fff", textAlign: "center" },
  sub: { fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 16, lineHeight: 1.6 },
  form: { display: "flex", flexDirection: "column", gap: 14 },
  link: { marginTop: 24, fontSize: 13, color: "rgba(255,255,255,0.4)", textAlign: "center" },
};
