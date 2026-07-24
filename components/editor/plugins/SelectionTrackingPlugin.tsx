// components/editor/plugins/SelectionTrackingPlugin.tsx
"use client";

import { useEffect, useRef } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection } from "lexical";

export function SelectionTrackingPlugin() {
  const [editor] = useLexicalComposerContext();
  const lastTextRef = useRef("");

  useEffect(() => {
    const unregister = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        let text = "";
        if ($isRangeSelection(selection) && !selection.isCollapsed()) {
          text = selection.getTextContent();
        }
        if (text !== lastTextRef.current) {
          lastTextRef.current = text;
          window.dispatchEvent(
            new CustomEvent("selection-change", { detail: text }),
          );
        }
      });
    });

    return () => {
      unregister();
    };
  }, [editor]);

  return null;
}
