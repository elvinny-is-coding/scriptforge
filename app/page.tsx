// app/page.tsx
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) redirect("/projects");

  // Unauthenticated — show landing page
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-bold mb-4">ScriptForge</h1>
      <p className="text-lg text-muted-foreground max-w-xl mb-6">
        An AI‑powered screenwriting studio that helps you brainstorm, format,
        and polish your scripts — built for the IBM AI Builders Challenge.
      </p>
      <div className="flex gap-4 mb-8">
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-6 py-2 text-sm font-medium hover:bg-primary/90"
        >
          Get Started
        </Link>
      </div>
      <footer className="text-xs text-muted-foreground flex gap-4">
        <Link href="/privacy" className="hover:underline">
          Privacy Policy
        </Link>
        <Link href="/terms" className="hover:underline">
          Terms of Service
        </Link>
      </footer>
    </div>
  );
}
