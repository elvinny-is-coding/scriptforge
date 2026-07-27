// lib/lexical/cycleNode.ts
import { $getSelection, $isRangeSelection, LexicalEditor } from "lexical";
import {
  $isSceneHeadingNode,
  $createSceneHeadingNode,
} from "@/components/editor/nodes/SceneHeadingNode";
import {
  $isActionNode,
  $createActionNode,
} from "@/components/editor/nodes/ActionNode";
import {
  $isCharacterNode,
  $createCharacterNode,
} from "@/components/editor/nodes/CharacterNode";
import {
  $isDialogueNode,
  $createDialogueNode,
} from "@/components/editor/nodes/DialogueNode";
import {
  $isParentheticalNode,
  $createParentheticalNode,
} from "@/components/editor/nodes/ParentheticalNode";
import {
  $isTransitionNode,
  $createTransitionNode,
} from "@/components/editor/nodes/TransitionNode";
import {
  $isOutlineNode,
  $createOutlineNode,
} from "@/components/editor/nodes/OutlineNode";

const cycle = [
  $isActionNode,
  $isCharacterNode,
  $isDialogueNode,
  $isParentheticalNode,
  $isTransitionNode,
  $isSceneHeadingNode,
  $isOutlineNode,
] as const;

const creators = [
  $createActionNode,
  $createCharacterNode,
  $createDialogueNode,
  $createParentheticalNode,
  $createTransitionNode,
  $createSceneHeadingNode,
  $createOutlineNode,
] as const;

export function cycleNode(editor: LexicalEditor, forward: boolean) {
  editor.update(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;
    const parent = selection.anchor.getNode().getParent();
    if (!parent) return;

    const idx = cycle.findIndex((fn) => fn(parent));
    if (idx === -1) return;

    const delta = forward ? 1 : cycle.length - 1;
    const nextIdx = (idx + delta) % creators.length;
    const newNode = creators[nextIdx]();
    parent.replace(newNode);
    newNode.selectEnd();
  });
}
