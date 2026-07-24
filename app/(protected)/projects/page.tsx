"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { NewProjectDialog } from "@/components/projects/NewProjectDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import type { Database, Json, TablesInsert } from "@/types/supabase";

type Project = Database["public"]["Tables"]["projects"]["Row"];

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

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .order("updated_at", { ascending: false });
      setProjects(data ?? []);
      setLoading(false);
    };
    fetchProjects();
  }, [supabase]);

  const handleCreate = async (title: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("projects")
      .insert({
        title,
        user_id: user.id,
      } as TablesInsert<"projects">)
      .select()
      .single();

    if (data) {
      const project = data as Project;
      const sceneInsert: TablesInsert<"scenes"> = {
        project_id: project.id,
        order_index: 0,
        heading: "INT. UNTITLED - DAY",
        content: EMPTY_LEXICAL_STATE,
      };
      await supabase.from("scenes").insert(sceneInsert);
      router.push(`/project/${project.id}`);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Your Projects</h1>
        <NewProjectDialog onCreate={handleCreate} />
      </div>
      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create your first screenplay"
          action={<NewProjectDialog onCreate={handleCreate} />}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              id={p.id}
              title={p.title}
              updatedAt={p.updated_at}
            />
          ))}
        </div>
      )}
    </div>
  );
}
