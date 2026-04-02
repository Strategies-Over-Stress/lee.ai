import { useEffect, useState } from "react";
import { listResearch, addResearch, deleteResearch, enqueueResearch, onDataChanged, ResearchItem } from "../lib/ipc";
import { useProject } from "../lib/ProjectContext";

function highlightMarkdown(text: string): React.ReactNode[] {
  return text.split("\n").map((line, i) => {
    let cls = "text-text-secondary";
    if (line.startsWith("# ")) cls = "text-text-primary font-bold text-lg";
    else if (line.startsWith("## ")) cls = "text-text-primary font-bold text-base";
    else if (line.startsWith("### ")) cls = "text-accent-bright font-semibold";
    else if (line.startsWith("> ")) cls = "text-accent-bright italic border-l-2 border-accent pl-3";
    else if (line.startsWith("```")) cls = "text-text-muted";
    else if (line.startsWith("---")) cls = "text-surface-light";
    else if (line.startsWith("Source")) cls = "text-text-muted text-xs";

    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    const rendered = parts.map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <span key={j} className="text-text-primary font-semibold">{part.slice(2, -2)}</span>;
      }
      const linkParts = part.split(/(\[[^\]]+\]\([^)]+\))/g);
      return linkParts.map((lp, k) => {
        const m = lp.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (m) return <span key={k} className="text-accent-bright underline">{m[1]}</span>;
        return <span key={k}>{lp}</span>;
      });
    });
    return <div key={i} className={cls}>{rendered}</div>;
  });
}

export default function Research() {
  const { project } = useProject();
  const [items, setItems] = useState<ResearchItem[]>([]);
  const [selected, setSelected] = useState<ResearchItem | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    if (!project) return;
    listResearch(project.id).then((r) => { setItems(r); setLoading(false); });
  };

  useEffect(() => {
    refresh();
    const unsub = onDataChanged(refresh);
    return () => { unsub.then((fn) => fn()); };
  }, [project?.id]);

  const toggleCheck = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleEnqueue = async () => {
    if (!project || checked.size === 0) return;
    await enqueueResearch(project.id, Array.from(checked));
  };

  const handleAdd = async () => {
    if (!project) return;
    const name = prompt("Research file name (e.g. market-analysis.md):");
    if (!name) return;
    const item = await addResearch(project.id, name, "# " + name.replace(/\.md$/, "") + "\n\nAdd your research here.\n");
    setItems((prev) => [...prev, item]);
    setSelected(item);
  };

  const handleDelete = async (id: string) => {
    await deleteResearch(id);
    if (selected?.id === id) setSelected(null);
    setChecked((prev) => { const next = new Set(prev); next.delete(id); return next; });
    refresh();
  };

  if (loading) return <div className="text-text-muted">Loading...</div>;

  return (
    <div className="flex gap-6 h-full">
      {/* File list */}
      <div className="w-72 flex-shrink-0 overflow-auto">
        <h1 className="text-2xl font-bold mb-2">Research</h1>
        <p className="text-sm text-text-muted mb-4">
          Check files and click Enqueue to make available for /pilot.
        </p>

        {checked.size > 0 && (
          <button
            onClick={handleEnqueue}
            className="w-full mb-4 px-4 py-2 bg-accent hover:bg-accent-bright text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Enqueue {checked.size} file{checked.size !== 1 ? "s" : ""}
          </button>
        )}

        <button
          onClick={handleAdd}
          className="w-full mb-4 px-3 py-2 text-sm text-text-muted hover:text-accent-bright border border-dashed border-surface-light hover:border-accent/30 rounded-lg transition-colors cursor-pointer"
        >
          + Add research file
        </button>

        {items.length === 0 ? (
          <p className="text-sm text-text-muted">No research files yet.</p>
        ) : (
          <div className="space-y-1">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-1.5 py-1 group">
                <input
                  type="checkbox"
                  checked={checked.has(item.id)}
                  onChange={() => toggleCheck(item.id)}
                  className="accent-accent cursor-pointer flex-shrink-0"
                />
                <button
                  onClick={() => setSelected(item)}
                  className={"flex-1 text-left text-sm truncate cursor-pointer transition-colors " + (selected?.id === item.id ? "text-text-primary" : "text-text-secondary hover:text-text-primary")}
                  title={item.name}
                >
                  {item.name}
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-text-muted hover:text-rose text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Content viewer */}
      <div className="flex-1 min-w-0">
        {selected ? (
          <div className="border border-surface-light rounded-xl bg-surface overflow-hidden h-full flex flex-col">
            <div className="px-4 py-2 border-b border-surface-light text-xs text-text-muted font-mono flex items-center justify-between">
              <span>{selected.name}</span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checked.has(selected.id)}
                  onChange={() => toggleCheck(selected.id)}
                  className="accent-accent cursor-pointer"
                />
                <span>Include in context</span>
              </label>
            </div>
            <div className="flex-1 p-4 text-sm font-mono overflow-auto whitespace-pre-wrap">
              {highlightMarkdown(selected.content)}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-text-muted text-sm">
            Select a file to view
          </div>
        )}
      </div>
    </div>
  );
}
