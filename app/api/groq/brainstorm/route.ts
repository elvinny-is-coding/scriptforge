// app/api/groq/brainstorm/route.ts
import { NextRequest } from "next/server";
import { groqChatStream } from "@/lib/groq/client";
import { BRAINSTORM_SYSTEM_PROMPT } from "@/lib/groq/prompts/brainstorm";
import { rateLimit } from "@/lib/utils/rate-limit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(ip, 10, 60000)) {
    return new Response("Too Many Requests", { status: 429 });
  }

  const { messages, context } = await req.json();

  const contextStr = context?.sceneContent
    ? `\n\nCurrent scene:\n${context.sceneContent}`
    : "";

  const userMessage = messages
    .map((m: any) => `${m.role}: ${m.content}`)
    .join("\n");

  const stream = await groqChatStream(
    BRAINSTORM_SYSTEM_PROMPT,
    userMessage + contextStr,
  );

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
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "x-content-type-options": "nosniff",
    },
  });
}
