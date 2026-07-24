// types/ai.ts
export type AgentType =
  | "brainstorm"
  | "grammar"
  | "tone"
  | "consistency"
  | "fallacies"
  | "pacing"
  | "doctor"
  | "refine-prompt";

export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AIRequest {
  agent: AgentType;
  messages: AIMessage[];
  context?: {
    sceneContent?: string;
    selectedText?: string;
    fullScript?: string;
    styleSheet?: string;
  };
}

export interface Suggestion {
  id: string;
  type: AgentType;
  original: string;
  suggested: string;
  explanation?: string;
  lineNumber?: number;
}
