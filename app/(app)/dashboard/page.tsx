"use client";

import { useEffect, useState } from "react";
import { getMyExams, ExamSummary } from "@/lib/exam-api";
import { ApiError } from "@/lib/api-client";
import Link from "next/link";

export default function CreatorDashboardPage() {
  const [exams, setExams] = useState<ExamSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getMyExams()
      .then((res) => { if (!cancelled) setExams(res.data); })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError) setError(err.message);
        else setError("Failed to load creator exams.");
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="page-container" style={{ padding: "40px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, margin: "0 0 8px" }}>
            Creator <span className="gradient-text">Dashboard</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, margin: 0 }}>
            Manage, structure, and publish your custom practice exams.
          </p>
        </div>
        <Link href="/create-exam" className="btn btn-primary">
          ✨ Create New Exam
        </Link>
      </div>

      {loading && (
        <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
          <div className="spinner" />
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {!loading && !error && exams.length === 0 && (
        <div style={{ textAlign: "center", padding: 80, color: "rgba(255,255,255,0.4)" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🛠</div>
          <p style={{ fontSize: 16 }}>You have not created any exams yet.</p>
          <Link href="/create-exam" className="btn btn-primary" style={{ marginTop: 16, display: "inline-flex" }}>
            Create Your First Exam
          </Link>
        </div>
      )}

      {!loading && !error && exams.length > 0 && (
        <div className="exam-grid fade-up">
          {exams.map((exam) => (
            <div key={exam.id} className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                  <span className="badge badge-purple">{exam.examType?.name ?? "Exam"}</span>
                  <span className={`badge ${exam.isPublished ? "badge-green" : "badge-gray"}`}>
                    {exam.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
                <h2 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 8px" }}>{exam.name}</h2>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: "0 0 16px" }}>
                  {exam.description || "No description provided."}
                </p>
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <Link href={`/edit-exam/${exam.id}`} className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: "center" }}>
                  ⚙️ Settings
                </Link>
                <Link href={`/edit-exam/${exam.id}/structure`} className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: "center" }}>
                  🏗 Structure
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
