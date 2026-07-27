// components/editor/plugins/AutocompletePlugin.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  $createTextNode,
  KEY_DOWN_COMMAND,
  COMMAND_PRIORITY_EDITOR,
} from "lexical";
import { $isCharacterNode } from "../nodes/CharacterNode";
import { $isSceneHeadingNode } from "../nodes/SceneHeadingNode";

interface AutocompletePluginProps {
  characters?: string[]; // now optional, defaults to []
  locations?: string[]; // optional, defaults to []
}

export function AutocompletePlugin({
  characters = [],
  locations = [],
}: AutocompletePluginProps) {
  const [editor] = useLexicalComposerContext();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [activeIndex, setActiveIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  // Live (unsaved) character names coming from the editor
  const [liveCharacters, setLiveCharacters] = useState<string[]>([]);

  // Combine database + live names (deduplicated)
  const allCharacters = useCallback(() => {
    const combined = [...characters, ...liveCharacters];
    return [...new Set(combined)].sort();
  }, [characters, liveCharacters]);

  // Listen for live character updates
  useEffect(() => {
    const handler = (e: CustomEvent<string[]>) => {
      setLiveCharacters(e.detail);
    };
    window.addEventListener("live-characters", handler as EventListener);
    return () =>
      window.removeEventListener("live-characters", handler as EventListener);
  }, []);

  const suggestionsRef = useRef<string[]>([]);
  suggestionsRef.current = suggestions;

  // Compute suggestions using the full combined character list
  const computeSuggestions = useCallback(
    (nodeType: string, text: string): string[] => {
      if (nodeType === "character") {
        const fullList = allCharacters();
        if (!text) return fullList.slice(0, 8);
        const match = text.toUpperCase();
        return fullList.filter((c) => c.startsWith(match)).slice(0, 8);
      }
      if (nodeType === "scene-heading") {
        const prefixMatch = text.match(
          /^(INT\.|EXT\.|INT\.\/EXT\.|I\/E\.)\s+(.+?)(\s+-\s*)?/i,
        );
        if (prefixMatch && prefixMatch[2]) {
          const afterDash = text.slice(prefixMatch[0].length).trim();
          if (afterDash) {
            const times = [
              "DAY",
              "NIGHT",
              "CONTINUOUS",
              "MOMENTS LATER",
              "LATER",
            ];
            const match = afterDash.toUpperCase();
            return times.filter((t) => t.startsWith(match));
          }
          return [];
        }
        const prefix = text.match(/^(INT\.|EXT\.|INT\.\/EXT\.|I\/E\.)\s+(.*)/i);
        if (prefix) {
          const locPartial = prefix[2]?.toUpperCase() || "";
          return locations.filter((l) => l.startsWith(locPartial)).slice(0, 8);
        }
        return [];
      }
      return [];
    },
    [allCharacters, locations],
  );

  // Show the suggestion box programmatically (called by Ctrl+Space)
  const showAutocomplete = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection) || !selection.isCollapsed()) return;
      const parent = selection.anchor.getNode().getParent();
      if (!$isCharacterNode(parent) && !$isSceneHeadingNode(parent)) return;
      const before = parent.getTextContent().slice(0, selection.anchor.offset);
      const suggs = computeSuggestions(
        $isCharacterNode(parent) ? "character" : "scene-heading",
        before,
      );
      if (suggs.length === 0) return;
      const domSelection = window.getSelection();
      if (domSelection && domSelection.rangeCount > 0) {
        const range = domSelection.getRangeAt(0).cloneRange();
        range.collapse(true);
        const rect = range.getBoundingClientRect();
        setPosition({ top: rect.bottom + 4, left: rect.left });
        setSuggestions(suggs);
        setActiveIndex(0);
        setVisible(true);
      }
    });
  }, [editor, computeSuggestions]);

  // Register Ctrl+Space shortcut
  useEffect(() => {
    return editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event: KeyboardEvent) => {
        if ((event.ctrlKey || event.metaKey) && event.code === "Space") {
          event.preventDefault();
          showAutocomplete();
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor, showAutocomplete]);

  // Keyboard navigation for the dropdown
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!visible) return;
      const list = suggestionsRef.current;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % list.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + list.length) % list.length);
      } else if (e.key === "Enter" || e.key === "Tab") {
        if (list[activeIndex]) {
          e.preventDefault();
          applySuggestion(list[activeIndex]);
        }
      } else if (e.key === "Escape") {
        setVisible(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [visible, activeIndex]);

  // Main update listener – runs on every editor change
  useEffect(() => {
    const unregister = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
          setVisible(false);
          return;
        }

        const anchorNode = selection.anchor.getNode();
        const parent = anchorNode.getParent();
        if (!parent) {
          setVisible(false);
          return;
        }

        let nodeType: "character" | "scene-heading" | null = null;
        if ($isCharacterNode(parent)) {
          nodeType = "character";
        } else if ($isSceneHeadingNode(parent)) {
          nodeType = "scene-heading";
        } else {
          setVisible(false);
          return;
        }

        const textContent = parent.getTextContent();
        const before = textContent.slice(0, selection.anchor.offset);
        const suggs = computeSuggestions(nodeType, before);

        if (suggs.length > 0) {
          const domSelection = window.getSelection();
          if (domSelection && domSelection.rangeCount > 0) {
            const range = domSelection.getRangeAt(0).cloneRange();
            range.collapse(true);
            const rect = range.getBoundingClientRect();
            setPosition({ top: rect.bottom + 4, left: rect.left });
            setSuggestions(suggs);
            setActiveIndex(0);
            setVisible(true);
          }
        } else {
          setVisible(false);
        }
      });
    });

    return unregister;
  }, [editor, computeSuggestions]);

  const applySuggestion = (suggestion: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      const parent = selection.anchor.getNode().getParent();
      if (!$isCharacterNode(parent) && !$isSceneHeadingNode(parent)) return;
      parent.clear();
      parent.append($createTextNode(suggestion));
      parent.selectEnd();
    });
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <ul
      className="absolute z-50 bg-background border rounded-md shadow-lg min-w-[150px] max-h-48 overflow-y-auto"
      style={{ top: position.top, left: position.left }}
    >
      {suggestions.map((s, i) => (
        <li
          key={s}
          className={`px-3 py-1.5 text-sm cursor-pointer ${
            i === activeIndex
              ? "bg-accent text-accent-foreground"
              : "hover:bg-muted"
          }`}
          onMouseDown={(e) => {
            e.preventDefault();
            applySuggestion(s);
          }}
          onMouseEnter={() => setActiveIndex(i)}
        >
          {s}
        </li>
      ))}
    </ul>
  );
}
