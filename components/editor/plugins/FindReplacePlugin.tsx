// components/editor/plugins/FindReplacePlugin.tsx
"use client";

import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getRoot,
  $isTextNode,
  $isElementNode,
  $getSelection,
  $isRangeSelection,
  $setSelection,
} from "lexical";

export type SearchResult = {
  text: string;
  nodeKey: string;
  startIndex: number;
  endIndex: number;
  selected: boolean;
};

let searchResults: SearchResult[] = [];
let currentResultIndex = -1;

export function getSearchResults() {
  return searchResults;
}

export function setCurrentResultIndex(idx: number) {
  currentResultIndex = idx;
}

export function clearSearchResults() {
  searchResults = [];
  currentResultIndex = -1;
}

export function FindReplacePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const handleSearch = (e: CustomEvent<{ query: string }>) => {
      const { query } = e.detail;
      if (!query) {
        clearSearchResults();
        window.dispatchEvent(
          new CustomEvent("find-replace:results", { detail: [] }),
        );
        return;
      }

      const results: SearchResult[] = [];
      editor.getEditorState().read(() => {
        const root = $getRoot();
        const children = root.getChildren();
        for (const child of children) {
          if (!$isElementNode(child)) continue;
          const textNodes: Array<{ node: any; text: string }> = [];
          child.getChildren().forEach((textNode: any) => {
            if ($isTextNode(textNode)) {
              textNodes.push({
                node: textNode,
                text: textNode.getTextContent(),
              });
            }
          });
          for (const { node, text } of textNodes) {
            let idx = 0;
            while ((idx = text.indexOf(query, idx)) !== -1) {
              results.push({
                text: query,
                nodeKey: node.getKey(),
                startIndex: idx,
                endIndex: idx + query.length,
                selected: false,
              });
              idx += query.length;
            }
          }
        }
      });

      searchResults = results;
      currentResultIndex = results.length > 0 ? 0 : -1;
      window.dispatchEvent(
        new CustomEvent("find-replace:results", { detail: results }),
      );
    };

    window.addEventListener(
      "find-replace:search",
      handleSearch as EventListener,
    );
    return () =>
      window.removeEventListener(
        "find-replace:search",
        handleSearch as EventListener,
      );
  }, [editor]);

  useEffect(() => {
    const handleJump = (e: CustomEvent<{ index: number }>) => {
      const { index } = e.detail;
      if (index < 0 || index >= searchResults.length) return;
      const result = searchResults[index];
      editor.update(() => {
        const node = editor.getEditorState()._nodeMap.get(result.nodeKey);
        if (node && $isTextNode(node)) {
          const selection = node.select(result.startIndex, result.endIndex);
          $setSelection(selection);
        }
      });
    };
    window.addEventListener("find-replace:jump", handleJump as EventListener);
    return () =>
      window.removeEventListener(
        "find-replace:jump",
        handleJump as EventListener,
      );
  }, [editor]);

  useEffect(() => {
    const handleReplace = (
      e: CustomEvent<{ replaceText: string; all?: boolean }>,
    ) => {
      const { replaceText, all } = e.detail;
      if (all) {
        editor.update(() => {
          for (const result of searchResults) {
            const node = editor.getEditorState()._nodeMap.get(result.nodeKey);
            if (node && $isTextNode(node)) {
              const currentText = node.getTextContent();
              const before = currentText.slice(0, result.startIndex);
              const after = currentText.slice(result.endIndex);
              node.setTextContent(before + replaceText + after);
            }
          }
        });
        clearSearchResults();
        window.dispatchEvent(
          new CustomEvent("find-replace:results", { detail: [] }),
        );
      } else if (
        currentResultIndex >= 0 &&
        currentResultIndex < searchResults.length
      ) {
        const result = searchResults[currentResultIndex];
        editor.update(() => {
          const node = editor.getEditorState()._nodeMap.get(result.nodeKey);
          if (node && $isTextNode(node)) {
            const currentText = node.getTextContent();
            const before = currentText.slice(0, result.startIndex);
            const after = currentText.slice(result.endIndex);
            node.setTextContent(before + replaceText + after);
          }
        });
        window.dispatchEvent(
          new CustomEvent("find-replace:search", {
            detail: { query: replaceText },
          }),
        );
      }
    };
    window.addEventListener(
      "find-replace:replace",
      handleReplace as EventListener,
    );
    return () =>
      window.removeEventListener(
        "find-replace:replace",
        handleReplace as EventListener,
      );
  }, [editor]);

  return null;
}
