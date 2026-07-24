// components/editor/nodes/DialogueNode.ts
import {
  ElementNode,
  LexicalNode,
  SerializedElementNode,
  Spread,
} from "lexical";

export type SerializedDialogueNode = Spread<
  { type: "dialogue" },
  SerializedElementNode
>;

export class DialogueNode extends ElementNode {
  static getType(): string {
    return "dialogue";
  }

  static clone(node: DialogueNode): DialogueNode {
    return new DialogueNode(node.__key);
  }

  createDOM(): HTMLElement {
    const dom = document.createElement("p");
    dom.className = "ml-12 mr-12 mb-2";
    return dom;
  }

  updateDOM(): false {
    return false;
  }

  static importJSON(serializedNode: SerializedDialogueNode): DialogueNode {
    return $createDialogueNode().updateFromJSON(serializedNode);
  }

  exportJSON(): SerializedDialogueNode {
    return { ...super.exportJSON(), type: "dialogue" };
  }

  canInsertTextBefore(): boolean {
    return true;
  }

  canInsertTextAfter(): boolean {
    return true;
  }
}

export function $createDialogueNode(): DialogueNode {
  return new DialogueNode();
}

export function $isDialogueNode(
  node: LexicalNode | null | undefined,
): node is DialogueNode {
  return node instanceof DialogueNode;
}
