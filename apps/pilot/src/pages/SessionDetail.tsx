import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  SessionFull,
  getSession,
  getBuildScript,
  addComment,
  deleteComment,
  deleteChange,
  approveSession,
  iterateSession,
  updateSessionStatus,
  listSessionVersions,
  SessionVersion,
  onDataChanged,
} from "../lib/ipc";

// ─── Syntax Highlighting ────────────────────────────────────────────────────

const KW = /\b(import|export|from|const|let|var|function|async|await|return|if|else|class|interface|type|struct|fn|use|pub|mod|impl|enum|match|for|while|new|this|null|undefined|true|false|void|default|extends|implements|static|readonly|declare|as|in|of|typeof|instanceof|throw|try|catch|finally|break|continue|switch|case|yield|super)\b/;

function highlightCode(text: string): React.ReactNode[] {
  return text.split("\n").map((line, i) => (
    <div key={i}>{highlightLine(line) || "\n"}</div>
  ));
}

function highlightLine(line: string): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];
  const re = /(\/\/.*$|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|\b\d+\.?\d*\b)/g;
  let last = 0;
  let m;
  while ((m = re.exec(line)) !== null) {
    if (m.index > last) tokens.push(...highlightWords(line.slice(last, m.index)));
    const t = m[0];
    if (t.startsWith("//")) tokens.push(<span key={m.index} className="text-text-muted italic">{t}</span>);
    else if (t.startsWith('"') || t.startsWith("'") || t.startsWith("`")) tokens.push(<span key={m.index} className="text-emerald">{t}</span>);
    else tokens.push(<span key={m.index} className="text-amber">{t}</span>);
    last = m.index + t.length;
  }
  if (last < line.length) tokens.push(...highlightWords(line.slice(last)));
  return tokens;
}

function highlightWords(text: string): React.ReactNode[] {
  const parts = text.split(KW);
  return parts.map((part, i) =>
    KW.test(part)
      ? <span key={i} className="text-accent-bright">{part}</span>
      : <span key={i} className="text-text-secondary">{part}</span>
  );
}

function renderDiff(text: string): React.ReactNode[] {
  return text.split("\n").map((line, i) => {
    let cls = "text-text-secondary";
    if (line.startsWith("+++") || line.startsWith("---")) cls = "text-text-muted font-bold";
    else if (line.startsWith("+")) cls = "text-emerald";
    else if (line.startsWith("-")) cls = "text-rose";
    else if (line.startsWith("@@")) cls = "text-accent-bright";
    return <div key={i} className={cls}>{line || "\n"}</div>;
  });
}

// ─── Constants ──────────────────────────────────────────────────────────────

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
  iterating: "text-accent-bright bg-accent/10 border-accent/20",
  done: "text-emerald bg-emerald/10 border-emerald/20",
  deploy_queue: "text-accent-bright bg-accent/10 border-accent/20",
  deployed: "text-emerald bg-emerald/10 border-emerald/20",
  failed: "text-rose bg-rose/10 border-rose/20",
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function SessionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<SessionFull | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [globalComment, setGlobalComment] = useState("");
  const [scriptContent, setScriptContent] = useState<string | null>(null);
  const [showScript, setShowScript] = useState(false);
  const [showContext, setShowContext] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [versions, setVersions] = useState<SessionVersion[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchSession = useCallback(async () => {
    if (!id) return;
    try {
      const s = await getSession(id);
      setSession(s);
    } catch { /* ignore */ }
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchSession(); }, [fetchSession]);

  useEffect(() => {
    const unlisten = onDataChanged(() => fetchSession());
    return () => { unlisten.then((fn) => fn()); };
  }, [fetchSession]);

  const toggleExpand = (cid: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(cid)) next.delete(cid); else next.add(cid);
      return next;
    });
  };

  const postComment = async (changeId: string | null) => {
    if (!id) return;
    const text = changeId ? commentInputs[changeId] : globalComment;
    if (!text?.trim()) return;
    const updated = await addComment(id, changeId, text.trim());
    setSession(updated);
    if (changeId) setCommentInputs((p) => ({ ...p, [changeId]: "" }));
    else setGlobalComment("");
  };

  const removeComment = async (commentId: string) => {
    if (!id) return;
    const updated = await deleteComment(id, commentId);
    setSession(updated);
  };

  const approve = async () => {
    if (!id) return;
    try {
      const updated = await approveSession(id);
      setSession(updated);
    } catch (err) {
      console.error("Approve failed:", err);
    }
  };

  const toggleScript = async () => {
    if (!showScript && scriptContent === null && id) {
      try {
        const content = await getBuildScript(id);
        setScriptContent(content);
      } catch { /* ignore */ }
    }
    setShowScript((p) => !p);
  };

  const toggleHistory = async () => {
    if (!showHistory && id) {
      try {
        const v = await listSessionVersions(id);
        setVersions(v);
      } catch { /* ignore */ }
    }
    setShowHistory((p) => !p);
  };

  const toggleSelect = (cid: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(cid)) next.delete(cid); else next.add(cid);
      return next;
    });
  };

  const removeSelected = async () => {
    if (!id || !confirm("Remove " + selected.size + " step" + (selected.size !== 1 ? "s" : "") + "?")) return;
    let latest = session;
    for (const changeId of selected) {
      latest = await deleteChange(id, changeId);
    }
    setSession(latest);
    setSelected(new Set());
  };

  if (loading) return <div className="text-text-muted">Loading...</div>;
  if (!session) return <div className="text-rose">Session not found</div>;

  // Separate global and change-specific comments
  const globalComments = session.comments.filter((c) => !c.change_id);
  const changeComments = (changeId: string) => session.comments.filter((c) => c.change_id === changeId);
  const totalComments = session.comments.length;

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <button onClick={() => navigate("/")} className="text-sm text-text-muted hover:text-text-secondary mb-4 block cursor-pointer">
          &larr; All sessions
        </button>
        <h1 className="text-2xl font-bold mb-2">{session.goal}</h1>
        <div className="flex items-center gap-3 text-sm flex-wrap">
          <span className={"text-xs px-2 py-0.5 rounded border " + (statusColors[session.status] || "text-text-muted")}>
            {session.status.replace(/_/g, " ")}
          </span>
          <span className="text-text-muted">
            Iteration {session.iteration} &middot; {session.changes.length} changes &middot; {totalComments} comments
          </span>
          {session.parent_branch && (
            <span className="text-text-muted font-mono text-xs">{session.parent_branch}</span>
          )}
          <div className="ml-auto flex gap-2">
            {session.context && (
              <button onClick={() => setShowContext((p) => !p)} className="text-xs text-text-muted hover:text-text-secondary border border-surface-light rounded px-2 py-1 cursor-pointer">
                {showContext ? "Hide context" : "View context"}
              </button>
            )}
            <button onClick={toggleScript} className="text-xs text-text-muted hover:text-text-secondary border border-surface-light rounded px-2 py-1 cursor-pointer">
              {showScript ? "Hide script" : "View script"}
            </button>
            <button onClick={toggleHistory} className="text-xs text-text-muted hover:text-text-secondary border border-surface-light rounded px-2 py-1 cursor-pointer">
              {showHistory ? "Hide history" : "History"}
            </button>
          </div>
        </div>

        {/* Failure reason */}
        {session.failure_reason && (
          <div className="mt-3 p-3 rounded-lg bg-rose/10 border border-rose/20">
            <div className="text-xs text-rose font-semibold mb-1">Failure{session.failure_step ? ` at step ${session.failure_step}` : ""}</div>
            <div className="text-sm text-rose/80">{session.failure_reason}</div>
          </div>
        )}
      </div>

      {/* Context viewer */}
      {showContext && session.context && (
        <div className="mb-8 border border-surface-light rounded-xl bg-surface overflow-hidden">
          <div className="px-4 py-2 border-b border-surface-light text-xs text-text-muted font-mono">Session Context &amp; Research</div>
          <pre className="p-4 text-xs font-mono text-text-secondary overflow-x-auto max-h-[32rem] whitespace-pre-wrap">
            {session.context}
          </pre>
        </div>
      )}

      {/* Script viewer */}
      {showScript && (
        <div className="mb-8 border border-surface-light rounded-xl bg-surface overflow-hidden">
          <div className="px-4 py-2 border-b border-surface-light text-xs text-text-muted font-mono">build.py</div>
          <pre className="p-4 text-xs font-mono text-text-secondary overflow-x-auto max-h-[32rem]">
            <code>{scriptContent ? highlightCode(scriptContent) : "Loading..."}</code>
          </pre>
        </div>
      )}

      {/* Version history */}
      {showHistory && (
        <div className="mb-8 border border-surface-light rounded-xl bg-surface overflow-hidden">
          <div className="px-4 py-2 border-b border-surface-light text-xs text-text-muted font-mono">Version History</div>
          <div className="p-4 space-y-2">
            {versions.length === 0 ? (
              <div className="text-sm text-text-muted">No version history yet.</div>
            ) : versions.map((v) => (
              <div key={v.id} className="flex items-center gap-3 text-sm">
                <span className="font-mono text-text-muted text-xs">v{v.iteration}</span>
                <span className={"text-xs px-2 py-0.5 rounded border " + (statusColors[v.status] || "text-text-muted")}>
                  {v.status.replace(/_/g, " ")}
                </span>
                <span className="text-text-muted text-xs">{new Date(v.created_at).toLocaleString()}</span>
                {v.failure_reason && <span className="text-rose text-xs truncate">{v.failure_reason}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selection bar */}
      {selected.size > 0 && (
        <div className="mb-4 flex items-center gap-3 px-4 py-2 rounded-lg border border-rose/20 bg-rose/5">
          <span className="text-sm text-text-secondary">{selected.size} selected</span>
          <button onClick={removeSelected} className="text-sm text-rose hover:text-rose/80 font-medium transition-colors cursor-pointer">Delete selected</button>
          <button onClick={() => setSelected(new Set())} className="text-sm text-text-muted hover:text-text-secondary transition-colors ml-auto cursor-pointer">Clear</button>
        </div>
      )}

      {/* Changes */}
      <div className="space-y-4 mb-8">
        {session.changes.map((change) => {
          const cmts = changeComments(change.id);
          return (
            <div key={change.id} className="border border-surface-light rounded-xl bg-surface overflow-hidden">
              <div className="p-4 cursor-pointer hover:bg-surface-light/50 transition-colors" onClick={() => toggleExpand(change.id)}>
                <div className="flex items-start gap-3">
                  <span className={"text-xs px-2 py-0.5 rounded border font-mono flex-shrink-0 " + (actionColors[change.action] || "")}>
                    {change.action}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-sm text-text-primary truncate">{change.path}</div>
                    <div className="text-sm text-text-secondary mt-1">{change.summary}</div>
                  </div>
                  <div className="flex items-center gap-2 text-text-muted text-xs flex-shrink-0">
                    {cmts.length > 0 && (
                      <span className="text-accent-bright">{cmts.length} comment{cmts.length !== 1 ? "s" : ""}</span>
                    )}
                    {change.action === "run" && (
                      <input type="checkbox" checked={selected.has(change.id)} onChange={() => toggleSelect(change.id)} onClick={(e) => e.stopPropagation()} className="accent-accent cursor-pointer" />
                    )}
                    <span className={"transition-transform inline-block " + (expanded.has(change.id) ? "rotate-90" : "")}>&#9654;</span>
                  </div>
                </div>
              </div>

              {expanded.has(change.id) && (
                <div className="border-t border-surface-light">
                  {change.details && (
                    <div className="px-4 py-3 text-sm text-text-secondary border-b border-surface-light whitespace-pre-wrap">{change.details}</div>
                  )}
                  {change.snippet && (
                    <div className="border-b border-surface-light">
                      <div className="px-4 py-2 text-xs text-text-muted font-mono bg-surface-light/30">Preview</div>
                      <pre className="px-4 py-3 text-xs font-mono overflow-x-auto"><code>{highlightCode(change.snippet)}</code></pre>
                    </div>
                  )}
                  {(change.code || change.diff) && (
                    <div className="border-b border-surface-light">
                      <pre className="p-4 text-xs font-mono overflow-x-auto max-h-96"><code>{
                        change.diff ? renderDiff(change.diff) : highlightCode(change.code || "")
                      }</code></pre>
                    </div>
                  )}
                  <div className="p-4 space-y-3">
                    {cmts.map((cmt) => (
                      <div key={cmt.id} className="flex items-start gap-2 text-sm group">
                        <span className="text-accent-bright mt-0.5 flex-shrink-0 font-mono text-xs">//</span>
                        <span className="flex-1 text-text-primary">{cmt.text}</span>
                        <button onClick={(e) => { e.stopPropagation(); removeComment(cmt.id); }} className="text-text-muted hover:text-rose text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">remove</button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <input type="text" placeholder="Add a comment on this change..." value={commentInputs[change.id] || ""} onChange={(e) => setCommentInputs((p) => ({ ...p, [change.id]: e.target.value }))} onKeyDown={(e) => e.key === "Enter" && postComment(change.id)} onClick={(e) => e.stopPropagation()} className="flex-1 bg-midnight border border-surface-light rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50" />
                      <button onClick={(e) => { e.stopPropagation(); postComment(change.id); }} className="px-3 py-2 text-sm bg-surface-light hover:bg-accent/20 rounded-lg text-text-secondary hover:text-text-primary transition-colors cursor-pointer">Comment</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Global feedback */}
      <div className="border border-surface-light rounded-xl bg-surface p-4 mb-8">
        <h3 className="font-semibold text-sm mb-3">General Feedback</h3>
        {globalComments.map((cmt) => (
          <div key={cmt.id} className="flex items-start gap-2 text-sm mb-3 group">
            <span className="text-accent-bright mt-0.5 flex-shrink-0 font-mono text-xs">//</span>
            <span className="flex-1 text-text-primary">{cmt.text}</span>
            <button onClick={() => removeComment(cmt.id)} className="text-text-muted hover:text-rose text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">remove</button>
          </div>
        ))}
        <div className="flex gap-2">
          <input type="text" placeholder="General feedback for this session..." value={globalComment} onChange={(e) => setGlobalComment(e.target.value)} onKeyDown={(e) => e.key === "Enter" && postComment(null)} className="flex-1 bg-midnight border border-surface-light rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50" />
          <button onClick={() => postComment(null)} className="px-3 py-2 text-sm bg-surface-light hover:bg-accent/20 rounded-lg text-text-secondary hover:text-text-primary transition-colors cursor-pointer">Comment</button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-4 pb-8">
        {session.status === "approved" ? (
          <div className="flex items-center gap-2 text-emerald text-sm">
            <span className="text-emerald">&#10003;</span>
            Approved &mdash; run <code className="font-mono bg-surface px-2 py-0.5 rounded">/pilot-run</code> to execute
          </div>
        ) : session.status === "iterating" ? (
          <div className="flex items-center gap-2 text-accent-bright text-sm">
            <span className="inline-block w-2 h-2 rounded-full bg-accent animate-pulse" />
            Waiting for /pilot-run to process feedback...
          </div>
        ) : session.status === "done" ? (
          <div className="flex items-center gap-3">
            <button
              onClick={async () => { if (!id) return; const updated = await updateSessionStatus(id, "deploy_queue"); setSession(updated); }}
              className="px-6 py-2.5 bg-accent hover:bg-accent-bright text-white rounded-lg font-medium text-sm transition-colors cursor-pointer"
            >
              Queue for Deploy
            </button>
            <span className="text-emerald text-sm">Session complete — ready to deploy</span>
          </div>
        ) : session.status === "deploy_queue" ? (
          <div className="flex items-center gap-2 text-accent-bright text-sm">
            <span className="text-accent-bright">&#10003;</span>
            In deploy queue — run <code className="font-mono bg-surface px-2 py-0.5 rounded">/pilot-deploy</code> to merge into target branch
          </div>
        ) : session.status === "failed" ? (
          <div className="flex items-center gap-3">
            <button onClick={approve} className="px-6 py-2.5 bg-emerald hover:bg-emerald/90 text-white rounded-lg font-medium text-sm transition-colors cursor-pointer">
              Re-approve
            </button>
            <span className="text-rose text-sm">Execution failed</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button onClick={approve} className="px-6 py-2.5 bg-emerald hover:bg-emerald/90 text-white rounded-lg font-medium text-sm transition-colors cursor-pointer">
              Approve
            </button>
            {totalComments > 0 && (
              <button
                onClick={async () => { if (!id) return; const updated = await iterateSession(id); setSession(updated); }}
                className="px-6 py-2.5 bg-accent hover:bg-accent-bright text-white rounded-lg font-medium text-sm transition-colors cursor-pointer"
              >
                Iterate ({totalComments} comment{totalComments !== 1 ? "s" : ""})
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
