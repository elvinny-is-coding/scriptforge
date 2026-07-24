// app/api/groq/improve/fallacies/route.ts
import { NextRequest } from "next/server";
import { groqChat } from "@/lib/groq/client";
import { FALLACIES_SYSTEM_PROMPT } from "@/lib/groq/prompts/fallacies";
import { rateLimit } from "@/lib/utils/rate-limit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(ip, 10, 60000)) {
    return new Response("Too Many Requests", { status: 429 });
  }

  const { messages } = await req.json();
  const userMessage = messages[0]?.content ?? "";

  const result = await groqChat(FALLACIES_SYSTEM_PROMPT, userMessage, {
    temperature: 0.3,
  });
  return new Response(result, {
    headers: { "Content-Type": "application/json" },
  });
}
