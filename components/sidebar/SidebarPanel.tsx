// components/sidebar/SidebarPanel.tsx
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BrainstormTab } from "./BrainstormTab";
import { ImproveTab } from "./ImproveTab";
import { DoctorTab } from "./DoctorTab";

type ChatMessage = { role: "user" | "assistant"; content: string };

interface SidebarPanelProps {
  projectId: string;
  currentSceneContent: string;
  selectedText: string;
  onInsertSuggestion: (text: string) => void;
  brainstormMessages: ChatMessage[];
  setBrainstormMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  selectedSceneId: string | null;
  improveOutputsByScene: Record<string, { agent: string; output: string }>;
  setImproveOutputsByScene: (
    action:
      | Record<string, { agent: string; output: string }>
      | ((
          prev: Record<string, { agent: string; output: string }>,
        ) => Record<string, { agent: string; output: string }>),
  ) => void;
  doctorReport: any;
  setDoctorReport: (report: any) => void;
  resetBrainstormScene: (sceneId: string) => void;
  resetImproveScene: (sceneId: string) => void;
}

export function SidebarPanel({
  projectId,
  currentSceneContent,
  selectedText,
  onInsertSuggestion,
  brainstormMessages,
  setBrainstormMessages,
  selectedSceneId,
  improveOutputsByScene,
  setImproveOutputsByScene,
  doctorReport,
  setDoctorReport,
  resetBrainstormScene,
  resetImproveScene,
}: SidebarPanelProps) {
  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="brainstorm" className="flex flex-col h-full">
        <TabsList className="w-full justify-start px-2 pt-2">
          <TabsTrigger value="brainstorm">Brainstorm</TabsTrigger>
          <TabsTrigger value="improve">Improve</TabsTrigger>
          <TabsTrigger value="doctor">Doctor</TabsTrigger>
        </TabsList>
        <div className="flex-1 overflow-hidden">
          <TabsContent value="brainstorm" className="h-full m-0">
            <BrainstormTab
              currentSceneContent={currentSceneContent}
              selectedText={selectedText}
              onInsertSuggestion={onInsertSuggestion}
              messages={brainstormMessages}
              setMessages={setBrainstormMessages}
              onReset={
                selectedSceneId
                  ? () => resetBrainstormScene(selectedSceneId)
                  : undefined
              }
            />
          </TabsContent>
          <TabsContent value="improve" className="h-full m-0">
            <ImproveTab
              currentSceneContent={currentSceneContent}
              selectedText={selectedText}
              onInsertSuggestion={onInsertSuggestion}
              selectedSceneId={selectedSceneId}
              improveOutputsByScene={improveOutputsByScene}
              setImproveOutputsByScene={setImproveOutputsByScene}
              onReset={
                selectedSceneId
                  ? () => resetImproveScene(selectedSceneId)
                  : undefined
              }
            />
          </TabsContent>
          <TabsContent value="doctor" className="h-full m-0">
            <DoctorTab
              projectId={projectId}
              doctorReport={doctorReport}
              setDoctorReport={setDoctorReport}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
