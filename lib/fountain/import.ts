// lib/fountain/import.ts
import {
  $getRoot,
  $createParagraphNode,
  LexicalEditor,
  $createTextNode,
} from "lexical";
import { $createSceneHeadingNode } from "@/components/editor/nodes/SceneHeadingNode";
import { $createActionNode } from "@/components/editor/nodes/ActionNode";
import { $createCharacterNode } from "@/components/editor/nodes/CharacterNode";
import { $createDialogueNode } from "@/components/editor/nodes/DialogueNode";
import { $createParentheticalNode } from "@/components/editor/nodes/ParentheticalNode";
import { $createTransitionNode } from "@/components/editor/nodes/TransitionNode";

function createNodeFromLine(line: string) {
  const trimmed = line.trim();
  if (!trimmed) return $createActionNode(); // blank line

  // Scene heading: starts with INT, EXT, INT./EXT, I/E (case insensitive)
  if (/^(INT|EXT|INT\.\/EXT|I\/E)[\.\s]/.test(trimmed)) {
    const node = $createSceneHeadingNode();
    node.append($createTextNode(trimmed.toUpperCase()));
    return node;
  }

  // Transition: ends with TO: or is a known transition
  if (/TO:$/.test(trimmed) || /^(FADE|CUT|DISSOLVE|SMASH|WIPE)/.test(trimmed)) {
    const node = $createTransitionNode();
    node.append($createTextNode(trimmed.toUpperCase()));
    return node;
  }

  // Character: a line in UPPERCASE (but not a transition or scene heading)
  if (
    trimmed === trimmed.toUpperCase() &&
    trimmed.length < 60 &&
    !trimmed.includes(" ")
  ) {
    const node = $createCharacterNode();
    node.append($createTextNode(trimmed));
    return node;
  }

  // Parenthetical: wrapped in parentheses
  if (trimmed.startsWith("(") && trimmed.endsWith(")")) {
    const node = $createParentheticalNode();
    node.append($createTextNode(trimmed.slice(1, -1)));
    return node;
  }

  // Default: action
  const node = $createActionNode();
  node.append($createTextNode(trimmed));
  return node;
}

export function importFromFountain(
  editor: LexicalEditor,
  fountainText: string,
) {
  editor.update(() => {
    const root = $getRoot();
    root.clear();
    const lines = fountainText.split("\n");
    for (const line of lines) {
      const node = createNodeFromLine(line);
      root.append(node);
    }
  });
}
