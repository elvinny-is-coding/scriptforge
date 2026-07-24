// components/editor/nodes/SceneHeadingNode.ts
import {
  ElementNode,
  LexicalNode,
  SerializedElementNode,
  Spread,
} from "lexical";

export type SerializedSceneHeadingNode = Spread<
  { type: "scene-heading" },
  SerializedElementNode
>;

export class SceneHeadingNode extends ElementNode {
  static getType(): string {
    return "scene-heading";
  }

  static clone(node: SceneHeadingNode): SceneHeadingNode {
    return new SceneHeadingNode(node.__key);
  }

  createDOM(): HTMLElement {
    const dom = document.createElement("p");
    dom.className = "font-bold uppercase text-lg mt-6 mb-2";
    return dom;
  }

  updateDOM(): false {
    return false;
  }

  static importJSON(
    serializedNode: SerializedSceneHeadingNode,
  ): SceneHeadingNode {
    return $createSceneHeadingNode().updateFromJSON(serializedNode);
  }

  exportJSON(): SerializedSceneHeadingNode {
    return { ...super.exportJSON(), type: "scene-heading" };
  }

  canInsertTextBefore(): boolean {
    return false;
  }

  canInsertTextAfter(): boolean {
    return true;
  }
}

export function $createSceneHeadingNode(): SceneHeadingNode {
  return new SceneHeadingNode();
}

export function $isSceneHeadingNode(
  node: LexicalNode | null | undefined,
): node is SceneHeadingNode {
  return node instanceof SceneHeadingNode;
}
