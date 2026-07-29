// app/api/share/[token]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const adminClient = createAdminClient();

  // 1. Validate token
  const { data: link, error: linkError } = await adminClient
    .from("shared_links")
    .select("project_id")
    .eq("token", token)
    .single();

  if (linkError || !link) {
    return NextResponse.json(
      { error: "Invalid or expired link" },
      { status: 404 },
    );
  }

  // 2. Fetch project (title and owner)
  const { data: project, error: projectError } = await adminClient
    .from("projects")
    .select("title, user_id")
    .eq("id", link.project_id)
    .single();

  if (projectError || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // 3. Fetch author's profile
  let authorName = "Anonymous";
  if (project.user_id) {
    const { data: profile } = await adminClient
      .from("profiles")
      .select("display_name")
      .eq("id", project.user_id)
      .single();
    if (profile?.display_name) {
      authorName = profile.display_name;
    }
  }

  // 4. Fetch scenes ordered
  const { data: scenes, error: scenesError } = await adminClient
    .from("scenes")
    .select("*")
    .eq("project_id", link.project_id)
    .order("order_index");

  if (scenesError) {
    return NextResponse.json(
      { error: "Failed to fetch scenes" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    title: project.title,
    author: authorName,
    scenes: scenes ?? [],
  });
}
