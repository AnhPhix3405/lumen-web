"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getFullExam, createPart, FullExam, Part } from "@/lib/exam-api";
import { ApiError } from "@/lib/api-client";
import Link from "next/link";

export default function EditExamStructurePage() {
  const { examId } = useParams<{ examId: string }>();
  const router = useRouter();

  const [exam, setExam] = useState<FullExam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Part Form State
  const [partName, setPartName] = useState("");
  const [partType, setPartType] = useState("listening");
  const [partOrder, setPartOrder] = useState(1);
  const [instruction, setInstruction] = useState("");
  const [partScore, setPartScore] = useState(10);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchExam = async () => {
    if (!examId) return;
    try {
      const res = await getFullExam(examId);
      setExam(res.data);
      // Automatically increment part order based on existing parts length
      setPartOrder((res.data.parts?.length ?? 0) + 1);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Failed to load exam structure.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExam();
  }, [examId]);

  const handleCreatePart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examId) return;
    setCreating(true);
    setFormError(null);

    try {
      await createPart(examId, {
        name: partName,
        type: partType,
        partOrder,
        instruction,
        score: partScore,
      });
      // Reset form & reload data
      setPartName("");
      setInstruction("");
      await fetchExam();
    } catch (err) {
      if (err instanceof ApiError) setFormError(err.message);
      else setFormError("Failed to create part.");
    } finally {
      setCreating(false);
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

  if (!exam) return null;

  const sortedParts = [...(exam.parts || [])].sort((a, b) => a.partOrder - b.partOrder);

  return (
    <div className="page-container" style={{ padding: "40px 24px", maxWidth: 960 }}>
      {/* Breadcrumbs */}
      <div style={{ display: "flex", gap: 8, fontSize: 13, color: "var(--text-secondary)", marginBottom: 24 }}>
        <Link href="/dashboard" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Dashboard</Link>
        <span>/</span>
        <Link href={`/edit-exam/${examId}`} style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Edit Exam</Link>
        <span>/</span>
        <span style={{ color: "#fff" }}>Structure</span>
      </div>

      <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 24px" }}>
        🏗 Structure Manager: <span className="gradient-text">{exam.name}</span>
      </h1>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 16, borderBottom: "1px solid var(--border)", marginBottom: 32 }}>
        <Link href={`/edit-exam/${examId}`} style={tabStyle}>Overview & Config</Link>
        <Link href={`/edit-exam/${examId}/structure`} style={activeTabStyle}>Exam Structure</Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 32, alignItems: "flex-start" }}>
        {/* Parts list */}
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 16px" }}>Exam Parts ({exam.parts?.length ?? 0})</h2>

          {sortedParts.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "48px 20px", color: "var(--text-muted)" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🧱</div>
              <p style={{ margin: 0 }}>No parts created yet. Use the form to add Section 1.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }} className="fade-up">
              {sortedParts.map((part) => {
                const groupCount = part.questionGroups?.length ?? 0;
                const totalQs = part.questionGroups?.reduce((a, g) => a + (g.questions?.length ?? 0), 0) ?? 0;

                return (
                  <div key={part.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <span style={partNumStyle}>{part.partOrder}</span>
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{part.name}</h3>
                        <span className="badge badge-purple" style={{ fontSize: 10 }}>{part.type}</span>
                      </div>
                      <p style={{ margin: "0 0 0 34px", fontSize: 13, color: "var(--text-secondary)" }}>
                        {groupCount} groups • {totalQs} questions • {part.score} max score
                      </p>
                    </div>

                    <Link href={`/edit-exam/${examId}/parts/${part.id}`} className="btn btn-ghost btn-sm">
                      Configure Part →
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add Part Form */}
        <div className="card">
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 16px" }}>✨ Add Exam Part</h2>
          <form onSubmit={handleCreatePart} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="field">
              <label htmlFor="pName">Part Name</label>
              <input
                id="pName"
                type="text"
                required
                className="input"
                placeholder="e.g. Section 1, Part A"
                value={partName}
                onChange={(e) => setPartName(e.target.value)}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="field">
                <label htmlFor="pType">Type</label>
                <select id="pType" className="input" value={partType} onChange={(e) => setPartType(e.target.value)}>
                  <option value="listening">Listening</option>
                  <option value="reading">Reading</option>
                  <option value="writing">Writing</option>
                  <option value="speaking">Speaking</option>
                </select>
              </div>

              <div className="field">
                <label htmlFor="pOrder">Order</label>
                <input
                  id="pOrder"
                  type="number"
                  required
                  min={1}
                  className="input"
                  value={partOrder}
                  onChange={(e) => setPartOrder(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="pScore">Part Score limit</label>
              <input
                id="pScore"
                type="number"
                required
                min={1}
                className="input"
                value={partScore}
                onChange={(e) => setPartScore(Number(e.target.value))}
              />
            </div>

            <div className="field">
              <label htmlFor="pInstruct">Instructions</label>
              <textarea
                id="pInstruct"
                className="input"
                rows={3}
                placeholder="Instructions for this section..."
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
              />
            </div>

            {formError && <div className="alert alert-error">{formError}</div>}

            <button type="submit" disabled={creating} className="btn btn-primary" style={{ marginTop: 8 }}>
              {creating ? "Adding Part..." : "Add Part"}
            </button>
          </form>
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

const partNumStyle: React.CSSProperties = {
  width: 24,
  height: 24,
  borderRadius: 6,
  background: "rgba(255,255,255,0.08)",
  display: "grid",
  placeItems: "center",
  fontSize: 12,
  fontWeight: 700,
  color: "#fff",
};
