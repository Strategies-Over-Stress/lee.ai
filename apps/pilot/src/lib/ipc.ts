import { invoke } from "@tauri-apps/api/core";
import { listen, UnlistenFn } from "@tauri-apps/api/event";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Project {
  id: string;
  name: string;
  path: string;
  created_at: string;
}

export interface ResearchItem {
  id: string;
  project_id: string;
  name: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface ChangeRow {
  id: string;
  session_id: string;
  action: "create" | "edit" | "delete" | "run";
  path: string;
  summary: string;
  details?: string;
  snippet?: string;
  code?: string;
  diff?: string;
  sort_order: number;
}

export interface CommentRow {
  id: string;
  session_id: string;
  change_id?: string;
  text: string;
  created_at: string;
}

export interface SessionFull {
  id: string;
  project_id: string;
  goal: string;
  parent_branch: string;
  target_branch: string;
  status: string;
  iteration: number;
  context?: string;
  build_script?: string;
  failure_reason?: string;
  failure_step?: string;
  created_at: string;
  updated_at: string;
  changes: ChangeRow[];
  comments: CommentRow[];
}

export interface SessionVersion {
  id: string;
  session_id: string;
  iteration: number;
  build_script?: string;
  status: string;
  failure_reason?: string;
  failure_step?: string;
  session_snapshot: string;
  created_at: string;
}

// ─── Projects ───────────────────────────────────────────────────────────────

export const listProjects = (): Promise<Project[]> =>
  invoke("list_projects");

export const getOrCreateProject = (name: string, path: string): Promise<Project> =>
  invoke("get_or_create_project", { name, path });

export const setCurrentProject = (projectId: string): Promise<void> =>
  invoke("set_current_project", { projectId });

export const getCurrentProjectId = (): Promise<string | null> =>
  invoke("get_current_project_id");

// ─── Sessions ───────────────────────────────────────────────────────────────

export const listSessions = (projectId: string): Promise<SessionFull[]> =>
  invoke("list_sessions", { projectId });

export const getSession = (id: string): Promise<SessionFull> =>
  invoke("get_session", { id });

export const deleteSession = (id: string): Promise<void> =>
  invoke("delete_session", { id });

export const approveSession = (id: string): Promise<SessionFull> =>
  invoke("approve_session", { id });

export const iterateSession = (id: string): Promise<SessionFull> =>
  invoke("iterate_session", { id });

export const updateSessionStatus = (id: string, status: string): Promise<SessionFull> =>
  invoke("update_session_status", { id, status });

export const saveFailure = (id: string, reason: string, failedStep?: string): Promise<SessionFull> =>
  invoke("save_failure", { id, reason, failedStep });

export const getBuildScript = (id: string): Promise<string> =>
  invoke("get_build_script", { id });

// ─── Changes ────────────────────────────────────────────────────────────────

export const deleteChange = (sessionId: string, changeId: string): Promise<SessionFull> =>
  invoke("delete_change", { sessionId, changeId });

// ─── Comments ───────────────────────────────────────────────────────────────

export const addComment = (sessionId: string, changeId: string | null, text: string): Promise<SessionFull> =>
  invoke("add_comment", { sessionId, changeId, text });

export const deleteComment = (sessionId: string, commentId: string): Promise<SessionFull> =>
  invoke("delete_comment", { sessionId, commentId });

// ─── Research ───────────────────────────────────────────────────────────────

export const listResearch = (projectId: string): Promise<ResearchItem[]> =>
  invoke("list_research", { projectId });

export const addResearch = (projectId: string, name: string, content: string): Promise<ResearchItem> =>
  invoke("add_research", { projectId, name, content });

export const updateResearch = (id: string, content: string): Promise<ResearchItem> =>
  invoke("update_research", { id, content });

export const deleteResearch = (id: string): Promise<void> =>
  invoke("delete_research", { id });

export const enqueueResearch = (projectId: string, researchIds: string[]): Promise<void> =>
  invoke("enqueue_research", { projectId, researchIds });

// ─── Session History ────────────────────────────────────────────────────────

export const listSessionVersions = (sessionId: string): Promise<SessionVersion[]> =>
  invoke("list_session_versions", { sessionId });

// ─── Utility ────────────────────────────────────────────────────────────────

export const pickFolder = (): Promise<string | null> =>
  invoke("pick_folder");

// ─── Events ─────────────────────────────────────────────────────────────────

export const onDataChanged = (callback: () => void): Promise<UnlistenFn> =>
  listen("data-changed", () => callback());
