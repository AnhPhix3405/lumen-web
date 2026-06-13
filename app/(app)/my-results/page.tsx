"use client";

import { useEffect, useState } from "react";
import { getMySessions, MySessions } from "@/lib/exam-api";
import { ApiError } from "@/lib/api-client";
import Link from "next/link";

export default function MyResultsPage() {
  const [sessions, setSessions] = useState<MySessions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getMySessions()
      .then((res) => { if (!cancelled) setSessions(res.data); })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError) setError(err.message);
        else setError("Failed to fetch attempt history.");
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="page-container" style={{ padding: "40px 24px" }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, margin: "0 0 8px" }}>
          My <span className="gradient-text">Results</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, margin: 0 }}>
          Your history of practice exam attempts and performance.
        </p>
      </div>

      {loading && (
        <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
          <div className="spinner" />
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {!loading && !error && sessions.length === 0 && (
        <div style={{ textAlign: "center", padding: 80, color: "rgba(255,255,255,0.4)" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
          <p style={{ fontSize: 16 }}>No exam attempts recorded yet.</p>
          <Link href="/tests" className="btn btn-primary" style={{ marginTop: 16, display: "inline-flex" }}>
            Browse Exams
          </Link>
        </div>
      )}

      {!loading && !error && sessions.length > 0 && (
        <div className="card fade-up" style={{ padding: 0, overflow: "hidden", border: "1px solid var(--border)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", background: "rgba(255,255,255,0.01)" }}>
                <th style={thStyle}>Exam</th>
                <th style={thStyle}>Date & Time</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Score</th>
                <th style={thStyle}>Accuracy</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => {
                const date = new Date(s.startedAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const pct = Math.round(s.correctRatio * 100);

                return (
                  <tr key={s.id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.2s" }} className="table-row-hover">
                    <td style={tdStyle}>
                      <span style={{ fontWeight: 600, color: "#fff" }}>{s.exam?.name}</span>
                    </td>
                    <td style={{ ...tdStyle, color: "var(--text-secondary)" }}>{date}</td>
                    <td style={tdStyle}>
                      <span className={`badge ${s.status === "completed" ? "badge-green" : "badge-amber"}`}>
                        {s.status}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>
                      {s.totalCorrect} / {s.totalQuestions}
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontWeight: 600, color: pct >= 70 ? "var(--success)" : pct >= 40 ? "var(--warning)" : "var(--error)" }}>
                          {pct}%
                        </span>
                        <div style={{ width: 60, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: pct >= 70 ? "var(--success)" : pct >= 40 ? "var(--warning)" : "var(--error)" }} />
                        </div>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <Link href={`/results/${s.id}`} className="btn btn-ghost btn-sm" style={{ padding: "6px 12px" }}>
                        Review
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "16px 20px",
  fontSize: 13,
  fontWeight: 600,
  color: "rgba(255,255,255,0.4)",
};

const tdStyle: React.CSSProperties = {
  padding: "18px 20px",
  fontSize: 14,
};
