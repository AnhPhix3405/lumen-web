"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSession, getTopicAnalysis, getPartsByExam, Session, TopicAnalysisItem, Part } from "@/lib/exam-api";
import { ApiError } from "@/lib/api-client";
import Link from "next/link";

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function SessionDetailPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();

  const [session, setSession] = useState<Session | null>(null);
  const [parts, setParts] = useState<Part[]>([]);
  const [topicAnalysis, setTopicAnalysis] = useState<TopicAnalysisItem[]>([]);
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    
    setLoading(true);
    getSession(sessionId)
      .then((resSession) => {
        setSession(resSession.data);
        if (resSession.data.exam?.id) {
          getPartsByExam(resSession.data.exam.id)
            .then(resParts => {
              const sorted = resParts.data.sort((a, b) => a.partOrder - b.partOrder);
              setParts(sorted);
            })
            .catch(console.error);
        }
      })
      .catch((err) => {
        if (err instanceof ApiError) setError(err.message);
        else setError("Failed to fetch session details.");
      })
      .finally(() => setLoading(false));
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    setAnalysisLoading(true);
    getTopicAnalysis(sessionId, selectedPartId || undefined)
      .then(res => setTopicAnalysis(res.data))
      .catch(console.error)
      .finally(() => setAnalysisLoading(false));
  }, [sessionId, selectedPartId]);

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", paddingTop: 120 }}>
      <div className="spinner" />
    </div>
  );

  if (error || !session) return (
    <div className="page-container" style={{ paddingTop: 40 }}>
      <div className="alert alert-error">{error || "Session not found"}</div>
    </div>
  );

  // Compute stats
  const correct = session.totalCorrect || 0;
  const total = session.totalQuestions || 0;
  
  // Calculate skipped from userAnswers if available
  let answered = 0;
  if (session.userAnswers) {
    answered = session.userAnswers.filter(a => a.selectedOption || a.answerContent).length;
  } else {
    answered = correct; // fallback if no userAnswers
  }
  const skipped = Math.max(0, total - answered);
  const incorrect = Math.max(0, answered - correct);
  
  const accuracy = session.correctRatio ? (session.correctRatio * 100).toFixed(1) : ((correct / (total || 1)) * 100).toFixed(1);
  const duration = session.durationSeconds || 0;

  return (
    <div className="page-container" style={{ padding: "40px 24px", maxWidth: 1000, margin: "0 auto" }}>
      
      {/* Header section */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 16px", color: "#fff", display: "flex", alignItems: "center", gap: 12 }}>
          Kết quả luyện tập: {session.exam?.name || "Exam"}
        </h1>
        
        <div style={{ display: "flex", gap: 12 }}>
          {/* We assume /tests/[examId]/review/[sessionId] exists for reviewing answers, or we just put a placeholder */}
          <button className="btn btn-primary btn-sm" style={{ backgroundColor: "#3b5998", borderColor: "#3b5998" }}>
            Xem đáp án
          </button>
          <button onClick={() => router.push("/tests")} className="btn btn-outline btn-sm">
            Quay về trang đề thi
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "flex", gap: 24, marginBottom: 40, flexWrap: "wrap" }}>
        {/* Left Column: Summary */}
        <div className="card" style={{ flex: "1 1 300px", padding: 24, background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--text-secondary)", fontWeight: 500 }}>
              <span>✓</span>
              Kết quả làm bài
            </div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>{correct}/{total}</div>
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--text-secondary)", fontWeight: 500 }}>
              <span>🎯</span>
              Độ chính xác (#đúng/#tổng)
            </div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>{accuracy}%</div>
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--text-secondary)", fontWeight: 500 }}>
              <span>⏱️</span>
              Thời gian hoàn thành
            </div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>{formatDuration(duration)}</div>
          </div>
        </div>

        {/* Right Column: 3 Cards */}
        <div style={{ flex: "2 1 500px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {/* Correct */}
          <div className="card" style={{ padding: 24, textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
            <div style={{ color: "var(--success)", fontSize: 24, marginBottom: 8 }}>✅</div>
            <div style={{ color: "var(--success)", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Trả lời đúng</div>
            <div style={{ fontSize: 28, fontWeight: 700, margin: "8px 0" }}>{correct}</div>
            <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>câu hỏi</div>
          </div>
          
          {/* Incorrect */}
          <div className="card" style={{ padding: 24, textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
            <div style={{ color: "var(--error)", fontSize: 24, marginBottom: 8 }}>❌</div>
            <div style={{ color: "var(--error)", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Trả lời sai</div>
            <div style={{ fontSize: 28, fontWeight: 700, margin: "8px 0" }}>{incorrect}</div>
            <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>câu hỏi</div>
          </div>
          
          {/* Skipped */}
          <div className="card" style={{ padding: 24, textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
            <div style={{ color: "var(--text-muted)", fontSize: 24, marginBottom: 8 }}>➖</div>
            <div style={{ color: "var(--text-muted)", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Bỏ qua</div>
            <div style={{ fontSize: 28, fontWeight: 700, margin: "8px 0" }}>{skipped}</div>
            <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>câu hỏi</div>
          </div>
        </div>
      </div>

      {/* Detailed Analysis */}
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 16px" }}>Phân tích chi tiết</h2>
        
        <div style={{ display: "flex", gap: 8, marginBottom: 24, overflowX: "auto", paddingBottom: 4 }}>
          <button 
            onClick={() => setSelectedPartId(null)}
            className={`badge ${selectedPartId === null ? 'badge-purple' : 'badge-gray'}`} 
            style={{ padding: "8px 16px", fontSize: 14, border: "none", cursor: "pointer", transition: "all 0.2s" }}
          >
            Tổng quát
          </button>
          {parts.map(part => (
            <button 
              key={part.id}
              onClick={() => setSelectedPartId(part.id)}
              className={`badge ${selectedPartId === part.id ? 'badge-purple' : 'badge-gray'}`} 
              style={{ padding: "8px 16px", fontSize: 14, border: "none", cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap" }}
            >
              {part.name}
            </button>
          ))}
        </div>
        
        <div className="card" style={{ padding: 0, overflow: "hidden", border: "1px solid var(--border)", position: "relative" }}>
          {analysisLoading && (
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 10 }}>
              <div className="spinner" />
            </div>
          )}
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", background: "rgba(255,255,255,0.01)" }}>
                <th style={thStyle}>Phân loại câu hỏi</th>
                <th style={thStyle}>Số câu đúng</th>
                <th style={thStyle}>Số câu sai</th>
                <th style={thStyle}>Số câu bỏ qua</th>
                <th style={thStyle}>Độ chính xác</th>
                <th style={thStyle}>Danh sách câu hỏi</th>
              </tr>
            </thead>
            <tbody>
              {topicAnalysis.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>
                    Không có dữ liệu phân tích chủ đề cho bài thi này.
                  </td>
                </tr>
              )}
              {topicAnalysis.map((topic, i) => (
                <tr key={topic.topicId || `untagged-${i}`} style={{ borderBottom: "1px solid var(--border)" }} className="table-row-hover">
                  <td style={{ ...tdStyle, fontWeight: 500, color: "#fff" }}>
                    {topic.topicName}
                  </td>
                  <td style={tdStyle}>{topic.correct}</td>
                  <td style={tdStyle}>{topic.incorrect}</td>
                  <td style={tdStyle}>{topic.skipped}</td>
                  <td style={tdStyle}>{(topic.accuracy * 100).toFixed(2)}%</td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {/* Render question sequence as circles or simple badges. */}
                      {topic.questions?.map((q) => (
                        <div
                          key={q.id}
                          title={`Question ID: ${q.id}`}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            border: "1px solid var(--border)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            fontWeight: 600,
                            color: "var(--text-secondary)"
                          }}
                        >
                          {q.sequence}
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "16px 20px",
  fontSize: 13,
  fontWeight: 600,
  color: "rgba(255,255,255,0.5)",
  whiteSpace: "nowrap"
};

const tdStyle: React.CSSProperties = {
  padding: "16px 20px",
  fontSize: 14,
  color: "var(--text-primary)"
};
