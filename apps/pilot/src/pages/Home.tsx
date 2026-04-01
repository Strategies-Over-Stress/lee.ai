import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listSessions, onSessionsChanged, deleteSession, Session } from "../lib/ipc";

const statusColors: Record<string, string> = {
  awaiting_review: "text-amber bg-amber/10 border-amber/20",
  reviewing: "text-accent-bright bg-accent/10 border-accent/20",
  approved: "text-emerald bg-emerald/10 border-emerald/20",
  executing: "text-accent-bright bg-accent/10 border-accent/20",
  done: "text-emerald bg-emerald/10 border-emerald/20",
  failed: "text-rose bg-rose/10 border-rose/20",
};

export default function Home() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const refresh = () => {
    listSessions().then((s) => { setSessions(s); setLoading(false); });
  };

  useEffect(() => {
    refresh();
    const unsub = onSessionsChanged(refresh);
    return () => { unsub.then((fn) => fn()); };
  }, []);

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
      <p className="text-sm text-text-muted mb-6">
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
                    {totalComments > 0 && " \u00b7 " + totalComments + " comment" + (totalComments !== 1 ? "s" : "")}
                    {session.ticket && " \u00b7 " + session.ticket}
                    {" \u00b7 iteration " + session.iteration}
                  </div>
                </Link>
                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                  <span className={"text-xs px-2 py-0.5 rounded border " + (statusColors[session.status] || "text-text-muted")}>
                    {session.status.replace(/_/g, " ")}
                  </span>
                  <button
                    onClick={() => { handleDelete(session.id); }}
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
      )}
    </div>
  );
}
