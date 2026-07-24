// app/api/cloudflare/refine-prompt/route.ts
import { NextRequest } from "next/server";
import { groqChat } from "@/lib/groq/client";
import { REFINE_PROMPT_SYSTEM } from "@/lib/groq/prompts/refine-prompt";
import { rateLimit } from "@/lib/utils/rate-limit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(ip, 10, 60000)) {
    return new Response("Too Many Requests", { status: 429 });
  }

  const { sceneText, styleSheet } = await req.json();
  if (!sceneText) return new Response("Missing sceneText", { status: 400 });

  const userMessage = `Scene description: ${sceneText}\nStyle: ${JSON.stringify(styleSheet)}`;
  const refined = await groqChat(REFINE_PROMPT_SYSTEM, userMessage, {
    temperature: 0.7,
  });
  return new Response(refined, { headers: { "Content-Type": "text/plain" } });
}
