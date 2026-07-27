// lib/lexical/config.ts
import type { InitialConfigType } from "@lexical/react/LexicalComposer";
import { SceneHeadingNode } from "@/components/editor/nodes/SceneHeadingNode";
import { ActionNode } from "@/components/editor/nodes/ActionNode";
import { CharacterNode } from "@/components/editor/nodes/CharacterNode";
import { DialogueNode } from "@/components/editor/nodes/DialogueNode";
import { ParentheticalNode } from "@/components/editor/nodes/ParentheticalNode";
import { TransitionNode } from "@/components/editor/nodes/TransitionNode";
import { OutlineNode } from "@/components/editor/nodes/OutlineNode"; // <-- new

export const editorConfig: InitialConfigType = {
  namespace: "ScriptForge",
  nodes: [
    SceneHeadingNode,
    ActionNode,
    CharacterNode,
    DialogueNode,
    ParentheticalNode,
    TransitionNode,
    OutlineNode, // <-- added
  ],
  onError: (error: Error) => {
    console.error("Lexical error:", error);
  },
  theme: {
    text: {
      bold: "font-bold",
      italic: "italic",
      underline: "underline",
      strikethrough: "line-through",
      underlineStrikethrough: "underline line-through",
    },
    "scene-heading": "font-bold uppercase text-lg mt-6 mb-2",
    action: "mb-3 leading-relaxed",
    character: "uppercase text-center mt-4 mb-0",
    dialogue: "ml-12 mr-12 mb-2",
    parenthetical: "ml-16 mr-16 text-sm italic",
    transition: "text-right uppercase text-sm mt-4 mb-2",
    outline:
      "bg-accent/50 text-accent-foreground text-sm font-semibold uppercase tracking-wider px-3 py-1 my-3 rounded border-l-4 border-accent", // <-- theme for outline
  },
};
