"use client";

import Markdown from "./Markdown";

interface ArticleCardProps {
  id: number;
  title: string;
  source_name: string;
  word_count: number;
  fetched_at: string;
  summary: string | null;
  url: string;
}

export default function ArticleCard(article: ArticleCardProps) {
  return (
    <details className="group rounded-xl border border-surface-light bg-surface overflow-hidden">
      <summary className="px-5 py-4 cursor-pointer hover:bg-surface-light transition-colors flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{article.title}</div>
          <div className="text-xs text-text-muted mt-1">
            {article.source_name} &middot; {article.word_count} words &middot;{" "}
            {article.fetched_at}
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
          <span className="text-text-muted text-xs">#{article.id}</span>
        </div>
      </summary>
      <div className="px-5 py-4 border-t border-surface-light">
        {article.summary ? (
          <Markdown>{article.summary}</Markdown>
        ) : (
          <div className="text-sm text-text-muted italic">
            No summary yet. Run: python3 apps/research/research.py summarize
            --run
          </div>
        )}
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-3 text-xs text-accent hover:text-accent-bright"
        >
          View original &rarr;
        </a>
      </div>
    </details>
  );
}
