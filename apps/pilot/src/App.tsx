import { Routes, Route, Link, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import SessionDetail from "./pages/SessionDetail";
import Research from "./pages/Research";

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

export default function App() {
  return (
    <div className="flex h-screen">
      <aside className="w-56 flex-shrink-0 border-r border-surface-light bg-surface p-4 flex flex-col gap-1">
        <Link to="/" className="text-lg font-bold text-accent-bright mb-6 px-3">
          pilot
        </Link>
        <Nav />
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
