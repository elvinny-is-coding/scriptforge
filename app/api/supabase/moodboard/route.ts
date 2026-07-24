// app/api/supabase/moodboard/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { TablesInsert } from "@/types/supabase";

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { project_id, url, refined_prompt, original_text } = await req.json();

  if (!project_id || !url) {
    return NextResponse.json(
      { error: "Missing project_id or url" },
      { status: 400 },
    );
  }

  const insertData: TablesInsert<"moodboard_images"> = {
    project_id,
    url,
    refined_prompt: refined_prompt ?? null,
    original_text: original_text ?? null,
  };

  const { data, error } = await supabase
    .from("moodboard_images")
    .insert(insertData)
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("moodboard_images")
    .delete()
    .eq("id", id);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return new Response(null, { status: 204 });
}
