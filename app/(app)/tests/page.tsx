"use client";

import { useEffect, useState } from "react";
import { listPublishedExams, ExamSummary } from "@/lib/exam-api";
import { ApiError } from "@/lib/api-client";
import Link from "next/link";

const TYPE_COLORS: Record<string, string> = {
  ielts: "badge-purple",
  toeic: "badge-green",
  toefl: "badge-amber",
};

export default function TestsPage() {
  const [exams, setExams] = useState<ExamSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listPublishedExams()
      .then((res) => { if (!cancelled) setExams(res.data); })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError) setError(err.message);
        else setError("Failed to load exams.");
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="page-container" style={{ padding: "40px 24px" }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, margin: "0 0 8px" }}>
          Browse <span className="gradient-text">Exams</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, margin: 0 }}>
          Choose from our published practice tests and start improving today.
        </p>
      </div>

      {loading && (
        <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
          <div className="spinner" />
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {!loading && !error && exams.length === 0 && (
        <div style={{ textAlign: "center", padding: 80, color: "rgba(255,255,255,0.4)" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
          <p style={{ fontSize: 16 }}>No published exams yet.</p>
        </div>
      )}

      <div className="exam-grid fade-up">
        {exams.map((exam) => {
          const colorClass = TYPE_COLORS[exam.examType?.code?.toLowerCase()] ?? "badge-gray";
          return (
            <div key={exam.id} className="card" style={cardStyle}>
              {/* Type badge */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <span className={`badge ${colorClass}`}>
                  {exam.examType?.name ?? "Exam"}
                </span>
                {exam.isPublished && <span className="badge badge-green">Published</span>}
              </div>

              {/* Title */}
              <h2 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 8px", lineHeight: 1.4 }}>
                {exam.name}
              </h2>
              {exam.description && (
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 16px", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {exam.description}
                </p>
              )}

              {/* Stats row */}
              <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
                <div style={statStyle}>
                  <span style={{ fontSize: 18 }}>⏱</span>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{exam.durationMinutes}m</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Duration</div>
                  </div>
                </div>
                <div style={statStyle}>
                  <span style={{ fontSize: 18 }}>🎯</span>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{exam.totalScore}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Total Score</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 8 }}>
                <Link
                  href={`/tests/${exam.id}`}
                  className="btn btn-ghost btn-sm"
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  Preview
                </Link>
                <Link
                  href={`/tests/${exam.id}/take`}
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  Start →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.2s",
};

const statStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};
