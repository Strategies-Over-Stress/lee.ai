import { invoke } from "@tauri-apps/api/core";
import { listen, UnlistenFn } from "@tauri-apps/api/event";

export interface Comment {
  id: string;
  text: string;
  created_at: string;
}

export interface Change {
  id: string;
  action: "create" | "edit" | "delete" | "run";
  path: string;
  summary: string;
  details?: string;
  snippet?: string;
  code?: string;
  diff?: string;
  comments: Comment[];
}

export interface Session {
  id: string;
  goal: string;
  status: string;
  created_at: string;
  updated_at: string;
  changes: Change[];
  global_comments: Comment[];
  script: string;
  iteration: number;
  ticket?: string;
  summary?: string;
  context?: string;
}

// Sessions
export const listSessions = (): Promise<Session[]> =>
  invoke("list_sessions");

export const getSession = (id: string): Promise<Session> =>
  invoke("get_session", { id });

export const deleteSession = (id: string): Promise<void> =>
  invoke("delete_session", { id });

export const approveSession = (id: string): Promise<Session> =>
  invoke("approve_session", { id });

export const iterateSession = (id: string): Promise<Session> =>
  invoke("iterate_session", { id });

// Session content
export const getScript = (id: string): Promise<string> =>
  invoke("get_script", { id });

export const getContext = (id: string): Promise<string> =>
  invoke("get_context", { id });

// Session mutations
export const addComment = (id: string, changeId: string | null, text: string): Promise<Session> =>
  invoke("add_comment", { id, changeId, text });

export const deleteComment = (id: string, changeId: string | null, commentId: string): Promise<Session> =>
  invoke("delete_comment", { id, changeId, commentId });

export const deleteChange = (id: string, changeId: string): Promise<Session> =>
  invoke("delete_change", { id, changeId });

// Execute
export const executePilotRun = (id: string): Promise<number> =>
  invoke("execute_pilot_run", { id });

export const onExecOutput = (callback: (line: string) => void): Promise<UnlistenFn> =>
  listen<string>("exec-output", (event) => callback(event.payload));

export const onExecDone = (callback: (code: number) => void): Promise<UnlistenFn> =>
  listen<number>("exec-done", (event) => callback(event.payload));

// File watcher
export const onSessionsChanged = (callback: () => void): Promise<UnlistenFn> =>
  listen("sessions-changed", () => callback());

export const onResearchChanged = (callback: () => void): Promise<UnlistenFn> =>
  listen("research-changed", () => callback());

// Project root
export const getProjectRoot = (): Promise<string> =>
  invoke("get_project_root");

export const setProjectRoot = (path: string): Promise<string> =>
  invoke("set_project_root", { path });

export const pickFolder = (): Promise<string | null> =>
  invoke("pick_folder");

// Research
export const listResearchFiles = (): Promise<string[]> =>
  invoke("list_research_files");

export const getResearchFile = (path: string): Promise<string> =>
  invoke("get_research_file", { path });

export const getResearchContext = (): Promise<string[]> =>
  invoke("get_research_context");

export const setResearchContext = (checked: string[]): Promise<void> =>
  invoke("set_research_context", { checked });
