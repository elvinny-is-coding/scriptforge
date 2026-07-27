// lib/chat-formatter.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface FormattedContentProps {
  text: string;
  onInsertCode?: (code: string) => void;
}

export function FormattedChatContent({
  text,
  onInsertCode,
}: FormattedContentProps) {
  if (!text) return null;

  const segments = parseSegments(text);

  return <>{segments.map((seg, i) => renderSegment(seg, i, onInsertCode))}</>;
}

type Segment = CodeSegment | TextSegment;

export interface CodeSegment {
  type: "code";
  language?: string;
  content: string;
}

interface TextSegment {
  type: "text";
  lines: string[];
}

function parseSegments(raw: string): Segment[] {
  const segments: Segment[] = [];
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(raw)) !== null) {
    const before = raw.slice(lastIndex, match.index).trim();
    if (before) {
      segments.push({ type: "text", lines: before.split("\n") });
    }
    segments.push({
      type: "code",
      language: match[1] ?? undefined,
      content: match[2].trim(),
    });
    lastIndex = codeBlockRegex.lastIndex;
  }

  const after = raw.slice(lastIndex).trim();
  if (after) {
    segments.push({ type: "text", lines: after.split("\n") });
  }

  return segments.length > 0
    ? segments
    : [{ type: "text", lines: raw.split("\n") }];
}

function renderSegment(
  seg: Segment,
  key: number,
  onInsertCode?: (code: string) => void,
): React.ReactNode {
  if (seg.type === "code") {
    return (
      <div key={key} className="my-2">
        <pre className="bg-muted/50 rounded-md p-3 overflow-x-auto text-xs">
          <code>{seg.content}</code>
        </pre>
        {onInsertCode && (
          <Button
            variant="outline"
            size="sm"
            className="mt-2 gap-1"
            onClick={() => onInsertCode(seg.content)}
          >
            <Plus className="h-3 w-3" />
            Insert
          </Button>
        )}
      </div>
    );
  }

  const elements: React.ReactNode[] = [];
  let i = 0;
  while (i < seg.lines.length) {
    const line = seg.lines[i];

    if (/^\*\*.*\*\*$/.test(line.trim())) {
      elements.push(
        <div
          key={`h-${key}-${i}`}
          className="font-semibold text-sm mt-3 mb-1 text-foreground"
        >
          {parseInlineBold(line.trim().slice(2, -2))}
        </div>,
      );
      i++;
      continue;
    }

    if (/^[-*]\s/.test(line.trim())) {
      const listItems: string[] = [];
      while (i < seg.lines.length && /^[-*]\s/.test(seg.lines[i].trim())) {
        listItems.push(seg.lines[i].trim().replace(/^[-*]\s/, ""));
        i++;
      }
      elements.push(
        <ul
          key={`ul-${key}-${i}`}
          className="list-disc list-inside my-1 space-y-1"
        >
          {listItems.map((item, idx) => (
            <li key={idx} className="text-sm">
              {parseInlineBold(item)}
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    if (line.trim() === "") {
      elements.push(<div key={`br-${key}-${i}`} className="my-1" />);
      i++;
      continue;
    }

    elements.push(
      <p
        key={`p-${key}-${i}`}
        className="text-sm leading-relaxed whitespace-pre-wrap mb-1"
      >
        {parseInlineBold(line)}
      </p>,
    );
    i++;
  }

  return <div key={key}>{elements}</div>;
}

function parseInlineBold(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}
