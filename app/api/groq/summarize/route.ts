// app/api/groq/summarize/route.ts
import { NextRequest, NextResponse } from "next/server";
import { groqChat } from "@/lib/groq/client";
import { rateLimit } from "@/lib/utils/rate-limit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(ip, 10, 60000)) {
    return new Response("Too Many Requests", { status: 429 });
  }

  const { sceneContent } = await req.json();
  if (!sceneContent) {
    return NextResponse.json(
      { error: "Missing sceneContent" },
      { status: 400 },
    );
  }

  // Extract text content from Lexical JSON
  let text = "";
  try {
    const obj =
      typeof sceneContent === "string"
        ? JSON.parse(sceneContent)
        : sceneContent;
    if (obj?.root?.children) {
      text = obj.root.children
        .map((child: any) => child.children?.map((c: any) => c.text).join(" "))
        .join(" ")
        .trim();
    }
  } catch {
    text = String(sceneContent);
  }

  if (!text) {
    return NextResponse.json({ summary: "Empty scene" });
  }

  const systemPrompt =
    "You are a script assistant. Summarize the following scene in one concise sentence that captures the main action, characters, and tone.";

  try {
    const summary = await groqChat(systemPrompt, text, {
      temperature: 0.5,
      maxTokens: 100,
    });
    return NextResponse.json({ summary: summary.trim() });
  } catch (err: any) {
    console.error("Groq summarization error:", err);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 },
    );
  }
}
