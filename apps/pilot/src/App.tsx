import { Routes, Route, Link, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import SessionDetail from "./pages/SessionDetail";
import Research from "./pages/Research";
import { ProjectProvider, useProject } from "./lib/ProjectContext";

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
  const { project, projects, switchProject, addProject } = useProject();

  return (
    <div className="space-y-2">
      <select
        value={project?.id || ""}
        onChange={(e) => switchProject(e.target.value)}
        className="w-full bg-midnight border border-surface-light rounded-lg px-3 py-2 text-xs text-text-secondary font-mono cursor-pointer focus:outline-none focus:border-accent/50"
      >
        {projects.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
      <button
        onClick={addProject}
        className="w-full text-left px-3 py-1.5 text-xs text-text-muted hover:text-accent-bright transition-colors cursor-pointer"
      >
        + Add project
      </button>
    </div>
  );
}

function Layout() {
  const { loading } = useProject();

  if (loading) return <div className="flex items-center justify-center h-screen text-text-muted">Loading...</div>;

  return (
    <div className="flex h-screen">
      <aside className="w-56 flex-shrink-0 border-r border-surface-light bg-surface p-4 flex flex-col">
        <Link to="/" className="text-lg font-bold text-accent-bright mb-6 px-3">
          pilot
        </Link>
        <div className="flex-1">
          <Nav />
        </div>
        <div className="border-t border-surface-light pt-3">
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

export default function App() {
  return (
    <ProjectProvider>
      <Layout />
    </ProjectProvider>
  );
}
