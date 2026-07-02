"use client";

import { useState } from "react";
import {
  Upload, FileText, CheckCircle, Loader2, Trash2, ExternalLink, AlertCircle
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";

type UploadStatus = "idle" | "uploading" | "extracting" | "done" | "error";

export function ResumeUpload({ initialUrl }: { initialUrl?: string }) {
  const router = useRouter();
  const setResumeText = useAppStore((s) => s.setResumeText);
  const [resumeUrl, setResumeUrl] = useState(initialUrl);
  const [status, setStatus] = useState<UploadStatus>(initialUrl ? "done" : "idle");
  const [statusMsg, setStatusMsg] = useState("");
  const [deleting, setDeleting] = useState(false);

  const getPublicId = (url: string) => {
    // Extract public_id from Cloudinary URL for deletion
    // e.g. https://res.cloudinary.com/xxx/raw/upload/v123/applyiq_resumes/filename.pdf
    const match = url.match(/\/(?:raw|image|video)\/upload\/(?:v\d+\/)?(.+)$/);
    return match ? match[1].replace(/\.[^.]+$/, "") : null; // strip extension
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large (max 5MB)");
      return;
    }

    // ── Step 1: Upload ──
    setStatus("uploading");
    setStatusMsg("Uploading to cloud...");

    const uploadForm = new FormData();
    uploadForm.append("file", file);

    let uploadedUrl = "";
    try {
      const res = await fetch("/api/resume/upload", { method: "POST", body: uploadForm });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      uploadedUrl = data.url;
      setResumeUrl(uploadedUrl);
    } catch {
      setStatus("error");
      setStatusMsg("Upload failed. Please try again.");
      toast.error("Failed to upload resume");
      return;
    }

    // ── Step 2: Extract text (PDF only) ──
    if (file.name.toLowerCase().endsWith(".pdf")) {
      setStatus("extracting");
      setStatusMsg("Extracting text for AI...");

      try {
        const parseForm = new FormData();
        parseForm.append("file", file);
        const parseRes = await fetch("/api/resume/parse", { method: "POST", body: parseForm });
        const parseData = await parseRes.json();

        if (parseRes.ok && parseData.text) {
          await fetch("/api/user/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ resumeText: parseData.text }),
          });
          // Fire & forget structurize (generates JSON for PDF export)
          fetch("/api/resume/structurize", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: parseData.text }),
          }).catch(err => console.error("Structurize error:", err));

          setResumeText(parseData.text);
          setStatus("done");
          setStatusMsg("Uploaded & AI text extracted");
          toast.success("Resume uploaded & text extracted!");
          router.refresh();
        } else {
          setStatus("done");
          setStatusMsg("Uploaded (paste resume text manually)");
          toast("Resume uploaded. Paste your resume text below for AI.", { icon: "ℹ️", duration: 5000 });
        }
      } catch {
        setStatus("done");
        setStatusMsg("Uploaded (text extraction failed)");
        toast.error("Text extraction failed — paste resume text manually.");
      }
    } else {
      setStatus("done");
      setStatusMsg("Uploaded successfully");
      toast.success("Resume uploaded successfully");
    }
  };

  const handleDelete = async () => {
    if (!resumeUrl) return;
    if (!confirm("Delete your uploaded resume? This will also clear your AI resume text.")) return;

    setDeleting(true);
    try {
      const publicId = getPublicId(resumeUrl);
      await fetch("/api/resume/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId }),
      });
      setResumeUrl(undefined);
      setStatus("idle");
      setStatusMsg("");
      setResumeText("");
      toast.success("Resume deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete resume");
    } finally {
      setDeleting(false);
    }
  };

  const isLoading = status === "uploading" || status === "extracting";

  return (
    <div className="space-y-3">
      {/* Drop zone / upload area */}
      <div
        className={`
          relative flex flex-col items-center justify-center gap-4 rounded-lg
          border-2 border-dashed p-8 text-center transition-all duration-200
          ${isLoading
            ? "border-primary/50 bg-primary/5"
            : status === "done"
            ? "border-emerald-500/40 bg-emerald-500/5"
            : status === "error"
            ? "border-red-500/40 bg-red-500/5"
            : "border-border-default bg-bg-subtle/30 hover:border-primary/40 hover:bg-primary/5 cursor-pointer"
          }
        `}
        onClick={() => !isLoading && document.getElementById("resume-upload")?.click()}
      >
        {/* Status icon */}
        <div className={`
          w-14 h-14 rounded-lg flex items-center justify-center border transition-all
          ${isLoading ? "bg-primary/10 border-primary/20 text-primary"
            : status === "done" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            : status === "error" ? "bg-red-500/10 border-red-500/20 text-red-400"
            : "bg-bg-surface-elevated border-border-default text-text-tertiary"}
        `}>
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : status === "done" ? (
            <CheckCircle className="w-6 h-6" />
          ) : status === "error" ? (
            <AlertCircle className="w-6 h-6" />
          ) : (
            <Upload className="w-6 h-6" />
          )}
        </div>

        {/* Status text */}
        <div className="space-y-1">
          {isLoading ? (
            <>
              <p className="font-semibold text-text-primary">
                {status === "uploading" ? "Uploading..." : "Extracting text..."}
              </p>
              <p className="text-xs text-text-tertiary">{statusMsg}</p>
              {/* Progress bar */}
              <div className="w-48 h-1.5 bg-border-subtle rounded-full overflow-hidden mx-auto mt-2">
                <div className={`h-full bg-primary rounded-full transition-all duration-500 ${status === "extracting" ? "w-3/4" : "w-1/3"} animate-pulse`} />
              </div>
            </>
          ) : status === "done" && resumeUrl ? (
            <>
              <p className="font-semibold text-text-primary">Resume Uploaded</p>
              <p className="text-xs text-emerald-400 font-medium">{statusMsg}</p>
              <p className="text-xs text-text-tertiary mt-1">Click to replace</p>
            </>
          ) : status === "error" ? (
            <>
              <p className="font-semibold text-red-400">Upload Failed</p>
              <p className="text-xs text-text-tertiary">{statusMsg}</p>
              <p className="text-xs text-text-tertiary">Click to try again</p>
            </>
          ) : (
            <>
              <p className="font-semibold text-text-primary">Upload your resume</p>
              <p className="text-xs text-text-tertiary">PDF or DOCX up to 5MB</p>
            </>
          )}
        </div>

        {/* Select button (idle only) */}
        {(status === "idle" || status === "error") && (
          <button
            type="button"
            className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-sm rounded-md transition-all shadow-sm"
            onClick={(e) => { e.stopPropagation(); document.getElementById("resume-upload")?.click(); }}
          >
            Select File
          </button>
        )}

        <input
          id="resume-upload"
          type="file"
          accept=".pdf,.docx,.doc"
          className="hidden"
          onChange={handleUpload}
          disabled={isLoading}
        />
      </div>

      {/* File actions bar — shown when a file is uploaded */}
      {status === "done" && resumeUrl && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-md border border-border-subtle bg-bg-surface">
          <FileText className="w-4 h-4 text-primary shrink-0" />
          <span className="text-xs text-text-secondary flex-1 truncate">
            {resumeUrl.split("/").pop() ?? "resume.pdf"}
          </span>
          <a
            href={resumeUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover transition-colors shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View
          </a>
          <div className="w-px h-4 bg-border-subtle mx-1" />
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1 text-xs font-semibold text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 shrink-0"
          >
            {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      )}
    </div>
  );
}
