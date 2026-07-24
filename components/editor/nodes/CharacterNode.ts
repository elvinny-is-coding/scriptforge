// components/editor/nodes/CharacterNode.ts
import {
  ElementNode,
  LexicalNode,
  SerializedElementNode,
  Spread,
} from "lexical";

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
    dom.className = "uppercase text-center mt-4 mb-0";
    return dom;
  }

  updateDOM(): false {
    return false;
  }

  static importJSON(serializedNode: SerializedCharacterNode): CharacterNode {
    return $createCharacterNode().updateFromJSON(serializedNode);
  }

  exportJSON(): SerializedCharacterNode {
    return { ...super.exportJSON(), type: "character" };
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
  return node instanceof CharacterNode;
}
