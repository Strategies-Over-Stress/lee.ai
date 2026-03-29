import { NextRequest, NextResponse } from "next/server";
import { getArticlesByIds, createDraft } from "@/lib/db";
import { getGenerator } from "@/generators";

export async function POST(req: NextRequest) {
  const { generatorId, articleIds, extraPrompt, collectionId } = await req.json();

  const generator = getGenerator(generatorId);
  if (!generator) {
    return NextResponse.json({ error: "Unknown generator" }, { status: 400 });
  }

  const articles = getArticlesByIds(articleIds);
  if (articles.length === 0) {
    return NextResponse.json({ error: "No articles found" }, { status: 400 });
  }

  // Build the user message from article summaries
  const articleContext = articles
    .map(
      (a) =>
        `### ${a.title}\nSource: ${a.source_name} (${a.url})\n${a.summary || a.clean_content.slice(0, 2000)}`,
    )
    .join("\n\n---\n\n");

  let userMessage = `Based on the following research articles, generate content:\n\n${articleContext}`;

  if (extraPrompt) {
    userMessage += `\n\n---\n\nADDITIONAL INSTRUCTIONS FROM THE USER:\n${extraPrompt}`;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured" },
      { status: 500 },
    );
  }

  // Call Anthropic API — text-in, text-out, no tools
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: generator.model,
      max_tokens: generator.maxTokens,
      system: generator.system,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    return NextResponse.json(
      { error: `Anthropic API error: ${error}` },
      { status: 502 },
    );
  }

  const data = await response.json();
  const content = data.content[0].text;

  // Extract a title from the first line or generate one
  const firstLine = content.split("\n")[0].replace(/^[#*\s]+/, "").slice(0, 100);
  const title = firstLine || `${generator.name} — ${new Date().toISOString().split("T")[0]}`;

  // Save as draft with full provenance
  const draft = createDraft(generator.id, title, content, articleIds, collectionId, extraPrompt);

  return NextResponse.json({ draft });
}
