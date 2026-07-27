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
  RotateCcw,
  Plus,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { FormattedChatContent } from "@/lib/chat-formatter";

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
    setMessages([]);
    onReset?.();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Fixed top: quick prompts and clear chat button */}
      <div className="p-2 space-y-2 border-b shrink-0">
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-muted-foreground">
            Quick Prompts
          </span>
          {messages.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger className="inline-flex items-center justify-center gap-1 rounded-lg border border-destructive/30 text-xs font-medium h-7 px-2 text-destructive hover:bg-destructive/10 cursor-pointer select-none">
                <RotateCcw className="h-3 w-3" />
                Clear Chat
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear chat history?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the entire brainstorming
                    session for this scene. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReset}>
                    Yes, clear
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
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

      {/* Scrollable chat area */}
      <ScrollArea className="flex-1 p-4 overflow-scroll" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`text-sm ${msg.role === "user" ? "text-right" : ""}`}
            >
              {msg.role === "user" ? (
                <span className="inline-block px-3 py-2 rounded-lg bg-primary text-primary-foreground whitespace-pre-wrap">
                  {msg.content}
                </span>
              ) : (
                <div className="inline-block max-w-[85%] px-4 py-3 rounded-lg bg-muted text-left">
                  <FormattedChatContent
                    text={msg.content}
                    onInsertCode={(code) => onInsertSuggestion(code)}
                  />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="text-sm">
              <span className="inline-block px-3 py-2 rounded-lg bg-muted whitespace-pre-wrap">
                {output}
              </span>
              {output && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 gap-1"
                  onClick={() => onInsertSuggestion(output)}
                >
                  <Plus className="h-3 w-3" />
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

      {/* Fixed bottom: input area */}
      <div className="p-2 border-t flex gap-2 shrink-0">
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
