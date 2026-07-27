// components/editor/plugins/CharacterColorPlugin.tsx
"use client";

import { useEffect, useRef } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useCharacterColors } from "@/contexts/CharacterColorsContext";

const DEFAULT_COLOR = "#3b82f6"; // Tailwind blue-500

function applyColors(editor: any, colors: Record<string, string>) {
  editor.getEditorState().read(() => {
    const root = editor.getRootElement();
    if (!root) return;

    // Apply to CharacterNodes
    const charNodes = root.querySelectorAll(".character-node");
    charNodes.forEach((el: any) => {
      const name = (el.getAttribute("data-character-name") || "").trim();
      const color = name && colors[name] ? colors[name] : DEFAULT_COLOR;
      el.style.borderLeft = `4px solid ${color}`;
      el.style.paddingLeft = "8px";
      el.style.textAlign = "center";
      el.style.textTransform = "uppercase";
    });

    // Apply to DialogueNodes
    const dialNodes = root.querySelectorAll(".dialogue-node");
    dialNodes.forEach((el: any) => {
      const name = (el.getAttribute("data-character-name") || "").trim();
      const color =
        name && colors[name] ? colors[name] + "80" : DEFAULT_COLOR + "80";
      el.style.borderLeft = `2px solid ${color}`;
      el.style.paddingLeft = "8px";
    });
  });
}

export function CharacterColorPlugin() {
  const [editor] = useLexicalComposerContext();
  const colors = useCharacterColors();
  const colorsRef = useRef(colors);
  colorsRef.current = colors;

  // Reapply colours immediately when the colour map changes (from modal)
  useEffect(() => {
    // Force an editor update so the update listener fires and re‑applies colors
    editor.update(() => {});
  }, [colors, editor]);

  // Reapply on every editor update
  useEffect(() => {
    const unregister = editor.registerUpdateListener(() => {
      applyColors(editor, colorsRef.current);
    });

    // Initial application
    applyColors(editor, colorsRef.current);

    return unregister;
  }, [editor]);

  return null;
}
