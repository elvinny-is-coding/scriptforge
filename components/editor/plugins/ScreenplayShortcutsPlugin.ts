// components/editor/plugins/ScreenplayShortcutsPlugin.ts
import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  $getRoot,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_EDITOR,
  KEY_DOWN_COMMAND,
} from "lexical";
import { $isSceneHeadingNode } from "../nodes/SceneHeadingNode";
import { $isActionNode } from "../nodes/ActionNode";
import { $isCharacterNode } from "../nodes/CharacterNode";
import { $isDialogueNode } from "../nodes/DialogueNode";
import { $isParentheticalNode } from "../nodes/ParentheticalNode";
import { $isTransitionNode } from "../nodes/TransitionNode";
import { $createActionNode } from "../nodes/ActionNode";
import { $createCharacterNode } from "../nodes/CharacterNode";
import { $createDialogueNode } from "../nodes/DialogueNode";
import { $createParentheticalNode } from "../nodes/ParentheticalNode";
import { $createTransitionNode } from "../nodes/TransitionNode";
import { $createSceneHeadingNode } from "../nodes/SceneHeadingNode";

function safeReplace(parent: any, newNode: any) {
  const root = $getRoot();
  const children = root.getChildren();
  if (children.length === 1 && children[0] === parent) {
    // Cannot replace the root's only child – clear and reuse
    parent.clear();
    parent.append(...newNode.getChildren());
    return;
  }
  parent.replace(newNode);
}

export function ScreenplayShortcutsPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event: KeyboardEvent) => {
        if (event.ctrlKey || event.metaKey) {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return false;
          const anchorNode = selection.anchor.getNode();
          const parent = anchorNode.getParent();
          if (!parent) return false;

          let nodeType: string | null = null;
          if (event.key === "1") nodeType = "scene-heading";
          else if (event.key === "2") nodeType = "action";
          else if (event.key === "3") nodeType = "character";
          else if (event.key === "4") nodeType = "dialogue";
          else if (event.key === "5") nodeType = "parenthetical";
          else if (event.key === "6") nodeType = "transition";
          else return false;

          event.preventDefault();
          let newNode;
          switch (nodeType) {
            case "scene-heading":
              newNode = $createSceneHeadingNode();
              break;
            case "action":
              newNode = $createActionNode();
              break;
            case "character":
              newNode = $createCharacterNode();
              break;
            case "dialogue":
              newNode = $createDialogueNode();
              break;
            case "parenthetical":
              newNode = $createParentheticalNode();
              break;
            case "transition":
              newNode = $createTransitionNode();
              break;
            default:
              return false;
          }

          safeReplace(parent, newNode);
          newNode.selectEnd();
          return true;
        }

        // Tab key to cycle (this handler was removed earlier, but keep the guard if it ever comes back)
        if (event.key === "Tab") {
          event.preventDefault();
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return false;
          const anchorNode = selection.anchor.getNode();
          const parent = anchorNode.getParent();
          if (!parent) return false;

          const cycle = [
            $isActionNode,
            $isCharacterNode,
            $isDialogueNode,
            $isParentheticalNode,
            $isTransitionNode,
            $isSceneHeadingNode,
          ];
          const creators = [
            $createActionNode,
            $createCharacterNode,
            $createDialogueNode,
            $createParentheticalNode,
            $createTransitionNode,
            $createSceneHeadingNode,
          ];
          const idx = cycle.findIndex((fn) => fn(parent));
          if (idx !== -1) {
            const nextIdx = (idx + 1) % creators.length;
            const newNode = creators[nextIdx]();
            safeReplace(parent, newNode);
            newNode.selectEnd();
            return true;
          }
        }
        return false;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor]);

  return null;
}
