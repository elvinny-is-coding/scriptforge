// components/editor/nodes/OutlineNode.ts
import {
  ElementNode,
  LexicalNode,
  SerializedElementNode,
  Spread,
} from "lexical";

export type SerializedOutlineNode = Spread<
  { type: "outline" },
  SerializedElementNode
>;

export class OutlineNode extends ElementNode {
  static getType(): string {
    return "outline";
  }

  static clone(node: OutlineNode): OutlineNode {
    return new OutlineNode(node.__key);
  }

  createDOM(): HTMLElement {
    const dom = document.createElement("div");
    dom.className =
      "bg-accent/50 text-accent-foreground text-sm font-semibold uppercase tracking-wider px-3 py-1 my-3 rounded border-l-4 border-accent";
    return dom;
  }

  updateDOM(): false {
    return false;
  }

  static importJSON(serializedNode: SerializedOutlineNode): OutlineNode {
    return $createOutlineNode().updateFromJSON(serializedNode);
  }

  exportJSON(): SerializedOutlineNode {
    return { ...super.exportJSON(), type: "outline" };
  }

  canInsertTextBefore(): boolean {
    return true;
  }

  canInsertTextAfter(): boolean {
    return true;
  }
}

export function $createOutlineNode(): OutlineNode {
  return new OutlineNode();
}

export function $isOutlineNode(
  node: LexicalNode | null | undefined,
): node is OutlineNode {
  return node instanceof OutlineNode;
}
