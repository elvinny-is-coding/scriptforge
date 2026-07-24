// components/editor/nodes/ActionNode.ts
import {
  ElementNode,
  LexicalNode,
  SerializedElementNode,
  Spread,
} from "lexical";

export type SerializedActionNode = Spread<
  { type: "action" },
  SerializedElementNode
>;

export class ActionNode extends ElementNode {
  static getType(): string {
    return "action";
  }

  static clone(node: ActionNode): ActionNode {
    return new ActionNode(node.__key);
  }

  createDOM(): HTMLElement {
    const dom = document.createElement("p");
    dom.className = "mb-3 leading-relaxed";
    return dom;
  }

  updateDOM(): false {
    return false;
  }

  static importJSON(serializedNode: SerializedActionNode): ActionNode {
    return $createActionNode().updateFromJSON(serializedNode);
  }

  exportJSON(): SerializedActionNode {
    return { ...super.exportJSON(), type: "action" };
  }

  canInsertTextBefore(): boolean {
    return true;
  }

  canInsertTextAfter(): boolean {
    return true;
  }
}

export function $createActionNode(): ActionNode {
  return new ActionNode();
}

export function $isActionNode(
  node: LexicalNode | null | undefined,
): node is ActionNode {
  return node instanceof ActionNode;
}
