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

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero section */}
      <div className="flex flex-col items-center justify-center px-4 pt-20 pb-12 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight mb-4">
          ScriptForge
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mb-8">
          The AI‑powered screenwriting studio that helps writers brainstorm,
          format, and polish their scripts — built for the IBM AI Builders
          Challenge.
        </p>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-8 py-3 text-sm font-semibold hover:bg-primary/90"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg border border-input bg-background px-8 py-3 text-sm font-semibold hover:bg-accent hover:text-accent-foreground"
          >
            Sign in with Google
          </Link>
        </div>
      </div>

      {/* Features grid */}
      <div className="max-w-5xl mx-auto px-4 pb-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border bg-card p-6">
            <h3 className="text-lg font-semibold mb-2">Screenplay Editor</h3>
            <p className="text-sm text-muted-foreground">
              Write with industry‑standard formatting. Auto‑complete for
              characters and scene headings keeps you in flow. Full keyboard
              shortcuts and a distraction‑free focus mode.
            </p>
          </div>
          <div className="rounded-xl border bg-card p-6">
            <h3 className="text-lg font-semibold mb-2">AI Brainstorming</h3>
            <p className="text-sm text-muted-foreground">
              Chat with an AI writing partner that understands your script. Ask
              for next beats, dialogue alternatives, or story ideas — and insert
              suggestions directly into your draft.
            </p>
          </div>
          <div className="rounded-xl border bg-card p-6">
            <h3 className="text-lg font-semibold mb-2">Script Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Run the Narrative Doctor to find plot holes, timeline issues, and
              character arc gaps. Improve your grammar, tone, pacing, and
              consistency with specialised AI agents.
            </p>
          </div>
          <div className="rounded-xl border bg-card p-6">
            <h3 className="text-lg font-semibold mb-2">Character Tools</h3>
            <p className="text-sm text-muted-foreground">
              Assign a colour to each character and instantly see who is
              speaking. Filter scenes by character and read all of a character’s
              dialogue in sequence to check voice consistency.
            </p>
          </div>
          <div className="rounded-xl border bg-card p-6">
            <h3 className="text-lg font-semibold mb-2">Visual Mood Board</h3>
            <p className="text-sm text-muted-foreground">
              Right‑click any scene description to generate concept art. A mood
              board collects your visual inspiration alongside the script.
            </p>
          </div>
          <div className="rounded-xl border bg-card p-6">
            <h3 className="text-lg font-semibold mb-2">Export & Share</h3>
            <p className="text-sm text-muted-foreground">
              Download your screenplay as Fountain, plain text, or a formatted
              PDF with a title page and page numbers.
            </p>
          </div>
        </div>
      </div>

      {/* Privacy & data usage */}
      <div className="max-w-3xl mx-auto px-4 pb-16 text-sm text-muted-foreground">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Your Data &amp; Privacy
        </h2>
        <p className="mb-3">
          ScriptForge uses Google Sign‑In <strong>only</strong> to authenticate
          you — we request your name and email address so you can create an
          account and save your work. We do not read, store, or share any other
          Google data. No personal information is used for advertising,
          profiling, or analytics.
        </p>
        <p className="mb-3">
          All the content you create (scripts, notes, AI conversations) is
          stored securely in your account and is never shared with third
          parties. You can request deletion of your data at any time.
        </p>
        <p className="flex gap-6">
          <Link
            href="/privacy"
            className="text-primary underline underline-offset-4 hover:text-primary/80"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="text-primary underline underline-offset-4 hover:text-primary/80"
          >
            Terms of Service
          </Link>
        </p>
      </div>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        <p>
          ScriptForge &middot; IBM AI Builders Challenge 2026 &middot;{" "}
          <Link
            href="https://github.com/elvinny-is-coding/scriptforge"
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </Link>
        </p>
      </footer>
    </div>
  );
}
