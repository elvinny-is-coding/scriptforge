// components/sidebar/BrainstormTab.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useGroq } from "@/hooks/useGroq";
import {
  ArrowRight,
  AlertTriangle,
  MessageSquare,
  Lightbulb,
} from "lucide-react";

interface BrainstormTabProps {
  currentSceneContent: string;
  selectedText: string;
  onInsertSuggestion: (text: string) => void;
  messages: { role: "user" | "assistant"; content: string }[];
  setMessages: React.Dispatch<
    React.SetStateAction<{ role: "user" | "assistant"; content: string }[]>
  >;
  onReset?: () => void;
}

const quickPrompts = [
  { label: "Suggest next beat", icon: ArrowRight },
  { label: "What could go wrong?", icon: AlertTriangle },
  { label: "Dialogue alternatives", icon: MessageSquare },
  { label: "How to raise stakes?", icon: Lightbulb },
];

export function BrainstormTab({
  currentSceneContent,
  selectedText,
  onInsertSuggestion,
  messages,
  setMessages,
  onReset,
}: BrainstormTabProps) {
  const [chatInput, setChatInput] = useState("");
  const { output, isLoading, submit } = useGroq({ agent: "brainstorm" });
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevLoadingRef = useRef(false);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, output]);

  // Append assistant message when streaming finishes
  useEffect(() => {
    if (prevLoadingRef.current && !isLoading && output) {
      setMessages((prev) => [...prev, { role: "assistant", content: output }]);
    }
    prevLoadingRef.current = isLoading;
  }, [isLoading, output, setMessages]);

  const handleQuickPrompt = (prompt: string) => {
    const userMsg = { role: "user" as const, content: prompt };
    setMessages((prev) => [...prev, userMsg]);
    submit({
      messages: [...messages, userMsg],
      context: { sceneContent: currentSceneContent, selectedText },
    });
  };

  const handleCustomPrompt = () => {
    if (!chatInput.trim()) return;
    const userMsg = { role: "user" as const, content: chatInput.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    submit({
      messages: [...messages, userMsg],
      context: { sceneContent: currentSceneContent, selectedText },
    });
  };

  const handleReset = () => {
    // Clear local messages
    setMessages([]);
    // Notify parent to persist reset (delete scene entry from DB)
    onReset?.();
  };

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="p-2 space-y-2 border-b">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-semibold text-muted-foreground">
            Quick Prompts
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-6 text-xs px-2"
          >
            Reset Session
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-1">
          {quickPrompts.map((p) => (
            <Button
              key={p.label}
              variant="outline"
              size="sm"
              className="justify-start text-xs"
              onClick={() => handleQuickPrompt(p.label)}
              disabled={isLoading}
            >
              <p.icon className="mr-1 h-3 w-3" />
              {p.label}
            </Button>
          ))}
        </div>
      </div>
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`text-sm ${msg.role === "user" ? "text-right" : ""}`}
            >
              <span
                className={`inline-block px-3 py-2 rounded-lg whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {msg.content}
              </span>
            </div>
          ))}
          {isLoading && (
            <div className="text-sm">
              <span className="inline-block px-3 py-2 rounded-lg bg-muted whitespace-pre-wrap">
                {output}
              </span>
              {output && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-1"
                  onClick={() => onInsertSuggestion(output)}
                >
                  Insert
                </Button>
              )}
            </div>
          )}
          {isLoading && !output && (
            <div className="flex justify-center py-4">
              <LoadingSpinner />
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="p-2 border-t flex gap-2">
        <Textarea
          placeholder="Ask anything about this scene..."
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleCustomPrompt();
            }
          }}
          rows={2}
          className="min-h-0"
          disabled={isLoading}
        />
        <Button
          size="icon"
          onClick={handleCustomPrompt}
          disabled={isLoading || !chatInput.trim()}
        >
          <Lightbulb className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
