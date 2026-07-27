// components/help/HelpDialog.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const slides = [
  {
    title: "Welcome to ScriptForge",
    description:
      "ScriptForge is your AI‑powered screenwriting partner. This guide will walk you through its main features.",
  },
  {
    title: "The Editor",
    description:
      "Write using standard screenplay elements. Press Enter to continue the current element type. Use the toolbar buttons or keyboard shortcuts to change element types.",
  },
  {
    title: "Character & Dialogue",
    description:
      "Select a word (like a name) and click the User icon in the toolbar to turn it into a Character element. Select a sentence and click the Message icon to turn it into Dialogue. The buttons light up when you're on a Character or Dialogue line.\n\nKeyboard: Ctrl+3 for Character, Ctrl+4 for Dialogue.",
  },
  {
    title: "Character Colors & Dialogue",
    description:
      "Each character can have a custom color. Open the Characters & Dialogue modal from the palette icon next to the character filter. Assign a colour, then the character names and their dialogue will show a coloured left border in the editor. The modal also shows all dialogue lines for a character, with word counts.",
  },
  {
    title: "All Shortcuts",
    description:
      "Ctrl+1 Scene Heading\nCtrl+2 Action\nCtrl+3 Character\nCtrl+4 Dialogue\nCtrl+5 Parenthetical\nCtrl+6 Transition\nCtrl+7 Outline\nCtrl+Shift+Right / Left cycle element types\nCtrl+Space open autocomplete\nEnter / Tab apply suggestion\nEsc dismiss suggestions",
  },
  {
    title: "Autocomplete",
    description:
      "As you type a character name or scene heading, suggestions appear automatically. Press Ctrl+Space to force them. Use Arrow keys to navigate and Enter to accept. The list includes both saved and unsaved names.",
  },
  {
    title: "Scene Management",
    description:
      "The left panel lists all scenes. Double‑click a scene heading to rename it. Drag scenes to reorder them. Use 'New Scene' to add one. The character filter lets you see only scenes containing a specific character.",
  },
  {
    title: "AI Brainstorm",
    description:
      "In the right sidebar, the Brainstorm tab lets you chat with an AI writing partner. Ask it to suggest next beats, dialogue, or story ideas. Responses include an 'Insert' button to add the suggestion directly into the editor. The chat is saved per scene.",
  },
  {
    title: "AI Improve",
    description:
      "The Improve tab provides agents for grammar/style, tone shifting, consistency checks, logic fallacies, and pacing. Click an agent to analyze the current scene, then apply suggested changes.",
  },
  {
    title: "Narrative Doctor",
    description:
      "The Doctor tab analyzes your entire script for structural issues like timeline contradictions, missing setups, and character arc gaps. Run it when you have a draft ready.",
  },
  {
    title: "Mood Board",
    description:
      "Right‑click any scene description text and choose 'Generate Concept Art' to create an image. Images are stored in the Mood Board tab where you can view them full‑size.",
  },
  {
    title: "Focus Mode & Export",
    description:
      "Click the Maximize icon to enter Focus Mode — all panels disappear, leaving only the editor. Use the Export button to download your script in Fountain format (or plain text). A Help button (?) is also available in the top bar.",
  },
];

export function HelpDialog({ open, onOpenChange }: HelpDialogProps) {
  const [step, setStep] = useState(0);

  const handleNext = () => setStep((s) => Math.min(s + 1, slides.length - 1));
  const handlePrev = () => setStep((s) => Math.max(s - 1, 0));
  const handleClose = () => {
    setStep(0);
    onOpenChange(false);
  };

  const slide = slides[step];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{slide.title}</DialogTitle>
          <DialogDescription className="whitespace-pre-wrap">
            {slide.description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-between pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={step === 0}
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            {step + 1} / {slides.length}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={step === slides.length - 1}
          >
            Next <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
