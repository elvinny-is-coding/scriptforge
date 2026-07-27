// app/(protected)/project/[projectId]/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProject } from "@/hooks/useProject";
import { useScenes } from "@/hooks/useScenes";
import { useSnapshots } from "@/hooks/useSnapshots";
import { useMoodBoard } from "@/hooks/useMoodBoard";
import { AppShell } from "@/components/layout/AppShell";
import { TopBar } from "@/components/layout/TopBar";
import { SceneList } from "@/components/scene-list/SceneList";
import { ScreenplayEditor } from "@/components/editor/ScreenplayEditor";
import { SidebarPanel } from "@/components/sidebar/SidebarPanel";
import { CharacterDialogueModal } from "@/components/sidebar/CharacterDialogueModal";
import { ExportDialog } from "@/components/export/ExportDialog";
import { HelpDialog } from "@/components/help/HelpDialog";
import { ShortcutsDialog } from "@/components/help/ShortcutsDialog";
import { MoodBoardPanel } from "@/components/moodboard/MoodBoardPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CharacterColorsProvider } from "@/contexts/CharacterColorsContext";
import { Button } from "@/components/ui/button";
import {
  Download,
  Maximize2,
  Minimize2,
  ArrowLeft,
  HelpCircle,
  Keyboard,
  Trash2,
} from "lucide-react";
import type { Json } from "@/types/supabase";
import { toast } from "sonner";

export default function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();

  const {
    project,
    loading: projectLoading,
    brainstormMessages,
    updateBrainstormMessages,
    improveOutputsByScene,
    updateImproveOutputs,
    doctorReport,
    updateDoctorReport,
    resetBrainstormScene,
    resetImproveScene,
    characterColors,
    updateCharacterColors,
  } = useProject(projectId);

  const {
    scenes,
    loading: scenesLoading,
    createScene,
    updateScene,
    deleteScene,
    reorderScenes,
  } = useScenes(projectId);

  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [selectedText, setSelectedText] = useState("");
  const [characters, setCharacters] = useState<string[]>([]);
  const [isCharacterModalOpen, setCharacterModalOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);

  const { addImage } = useMoodBoard(projectId);

  // ---------- Image generation listener ----------
  useEffect(() => {
    const handler = (e: Event) => {
      const event = e as CustomEvent<string>;
      const sceneText = event.detail;
      if (!sceneText) return;

      (async () => {
        try {
          const styleSheet = (project as any)?.style_sheet ?? {};
          const refineRes = await fetch("/api/cloudflare/refine-prompt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sceneText, styleSheet }),
          });
          if (!refineRes.ok) throw new Error("Prompt refinement failed");
          const refinedPrompt = await refineRes.text();

          const genRes = await fetch("/api/cloudflare/generate-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: refinedPrompt }),
          });
          if (!genRes.ok) throw new Error("Image generation failed");
          const { image } = await genRes.json();

          await addImage(image, refinedPrompt, sceneText);
          toast.success("Image added to moodboard");
        } catch (err: any) {
          toast.error(err.message || "Image generation failed");
        }
      })();
    };

    window.addEventListener("generate-image", handler);
    return () => window.removeEventListener("generate-image", handler);
  }, [project, addImage]);

  // ---------- Selection tracking listener ----------
  useEffect(() => {
    const handler = (e: Event) => {
      setSelectedText((e as CustomEvent<string>).detail);
    };

    window.addEventListener("selection-change", handler);
    return () => window.removeEventListener("selection-change", handler);
  }, []);

  // ---------- Live characters listener ----------
  useEffect(() => {
    const handler = (e: Event) => {
      setCharacters((e as CustomEvent<string[]>).detail);
    };

    window.addEventListener("live-characters", handler);
    return () => window.removeEventListener("live-characters", handler);
  }, []);

  // Set initial scene when scenes load
  useEffect(() => {
    if (scenes.length > 0 && !selectedSceneId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedSceneId(scenes[0].id);
    }
  }, [scenes, selectedSceneId]);

  const currentScene = scenes.find((s) => s.id === selectedSceneId);
  const { snapshots, createSnapshot, deleteSnapshot } = useSnapshots(
    selectedSceneId ?? undefined,
  );

  const handleSave = useCallback(
    async (content: object) => {
      if (!selectedSceneId) return;
      await updateScene(selectedSceneId, { content: content as Json });
    },
    [selectedSceneId, updateScene],
  );

  const handleSetBrainstormMessages = useCallback<
    React.Dispatch<React.SetStateAction<any[]>>
  >(
    (action) => {
      if (!selectedSceneId) return;
      updateBrainstormMessages((prev) => {
        const currentMessages = prev[selectedSceneId] || [];
        const newMessages =
          typeof action === "function" ? action(currentMessages) : action;
        return { ...prev, [selectedSceneId]: newMessages };
      });
    },
    [selectedSceneId, updateBrainstormMessages],
  );

  // Reusable helper: gather full context for a snapshot
  const buildSnapshotPayload = () => {
    if (!selectedSceneId || !currentScene) return null;
    return {
      editorContent: currentScene.content as Json,
      brainstormMessages:
        (brainstormMessages as Record<string, any[]>)[selectedSceneId] ?? [],
      improveOutput: improveOutputsByScene[selectedSceneId] ?? null,
    };
  };

  const handleInsertSuggestion = async (text: string) => {
    const payload = buildSnapshotPayload();
    if (payload) {
      await createSnapshot(payload as Json);
    }
    window.dispatchEvent(
      new CustomEvent("insert-suggestion", { detail: text }),
    );
  };

  const handleRenameScene = async (sceneId: string, heading: string) => {
    await updateScene(sceneId, { heading });
  };

  const leftPanel = focusMode ? null : (
    <SceneList
      projectId={projectId}
      scenes={scenes}
      loading={scenesLoading}
      selectedSceneId={selectedSceneId}
      onSelectScene={setSelectedSceneId}
      onRenameScene={handleRenameScene}
      onCreateScene={async () => {
        const scene = await createScene();
        if (scene) setSelectedSceneId(scene.id);
      }}
      onDeleteScene={async (id) => {
        await deleteScene(id);
        if (selectedSceneId === id) setSelectedSceneId(null);
      }}
      onReorder={reorderScenes}
      characters={characters}
      onOpenCharacterModal={() => setCharacterModalOpen(true)}
    />
  );

  const centerPanel = currentScene ? (
    <CharacterColorsProvider colors={characterColors}>
      <ScreenplayEditor
        key={currentScene.id}
        initialContent={currentScene.content as object}
        onSave={handleSave}
        focusMode={focusMode}
      />
    </CharacterColorsProvider>
  ) : (
    <div className="flex items-center justify-center h-full text-muted-foreground">
      Select a scene or create one
    </div>
  );

  const rightPanel = focusMode ? null : currentScene ? (
    <Tabs defaultValue="ai" className="h-full flex flex-col">
      <TabsList className="w-full justify-start px-2 pt-2">
        <TabsTrigger value="ai">AI Assistant</TabsTrigger>
        <TabsTrigger value="moodboard">Mood Board</TabsTrigger>
        <TabsTrigger value="snapshots">Snapshots</TabsTrigger>
      </TabsList>
      <TabsContent value="ai" className="flex-1 overflow-hidden m-0">
        <SidebarPanel
          projectId={projectId}
          currentSceneContent={
            currentScene?.heading + "\n" + JSON.stringify(currentScene.content)
          }
          selectedText={selectedText}
          onInsertSuggestion={handleInsertSuggestion}
          brainstormMessages={
            selectedSceneId
              ? (brainstormMessages as Record<string, any[]>)[
                  selectedSceneId
                ] || []
              : []
          }
          setBrainstormMessages={handleSetBrainstormMessages}
          selectedSceneId={selectedSceneId}
          improveOutputsByScene={improveOutputsByScene}
          setImproveOutputsByScene={updateImproveOutputs}
          doctorReport={doctorReport}
          setDoctorReport={updateDoctorReport}
          resetBrainstormScene={resetBrainstormScene}
          resetImproveScene={resetImproveScene}
        />
      </TabsContent>
      <TabsContent value="moodboard" className="flex-1 overflow-hidden m-0">
        <MoodBoardPanel projectId={projectId} />
      </TabsContent>
      <TabsContent value="snapshots" className="flex-1 overflow-hidden m-0">
        <div className="p-2 space-y-2">
          <p className="text-xs text-muted-foreground mb-1">
            Save a version of the current scene, including AI chat and improve
            outputs, to restore later.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={async () => {
              const payload = buildSnapshotPayload();
              if (!payload) {
                toast.error("Nothing to save");
                return;
              }
              const result = await createSnapshot(payload as Json);
              if (result?.success) {
                toast.success("Snapshot saved");
              } else {
                toast.error(result?.error || "Failed to save snapshot");
              }
            }}
            disabled={!selectedSceneId}
          >
            Take Snapshot
          </Button>
          {snapshots.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center">
              No snapshots yet
            </p>
          ) : (
            <div className="space-y-1">
              {snapshots.map((s) => (
                <div key={s.id} className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 justify-start"
                    onClick={() => {
                      if (!selectedSceneId) return;
                      const payload = s.content as any;
                      // Restore editor content
                      updateScene(selectedSceneId, {
                        content: payload.editorContent,
                      });
                      // Restore brainstorm messages if present
                      if (payload.brainstormMessages) {
                        updateBrainstormMessages((prev) => ({
                          ...prev,
                          [selectedSceneId]: payload.brainstormMessages,
                        }));
                      }
                      // Restore improve outputs if present
                      if (payload.improveOutput) {
                        updateImproveOutputs((prev) => ({
                          ...prev,
                          [selectedSceneId]: payload.improveOutput,
                        }));
                      }
                      toast.success("Snapshot restored");
                    }}
                  >
                    Restore from {new Date(s.created_at).toLocaleString()}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() => {
                      deleteSnapshot(s.id);
                      toast.success("Snapshot deleted");
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  ) : null;

  const topBar = focusMode ? null : (
    <TopBar
      title={project?.title || "Untitled"}
      leftContent={
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/projects")}
          title="Back to Projects"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      }
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShortcutsOpen(true)}
        title="Keyboard Shortcuts"
      >
        <Keyboard className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setHelpOpen(true)}
        title="Help"
      >
        <HelpCircle className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setFocusMode(true)}
        title="Enter Focus Mode"
      >
        <Maximize2 className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="sm" onClick={() => setExportOpen(true)}>
        <Download className="mr-1 h-4 w-4" /> Export
      </Button>
    </TopBar>
  );

  return (
    <div className={focusMode ? "h-full flex flex-col" : ""}>
      {focusMode && (
        <div className="absolute top-2 right-2 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFocusMode(false)}
          >
            <Minimize2 className="mr-1 h-3 w-3" /> Exit Focus
          </Button>
        </div>
      )}
      <AppShell
        topBar={topBar}
        leftPanel={leftPanel}
        centerPanel={centerPanel}
        rightPanel={rightPanel}
      />
      <ExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        projectTitle={project?.title || "Untitled Script"}
        projectId={projectId}
      />
      <HelpDialog open={helpOpen} onOpenChange={setHelpOpen} />
      <ShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
      <CharacterDialogueModal
        open={isCharacterModalOpen}
        onOpenChange={setCharacterModalOpen}
        scenes={scenes}
        characters={characters}
        characterColors={characterColors}
        onUpdateCharacterColors={updateCharacterColors}
      />
    </div>
  );
}
