// components/editor/nodes/ParentheticalNode.ts
import {
  ElementNode,
  LexicalNode,
  SerializedElementNode,
  Spread,
  RangeSelection,
} from "lexical";
import { $createActionNode } from "./ActionNode";

export type SerializedParentheticalNode = Spread<
  { type: "parenthetical" },
  SerializedElementNode
>;

export class ParentheticalNode extends ElementNode {
  static getType(): string {
    return "parenthetical";
  }

  static clone(node: ParentheticalNode): ParentheticalNode {
    return new ParentheticalNode(node.__key);
  }

  createDOM(): HTMLElement {
    const dom = document.createElement("p");
    dom.className = "ml-16 mr-16 text-sm italic";
    return dom;
  }

  updateDOM(): false {
    return false;
  }

  static importJSON(
    serializedNode: SerializedParentheticalNode,
  ): ParentheticalNode {
    return $createParentheticalNode().updateFromJSON(serializedNode);
  }

  exportJSON(): SerializedParentheticalNode {
    return { ...super.exportJSON(), type: "parenthetical" };
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

export function $createParentheticalNode(): ParentheticalNode {
  return new ParentheticalNode();
}

export function $isParentheticalNode(
  node: LexicalNode | null | undefined,
): node is ParentheticalNode {
  return node instanceof ParentheticalNode;
}
