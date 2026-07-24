// lib/groq/client.ts
import Groq from "groq-sdk";
import { GROQ_MODEL } from "@/lib/constants";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function groqChat(
  systemPrompt: string,
  userMessage: string,
  options?: { temperature?: number; maxTokens?: number },
) {
  const response = await groq.chat.completions.create({
    model: GROQ_MODEL, // ← use constant
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 2048,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
  });
  return response.choices[0]?.message?.content ?? "";
}

export async function groqChatStream(
  systemPrompt: string,
  userMessage: string,
  options?: { temperature?: number; maxTokens?: number },
) {
  const stream = await groq.chat.completions.create({
    model: GROQ_MODEL, // ← use constant
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 2048,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    stream: true,
  });
  return stream;
}
