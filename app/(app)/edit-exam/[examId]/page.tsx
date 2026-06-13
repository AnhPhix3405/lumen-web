"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getFullExam, FullExam } from "@/lib/exam-api";
import { ApiError } from "@/lib/api-client";
import Link from "next/link";

export default function EditExamSettingsPage() {
  const { examId } = useParams<{ examId: string }>();
  const router = useRouter();
  const [exam, setExam] = useState<FullExam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!examId) return;
    getFullExam(examId)
      .then((res) => setExam(res.data))
      .catch((err) => {
        if (err instanceof ApiError) setError(err.message);
        else setError("Failed to load exam details.");
      })
      .finally(() => setLoading(false));
  }, [examId]);

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

  if (!exam) return null;

  return (
    <div className="page-container" style={{ padding: "40px 24px", maxWidth: 800 }}>
      {/* Breadcrumbs */}
      <div style={{ display: "flex", gap: 8, fontSize: 13, color: "var(--text-secondary)", marginBottom: 24 }}>
        <Link href="/dashboard" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Dashboard</Link>
        <span>/</span>
        <span style={{ color: "#fff" }}>Edit Exam</span>
      </div>

      {/* Title */}
      <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 24px" }}>
        ⚙️ Settings: <span className="gradient-text">{exam.name}</span>
      </h1>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 16, borderBottom: "1px solid var(--border)", marginBottom: 32 }}>
        <Link href={`/edit-exam/${examId}`} style={activeTabStyle}>Overview & Config</Link>
        <Link href={`/edit-exam/${examId}/structure`} style={tabStyle}>Exam Structure</Link>
      </div>

      {/* Overview */}
      <div className="card fade-up" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Exam Configuration Details</h2>

        <div style={gridStyle}>
          <div>
            <div style={labelStyle}>Title / Name</div>
            <div style={valueStyle}>{exam.name}</div>
          </div>
          <div>
            <div style={labelStyle}>Exam Type</div>
            <div style={valueStyle}>{exam.examType?.name || "N/A"} ({exam.examType?.code})</div>
          </div>
          <div>
            <div style={labelStyle}>Duration</div>
            <div style={valueStyle}>{exam.durationMinutes} minutes</div>
          </div>
          <div>
            <div style={labelStyle}>Total Score</div>
            <div style={valueStyle}>{exam.totalScore} points</div>
          </div>
          <div>
            <div style={labelStyle}>Visibility</div>
            <div style={valueStyle}>
              <span className="badge badge-gray">{exam.visibility}</span>
            </div>
          </div>
          <div>
            <div style={labelStyle}>Status</div>
            <div style={valueStyle}>
              <span className={`badge ${exam.isPublished ? "badge-green" : "badge-amber"}`}>
                {exam.isPublished ? "Published" : "Draft"}
              </span>
            </div>
          </div>
        </div>

        {exam.description && (
          <div>
            <div style={labelStyle}>Description</div>
            <div style={{ ...valueStyle, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{exam.description}</div>
          </div>
        )}

        <div style={{ display: "flex", gap: 12, marginTop: 16, borderTop: "1px solid var(--border)", paddingTop: 24 }}>
          <Link href={`/edit-exam/${examId}/structure`} className="btn btn-primary">
            🏗 Manage Exam Structure
          </Link>
          <Link href="/dashboard" className="btn btn-ghost">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

const tabStyle: React.CSSProperties = {
  padding: "10px 16px",
  fontSize: 14,
  fontWeight: 600,
  color: "var(--text-secondary)",
  textDecoration: "none",
  borderBottom: "2px solid transparent",
  transition: "all 0.15s",
};

const activeTabStyle: React.CSSProperties = {
  ...tabStyle,
  color: "var(--accent)",
  borderBottomColor: "var(--accent)",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 24,
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: 6,
};

const valueStyle: React.CSSProperties = {
  fontSize: 15,
  color: "#fff",
};
