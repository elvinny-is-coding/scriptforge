// components/sidebar/ImproveTab.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useGroq } from "@/hooks/useGroq";
import { SuggestionCard } from "./SuggestionCard";
import {
  SpellCheck,
  Palette,
  CheckCircle,
  AlertTriangle,
  Gauge,
} from "lucide-react";

interface ImproveTabProps {
  currentSceneContent: string;
  selectedText: string;
  selectedSceneId: string | null;
  onInsertSuggestion: (text: string) => void;
  improveOutputsByScene: Record<string, { agent: string; output: string }>;
  setImproveOutputsByScene: (
    action:
      | Record<string, { agent: string; output: string }>
      | ((
          prev: Record<string, { agent: string; output: string }>,
        ) => Record<string, { agent: string; output: string }>),
  ) => void;
  onReset?: () => void;
}

const agents = [
  { key: "grammar", label: "Grammar & Style", icon: SpellCheck },
  { key: "tone", label: "Tone Shifter", icon: Palette },
  { key: "consistency", label: "Consistency Check", icon: CheckCircle },
  { key: "fallacies", label: "Logic Fallacies", icon: AlertTriangle },
  { key: "pacing", label: "Pacing", icon: Gauge },
] as const;

export function ImproveTab({
  currentSceneContent,
  selectedText,
  selectedSceneId,
  onInsertSuggestion,
  improveOutputsByScene,
  setImproveOutputsByScene,
  onReset,
}: ImproveTabProps) {
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const { output, isLoading, submit, abort } = useGroq({
    agent: (activeAgent as any) ?? "grammar",
  });

  // Persist output to lifted state when streaming finishes
  useEffect(() => {
    if (!isLoading && output && selectedSceneId && activeAgent) {
      setImproveOutputsByScene((prev) => ({
        ...prev,
        [selectedSceneId]: { agent: activeAgent, output },
      }));
    }
  }, [
    isLoading,
    output,
    selectedSceneId,
    activeAgent,
    setImproveOutputsByScene,
  ]);

  const displayOutput = isLoading
    ? output
    : selectedSceneId
      ? improveOutputsByScene[selectedSceneId]?.output || ""
      : "";

  const displayAgent = isLoading
    ? activeAgent
    : selectedSceneId
      ? improveOutputsByScene[selectedSceneId]?.agent || activeAgent
      : activeAgent;

  const handleAgent = (agent: (typeof agents)[number]["key"]) => {
    setActiveAgent(agent);
    const userMessage = `Analyze the following:\n\n${selectedText || currentSceneContent}`;
    // Clear output for this scene before starting new analysis
    if (selectedSceneId) {
      setImproveOutputsByScene((prev) => ({
        ...prev,
        [selectedSceneId]: { agent, output: "" },
      }));
    }
    if (agent === "tone") {
      submit({
        messages: [
          {
            role: "user",
            content: `${userMessage}\n\nRequested tone: more cinematic`,
          },
        ],
        context: { sceneContent: currentSceneContent, selectedText },
      });
    } else {
      submit({
        messages: [{ role: "user", content: userMessage }],
        context: { sceneContent: currentSceneContent, selectedText },
      });
    }
  };

  const handleReset = () => {
    if (!selectedSceneId) return;
    // Remove scene entry from the map
    setImproveOutputsByScene((prev) => {
      const updated = { ...prev };
      delete updated[selectedSceneId];
      return updated;
    });
    onReset?.();
  };

  const parseSuggestions = (raw: string) => {
    if (!raw) return null;
    if (displayAgent === "tone") return raw;
    try {
      const cleaned = raw.replace(/```json\n?|\n?```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) return parsed;
      return null;
    } catch {
      return null;
    }
  };

  const suggestions = parseSuggestions(displayOutput);

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="p-2 border-b space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-muted-foreground">
            Improve Agents
          </span>
          {selectedSceneId && improveOutputsByScene[selectedSceneId] && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-6 text-xs px-2"
            >
              Reset
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-1">
          {agents.map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant="outline"
              size="sm"
              className="justify-start"
              onClick={() => handleAgent(key)}
              disabled={isLoading}
            >
              <Icon className="mr-2 h-4 w-4" />
              {label}
            </Button>
          ))}
        </div>
      </div>
      <ScrollArea className="flex-1 p-4">
        {isLoading && (
          <div className="flex flex-col items-center gap-2 py-8">
            <LoadingSpinner />
            <span className="text-sm text-muted-foreground">Analyzing...</span>
            <Button variant="ghost" size="sm" onClick={abort}>
              Cancel
            </Button>
          </div>
        )}
        {displayOutput && !isLoading && displayAgent === "tone" && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Rewritten text:</p>
            <div className="bg-muted p-3 rounded-md text-sm whitespace-pre-wrap">
              {displayOutput}
            </div>
            <Button size="sm" onClick={() => onInsertSuggestion(displayOutput)}>
              Replace selected text
            </Button>
          </div>
        )}
        {suggestions && Array.isArray(suggestions) && !isLoading && (
          <div className="space-y-3">
            {suggestions.map((item: any, idx: number) => (
              <SuggestionCard
                key={idx}
                original={item.original || item.location || item.section || ""}
                suggestion={item.corrected || item.suggestion || item.fix || ""}
                explanation={
                  item.explanation || item.issue || item.description || ""
                }
                onApply={() =>
                  onInsertSuggestion(
                    item.corrected || item.suggestion || item.fix || "",
                  )
                }
              />
            ))}
          </div>
        )}
        {displayOutput &&
          !suggestions &&
          displayAgent !== "tone" &&
          !isLoading && (
            <div className="bg-muted p-3 rounded-md text-sm whitespace-pre-wrap">
              {displayOutput}
            </div>
          )}
      </ScrollArea>
    </div>
  );
}
