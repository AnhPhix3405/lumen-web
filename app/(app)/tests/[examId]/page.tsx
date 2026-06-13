"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getFullExam, FullExam } from "@/lib/exam-api";
import { ApiError } from "@/lib/api-client";
import Link from "next/link";

export default function ExamDetailPage() {
  const { examId } = useParams<{ examId: string }>();
  const router = useRouter();
  const [exam, setExam] = useState<FullExam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!examId) return;
    let cancelled = false;
    setLoading(true);
    getFullExam(examId)
      .then((res) => { if (!cancelled) setExam(res.data); })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError) setError(err.message);
        else setError("Failed to load exam.");
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
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

  const totalQuestions = exam.parts?.reduce(
    (acc, p) => acc + p.questionGroups?.reduce((a, g) => a + (g.questions?.length ?? 0), 0),
    0
  ) ?? 0;

  return (
    <div className="page-container" style={{ padding: "40px 24px", maxWidth: 860 }}>
      <button onClick={() => router.back()} className="btn btn-ghost btn-sm" style={{ marginBottom: 24 }}>
        ← Back
      </button>

      <div className="card" style={{ marginBottom: 28, background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))", borderColor: "rgba(99,102,241,0.25)" }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          {exam.examType && <span className="badge badge-purple">{exam.examType.name}</span>}
          {exam.isPublished && <span className="badge badge-green">Published</span>}
          <span className="badge badge-gray">{exam.visibility}</span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 10px" }}>{exam.name}</h1>
        {exam.description && (
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", margin: "0 0 24px", lineHeight: 1.7 }}>
            {exam.description}
          </p>
        )}

        <div style={{ display: "flex", gap: 32, flexWrap: "wrap", marginBottom: 24 }}>
          {[
            { icon: "⏱", label: "Duration", value: `${exam.durationMinutes} minutes` },
            { icon: "🎯", label: "Total Score", value: exam.totalScore },
            { icon: "📋", label: "Parts", value: exam.parts?.length ?? 0 },
            { icon: "❓", label: "Questions", value: totalQuestions },
          ].map(({ icon, label, value }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 22 }}>{icon}</span>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{value}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        <Link href={`/tests/${examId}/take`} className="btn btn-primary" style={{ display: "inline-flex" }}>
          🚀 Start Exam
        </Link>
      </div>

      {exam.parts && exam.parts.length > 0 && (
        <section>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 16px" }}>Exam Structure</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[...exam.parts].sort((a, b) => a.partOrder - b.partOrder).map((part) => {
              const qCount = part.questionGroups?.reduce((a, g) => a + (g.questions?.length ?? 0), 0) ?? 0;
              return (
                <div key={part.id} className="card" style={{ padding: "16px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <span style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(99,102,241,0.2)", display: "grid", placeItems: "center", fontSize: 13, fontWeight: 700, color: "#a5b4fc" }}>
                          {part.partOrder}
                        </span>
                        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{part.name}</h3>
                        <span className="badge badge-gray" style={{ fontSize: 10 }}>{part.type}</span>
                      </div>
                      {part.instruction && (
                        <p style={{ margin: "0 0 0 38px", fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>
                          {part.instruction}
                        </p>
                      )}
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{qCount} Qs</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{part.score} pts</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
