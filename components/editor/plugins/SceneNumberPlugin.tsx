// components/editor/plugins/SceneNumberPlugin.tsx
"use client";

import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

interface SceneNumberPluginProps {
  sceneNumber: number;
}

export function SceneNumberPlugin({ sceneNumber }: SceneNumberPluginProps) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const updateNumbers = () => {
      const root = editor.getRootElement();
      if (!root) return;
      const headings = root.querySelectorAll<HTMLElement>(".scene-heading");
      headings.forEach((el) => {
        el.setAttribute("data-scene-number", String(sceneNumber));
      });
    };

    updateNumbers();
    const unregister = editor.registerUpdateListener(updateNumbers);
    return unregister;
  }, [editor, sceneNumber]);

  return null;
}
