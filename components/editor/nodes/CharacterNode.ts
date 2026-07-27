// components/editor/nodes/CharacterNode.ts
import {
  ElementNode,
  LexicalNode,
  SerializedElementNode,
  Spread,
  RangeSelection,
} from "lexical";
import { $createActionNode } from "./ActionNode";

export type SerializedCharacterNode = Spread<
  { type: "character" },
  SerializedElementNode
>;

export class CharacterNode extends ElementNode {
  static getType(): string {
    return "character";
  }

  static clone(node: CharacterNode): CharacterNode {
    return new CharacterNode(node.__key);
  }

  createDOM(): HTMLElement {
    const dom = document.createElement("p");
    dom.className = "character-node block w-full my-1 uppercase text-center";
    dom.setAttribute(
      "data-character-name",
      this.getTextContent().trim().toUpperCase(),
    );
    return dom;
  }

  updateDOM(prevNode: CharacterNode, dom: HTMLElement): boolean {
    const prevName = prevNode.getTextContent().trim().toUpperCase();
    const currentName = this.getTextContent().trim().toUpperCase();
    if (prevName !== currentName) {
      dom.setAttribute("data-character-name", currentName);
    }
    return false;
  }

  static importJSON(serializedNode: SerializedCharacterNode): CharacterNode {
    return $createCharacterNode().updateFromJSON(serializedNode);
  }

  exportJSON(): SerializedCharacterNode {
    return { ...super.exportJSON(), type: "character" };
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

export function $createCharacterNode(): CharacterNode {
  return new CharacterNode();
}

export function $isCharacterNode(
  node: LexicalNode | null | undefined,
): node is CharacterNode {
  return node != null && node.getType() === "character";
}
