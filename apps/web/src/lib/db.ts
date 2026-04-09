import Database from "better-sqlite3";
import crypto from "crypto";
import path from "path";

const IP_SALT = process.env.IP_SALT || "lee-ai-ip-hash-salt-v1";

export function hashIp(ip: string): string {
  return crypto.createHmac("sha256", IP_SALT).update(ip).digest("hex");
}

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (db) return db;

  const dbPath = path.join(process.cwd(), "data", "assessments.db");
  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS assessments (
      id TEXT PRIMARY KEY,
      answers TEXT NOT NULL,
      total_score INTEGER NOT NULL,
      potential_revenue INTEGER NOT NULL,
      result_profile TEXT NOT NULL,
      contact_name TEXT,
      contact_email TEXT,
      contact_phone TEXT,
      consultation_requested INTEGER NOT NULL DEFAULT 0,
      business_description TEXT,
      preferred_time TEXT,
      ip_address TEXT,
      created_at TEXT NOT NULL
    )
  `);

  return db;
}

export interface AssessmentRow {
  id: string;
  answers: string;
  total_score: number;
  potential_revenue: number;
  result_profile: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  consultation_requested: number;
  business_description: string | null;
  preferred_time: string | null;
  ip_address: string | null;
  created_at: string;
}

export function insertAssessment(data: {
  id: string;
  answers: string;
  totalScore: number;
  potentialRevenue: number;
  resultProfile: string;
  ipAddress: string | null;
}): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO assessments (id, answers, total_score, potential_revenue, result_profile, ip_address, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    data.id,
    data.answers,
    data.totalScore,
    data.potentialRevenue,
    data.resultProfile,
    data.ipAddress,
    new Date().toISOString()
  );
}

export function updateConsultation(data: {
  assessmentId: string;
  name: string;
  email: string;
  phone: string | null;
  preferredTime: string;
  businessDescription: string;
}): boolean {
  const db = getDb();
  const result = db.prepare(`
    UPDATE assessments
    SET contact_name = ?, contact_email = ?, contact_phone = ?,
        preferred_time = ?, business_description = ?,
        consultation_requested = 1
    WHERE id = ?
  `).run(
    data.name,
    data.email,
    data.phone,
    data.preferredTime,
    data.businessDescription,
    data.assessmentId
  );
  return result.changes > 0;
}

export function getAssessment(id: string): AssessmentRow | undefined {
  const db = getDb();
  return db.prepare("SELECT * FROM assessments WHERE id = ?").get(id) as AssessmentRow | undefined;
}
