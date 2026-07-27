// hooks/useScenes.ts
"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
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

    // Get the maximum order_index for this project to avoid duplicates
    const { data: maxData } = await supabase
      .from("scenes")
      .select("order_index")
      .eq("project_id", projectId)
      .order("order_index", { ascending: false })
      .limit(1)
      .single();

    const nextIndex = (maxData?.order_index ?? -1) + 1;

    const insertData: TablesInsert<"scenes"> = {
      project_id: projectId,
      order_index: nextIndex,
      heading: heading ?? "INT. UNTITLED - DAY",
      content: EMPTY_LEXICAL_STATE,
    };

    const { data, error } = await supabase
      .from("scenes")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error.message, error.details);
      return null;
    }

    if (!data) {
      console.error("No data returned from scene insert");
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

    const { error } = await supabase
      .from("scenes")
      .update(updates)
      .eq("id", sceneId);

    if (error) {
      console.error("Failed to persist scene update:", error.message);
    }
  };

  const deleteScene = async (sceneId: string) => {
    const { error } = await supabase.from("scenes").delete().eq("id", sceneId);
    if (error) console.error("Failed to delete scene:", error.message);
    else setScenes((prev) => prev.filter((s) => s.id !== sceneId));
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

  const characters = useMemo(() => {
    const names = new Set<string>();
    scenes.forEach((scene) => {
      const content = scene.content as any;
      content?.root?.children?.forEach((child: any) => {
        if (child.type === "character") {
          const name = child.children?.[0]?.text?.trim();
          if (name) names.add(name.toUpperCase());
        }
      });
    });
    return Array.from(names).sort();
  }, [scenes]);

  const locations = useMemo(() => {
    const locs = new Set<string>();
    scenes.forEach((scene) => {
      const heading = scene.heading?.trim();
      if (heading) {
        const match = heading.match(
          /^(INT\.|EXT\.|INT\.\/EXT\.|I\/E\.)\s+(.+?)(\s+-\s+.+)?$/i,
        );
        if (match && match[2]) {
          locs.add(match[2].trim().toUpperCase());
        } else {
          locs.add(heading.toUpperCase());
        }
      }
    });
    return Array.from(locs).sort();
  }, [scenes]);

  return {
    scenes,
    loading,
    createScene,
    updateScene,
    deleteScene,
    reorderScenes,
    refetch: fetchScenes,
    characters,
    locations,
  };
}
