// lib/lexical/utils.ts
import { $getRoot, LexicalEditor, ElementNode } from "lexical";
import { $isSceneHeadingNode } from "@/components/editor/nodes/SceneHeadingNode";
import { $isActionNode } from "@/components/editor/nodes/ActionNode";
import { $isCharacterNode } from "@/components/editor/nodes/CharacterNode";
import { $isDialogueNode } from "@/components/editor/nodes/DialogueNode";
import { $isParentheticalNode } from "@/components/editor/nodes/ParentheticalNode";
import { $isTransitionNode } from "@/components/editor/nodes/TransitionNode";
import { $isOutlineNode } from "@/components/editor/nodes/OutlineNode";

const WORDS_PER_PAGE = 160;

export function getEditorText(editor: LexicalEditor): string {
  return editor.getEditorState().read(() => {
    return $getRoot().getTextContent();
  });
}

export function getEditorJSON(editor: LexicalEditor): object {
  return editor.getEditorState().toJSON();
}

/** Extract scene content as plain text, skipping outline nodes */
export function extractSceneContent(content: object): string {
  if (typeof content === "string") return content;
  const json = content as any;
  if (json?.root?.children) {
    return json.root.children
      .filter((child: any) => child.type !== "outline")
      .map((child: any) => child.children?.map((c: any) => c.text).join(""))
      .join("\n");
  }
  return "";
}

/** Get word count from a Lexical editor, excluding outline nodes */
export function getWordCount(editor: LexicalEditor): number {
  return editor.getEditorState().read(() => {
    const root = $getRoot();
    let count = 0;
    root.getChildren().forEach((child) => {
      if ($isOutlineNode(child)) return; // skip outline nodes
      const text = child.getTextContent().trim();
      if (text) count += text.split(/\s+/).length;
    });
    return count;
  });
}

/** Estimated page count based on industry standard (160 words per page) */
export function getEstimatedPages(editor: LexicalEditor): number {
  const wordCount = getWordCount(editor);
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_PAGE));
}

/** Get word count from a Lexical JSON object (for server-side or non-editor contexts) */
export function getWordCountFromJSON(content: object): number {
  const json = content as any;
  if (!json?.root?.children) return 0;
  let count = 0;
  json.root.children.forEach((child: any) => {
    if (child.type === "outline") return; // skip outline nodes
    const text =
      child.children
        ?.map((c: any) => c.text)
        .join(" ")
        .trim() || "";
    if (text) count += text.split(/\s+/).length;
  });
  return count;
}
