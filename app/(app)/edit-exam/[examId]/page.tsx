"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getFullExam, updateExam, listExamTypes, FullExam, ExamType } from "@/lib/exam-api";
import { ApiError } from "@/lib/api-client";
import Link from "next/link";

export default function EditExamSettingsPage() {
  const { examId } = useParams<{ examId: string }>();
  const router = useRouter();
  
  const [exam, setExam] = useState<FullExam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [totalScore, setTotalScore] = useState(40);
  const [visibility, setVisibility] = useState("public");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [examTypeId, setExamTypeId] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  const [types, setTypes] = useState<ExamType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    listExamTypes()
      .then((res) => {
        setTypes(res.data);
      })
      .catch((err) => {
        console.error("Failed to load exam types:", err);
      })
      .finally(() => {
        setLoadingTypes(false);
      });
  }, []);

  useEffect(() => {
    if (!examId) return;
    getFullExam(examId)
      .then((res) => {
        setExam(res.data);
        // Initialize form fields
        setName(res.data.name || "");
        setDescription(res.data.description || "");
        setDurationMinutes(res.data.durationMinutes || 30);
        setTotalScore(res.data.totalScore || 40);
        setVisibility(res.data.visibility || "public");
        setThumbnailUrl(res.data.thumbnailUrl || "");
        setExamTypeId(res.data.examType?.id || "");
        setIsPublished(res.data.isPublished || false);
      })
      .catch((err) => {
        if (err instanceof ApiError) setError(err.message);
        else setError("Failed to load exam details.");
      })
      .finally(() => setLoading(false));
  }, [examId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examId) return;
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await updateExam(examId, {
        name,
        description,
        durationMinutes,
        totalScore,
        visibility,
        thumbnailUrl: thumbnailUrl || undefined,
        examTypeId: examTypeId || undefined,
        isPublished,
      });
      setSuccessMsg("Exam updated successfully!");
      // Update local exam state slightly
      setExam(prev => prev ? { ...prev, ...res.data } : null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Failed to update exam.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", paddingTop: 120 }}>
      <div className="spinner" />
    </div>
  );

  if (error && !exam) return (
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

      {/* Edit Form */}
      <div className="card fade-up">
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 16px" }}>Update Exam Configuration</h2>
        
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="field">
            <label htmlFor="name">Exam Title</label>
            <input
              id="name"
              type="text"
              required
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. IELTS Academic Listening Practice Test 1"
            />
          </div>

          <div className="field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              className="input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context or instructions for candidates..."
              style={{ resize: "vertical" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="field">
              <label htmlFor="examType">Exam Type</label>
              <select
                id="examType"
                className="input"
                value={examTypeId}
                onChange={(e) => setExamTypeId(e.target.value)}
                disabled={loadingTypes}
              >
                <option value="">Select a type...</option>
                {types.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="visibility">Visibility</label>
              <select
                id="visibility"
                className="input"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="field">
              <label htmlFor="duration">Duration (minutes)</label>
              <input
                id="duration"
                type="number"
                required
                min={1}
                className="input"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
              />
            </div>

            <div className="field">
              <label htmlFor="totalScore">Total Score (points)</label>
              <input
                id="totalScore"
                type="number"
                required
                min={1}
                className="input"
                value={totalScore}
                onChange={(e) => setTotalScore(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="thumbnail">Thumbnail Image URL (optional)</label>
            <input
              id="thumbnail"
              type="url"
              className="input"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
            <input
              id="isPublished"
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              style={{ width: 18, height: 18, accentColor: "var(--accent)" }}
            />
            <label htmlFor="isPublished" style={{ fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
              Published (Visible to Takers)
            </label>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {successMsg && <div className="alert alert-success">{successMsg}</div>}

          <div style={{ display: "flex", gap: 12, marginTop: 16, borderTop: "1px solid var(--border)", paddingTop: 24 }}>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
            <Link href={`/edit-exam/${examId}/structure`} className="btn btn-ghost">
              🏗 Manage Exam Structure
            </Link>
          </div>
        </form>
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
