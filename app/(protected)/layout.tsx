// app/(protected)/layout.tsx
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { UserMenu } from "@/components/layout/UserMenu";
import { ThemeToggleButton } from "@/components/layout/ThemeToggleButton";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-12 border-b flex items-center justify-between px-4">
        <span className="font-semibold">ScriptForge</span>
        <div className="flex items-center gap-2">
          <ThemeToggleButton />
          <UserMenu />
        </div>
      </header>
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
