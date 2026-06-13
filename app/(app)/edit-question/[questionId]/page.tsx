"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getQuestionById, Question } from "@/lib/exam-api";
import { ApiError } from "@/lib/api-client";
import Link from "next/link";

export default function EditQuestionPage() {
  const { questionId } = useParams<{ questionId: string }>();
  const router = useRouter();

  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!questionId) return;
    getQuestionById(questionId)
      .then((res) => setQuestion(res.data))
      .catch((err) => {
        if (err instanceof ApiError) setError(err.message);
        else setError("Failed to fetch question details.");
      })
      .finally(() => setLoading(false));
  }, [questionId]);

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

  if (!question) return null;

  return (
    <div className="page-container" style={{ padding: "40px 24px", maxWidth: 640 }}>
      <button onClick={() => router.back()} className="btn btn-ghost btn-sm" style={{ marginBottom: 24 }}>
        ← Back
      </button>

      <div className="card fade-up">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px" }}>Question Details</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 13, margin: 0 }}>
              Order: #{question.questionOrder} • Score: {question.score} pts
            </p>
          </div>
          <span className="badge badge-purple">{question.type}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <div style={labelStyle}>Question Content</div>
            <div style={contentBoxStyle}>{question.content}</div>
          </div>

          {question.options && (
            <div>
              <div style={labelStyle}>Answer Options</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {Object.entries(question.options).map(([key, val]) => {
                  const isCorrect = question.correctOption?.key === key;
                  return (
                    <div
                      key={key}
                      style={{
                        padding: "10px 14px",
                        borderRadius: 8,
                        background: "rgba(255,255,255,0.02)",
                        border: `1px solid ${isCorrect ? "var(--success)" : "var(--border)"}`,
                        display: "flex",
                        gap: 10,
                      }}
                    >
                      <span style={{
                        fontWeight: 700,
                        color: isCorrect ? "var(--success)" : "var(--text-secondary)",
                      }}>{key}</span>
                      <span style={{ color: isCorrect ? "#fff" : "var(--text-secondary)" }}>{val}</span>
                      {isCorrect && <span style={{ marginLeft: "auto", color: "var(--success)", fontSize: 13 }}>✓ Correct Answer</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {question.explanation && (
            <div>
              <div style={labelStyle}>Explanation</div>
              <div style={{ ...contentBoxStyle, fontSize: 13, borderLeft: "3px solid var(--accent)", color: "var(--text-secondary)" }}>
                {question.explanation}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: 8,
};

const contentBoxStyle: React.CSSProperties = {
  padding: "12px 16px",
  borderRadius: 8,
  background: "rgba(255,255,255,0.015)",
  border: "1px solid var(--border)",
  fontSize: 15,
  color: "#fff",
};
