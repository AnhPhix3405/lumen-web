"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getPartDetails, createQuestionGroup, createStandaloneQuestion, Part, QuestionGroup, Question } from "@/lib/exam-api";
import { ApiError } from "@/lib/api-client";
import Link from "next/link";

export default function EditPartPage() {
  const { examId, partId } = useParams<{ examId: string; partId: string }>();
  const router = useRouter();

  const [part, setPart] = useState<Part | null>(null);
  const [standaloneQs, setStandaloneQs] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Group Form State
  const [groupOrder, setGroupOrder] = useState(1);
  const [groupContent, setGroupContent] = useState("");
  const [groupTranscript, setGroupTranscript] = useState("");
  const [groupType, setGroupType] = useState("single");
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [groupError, setGroupError] = useState<string | null>(null);

  // New Standalone Question Form State
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

  const fetchPart = async () => {
    if (!partId) return;
    try {
      const res = await getPartDetails(partId);
      setPart(res.data);
      // Automatically increment orders based on existing lengths
      setGroupOrder((res.data.questionGroups?.length ?? 0) + 1);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Failed to load part details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPart();
  }, [partId]);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partId) return;
    setCreatingGroup(true);
    setGroupError(null);

    try {
      await createQuestionGroup(partId, {
        groupOrder,
        content: groupContent,
        transcript: groupTranscript || undefined,
        type: groupType,
      });
      setGroupContent("");
      setGroupTranscript("");
      await fetchPart();
    } catch (err) {
      if (err instanceof ApiError) setGroupError(err.message);
      else setGroupError("Failed to create question group.");
    } finally {
      setCreatingGroup(false);
    }
  };

  const handleCreateStandaloneQ = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partId) return;
    setCreatingQ(true);
    setQError(null);

    try {
      await createStandaloneQuestion(partId, {
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
      setQContent("");
      setQExplanation("");
      setOptionA("");
      setOptionB("");
      setOptionC("");
      setOptionD("");
      await fetchPart();
    } catch (err) {
      if (err instanceof ApiError) setQError(err.message);
      else setQError("Failed to create question.");
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

  if (!part) return null;

  const sortedGroups = [...(part.questionGroups || [])].sort((a, b) => a.groupOrder - b.groupOrder);

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
        <span style={{ color: "#fff" }}>{part.name}</span>
      </div>

      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 8px" }}>
          ⚙️ Manage Part: <span className="gradient-text">{part.name}</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: 0 }}>
          Type: <span className="badge badge-purple" style={{ textTransform: "capitalize" }}>{part.type}</span> • Total Groups: {part.questionGroups?.length ?? 0}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 32, alignItems: "flex-start" }}>
        {/* Left Side: Existing Groups & Standalone Questions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Question Groups */}
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 16px" }}>Question Groups</h2>

            {sortedGroups.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: "32px 20px", color: "var(--text-muted)" }}>
                <p style={{ margin: 0 }}>No question groups inside this part yet.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {sortedGroups.map((group) => (
                  <div key={group.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <span style={orderBadge}>{group.groupOrder}</span>
                        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Group #{group.groupOrder}</h3>
                        <span className="badge badge-gray" style={{ fontSize: 10 }}>{group.type}</span>
                        {group.audioUrl && <span style={{ fontSize: 14 }}>🎧</span>}
                      </div>
                      <p style={{ margin: "0 0 0 34px", fontSize: 13, color: "var(--text-secondary)", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {group.content || "No text content."}
                      </p>
                    </div>

                    <Link href={`/edit-exam/${examId}/parts/${partId}/groups/${group.id}`} className="btn btn-ghost btn-sm">
                      Manage Group →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Create Forms */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Create Group Form */}
          <div className="card">
            <h2 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 14px" }}>➕ Create Question Group</h2>
            <form onSubmit={handleCreateGroup} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="field">
                  <label htmlFor="gOrder">Group Order</label>
                  <input
                    id="gOrder"
                    type="number"
                    required
                    min={1}
                    className="input"
                    value={groupOrder}
                    onChange={(e) => setGroupOrder(Number(e.target.value))}
                  />
                </div>
                <div className="field">
                  <label htmlFor="gType">Group Type</label>
                  <select id="gType" className="input" value={groupType} onChange={(e) => setGroupType(e.target.value)}>
                    <option value="single">Single</option>
                    <option value="multiple">Multiple</option>
                  </select>
                </div>
              </div>

              <div className="field">
                <label htmlFor="gContent">Passage / Description</label>
                <textarea
                  id="gContent"
                  required
                  className="input"
                  rows={4}
                  placeholder="Insert shared text or listening context description..."
                  value={groupContent}
                  onChange={(e) => setGroupContent(e.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="gTrans">Transcript (optional)</label>
                <textarea
                  id="gTrans"
                  className="input"
                  rows={3}
                  placeholder="Full transcript if this is a listening section..."
                  value={groupTranscript}
                  onChange={(e) => setGroupTranscript(e.target.value)}
                />
              </div>

              {groupError && <div className="alert alert-error">{groupError}</div>}

              <button type="submit" disabled={creatingGroup} className="btn btn-primary btn-sm">
                {creatingGroup ? "Creating Group..." : "Create Group"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

const orderBadge: React.CSSProperties = {
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
