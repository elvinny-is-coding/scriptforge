// lib/cloudflare/client.ts

export async function generateImage(prompt: string): Promise<string> {
  const accountId = process.env.CLOUDFLARE_WORKER_AI_ACCOUNT_ID!;
  const apiKey = process.env.CLOUDFLARE_WORKER_AI_API_KEY!;
  const model = "@cf/black-forest-labs/flux-1-schnell";

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Cloudflare AI error: ${error}`);
  }

  const data = await response.json();
  const base64Image: string | undefined = data?.result?.image;

  if (!base64Image) {
    throw new Error("No image returned from Cloudflare AI");
  }

  return base64Image;
}
