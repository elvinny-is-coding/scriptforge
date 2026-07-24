// components/editor/plugins/GenerateImagePlugin.tsx
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection } from "lexical";

export function GenerateImagePlugin() {
  const [editor] = useLexicalComposerContext();
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const selectedTextRef = useRef("");

  useEffect(() => {
    const rootElement = editor.getRootElement();
    if (!rootElement) return;

    const handleContextMenu = (e: MouseEvent) => {
      editor.getEditorState().read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection) && !selection.isCollapsed()) {
          const text = selection.getTextContent();
          if (text.trim().length > 0) {
            e.preventDefault();
            selectedTextRef.current = text;
            setMenuPos({ x: e.clientX, y: e.clientY });
            setMenuVisible(true);
          } else {
            setMenuVisible(false);
          }
        } else {
          setMenuVisible(false);
        }
      });
    };

    const handleClick = () => setMenuVisible(false);

    rootElement.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("click", handleClick);

    return () => {
      rootElement.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("click", handleClick);
    };
  }, [editor]);

  const handleGenerate = useCallback(() => {
    setMenuVisible(false);
    if (selectedTextRef.current) {
      window.dispatchEvent(
        new CustomEvent("generate-image", { detail: selectedTextRef.current }),
      );
    }
  }, []);

  if (!menuVisible) return null;

  return (
    <div
      className="fixed z-50 bg-background border rounded-md shadow-lg p-1"
      style={{ top: menuPos.y, left: menuPos.x }}
    >
      <button
        className="px-3 py-1.5 text-sm hover:bg-accent rounded w-full text-left"
        onClick={handleGenerate}
      >
        Generate Concept Art
      </button>
    </div>
  );
}
