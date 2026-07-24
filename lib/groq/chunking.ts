// lib/groq/chunking.ts
export function chunkScript(
  script: string,
  maxLength: number = 4000,
): string[] {
  const scenes = script.split(/\n\n(?=(?:INT\.|EXT\.|INT\.\/EXT\.|I\/E\.))/);
  const chunks: string[] = [];
  let current = "";

  for (const scene of scenes) {
    if (current.length + scene.length > maxLength && current.length > 0) {
      chunks.push(current.trim());
      current = scene;
    } else {
      current += (current ? "\n\n" : "") + scene;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}
