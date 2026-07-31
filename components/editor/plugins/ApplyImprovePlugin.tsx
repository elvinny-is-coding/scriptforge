// components/editor/plugins/ApplyImprovePlugin.tsx
"use client";

import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot, $isElementNode, $isTextNode } from "lexical";

interface Correction {
  original: string;
  corrected: string;
}

export function ApplyImprovePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const handler = (e: Event) => {
      const corrections: Correction[] = (e as CustomEvent).detail;
      if (!Array.isArray(corrections) || corrections.length === 0) return;

      let applied = 0;
      let skipped = 0;

      editor.update(() => {
        const root = $getRoot();
        const children = root.getChildren();

        type TextNodeInfo = {
          node: any;
          text: string;
          elementIndex: number;
        };

        const textNodes: TextNodeInfo[] = [];

        children.forEach((block, blockIdx) => {
          if (!$isElementNode(block) || block.getType() !== "action") return;
          block.getChildren().forEach((textNode) => {
            if ($isTextNode(textNode)) {
              textNodes.push({
                node: textNode,
                text: textNode.getTextContent(),
                elementIndex: blockIdx,
              });
            }
          });
        });

        corrections.forEach(({ original, corrected }) => {
          if (!original) return;
          let found = false;

          const matches: { node: any; start: number; end: number }[] = [];

          textNodes.forEach((info) => {
            let idx = 0;
            while ((idx = info.text.indexOf(original, idx)) !== -1) {
              matches.push({
                node: info.node,
                start: idx,
                end: idx + original.length,
              });
              idx += original.length;
            }
          });

          for (let i = matches.length - 1; i >= 0; i--) {
            const { node, start, end } = matches[i];
            const currentText = node.getTextContent();
            if (currentText.slice(start, end) === original) {
              node.spliceText(start, end - start, corrected);
              found = true;
            }
          }

          if (found) {
            applied++;
          } else {
            skipped++;
          }

          // Update cached text
          textNodes.forEach((info) => {
            info.text = info.node.getTextContent();
          });
        });
      });

      // Notify the UI of results
      window.dispatchEvent(
        new CustomEvent("apply-improve-results", {
          detail: { applied, skipped },
        }),
      );
    };

    window.addEventListener("apply-improve-corrections", handler);
    return () =>
      window.removeEventListener("apply-improve-corrections", handler);
  }, [editor]);

  return null;
}
