// hooks/useProject.ts
"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (!projectId) return;
    const fetchProject = async () => {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();
      setProject(data);
      // Columns are now in generated types – cast to expected shapes
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
      setLoading(false);
    };
    fetchProject();
  }, [projectId]);

  const updateBrainstormMessages: React.Dispatch<
    React.SetStateAction<Record<string, ChatMessage[]>>
  > = (action) => {
    if (!projectId) return;
    setBrainstormMessages((prev) => {
      const messages = typeof action === "function" ? action(prev) : action;
      supabase
        .from("projects")
        .update({ brainstorm_messages: messages as Json })
        .eq("id", projectId);
      return messages;
    });
  };

  const updateImproveOutputs = (
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
        .eq("id", projectId);
      return outputs;
    });
  };

  const updateDoctorReport = (report: Json) => {
    if (!projectId) return;
    setDoctorReport(report);
    supabase
      .from("projects")
      .update({ doctor_report: report })
      .eq("id", projectId);
  };

  const resetBrainstormScene = (sceneId: string) => {
    if (!projectId) return;
    setBrainstormMessages((prev) => {
      const updated = { ...prev };
      delete updated[sceneId];
      supabase
        .from("projects")
        .update({ brainstorm_messages: updated as Json })
        .eq("id", projectId);
      return updated;
    });
  };

  const resetImproveScene = (sceneId: string) => {
    if (!projectId) return;
    setImproveOutputsByScene((prev) => {
      const updated = { ...prev };
      delete updated[sceneId];
      supabase
        .from("projects")
        .update({ improve_outputs: updated as Json })
        .eq("id", projectId);
      return updated;
    });
  };

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
  };
}
