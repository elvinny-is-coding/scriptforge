// components/scene-list/CharacterFilter.tsx
"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CharacterFilterProps {
  characters: string[];
  value: string;
  onChange: (value: string) => void;
}

export function CharacterFilter({
  characters = [],
  value,
  onChange,
}: CharacterFilterProps) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-muted-foreground font-medium">
        Filter by character
      </label>
      <Select onValueChange={onChange} value={value}>
        <SelectTrigger className="w-full h-8 text-xs">
          <SelectValue placeholder="All characters" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All characters</SelectItem>
          {characters.map((char) => (
            <SelectItem key={char} value={char}>
              {char}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
