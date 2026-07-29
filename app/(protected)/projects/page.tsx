"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { NewProjectDialog } from "@/components/projects/NewProjectDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Database, Json, TablesInsert } from "@/types/supabase";

type Project = Database["public"]["Tables"]["projects"]["Row"];

type ProjectWithMeta = Project & {
  sceneCount: number;
  wordCount: number;
};

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

function countWordsInLexicalJSON(content: Json): number {
  const obj = content as any;
  if (!obj?.root?.children) return 0;
  let total = 0;
  for (const child of obj.root.children) {
    if (child.type === "outline") continue;
    const text = child.children?.map((c: any) => c.text).join(" ") || "";
    if (text.trim()) total += text.split(/\s+/).length;
  }
  return total;
}

type SortOption =
  | "updated"
  | "title-asc"
  | "title-desc"
  | "words-desc"
  | "scenes-desc";

const GENRES = [
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Fantasy",
  "Film Noir",
  "Horror",
  "Musical",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Thriller",
  "War",
  "Western",
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState<SortOption>("updated");
  const [searchQuery, setSearchQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState<string>("all");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchProjects = async () => {
      const { data: projectList } = await supabase
        .from("projects")
        .select("*")
        .is("deleted_at", null) // ← only active projects
        .order("updated_at", { ascending: false });

      if (!projectList) {
        setProjects([]);
        setLoading(false);
        return;
      }

      const projectIds = projectList.map((p) => p.id);
      const { data: allScenes } = await supabase
        .from("scenes")
        .select("project_id, content")
        .in("project_id", projectIds)
        .is("deleted_at", null); // ← only active scenes

      const sceneCountMap: Record<string, number> = {};
      const wordCountMap: Record<string, number> = {};

      if (allScenes) {
        for (const scene of allScenes) {
          sceneCountMap[scene.project_id] =
            (sceneCountMap[scene.project_id] || 0) + 1;
          wordCountMap[scene.project_id] =
            (wordCountMap[scene.project_id] || 0) +
            countWordsInLexicalJSON(scene.content as Json);
        }
      }

      const enriched = projectList.map((p) => ({
        ...p,
        sceneCount: sceneCountMap[p.id] || 0,
        wordCount: wordCountMap[p.id] || 0,
      }));

      setProjects(enriched);
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

  const handleRename = async (id: string, newTitle: string) => {
    const { error } = await supabase
      .from("projects")
      .update({ title: newTitle })
      .eq("id", id);

    if (error) {
      toast.error("Failed to rename project");
      return;
    }

    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, title: newTitle } : p)),
    );
    toast.success("Project renamed");
  };

  // Soft‑delete a project
  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("projects")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete project");
      return;
    }

    setProjects((prev) => prev.filter((p) => p.id !== id));
    toast.success("Project moved to trash");
  };

  // Filter and sort
  const processedProjects = useMemo(() => {
    let filtered = projects;

    // search by title
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((p) => p.title.toLowerCase().includes(query));
    }

    // filter by genre
    if (genreFilter !== "all") {
      filtered = filtered.filter((p) => p.genre === genreFilter);
    }

    const sorted = [...filtered];
    switch (sortOption) {
      case "updated":
        sorted.sort(
          (a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
        );
        break;
      case "title-asc":
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title-desc":
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "words-desc":
        sorted.sort((a, b) => b.wordCount - a.wordCount);
        break;
      case "scenes-desc":
        sorted.sort((a, b) => b.sceneCount - a.sceneCount);
        break;
    }
    return sorted;
  }, [projects, sortOption, searchQuery, genreFilter]);

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
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/trash")}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Trash
          </Button>
          <NewProjectDialog onCreate={handleCreate} />
        </div>
      </div>

      {projects.length > 0 && (
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-10"
            />
          </div>

          <Select value={genreFilter} onValueChange={setGenreFilter}>
            <SelectTrigger className="w-[150px] h-10">
              <SelectValue placeholder="Genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genres</SelectItem>
              {GENRES.map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={sortOption}
            onValueChange={(v) => setSortOption(v as SortOption)}
          >
            <SelectTrigger className="w-[180px] h-10">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated">Last Updated</SelectItem>
              <SelectItem value="title-asc">Title A–Z</SelectItem>
              <SelectItem value="title-desc">Title Z–A</SelectItem>
              <SelectItem value="words-desc">Most Words</SelectItem>
              <SelectItem value="scenes-desc">Most Scenes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {processedProjects.length === 0 ? (
        <EmptyState
          title={searchQuery ? "No matching projects" : "No projects yet"}
          description={
            searchQuery
              ? "Try a different search term"
              : "Create your first screenplay"
          }
          action={
            searchQuery ? undefined : (
              <NewProjectDialog onCreate={handleCreate} />
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {processedProjects.map((p) => (
            <ProjectCard
              key={p.id}
              id={p.id}
              title={p.title}
              updatedAt={p.updated_at}
              sceneCount={p.sceneCount}
              wordCount={p.wordCount}
              genre={p.genre}
              tags={p.tags as string[]}
              onRename={handleRename}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
