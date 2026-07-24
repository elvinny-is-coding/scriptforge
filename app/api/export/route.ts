// app/api/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { projectId } = await req.json();

  if (!projectId) {
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
  }

  // Verify user owns project
  const { data: project } = await supabase
    .from("projects")
    .select("id, user_id")
    .eq("id", projectId)
    .single();

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Fetch scenes ordered by order_index
  const { data: scenesData, error } = await supabase
    .from("scenes")
    .select("*")
    .eq("project_id", projectId)
    .order("order_index");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const scenes = (scenesData ??
    []) as Database["public"]["Tables"]["scenes"]["Row"][];

  // Convert each scene to Fountain
  let fountain = "";
  for (const scene of scenes) {
    const heading = scene.heading?.trim() || "";
    fountain += heading + "\n";

    const content = scene.content as any;
    if (content?.root?.children) {
      for (const child of content.root.children) {
        const nodeType = child.type;
        const text = child.children?.map((c: any) => c.text).join("") || "";

        if (nodeType === "scene-heading") {
          // Already added heading
        } else if (nodeType === "action") {
          fountain += text + "\n";
        } else if (nodeType === "character") {
          fountain += "\n" + text.toUpperCase() + "\n";
        } else if (nodeType === "dialogue") {
          fountain += text + "\n";
        } else if (nodeType === "parenthetical") {
          fountain += "(" + text + ")\n";
        } else if (nodeType === "transition") {
          fountain += "\n" + text.toUpperCase() + "\n";
        }
      }
    }
    fountain += "\n\n";
  }

  return new NextResponse(fountain.trim(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${projectId}.fountain"`,
    },
  });
}
