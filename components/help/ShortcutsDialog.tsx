// components/help/ShortcutsDialog.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Keyboard } from "lucide-react";

interface ShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const shortcuts = [
  { keys: "Ctrl+1", description: "Scene Heading" },
  { keys: "Ctrl+2", description: "Action" },
  { keys: "Ctrl+3", description: "Character" },
  { keys: "Ctrl+4", description: "Dialogue" },
  { keys: "Ctrl+5", description: "Parenthetical" },
  { keys: "Ctrl+6", description: "Transition" },
  { keys: "Ctrl+7", description: "Outline" },
  { keys: "Ctrl+Shift+Right", description: "Cycle element forward" },
  { keys: "Ctrl+Shift+Left", description: "Cycle element backward" },
  { keys: "Ctrl+Space", description: "Open autocomplete" },
  { keys: "Enter", description: "Accept autocomplete suggestion" },
  { keys: "Tab", description: "Accept autocomplete suggestion" },
  { keys: "Esc", description: "Dismiss autocomplete" },
  { keys: "Arrow Up/Down", description: "Navigate autocomplete" },
  { keys: "Ctrl+B", description: "Bold" },
  { keys: "Ctrl+I", description: "Italic" },
  { keys: "Ctrl+U", description: "Underline" },
];

export function ShortcutsDialog({ open, onOpenChange }: ShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {shortcuts.map((shortcut) => (
            <div
              key={shortcut.keys}
              className="flex items-center justify-between py-1 border-b border-muted last:border-0"
            >
              <span className="text-sm">{shortcut.description}</span>
              <kbd className="px-2 py-0.5 text-xs font-semibold bg-muted rounded-md border border-muted-foreground/20">
                {shortcut.keys}
              </kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
