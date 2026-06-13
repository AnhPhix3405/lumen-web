"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { uploadGroupAudio } from "@/lib/exam-api";
import { ApiError } from "@/lib/api-client";

export default function UploadAudioPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const router = useRouter();

  const [userId, setUserId] = useState("12345678-1234-1234-1234-1234567890ab");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

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

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await uploadGroupAudio(groupId, file, userId);
      setSuccessMsg(res.message);
      setUploadedUrl(res.data.audioUrl);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Failed to upload audio file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ padding: "40px 24px", maxWidth: 540 }}>
      <button onClick={() => router.back()} className="btn btn-ghost btn-sm" style={{ marginBottom: 24 }}>
        ← Back
      </button>

      <div className="card fade-up">
        <div style={{ fontSize: 32, marginBottom: 14 }}>🎧</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px" }}>Upload Question Group Audio</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 24 }}>
          Provide an MP3 or other audio file for this listening question group.
        </p>

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
            <label htmlFor="audioFile">Select Audio File (MP3, WAV, etc.)</label>
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
            <div className="alert alert-success" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span>✅ {successMsg}</span>
              {uploadedUrl && (
                <div style={{ fontSize: 12, wordBreak: "break-all" }}>
                  <strong>URL:</strong> <a href={uploadedUrl} target="_blank" rel="noreferrer" style={{ color: "#a5b4fc" }}>{uploadedUrl}</a>
                </div>
              )}
            </div>
          )}

          <button type="submit" disabled={loading || !file} className="btn btn-primary">
            {loading ? "Uploading File..." : "Start Upload"}
          </button>
        </form>
      </div>
    </div>
  );
}
