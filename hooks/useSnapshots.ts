"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database, Json, TablesInsert } from "@/types/supabase";

type Snapshot = Database["public"]["Tables"]["snapshots"]["Row"];

export function useSnapshots(sceneId: string | undefined) {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchSnapshots = useCallback(async () => {
    if (!sceneId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("snapshots")
      .select("*")
      .eq("scene_id", sceneId)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Failed to fetch snapshots:", error.message);
    }
    setSnapshots(data ?? []);
    setLoading(false);
  }, [sceneId]);

  useEffect(() => {
    fetchSnapshots();
  }, [fetchSnapshots]);

  const createSnapshot = async (content: Json) => {
    if (!sceneId) return { success: false, error: "No scene selected" };

    const insertData: TablesInsert<"snapshots"> = {
      scene_id: sceneId,
      content,
    };

    const { data, error } = await supabase
      .from("snapshots")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("Failed to create snapshot:", error.message);
      return { success: false, error: error.message };
    }

    if (data) {
      setSnapshots((prev) => [data as Snapshot, ...prev]);
    }
    return { success: true, error: null };
  };

  const deleteSnapshot = async (id: string) => {
    await supabase.from("snapshots").delete().eq("id", id);
    setSnapshots((prev) => prev.filter((s) => s.id !== id));
  };

  return {
    snapshots,
    loading,
    createSnapshot,
    deleteSnapshot,
    refetch: fetchSnapshots,
  };
}
