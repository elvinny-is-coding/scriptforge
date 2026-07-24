// lib/lexical/utils.ts
import { $getRoot, $isParagraphNode, LexicalEditor } from "lexical";
import { $isSceneHeadingNode } from "@/components/editor/nodes/SceneHeadingNode";
import { $isActionNode } from "@/components/editor/nodes/ActionNode";
import { $isCharacterNode } from "@/components/editor/nodes/CharacterNode";
import { $isDialogueNode } from "@/components/editor/nodes/DialogueNode";
import { $isParentheticalNode } from "@/components/editor/nodes/ParentheticalNode";
import { $isTransitionNode } from "@/components/editor/nodes/TransitionNode";

export function getEditorText(editor: LexicalEditor): string {
  return editor.getEditorState().read(() => {
    return $getRoot().getTextContent();
  });
}

export function getEditorJSON(editor: LexicalEditor): object {
  return editor.getEditorState().toJSON();
}

export function extractSceneContent(content: object): string {
  if (typeof content === "string") return content;
  const json = content as any;
  if (json?.root?.children) {
    return json.root.children
      .map((child: any) => child.children?.map((c: any) => c.text).join(""))
      .join("\n");
  }
  return "";
}
