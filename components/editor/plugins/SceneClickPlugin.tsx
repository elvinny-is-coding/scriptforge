// components/editor/plugins/SceneClickPlugin.tsx
"use client";

import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

export function SceneClickPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const root = editor.getRootElement();
    if (!root) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const heading = target.closest<HTMLElement>(".scene-heading");
      if (!heading) return;

      const text = heading.textContent?.trim() || "";
      window.dispatchEvent(
        new CustomEvent("scene-click", { detail: { heading: text } }),
      );
    };

    root.addEventListener("click", handleClick);
    return () => root.removeEventListener("click", handleClick);
  }, [editor]);

  return null;
}
