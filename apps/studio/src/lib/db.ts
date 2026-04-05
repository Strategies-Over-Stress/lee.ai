import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.resolve(
  process.cwd(),
  "..",
  "research",
  "research.db",
);

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH, { readonly: false });
    _db.pragma("journal_mode = WAL");
    _db.pragma("foreign_keys = ON");

    // Ensure queue table exists
    _db.exec(`
      CREATE TABLE IF NOT EXISTS drafts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        generator TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        source_article_ids TEXT,
        collection_id INTEGER REFERENCES collections(id),
        extra_prompt TEXT,
        status TEXT NOT NULL DEFAULT 'draft',
        scheduled_at TEXT,
        published_at TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_drafts_status ON drafts(status);
      CREATE INDEX IF NOT EXISTS idx_drafts_generator ON drafts(generator);

      CREATE TABLE IF NOT EXISTS collections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS collection_articles (
        collection_id INTEGER NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
        article_id INTEGER NOT NULL REFERENCES articles(id),
        PRIMARY KEY (collection_id, article_id)
      );
    `);
  }
  return _db;
}

export interface Article {
  id: number;
  source_id: number;
  url: string;
  title: string;
  clean_content: string;
  summary: string | null;
  word_count: number;
  fetched_at: string;
  source_name: string;
}

export interface Draft {
  id: number;
  generator: string;
  title: string;
  content: string;
  source_article_ids: string | null;
  collection_id: number | null;
  extra_prompt: string | null;
  status: string;
  scheduled_at: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export function getArticles(limit = 50, search?: string): Article[] {
  const db = getDb();
  if (search) {
    const q = `%${search}%`;
    return db
      .prepare(
        `SELECT a.*, s.name as source_name
         FROM articles a JOIN sources s ON a.source_id = s.id
         WHERE s.status = 'approved'
           AND (a.title LIKE ? OR a.clean_content LIKE ? OR a.summary LIKE ?)
         ORDER BY a.fetched_at DESC LIMIT ?`,
      )
      .all(q, q, q, limit) as Article[];
  }
  return db
    .prepare(
      `SELECT a.*, s.name as source_name
       FROM articles a JOIN sources s ON a.source_id = s.id
       WHERE s.status = 'approved'
       ORDER BY a.fetched_at DESC LIMIT ?`,
    )
    .all(limit) as Article[];
}

export function getArticle(id: number): Article | undefined {
  const db = getDb();
  return db
    .prepare(
      `SELECT a.*, s.name as source_name
       FROM articles a JOIN sources s ON a.source_id = s.id
       WHERE a.id = ?`,
    )
    .get(id) as Article | undefined;
}

export function getArticlesByIds(ids: number[]): Article[] {
  const db = getDb();
  const placeholders = ids.map(() => "?").join(",");
  return db
    .prepare(
      `SELECT a.*, s.name as source_name
       FROM articles a JOIN sources s ON a.source_id = s.id
       WHERE a.id IN (${placeholders})`,
    )
    .all(...ids) as Article[];
}

export function createDraft(
  generator: string,
  title: string,
  content: string,
  articleIds: number[],
  collectionId?: number | null,
  extraPrompt?: string | null,
): Draft {
  const db = getDb();
  const result = db
    .prepare(
      `INSERT INTO drafts (generator, title, content, source_article_ids, collection_id, extra_prompt)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(generator, title, content, JSON.stringify(articleIds), collectionId ?? null, extraPrompt ?? null);
  return db
    .prepare("SELECT * FROM drafts WHERE id = ?")
    .get(result.lastInsertRowid) as Draft;
}

export function getDrafts(status?: string): Draft[] {
  const db = getDb();
  if (status) {
    return db
      .prepare("SELECT * FROM drafts WHERE status = ? ORDER BY created_at DESC")
      .all(status) as Draft[];
  }
  return db
    .prepare("SELECT * FROM drafts ORDER BY created_at DESC")
    .all() as Draft[];
}

export function getDraft(id: number): Draft | undefined {
  const db = getDb();
  return db.prepare("SELECT * FROM drafts WHERE id = ?").get(id) as
    | Draft
    | undefined;
}

export function updateDraftStatus(id: number, status: string): void {
  const db = getDb();
  const extra =
    status === "published" ? ", published_at = datetime('now')" : "";
  db.prepare(
    `UPDATE drafts SET status = ?, updated_at = datetime('now')${extra} WHERE id = ?`,
  ).run(status, id);
}

export function updateDraftContent(
  id: number,
  title: string,
  content: string,
): void {
  const db = getDb();
  db.prepare(
    "UPDATE drafts SET title = ?, content = ?, updated_at = datetime('now') WHERE id = ?",
  ).run(title, content, id);
}

// ---------------------------------------------------------------------------
// Sources
// ---------------------------------------------------------------------------

export interface Source {
  id: number;
  url: string;
  name: string;
  domain: string;
  status: string;
  added_at: string;
  last_synced_at: string | null;
  article_count: number;
}

export function getSources(status?: string): Source[] {
  const db = getDb();
  const where = status ? "WHERE s.status = ?" : "";
  const params = status ? [status] : [];
  return db
    .prepare(
      `SELECT s.*, COUNT(a.id) as article_count
       FROM sources s
       LEFT JOIN articles a ON s.id = a.source_id
       ${where}
       GROUP BY s.id
       ORDER BY s.status, s.name`,
    )
    .all(...params) as Source[];
}

export function addSource(url: string, name?: string): Source | null {
  const db = getDb();
  const domain = url.replace(/^https?:\/\//, "").split("/")[0];
  try {
    const result = db
      .prepare("INSERT INTO sources (url, name, domain, status) VALUES (?, ?, ?, 'pending')")
      .run(url, name || domain, domain);
    return db.prepare("SELECT *, 0 as article_count FROM sources WHERE id = ?").get(result.lastInsertRowid) as Source;
  } catch {
    return null;
  }
}

export function updateSourceStatus(id: number, status: string): void {
  const db = getDb();
  db.prepare("UPDATE sources SET status = ? WHERE id = ?").run(status, id);
}

export function deleteSource(id: number): void {
  const db = getDb();
  db.prepare("DELETE FROM sources WHERE id = ?").run(id);
}

// ---------------------------------------------------------------------------
// Collections
// ---------------------------------------------------------------------------

export interface Collection {
  id: number;
  name: string;
  created_at: string;
  article_count: number;
}

export function getCollections(): Collection[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT c.*, COUNT(ca.article_id) as article_count
       FROM collections c
       LEFT JOIN collection_articles ca ON c.id = ca.collection_id
       GROUP BY c.id
       ORDER BY c.created_at DESC`,
    )
    .all() as Collection[];
}

export function createCollection(name: string, articleIds: number[]): Collection {
  const db = getDb();
  const result = db
    .prepare("INSERT INTO collections (name) VALUES (?)")
    .run(name);
  const collectionId = result.lastInsertRowid as number;

  const insert = db.prepare(
    "INSERT OR IGNORE INTO collection_articles (collection_id, article_id) VALUES (?, ?)",
  );
  for (const articleId of articleIds) {
    insert.run(collectionId, articleId);
  }

  return {
    id: collectionId,
    name,
    created_at: new Date().toISOString(),
    article_count: articleIds.length,
  };
}

export function getCollectionArticleIds(collectionId: number): number[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT article_id FROM collection_articles WHERE collection_id = ?")
    .all(collectionId) as { article_id: number }[];
  return rows.map((r) => r.article_id);
}

export function deleteCollection(id: number): void {
  const db = getDb();
  db.prepare("DELETE FROM collections WHERE id = ?").run(id);
}

export function getStats() {
  const db = getDb();
  return {
    articles: (db.prepare("SELECT COUNT(*) as cnt FROM articles").get() as { cnt: number }).cnt,
    summarized: (db.prepare("SELECT COUNT(*) as cnt FROM articles WHERE summary IS NOT NULL").get() as { cnt: number }).cnt,
    drafts: (db.prepare("SELECT COUNT(*) as cnt FROM drafts").get() as { cnt: number }).cnt,
    approved: (db.prepare("SELECT COUNT(*) as cnt FROM drafts WHERE status = 'approved'").get() as { cnt: number }).cnt,
    published: (db.prepare("SELECT COUNT(*) as cnt FROM drafts WHERE status = 'published'").get() as { cnt: number }).cnt,
  };
}
