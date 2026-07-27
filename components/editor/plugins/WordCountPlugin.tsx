// components/editor/plugins/WordCountPlugin.tsx
"use client";

import { useEffect, useRef } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { getWordCount, getEstimatedPages } from "@/lib/lexical/utils";

export function WordCountPlugin() {
  const [editor] = useLexicalComposerContext();
  const prevCountRef = useRef({ words: 0, pages: 0 });

  useEffect(() => {
    const unregister = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const words = getWordCount(editor);
        const pages = getEstimatedPages(editor);
        if (
          words !== prevCountRef.current.words ||
          pages !== prevCountRef.current.pages
        ) {
          prevCountRef.current = { words, pages };
          window.dispatchEvent(
            new CustomEvent("wordcount-change", { detail: { words, pages } }),
          );
        }
      });
    });

    return unregister;
  }, [editor]);

  return null;
}
