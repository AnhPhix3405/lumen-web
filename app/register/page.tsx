"use client";

import { useState } from "react";
import { register, verifyEmail } from "@/lib/auth-api";
import { ApiError } from "@/lib/api-client";
import Link from "next/link";

type Step = "form" | "verify" | "done";

export default function RegisterPage() {
  const [step, setStep] = useState<Step>("form");

  // Step 1 — register form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Step 2 — verify email
  const [code, setCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // --- Step 1: Register ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await register(email, password);
      setSuccessMsg(res.message);
      setStep("verify");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`[${err.status}] ${err.message}`);
      } else {
        setError("Unexpected error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Step 2: Verify email ---
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await verifyEmail(email, code);
      setSuccessMsg(res.message);
      setStep("done");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`[${err.status}] ${err.message}`);
      } else {
        setError("Unexpected error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Done view ---
  if (step === "done") {
    return (
      <main style={styles.main}>
        <section style={styles.card}>
          <h1 style={styles.title}>✅ Account verified!</h1>
          <p style={{ fontSize: 14, color: "#333" }}>{successMsg}</p>
          <p style={{ fontSize: 14, marginTop: 8 }}>
            Email: <strong>{email}</strong>
          </p>
          <Link href="/login" style={styles.buttonLink}>
            Go to Login
          </Link>
        </section>
      </main>
    );
  }

  // --- Verify email form ---
  if (step === "verify") {
    return (
      <main style={styles.main}>
        <section style={styles.card}>
          <h1 style={styles.title}>Verify your email</h1>
          {successMsg && <p style={styles.success}>{successMsg}</p>}
          <p style={{ fontSize: 13, color: "#555", marginBottom: 16 }}>
            A 6-digit code was sent to <strong>{email}</strong>. Enter it below.
          </p>

          <form onSubmit={handleVerify} style={styles.form}>
            <label style={styles.label} htmlFor="code">
              Verification code
            </label>
            <input
              id="code"
              type="text"
              required
              maxLength={6}
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={styles.input}
              autoComplete="one-time-code"
            />

            {error && <p style={styles.error}>{error}</p>}

            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? "Verifying…" : "Verify email"}
            </button>
          </form>

          <button
            style={styles.ghost}
            onClick={() => { setStep("form"); setError(null); }}
          >
            ← Back
          </button>
        </section>
      </main>
    );
  }

  // --- Register form ---
  return (
    <main style={styles.main}>
      <section style={styles.card}>
        <h1 style={styles.title}>Create an account</h1>

        <form onSubmit={handleRegister} style={styles.form}>
          <label style={styles.label} htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            autoComplete="email"
          />

          <label style={styles.label} htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            autoComplete="new-password"
          />

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Creating account…" : "Register"}
          </button>
        </form>

        <p style={styles.link}>
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </section>
    </main>
  );
}

// --- Inline styles ---
const styles: Record<string, React.CSSProperties> = {
  main: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "60px 16px",
    minHeight: "100vh",
    fontFamily: "system-ui, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: 32,
  },
  title: {
    margin: "0 0 24px",
    fontSize: 22,
    fontWeight: 600,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: 500,
  },
  input: {
    padding: "8px 10px",
    border: "1px solid #ccc",
    borderRadius: 4,
    fontSize: 14,
  },
  button: {
    marginTop: 8,
    padding: "10px 16px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    borderRadius: 4,
    border: "1px solid #333",
    background: "#333",
    color: "#fff",
  },
  buttonLink: {
    display: "inline-block",
    marginTop: 16,
    padding: "10px 16px",
    fontSize: 14,
    fontWeight: 600,
    textDecoration: "none",
    borderRadius: 4,
    border: "1px solid #333",
    background: "#333",
    color: "#fff",
  },
  ghost: {
    marginTop: 12,
    padding: "8px 0",
    fontSize: 13,
    cursor: "pointer",
    background: "none",
    border: "none",
    color: "#555",
    textDecoration: "underline",
  },
  error: {
    color: "#c0392b",
    fontSize: 13,
    margin: "4px 0",
  },
  success: {
    color: "#27ae60",
    fontSize: 13,
    marginBottom: 8,
  },
  link: {
    marginTop: 20,
    fontSize: 13,
    color: "#555",
  },
};
