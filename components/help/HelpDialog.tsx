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
    title: "Welcome to ScriptForge!",
    description:
      "Let's take a quick tour of the tools that will help you write, polish, and share your screenplay. Use the arrows to move through each topic.",
  },
  {
    title: "Writing and formatting",
    description:
      "Type your script as you normally would. Press Enter to continue the current element, or use the toolbar buttons to switch between Character, Dialogue, Action, and more. Need to change a line’s type? Just click the 👤 or 💬 button.",
  },
  {
    title: "Keyboard shortcuts you’ll love",
    description:
      "Ctrl+1 → Scene Heading\nCtrl+2 → Action\nCtrl+3 → Character\nCtrl+4 → Dialogue\nCtrl+5 → Parenthetical\nCtrl+6 → Transition\nCtrl+7 → Outline\nCtrl+Shift+←/→ to cycle element types\nCtrl+Space to open autocomplete\nCtrl+H to find & replace\nCtrl+S to save",
  },
  {
    title: "AI Brainstorm",
    description:
      "Stuck on a scene? Open the Brainstorm tab and ask the AI for the next beat, dialogue ideas, or story twists. Every response includes an Insert button so you can drop the suggestion right into your script.",
  },
  {
    title: "AI Improve & Doctor",
    description:
      "Use the Improve agents to fix grammar, adjust tone, check pacing, and more. When your draft is done, run the Narrative Doctor — it scans the whole script for plot holes, timeline issues, and character arc gaps.",
  },
  {
    title: "Characters & Colours",
    description:
      "Give each character a colour and watch their dialogue light up with a matching border. Open the Characters & Dialogue modal from the palette icon to assign colours, see all of a character’s lines, and track word counts.",
  },
  {
    title: "Mood Board",
    description:
      "Right‑click any scene description in the editor and choose “Generate Concept Art”. The image appears in your Mood Board — click it to view full‑size.",
  },
  {
    title: "Snapshots",
    description:
      "Worried about losing a good version? Take a snapshot to save everything — editor content, brainstorm chat, and improve outputs. You can restore or delete snapshots anytime from the Snapshots tab.",
  },
  {
    title: "Export & Share",
    description:
      "Export your script as Fountain, plain text, PDF, or Final Draft (.fdx). Need feedback? Generate a share link — anyone with the link can view your script in a clean, read‑only page.",
  },
  {
    title: "Focus Mode",
    description:
      "Click the Maximise icon to hide all panels and toolbars. Only your script remains. Press Escape or click the Exit button to return.",
  },
  {
    title: "You’re all set!",
    description:
      "That’s the essentials. If you ever need a refresher, click the ❓ icon. Happy writing!",
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
      <DialogContent className="sm:max-w-md">
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
