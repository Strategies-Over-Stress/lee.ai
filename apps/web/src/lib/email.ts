import type { AssessmentRow } from "./db";

interface LeadEmailParams {
  name: string;
  email: string;
  phone: string | null;
  preferredTime: string;
  businessDescription: string;
  assessment: AssessmentRow;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function parseResultTitle(resultProfile: string): string {
  try {
    const parsed = JSON.parse(resultProfile) as { title?: string };
    return parsed.title ?? "Unknown";
  } catch {
    return "Unknown";
  }
}

// Collapse CR/LF/extra whitespace — used for any value that lands in a mail
// header (e.g. Subject) to prevent header injection from user input.
function oneLine(s: string): string {
  return s.replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim();
}

// Flatten the stored quiz answers into readable [question, answer] pairs.
function parseAnswers(answersJson: string): Array<[string, string]> {
  try {
    const obj = JSON.parse(answersJson) as Record<string, unknown>;
    return Object.entries(obj).map(([k, v]) => {
      let val: string;
      if (v && typeof v === "object") {
        const o = v as Record<string, unknown>;
        val = o.value != null ? String(o.value) : JSON.stringify(v);
      } else {
        val = String(v);
      }
      return [k, val];
    });
  } catch {
    return [];
  }
}

const TIMEOUT_MS = 10_000;

/**
 * Send the lead-notification email via the Mailgun HTTP API.
 *
 * Returns true on a 2xx from Mailgun, false otherwise. Never throws — the
 * caller has already persisted the lead, so an email hiccup must not turn
 * into a failed submission.
 */
export async function sendLeadNotification(params: LeadEmailParams): Promise<boolean> {
  const apiKey = process.env.MAILGUN_API_KEY?.trim();
  const domain = process.env.MAILGUN_DOMAIN?.trim() || "mg.notsaas.net";
  const from = process.env.MAILGUN_FROM?.trim() || `NotSaaS Leads <leads@${domain}>`;
  const to = process.env.LEADS_NOTIFY_EMAIL?.trim();

  if (!apiKey) {
    console.warn("[email] MAILGUN_API_KEY not set — skipping lead notification");
    return false;
  }
  if (!to) {
    console.warn("[email] LEADS_NOTIFY_EMAIL not set — skipping lead notification");
    return false;
  }

  const { name, email, phone, preferredTime, businessDescription, assessment } = params;
  const resultTitle = parseResultTitle(assessment.result_profile);
  const potential = `$${assessment.potential_revenue.toLocaleString()}`;
  const answers = parseAnswers(assessment.answers);

  // oneLine() strips CR/LF from the user-controlled values before they enter
  // the Subject header (header-injection defense).
  const subject = `New consultation request — ${oneLine(name)} (${oneLine(resultTitle)})`;

  const text = [
    `New consultation request from notsaas.net`,
    ``,
    `Name:              ${name}`,
    `Email:             ${email}`,
    `Phone:             ${phone || "(not provided)"}`,
    `Best time to chat: ${preferredTime}`,
    ``,
    `About their business:`,
    businessDescription,
    ``,
    `--- Assessment ---`,
    `Result profile:    ${resultTitle}`,
    `Total score:       ${assessment.total_score}`,
    `Potential revenue: ${potential}`,
    `Submitted:         ${assessment.created_at}`,
    `Assessment ID:     ${assessment.id}`,
    ``,
    `Quiz answers:`,
    ...(answers.length ? answers.map(([q, a]) => `  ${q}: ${a}`) : ["  (none recorded)"]),
  ].join("\n");

  const html = `
    <h2>New consultation request from notsaas.net</h2>
    <table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
      <tr><td><strong>Name</strong></td><td>${escapeHtml(name)}</td></tr>
      <tr><td><strong>Email</strong></td><td><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
      <tr><td><strong>Phone</strong></td><td>${phone ? escapeHtml(phone) : "(not provided)"}</td></tr>
      <tr><td><strong>Best time to chat</strong></td><td>${escapeHtml(preferredTime)}</td></tr>
    </table>
    <h3>About their business</h3>
    <p style="font-family:sans-serif;font-size:14px;white-space:pre-wrap">${escapeHtml(businessDescription)}</p>
    <h3>Assessment</h3>
    <table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
      <tr><td><strong>Result profile</strong></td><td>${escapeHtml(resultTitle)}</td></tr>
      <tr><td><strong>Total score</strong></td><td>${assessment.total_score}</td></tr>
      <tr><td><strong>Potential revenue</strong></td><td>${potential}</td></tr>
      <tr><td><strong>Submitted</strong></td><td>${escapeHtml(assessment.created_at)}</td></tr>
      <tr><td><strong>Assessment ID</strong></td><td>${escapeHtml(assessment.id)}</td></tr>
    </table>
    <h3>Quiz answers</h3>
    <table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
      ${
        answers.length
          ? answers
              .map(
                ([q, a]) =>
                  `<tr><td><strong>${escapeHtml(q)}</strong></td><td>${escapeHtml(a)}</td></tr>`
              )
              .join("")
          : `<tr><td colspan="2">(none recorded)</td></tr>`
      }
    </table>
  `;

  const form = new URLSearchParams();
  form.set("from", from);
  form.set("to", to);
  form.set("subject", subject);
  form.set("text", text);
  form.set("html", html);
  form.set("h:Reply-To", email);

  try {
    const res = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`api:${apiKey}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form.toString(),
      // Bound the request so a hung Mailgun/network can't delay the route.
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`[email] Mailgun send failed (${res.status}): ${detail.slice(0, 300)}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] Mailgun send threw:", err instanceof Error ? err.message : err);
    return false;
  }
}
