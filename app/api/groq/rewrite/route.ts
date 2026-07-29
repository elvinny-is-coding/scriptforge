// app/api/groq/rewrite/route.ts
import { NextRequest, NextResponse } from "next/server";
import { groqChat } from "@/lib/groq/client";
import { rateLimit } from "@/lib/utils/rate-limit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(ip, 10, 60000)) {
    return new Response("Too Many Requests", { status: 429 });
  }

  const { text } = await req.json();
  if (!text) {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }

  const systemPrompt = `You are a script editor. Given a line of dialogue or action, provide 2–3 alternative versions that retain the original meaning but offer different tones or phrasings. Return ONLY a JSON array of strings, with no additional text. Example: ["alternative 1", "alternative 2"]`;

  try {
    const result = await groqChat(systemPrompt, text, {
      temperature: 0.8,
      maxTokens: 300,
    });
    // Try to parse as JSON array, or fallback to raw text
    let alternatives: string[] = [];
    try {
      const cleaned = result.replace(/```json\n?|\n?```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) alternatives = parsed;
    } catch {
      alternatives = result
        .split(/\d+\.\s/)
        .filter(Boolean)
        .map((s) => s.trim());
    }
    return NextResponse.json({ alternatives });
  } catch (err: any) {
    console.error("Groq rewrite error:", err);
    return NextResponse.json(
      { error: "Failed to generate alternatives" },
      { status: 500 },
    );
  }
}
