"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createExam, listExamTypes, ExamType } from "@/lib/exam-api";
import { ApiError } from "@/lib/api-client";

export default function CreateExamPage() {
  const router = useRouter();

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listExamTypes()
      .then((res) => {
        setTypes(res.data);
        if (res.data.length > 0) {
          setExamTypeId(res.data[0].id);
        }
      })
      .catch((err) => {
        console.error("Failed to load exam types:", err);
      })
      .finally(() => {
        setLoadingTypes(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await createExam({
        name,
        description,
        durationMinutes,
        totalScore,
        visibility,
        thumbnailUrl: thumbnailUrl || undefined,
        examTypeId,
        isPublished,
      });
      // Redirect to edit structure of the new exam
      router.push(`/edit-exam/${res.data.id}/structure`);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Failed to create exam.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container" style={{ padding: "40px 24px", maxWidth: 600 }}>
      <button onClick={() => router.back()} className="btn btn-ghost btn-sm" style={{ marginBottom: 24 }}>
        ← Back
      </button>

      <div className="card fade-up">
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px" }}>Create New Exam</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 24 }}>
          Initialize a new practice exam. You can build the structure of parts, passages, and questions next.
        </p>

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
                {loadingTypes ? (
                  <option>Loading types...</option>
                ) : (
                  types.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))
                )}
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
              Publish immediately
            </label>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <button type="submit" disabled={saving} className="btn btn-primary" style={{ marginTop: 8 }}>
            {saving ? "Creating..." : "Create Exam & Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
