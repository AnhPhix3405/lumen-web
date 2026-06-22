"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getQuestionGroup, createQuestionInGroup, QuestionGroup, Question } from "@/lib/exam-api";
import { ApiError } from "@/lib/api-client";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

export default function EditQuestionGroupPage() {
  const { examId, partId, groupId } = useParams<{ examId: string; partId: string; groupId: string }>();
  const router = useRouter();

  const [group, setGroup] = useState<QuestionGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Question Form State
  const [qContent, setQContent] = useState("");
  const [qExplanation, setQExplanation] = useState("");
  const [qScore, setQScore] = useState(1);
  const [qOrder, setQOrder] = useState(1);
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctKey, setCorrectKey] = useState("A");
  const [creatingQ, setCreatingQ] = useState(false);
  const [qError, setQError] = useState<string | null>(null);

  const fetchGroup = async () => {
    if (!groupId) return;
    try {
      const res = await getQuestionGroup(groupId);
      setGroup(res.data);
      setQOrder((res.data.questions?.length ?? 0) + 1);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Failed to load question group details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroup();
  }, [groupId]);

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupId) return;

    if (correctKey === "D" && optionD === "") {
      setQError("Option D cannot be the correct answer if it is left empty.");
      return;
    }

    setCreatingQ(true);
    setQError(null);

    try {
      const builtOptions: Record<string, string> = { A: optionA, B: optionB, C: optionC };
      if (optionD !== "") builtOptions.D = optionD;

      await createQuestionInGroup(groupId, {
        content: qContent,
        explanation: qExplanation || undefined,
        options: builtOptions,
        correctOption: { key: correctKey },
        score: qScore,
        questionOrder: qOrder,
      });

      // Clear fields
      setQContent("");
      setQExplanation("");
      setOptionA("");
      setOptionB("");
      setOptionC("");
      setOptionD("");

      await fetchGroup();
    } catch (err) {
      if (err instanceof ApiError) setQError(err.message);
      else setQError("Failed to add question.");
    } finally {
      setCreatingQ(false);
    }
  };

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

  if (!group) return null;

  const sortedQuestions = [...(group.questions || [])].sort((a, b) => a.questionOrder - b.questionOrder);

  return (
    <div className="page-container" style={{ padding: "40px 24px", maxWidth: 1080 }}>
      {/* Breadcrumbs */}
      <div style={{ display: "flex", gap: 8, fontSize: 13, color: "var(--text-secondary)", marginBottom: 24 }}>
        <Link href="/dashboard" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Dashboard</Link>
        <span>/</span>
        <Link href={`/edit-exam/${examId}`} style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Edit Exam</Link>
        <span>/</span>
        <Link href={`/edit-exam/${examId}/structure`} style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Structure</Link>
        <span>/</span>
        <Link href={`/edit-exam/${examId}/parts/${partId}`} style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Part</Link>
        <span>/</span>
        <span style={{ color: "#fff" }}>Group #{group.groupOrder}</span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 8px" }}>
            🏗 Question Group #{group.groupOrder}
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: 0 }}>
            Configure the questions and upload optional media/audio resources.
          </p>
        </div>
        <Link href={`/question-group/${groupId}/upload-audio`} className="btn btn-ghost">
          🎧 Upload Audio
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 32, alignItems: "flex-start" }}>
        {/* Left column: Passage Preview & Questions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Passage Preview */}
          <div className="card">
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 12px" }}>Passage Content / Context</h2>
            <div style={{ background: "rgba(255,255,255,0.02)", padding: 16, borderRadius: 8, fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
              {group.content ? <ReactMarkdown>{group.content}</ReactMarkdown> : "(No context content provided)"}
            </div>
            {group.audioUrl && group.audioUrl !== "null" && (
              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)" }}>Active Audio File:</span>
                <audio src={group.audioUrl} controls style={{ width: "100%" }} />
              </div>
            )}
          </div>

          {/* Existing Questions List */}
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 16px" }}>Questions ({group.questions?.length ?? 0})</h2>

            {sortedQuestions.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
                No questions inside this group yet. Use the panel on the right to add some.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }} className="fade-up">
                {sortedQuestions.map((q) => (
                  <div key={q.id} className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={qNumBadge}>{q.questionOrder}</span>
                        <span className="badge badge-gray" style={{ fontSize: 10 }}>{q.type}</span>
                        <span className="badge badge-purple" style={{ fontSize: 10 }}>{q.score} pts</span>
                      </div>
                      <Link href={`/edit-question/${q.id}`} className="btn btn-ghost btn-sm">
                        ✏️ Edit
                      </Link>
                    </div>

                    <p style={{ fontSize: 15, fontWeight: 500, margin: 0 }}>{q.content}</p>

                    {q.options && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
                        {Object.entries(q.options).map(([key, val]) => (
                          <div
                            key={key}
                            style={{
                              padding: "8px 12px",
                              borderRadius: 6,
                              background: "rgba(255,255,255,0.02)",
                              border: `1px solid ${q.correctOption?.key === key ? "var(--success)" : "var(--border)"}`,
                              fontSize: 13,
                              color: q.correctOption?.key === key ? "#fff" : "var(--text-secondary)",
                            }}
                          >
                            <strong>{key}:</strong> {val}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Create Question Form */}
        <div className="card">
          <h2 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 16px" }}>➕ Add Multiple Choice Question</h2>
          <form onSubmit={handleCreateQuestion} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="field">
              <label htmlFor="qOrder">Question Order</label>
              <input
                id="qOrder"
                type="number"
                required
                min={1}
                className="input"
                value={qOrder}
                onChange={(e) => setQOrder(Number(e.target.value))}
              />
            </div>

            <div className="field">
              <label htmlFor="qContent">Question Text</label>
              <input
                id="qContent"
                type="text"
                required
                className="input"
                placeholder="e.g. What is the speaker's main concern?"
                value={qContent}
                onChange={(e) => setQContent(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Options</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {["A", "B", "C", "D"].map((key) => {
                  const val = key === "A" ? optionA : key === "B" ? optionB : key === "C" ? optionC : optionD;
                  const setVal = key === "A" ? setOptionA : key === "B" ? setOptionB : key === "C" ? setOptionC : setOptionD;
                  return (
                    <div key={key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", width: 16 }}>{key}</span>
                      <input
                        type="text"
                        required={key !== "D"}
                        className="input"
                        placeholder={key === "D" ? `Option D (leave empty for 3 options)` : `Option ${key} text`}
                        value={val}
                        onChange={(e) => setVal(e.target.value)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="field">
                <label htmlFor="correctKey">Correct Option</label>
                <select id="correctKey" className="input" value={correctKey} onChange={(e) => setCorrectKey(e.target.value)}>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>

              <div className="field">
                <label htmlFor="qScore">Score Points</label>
                <input
                  id="qScore"
                  type="number"
                  required
                  min={1}
                  className="input"
                  value={qScore}
                  onChange={(e) => setQScore(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="qEx">Explanation (optional)</label>
              <textarea
                id="qEx"
                className="input"
                rows={2}
                placeholder="Why is this option correct?"
                value={qExplanation}
                onChange={(e) => setQExplanation(e.target.value)}
              />
            </div>

            {qError && <div className="alert alert-error">{qError}</div>}

            <button type="submit" disabled={creatingQ} className="btn btn-primary btn-sm">
              {creatingQ ? "Adding..." : "Add Question"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const qNumBadge: React.CSSProperties = {
  width: 22,
  height: 22,
  borderRadius: "50%",
  background: "var(--border-strong)",
  display: "grid",
  placeItems: "center",
  fontSize: 11,
  fontWeight: 700,
  color: "#fff",
};
