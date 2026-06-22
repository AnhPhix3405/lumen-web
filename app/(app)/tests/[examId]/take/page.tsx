"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getExamSummary,
  getPartsByExam,
  getPartDetails,
  createSession,
  submitAnswers,
  finishSession,
  ExamSummary,
  Part,
  Question,
} from "@/lib/exam-api";
import { ApiError } from "@/lib/api-client";
import ReactMarkdown from "react-markdown";

interface UserAnswersState {
  [questionId: string]: {
    selectedOption?: { key: string };
    answerContent?: string;
  };
}

export default function TakeExamPage() {
  const { examId } = useParams<{ examId: string }>();
  const router = useRouter();

  const [exam, setExam] = useState<ExamSummary | null>(null);
  const [parts, setParts] = useState<Part[]>([]);
  const [partDetails, setPartDetails] = useState<Record<string, Part>>({});
  const [loadingPart, setLoadingPart] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activePartIndex, setActivePartIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswersState>({});
  const [saving, setSaving] = useState(false);

  const loadingPartRef = useRef<string | null>(null);

  // Load exam metadata + parts list + session on mount
  useEffect(() => {
    if (!examId) return;
    let cancelled = false;

    const init = async () => {
      try {
        setLoading(true);

        const [summary, partsRes] = await Promise.all([
          getExamSummary(examId),
          getPartsByExam(examId),
        ]);
        if (cancelled) return;

        if (!summary) {
          setError("Exam not found.");
          return;
        }

        setExam(summary);
        const sorted = (partsRes.data ?? []).sort((a, b) => a.partOrder - b.partOrder);
        setParts(sorted);

        // Create a new session
        const sessionRes = await createSession(examId);
        if (cancelled) return;
        setSessionId(sessionRes.data.sessionId || null);
        setTimeLeft(sessionRes.data.timeLimitSeconds || (summary.durationMinutes * 60));
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError) setError(err.message);
        else setError("Failed to initialize exam session.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    init();
    return () => { cancelled = true; };
  }, [examId]);

  // Load active part content when part changes
  useEffect(() => {
    const part = parts[activePartIndex];
    if (!part) return;
    if (partDetails[part.id]) return; // already loaded
    if (loadingPartRef.current === part.id) return; // already loading

    loadingPartRef.current = part.id;
    setLoadingPart(part.id);

    getPartDetails(part.id)
      .then((res) => {
        if (loadingPartRef.current === part.id) {
          setPartDetails((prev) => ({ ...prev, [part.id]: res.data }));
          setLoadingPart(null);
          loadingPartRef.current = null;
        }
      })
      .catch((err) => {
        console.error("Failed to load part content:", err);
        if (loadingPartRef.current === part.id) {
          setLoadingPart(null);
          loadingPartRef.current = null;
        }
      });
  }, [activePartIndex, parts, partDetails]);

  // Countdown timer
  useEffect(() => {
    if (loading || error || timeLeft <= 0 || !sessionId) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinish(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, error, timeLeft, sessionId]);

  const handleSelectOption = (questionId: string, optionKey: string) => {
    setUserAnswers((prev) => {
      const updated = {
        ...prev,
        [questionId]: { selectedOption: { key: optionKey } },
      };
      if (sessionId) {
        submitAnswers(sessionId, [
          { questionId, selectedOption: { key: optionKey } },
        ]).catch((err) => console.error("Error saving progress:", err));
      }
      return updated;
    });
  };

  const handleTextChange = (questionId: string, text: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: { answerContent: text },
    }));
  };

  const savePartProgress = async () => {
    if (!sessionId) return;
    setSaving(true);
    try {
      const answersArray = Object.entries(userAnswers).map(([qId, ans]) => ({
        questionId: qId,
        selectedOption: ans.selectedOption,
        answerContent: ans.answerContent,
      }));
      if (answersArray.length > 0) {
        await submitAnswers(sessionId, answersArray);
      }
    } catch (err) {
      console.error("Failed to save progress:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleFinish = async (isAuto = false) => {
    if (!sessionId) return;
    if (!isAuto && !confirm("Are you sure you want to finish and submit the exam?")) return;

    setLoading(true);
    try {
      const answersArray = Object.entries(userAnswers).map(([qId, ans]) => ({
        questionId: qId,
        selectedOption: ans.selectedOption,
        answerContent: ans.answerContent,
      }));
      if (answersArray.length > 0) {
        await submitAnswers(sessionId, answersArray);
      }
      await finishSession(sessionId);
      router.push(`/my-results`);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Failed to submit and finish exam.");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.fullscreenCenter}>
        <div className="spinner" />
        <p style={{ marginTop: 16, color: "var(--text-secondary)" }}>Loading exam player...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.fullscreenCenter}>
        <div className="alert alert-error" style={{ maxWidth: 400 }}>{error}</div>
        <button onClick={() => router.push("/tests")} className="btn btn-ghost" style={{ marginTop: 16 }}>
          Back to Tests
        </button>
      </div>
    );
  }

  if (!exam) return null;

  const activePart = partDetails[parts[activePartIndex]?.id] ?? parts[activePartIndex];

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const renderQuestion = (q: Question) => {
    const ans = userAnswers[q.id];
    return (
      <div key={q.id} style={styles.questionBlock}>
        <div style={{ display: "flex", gap: 10 }}>
          <span style={styles.qNumber}>{q.questionOrder}</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 15, fontWeight: 500, margin: "0 0 14px", color: "var(--text-primary)" }}>
              {q.content}
            </p>

            {/* Audio */}
            {q.audioUrl && q.audioUrl !== "null" && (
              <div style={{ ...styles.audioWrapper, marginBottom: 14 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)" }}>🎧 Audio:</span>
                <audio src={q.audioUrl} controls style={{ width: "100%", marginTop: 8 }} />
              </div>
            )}

            {/* Image */}
            {q.imageUrl && q.imageUrl !== "null" && (
              <div style={{ marginBottom: 14 }}>
                <img
                  src={q.imageUrl}
                  alt={`Question ${q.questionOrder}`}
                  style={{ maxWidth: "100%", maxHeight: 280, objectFit: "contain", borderRadius: 10, border: "1px solid var(--border)" }}
                />
              </div>
            )}

            {q.options ? (
              <div style={styles.optionsList}>
                {Object.entries(q.options).map(([key, val]) => {
                  const isSelected = ans?.selectedOption?.key === key;
                  return (
                    <button
                      key={key}
                      onClick={() => handleSelectOption(q.id, key)}
                      style={{
                        ...styles.optionBtn,
                        ...(isSelected ? styles.optionBtnSelected : {}),
                      }}
                    >
                      <span style={{
                        ...styles.optionBadge,
                        ...(isSelected ? styles.optionBadgeActive : {}),
                      }}>{key}</span>
                      <span style={{ fontSize: 14 }}>{val}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <input
                type="text"
                placeholder="Type your response here..."
                className="input"
                value={ans?.answerContent || ""}
                onChange={(e) => handleTextChange(q.id, e.target.value)}
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.wrapper}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.headerTitle}>{exam.name}</h1>
          {exam.examType && <span className="badge badge-purple" style={{ fontSize: 11 }}>{exam.examType.name}</span>}
        </div>

        <div style={{ ...styles.timer, color: timeLeft < 300 ? "var(--error)" : "var(--warning)" }}>
          <span style={{ fontSize: 20 }}>⏱</span>
          <span>{formatTime(timeLeft)}</span>
        </div>

        <div>
          <button onClick={() => handleFinish(false)} className="btn btn-primary btn-sm">
            Submit Exam
          </button>
        </div>
      </header>

      <div style={styles.workspace}>
        <aside style={styles.sidebar}>
          <h2 style={styles.sidebarHeading}>Parts</h2>
          <div style={styles.partList}>
            {parts.map((p, idx) => {
              const isActive = idx === activePartIndex;
              const isLoading = loadingPart === p.id;
              return (
                <button
                  key={p.id}
                  onClick={async () => {
                    if (idx === activePartIndex) return;
                    await savePartProgress();
                    setActivePartIndex(idx);
                  }}
                  style={{
                    ...styles.partBtn,
                    ...(isActive ? styles.partBtnActive : {}),
                  }}
                >
                  <span style={styles.partBtnNum}>{p.partOrder}</span>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>
                      {p.name}
                      {isLoading && <span style={{ marginLeft: 6, fontSize: 11, color: "var(--text-muted)" }}>loading...</span>}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{p.type}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: "auto", paddingTop: 20, borderTop: "1px solid var(--border)" }}>
            <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 8 }}>
              {saving ? "🔄 Saving answers..." : "✅ All progress saved locally"}
            </div>
          </div>
        </aside>

        <main style={styles.content}>
          {loadingPart === parts[activePartIndex]?.id ? (
            <div style={{ textAlign: "center", padding: 80, color: "var(--text-muted)" }}>
              <div className="spinner" />
              <p style={{ marginTop: 16 }}>Loading part content...</p>
            </div>
          ) : activePart ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }} className="fade-up">
              <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 8px" }}>{activePart.name}</h2>
                {activePart.instruction && (
                  <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: 0, lineHeight: 1.6 }}>
                    {activePart.instruction}
                  </p>
                )}
              </div>

              {/* Question groups (for group-type parts) */}
              {activePart.questionGroups?.map((group) => (
                <div key={group.id} className="card" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {group.audioUrl && group.audioUrl !== "null" && (
                    <div style={styles.audioWrapper}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "var(--accent)" }}>🎧 Section Audio:</span>
                      <audio src={group.audioUrl} controls style={{ width: "100%", marginTop: 8 }} />
                    </div>
                  )}
                  {group.content && (
                    <div style={styles.passageContent}>
                      <ReactMarkdown>{group.content}</ReactMarkdown>
                    </div>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 12 }}>
                    {group.questions?.map(renderQuestion)}
                  </div>
                </div>
              ))}

              {/* Standalone questions (for standalone-type parts) */}
              {activePart.questions?.map(renderQuestion)}

              {/* Navigation buttons */}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
                <button
                  disabled={activePartIndex === 0}
                  onClick={async () => {
                    await savePartProgress();
                    setActivePartIndex((p) => p - 1);
                  }}
                  className="btn btn-ghost"
                >
                  ← Previous Part
                </button>
                {activePartIndex < parts.length - 1 ? (
                  <button
                    onClick={async () => {
                      await savePartProgress();
                      setActivePartIndex((p) => p + 1);
                    }}
                    className="btn btn-primary"
                  >
                    Next Part →
                  </button>
                ) : (
                  <button onClick={() => handleFinish(false)} className="btn btn-primary">
                    Submit & Finish Exam
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: 80, color: "var(--text-muted)" }}>
              No active part found.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  fullscreenCenter: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "var(--bg)",
  },
  wrapper: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    background: "var(--bg)",
  },
  header: {
    height: 70,
    background: "rgba(7,7,15,0.9)",
    borderBottom: "1px solid var(--border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 24px",
  },
  headerTitle: {
    margin: "0 0 2px",
    fontSize: 16,
    fontWeight: 700,
    color: "#fff",
  },
  timer: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 18,
    fontWeight: 700,
    background: "rgba(255,255,255,0.03)",
    padding: "6px 14px",
    borderRadius: 8,
    border: "1px solid var(--border)",
  },
  workspace: {
    display: "flex",
    flex: 1,
    overflow: "hidden",
  },
  sidebar: {
    width: 260,
    borderRight: "1px solid var(--border)",
    background: "rgba(7,7,15,0.4)",
    padding: 24,
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
  },
  sidebarHeading: {
    fontSize: 12,
    fontWeight: 700,
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    margin: "0 0 16px",
  },
  partList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  partBtn: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 14px",
    borderRadius: 10,
    background: "transparent",
    border: "1px solid transparent",
    color: "var(--text-secondary)",
    cursor: "pointer",
    transition: "all 0.15s",
  },
  partBtnActive: {
    background: "rgba(99,102,241,0.12)",
    borderColor: "rgba(99,102,241,0.2)",
    color: "#a5b4fc",
  },
  partBtnNum: {
    width: 22,
    height: 22,
    borderRadius: 6,
    background: "rgba(255,255,255,0.08)",
    display: "grid",
    placeItems: "center",
    fontSize: 11,
    fontWeight: 700,
  },
  content: {
    flex: 1,
    padding: "32px 40px",
    overflowY: "auto",
    maxWidth: 960,
    margin: "0 auto",
    width: "100%",
  },
  audioWrapper: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid var(--border)",
    padding: 16,
    borderRadius: 12,
  },
  passageContent: {
    background: "rgba(255,255,255,0.015)",
    borderLeft: "3px solid var(--accent)",
    padding: "16px 20px",
    borderRadius: "0 12px 12px 0",
    fontSize: 14,
    color: "var(--text-secondary)",
    lineHeight: 1.7,
    whiteSpace: "pre-wrap",
  },
  questionBlock: {
    padding: "8px 0",
  },
  qNumber: {
    width: 24,
    height: 24,
    borderRadius: "50%",
    background: "var(--border-strong)",
    color: "var(--text-primary)",
    display: "grid",
    placeItems: "center",
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0,
  },
  optionsList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  optionBtn: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 14px",
    borderRadius: 10,
    background: "rgba(255,255,255,0.02)",
    border: "1px solid var(--border)",
    color: "var(--text-secondary)",
    textAlign: "left",
    cursor: "pointer",
    transition: "all 0.15s",
  },
  optionBtnSelected: {
    background: "rgba(99,102,241,0.08)",
    borderColor: "var(--accent)",
    color: "#fff",
  },
  optionBadge: {
    width: 24,
    height: 24,
    borderRadius: 6,
    background: "rgba(255,255,255,0.06)",
    display: "grid",
    placeItems: "center",
    fontSize: 12,
    fontWeight: 700,
  },
  optionBadgeActive: {
    background: "var(--accent)",
    color: "#fff",
  },
};
