"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSession, Session } from "@/lib/exam-api";
import { ApiError } from "@/lib/api-client";
import Link from "next/link";

export default function ResultsPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;

    setLoading(true);
    getSession(sessionId)
      .then((res) => { if (!cancelled) setSession(res.data); })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError) setError(err.message);
        else setError("Failed to load session details.");
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [sessionId]);

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", paddingTop: 120 }}>
      <div className="spinner" />
    </div>
  );

  if (error) return (
    <div className="page-container" style={{ paddingTop: 40 }}>
      <div className="alert alert-error">{error}</div>
    </div>
  );

  if (!session) return null;

  const examName = session.exam?.name || "Exam Attempt";
  const userAnswers = session.userAnswers || [];
  const correctCount = userAnswers.filter((a) => a.isCorrect).length;
  const totalQuestions = userAnswers.length;
  const score = userAnswers.reduce((acc, a) => acc + (a.isCorrect ? a.score : 0), 0);
  const totalPossibleScore = userAnswers.reduce((acc, a) => acc + a.score, 0);
  const ratio = totalPossibleScore > 0 ? (score / totalPossibleScore) : 0;
  const percentage = Math.round(ratio * 100);

  return (
    <div className="page-container" style={{ padding: "40px 24px", maxWidth: 860 }}>
      {/* Header Info */}
      <div style={{ marginBottom: 32 }}>
        <button onClick={() => router.push("/my-results")} className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }}>
          ← Back to My Results
        </button>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 6px" }}>Exam Performance Review</h1>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, margin: 0 }}>
          Detailed score overview for <strong>{examName}</strong>
        </p>
      </div>

      {/* Score overview card */}
      <div className="card" style={scoreCardStyle}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 44, fontWeight: 800, color: percentage >= 70 ? "var(--success)" : percentage >= 40 ? "var(--warning)" : "var(--error)" }}>
            {percentage}%
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>ACCURACY</div>
        </div>

        <div style={statsContainerStyle}>
          <div>
            <div style={statValStyle}>{score} / {totalPossibleScore}</div>
            <div style={statLabelStyle}>Points Earned</div>
          </div>
          <div>
            <div style={statValStyle}>{correctCount} / {totalQuestions}</div>
            <div style={statLabelStyle}>Correct Answers</div>
          </div>
          <div>
            <div style={statValStyle}>{session.status}</div>
            <div style={statLabelStyle}>Session Status</div>
          </div>
        </div>
      </div>

      {/* Detailed answers review */}
      <section style={{ marginTop: 40 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Question by Question Review</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {userAnswers.map((ans, idx) => (
            <div key={ans.id} className="card" style={{ borderLeft: `4px solid ${ans.isCorrect ? "var(--success)" : "var(--error)"}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <span className="badge badge-gray">Question {idx + 1}</span>
                <span className={`badge ${ans.isCorrect ? "badge-green" : "badge-gray"}`} style={{ color: ans.isCorrect ? "" : "var(--error)" }}>
                  {ans.isCorrect ? `Correct (+${ans.score})` : "Incorrect (0)"}
                </span>
              </div>

              <p style={{ fontSize: 15, fontWeight: 500, margin: "0 0 16px" }}>
                {ans.question.content}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 12, borderRadius: 8, background: "rgba(255,255,255,0.015)", border: "1px solid var(--border)" }}>
                <div>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Your response: </span>
                  <strong style={{ fontSize: 14, color: ans.isCorrect ? "var(--success)" : "var(--error)" }}>
                    {ans.selectedOption?.key ?? ans.answerContent ?? "(none)"}
                  </strong>
                </div>
                {!ans.isCorrect && (
                  <div>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Correct option: </span>
                    <strong style={{ fontSize: 14, color: "var(--success)" }}>
                      {ans.question.correctOption?.key ?? "N/A"}
                    </strong>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const scoreCardStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 2fr",
  gap: 32,
  alignItems: "center",
  background: "rgba(255,255,255,0.02)",
  padding: "32px 40px",
  borderRadius: 16,
};

const statsContainerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-around",
  borderLeft: "1px solid var(--border)",
  paddingLeft: 32,
  gap: 16,
};

const statValStyle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
  color: "#fff",
};

const statLabelStyle: React.CSSProperties = {
  fontSize: 12,
  color: "rgba(255,255,255,0.4)",
  marginTop: 4,
};
