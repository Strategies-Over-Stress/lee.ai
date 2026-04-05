import { getStats } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function Home() {
  const stats = getStats();

  const cards = [
    { label: "Articles", value: stats.articles, sub: `${stats.summarized} summarized`, href: "/research", color: "text-accent-bright" },
    { label: "Drafts", value: stats.drafts, sub: `${stats.approved} approved`, href: "/queue", color: "text-amber" },
    { label: "Published", value: stats.published, sub: "all time", href: "/queue?status=published", color: "text-emerald" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-3 gap-6 mb-12">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="p-6 rounded-xl border border-surface-light bg-surface hover:border-accent/30 transition-colors"
          >
            <div className={`text-3xl font-bold ${card.color}`}>
              {card.value}
            </div>
            <div className="text-sm text-text-primary mt-1">{card.label}</div>
            <div className="text-xs text-text-muted mt-0.5">{card.sub}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Link
          href="/generate"
          className="p-6 rounded-xl border border-accent/20 bg-accent/5 hover:border-accent/40 transition-colors"
        >
          <h2 className="font-bold text-lg mb-1">Generate Content</h2>
          <p className="text-sm text-text-secondary">
            Turn research into LinkedIn posts, blog articles, video scripts, and reports.
          </p>
        </Link>
        <Link
          href="/research"
          className="p-6 rounded-xl border border-surface-light bg-surface hover:border-accent/30 transition-colors"
        >
          <h2 className="font-bold text-lg mb-1">Browse Research</h2>
          <p className="text-sm text-text-secondary">
            {stats.articles} articles from {stats.summarized} summarized sources.
          </p>
        </Link>
      </div>
    </div>
  );
}
