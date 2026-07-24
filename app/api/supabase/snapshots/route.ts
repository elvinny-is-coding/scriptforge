// app/api/supabase/snapshots/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { TablesInsert } from "@/types/supabase";

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { scene_id, content } = await req.json();

  if (!scene_id || !content) {
    return NextResponse.json(
      { error: "Missing scene_id or content" },
      { status: 400 },
    );
  }

  const insertData: TablesInsert<"snapshots"> = {
    scene_id,
    content,
  };

  const { data, error } = await supabase
    .from("snapshots")
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
  const { error } = await supabase.from("snapshots").delete().eq("id", id);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return new Response(null, { status: 204 });
}
