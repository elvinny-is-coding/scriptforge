// components/editor/ScreenplayToolbar.tsx
"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  $createTextNode,
  $getRoot,
  $isRootOrShadowRoot,
} from "lexical";
import { Button } from "@/components/ui/button";
import { Bold, Italic, Underline, User, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { mergeRegister } from "@lexical/utils";
import { $isCharacterNode, $createCharacterNode } from "./nodes/CharacterNode";
import { $isDialogueNode, $createDialogueNode } from "./nodes/DialogueNode";

export function ScreenplayToolbar() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isCharacter, setIsCharacter] = useState(false);
  const [isDialogue, setIsDialogue] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [pageCount, setPageCount] = useState(1);

  useEffect(() => {
    const unregister = mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            setIsBold(selection.hasFormat("bold"));
            setIsItalic(selection.hasFormat("italic"));
            setIsUnderline(selection.hasFormat("underline"));

            const parent = selection.anchor.getNode().getParent();
            setIsCharacter($isCharacterNode(parent));
            setIsDialogue($isDialogueNode(parent));
          } else {
            setIsCharacter(false);
            setIsDialogue(false);
          }
        });
      }),
    );
    return unregister;
  }, [editor]);

  useEffect(() => {
    const handler = (e: CustomEvent<{ words: number; pages: number }>) => {
      setWordCount(e.detail.words);
      setPageCount(e.detail.pages);
    };
    window.addEventListener("wordcount-change", handler as EventListener);
    return () =>
      window.removeEventListener("wordcount-change", handler as EventListener);
  }, []);

  /** Helper: walk up from the anchor node to the nearest top‑level block (parent is root) */
  function getBlockParent(): any {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return null;
    let node: any = selection.anchor.getNode();
    // If we're inside a text node, move to its parent block
    if (node.getType() === "text") {
      node = node.getParent();
    }
    // Walk up until the parent is the root (or node itself is root)
    while (
      node &&
      !$isRootOrShadowRoot(node) &&
      node.getParent() &&
      !$isRootOrShadowRoot(node.getParent())
    ) {
      node = node.getParent();
    }
    return node; // top-level block (or root if empty)
  }

  /** Replace the entire current block with a Character node */
  const convertToCharacter = () => {
    editor.update(() => {
      const parentBlock = getBlockParent();
      if (!parentBlock) return;

      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      const text = selection.isCollapsed()
        ? parentBlock.getTextContent().trim()
        : selection.getTextContent().trim();
      if (!text) return;

      const newChar = $createCharacterNode();
      newChar.append($createTextNode(text.toUpperCase()));

      if ($isRootOrShadowRoot(parentBlock)) {
        $getRoot().append(newChar);
      } else {
        parentBlock.replace(newChar);
      }
      newChar.selectEnd();
    });
  };

  /** Replace the entire current block with a Dialogue node, linked to nearest preceding character */
  const convertToDialogue = () => {
    editor.update(() => {
      const parentBlock = getBlockParent();
      if (!parentBlock) return;

      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      const text = selection.isCollapsed()
        ? parentBlock.getTextContent().trim()
        : selection.getTextContent().trim();
      if (!text) return;

      const newDial = $createDialogueNode();
      newDial.append($createTextNode(text));

      const root = $getRoot();
      const children = root.getChildren();
      let nearestCharacterName: string | null = null;
      const idx = children.indexOf(parentBlock);
      for (let i = idx - 1; i >= 0; i--) {
        if ($isCharacterNode(children[i])) {
          nearestCharacterName = children[i]
            .getTextContent()
            .trim()
            .toUpperCase();
          break;
        }
      }
      if (nearestCharacterName) {
        newDial.setCharacterName(nearestCharacterName);
      }

      if ($isRootOrShadowRoot(parentBlock)) {
        root.append(newDial);
      } else {
        parentBlock.replace(newDial);
      }
      newDial.selectEnd();
    });
  };

  return (
    <div className="flex items-center gap-1 p-2 border-b bg-muted/30">
      <Button
        variant={isBold ? "default" : "outline"}
        size="sm"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant={isItalic ? "default" : "outline"}
        size="sm"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant={isUnderline ? "default" : "outline"}
        size="sm"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
      >
        <Underline className="h-4 w-4" />
      </Button>

      <div className="w-px h-5 bg-border mx-1" />

      <Button
        variant={isCharacter ? "default" : "outline"}
        size="sm"
        onClick={convertToCharacter}
        title="Convert to Character (Ctrl+3)"
      >
        <User className="h-4 w-4" />
      </Button>
      <Button
        variant={isDialogue ? "default" : "outline"}
        size="sm"
        onClick={convertToDialogue}
        title="Convert to Dialogue (Ctrl+4)"
      >
        <MessageCircle className="h-4 w-4" />
      </Button>

      <div className="flex-1" />
      <span className="text-xs text-muted-foreground px-2">
        {wordCount} words · ~{pageCount} page{pageCount !== 1 ? "s" : ""}
      </span>
    </div>
  );
}
