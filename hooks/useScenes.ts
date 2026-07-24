// hooks/useScenes.ts
"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type {
  Database,
  Json,
  TablesInsert,
  TablesUpdate,
} from "@/types/supabase";

type Scene = Database["public"]["Tables"]["scenes"]["Row"];

const EMPTY_LEXICAL_STATE: Json = {
  root: {
    children: [],
    direction: null,
    format: "",
    indent: 0,
    type: "root",
    version: 1,
  },
};

export function useScenes(projectId: string | undefined) {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchScenes = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    const { data } = await supabase
      .from("scenes")
      .select("*")
      .eq("project_id", projectId)
      .order("order_index");
    setScenes(data ?? []);
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchScenes();
  }, [fetchScenes]);

  const createScene = async (heading?: string, orderIndex?: number) => {
    if (!projectId) return null;
    const idx = orderIndex ?? scenes.length;

    const insertData: TablesInsert<"scenes"> = {
      project_id: projectId,
      order_index: idx,
      heading: heading ?? "INT. UNTITLED - DAY",
      content: EMPTY_LEXICAL_STATE,
    };

    const { data } = await supabase
      .from("scenes")
      .insert(insertData)
      .select()
      .single();

    if (!data?.id) {
      console.error("Failed to create scene – no id returned");
      return null;
    }

    const newScene = data as Scene;
    setScenes((prev) => [...prev, newScene]);
    return newScene;
  };

  const updateScene = async (
    sceneId: string,
    updates: { heading?: string; content?: Json; status?: string },
  ) => {
    setScenes((prev) =>
      prev.map((s) => (s.id === sceneId ? { ...s, ...updates } : s)),
    );

    supabase
      .from("scenes")
      .update(updates)
      .eq("id", sceneId)
      .then(({ error }) => {
        if (error) {
          console.error("Failed to persist scene update:", error.message);
        }
      });
  };

  const deleteScene = async (sceneId: string) => {
    await supabase.from("scenes").delete().eq("id", sceneId);
    setScenes((prev) => prev.filter((s) => s.id !== sceneId));
  };

  const reorderScenes = async (orderedIds: string[]) => {
    const updates: { id: string; order_index: number }[] = orderedIds.map(
      (id, idx) => ({ id, order_index: idx }),
    );

    await Promise.all(
      updates.map((u) =>
        supabase
          .from("scenes")
          .update({ order_index: u.order_index } as TablesUpdate<"scenes">)
          .eq("id", u.id),
      ),
    );

    setScenes((prev) => {
      const map = new Map(prev.map((s) => [s.id, s]));
      return orderedIds.map((id, idx) => ({
        ...map.get(id)!,
        order_index: idx,
      }));
    });
  };

  return {
    scenes,
    loading,
    createScene,
    updateScene,
    deleteScene,
    reorderScenes,
    refetch: fetchScenes,
  };
}
