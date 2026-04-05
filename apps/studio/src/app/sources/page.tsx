"use client";

import { useState, useEffect, useCallback } from "react";

interface Source {
  id: number;
  url: string;
  name: string;
  domain: string;
  status: string;
  added_at: string;
  last_synced_at: string | null;
  article_count: number;
}

const STATUS_CONFIG: Record<string, { icon: string; bg: string; text: string }> = {
  approved: { icon: "✓", bg: "bg-emerald/10", text: "text-emerald" },
  pending: { icon: "?", bg: "bg-amber/10", text: "text-amber" },
  rejected: { icon: "✕", bg: "bg-rose/10", text: "text-rose" },
};

export default function SourcesPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [filter, setFilter] = useState("all");
  const [newUrl, setNewUrl] = useState("");
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    const params = filter !== "all" ? `?status=${filter}` : "";
    fetch(`/api/sources${params}`)
      .then((r) => r.json())
      .then((d) => setSources(d.sources));
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const addNewSource = async () => {
    if (!newUrl.trim()) return;
    setAdding(true);
    setError(null);
    const res = await fetch("/api/sources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: newUrl.trim(), name: newName.trim() || undefined }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error);
    } else {
      setNewUrl("");
      setNewName("");
      load();
    }
    setAdding(false);
  };

  const updateStatus = async (id: number, status: string) => {
    await fetch("/api/sources", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    load();
  };

  const remove = async (id: number) => {
    await fetch("/api/sources", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  };

  const filters = ["all", "approved", "pending", "rejected"];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Sources</h1>

      {/* Add new source */}
      <div className="rounded-xl border border-surface-light bg-surface p-5 mb-8">
        <h2 className="text-sm font-medium text-text-secondary mb-3">
          Add Source
        </h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="https://example.com/blog"
            className="flex-1 px-3 py-2 rounded-lg border border-surface-light bg-midnight text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent/50"
            onKeyDown={(e) => e.key === "Enter" && addNewSource()}
          />
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Display name (optional)"
            className="w-48 px-3 py-2 rounded-lg border border-surface-light bg-midnight text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent/50"
            onKeyDown={(e) => e.key === "Enter" && addNewSource()}
          />
          <button
            onClick={addNewSource}
            disabled={adding || !newUrl.trim()}
            className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-bright text-sm font-medium transition-colors disabled:opacity-40"
          >
            {adding ? "Adding..." : "Add"}
          </button>
        </div>
        {error && (
          <div className="mt-2 text-xs text-rose">{error}</div>
        )}
      </div>

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
        <span className="ml-auto text-sm text-text-muted self-center">
          {sources.length} source{sources.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Source list */}
      <div className="space-y-2">
        {sources.map((source) => {
          const cfg = STATUS_CONFIG[source.status] || STATUS_CONFIG.pending;
          return (
            <div
              key={source.id}
              className="flex items-center gap-4 px-5 py-3 rounded-xl border border-surface-light bg-surface hover:border-accent/20 transition-colors"
            >
              {/* Status badge */}
              <span
                className={`w-7 h-7 rounded-lg ${cfg.bg} ${cfg.text} flex items-center justify-center text-xs font-bold flex-shrink-0`}
              >
                {cfg.icon}
              </span>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {source.name}
                </div>
                <div className="text-xs text-text-muted truncate">
                  {source.url}
                  {source.last_synced_at && (
                    <span> &middot; last sync: {source.last_synced_at}</span>
                  )}
                </div>
              </div>

              {/* Article count */}
              <span className="text-xs text-text-muted flex-shrink-0">
                {source.article_count} article{source.article_count !== 1 ? "s" : ""}
              </span>

              {/* Actions */}
              <div className="flex gap-1.5 flex-shrink-0">
                {source.status !== "approved" && (
                  <button
                    onClick={() => updateStatus(source.id, "approved")}
                    className="px-2.5 py-1 rounded-lg text-xs bg-emerald/10 text-emerald hover:bg-emerald/20 transition-colors"
                  >
                    Follow
                  </button>
                )}
                {source.status !== "rejected" && (
                  <button
                    onClick={() => updateStatus(source.id, "rejected")}
                    className="px-2.5 py-1 rounded-lg text-xs bg-rose/10 text-rose hover:bg-rose/20 transition-colors"
                  >
                    Unfollow
                  </button>
                )}
                <button
                  onClick={() => remove(source.id)}
                  className="px-2.5 py-1 rounded-lg text-xs bg-surface-light text-text-muted hover:text-rose transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
