// hooks/useGroq.ts
"use client";

import { useState, useCallback, useRef } from "react";

interface UseGroqOptions {
  agent:
    | "brainstorm"
    | "grammar"
    | "tone"
    | "consistency"
    | "fallacies"
    | "pacing"
    | "doctor"
    | "refine-prompt";
}

interface GroqRequestBody {
  messages: { role: "user" | "assistant"; content: string }[];
  context?: Record<string, any>;
}

export function useGroq({ agent }: UseGroqOptions) {
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const submit = useCallback(
    async (body: GroqRequestBody) => {
      setIsLoading(true);
      setError(null);
      setOutput("");

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        let endpoint = `/api/groq/${agent}`;
        if (["grammar", "tone", "consistency", "fallacies", "pacing"].includes(agent)) {
          endpoint = `/api/groq/improve/${agent}`;
        }
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        if (!res.ok) {
          const msg = await res.text();
          throw new Error(msg);
        }

        if (!res.body) throw new Error("No response body");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let result = "";

        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          const chunk = decoder.decode(value, { stream: true });
          result += chunk;
          setOutput(result);
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setError(err.message || "Something went wrong");
        }
      } finally {
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [agent],
  );

  const abort = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { output, isLoading, error, submit, abort };
}
