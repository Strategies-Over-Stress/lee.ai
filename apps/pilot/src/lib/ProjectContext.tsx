import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Project, listProjects, getOrCreateProject, setCurrentProject, pickFolder } from "./ipc";
import { invoke } from "@tauri-apps/api/core";

interface ProjectState {
  project: Project | null;
  projects: Project[];
  loading: boolean;
  switchProject: (id: string) => void;
  addProject: () => Promise<void>;
}

const Ctx = createContext<ProjectState | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listProjects().then((ps) => {
      setProjects(ps);
      if (ps.length > 0) {
        setProject(ps[0]);
        setCurrentProject(ps[0].id);
      }
      setLoading(false);
    });
  }, []);

  const switchProject = (id: string) => {
    const p = projects.find((p) => p.id === id);
    if (p) {
      setProject(p);
      setCurrentProject(id);
    }
  };

  const addProject = async () => {
    const path = await pickFolder();
    if (!path) return;
    const cleanPath = path.replace(/\/$/, "");
    const name = cleanPath.split("/").pop() || cleanPath;

    const p = await getOrCreateProject(name, cleanPath);
    // Explicitly import legacy data
    try {
      const result: string = await invoke("import_project_data", { projectId: p.id, projectPath: cleanPath });
      console.log("Import result:", result);
    } catch (err) {
      console.error("Import failed:", err);
    }
    setProjects((prev) => {
      if (prev.find((x) => x.id === p.id)) return prev;
      return [...prev, p];
    });
    setProject(p);
    setCurrentProject(p.id);
  };

  return (
    <Ctx.Provider value={{ project, projects, loading, switchProject, addProject }}>
      {children}
    </Ctx.Provider>
  );
}

export function useProject() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useProject must be inside ProjectProvider");
  return ctx;
}
