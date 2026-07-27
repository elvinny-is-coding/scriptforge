// components/editor/nodes/TransitionNode.ts
import {
  ElementNode,
  LexicalNode,
  SerializedElementNode,
  Spread,
  RangeSelection,
} from "lexical";
import { $createActionNode } from "./ActionNode";

export type SerializedTransitionNode = Spread<
  { type: "transition" },
  SerializedElementNode
>;

export class TransitionNode extends ElementNode {
  static getType(): string {
    return "transition";
  }

  static clone(node: TransitionNode): TransitionNode {
    return new TransitionNode(node.__key);
  }

  createDOM(): HTMLElement {
    const dom = document.createElement("p");
    dom.className = "text-right uppercase text-sm mt-4 mb-2";
    return dom;
  }

  updateDOM(): false {
    return false;
  }

  static importJSON(serializedNode: SerializedTransitionNode): TransitionNode {
    return $createTransitionNode().updateFromJSON(serializedNode);
  }

  exportJSON(): SerializedTransitionNode {
    return { ...super.exportJSON(), type: "transition" };
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

export function $createTransitionNode(): TransitionNode {
  return new TransitionNode();
}

export function $isTransitionNode(
  node: LexicalNode | null | undefined,
): node is TransitionNode {
  return node instanceof TransitionNode;
}
