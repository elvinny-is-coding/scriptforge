// app/api/share/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// POST — create a new share link for a project
export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await req.json();
  if (!projectId) {
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
  }

  // Verify project ownership
  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", session.user.id)
    .single();

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Create a new share token
  const { data, error } = await supabase
    .from("shared_links")
    .insert({ project_id: projectId })
    .select("id, token, created_at")
    .single();

  if (error) {
    console.error("Failed to create share link:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ link: data });
}

// DELETE — revoke a share link
export async function DELETE(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  // Ensure the caller owns the project associated with this token
  const { data: existing } = await supabase
    .from("shared_links")
    .select("project_id, projects!inner(user_id)")
    .eq("token", token)
    .single();

  if (!existing || (existing as any).projects?.user_id !== session.user.id) {
    return NextResponse.json(
      { error: "Link not found or unauthorized" },
      { status: 404 },
    );
  }

  const { error } = await supabase
    .from("shared_links")
    .delete()
    .eq("token", token);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return new Response(null, { status: 204 });
}
