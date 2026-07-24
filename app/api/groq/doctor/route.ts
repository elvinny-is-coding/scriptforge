// app/api/groq/doctor/route.ts
import { NextRequest } from "next/server";
import { groqChatStream } from "@/lib/groq/client";
import { DOCTOR_SYSTEM_PROMPT } from "@/lib/groq/prompts/doctor";
import { chunkScript } from "@/lib/groq/chunking";
import { rateLimit } from "@/lib/utils/rate-limit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(ip, 3, 120000)) {
    return new Response("Too Many Requests", { status: 429 });
  }

  const { messages } = await req.json();
  const fullScript = messages[0]?.content ?? "";

  // Split into manageable chunks, analyze each, then synthesize
  const chunks = chunkScript(fullScript, 3000);

  // For simplicity, we'll just use the first chunk for MVP;
  // a full implementation would chain multiple calls and summarize.
  const userMessage = `Analyze the following script for narrative issues:\n\n${chunks[0] || fullScript}`;

  const stream = await groqChatStream(DOCTOR_SYSTEM_PROMPT, userMessage);

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? "";
        controller.enqueue(encoder.encode(text));
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
