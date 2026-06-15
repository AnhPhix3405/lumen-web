"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getQuestionGroup, uploadGroupAudio, QuestionGroup } from "@/lib/exam-api";
import { ApiError } from "@/lib/api-client";

export default function UploadAudioPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const router = useRouter();

  const [group, setGroup] = useState<QuestionGroup | null>(null);
  const [loadingGroup, setLoadingGroup] = useState(true);
  const [userId, setUserId] = useState("12345678-1234-1234-1234-1234567890ab");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchGroupDetails = async () => {
    if (!groupId) return;
    try {
      setLoadingGroup(true);
      const res = await getQuestionGroup(groupId);
      setGroup(res.data);
    } catch (err) {
      console.error("Failed to load question group:", err);
    } finally {
      setLoadingGroup(false);
    }
  };

  useEffect(() => {
    fetchGroupDetails();
  }, [groupId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupId || !file) {
      setError("Please select an audio file first.");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await uploadGroupAudio(groupId, file, userId);
      setSuccessMsg(res.message);
      setFile(null); // Clear selected file
      
      // Update group details locally with the new audio URL
      if (group) {
        setGroup({
          ...group,
          audioUrl: res.data.audioUrl,
        });
      } else {
        await fetchGroupDetails();
      }
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Failed to upload audio file.");
    } finally {
      setUploading(false);
    }
  };

  if (loadingGroup) {
    return (
      <div style={{ display: "flex", justifyContent: "center", paddingTop: 120 }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="page-container" style={{ padding: "40px 24px", maxWidth: 600 }}>
      <button onClick={() => router.back()} className="btn btn-ghost btn-sm" style={{ marginBottom: 24 }}>
        ← Back to Group
      </button>

      <div className="card fade-up" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div>
          <div style={{ fontSize: 32, marginBottom: 14 }}>🎧</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px" }}>Question Group Audio</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: 0 }}>
            Manage the audio source file for Question Group #{group?.groupOrder || ""}
          </p>
        </div>

        {/* Display Current Audio File */}
        <div style={{ padding: 18, borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", marginTop: 0, marginBottom: 12 }}>
            Current Audio Player
          </h3>
          {group?.audioUrl ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <audio src={group.audioUrl} controls style={{ width: "100%" }} key={group.audioUrl} />
              <div style={{ fontSize: 12, color: "var(--success)", wordBreak: "break-all" }}>
                Active File URL: <a href={group.audioUrl} target="_blank" rel="noreferrer" style={{ color: "#a5b4fc", textDecoration: "underline" }}>{group.audioUrl}</a>
              </div>
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)", fontStyle: "italic" }}>
              No audio file uploaded for this group yet.
            </p>
          )}
        </div>

        {/* Upload Form */}
        <form onSubmit={handleUpload} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="field">
            <label htmlFor="userId">User ID (x-user-id Header)</label>
            <input
              id="userId"
              type="text"
              required
              className="input"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter User UUID"
            />
          </div>

          <div className="field">
            <label htmlFor="audioFile">Select New Audio File (MP3, WAV, etc.)</label>
            <input
              id="audioFile"
              type="file"
              accept="audio/*"
              required
              onChange={handleFileChange}
              style={{
                background: "rgba(255,255,255,0.02)",
                padding: 12,
                borderRadius: 8,
                border: "1px dashed var(--border)",
                color: "var(--text-secondary)",
                fontSize: 14,
                cursor: "pointer",
              }}
            />
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          {successMsg && (
            <div className="alert alert-success">
              ✅ {successMsg}
            </div>
          )}

          <button type="submit" disabled={uploading || !file} className="btn btn-primary">
            {uploading ? "Uploading File..." : "Upload & Update Audio"}
          </button>
        </form>
      </div>
    </div>
  );
}
