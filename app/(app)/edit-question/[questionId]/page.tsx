"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getQuestionById, updateQuestion, uploadQuestionAudio, uploadQuestionImage, Question } from "@/lib/exam-api";
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

  // Media States
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [mediaSuccess, setMediaSuccess] = useState<string | null>(null);

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

    if (correctKey === "D" && optionD === "") {
      setError("Option D cannot be the correct answer if it is left empty.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const builtOptions: Record<string, string> = { A: optionA, B: optionB, C: optionC };
      if (optionD !== "") builtOptions.D = optionD;

      const res = await updateQuestion(questionId, {
        content: qContent,
        explanation: qExplanation || undefined,
        options: builtOptions,
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

  const handleAudioUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionId || !audioFile) return;
    setUploadingAudio(true);
    setMediaError(null);
    setMediaSuccess(null);

    try {
      const res = await uploadQuestionAudio(questionId, audioFile);
      setMediaSuccess(res.message);
      setAudioFile(null);
      if (question) setQuestion({ ...question, audioUrl: res.data });
      setTimeout(() => setMediaSuccess(null), 3000);
    } catch (err) {
      if (err instanceof ApiError) setMediaError(err.message);
      else setMediaError("Failed to upload audio.");
    } finally {
      setUploadingAudio(false);
    }
  };

  const handleImageUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionId || !imageFile) return;
    setUploadingImage(true);
    setMediaError(null);
    setMediaSuccess(null);

    try {
      const res = await uploadQuestionImage(questionId, imageFile);
      setMediaSuccess(res.message);
      setImageFile(null);
      if (question) setQuestion({ ...question, imageUrl: res.data });
      setTimeout(() => setMediaSuccess(null), 3000);
    } catch (err) {
      if (err instanceof ApiError) setMediaError(err.message);
      else setMediaError("Failed to upload image.");
    } finally {
      setUploadingImage(false);
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
                      required={key !== "D"}
                      className="input"
                      placeholder={key === "D" ? `Option D (leave empty for 3 options)` : `Option ${key} text`}
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

      {/* Media Uploads Section */}
      <div className="card fade-up" style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 16px" }}>Media Uploads</h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Audio Upload */}
          <div style={{ padding: 16, borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 12px" }}>🎧 Audio</h3>
            {question.audioUrl && question.audioUrl !== "null" && (
              <div style={{ marginBottom: 12 }}>
                <audio src={question.audioUrl} controls style={{ width: "100%" }} key={question.audioUrl} />
                <div style={{ fontSize: 12, color: "var(--success)", wordBreak: "break-all", marginTop: 4 }}>
                  URL: <a href={question.audioUrl} target="_blank" rel="noreferrer" style={{ color: "#a5b4fc" }}>{question.audioUrl}</a>
                </div>
              </div>
            )}
            <form onSubmit={handleAudioUpload} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                type="file"
                accept="audio/*"
                required
                onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                style={{ fontSize: 13, color: "var(--text-secondary)" }}
              />
              <button type="submit" disabled={uploadingAudio || !audioFile} className="btn btn-primary btn-sm">
                {uploadingAudio ? "Uploading..." : "Upload Audio"}
              </button>
            </form>
          </div>

          {/* Image Upload */}
          <div style={{ padding: 16, borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 12px" }}>🖼️ Image</h3>
            {question.imageUrl && question.imageUrl !== "null" && (
              <div style={{ marginBottom: 12 }}>
                <img src={question.imageUrl} alt="Question Image" style={{ width: "100%", borderRadius: 8, objectFit: "contain", maxHeight: 150 }} />
                <div style={{ fontSize: 12, color: "var(--success)", wordBreak: "break-all", marginTop: 4 }}>
                  URL: <a href={question.imageUrl} target="_blank" rel="noreferrer" style={{ color: "#a5b4fc" }}>{question.imageUrl}</a>
                </div>
              </div>
            )}
            <form onSubmit={handleImageUpload} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                type="file"
                accept="image/*"
                required
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                style={{ fontSize: 13, color: "var(--text-secondary)" }}
              />
              <button type="submit" disabled={uploadingImage || !imageFile} className="btn btn-primary btn-sm">
                {uploadingImage ? "Uploading..." : "Upload Image"}
              </button>
            </form>
          </div>
        </div>
        
        {mediaError && <div className="alert alert-error" style={{ marginTop: 16 }}>{mediaError}</div>}
        {mediaSuccess && <div className="alert alert-success" style={{ marginTop: 16 }}>✅ {mediaSuccess}</div>}
      </div>
    </div>
  );
}
