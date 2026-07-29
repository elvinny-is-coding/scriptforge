// components/overlays/FindReplacePanel.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, ChevronUp, ChevronDown, Search } from "lucide-react";

interface FindReplacePanelProps {
  open: boolean;
  onClose: () => void;
}

export function FindReplacePanel({ open, onClose }: FindReplacePanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus search input when panel opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Listen for search results
  useEffect(() => {
    const handler = (e: CustomEvent<any[]>) => {
      setResults(e.detail);
      setCurrentIndex(e.detail.length > 0 ? 0 : -1);
    };
    window.addEventListener("find-replace:results", handler as EventListener);
    return () =>
      window.removeEventListener(
        "find-replace:results",
        handler as EventListener,
      );
  }, []);

  const doSearch = useCallback((query: string) => {
    window.dispatchEvent(
      new CustomEvent("find-replace:search", { detail: { query } }),
    );
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    doSearch(value);
  };

  const jumpTo = (index: number) => {
    window.dispatchEvent(
      new CustomEvent("find-replace:jump", { detail: { index } }),
    );
  };

  const handleReplace = (all: boolean) => {
    window.dispatchEvent(
      new CustomEvent("find-replace:replace", { detail: { replaceText, all } }),
    );
  };

  const handleNext = () => {
    if (results.length === 0) return;
    const next = (currentIndex + 1) % results.length;
    setCurrentIndex(next);
    jumpTo(next);
  };

  const handlePrev = () => {
    if (results.length === 0) return;
    const prev = (currentIndex - 1 + results.length) % results.length;
    setCurrentIndex(prev);
    jumpTo(prev);
  };

  if (!open) return null;

  return (
    <div className="absolute bottom-4 right-4 z-50 w-80 rounded-lg border bg-card p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Find & Replace</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Search row */}
      <div className="flex items-center gap-2 mb-3">
        <Input
          ref={inputRef}
          placeholder="Search text..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="h-8 text-xs"
        />
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {results.length > 0 ? `${currentIndex + 1}/${results.length}` : "0/0"}
        </span>
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center gap-1 mb-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrev}
          disabled={results.length === 0}
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={results.length === 0}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>

      {/* Replace row */}
      <div className="flex items-center gap-2 mb-3">
        <Input
          placeholder="Replace with..."
          value={replaceText}
          onChange={(e) => setReplaceText(e.target.value)}
          className="h-8 text-xs"
        />
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleReplace(false)}
          disabled={results.length === 0}
        >
          Replace
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleReplace(true)}
          disabled={results.length === 0}
        >
          Replace All
        </Button>
      </div>
    </div>
  );
}
