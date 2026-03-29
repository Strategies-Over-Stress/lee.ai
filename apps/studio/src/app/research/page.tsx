"use client";

import { useState, useEffect } from "react";
import Markdown from "@/components/Markdown";

interface Article {
  id: number;
  source_id: number;
  title: string;
  source_name: string;
  word_count: number;
  fetched_at: string;
  summary: string | null;
  url: string;
}

export default function ResearchPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [collectionName, setCollectionName] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const unfollowSource = async (sourceId: number, sourceName: string) => {
    await fetch("/api/sources", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: sourceId, status: "rejected" }),
    });
    setArticles((prev) => prev.filter((a) => a.source_id !== sourceId));
    setToast(`Unfollowed ${sourceName}`);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const params = search ? `?q=${encodeURIComponent(search)}` : "";
    fetch(`/api/articles${params}`)
      .then((r) => r.json())
      .then((d) => setArticles(d.articles));
  }, [search]);

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(articles.map((a) => a.id)));
  const selectNone = () => setSelected(new Set());

  const saveCollection = async () => {
    if (selected.size === 0 || !collectionName.trim()) return;
    setSaving(true);
    await fetch("/api/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: collectionName.trim(),
        articleIds: Array.from(selected),
      }),
    });
    setSaving(false);
    setToast(`Collection "${collectionName}" saved with ${selected.size} articles`);
    setSelected(new Set());
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Research</h1>
        <span className="text-sm text-text-muted">
          {articles.length} articles
        </span>
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search articles..."
        className="w-full px-4 py-3 rounded-xl border border-surface-light bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 mb-6"
      />

      {/* Selection toolbar */}
      {selected.size > 0 && (
        <div className="sticky top-0 z-10 mb-4 p-4 rounded-xl border border-accent/30 bg-surface flex items-center gap-4 backdrop-blur-sm">
          <span className="text-sm font-medium">
            {selected.size} selected
          </span>
          <input
            type="text"
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
            placeholder="Collection name..."
            className="flex-1 px-3 py-1.5 rounded-lg border border-surface-light bg-midnight text-text-primary text-sm focus:outline-none focus:border-accent/50"
          />
          <button
            onClick={saveCollection}
            disabled={saving}
            className="px-4 py-1.5 rounded-lg bg-accent hover:bg-accent-bright text-sm font-medium transition-colors disabled:opacity-40"
          >
            {saving ? "Saving..." : "Save Collection"}
          </button>
          <button
            onClick={selectNone}
            className="text-xs text-text-muted hover:text-text-primary"
          >
            Clear
          </button>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="mb-4 p-3 rounded-lg bg-emerald/10 border border-emerald/20 text-emerald text-sm">
          {toast}
        </div>
      )}

      {/* Bulk actions */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={selectAll}
          className="text-xs text-accent hover:text-accent-bright"
        >
          Select all
        </button>
        <button
          onClick={selectNone}
          className="text-xs text-text-muted hover:text-text-primary"
        >
          Select none
        </button>
      </div>

      {/* Article list */}
      <div className="space-y-3">
        {articles.map((article) => (
          <div
            key={article.id}
            className="rounded-xl border border-surface-light bg-surface overflow-hidden"
          >
            <div className="flex items-start gap-3 px-5 py-4">
              {/* Checkbox */}
              <button
                onClick={() => toggle(article.id)}
                className={`mt-0.5 w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center text-xs transition-colors ${
                  selected.has(article.id)
                    ? "bg-accent border-accent text-white"
                    : "border-surface-light hover:border-accent/50"
                }`}
              >
                {selected.has(article.id) ? "✓" : ""}
              </button>

              {/* Article content */}
              <details className="flex-1 min-w-0 group">
                <summary className="cursor-pointer hover:text-text-primary transition-colors flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {article.title}
                    </div>
                    <div className="text-xs text-text-muted mt-1">
                      {article.source_name} &middot; {article.word_count} words
                      &middot; {article.fetched_at}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {article.summary ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald/10 text-emerald">
                        summarized
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber/10 text-amber">
                        pending
                      </span>
                    )}
                  </div>
                </summary>
                <div className="pt-3 mt-3 border-t border-surface-light">
                  {article.summary ? (
                    <Markdown>{article.summary}</Markdown>
                  ) : (
                    <div className="text-sm text-text-muted italic">
                      No summary yet.
                    </div>
                  )}
                  <div className="flex items-center gap-4 mt-3">
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-accent hover:text-accent-bright"
                    >
                      View original &rarr;
                    </a>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        unfollowSource(article.source_id, article.source_name);
                      }}
                      className="text-xs text-text-muted hover:text-rose transition-colors"
                    >
                      Unfollow {article.source_name}
                    </button>
                  </div>
                </div>
              </details>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
