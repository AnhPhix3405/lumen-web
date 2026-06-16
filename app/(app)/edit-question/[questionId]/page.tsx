"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getQuestionById, updateQuestion, Question } from "@/lib/exam-api";
import { ApiError } from "@/lib/api-client";
import Link from "next/link";

export default function EditQuestionPage() {
  const { questionId } = useParams<{ questionId: string }>();
  const router = useRouter();

  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [qContent, setQContent] = useState("");
  const [qExplanation, setQExplanation] = useState("");
  const [qScore, setQScore] = useState(1);
  const [qOrder, setQOrder] = useState(1);
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctKey, setCorrectKey] = useState("A");

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!questionId) return;
    getQuestionById(questionId)
      .then((res) => {
        const q = res.data;
        setQuestion(q);
        setQContent(q.content || "");
        setQExplanation(q.explanation || "");
        setQScore(q.score || 1);
        setQOrder(q.questionOrder || 1);
        if (q.options) {
          setOptionA(q.options.A || "");
          setOptionB(q.options.B || "");
          setOptionC(q.options.C || "");
          setOptionD(q.options.D || "");
        }
        if (q.correctOption?.key) {
          setCorrectKey(q.correctOption.key);
        }
      })
      .catch((err) => {
        if (err instanceof ApiError) setError(err.message);
        else setError("Failed to fetch question details.");
      })
      .finally(() => setLoading(false));
  }, [questionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionId) return;
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await updateQuestion(questionId, {
        content: qContent,
        explanation: qExplanation || undefined,
        options: {
          A: optionA,
          B: optionB,
          C: optionC,
          D: optionD,
        },
        correctOption: { key: correctKey },
        score: qScore,
        questionOrder: qOrder,
      });
      setSuccessMsg("Question updated successfully!");
      setQuestion(res.data);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Failed to update question.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", paddingTop: 120 }}>
      <div className="spinner" />
    </div>
  );

  if (error && !question) return (
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
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px" }}>Edit Question</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 13, margin: 0 }}>
              Type: <span className="badge badge-purple">{question.type}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
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
            <label htmlFor="qContent">Question Text</label>
            <input
              id="qContent"
              type="text"
              required
              className="input"
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
                const isCorrect = correctKey === key;
                return (
                  <div key={key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: isCorrect ? "var(--success)" : "var(--text-secondary)", width: 16 }}>{key}</span>
                    <input
                      type="text"
                      required
                      className="input"
                      placeholder={`Option ${key} text`}
                      value={val}
                      onChange={(e) => setVal(e.target.value)}
                      style={{ border: isCorrect ? "1px solid var(--success)" : undefined }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="field" style={{ maxWidth: 200 }}>
            <label htmlFor="correctKey">Correct Option</label>
            <select id="correctKey" className="input" value={correctKey} onChange={(e) => setCorrectKey(e.target.value)}>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="qEx">Explanation (optional)</label>
            <textarea
              id="qEx"
              className="input"
              rows={3}
              value={qExplanation}
              onChange={(e) => setQExplanation(e.target.value)}
            />
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {successMsg && <div className="alert alert-success">{successMsg}</div>}

          <button type="submit" disabled={saving} className="btn btn-primary" style={{ marginTop: 8 }}>
            {saving ? "Saving Changes..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
