#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use chrono::Utc;
use notify::{Event, RecursiveMode, Watcher};
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::process::Command;
use std::sync::{mpsc, Mutex};
use std::thread;
use std::time::Duration;
use tauri::Emitter;
use uuid::Uuid;

// ─── Types ──────────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Project {
    pub id: String,
    pub name: String,
    pub path: String,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ResearchItem {
    pub id: String,
    pub project_id: String,
    pub name: String,
    pub content: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SessionRow {
    pub id: String,
    pub project_id: String,
    pub goal: String,
    pub parent_branch: String,
    pub target_branch: String,
    pub status: String,
    pub iteration: i32,
    pub context: Option<String>,
    pub build_script: Option<String>,
    pub failure_reason: Option<String>,
    pub failure_step: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ChangeRow {
    pub id: String,
    pub session_id: String,
    pub action: String,
    pub path: String,
    pub summary: String,
    pub details: Option<String>,
    pub snippet: Option<String>,
    pub code: Option<String>,
    pub diff: Option<String>,
    pub sort_order: i32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CommentRow {
    pub id: String,
    pub session_id: String,
    pub change_id: Option<String>,
    pub text: String,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SessionVersion {
    pub id: String,
    pub session_id: String,
    pub iteration: i32,
    pub build_script: Option<String>,
    pub status: String,
    pub failure_reason: Option<String>,
    pub failure_step: Option<String>,
    pub session_snapshot: String,
    pub created_at: String,
}

// Frontend-friendly combined session type
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SessionFull {
    pub id: String,
    pub project_id: String,
    pub goal: String,
    pub parent_branch: String,
    pub target_branch: String,
    pub status: String,
    pub iteration: i32,
    pub context: Option<String>,
    pub build_script: Option<String>,
    pub failure_reason: Option<String>,
    pub failure_step: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    pub changes: Vec<ChangeRow>,
    pub comments: Vec<CommentRow>,
}

// ─── State ──────────────────────────────────────────────────────────────────

struct AppState {
    db: Mutex<Connection>,
    current_project_id: Mutex<Option<String>>,
}

fn now() -> String {
    Utc::now().to_rfc3339()
}

fn new_id() -> String {
    Uuid::new_v4().to_string()
}

// ─── Database Init ──────────────────────────────────────────────────────────

fn init_db(db_path: &PathBuf) -> Connection {
    let conn = Connection::open(db_path).expect("Failed to open database");
    conn.execute_batch("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;")
        .expect("Failed to set pragmas");

    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            path TEXT NOT NULL,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS research (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL REFERENCES projects(id),
            name TEXT NOT NULL,
            content TEXT NOT NULL DEFAULT '',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL REFERENCES projects(id),
            goal TEXT NOT NULL,
            parent_branch TEXT NOT NULL DEFAULT '',
            target_branch TEXT NOT NULL DEFAULT '',
            status TEXT NOT NULL DEFAULT 'awaiting_review',
            iteration INTEGER NOT NULL DEFAULT 1,
            context TEXT,
            build_script TEXT,
            failure_reason TEXT,
            failure_step TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS session_versions (
            id TEXT PRIMARY KEY,
            session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
            iteration INTEGER NOT NULL,
            build_script TEXT,
            status TEXT NOT NULL,
            failure_reason TEXT,
            failure_step TEXT,
            session_snapshot TEXT NOT NULL,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS changes (
            id TEXT PRIMARY KEY,
            session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
            action TEXT NOT NULL,
            path TEXT NOT NULL,
            summary TEXT NOT NULL,
            details TEXT,
            snippet TEXT,
            code TEXT,
            diff TEXT,
            sort_order INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS comments (
            id TEXT PRIMARY KEY,
            session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
            change_id TEXT,
            text TEXT NOT NULL,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS session_research (
            id TEXT PRIMARY KEY,
            session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
            research_id TEXT NOT NULL REFERENCES research(id),
            checksum TEXT
        );"
    ).expect("Failed to create tables");

    conn
}

// ─── Helpers ────────────────────────────────────────────────────────────────

fn get_session_full(conn: &Connection, session_id: &str) -> Result<SessionFull, String> {
    let row = conn.query_row(
        "SELECT id, project_id, goal, parent_branch, target_branch, status, iteration, context, build_script, failure_reason, failure_step, created_at, updated_at FROM sessions WHERE id = ?",
        params![session_id],
        |row| Ok(SessionRow {
            id: row.get(0)?,
            project_id: row.get(1)?,
            goal: row.get(2)?,
            parent_branch: row.get(3)?,
            target_branch: row.get(4)?,
            status: row.get(5)?,
            iteration: row.get(6)?,
            context: row.get(7)?,
            build_script: row.get(8)?,
            failure_reason: row.get(9)?,
            failure_step: row.get(10)?,
            created_at: row.get(11)?,
            updated_at: row.get(12)?,
        })
    ).map_err(|e| format!("Session not found: {e}"))?;

    let mut stmt = conn.prepare(
        "SELECT id, session_id, action, path, summary, details, snippet, code, diff, sort_order FROM changes WHERE session_id = ? ORDER BY sort_order"
    ).map_err(|e| e.to_string())?;
    let changes: Vec<ChangeRow> = stmt.query_map(params![session_id], |r| Ok(ChangeRow {
        id: r.get(0)?,
        session_id: r.get(1)?,
        action: r.get(2)?,
        path: r.get(3)?,
        summary: r.get(4)?,
        details: r.get(5)?,
        snippet: r.get(6)?,
        code: r.get(7)?,
        diff: r.get(8)?,
        sort_order: r.get(9)?,
    })).map_err(|e| e.to_string())?.filter_map(|r| r.ok()).collect();

    let mut stmt = conn.prepare(
        "SELECT id, session_id, change_id, text, created_at FROM comments WHERE session_id = ? ORDER BY created_at"
    ).map_err(|e| e.to_string())?;
    let comments: Vec<CommentRow> = stmt.query_map(params![session_id], |r| Ok(CommentRow {
        id: r.get(0)?,
        session_id: r.get(1)?,
        change_id: r.get(2)?,
        text: r.get(3)?,
        created_at: r.get(4)?,
    })).map_err(|e| e.to_string())?.filter_map(|r| r.ok()).collect();

    Ok(SessionFull {
        id: row.id,
        project_id: row.project_id,
        goal: row.goal,
        parent_branch: row.parent_branch,
        target_branch: row.target_branch,
        status: row.status,
        iteration: row.iteration,
        context: row.context,
        build_script: row.build_script,
        failure_reason: row.failure_reason,
        failure_step: row.failure_step,
        created_at: row.created_at,
        updated_at: row.updated_at,
        changes,
        comments,
    })
}

fn snapshot_session(conn: &Connection, session: &SessionFull) -> Result<(), String> {
    let snapshot = serde_json::to_string(session).map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO session_versions (id, session_id, iteration, build_script, status, failure_reason, failure_step, session_snapshot, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        params![new_id(), session.id, session.iteration, session.build_script, session.status, session.failure_reason, session.failure_step, snapshot, now()]
    ).map_err(|e| e.to_string())?;
    Ok(())
}

// ─── Project Commands ───────────────────────────────────────────────────────

#[tauri::command]
fn list_projects(state: tauri::State<AppState>) -> Result<Vec<Project>, String> {
    let conn = state.db.lock().unwrap();
    let mut stmt = conn.prepare("SELECT id, name, path, created_at FROM projects ORDER BY name")
        .map_err(|e| e.to_string())?;
    let projects = stmt.query_map([], |row| Ok(Project {
        id: row.get(0)?,
        name: row.get(1)?,
        path: row.get(2)?,
        created_at: row.get(3)?,
    })).map_err(|e| e.to_string())?.filter_map(|r| r.ok()).collect();
    Ok(projects)
}

#[tauri::command]
fn get_or_create_project(state: tauri::State<AppState>, name: String, path: String) -> Result<Project, String> {
    let conn = state.db.lock().unwrap();
    // Try to find existing
    let existing = conn.query_row(
        "SELECT id, name, path, created_at FROM projects WHERE name = ?",
        params![name],
        |row| Ok(Project { id: row.get(0)?, name: row.get(1)?, path: row.get(2)?, created_at: row.get(3)? })
    );
    if let Ok(p) = existing {
        // Import any new legacy data
        import_legacy_sessions(&conn, &p.id, &p.path);
        import_legacy_research(&conn, &p.id, &p.path);
        *state.current_project_id.lock().unwrap() = Some(p.id.clone());
        return Ok(p);
    }
    let id = new_id();
    let ts = now();
    conn.execute(
        "INSERT INTO projects (id, name, path, created_at) VALUES (?, ?, ?, ?)",
        params![id, name, path, ts]
    ).map_err(|e| e.to_string())?;
    let project = Project { id: id.clone(), name, path: path.clone(), created_at: ts };
    // Auto-import legacy data from filesystem
    import_legacy_sessions(&conn, &id, &path);
    import_legacy_research(&conn, &id, &path);
    *state.current_project_id.lock().unwrap() = Some(id);
    Ok(project)
}

#[tauri::command]
fn set_current_project(state: tauri::State<AppState>, project_id: String) -> Result<(), String> {
    *state.current_project_id.lock().unwrap() = Some(project_id);
    Ok(())
}

#[tauri::command]
fn get_current_project_id(state: tauri::State<AppState>) -> Option<String> {
    state.current_project_id.lock().unwrap().clone()
}

// ─── Session Commands ───────────────────────────────────────────────────────

#[tauri::command]
fn list_sessions(state: tauri::State<AppState>, project_id: String) -> Result<Vec<SessionFull>, String> {
    let conn = state.db.lock().unwrap();
    let mut stmt = conn.prepare(
        "SELECT id FROM sessions WHERE project_id = ? ORDER BY created_at DESC"
    ).map_err(|e| e.to_string())?;
    let ids: Vec<String> = stmt.query_map(params![project_id], |row| row.get(0))
        .map_err(|e| e.to_string())?.filter_map(|r| r.ok()).collect();
    let mut sessions = Vec::new();
    for id in ids {
        if let Ok(s) = get_session_full(&conn, &id) {
            sessions.push(s);
        }
    }
    Ok(sessions)
}

#[tauri::command]
fn get_session(state: tauri::State<AppState>, id: String) -> Result<SessionFull, String> {
    let conn = state.db.lock().unwrap();
    get_session_full(&conn, &id)
}

#[tauri::command]
fn delete_session(state: tauri::State<AppState>, id: String) -> Result<(), String> {
    let conn = state.db.lock().unwrap();
    conn.execute("DELETE FROM sessions WHERE id = ?", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn approve_session(state: tauri::State<AppState>, id: String) -> Result<SessionFull, String> {
    let conn = state.db.lock().unwrap();
    let session = get_session_full(&conn, &id)?;
    snapshot_session(&conn, &session)?;
    conn.execute(
        "UPDATE sessions SET status = 'approved', updated_at = ? WHERE id = ?",
        params![now(), id]
    ).map_err(|e| e.to_string())?;
    get_session_full(&conn, &id)
}

#[tauri::command]
fn iterate_session(state: tauri::State<AppState>, id: String) -> Result<SessionFull, String> {
    let conn = state.db.lock().unwrap();
    let session = get_session_full(&conn, &id)?;
    snapshot_session(&conn, &session)?;
    conn.execute(
        "UPDATE sessions SET status = 'iterating', updated_at = ? WHERE id = ?",
        params![now(), id]
    ).map_err(|e| e.to_string())?;
    get_session_full(&conn, &id)
}

#[tauri::command]
fn update_session_status(state: tauri::State<AppState>, id: String, status: String) -> Result<SessionFull, String> {
    let conn = state.db.lock().unwrap();
    conn.execute(
        "UPDATE sessions SET status = ?, updated_at = ? WHERE id = ?",
        params![status, now(), id]
    ).map_err(|e| e.to_string())?;
    get_session_full(&conn, &id)
}

#[tauri::command]
fn save_failure(state: tauri::State<AppState>, id: String, reason: String, failed_step: Option<String>) -> Result<SessionFull, String> {
    let conn = state.db.lock().unwrap();
    conn.execute(
        "UPDATE sessions SET status = 'failed', failure_reason = ?, failure_step = ?, updated_at = ? WHERE id = ?",
        params![reason, failed_step, now(), id]
    ).map_err(|e| e.to_string())?;
    let session = get_session_full(&conn, &id)?;
    snapshot_session(&conn, &session)?;
    get_session_full(&conn, &id)
}

// ─── Change Commands ────────────────────────────────────────────────────────

#[tauri::command]
fn delete_change(state: tauri::State<AppState>, session_id: String, change_id: String) -> Result<SessionFull, String> {
    let conn = state.db.lock().unwrap();
    conn.execute("DELETE FROM changes WHERE id = ? AND session_id = ?", params![change_id, session_id])
        .map_err(|e| e.to_string())?;
    conn.execute("UPDATE sessions SET updated_at = ? WHERE id = ?", params![now(), session_id])
        .map_err(|e| e.to_string())?;
    get_session_full(&conn, &session_id)
}

// ─── Comment Commands ───────────────────────────────────────────────────────

#[tauri::command]
fn add_comment(state: tauri::State<AppState>, session_id: String, change_id: Option<String>, text: String) -> Result<SessionFull, String> {
    let conn = state.db.lock().unwrap();
    conn.execute(
        "INSERT INTO comments (id, session_id, change_id, text, created_at) VALUES (?, ?, ?, ?, ?)",
        params![new_id(), session_id, change_id, text, now()]
    ).map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE sessions SET status = 'reviewing', updated_at = ? WHERE id = ?",
        params![now(), session_id]
    ).map_err(|e| e.to_string())?;
    get_session_full(&conn, &session_id)
}

#[tauri::command]
fn delete_comment(state: tauri::State<AppState>, session_id: String, comment_id: String) -> Result<SessionFull, String> {
    let conn = state.db.lock().unwrap();
    conn.execute("DELETE FROM comments WHERE id = ?", params![comment_id])
        .map_err(|e| e.to_string())?;
    // If no comments left, revert to awaiting_review
    let count: i32 = conn.query_row(
        "SELECT COUNT(*) FROM comments WHERE session_id = ?",
        params![session_id], |r| r.get(0)
    ).unwrap_or(0);
    if count == 0 {
        conn.execute(
            "UPDATE sessions SET status = 'awaiting_review', updated_at = ? WHERE id = ? AND status = 'reviewing'",
            params![now(), session_id]
        ).map_err(|e| e.to_string())?;
    }
    get_session_full(&conn, &session_id)
}

// ─── Build Script ───────────────────────────────────────────────────────────

#[tauri::command]
fn get_build_script(state: tauri::State<AppState>, id: String) -> Result<String, String> {
    let conn = state.db.lock().unwrap();
    let script: String = conn.query_row(
        "SELECT COALESCE(build_script, '') FROM sessions WHERE id = ?",
        params![id], |r| r.get(0)
    ).map_err(|e| format!("Session not found: {e}"))?;
    Ok(script)
}

// ─── Research Commands ──────────────────────────────────────────────────────

#[tauri::command]
fn list_research(state: tauri::State<AppState>, project_id: String) -> Result<Vec<ResearchItem>, String> {
    let conn = state.db.lock().unwrap();
    let mut stmt = conn.prepare(
        "SELECT id, project_id, name, content, created_at, updated_at FROM research WHERE project_id = ? ORDER BY name"
    ).map_err(|e| e.to_string())?;
    let items = stmt.query_map(params![project_id], |r| Ok(ResearchItem {
        id: r.get(0)?,
        project_id: r.get(1)?,
        name: r.get(2)?,
        content: r.get(3)?,
        created_at: r.get(4)?,
        updated_at: r.get(5)?,
    })).map_err(|e| e.to_string())?.filter_map(|r| r.ok()).collect();
    Ok(items)
}

#[tauri::command]
fn add_research(state: tauri::State<AppState>, project_id: String, name: String, content: String) -> Result<ResearchItem, String> {
    let conn = state.db.lock().unwrap();
    let id = new_id();
    let ts = now();
    conn.execute(
        "INSERT INTO research (id, project_id, name, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
        params![id, project_id, name, content, ts, ts]
    ).map_err(|e| e.to_string())?;
    Ok(ResearchItem { id, project_id, name, content, created_at: ts.clone(), updated_at: ts })
}

#[tauri::command]
fn update_research(state: tauri::State<AppState>, id: String, content: String) -> Result<ResearchItem, String> {
    let conn = state.db.lock().unwrap();
    conn.execute(
        "UPDATE research SET content = ?, updated_at = ? WHERE id = ?",
        params![content, now(), id]
    ).map_err(|e| e.to_string())?;
    conn.query_row(
        "SELECT id, project_id, name, content, created_at, updated_at FROM research WHERE id = ?",
        params![id],
        |r| Ok(ResearchItem { id: r.get(0)?, project_id: r.get(1)?, name: r.get(2)?, content: r.get(3)?, created_at: r.get(4)?, updated_at: r.get(5)? })
    ).map_err(|e| e.to_string())
}

#[tauri::command]
fn rename_research(state: tauri::State<AppState>, id: String, name: String) -> Result<ResearchItem, String> {
    let conn = state.db.lock().unwrap();
    conn.execute(
        "UPDATE research SET name = ?, updated_at = ? WHERE id = ?",
        params![name, now(), id]
    ).map_err(|e| e.to_string())?;
    conn.query_row(
        "SELECT id, project_id, name, content, created_at, updated_at FROM research WHERE id = ?",
        params![id],
        |r| Ok(ResearchItem { id: r.get(0)?, project_id: r.get(1)?, name: r.get(2)?, content: r.get(3)?, created_at: r.get(4)?, updated_at: r.get(5)? })
    ).map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_research(state: tauri::State<AppState>, id: String) -> Result<(), String> {
    let conn = state.db.lock().unwrap();
    conn.execute("DELETE FROM research WHERE id = ?", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn enqueue_research(state: tauri::State<AppState>, project_id: String, research_ids: Vec<String>) -> Result<(), String> {
    let conn = state.db.lock().unwrap();
    // Find the project path
    let project_path: String = conn.query_row(
        "SELECT path FROM projects WHERE id = ?",
        params![project_id], |r| r.get(0)
    ).map_err(|e| e.to_string())?;

    let research_dir = PathBuf::from(&project_path).join(".pilot").join("research");
    let _ = fs::create_dir_all(&research_dir);

    // Clear existing enqueued files
    if research_dir.exists() {
        for entry in fs::read_dir(&research_dir).map_err(|e| e.to_string())? {
            let entry = entry.map_err(|e| e.to_string())?;
            if entry.path().is_file() {
                let _ = fs::remove_file(entry.path());
            }
        }
    }

    // Write checked research files to disk
    for rid in &research_ids {
        let item = conn.query_row(
            "SELECT name, content FROM research WHERE id = ?",
            params![rid],
            |r| Ok((r.get::<_, String>(0)?, r.get::<_, String>(1)?))
        );
        if let Ok((name, content)) = item {
            let file_path = research_dir.join(&name);
            if let Some(parent) = file_path.parent() {
                let _ = fs::create_dir_all(parent);
            }
            let _ = fs::write(&file_path, &content);
        }
    }

    // Write context.json for /pilot command compatibility
    let names: Vec<String> = research_ids.iter().filter_map(|rid| {
        conn.query_row("SELECT name FROM research WHERE id = ?", params![rid], |r| r.get(0)).ok()
    }).map(|name: String| {
        research_dir.join(&name).to_string_lossy().to_string()
    }).collect();
    let json = serde_json::to_string_pretty(&names).unwrap_or_default();
    let _ = fs::write(research_dir.join("context.json"), json);

    Ok(())
}

// ─── Session Version History ────────────────────────────────────────────────

#[tauri::command]
fn list_session_versions(state: tauri::State<AppState>, session_id: String) -> Result<Vec<SessionVersion>, String> {
    let conn = state.db.lock().unwrap();
    let mut stmt = conn.prepare(
        "SELECT id, session_id, iteration, build_script, status, failure_reason, failure_step, session_snapshot, created_at FROM session_versions WHERE session_id = ? ORDER BY iteration"
    ).map_err(|e| e.to_string())?;
    let versions = stmt.query_map(params![session_id], |r| Ok(SessionVersion {
        id: r.get(0)?,
        session_id: r.get(1)?,
        iteration: r.get(2)?,
        build_script: r.get(3)?,
        status: r.get(4)?,
        failure_reason: r.get(5)?,
        failure_step: r.get(6)?,
        session_snapshot: r.get(7)?,
        created_at: r.get(8)?,
    })).map_err(|e| e.to_string())?.filter_map(|r| r.ok()).collect();
    Ok(versions)
}

// ─── Utility Commands ───────────────────────────────────────────────────────

#[tauri::command]
fn import_project_data(state: tauri::State<AppState>, project_id: String, project_path: String) -> Result<String, String> {
    let conn = state.db.lock().unwrap();
    import_legacy_sessions(&conn, &project_id, &project_path);
    import_legacy_research(&conn, &project_id, &project_path);
    let session_count: i32 = conn.query_row(
        "SELECT COUNT(*) FROM sessions WHERE project_id = ?", params![project_id], |r| r.get(0)
    ).unwrap_or(0);
    let research_count: i32 = conn.query_row(
        "SELECT COUNT(*) FROM research WHERE project_id = ?", params![project_id], |r| r.get(0)
    ).unwrap_or(0);
    Ok(format!("Imported: {} sessions, {} research files", session_count, research_count))
}

#[tauri::command]
fn pick_folder() -> Result<Option<String>, String> {
    let output = Command::new("osascript")
        .args(["-e", "POSIX path of (choose folder)"])
        .output()
        .map_err(|e| e.to_string())?;
    if output.status.success() {
        let path = String::from_utf8_lossy(&output.stdout).trim().to_string();
        if path.is_empty() { Ok(None) } else { Ok(Some(path)) }
    } else {
        Ok(None)
    }
}

// ─── Import Legacy Sessions ─────────────────────────────────────────────────

fn import_legacy_sessions(conn: &Connection, project_id: &str, project_path: &str) {
    let sessions_dir = PathBuf::from(project_path).join(".pilot").join("sessions");
    if !sessions_dir.exists() { return; }

    for entry in fs::read_dir(&sessions_dir).into_iter().flatten().flatten() {
        if !entry.path().is_dir() { continue; }
        let file = entry.path().join("session.json");
        if !file.exists() { continue; }
        let content = match fs::read_to_string(&file) { Ok(c) => c, Err(_) => continue };
        let val: serde_json::Value = match serde_json::from_str(&content) { Ok(v) => v, Err(_) => continue };

        let sid = val["id"].as_str().unwrap_or_default().to_string();
        // Skip if already imported
        if conn.query_row("SELECT COUNT(*) FROM sessions WHERE id = ?", params![sid], |r| r.get::<_, i32>(0)).unwrap_or(1) > 0 {
            continue;
        }

        let ts = now();
        let _ = conn.execute(
            "INSERT OR IGNORE INTO sessions (id, project_id, goal, parent_branch, target_branch, status, iteration, context, build_script, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            params![
                sid,
                project_id,
                val["goal"].as_str().unwrap_or(""),
                "",
                "",
                val["status"].as_str().unwrap_or("done"),
                val["iteration"].as_i64().unwrap_or(1),
                val["context"].as_str(),
                None::<String>,
                val["created_at"].as_str().unwrap_or(&ts),
                val["updated_at"].as_str().unwrap_or(&ts),
            ]
        );

        // Import changes
        if let Some(changes) = val["changes"].as_array() {
            for (i, change) in changes.iter().enumerate() {
                let _ = conn.execute(
                    "INSERT OR IGNORE INTO changes (id, session_id, action, path, summary, details, snippet, code, diff, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    params![
                        change["id"].as_str().unwrap_or(&new_id()),
                        sid,
                        change["action"].as_str().unwrap_or(""),
                        change["path"].as_str().unwrap_or(""),
                        change["summary"].as_str().unwrap_or(""),
                        change["details"].as_str(),
                        change["snippet"].as_str(),
                        change["code"].as_str(),
                        change["diff"].as_str(),
                        i as i32,
                    ]
                );
            }
        }

        // Import build.py if exists
        let build_path = entry.path().join("build.py");
        if build_path.exists() {
            if let Ok(script) = fs::read_to_string(&build_path) {
                let _ = conn.execute(
                    "UPDATE sessions SET build_script = ? WHERE id = ?",
                    params![script, sid]
                );
            }
        }
    }
}

// ─── Import Legacy Research ─────────────────────────────────────────────────

fn import_legacy_research(conn: &Connection, project_id: &str, project_path: &str) {
    let research_dir = PathBuf::from(project_path).join(".pilot").join("research");
    if !research_dir.exists() { return; }

    fn walk_and_import(conn: &Connection, project_id: &str, dir: &PathBuf, base: &PathBuf) {
        if let Ok(entries) = fs::read_dir(dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.is_dir() {
                    walk_and_import(conn, project_id, &path, base);
                } else if path.is_file() {
                    let name = path.strip_prefix(base).unwrap_or(&path).to_string_lossy().to_string();
                    if name == "context.json" { continue; }
                    // Skip if already imported
                    let exists: i32 = conn.query_row(
                        "SELECT COUNT(*) FROM research WHERE project_id = ? AND name = ?",
                        params![project_id, name], |r| r.get(0)
                    ).unwrap_or(0);
                    if exists > 0 { continue; }
                    if let Ok(content) = fs::read_to_string(&path) {
                        let ts = now();
                        let _ = conn.execute(
                            "INSERT INTO research (id, project_id, name, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
                            params![Uuid::new_v4().to_string(), project_id, name, content, ts, ts]
                        );
                    }
                }
            }
        }
    }

    walk_and_import(conn, project_id, &research_dir, &research_dir);
}

// ─── Watcher ────────────────────────────────────────────────────────────────

fn setup_watcher(app_handle: tauri::AppHandle, watch_dirs: Vec<PathBuf>) {
    thread::spawn(move || {
        let (tx, rx) = mpsc::channel();
        let mut watcher = match notify::recommended_watcher(move |res: Result<Event, _>| {
            if res.is_ok() {
                let _ = tx.send(());
            }
        }) {
            Ok(w) => w,
            Err(_) => return,
        };

        for dir in &watch_dirs {
            let _ = fs::create_dir_all(dir);
            let _ = watcher.watch(dir, RecursiveMode::Recursive);
        }

        loop {
            if rx.recv().is_ok() {
                while rx.recv_timeout(Duration::from_millis(500)).is_ok() {}
                let _ = app_handle.emit("data-changed", ());
            }
        }
    });
}

// ─── Main ───────────────────────────────────────────────────────────────────

fn main() {
    let app_data = dirs_next::data_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("ai.lee.pilot");
    let _ = fs::create_dir_all(&app_data);
    let db_path = app_data.join("pilot.db");
    let conn = init_db(&db_path);

    tauri::Builder::default()
        .manage(AppState {
            db: Mutex::new(conn),
            current_project_id: Mutex::new(None),
        })
        .invoke_handler(tauri::generate_handler![
            // Projects
            list_projects,
            get_or_create_project,
            set_current_project,
            get_current_project_id,
            // Sessions
            list_sessions,
            get_session,
            delete_session,
            approve_session,
            iterate_session,
            update_session_status,
            save_failure,
            get_build_script,
            // Changes
            delete_change,
            // Comments
            add_comment,
            delete_comment,
            // Research
            list_research,
            add_research,
            update_research,
            rename_research,
            delete_research,
            enqueue_research,
            // History
            list_session_versions,
            // Utility
            pick_folder,
            import_project_data,
        ])
        .setup(|_app| {
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error running tauri application");
}
