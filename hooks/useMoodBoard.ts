// hooks/useMoodBoard.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database, TablesInsert } from "@/types/supabase";

type MoodboardImage = Database["public"]["Tables"]["moodboard_images"]["Row"];

export function useMoodBoard(projectId: string | undefined) {
  const [images, setImages] = useState<MoodboardImage[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchImages = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    const { data } = await supabase
      .from("moodboard_images")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });
    setImages(data ?? []);
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchImages();
  }, [fetchImages]);

  const addImage = async (
    url: string,
    refinedPrompt?: string,
    originalText?: string,
  ) => {
    if (!projectId) return;

    const insertData: TablesInsert<"moodboard_images"> = {
      project_id: projectId,
      url,
      refined_prompt: refinedPrompt ?? null,
      original_text: originalText ?? null,
    };

    const { data } = await supabase
      .from("moodboard_images")
      .insert(insertData)
      .select()
      .single();

    if (data) setImages((prev) => [data as MoodboardImage, ...prev]);
    return data as MoodboardImage | null;
  };

  const deleteImage = async (id: string) => {
    await supabase.from("moodboard_images").delete().eq("id", id);
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  return { images, loading, addImage, deleteImage, refetch: fetchImages };
}
