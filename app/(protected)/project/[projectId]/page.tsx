// app/(protected)/project/[projectId]/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useProject } from "@/hooks/useProject";
import { useScenes } from "@/hooks/useScenes";
import { useSnapshots } from "@/hooks/useSnapshots";
import { useMoodBoard } from "@/hooks/useMoodBoard";
import { AppShell } from "@/components/layout/AppShell";
import { TopBar } from "@/components/layout/TopBar";
import { SceneList } from "@/components/scene-list/SceneList";
import { ScreenplayEditor } from "@/components/editor/ScreenplayEditor";
import { SidebarPanel } from "@/components/sidebar/SidebarPanel";
import { MoodBoardPanel } from "@/components/moodboard/MoodBoardPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { Json } from "@/types/supabase";
import { toast } from "sonner";

export default function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();

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

  // Mood board – we only need addImage
  const { addImage } = useMoodBoard(projectId);

  // ---------- Image generation listener ----------
  useEffect(() => {
    const handleGenerateImage = async (e: CustomEvent<string>) => {
      const sceneText = e.detail;
      if (!sceneText) return;

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
    };

    window.addEventListener(
      "generate-image",
      handleGenerateImage as EventListener,
    );
    return () => {
      window.removeEventListener(
        "generate-image",
        handleGenerateImage as EventListener,
      );
    };
  }, [project, addImage]);

  // ---------- Selection tracking listener ----------
  useEffect(() => {
    const handleSelection = (e: CustomEvent<string>) => {
      setSelectedText(e.detail);
    };

    window.addEventListener(
      "selection-change",
      handleSelection as EventListener,
    );
    return () => {
      window.removeEventListener(
        "selection-change",
        handleSelection as EventListener,
      );
    };
  }, []);

  // Set initial scene when scenes load
  useEffect(() => {
    if (scenes.length > 0 && !selectedSceneId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedSceneId(scenes[0].id);
    }
  }, [scenes, selectedSceneId]);

  const currentScene = scenes.find((s) => s.id === selectedSceneId);
  const { snapshots, createSnapshot } = useSnapshots(
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

  const handleInsertSuggestion = async (text: string) => {
    // Auto‑snapshot the current scene before applying the AI change
    if (selectedSceneId && currentScene) {
      await createSnapshot(currentScene.content as any);
    }
    window.dispatchEvent(
      new CustomEvent("insert-suggestion", { detail: text }),
    );
  };

  const handleExport = async () => {
    try {
      const res = await fetch(`/api/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project?.title || "script"}.fountain`;
      a.click();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRenameScene = async (sceneId: string, heading: string) => {
    await updateScene(sceneId, { heading });
  };

  const leftPanel = (
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
      onReorder={reorderScenes} // ← added
    />
  );

  const centerPanel = currentScene ? (
    <ScreenplayEditor
      key={currentScene.id}
      initialContent={currentScene.content as object}
      onSave={handleSave}
    />
  ) : (
    <div className="flex items-center justify-center h-full text-muted-foreground">
      Select a scene or create one
    </div>
  );

  const rightPanel = currentScene ? (
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
            Save a version of the current scene to restore later.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={async () => {
              if (selectedSceneId && currentScene) {
                const result = await createSnapshot(
                  currentScene.content as Json,
                );
                if (result?.success) {
                  toast.success("Snapshot saved");
                } else {
                  toast.error(result?.error || "Failed to save snapshot");
                }
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
                <Button
                  key={s.id}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    if (selectedSceneId) {
                      updateScene(selectedSceneId, {
                        content: s.content,
                      });
                      toast.success("Snapshot restored");
                    }
                  }}
                >
                  Restore from {new Date(s.created_at).toLocaleString()}
                </Button>
              ))}
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  ) : null;

  const topBar = (
    <TopBar title={project?.title || "Untitled"}>
      <Button variant="outline" size="sm" onClick={handleExport}>
        <Download className="mr-1 h-4 w-4" /> Export
      </Button>
    </TopBar>
  );

  return (
    <AppShell
      topBar={topBar}
      leftPanel={leftPanel}
      centerPanel={centerPanel}
      rightPanel={rightPanel}
    />
  );
}
