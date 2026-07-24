// lib/fountain/export.ts
import { $getRoot, LexicalEditor } from "lexical";
import { $isSceneHeadingNode } from "@/components/editor/nodes/SceneHeadingNode";
import { $isActionNode } from "@/components/editor/nodes/ActionNode";
import { $isCharacterNode } from "@/components/editor/nodes/CharacterNode";
import { $isDialogueNode } from "@/components/editor/nodes/DialogueNode";
import { $isParentheticalNode } from "@/components/editor/nodes/ParentheticalNode";
import { $isTransitionNode } from "@/components/editor/nodes/TransitionNode";

export function exportToFountain(editor: LexicalEditor): string {
  let fountain = "";
  editor.getEditorState().read(() => {
    const root = $getRoot();
    const children = root.getChildren();
    for (const child of children) {
      if ($isSceneHeadingNode(child)) {
        fountain += child.getTextContent().trim() + "\n";
      } else if ($isActionNode(child)) {
        fountain += child.getTextContent().trim() + "\n";
      } else if ($isCharacterNode(child)) {
        fountain += "\n" + child.getTextContent().trim().toUpperCase() + "\n";
      } else if ($isDialogueNode(child)) {
        fountain += child.getTextContent().trim() + "\n";
      } else if ($isParentheticalNode(child)) {
        fountain += "(" + child.getTextContent().trim() + ")\n";
      } else if ($isTransitionNode(child)) {
        fountain += "\n" + child.getTextContent().trim().toUpperCase() + "\n";
      } else {
        // default: treat as action
        fountain += child.getTextContent().trim() + "\n";
      }
    }
  });
  return fountain.trim();
}
