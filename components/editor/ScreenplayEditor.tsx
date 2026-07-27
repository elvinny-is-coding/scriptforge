// components/editor/ScreenplayEditor.tsx
"use client";

import { useEffect, useRef } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { editorConfig } from "@/lib/lexical/config";
import { ScreenplayToolbar } from "./ScreenplayToolbar";
import { AutoFormatPlugin } from "./plugins/AutoFormatPlugin";
import { ScreenplayShortcutsPlugin } from "./plugins/ScreenplayShortcutsPlugin";
import { FloatingFormatMenuPlugin } from "./plugins/FloatingFormatMenuPlugin";
import { GenerateImagePlugin } from "./plugins/GenerateImagePlugin";
import { SelectionTrackingPlugin } from "./plugins/SelectionTrackingPlugin";
import { WordCountPlugin } from "./plugins/WordCountPlugin";
import { CharacterTrackingPlugin } from "./plugins/CharacterTrackingPlugin";
import { CharacterColorPlugin } from "./plugins/CharacterColorPlugin";
import { AutocompletePlugin } from "./plugins/AutocompletePlugin";
import { useAutoSave } from "@/hooks/useAutoSave";
import { Component, type ReactElement } from "react";
import { $getSelection, $isRangeSelection, $getRoot } from "lexical";

interface LexicalErrorBoundaryProps {
  children: ReactElement;
  onError: (error: Error) => void;
}

class LexicalErrorBoundary extends Component<LexicalErrorBoundaryProps> {
  componentDidCatch(error: Error) {
    this.props.onError(error);
  }

  render() {
    return this.props.children;
  }
}

interface ScreenplayEditorProps {
  initialContent: object;
  onSave: (content: object) => Promise<void> | void;
  editable?: boolean;
}

function AutoSaveWrapper({ onSave }: { onSave: (content: object) => void }) {
  const [editor] = useLexicalComposerContext();
  const onSaveRef = useRef(onSave);
  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  const { save } = useAutoSave(async () => {
    const state = editor.getEditorState();
    onSaveRef.current(state.toJSON());
  }, [editor]);

  useEffect(() => {
    return editor.registerUpdateListener(() => {
      save();
    });
  }, [editor, save]);

  useEffect(() => {
    return () => {
      const state = editor.getEditorState();
      onSaveRef.current(state.toJSON());
    };
  }, [editor]);

  return null;
}

function LoadContentPlugin({ content }: { content: object }) {
  const [editor] = useLexicalComposerContext();
  const prevContentRef = useRef(content);

  useEffect(() => {
    if (content !== prevContentRef.current) {
      prevContentRef.current = content;
      if (
        !editor.isEditable() ||
        editor.getRootElement() !== document.activeElement
      ) {
        editor.update(() => {
          const editorState = editor.parseEditorState(JSON.stringify(content));
          editor.setEditorState(editorState);
        });
      }
    }
  }, [content, editor]);

  return null;
}

function InsertSuggestionPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const handleInsert = (e: CustomEvent<string>) => {
      const text = e.detail;
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          selection.insertText(text);
        } else {
          const root = $getRoot();
          const lastChild = root.getLastChild();
          if (lastChild) {
            lastChild.selectEnd();
            const newSelection = $getSelection();
            if ($isRangeSelection(newSelection)) {
              newSelection.insertText(text);
            }
          }
        }
      });
    };

    window.addEventListener("insert-suggestion", handleInsert as EventListener);
    return () => {
      window.removeEventListener(
        "insert-suggestion",
        handleInsert as EventListener,
      );
    };
  }, [editor]);

  return null;
}

export function ScreenplayEditor({
  initialContent,
  onSave,
  editable = true,
}: ScreenplayEditorProps) {
  const isContentValid =
    initialContent &&
    typeof initialContent === "object" &&
    "root" in initialContent &&
    (initialContent as any).root?.children?.length > 0;

  const configWithState = {
    ...editorConfig,
    editable,
    ...(isContentValid ? { editorState: JSON.stringify(initialContent) } : {}),
  };

  return (
    <LexicalComposer initialConfig={configWithState}>
      <div className="flex flex-col h-full">
        {editable && <ScreenplayToolbar />}
        <div className="flex-1 overflow-auto p-4">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="outline-none min-h-full" />
            }
            placeholder={
              <div className="text-muted-foreground/50">
                Start writing your scene...
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
      </div>
      <HistoryPlugin />
      <AutoFormatPlugin />
      <ScreenplayShortcutsPlugin />
      {editable && <FloatingFormatMenuPlugin />}
      <GenerateImagePlugin />
      <SelectionTrackingPlugin />
      <WordCountPlugin />
      <CharacterTrackingPlugin />
      <CharacterColorPlugin />
      <AutocompletePlugin />
      <LoadContentPlugin content={initialContent} />
      <InsertSuggestionPlugin />
      <AutoSaveWrapper onSave={onSave} />
    </LexicalComposer>
  );
}
