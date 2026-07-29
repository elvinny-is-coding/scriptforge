// components/editor/plugins/InlineRewritePlugin.tsx
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection } from "lexical";

export function InlineRewritePlugin() {
  const [editor] = useLexicalComposerContext();
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [alternatives, setAlternatives] = useState<string[]>([]);
  const [rewriting, setRewriting] = useState(false);
  const selectedTextRef = useRef("");
  const menuRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => {
    setMenuVisible(false);
    setAlternatives([]);
  }, []);

  // Right‑click handler
  useEffect(() => {
    const root = editor.getRootElement();
    if (!root) return;

    const handleContextMenu = (e: MouseEvent) => {
      editor.getEditorState().read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection) && !selection.isCollapsed()) {
          const parent = selection.anchor.getNode().getParent();
          if (!parent) return;
          const parentType = parent.getType();
          if (
            parentType === "character" ||
            parentType === "dialogue" ||
            parentType === "action"
          ) {
            e.preventDefault();
            selectedTextRef.current = selection.getTextContent();
            setMenuPos({ x: e.clientX, y: e.clientY });
            setMenuVisible(true);
          }
        }
      });
    };

    root.addEventListener("contextmenu", handleContextMenu);
    return () => root.removeEventListener("contextmenu", handleContextMenu);
  }, [editor]);

  // Click outside closes menu
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    };
    if (menuVisible) {
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }
  }, [menuVisible, closeMenu]);

  const handleRewrite = async () => {
    setRewriting(true);
    try {
      const res = await fetch("/api/groq/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: selectedTextRef.current }),
      });
      if (!res.ok) throw new Error("Rewrite failed");
      const data = await res.json();
      setAlternatives(data.alternatives || []);
    } catch (err) {
      console.error(err);
      setAlternatives([]);
    } finally {
      setRewriting(false);
    }
  };

  const applyAlternative = (text: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.insertText(text);
      }
    });
    closeMenu();
  };

  if (!menuVisible) return null;

  return (
    <div
      ref={menuRef}
      className="absolute z-50 bg-background border rounded-md shadow-lg p-1 min-w-[160px]"
      style={{ top: menuPos.y, left: menuPos.x }}
    >
      {alternatives.length === 0 ? (
        <button
          className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent rounded"
          onClick={handleRewrite}
          disabled={rewriting}
        >
          {rewriting ? "Rewriting..." : "Rewrite this line"}
        </button>
      ) : (
        <div className="space-y-1">
          <p className="px-2 py-1 text-xs font-semibold text-muted-foreground">
            Alternatives
          </p>
          {alternatives.map((alt, i) => (
            <button
              key={i}
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent rounded whitespace-pre-wrap"
              onClick={() => applyAlternative(alt)}
            >
              {alt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
