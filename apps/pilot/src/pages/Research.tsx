import { useEffect, useState } from "react";
import { listResearchFiles, getResearchFile, getResearchContext, setResearchContext, onResearchChanged } from "../lib/ipc";

// Build tree from flat paths
interface TreeNode {
  name: string;
  path?: string; // only files have paths
  children: TreeNode[];
}

function buildTree(files: string[], researchRoot: string): TreeNode[] {
  const root: TreeNode[] = [];
  for (const file of files) {
    const rel = file.replace(researchRoot + "/", "");
    const parts = rel.split("/");
    let current = root;
    for (let i = 0; i < parts.length; i++) {
      const name = parts[i];
      const isFile = i === parts.length - 1;
      let node = current.find((n) => n.name === name);
      if (!node) {
        node = { name, path: isFile ? file : undefined, children: [] };
        current.push(node);
      }
      current = node.children;
    }
  }
  return root;
}

// Simple markdown-ish syntax highlighting
function highlightMarkdown(text: string): React.ReactNode[] {
  return text.split("\n").map((line, i) => {
    let cls = "text-text-secondary";
    if (line.startsWith("# ")) cls = "text-text-primary font-bold text-lg";
    else if (line.startsWith("## ")) cls = "text-text-primary font-bold text-base";
    else if (line.startsWith("### ")) cls = "text-accent-bright font-semibold";
    else if (line.startsWith("- **") || line.startsWith("| ")) cls = "text-text-secondary";
    else if (line.startsWith("> ")) cls = "text-accent-bright italic border-l-2 border-accent pl-3";
    else if (line.startsWith("```")) cls = "text-text-muted";
    else if (line.startsWith("---")) cls = "text-surface-light";
    else if (line.startsWith("**") && line.endsWith("**")) cls = "text-text-primary font-semibold";
    else if (line.startsWith("Source")) cls = "text-text-muted text-xs";

    // Inline bold
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    const rendered = parts.map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <span key={j} className="text-text-primary font-semibold">{part.slice(2, -2)}</span>;
      }
      // Inline links
      const linkParts = part.split(/(\[[^\]]+\]\([^)]+\))/g);
      return linkParts.map((lp, k) => {
        const linkMatch = lp.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (linkMatch) {
          return <span key={k} className="text-accent-bright underline">{linkMatch[1]}</span>;
        }
        return <span key={k}>{lp}</span>;
      });
    });

    return <div key={i} className={cls}>{rendered}</div>;
  });
}

export default function Research() {
  const [files, setFiles] = useState<string[]>([]);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<string | null>(null);
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  // Derive research root from file paths
  const researchRoot = files.length > 0
    ? files[0].substring(0, files[0].indexOf("/.pilot/research/") + "/.pilot/research".length)
    : "";

  const loadFiles = () => {
    Promise.all([listResearchFiles(), getResearchContext()]).then(([f, ctx]) => {
      setFiles(f.filter((p) => !p.endsWith("context.json")));
      setChecked(new Set(ctx));
      setLoading(false);
    });
  };

  useEffect(() => {
    loadFiles();
    const unsub = onResearchChanged(loadFiles);
    return () => { unsub.then((fn) => fn()); };
  }, []);

  const toggleCheck = async (path: string) => {
    const next = new Set(checked);
    if (next.has(path)) next.delete(path); else next.add(path);
    setChecked(next);
    await setResearchContext(Array.from(next));
  };

  const toggleFolder = (name: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  };

  const readFile = async (path: string) => {
    setSelected(path);
    try {
      const text = await getResearchFile(path);
      setContent(text);
    } catch {
      setContent("Failed to read file.");
    }
  };

  const tree = buildTree(files, researchRoot);

  function renderNode(node: TreeNode, depth: number = 0): React.ReactNode {
    const isFolder = !node.path;
    const isOpen = !collapsed.has(node.name);

    if (isFolder) {
      // Check if all children files are checked
      const allFiles: string[] = [];
      const collectFiles = (n: TreeNode) => {
        if (n.path) allFiles.push(n.path);
        n.children.forEach(collectFiles);
      };
      node.children.forEach(collectFiles);
      const allChecked = allFiles.length > 0 && allFiles.every((f) => checked.has(f));
      const someChecked = allFiles.some((f) => checked.has(f));

      const toggleAllInFolder = async () => {
        const next = new Set(checked);
        if (allChecked) {
          allFiles.forEach((f) => next.delete(f));
        } else {
          allFiles.forEach((f) => next.add(f));
        }
        setChecked(next);
        await setResearchContext(Array.from(next));
      };

      return (
        <div key={node.name} style={{ paddingLeft: depth * 12 }}>
          <div className="flex items-center gap-1.5 py-1">
            <input
              type="checkbox"
              checked={allChecked}
              ref={(el) => { if (el) el.indeterminate = someChecked && !allChecked; }}
              onChange={toggleAllInFolder}
              className="accent-accent cursor-pointer flex-shrink-0"
            />
            <button
              onClick={() => toggleFolder(node.name)}
              className="flex items-center gap-1 text-sm text-text-primary hover:text-accent-bright cursor-pointer transition-colors"
            >
              <span className={"transition-transform inline-block text-[10px] text-text-muted " + (isOpen ? "rotate-90" : "")}>&#9654;</span>
              <span className="font-medium">{node.name}</span>
            </button>
          </div>
          {isOpen && (
            <div>
              {node.children.map((child) => renderNode(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    // File
    return (
      <div
        key={node.path}
        style={{ paddingLeft: depth * 12 }}
        className="flex items-center gap-1.5 py-0.5"
      >
        <input
          type="checkbox"
          checked={checked.has(node.path!)}
          onChange={() => toggleCheck(node.path!)}
          className="accent-accent cursor-pointer flex-shrink-0"
        />
        <button
          onClick={() => readFile(node.path!)}
          className={"text-sm truncate cursor-pointer transition-colors " + (selected === node.path ? "text-text-primary" : "text-text-secondary hover:text-text-primary")}
          title={node.name}
        >
          {node.name}
        </button>
      </div>
    );
  }

  if (loading) return <div className="text-text-muted">Loading...</div>;

  return (
    <div className="flex gap-6 h-full">
      {/* File tree */}
      <div className="w-72 flex-shrink-0 overflow-auto">
        <h1 className="text-2xl font-bold mb-2">Research</h1>
        <p className="text-sm text-text-muted mb-4">
          Check files to include as context in /pilot runs.
        </p>

        {checked.size > 0 && (
          <div className="text-xs text-accent-bright mb-4">
            {checked.size} file{checked.size !== 1 ? "s" : ""} selected for context
          </div>
        )}

        {files.length === 0 ? (
          <p className="text-sm text-text-muted">No research files yet.</p>
        ) : (
          <div>{tree.map((node) => renderNode(node))}</div>
        )}
      </div>

      {/* Content viewer */}
      <div className="flex-1 min-w-0">
        {selected ? (
          <div className="border border-surface-light rounded-xl bg-surface overflow-hidden h-full flex flex-col">
            <div className="px-4 py-2 border-b border-surface-light text-xs text-text-muted font-mono flex items-center justify-between">
              <span>{selected.split("/research/")[1] || selected.split("/").pop()}</span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checked.has(selected)}
                  onChange={() => toggleCheck(selected)}
                  className="accent-accent cursor-pointer"
                />
                <span>Include in context</span>
              </label>
            </div>
            <div className="flex-1 p-4 text-sm font-mono overflow-auto whitespace-pre-wrap">
              {highlightMarkdown(content)}
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
