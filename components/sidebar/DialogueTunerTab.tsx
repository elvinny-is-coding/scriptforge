// components/sidebar/DialogueTunerTab.tsx
"use client";

import { useMemo, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SceneData {
  id: string;
  heading: string;
  content: any; // Lexical JSON
}

interface DialogueTunerTabProps {
  scenes: SceneData[];
  characters: string[];
}

interface DialogueLine {
  sceneHeading: string;
  line: string;
}

export function DialogueTunerTab({
  scenes,
  characters,
}: DialogueTunerTabProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(
    null,
  );

  const dialogueLines = useMemo(() => {
    if (!selectedCharacter) return [];

    const lines: DialogueLine[] = [];
    scenes.forEach((scene) => {
      const heading = scene.heading || "UNTITLED";
      const content = scene.content as any;
      const children = content?.root?.children;
      if (!children) return;

      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child.type === "character") {
          const name = child.children?.[0]?.text?.trim().toUpperCase();
          if (name === selectedCharacter.toUpperCase()) {
            let nextIdx = i + 1;
            while (
              nextIdx < children.length &&
              (children[nextIdx].type === "parenthetical" ||
                children[nextIdx].type === "dialogue")
            ) {
              if (children[nextIdx].type === "dialogue") {
                const dialogueText =
                  children[nextIdx].children
                    ?.map((c: any) => c.text)
                    .join("") || "";
                lines.push({
                  sceneHeading: heading,
                  line: dialogueText,
                });
              }
              nextIdx++;
            }
          }
        }
      }
    });
    return lines;
  }, [scenes, selectedCharacter]);

  return (
    <div className="flex flex-col h-full p-3 space-y-3">
      {/* Step‑by‑step description */}
      <div className="bg-muted/50 rounded-md p-3 text-xs text-muted-foreground space-y-1">
        <p className="font-medium text-foreground">Dialogue Tuner</p>
        <p>1. Choose a character from the dropdown below.</p>
        <p>2. All their dialogue lines appear grouped by scene.</p>
        <p>
          3. Read the lines in order to spot voice inconsistencies or repeated
          phrases.
        </p>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-muted-foreground">
          Select Character
        </label>
        <Select onValueChange={(val) => setSelectedCharacter(val)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a character..." />
          </SelectTrigger>
          <SelectContent>
            {characters.map((char) => (
              <SelectItem key={char} value={char}>
                {char}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedCharacter && (
        <div className="flex-1 flex flex-col min-h-0">
          <p className="text-xs text-muted-foreground mb-2">
            {dialogueLines.length} line{dialogueLines.length !== 1 ? "s" : ""}
          </p>
          <ScrollArea className="flex-1">
            <div className="space-y-3">
              {dialogueLines.map((item, idx) => (
                <div key={idx} className="border-b pb-2 text-sm">
                  <p className="text-xs text-muted-foreground italic">
                    {item.sceneHeading}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap">{item.line}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
