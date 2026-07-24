// app/api/cloudflare/generate-image/route.ts
import { NextRequest } from "next/server";
import { generateImage } from "@/lib/cloudflare/client";
import { rateLimit } from "@/lib/utils/rate-limit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(ip, 5, 60000)) {
    return new Response("Too Many Requests", { status: 429 });
  }

  const { prompt } = await req.json();
  if (!prompt) return new Response("Missing prompt", { status: 400 });

  try {
    const base64Image = await generateImage(prompt);
    return new Response(JSON.stringify({ image: base64Image }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(err.message, { status: 500 });
  }
}
