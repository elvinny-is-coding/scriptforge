// components/editor/plugins/CharacterTrackingPlugin.tsx
"use client";

import { useEffect, useRef } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isCharacterNode } from "../nodes/CharacterNode";

/**
 * Scans the editor on every update and dispatches a list of character names
 * currently present in the script (including unsaved ones).
 */
export function CharacterTrackingPlugin() {
  const [editor] = useLexicalComposerContext();
  const lastNamesRef = useRef<string[]>([]);

  useEffect(() => {
    const unregister = editor.registerUpdateListener(({ editorState }) => {
      const names: string[] = [];
      editorState.read(() => {
        const root = editor.getRootElement();
        // The safest cross‑browser way is to traverse the Lexical state
        editorState._nodeMap.forEach((node) => {
          if ($isCharacterNode(node)) {
            const text = node.getTextContent().trim();
            if (text) names.push(text.toUpperCase());
          }
        });
      });

      // Only dispatch when the list actually changes
      const sorted = [...new Set(names)].sort();
      if (
        sorted.length !== lastNamesRef.current.length ||
        !sorted.every((v, i) => v === lastNamesRef.current[i])
      ) {
        lastNamesRef.current = sorted;
        window.dispatchEvent(
          new CustomEvent("live-characters", { detail: sorted }),
        );
      }
    });

    return unregister;
  }, [editor]);

  return null;
}
