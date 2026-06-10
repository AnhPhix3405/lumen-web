"use client";

import { useState } from "react";
import { login, verifyEmail, sendVerifyCode, LoginResponse } from "@/lib/auth-api";
import { ApiError } from "@/lib/api-client";
import Link from "next/link";

// The exact message the backend sends for unverified accounts
const NOT_VERIFIED_MSG = "Account not verified";

type VerifyStep = "prompt" | "code" | "done";

interface UserInfo {
  accessToken: string;
  email: string;
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);

  // Verification sub-flow
  const [verifyStep, setVerifyStep] = useState<VerifyStep | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifySuccess, setVerifySuccess] = useState<string | null>(null);
  const [sendingCode, setSendingCode] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  // --- Login handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setVerifyStep(null);
    setVerifySuccess(null);

    try {
      const res: LoginResponse = await login(email, password);
      setUser({ accessToken: res.data.accessToken, email });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.message === NOT_VERIFIED_MSG) {
          // Show the "do you want to verify?" prompt
          setVerifyStep("prompt");
        } else {
          setError(`[${err.status}] ${err.message}`);
        }
      } else {
        setError("Unexpected error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Verify email handler ---
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyLoading(true);
    setVerifyError(null);

    try {
      const res = await verifyEmail(email, verifyCode);
      setVerifySuccess(res.message ?? "Account verified! You can now log in.");
      setVerifyStep("done");
      setVerifyCode("");
    } catch (err) {
      if (err instanceof ApiError) {
        setVerifyError(`[${err.status}] ${err.message}`);
      } else {
        setVerifyError("Unexpected error. Please try again.");
      }
    } finally {
      setVerifyLoading(false);
    }
  };

  const dismissVerify = () => {
    setVerifyStep(null);
    setVerifyCode("");
    setVerifyError(null);
    setSendError(null);
  };

  // --- Send verify code then show code input ---
  const handleSendCode = async () => {
    setSendingCode(true);
    setSendError(null);
    try {
      await sendVerifyCode(email);
      setVerifyStep("code");
    } catch (err) {
      if (err instanceof ApiError) {
        setSendError(`[${err.status}] ${err.message}`);
      } else {
        setSendError("Failed to send code. Please try again.");
      }
    } finally {
      setSendingCode(false);
    }
  };

  // ── Logged-in view ──────────────────────────────────────────────────────
  if (user) {
    return (
      <main style={styles.main}>
        <section style={styles.card}>
          <h1 style={styles.title}>✅ Login successful</h1>
          <table style={styles.table}>
            <tbody>
              <tr>
                <td style={styles.label}>Email</td>
                <td style={styles.value}>{user.email}</td>
              </tr>
              <tr>
                <td style={styles.label}>Access Token</td>
                <td style={{ ...styles.value, wordBreak: "break-all" }}>
                  {user.accessToken}
                </td>
              </tr>
            </tbody>
          </table>
          <button
            style={{ ...styles.button, marginTop: 16 }}
            onClick={() => setUser(null)}
          >
            Log out (local)
          </button>
        </section>
      </main>
    );
  }

  // ── Login form ──────────────────────────────────────────────────────────
  return (
    <main style={styles.main}>
      <section style={styles.card}>
        <h1 style={styles.title}>Login</h1>

        {/* ── Verification: "done" banner ── */}
        {verifyStep === "done" && verifySuccess && (
          <div style={styles.successBanner}>
            ✅ {verifySuccess} — please log in now.
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label} htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              // Reset verify flow if user changes their email
              setVerifyStep(null);
            }}
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
            autoComplete="current-password"
          />

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>

        {/* ── Verification: "prompt" banner ── */}
        {verifyStep === "prompt" && (
          <div style={styles.promptBox}>
            <p style={styles.promptText}>
              ⚠️ Account not verified.{" "}
              <strong>Do you want to verify your account?</strong>
            </p>
            {sendError && <p style={styles.error}>{sendError}</p>}
            <div style={styles.promptActions}>
              <button
                style={styles.button}
                disabled={sendingCode}
                onClick={handleSendCode}
              >
                {sendingCode ? "Sending code…" : "Yes, verify now"}
              </button>
              <button style={styles.ghost} onClick={dismissVerify}>
                No, cancel
              </button>
            </div>
          </div>
        )}

        {/* ── Verification: code input ── */}
        {verifyStep === "code" && (
          <div style={styles.promptBox}>
            <p style={styles.promptText}>
              Enter the 6-digit code sent to <strong>{email}</strong>:
            </p>
            <form onSubmit={handleVerify} style={{ ...styles.form, marginTop: 8 }}>
              <input
                id="verify-code"
                type="text"
                required
                maxLength={6}
                placeholder="123456"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                style={styles.input}
                autoComplete="one-time-code"
              />
              {verifyError && <p style={styles.error}>{verifyError}</p>}
              <div style={styles.promptActions}>
                <button
                  type="submit"
                  disabled={verifyLoading}
                  style={styles.button}
                >
                  {verifyLoading ? "Verifying…" : "Verify email"}
                </button>
                <button
                  type="button"
                  style={styles.ghost}
                  onClick={dismissVerify}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <p style={styles.link}>
          Don&apos;t have an account?{" "}
          <Link href="/register">Register here</Link>
        </p>
      </section>
    </main>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────
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
    paddingRight: 12,
    verticalAlign: "top",
  },
  input: {
    padding: "8px 10px",
    border: "1px solid #ccc",
    borderRadius: 4,
    fontSize: 14,
  },
  button: {
    padding: "10px 16px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    borderRadius: 4,
    border: "1px solid #333",
    background: "#333",
    color: "#fff",
  },
  ghost: {
    padding: "8px 12px",
    fontSize: 13,
    cursor: "pointer",
    background: "none",
    border: "1px solid #ccc",
    borderRadius: 4,
    color: "#555",
  },
  error: {
    color: "#c0392b",
    fontSize: 13,
    margin: "4px 0",
  },
  successBanner: {
    marginBottom: 16,
    padding: "10px 14px",
    background: "#eafaf1",
    border: "1px solid #a9dfbf",
    borderRadius: 4,
    fontSize: 13,
    color: "#1e8449",
  },
  promptBox: {
    marginTop: 16,
    padding: "14px 16px",
    background: "#fef9e7",
    border: "1px solid #f9ca24",
    borderRadius: 6,
  },
  promptText: {
    margin: "0 0 12px",
    fontSize: 14,
    color: "#333",
  },
  promptActions: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },
  link: {
    marginTop: 20,
    fontSize: 13,
    color: "#555",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 13,
    marginTop: 8,
  },
  value: {
    padding: "6px 0",
    fontSize: 13,
    color: "#222",
  },
};
