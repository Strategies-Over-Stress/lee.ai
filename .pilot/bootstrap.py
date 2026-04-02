#!/usr/bin/env python3
"""Bootstrap the Pilot system — review UI + slash commands.
Creates apps/pilot (Next.js) and .claude/commands/pilot*.md
"""
import os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

def write(rel_path, content):
    path = os.path.join(ROOT, rel_path)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        f.write(content)
    print(f"  [create] {rel_path}")

def edit_append(rel_path, line):
    path = os.path.join(ROOT, rel_path)
    if os.path.exists(path):
        with open(path) as f:
            existing = f.read()
        if line in existing:
            print(f"  [skip]   {rel_path} — already contains line")
            return
        with open(path, "a") as f:
            f.write(f"\n{line}\n")
        print(f"  [edit]   {rel_path}")
    else:
        with open(path, "w") as f:
            f.write(line + "\n")
        print(f"  [create] {rel_path}")

print("Pilot Bootstrap")
print("=" * 50)

# ─── Config files ───────────────────────────────────────────

write("apps/pilot/package.json", """{
  "name": "pilot",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3002",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^15",
    "react": "^19",
    "react-dom": "^19"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^22",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "^15",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
""")

write("apps/pilot/next.config.ts", """import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
};

export default nextConfig;
""")

write("apps/pilot/tsconfig.json", """{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
""")

write("apps/pilot/postcss.config.mjs", """const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
""")

# ─── Styles ─────────────────────────────────────────────────

write("apps/pilot/src/app/globals.css", """@import "tailwindcss";

@theme {
  --color-midnight: #0a0a0f;
  --color-surface: #111118;
  --color-surface-light: #1a1a24;
  --color-accent: #6366f1;
  --color-accent-bright: #818cf8;
  --color-text-primary: #f0f0f5;
  --color-text-secondary: #9ca3af;
  --color-text-muted: #6b7280;
  --color-emerald: #10b981;
  --color-amber: #f59e0b;
  --color-rose: #f43f5e;

  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
}

body {
  background: var(--color-midnight);
  color: var(--color-text-primary);
  font-family: var(--font-sans);
}

::selection {
  background: var(--color-accent);
  color: white;
}
""")

# ─── Session library ────────────────────────────────────────

write("apps/pilot/src/lib/sessions.ts", """import fs from "fs";
import path from "path";

const PILOT_DIR = path.resolve(process.cwd(), "..", "..", ".pilot", "sessions");

export interface Comment {
  id: string;
  text: string;
  created_at: string;
}

export interface Change {
  id: string;
  action: "create" | "edit" | "delete" | "run";
  path: string;
  summary: string;
  details?: string;
  code?: string;
  diff?: string;
  comments: Comment[];
}

export interface Session {
  id: string;
  goal: string;
  status: "awaiting_review" | "reviewing" | "approved" | "executing" | "done" | "failed";
  created_at: string;
  updated_at: string;
  changes: Change[];
  global_comments: Comment[];
  script: string;
  iteration: number;
  ticket?: string;
  summary?: string;
}

function ensureDir(): string {
  if (!fs.existsSync(PILOT_DIR)) {
    fs.mkdirSync(PILOT_DIR, { recursive: true });
  }
  return PILOT_DIR;
}

export function listSessions(): Session[] {
  const dir = ensureDir();
  const sessions: Session[] = [];
  for (const entry of fs.readdirSync(dir)) {
    const file = path.join(dir, entry, "session.json");
    if (fs.existsSync(file)) {
      try {
        sessions.push(JSON.parse(fs.readFileSync(file, "utf-8")));
      } catch { /* skip malformed */ }
    }
  }
  return sessions.sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function getSession(id: string): Session | null {
  const file = path.join(ensureDir(), id, "session.json");
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

export function saveSession(session: Session): void {
  session.updated_at = new Date().toISOString();
  const file = path.join(ensureDir(), session.id, "session.json");
  fs.writeFileSync(file, JSON.stringify(session, null, 2));
}

export function addComment(session: Session, changeId: string | null, text: string): Session {
  const comment: Comment = {
    id: "cmt-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
    text,
    created_at: new Date().toISOString(),
  };

  if (changeId) {
    const change = session.changes.find((c) => c.id === changeId);
    if (change) change.comments.push(comment);
  } else {
    session.global_comments.push(comment);
  }

  session.status = "reviewing";
  saveSession(session);
  return session;
}

export function deleteComment(session: Session, changeId: string | null, commentId: string): Session {
  if (changeId) {
    const change = session.changes.find((c) => c.id === changeId);
    if (change) change.comments = change.comments.filter((c) => c.id !== commentId);
  } else {
    session.global_comments = session.global_comments.filter((c) => c.id !== commentId);
  }

  const totalComments = session.changes.reduce((s, c) => s + c.comments.length, 0) + session.global_comments.length;
  if (totalComments === 0 && session.status === "reviewing") {
    session.status = "awaiting_review";
  }
  saveSession(session);
  return session;
}

export function getScript(id: string): string | null {
  const session = getSession(id);
  if (!session) return null;
  const file = path.join(ensureDir(), id, session.script);
  if (!fs.existsSync(file)) return null;
  return fs.readFileSync(file, "utf-8");
}
""")

# ─── Layout ─────────────────────────────────────────────────

write("apps/pilot/src/app/layout.tsx", """import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pilot - lee.ai",
  description: "Script review and approval system",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <div className="flex min-h-screen">
          <aside className="w-56 flex-shrink-0 border-r border-surface-light bg-surface p-4 flex flex-col gap-1">
            <Link href="/" className="text-lg font-bold text-accent-bright mb-6 px-3">
              pilot
            </Link>
            <Link
              href="/"
              className="px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-surface-light transition-colors"
            >
              Sessions
            </Link>
          </aside>
          <main className="flex-1 p-8 overflow-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
""")

# ─── Session list page ──────────────────────────────────────

write("apps/pilot/src/app/page.tsx", """import { listSessions } from "@/lib/sessions";
import Link from "next/link";

export const dynamic = "force-dynamic";

const statusColors: Record<string, string> = {
  awaiting_review: "text-amber bg-amber/10 border-amber/20",
  reviewing: "text-accent-bright bg-accent/10 border-accent/20",
  approved: "text-emerald bg-emerald/10 border-emerald/20",
  executing: "text-accent-bright bg-accent/10 border-accent/20",
  done: "text-emerald bg-emerald/10 border-emerald/20",
  failed: "text-rose bg-rose/10 border-rose/20",
};

export default function Home() {
  const sessions = listSessions();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Sessions</h1>
      <p className="text-sm text-text-muted mb-8">
        Review and approve build scripts before execution.
      </p>

      {sessions.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <p className="mb-2">No sessions yet.</p>
          <p className="text-sm">
            Run <code className="font-mono bg-surface px-2 py-1 rounded">/pilot &quot;your goal&quot;</code> in Claude Code to create one.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => {
            const totalComments =
              session.changes.reduce((sum, c) => sum + c.comments.length, 0) +
              session.global_comments.length;
            return (
              <Link
                key={session.id}
                href={"/session/" + session.id}
                className="block p-4 rounded-xl border border-surface-light bg-surface hover:border-accent/30 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{session.goal}</div>
                    <div className="text-sm text-text-muted mt-1">
                      {session.changes.length} change{session.changes.length !== 1 ? "s" : ""}
                      {totalComments > 0 &&
                        " \\u00b7 " + totalComments + " comment" + (totalComments !== 1 ? "s" : "")}
                      {session.ticket && " \\u00b7 " + session.ticket}
                      {" \\u00b7 iteration " + session.iteration}
                    </div>
                  </div>
                  <span
                    className={
                      "text-xs px-2 py-0.5 rounded border " +
                      (statusColors[session.status] || "text-text-muted")
                    }
                  >
                    {session.status.replace(/_/g, " ")}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
""")

# ─── Session review page ────────────────────────────────────

write("apps/pilot/src/app/session/[id]/page.tsx", """"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

interface Comment {
  id: string;
  text: string;
  created_at: string;
}

interface Change {
  id: string;
  action: "create" | "edit" | "delete" | "run";
  path: string;
  summary: string;
  details?: string;
  code?: string;
  diff?: string;
  comments: Comment[];
}

interface Session {
  id: string;
  goal: string;
  status: string;
  created_at: string;
  updated_at: string;
  changes: Change[];
  global_comments: Comment[];
  script: string;
  iteration: number;
  ticket?: string;
  summary?: string;
}

const actionColors: Record<string, string> = {
  create: "text-emerald bg-emerald/10 border-emerald/20",
  edit: "text-amber bg-amber/10 border-amber/20",
  delete: "text-rose bg-rose/10 border-rose/20",
  run: "text-accent-bright bg-accent/10 border-accent/20",
};

const statusColors: Record<string, string> = {
  awaiting_review: "text-amber bg-amber/10 border-amber/20",
  reviewing: "text-accent-bright bg-accent/10 border-accent/20",
  approved: "text-emerald bg-emerald/10 border-emerald/20",
  executing: "text-accent-bright bg-accent/10 border-accent/20",
  done: "text-emerald bg-emerald/10 border-emerald/20",
  failed: "text-rose bg-rose/10 border-rose/20",
};

export default function SessionReview() {
  const params = useParams();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [globalComment, setGlobalComment] = useState("");
  const [scriptContent, setScriptContent] = useState<string | null>(null);
  const [showScript, setShowScript] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchSession = useCallback(async () => {
    const res = await fetch("/api/sessions/" + params.id);
    if (res.ok) setSession(await res.json());
    setLoading(false);
  }, [params.id]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const postComment = async (changeId: string | null) => {
    const text = changeId ? commentInputs[changeId] : globalComment;
    if (!text?.trim()) return;
    await fetch("/api/sessions/" + params.id + "/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ changeId, text: text.trim() }),
    });
    if (changeId) setCommentInputs((p) => ({ ...p, [changeId]: "" }));
    else setGlobalComment("");
    fetchSession();
  };

  const removeComment = async (changeId: string | null, commentId: string) => {
    await fetch("/api/sessions/" + params.id + "/comments", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ changeId, commentId }),
    });
    fetchSession();
  };

  const approve = async () => {
    await fetch("/api/sessions/" + params.id + "/approve", { method: "POST" });
    fetchSession();
  };

  const toggleScript = async () => {
    if (!showScript && scriptContent === null) {
      const res = await fetch("/api/sessions/" + params.id + "/script");
      if (res.ok) {
        const data = await res.json();
        setScriptContent(data.content);
      }
    }
    setShowScript((p) => !p);
  };

  if (loading) return <div className="text-text-muted">Loading...</div>;
  if (!session) return <div className="text-rose">Session not found</div>;

  const totalComments =
    session.changes.reduce((s, c) => s + c.comments.length, 0) +
    session.global_comments.length;

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push("/")}
          className="text-sm text-text-muted hover:text-text-secondary mb-4 block"
        >
          &larr; All sessions
        </button>
        <h1 className="text-2xl font-bold mb-2">{session.goal}</h1>
        <div className="flex items-center gap-3 text-sm flex-wrap">
          <span
            className={
              "text-xs px-2 py-0.5 rounded border " +
              (statusColors[session.status] || "text-text-muted")
            }
          >
            {session.status.replace(/_/g, " ")}
          </span>
          <span className="text-text-muted">
            Iteration {session.iteration} &middot; {session.changes.length} changes &middot;{" "}
            {totalComments} comments
          </span>
          {session.ticket && (
            <span className="text-accent-bright font-mono text-xs">{session.ticket}</span>
          )}
          <button
            onClick={toggleScript}
            className="ml-auto text-xs text-text-muted hover:text-text-secondary border border-surface-light rounded px-2 py-1"
          >
            {showScript ? "Hide script" : "View script"}
          </button>
        </div>
      </div>

      {/* Script viewer */}
      {showScript && (
        <div className="mb-8 border border-surface-light rounded-xl bg-surface overflow-hidden">
          <div className="px-4 py-2 border-b border-surface-light text-xs text-text-muted font-mono">
            {session.script}
          </div>
          <pre className="p-4 text-xs font-mono text-text-secondary overflow-x-auto max-h-[32rem]">
            <code>{scriptContent || "Loading..."}</code>
          </pre>
        </div>
      )}

      {/* Changes */}
      <div className="space-y-4 mb-8">
        {session.changes.map((change) => (
          <div
            key={change.id}
            className="border border-surface-light rounded-xl bg-surface overflow-hidden"
          >
            {/* Change header — clickable */}
            <div
              className="p-4 cursor-pointer hover:bg-surface-light/50 transition-colors"
              onClick={() => toggleExpand(change.id)}
            >
              <div className="flex items-start gap-3">
                <span
                  className={
                    "text-xs px-2 py-0.5 rounded border font-mono flex-shrink-0 " +
                    (actionColors[change.action] || "")
                  }
                >
                  {change.action}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-sm text-text-primary truncate">
                    {change.path}
                  </div>
                  <div className="text-sm text-text-secondary mt-1">{change.summary}</div>
                </div>
                <div className="flex items-center gap-2 text-text-muted text-xs flex-shrink-0">
                  {change.comments.length > 0 && (
                    <span className="text-accent-bright">
                      {change.comments.length} comment{change.comments.length !== 1 ? "s" : ""}
                    </span>
                  )}
                  <span
                    className={
                      "transition-transform inline-block " +
                      (expanded.has(change.id) ? "rotate-90" : "")
                    }
                  >
                    &#9654;
                  </span>
                </div>
              </div>
            </div>

            {/* Expanded content */}
            {expanded.has(change.id) && (
              <div className="border-t border-surface-light">
                {change.details && (
                  <div className="px-4 py-3 text-sm text-text-secondary border-b border-surface-light">
                    {change.details}
                  </div>
                )}

                {(change.code || change.diff) && (
                  <div className="border-b border-surface-light">
                    <pre className="p-4 text-xs font-mono text-text-secondary overflow-x-auto max-h-96">
                      <code>{change.code || change.diff}</code>
                    </pre>
                  </div>
                )}

                {/* Comments on this change */}
                <div className="p-4 space-y-3">
                  {change.comments.map((cmt) => (
                    <div key={cmt.id} className="flex items-start gap-2 text-sm group">
                      <span className="text-accent-bright mt-0.5 flex-shrink-0 font-mono text-xs">
                        //
                      </span>
                      <span className="flex-1 text-text-primary">{cmt.text}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeComment(change.id, cmt.id);
                        }}
                        className="text-text-muted hover:text-rose text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        remove
                      </button>
                    </div>
                  ))}

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a comment on this change..."
                      value={commentInputs[change.id] || ""}
                      onChange={(e) =>
                        setCommentInputs((p) => ({ ...p, [change.id]: e.target.value }))
                      }
                      onKeyDown={(e) => e.key === "Enter" && postComment(change.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 bg-midnight border border-surface-light rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        postComment(change.id);
                      }}
                      className="px-3 py-2 text-sm bg-surface-light hover:bg-accent/20 rounded-lg text-text-secondary hover:text-text-primary transition-colors"
                    >
                      Comment
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Global feedback */}
      <div className="border border-surface-light rounded-xl bg-surface p-4 mb-8">
        <h3 className="font-semibold text-sm mb-3">General Feedback</h3>

        {session.global_comments.map((cmt) => (
          <div key={cmt.id} className="flex items-start gap-2 text-sm mb-3 group">
            <span className="text-accent-bright mt-0.5 flex-shrink-0 font-mono text-xs">//</span>
            <span className="flex-1 text-text-primary">{cmt.text}</span>
            <button
              onClick={() => removeComment(null, cmt.id)}
              className="text-text-muted hover:text-rose text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            >
              remove
            </button>
          </div>
        ))}

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="General feedback for this session..."
            value={globalComment}
            onChange={(e) => setGlobalComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && postComment(null)}
            className="flex-1 bg-midnight border border-surface-light rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50"
          />
          <button
            onClick={() => postComment(null)}
            className="px-3 py-2 text-sm bg-surface-light hover:bg-accent/20 rounded-lg text-text-secondary hover:text-text-primary transition-colors"
          >
            Comment
          </button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-4 pb-8">
        {session.status === "approved" ? (
          <div className="flex items-center gap-2 text-emerald text-sm">
            <span>Approved</span> &mdash; run{" "}
            <code className="font-mono bg-surface px-2 py-0.5 rounded">/pilot-run</code> to
            execute
          </div>
        ) : session.status === "done" ? (
          <div className="text-emerald text-sm">Session complete.</div>
        ) : session.status === "failed" ? (
          <div className="text-rose text-sm">
            Execution failed. Run{" "}
            <code className="font-mono bg-surface px-2 py-0.5 rounded">/pilot-run</code> to
            review errors.
          </div>
        ) : (
          <>
            <button
              onClick={approve}
              className="px-6 py-2.5 bg-emerald hover:bg-emerald/90 text-white rounded-lg font-medium text-sm transition-colors"
            >
              Approve
            </button>
            {totalComments > 0 && (
              <span className="text-sm text-text-muted">
                {totalComments} comment{totalComments !== 1 ? "s" : ""} &mdash; run{" "}
                <code className="font-mono bg-surface px-2 py-0.5 rounded">/pilot-run</code> to
                iterate
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
""")

# ─── API routes ─────────────────────────────────────────────

write("apps/pilot/src/app/api/sessions/route.ts", """import { NextResponse } from "next/server";
import { listSessions } from "@/lib/sessions";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(listSessions());
}
""")

write("apps/pilot/src/app/api/sessions/[id]/route.ts", """import { NextResponse } from "next/server";
import { getSession } from "@/lib/sessions";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = getSession(id);
  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(session);
}
""")

write("apps/pilot/src/app/api/sessions/[id]/comments/route.ts", """import { NextResponse } from "next/server";
import { getSession, addComment, deleteComment } from "@/lib/sessions";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = getSession(id);
  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { changeId, text } = await req.json();
  const updated = addComment(session, changeId ?? null, text);
  return NextResponse.json(updated);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = getSession(id);
  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { changeId, commentId } = await req.json();
  const updated = deleteComment(session, changeId ?? null, commentId);
  return NextResponse.json(updated);
}
""")

write("apps/pilot/src/app/api/sessions/[id]/approve/route.ts", """import { NextResponse } from "next/server";
import { getSession, saveSession } from "@/lib/sessions";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = getSession(id);
  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });

  session.status = "approved";
  saveSession(session);
  return NextResponse.json(session);
}
""")

write("apps/pilot/src/app/api/sessions/[id]/script/route.ts", """import { NextResponse } from "next/server";
import { getScript } from "@/lib/sessions";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const content = getScript(id);
  if (content === null) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ content });
}
""")

# ─── Slash commands ─────────────────────────────────────────

write(".claude/commands/pilot.md", """You are acting as the Pilot system. Your job is to bundle ALL planned changes into a single executable Python script, rather than making changes directly. This lets the user review, comment, and iterate before anything touches the codebase.

## Your task

Given the user's goal below:

1. **Research** — Read relevant files, understand codebase context, identify what needs to change.
2. **Plan** — Determine exact changes: files to create, edit, delete, and commands to run.
3. **Script** — Write a self-contained Python build script that implements ALL changes.
4. **Preview** — Write a session.json describing each change for the review UI.

## Critical rules

- **NEVER modify project source files directly.** All changes go through the build script.
- You may only write files inside `.pilot/sessions/<id>/`.
- The build script must use only Python standard library.
- The build script must print what it does as it runs.
- The build script must be idempotent (safe to run twice).
- Include full file contents in the `code` field for new files, and unified diffs for edits.

## Session directory

Create `.pilot/sessions/<id>/` where `<id>` is: `YYYYMMDD-HHMMSS-<slugified-goal>`

Example: `20260401-143022-add-contact-form`

### session.json

```json
{
  "id": "<id>",
  "goal": "<user's goal>",
  "status": "awaiting_review",
  "created_at": "<ISO 8601>",
  "updated_at": "<ISO 8601>",
  "changes": [
    {
      "id": "c1",
      "action": "create | edit | delete | run",
      "path": "relative/path/from/project/root",
      "summary": "What this change accomplishes (1 line)",
      "details": "Longer explanation with reasoning (optional)",
      "code": "full file content for creates (or relevant code for edits)",
      "diff": "unified diff for edits (optional, alongside code)",
      "comments": []
    }
  ],
  "global_comments": [],
  "script": "build.py",
  "iteration": 1
}
```

### build.py

```python
#!/usr/bin/env python3
\"\"\"Pilot build script: <goal>
Generated: <timestamp>
Iteration: 1
\"\"\"
import os
import subprocess

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
os.chdir(PROJECT_ROOT)

def write_file(rel_path, content):
    path = os.path.join(PROJECT_ROOT, rel_path)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)
    print(f"  [create] {rel_path}")

def edit_file(rel_path, old, new):
    path = os.path.join(PROJECT_ROOT, rel_path)
    with open(path) as f:
        content = f.read()
    if old not in content:
        print(f"  [skip] {rel_path} -- pattern not found")
        return False
    content = content.replace(old, new, 1)
    with open(path, 'w') as f:
        f.write(content)
    print(f"  [edit] {rel_path}")
    return True

def delete_file(rel_path):
    path = os.path.join(PROJECT_ROOT, rel_path)
    if os.path.exists(path):
        os.remove(path)
        print(f"  [delete] {rel_path}")
    else:
        print(f"  [skip] {rel_path} -- not found")

def run(cmd):
    print(f"  [run] {cmd}")
    subprocess.run(cmd, shell=True, cwd=PROJECT_ROOT)

if __name__ == '__main__':
    print("Pilot: <goal>")
    print("=" * 50)
    # ... implement changes here ...
    print()
    print("Done.")
```

## After generating

Tell the user:
1. Brief summary of planned changes
2. To open http://localhost:3002/session/<id> to review and comment
3. To run `/pilot-run` after reviewing (iterates if comments exist, executes if approved)

## Jira ticket support

If the goal references a Jira ticket (e.g. "RICH-5"), read the ticket details with `sos-jira view` and include `"ticket": "RICH-5"` in session.json.

## Goal

$ARGUMENTS
""")

write(".claude/commands/pilot-run.md", """You are acting as the Pilot executor. Your job is to handle the next step of a pilot session based on its current status.

## Find the session

If an argument is provided, use it as the session ID. Otherwise, find the most recent session in `.pilot/sessions/` (sort directories by name descending, pick first).

Read the `session.json` from that directory.

## Handle based on status

### Status: `reviewing` (has comments)

The user added comments. You must:

1. Read ALL comments — both per-change (`changes[].comments`) and global (`global_comments`)
2. Read the current `build.py`
3. Re-research any files affected by the feedback
4. **Regenerate** `build.py` incorporating all feedback
5. Update `session.json`:
   - Revise the `changes` array to reflect the new plan
   - Increment `iteration`
   - Set `status` to `"awaiting_review"`
   - Clear all comments (they have been incorporated)
6. Tell the user to review the updated plan at the same URL

### Status: `approved`

Execute the build script:

1. Run: `python3 .pilot/sessions/<id>/build.py`
2. If it succeeds: set status to `"done"`, write a brief summary in `session.json`
3. If it fails: set status to `"failed"`, include the error output in the summary
4. Report what happened

### Status: `awaiting_review`

Tell the user: "Session is waiting for review. Open http://localhost:3002/session/<id> to review and comment, or approve."

### Status: `done`

Tell the user the session is already complete. Show the summary if available.

### Status: `failed`

Show the error. Ask if the user wants to iterate (you can fix the script based on the error).

## Jira integration

If the session has a `ticket` field:
- After successful execution, suggest running `sos-feature pr` to create a PR
- Remind the user to move the ticket to DONE after merge

$ARGUMENTS
""")

# ─── Gitignore ──────────────────────────────────────────────

edit_append(".gitignore", ".pilot/sessions/")

print()
print("=" * 50)
print("Bootstrap complete!")
print()
print("Next steps:")
print("  1. Run: cd apps/pilot && npm install")
print("  2. Run: npm run dev  (starts on port 3002)")
print("  3. Use: /pilot \"your goal\" in Claude Code")
print("  4. Review at: http://localhost:3002")
print("  5. Run: /pilot-run to iterate or execute")
