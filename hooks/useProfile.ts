// hooks/useProfile.ts
"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/supabase";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle(); // ← returns null when no row exists, no error
    setProfile(data ?? null);
    setLoading(false);
  }, [userId, supabase]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(
    async (
      updates: Partial<Pick<Profile, "display_name" | "bio" | "avatar_url">>,
    ) => {
      if (!userId) return;
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: userId,
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (!error) await fetchProfile();
    },
    [userId, supabase, fetchProfile],
  );

  return { profile, loading, updateProfile, refetch: fetchProfile };
}
