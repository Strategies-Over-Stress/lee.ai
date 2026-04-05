"use client";

import { useState, useEffect, useCallback } from "react";
import Markdown from "@/components/Markdown";

interface Draft {
  id: number;
  generator: string;
  title: string;
  content: string;
  status: string;
  created_at: string;
  scheduled_at: string | null;
  published_at: string | null;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  draft: { bg: "bg-amber/10", text: "text-amber" },
  approved: { bg: "bg-accent/10", text: "text-accent-bright" },
  rejected: { bg: "bg-rose/10", text: "text-rose" },
  published: { bg: "bg-emerald/10", text: "text-emerald" },
};

export default function QueuePage() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editTitle, setEditTitle] = useState("");

  const loadDrafts = useCallback(() => {
    const params = filter !== "all" ? `?status=${filter}` : "";
    fetch(`/api/drafts${params}`)
      .then((r) => r.json())
      .then((d) => setDrafts(d.drafts));
  }, [filter]);

  useEffect(() => {
    loadDrafts();
  }, [loadDrafts]);

  const updateStatus = async (id: number, status: string) => {
    await fetch("/api/drafts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    loadDrafts();
  };

  const saveEdit = async (id: number) => {
    await fetch("/api/drafts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, title: editTitle, content: editContent }),
    });
    setEditingId(null);
    loadDrafts();
  };

  const startEdit = (draft: Draft) => {
    setEditingId(draft.id);
    setEditTitle(draft.title);
    setEditContent(draft.content);
  };

  const filters = ["all", "draft", "approved", "published", "rejected"];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Content Queue</h1>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
              filter === f
                ? "bg-accent/10 text-accent-bright border border-accent/30"
                : "text-text-muted hover:text-text-secondary border border-transparent"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Draft list */}
      {drafts.length === 0 ? (
        <div className="text-center py-20 text-text-muted">
          No drafts yet. Go to Generate to create content.
        </div>
      ) : (
        <div className="space-y-4">
          {drafts.map((draft) => (
            <div
              key={draft.id}
              className="rounded-xl border border-surface-light bg-surface overflow-hidden"
            >
              {/* Header */}
              <div className="px-5 py-4 flex items-center justify-between border-b border-surface-light">
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[draft.status]?.bg} ${STATUS_COLORS[draft.status]?.text}`}
                  >
                    {draft.status}
                  </span>
                  <span className="text-xs text-text-muted capitalize">
                    {draft.generator.replace("_", " ")}
                  </span>
                  <span className="text-xs text-text-muted">
                    {draft.created_at}
                  </span>
                </div>
                <div className="flex gap-2">
                  {draft.status === "draft" && (
                    <>
                      <button
                        onClick={() => startEdit(draft)}
                        className="text-xs px-2 py-1 rounded bg-surface-light text-text-secondary hover:text-text-primary"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => updateStatus(draft.id, "approved")}
                        className="text-xs px-2 py-1 rounded bg-emerald/10 text-emerald hover:bg-emerald/20"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateStatus(draft.id, "rejected")}
                        className="text-xs px-2 py-1 rounded bg-rose/10 text-rose hover:bg-rose/20"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {draft.status === "approved" && (
                    <button
                      onClick={() => updateStatus(draft.id, "published")}
                      className="text-xs px-2 py-1 rounded bg-accent/10 text-accent-bright hover:bg-accent/20"
                    >
                      Mark Published
                    </button>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="px-5 py-4">
                {editingId === draft.id ? (
                  <div className="space-y-3">
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-surface-light bg-midnight text-text-primary text-sm"
                    />
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={12}
                      className="w-full px-3 py-2 rounded-lg border border-surface-light bg-midnight text-text-secondary text-sm font-mono leading-relaxed resize-y"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(draft.id)}
                        className="text-xs px-3 py-1.5 rounded bg-accent text-white hover:bg-accent-bright"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-xs px-3 py-1.5 rounded bg-surface-light text-text-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="max-h-[300px] overflow-y-auto">
                    <Markdown>{draft.content}</Markdown>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
