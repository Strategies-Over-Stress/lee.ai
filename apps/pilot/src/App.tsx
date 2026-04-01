import { Routes, Route, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Home from "./pages/Home";
import SessionDetail from "./pages/SessionDetail";
import Research from "./pages/Research";
import { getProjectRoot, setProjectRoot, pickFolder } from "./lib/ipc";

function Nav() {
  const location = useLocation();
  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <nav className="space-y-1">
      <Link
        to="/"
        className={"block px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer " + (isActive("/") && !location.pathname.startsWith("/research") && !location.pathname.startsWith("/session") ? "text-text-primary bg-surface-light" : "text-text-secondary hover:text-text-primary hover:bg-surface-light")}
      >
        Sessions
      </Link>
      <Link
        to="/research"
        className={"block px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer " + (isActive("/research") ? "text-text-primary bg-surface-light" : "text-text-secondary hover:text-text-primary hover:bg-surface-light")}
      >
        Research
      </Link>
    </nav>
  );
}

function ProjectSwitcher() {
  const [root, setRoot] = useState("");

  useEffect(() => {
    getProjectRoot().then(setRoot);
  }, []);

  const handlePick = async () => {
    const path = await pickFolder();
    if (path) {
      try {
        const result = await setProjectRoot(path.replace(/\/$/, ""));
        setRoot(result);
        // Force full reload so sessions + research refresh from new project
        window.location.reload();
      } catch { /* ignore */ }
    }
  };

  const shortRoot = root.replace(/^\/Users\/[^/]+\//, "~/");

  return (
    <button
      onClick={handlePick}
      className="w-full text-left px-3 py-2 text-xs text-text-muted hover:text-accent-bright transition-colors font-mono truncate cursor-pointer"
      title={"Project: " + root + "\nClick to switch"}
    >
      <span className="text-text-muted mr-1">&#128193;</span>
      {shortRoot}
    </button>
  );
}

export default function App() {
  return (
    <div className="flex h-screen">
      <aside className="w-56 flex-shrink-0 border-r border-surface-light bg-surface p-4 flex flex-col">
        <Link to="/" className="text-lg font-bold text-accent-bright mb-6 px-3">
          pilot
        </Link>
        <div className="flex-1">
          <Nav />
        </div>
        <div className="border-t border-surface-light pt-2">
          <ProjectSwitcher />
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/session/:id" element={<SessionDetail />} />
          <Route path="/research" element={<Research />} />
        </Routes>
      </main>
    </div>
  );
}
