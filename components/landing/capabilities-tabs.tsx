"use client";

import {
  PenLine,
  LayoutGrid,
  Sparkles,
  Palette,
  RotateCcw,
  Download,
  Check,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CAPABILITIES = [
  {
    id: "write",
    label: "Write",
    icon: PenLine,
    heading: "An editor that thinks in scenes, not paragraphs",
    description:
      "Built on Lexical with a custom node for every screenplay element, so the format never breaks your flow.",
    points: [
      "Custom nodes for Scene Heading, Action, Character, Dialogue, Parenthetical, Transition, and Outline",
      "Tab and Enter auto-format as you type, following the same state machine a script supervisor would",
      "Cycle element types with Ctrl+Shift+\u2190 / \u2192 or the toolbar, with dedicated Character and Dialogue buttons",
      "Live autocomplete for characters and scene headings, pulled from your script and your saved database",
      "Word and page count always visible in the toolbar, plus a focus mode that clears everything else away",
      "Keyboard shortcuts dialog and guided help slides whenever you need a refresher",
    ],
  },
  {
    id: "organize",
    label: "Organize",
    icon: LayoutGrid,
    heading: "Every project and scene, exactly where you left it",
    description:
      "A dashboard for the big picture, a scene list for the details.",
    points: [
      "Dashboard with search, sort, rename, and delete across every project",
      "Scene list with drag-and-drop reordering and inline rename",
      "Filter the scene list by character to jump straight to their throughline",
    ],
  },
  {
    id: "ai",
    label: "AI partner",
    icon: Sparkles,
    heading: "An AI that reads the whole script before it opens its mouth",
    description:
      "Brainstorm freely, then run focused passes when a scene needs work.",
    points: [
      "Brainstorm chat, saved per scene, with an Insert button to drop ideas straight into the draft",
      "Improve agents for Grammar, Tone, Consistency, Fallacies, and Pacing \u2014 review the change, then Apply",
      "Narrative Doctor runs a full-script pass for plot holes, timeline issues, and character arc gaps",
    ],
  },
  {
    id: "visualize",
    label: "Visualize",
    icon: Palette,
    heading: "See your characters and your world, not just your text",
    description: "Color, structure, and imagery layered on top of the page.",
    points: [
      "Assign each character a color, with dynamic borders through the script wherever they speak",
      "Characters & Dialogue modal for color assignment, a dialogue overview, and per-character word counts",
      "Mood board \u2014 right-click any scene description to generate concept art, open any image full view",
    ],
  },
  {
    id: "history",
    label: "History",
    icon: RotateCcw,
    heading: "Nothing is ever really lost",
    description: "Every draft worth returning to is one click away.",
    points: [
      "Manual snapshots whenever you want a checkpoint",
      "Automatic snapshot taken before every AI insert",
      "Each snapshot stores editor, brainstorm, and improve state together",
      "Restore or delete any snapshot from its own timeline",
    ],
  },
  {
    id: "export",
    label: "Export",
    icon: Download,
    heading: "Ready for the table read, in the format it needs",
    description: "Take your script anywhere from here.",
    points: [
      "Fountain, for compatibility with other screenwriting tools",
      "Plain text, for quick sharing or notes",
      "Formatted PDF with a title page and page numbers",
    ],
  },
];

export function CapabilitiesTabs() {
  return (
    <Tabs defaultValue="write" className="w-full">
      <div className="overflow-x-auto pb-1">
        <TabsList>
          {CAPABILITIES.map(({ id, label, icon: Icon }) => (
            <TabsTrigger key={id} value={id} className="gap-1.5">
              <Icon className="h-3.5 w-3.5" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {CAPABILITIES.map(({ id, icon: Icon, heading, description, points }) => (
        <TabsContent key={id} value={id} className="mt-8">
          <div className="grid gap-8 rounded-xl border bg-card p-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold tracking-tight">
                {heading}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {description}
              </p>
            </div>
            <ul className="space-y-3">
              {points.map((point) => (
                <li key={point} className="flex gap-3 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="text-muted-foreground">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
