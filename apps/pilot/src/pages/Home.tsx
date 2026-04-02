import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listSessions, deleteSession, onDataChanged, SessionFull } from "../lib/ipc";
import { useProject } from "../lib/ProjectContext";

const statusColors: Record<string, string> = {
  awaiting_review: "text-amber bg-amber/10 border-amber/20",
  reviewing: "text-accent-bright bg-accent/10 border-accent/20",
  approved: "text-emerald bg-emerald/10 border-emerald/20",
  iterating: "text-accent-bright bg-accent/10 border-accent/20",
  done: "text-emerald bg-emerald/10 border-emerald/20",
  deploy_queue: "text-accent-bright bg-accent/10 border-accent/20",
  failed: "text-rose bg-rose/10 border-rose/20",
};

export default function Home() {
  const { project } = useProject();
  const [sessions, setSessions] = useState<SessionFull[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    if (!project) return;
    listSessions(project.id).then((s) => { setSessions(s); setLoading(false); });
  };

  useEffect(() => {
    refresh();
    const unsub = onDataChanged(refresh);
    return () => { unsub.then((fn) => fn()); };
  }, [project?.id]);

  const handleDelete = async (id: string) => {
    try {
      await deleteSession(id);
      refresh();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  if (loading) return <div className="text-text-muted">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Sessions</h1>
      <p className="text-sm text-text-muted mb-4">
        Review and approve build scripts before execution.
      </p>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["all", "awaiting_review", "reviewing", "approved", "iterating", "done", "deploy_queue", "failed"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={"text-xs px-3 py-1.5 rounded-lg border transition-colors cursor-pointer " +
              (filter === s
                ? (statusColors[s] || "text-text-primary bg-surface-light border-surface-light")
                : "text-text-muted border-surface-light hover:border-accent/30")}
          >
            {s === "all" ? "All" : s.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {(() => {
        const filtered = filter === "all" ? sessions : sessions.filter((s) => s.status === filter);
        return filtered.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <p className="mb-2">No sessions yet.</p>
          <p className="text-sm">
            Run <code className="font-mono bg-surface px-2 py-1 rounded">/pilot &quot;your goal&quot;</code> in Claude Code to create one.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((session) => {
            const commentCount = session.comments.length;
            return (
              <div
                key={session.id}
                className="flex items-start p-4 rounded-xl border border-surface-light bg-surface hover:border-accent/30 transition-colors group"
              >
                <Link
                  to={"/session/" + session.id}
                  className="flex-1 min-w-0 cursor-pointer"
                >
                  <div className="font-medium">{session.goal}</div>
                  <div className="text-sm text-text-muted mt-1">
                    {session.changes.length} change{session.changes.length !== 1 ? "s" : ""}
                    {commentCount > 0 && " \u00b7 " + commentCount + " comment" + (commentCount !== 1 ? "s" : "")}
                    {" \u00b7 iteration " + session.iteration}
                    {session.parent_branch && " \u00b7 " + session.parent_branch}
                  </div>
                  {session.failure_reason && (
                    <div className="text-xs text-rose mt-1 truncate">{session.failure_reason}</div>
                  )}
                </Link>
                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                  <span className={"text-xs px-2 py-0.5 rounded border " + (statusColors[session.status] || "text-text-muted")}>
                    {session.status.replace(/_/g, " ")}
                  </span>
                  <button
                    onClick={() => handleDelete(session.id)}
                    className="text-text-muted hover:text-rose text-lg leading-none cursor-pointer px-2 py-1"
                    title="Delete session"
                  >
                    x
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      );
      })()}
    </div>
  );
}
