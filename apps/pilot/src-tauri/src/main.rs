#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use chrono::Utc;
use notify::{Event, RecursiveMode, Watcher};
use serde::{Deserialize, Serialize};
use tauri::Emitter;
use std::fs;
use std::io::{BufRead, BufReader};
use std::path::PathBuf;
use std::process::{Command, Stdio};
use std::sync::{mpsc, Mutex};
use std::thread;
use std::time::Duration;

#[derive(Debug, Serialize, Deserialize, Clone)]
struct Comment {
    id: String,
    text: String,
    created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct Change {
    id: String,
    action: String,
    path: String,
    summary: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    details: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    snippet: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    code: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    diff: Option<String>,
    comments: Vec<Comment>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct Session {
    id: String,
    goal: String,
    status: String,
    created_at: String,
    updated_at: String,
    changes: Vec<Change>,
    global_comments: Vec<Comment>,
    script: String,
    iteration: i32,
    #[serde(skip_serializing_if = "Option::is_none")]
    ticket: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    summary: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    context: Option<String>,
}

struct AppState {
    sessions_dir: Mutex<PathBuf>,
    project_root: Mutex<PathBuf>,
}

fn now() -> String {
    Utc::now().to_rfc3339()
}

fn sessions_dir(state: &AppState) -> PathBuf {
    state.sessions_dir.lock().unwrap().clone()
}

fn project_root(state: &AppState) -> PathBuf {
    state.project_root.lock().unwrap().clone()
}

fn read_session(state: &AppState, id: &str) -> Result<Session, String> {
    let file = sessions_dir(state).join(id).join("session.json");
    let content = fs::read_to_string(&file).map_err(|e| format!("Read failed: {e}"))?;
    serde_json::from_str(&content).map_err(|e| format!("Parse failed: {e}"))
}

fn persist(state: &AppState, session: &mut Session) -> Result<(), String> {
    session.updated_at = now();
    let dir = sessions_dir(state).join(&session.id);
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let json = serde_json::to_string_pretty(session).map_err(|e| e.to_string())?;
    fs::write(dir.join("session.json"), json).map_err(|e| e.to_string())
}

#[tauri::command]
fn list_sessions(state: tauri::State<AppState>) -> Result<Vec<Session>, String> {
    let dir = sessions_dir(&state);
    if !dir.exists() {
        return Ok(vec![]);
    }
    let mut sessions = vec![];
    for entry in fs::read_dir(&dir).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        if entry.path().is_dir() {
            let file = entry.path().join("session.json");
            if file.exists() {
                if let Ok(content) = fs::read_to_string(&file) {
                    if let Ok(s) = serde_json::from_str::<Session>(&content) {
                        sessions.push(s);
                    }
                }
            }
        }
    }
    sessions.sort_by(|a, b| b.created_at.cmp(&a.created_at));
    Ok(sessions)
}

#[tauri::command]
fn get_session(state: tauri::State<AppState>, id: String) -> Result<Session, String> {
    read_session(&state, &id)
}

#[tauri::command]
fn get_script(state: tauri::State<AppState>, id: String) -> Result<String, String> {
    let session = read_session(&state, &id)?;
    let file = sessions_dir(&state).join(&id).join(&session.script);
    fs::read_to_string(&file).map_err(|e| format!("Script read failed: {e}"))
}

#[tauri::command]
fn get_context(state: tauri::State<AppState>, id: String) -> Result<String, String> {
    let session = read_session(&state, &id)?;
    Ok(session.context.unwrap_or_default())
}

#[tauri::command]
fn add_comment(
    state: tauri::State<AppState>,
    id: String,
    change_id: Option<String>,
    text: String,
) -> Result<Session, String> {
    let mut session = read_session(&state, &id)?;
    let comment = Comment {
        id: format!("cmt-{}", Utc::now().timestamp_millis()),
        text,
        created_at: now(),
    };
    if let Some(cid) = change_id {
        if let Some(change) = session.changes.iter_mut().find(|c| c.id == cid) {
            change.comments.push(comment);
        }
    } else {
        session.global_comments.push(comment);
    }
    session.status = "reviewing".to_string();
    persist(&state, &mut session)?;
    Ok(session)
}

#[tauri::command]
fn delete_comment(
    state: tauri::State<AppState>,
    id: String,
    change_id: Option<String>,
    comment_id: String,
) -> Result<Session, String> {
    let mut session = read_session(&state, &id)?;
    if let Some(cid) = change_id {
        if let Some(change) = session.changes.iter_mut().find(|c| c.id == cid) {
            change.comments.retain(|c| c.id != comment_id);
        }
    } else {
        session.global_comments.retain(|c| c.id != comment_id);
    }
    let total: usize = session.changes.iter().map(|c| c.comments.len()).sum::<usize>()
        + session.global_comments.len();
    if total == 0 && session.status == "reviewing" {
        session.status = "awaiting_review".to_string();
    }
    persist(&state, &mut session)?;
    Ok(session)
}

#[tauri::command]
fn delete_change(
    state: tauri::State<AppState>,
    id: String,
    change_id: String,
) -> Result<Session, String> {
    let mut session = read_session(&state, &id)?;
    session.changes.retain(|c| c.id != change_id);
    persist(&state, &mut session)?;
    Ok(session)
}

#[tauri::command]
fn approve_session(state: tauri::State<AppState>, id: String) -> Result<Session, String> {
    let mut session = read_session(&state, &id)?;
    session.status = "approved".to_string();
    persist(&state, &mut session)?;
    Ok(session)
}

#[tauri::command]
fn iterate_session(state: tauri::State<AppState>, id: String) -> Result<Session, String> {
    let mut session = read_session(&state, &id)?;
    session.status = "iterating".to_string();
    persist(&state, &mut session)?;
    Ok(session)
}

#[tauri::command]
fn execute_pilot_run(
    state: tauri::State<AppState>,
    app: tauri::AppHandle,
    id: String,
) -> Result<i32, String> {
    let script = sessions_dir(&state).join(&id).join("build.py");
    if !script.exists() {
        return Err("build.py not found".to_string());
    }

    let root = project_root(&state);
    let mut child = Command::new("python3")
        .arg(&script)
        .current_dir(&root)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to spawn: {e}"))?;

    // Stream stdout
    if let Some(stdout) = child.stdout.take() {
        let app_handle = app.clone();
        thread::spawn(move || {
            let reader = BufReader::new(stdout);
            for line in reader.lines() {
                if let Ok(line) = line {
                    let _ = app_handle.emit("exec-output", &line);
                }
            }
        });
    }

    // Stream stderr
    if let Some(stderr) = child.stderr.take() {
        let app_handle = app.clone();
        thread::spawn(move || {
            let reader = BufReader::new(stderr);
            for line in reader.lines() {
                if let Ok(line) = line {
                    let _ = app_handle.emit("exec-output", &format!("[stderr] {line}"));
                }
            }
        });
    }

    let status = child.wait().map_err(|e| format!("Wait failed: {e}"))?;
    let code = status.code().unwrap_or(-1);

    // Update session status based on exit code
    if let Ok(mut session) = read_session(&state, &id) {
        if code == 0 {
            session.status = "done".to_string();
            session.summary = Some("Build script executed successfully.".to_string());
        } else {
            session.status = "failed".to_string();
            session.summary = Some(format!("Build script exited with code {code}"));
        }
        let _ = persist(&state, &mut session);
    }

    let _ = app.emit("exec-done", code);
    Ok(code)
}

#[tauri::command]
fn get_project_root(state: tauri::State<AppState>) -> String {
    project_root(&state).to_string_lossy().to_string()
}

#[tauri::command]
fn set_project_root(state: tauri::State<AppState>, path: String) -> Result<String, String> {
    let new_root = PathBuf::from(&path);
    if !new_root.exists() {
        return Err("Path does not exist".to_string());
    }
    let new_sessions = new_root.join(".pilot").join("sessions");
    let _ = fs::create_dir_all(&new_sessions);
    *state.project_root.lock().unwrap() = new_root;
    *state.sessions_dir.lock().unwrap() = new_sessions;
    Ok(path)
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

#[tauri::command]
fn delete_session(state: tauri::State<AppState>, id: String) -> Result<(), String> {
    let dir = sessions_dir(&state).join(&id);
    if dir.exists() {
        fs::remove_dir_all(&dir).map_err(|e| e.to_string())?;
    }
    Ok(())
}

fn walk_dir(dir: &std::path::Path, files: &mut Vec<String>) {
    if let Ok(entries) = fs::read_dir(dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                walk_dir(&path, files);
            } else if path.is_file() {
                files.push(path.to_string_lossy().to_string());
            }
        }
    }
}

#[tauri::command]
fn list_research_files(state: tauri::State<AppState>) -> Result<Vec<String>, String> {
    let dir = project_root(&state).join(".pilot").join("research");
    if !dir.exists() {
        return Ok(vec![]);
    }
    let mut files = vec![];
    walk_dir(&dir, &mut files);
    files.sort();
    Ok(files)
}

#[tauri::command]
fn get_research_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| format!("Failed to read: {e}"))
}

#[tauri::command]
fn get_research_context(state: tauri::State<AppState>) -> Result<Vec<String>, String> {
    let file = project_root(&state).join(".pilot").join("research").join("context.json");
    if !file.exists() {
        return Ok(vec![]);
    }
    let content = fs::read_to_string(&file).map_err(|e| e.to_string())?;
    serde_json::from_str(&content).map_err(|e| e.to_string())
}

#[tauri::command]
fn set_research_context(state: tauri::State<AppState>, checked: Vec<String>) -> Result<(), String> {
    let dir = project_root(&state).join(".pilot").join("research");
    let _ = fs::create_dir_all(&dir);
    let json = serde_json::to_string_pretty(&checked).map_err(|e| e.to_string())?;
    fs::write(dir.join("context.json"), json).map_err(|e| e.to_string())
}

fn setup_watcher(app_handle: tauri::AppHandle, pilot_dir: PathBuf) {
    thread::spawn(move || {
        let (tx, rx) = mpsc::channel();

        let mut watcher = match notify::recommended_watcher(move |res: Result<Event, _>| {
            if let Ok(event) = res {
                let dominated_by = |dir: &str| event.paths.iter().any(|p| p.to_string_lossy().contains(dir));
                if dominated_by("/sessions/") {
                    let _ = tx.send("sessions-changed");
                } else if dominated_by("/research/") {
                    let _ = tx.send("research-changed");
                }
            }
        }) {
            Ok(w) => w,
            Err(e) => {
                eprintln!("Failed to create watcher: {e}");
                return;
            }
        };

        // Watch the entire .pilot/ directory
        if let Err(e) = watcher.watch(&pilot_dir, RecursiveMode::Recursive) {
            eprintln!("Failed to watch {}: {e}", pilot_dir.display());
            return;
        }

        // Debounce: wait 500ms after last event before emitting
        loop {
            if let Ok(event_name) = rx.recv() {
                // Drain rapid-fire events
                let mut last = event_name;
                while let Ok(e) = rx.recv_timeout(Duration::from_millis(500)) {
                    last = e;
                }
                // Emit both if either changed
                let _ = app_handle.emit("sessions-changed", ());
                if last == "research-changed" || event_name == "research-changed" {
                    let _ = app_handle.emit("research-changed", ());
                }
            }
        }
    });
}

fn find_project_root() -> PathBuf {
    let mut dir = std::env::current_dir().expect("Failed to get cwd");
    loop {
        if dir.join(".pilot").exists() || dir.join(".git").exists() {
            return dir;
        }
        if !dir.pop() {
            return std::env::current_dir().expect("Failed to get cwd");
        }
    }
}

fn main() {
    let project_root = find_project_root();
    let sessions_dir = project_root.join(".pilot").join("sessions");

    // Ensure sessions dir exists for watcher
    let _ = fs::create_dir_all(&sessions_dir);

    let pilot_dir = project_root.join(".pilot");
    let _ = fs::create_dir_all(pilot_dir.join("research"));

    tauri::Builder::default()
        .manage(AppState {
            sessions_dir: Mutex::new(sessions_dir),
            project_root: Mutex::new(project_root),
        })
        .invoke_handler(tauri::generate_handler![
            list_sessions,
            get_session,
            get_script,
            get_context,
            add_comment,
            delete_comment,
            delete_change,
            approve_session,
            iterate_session,
            execute_pilot_run,
            get_project_root,
            set_project_root,
            pick_folder,
            delete_session,
            list_research_files,
            get_research_file,
            get_research_context,
            set_research_context,
        ])
        .setup(move |app| {
            setup_watcher(app.handle().clone(), pilot_dir.clone());
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error running tauri application");
}
