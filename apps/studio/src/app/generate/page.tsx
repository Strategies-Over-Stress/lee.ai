"use client";

import { useState, useEffect } from "react";
import Markdown from "@/components/Markdown";

interface Article {
  id: number;
  title: string;
  source_name: string;
  summary: string | null;
  word_count: number;
}

interface Generator {
  id: string;
  name: string;
  description: string;
}

interface Draft {
  id: number;
  title: string;
  content: string;
  generator: string;
}

interface Collection {
  id: number;
  name: string;
  article_count: number;
}

export default function GeneratePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [generators, setGenerators] = useState<Generator[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedArticles, setSelectedArticles] = useState<Set<number>>(new Set());
  const [selectedGenerator, setSelectedGenerator] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [articleSearch, setArticleSearch] = useState("");
  const [extraPrompt, setExtraPrompt] = useState("");
  const [activeCollection, setActiveCollection] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/articles")
      .then((r) => r.json())
      .then((d) => setArticles(d.articles));
    fetch("/api/generators")
      .then((r) => r.json())
      .then((d) => setGenerators(d.generators));
    fetch("/api/collections")
      .then((r) => r.json())
      .then((d) => setCollections(d.collections));
  }, []);

  const loadCollection = async (collectionId: number) => {
    setActiveCollection(collectionId);
    const res = await fetch(`/api/collections/${collectionId}`);
    const data = await res.json();
    setSelectedArticles(new Set(data.articleIds));
    setArticleSearch("");
  };

  const clearCollection = () => {
    setActiveCollection(null);
    setSelectedArticles(new Set());
  };

  const toggleArticle = (id: number) => {
    setSelectedArticles((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredArticles = articles.filter((a) => {
    if (!a.summary) return false;
    if (!articleSearch) return true;
    const q = articleSearch.toLowerCase();
    return (
      a.title.toLowerCase().includes(q) ||
      a.source_name.toLowerCase().includes(q) ||
      (a.summary && a.summary.toLowerCase().includes(q))
    );
  });

  const selectAll = () => {
    setSelectedArticles((prev) => {
      const next = new Set(prev);
      filteredArticles.forEach((a) => next.add(a.id));
      return next;
    });
  };

  const selectNone = () => {
    setSelectedArticles((prev) => {
      const next = new Set(prev);
      filteredArticles.forEach((a) => next.delete(a.id));
      return next;
    });
  };

  const generate = async () => {
    if (!selectedGenerator || selectedArticles.size === 0) return;

    setGenerating(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generatorId: selectedGenerator,
          articleIds: Array.from(selectedArticles),
          extraPrompt: extraPrompt || undefined,
          collectionId: activeCollection || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Generation failed");
      } else {
        setResult(data.draft);
      }
    } catch {
      setError("Network error");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Generate Content</h1>

      <div className="grid lg:grid-cols-[1fr,1fr] gap-8">
        {/* Left: Select generator + articles */}
        <div className="space-y-6">
          {/* Generator picker */}
          <div>
            <h2 className="text-sm font-medium text-text-secondary mb-3">
              Content Type
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {generators.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGenerator(g.id)}
                  className={`p-3 rounded-lg border text-left text-sm transition-colors ${
                    selectedGenerator === g.id
                      ? "border-accent/50 bg-accent/10 text-text-primary"
                      : "border-surface-light bg-surface text-text-secondary hover:border-accent/20"
                  }`}
                >
                  <div className="font-medium">{g.name}</div>
                  <div className="text-xs text-text-muted mt-0.5">
                    {g.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Collection picker */}
          {collections.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-text-secondary mb-2">
                Collections
              </h2>
              <div className="flex flex-wrap gap-2">
                {collections.map((c) => (
                  <button
                    key={c.id}
                    onClick={() =>
                      activeCollection === c.id
                        ? clearCollection()
                        : loadCollection(c.id)
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                      activeCollection === c.id
                        ? "bg-accent/20 text-accent-bright border border-accent/40"
                        : "bg-surface border border-surface-light text-text-secondary hover:border-accent/20"
                    }`}
                  >
                    {c.name}
                    <span className="ml-1.5 text-text-muted">
                      ({c.article_count})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Article picker */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-text-secondary">
                Source Articles ({selectedArticles.size} selected)
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="text-xs text-accent hover:text-accent-bright"
                >
                  all
                </button>
                <button
                  onClick={selectNone}
                  className="text-xs text-text-muted hover:text-text-primary"
                >
                  none
                </button>
              </div>
            </div>
            <input
              type="text"
              value={articleSearch}
              onChange={(e) => setArticleSearch(e.target.value)}
              placeholder="Search articles..."
              className="w-full px-3 py-2 mb-2 rounded-lg border border-surface-light bg-midnight text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent/50"
            />
            <div className="space-y-1 max-h-[400px] overflow-y-auto rounded-xl border border-surface-light p-2">
              {filteredArticles.map((article) => (
                <button
                  key={article.id}
                  onClick={() => toggleArticle(article.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedArticles.has(article.id)
                      ? "bg-accent/10 text-text-primary"
                      : "text-text-secondary hover:bg-surface-light"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center text-xs ${
                        selectedArticles.has(article.id)
                          ? "bg-accent border-accent text-white"
                          : "border-surface-light"
                      }`}
                    >
                      {selectedArticles.has(article.id) ? "✓" : ""}
                    </span>
                    <span className="truncate">{article.title}</span>
                  </div>
                  <div className="text-xs text-text-muted ml-6">
                    {article.source_name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Extra instructions */}
          <div>
            <h2 className="text-sm font-medium text-text-secondary mb-2">
              Additional Instructions <span className="text-text-muted">(optional)</span>
            </h2>
            <textarea
              value={extraPrompt}
              onChange={(e) => setExtraPrompt(e.target.value)}
              placeholder="e.g., Focus on the checkout optimization angle, mention the $0.79 CPA stat..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-surface-light bg-midnight text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent/50 resize-y"
            />
          </div>

          {/* Generate button */}
          <button
            onClick={generate}
            disabled={
              generating || !selectedGenerator || selectedArticles.size === 0
            }
            className="w-full py-3 rounded-xl bg-accent hover:bg-accent-bright disabled:opacity-40 disabled:hover:bg-accent font-medium transition-colors"
          >
            {generating ? "Generating..." : "Generate Draft"}
          </button>

          {error && (
            <div className="p-3 rounded-lg bg-rose/10 border border-rose/20 text-rose text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Right: Result preview */}
        <div>
          <h2 className="text-sm font-medium text-text-secondary mb-3">
            Preview
          </h2>
          <div className="rounded-xl border border-surface-light bg-surface p-6 min-h-[500px]">
            {result ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber/10 text-amber">
                    draft
                  </span>
                  <a
                    href="/queue"
                    className="text-xs text-accent hover:text-accent-bright"
                  >
                    View in queue &rarr;
                  </a>
                </div>
                <Markdown>{result.content}</Markdown>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-text-muted text-sm">
                Select a content type and articles, then generate.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
