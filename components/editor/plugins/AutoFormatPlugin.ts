// components/editor/plugins/AutoFormatPlugin.ts
import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
  KEY_ENTER_COMMAND,
} from "lexical";
import {
  $isSceneHeadingNode,
  $createSceneHeadingNode,
} from "../nodes/SceneHeadingNode";
import { $isActionNode, $createActionNode } from "../nodes/ActionNode";
import { $isCharacterNode, $createCharacterNode } from "../nodes/CharacterNode";
import { $isDialogueNode, $createDialogueNode } from "../nodes/DialogueNode";
import { $isParentheticalNode } from "../nodes/ParentheticalNode";
import {
  $isTransitionNode,
  $createTransitionNode,
} from "../nodes/TransitionNode";

export function AutoFormatPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      KEY_ENTER_COMMAND,
      (event: KeyboardEvent | null) => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return false;

        const anchorNode = selection.anchor.getNode();
        const parent = anchorNode.getParent();

        if ($isSceneHeadingNode(parent)) {
          parent.insertAfter($createActionNode());
          parent.selectNext();
          event?.preventDefault();
          return true;
        }
        if ($isCharacterNode(parent)) {
          parent.insertAfter($createDialogueNode());
          parent.selectNext();
          event?.preventDefault();
          return true;
        }
        if ($isDialogueNode(parent) || $isParentheticalNode(parent)) {
          parent.insertAfter($createCharacterNode());
          parent.selectNext();
          event?.preventDefault();
          return true;
        }
        if ($isTransitionNode(parent)) {
          parent.insertAfter($createSceneHeadingNode());
          parent.selectNext();
          event?.preventDefault();
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor]);

  return null;
}
