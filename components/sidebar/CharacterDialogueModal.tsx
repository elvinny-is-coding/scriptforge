// components/sidebar/CharacterDialogueModal.tsx
"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Sketch } from "@uiw/react-color";
import { ChevronDown, ChevronRight, Palette } from "lucide-react";

interface SceneData {
  id: string;
  heading: string;
  content: any; // Lexical JSON
}

interface DialogueLine {
  sceneHeading: string;
  line: string;
}

interface CharacterDialogueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scenes: SceneData[];
  characters: string[];
  characterColors: Record<string, string>;
  onUpdateCharacterColors: (colors: Record<string, string>) => void;
}

export function CharacterDialogueModal({
  open,
  onOpenChange,
  scenes,
  characters,
  characterColors,
  onUpdateCharacterColors,
}: CharacterDialogueModalProps) {
  const [expandedChar, setExpandedChar] = useState<string | null>(null);

  // Extract all dialogue lines per character
  const dialogueByCharacter = useMemo(() => {
    const map: Record<string, DialogueLine[]> = {};
    characters.forEach((char) => {
      map[char] = [];
    });

    scenes.forEach((scene) => {
      const heading = scene.heading || "UNTITLED";
      const content = scene.content as any;
      const children = content?.root?.children;
      if (!children) return;

      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child.type === "character") {
          const name = child.children?.[0]?.text?.trim().toUpperCase();
          if (name && characters.includes(name)) {
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
                map[name].push({
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

    return map;
  }, [scenes, characters]);

  // Compute word counts
  const wordCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    characters.forEach((char) => {
      const lines = dialogueByCharacter[char] || [];
      counts[char] = lines.reduce(
        (sum, l) => sum + l.line.split(/\s+/).filter(Boolean).length,
        0,
      );
    });
    return counts;
  }, [dialogueByCharacter, characters]);

  const handleColorChange = (character: string, color: string) => {
    const updated = { ...characterColors, [character]: color };
    onUpdateCharacterColors(updated);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Characters & Dialogue</DialogTitle>
          <DialogDescription>
            Assign a color to each character and review their dialogue.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-3">
            {characters.map((char) => {
              const lines = dialogueByCharacter[char] || [];
              const color = characterColors[char] || "#cccccc";
              const isExpanded = expandedChar === char;

              return (
                <div key={char} className="border rounded-md p-3 space-y-2">
                  <div className="flex items-center gap-3">
                    {/* Color picker – no nested buttons */}
                    <Popover>
                      <PopoverTrigger
                        className="inline-flex items-center justify-center h-8 w-8 rounded-full border-2 cursor-pointer shrink-0"
                        style={{ backgroundColor: color }}
                        title="Change color"
                      >
                        <Palette className="h-4 w-4 text-white drop-shadow" />
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 border-0">
                        <Sketch
                          color={color}
                          onChange={(c) => handleColorChange(char, c.hex)}
                        />
                      </PopoverContent>
                    </Popover>

                    {/* Character name */}
                    <div className="flex-1">
                      <span className="font-semibold text-sm uppercase">
                        {char}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {wordCounts[char]} words
                      </span>
                    </div>

                    {/* Expand button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setExpandedChar(isExpanded ? null : char)}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* Expanded dialogue lines */}
                  {isExpanded && lines.length > 0 && (
                    <div className="pl-10 space-y-2 pt-2">
                      {lines.map((line, idx) => (
                        <div
                          key={idx}
                          className="text-sm border-l-2 pl-3"
                          style={{ borderColor: color }}
                        >
                          <p className="text-xs text-muted-foreground italic">
                            {line.sceneHeading}
                          </p>
                          <p className="whitespace-pre-wrap">{line.line}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {isExpanded && lines.length === 0 && (
                    <p className="text-xs text-muted-foreground pl-10">
                      No dialogue yet for this character.
                    </p>
                  )}
                </div>
              );
            })}

            {characters.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No characters found in the script yet. Add a character name in
                the editor and use the Character button to create one.
              </p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
