// types/screenplay.ts
export type ScreenplayNodeType =
  | "scene-heading"
  | "action"
  | "character"
  | "dialogue"
  | "parenthetical"
  | "transition";

export interface ScreenplayElement {
  type: ScreenplayNodeType;
  children: {
    text: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
  }[];
}

export interface Scene {
  id: string;
  projectId: string;
  orderIndex: number;
  heading: string;
  content: object; // Lexical state
  status: "draft" | "revised";
}

export interface Snapshot {
  id: string;
  sceneId: string;
  content: object;
  createdAt: string;
}
