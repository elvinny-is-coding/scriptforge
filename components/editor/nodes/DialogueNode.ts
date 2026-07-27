// components/editor/nodes/DialogueNode.ts
import {
  ElementNode,
  LexicalNode,
  SerializedElementNode,
  Spread,
  RangeSelection,
} from "lexical";
import { $createActionNode } from "./ActionNode";

export type SerializedDialogueNode = Spread<
  { type: "dialogue"; characterName?: string | null },
  SerializedElementNode
>;

export class DialogueNode extends ElementNode {
  __characterName: string | null = null;

  static getType(): string {
    return "dialogue";
  }

  static clone(node: DialogueNode): DialogueNode {
    const clone = new DialogueNode(node.__key);
    clone.__characterName = node.__characterName;
    return clone;
  }

  getCharacterName(): string | null {
    return this.__characterName;
  }

  setCharacterName(name: string): void {
    if (this.__characterName !== name) {
      this.__characterName = name;
      this.getWritable().__characterName = name;
    }
  }

  createDOM(): HTMLElement {
    const dom = document.createElement("p");
    dom.className = "dialogue-node block w-full my-1 ml-12 mr-12";
    if (this.__characterName) {
      dom.setAttribute("data-character-name", this.__characterName);
    }
    return dom;
  }

  updateDOM(prevNode: DialogueNode, dom: HTMLElement): boolean {
    if (prevNode.__characterName !== this.__characterName) {
      if (dom) {
        if (this.__characterName) {
          dom.setAttribute("data-character-name", this.__characterName);
        } else {
          dom.removeAttribute("data-character-name");
        }
      }
    }
    return false;
  }

  static importJSON(serializedNode: SerializedDialogueNode): DialogueNode {
    const node = $createDialogueNode();
    node.updateFromJSON(serializedNode);
    if (serializedNode.characterName) {
      node.setCharacterName(serializedNode.characterName);
    }
    return node;
  }

  exportJSON(): SerializedDialogueNode {
    return {
      ...super.exportJSON(),
      type: "dialogue",
      characterName: this.__characterName,
    };
  }

  insertNewAfter(
    selection: RangeSelection,
    restoreSelection = true,
  ): ElementNode {
    const newElement = $createActionNode();
    this.insertAfter(newElement, restoreSelection);
    return newElement;
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
  return node != null && node.getType() === "dialogue";
}
