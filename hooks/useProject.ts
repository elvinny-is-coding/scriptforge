// hooks/useProject.ts
"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database, Json, TablesUpdate } from "@/types/supabase";

type Project = Database["public"]["Tables"]["projects"]["Row"];
type ChatMessage = { role: "user" | "assistant"; content: string };

export function useProject(projectId: string | undefined) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const [brainstormMessages, setBrainstormMessages] = useState<
    Record<string, ChatMessage[]>
  >({});
  const [improveOutputsByScene, setImproveOutputsByScene] = useState<
    Record<string, { agent: string; output: string }>
  >({});
  const [doctorReport, setDoctorReport] = useState<Json | null>(null);
  const [characterColors, setCharacterColors] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    if (!projectId) return;
    const fetchProject = async () => {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();
      setProject(data);
      setBrainstormMessages(
        (data?.brainstorm_messages as Record<string, ChatMessage[]>) ?? {},
      );
      setImproveOutputsByScene(
        (data?.improve_outputs as Record<
          string,
          { agent: string; output: string }
        >) ?? {},
      );
      setDoctorReport(data?.doctor_report ?? null);
      setCharacterColors(
        (data?.character_colors as Record<string, string>) ?? {},
      );
      setLoading(false);
    };
    fetchProject();
  }, [projectId]);

  const updateBrainstormMessages: React.Dispatch<
    React.SetStateAction<Record<string, ChatMessage[]>>
  > = useCallback(
    (action) => {
      if (!projectId) return;
      setBrainstormMessages((prev) => {
        const messages = typeof action === "function" ? action(prev) : action;
        supabase
          .from("projects")
          .update({ brainstorm_messages: messages as Json })
          .eq("id", projectId)
          .then(({ error }) => {
            if (error)
              console.error(
                "Failed to persist brainstorm messages:",
                error.message,
              );
          });
        return messages;
      });
    },
    [projectId],
  );

  const updateImproveOutputs = useCallback(
    (
      action:
        | Record<string, { agent: string; output: string }>
        | ((
            prev: Record<string, { agent: string; output: string }>,
          ) => Record<string, { agent: string; output: string }>),
    ) => {
      if (!projectId) return;
      setImproveOutputsByScene((prev) => {
        const outputs = typeof action === "function" ? action(prev) : action;
        supabase
          .from("projects")
          .update({ improve_outputs: outputs as Json })
          .eq("id", projectId)
          .then(({ error }) => {
            if (error)
              console.error(
                "Failed to persist improve outputs:",
                error.message,
              );
          });
        return outputs;
      });
    },
    [projectId],
  );

  const updateDoctorReport = useCallback(
    (report: Json) => {
      if (!projectId) return;
      setDoctorReport(report);
      supabase
        .from("projects")
        .update({ doctor_report: report })
        .eq("id", projectId)
        .then(({ error }) => {
          if (error)
            console.error("Failed to persist doctor report:", error.message);
        });
    },
    [projectId],
  );

  const resetBrainstormScene = useCallback(
    (sceneId: string) => {
      if (!projectId) return;
      setBrainstormMessages((prev) => {
        const updated = { ...prev };
        delete updated[sceneId];
        supabase
          .from("projects")
          .update({ brainstorm_messages: updated as Json })
          .eq("id", projectId)
          .then(({ error }) => {
            if (error)
              console.error("Failed to reset brainstorm scene:", error.message);
          });
        return updated;
      });
    },
    [projectId],
  );

  const resetImproveScene = useCallback(
    (sceneId: string) => {
      if (!projectId) return;
      setImproveOutputsByScene((prev) => {
        const updated = { ...prev };
        delete updated[sceneId];
        supabase
          .from("projects")
          .update({ improve_outputs: updated as Json })
          .eq("id", projectId)
          .then(({ error }) => {
            if (error)
              console.error("Failed to reset improve scene:", error.message);
          });
        return updated;
      });
    },
    [projectId],
  );

  const updateCharacterColors = useCallback(
    (colors: Record<string, string>) => {
      if (!projectId) return;
      setCharacterColors(colors);
      supabase
        .from("projects")
        .update({ character_colors: colors as Json })
        .eq("id", projectId)
        .then(({ error }) => {
          if (error)
            console.error("Failed to persist character colors:", error.message);
        });
    },
    [projectId],
  );

  const updateProject = async (updates: {
    title?: string;
    style_sheet?: any;
  }) => {
    if (!projectId) return;
    const { data, error } = await supabase
      .from("projects")
      .update(updates as TablesUpdate<"projects">)
      .eq("id", projectId)
      .select()
      .single();

    if (error) {
      console.error("Error updating project:", error.message);
      return null;
    }
    if (data) setProject(data);
    return data;
  };

  return {
    project,
    loading,
    updateProject,
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
  };
}
