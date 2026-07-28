// app/page.tsx
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { SVGProps } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Check, KeyRound, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/landing/site-header";
import { ScriptMock } from "@/components/landing/script-mock";
import { CapabilitiesTabs } from "@/components/landing/capabilities-tabs";

function GithubMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 .5C5.73.5.5 5.73.5 12a11.5 11.5 0 0 0 7.86 10.93c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.54-3.88-1.54-.52-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a10.98 10.98 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.77.11 3.06.74.8 1.19 1.83 1.19 3.09 0 4.43-2.7 5.4-5.27 5.69.42.36.78 1.07.78 2.16v3.2c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
    </svg>
  );
}

const PRIVACY_POINTS = [
  {
    icon: KeyRound,
    text: "Magic-link sign in, so there's no password to create, remember, or leak.",
  },
  {
    icon: ShieldCheck,
    text: "Every route checks project ownership — your scripts are only ever visible to you.",
  },
  {
    icon: Check,
    text: "We store your email and your work, and nothing else. No advertising, no profiling, no analytics.",
  },
  {
    icon: Check,
    text: "Scripts, notes, and AI conversations are never shared with third parties. Request deletion any time.",
  },
];

export default async function Home() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) redirect("/projects");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader
        action={
          <Link
            href="/login"
            className="inline-flex h-9 items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
          >
            Sign in
          </Link>
        }
      />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,hsl(var(--primary)/0.14),transparent)]"
        />
        <div className="mx-auto grid max-w-5xl gap-12 px-4 pb-20 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pt-24">
          <div className="text-center lg:text-left">
            <Badge variant="secondary" className="mb-5 font-normal">
              Built for the IBM AI Builders Challenge 2026
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              From <span className="font-mono text-primary">FADE IN:</span> to{" "}
              <span className="font-mono text-primary">FADE OUT:</span>
              <br className="hidden sm:block" /> with a writing partner who
              never sleeps.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground lg:mx-0">
              ScriptForge is the AI-powered screenwriting studio that helps you
              brainstorm, format, and polish scripts, so you can spend less time
              fighting the page and more time telling the story.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
              <Link
                href="/login"
                className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90"
              >
                Get started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#features"
                className="inline-flex h-11 items-center rounded-md px-8 py-3 text-sm font-semibold hover:bg-accent hover:text-accent-foreground"
              >
                See what&apos;s inside
              </Link>
            </div>
          </div>

          <ScriptMock />
        </div>
      </section>

      <Separator />

      {/* Capabilities */}
      <section id="features" className="mx-auto max-w-5xl px-4 py-20">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Everything a script needs before table read
          </h2>
          <p className="mt-3 text-muted-foreground">
            One editor, six ways it has your back — from the first blank page to
            the export you send out.
          </p>
        </div>
        <CapabilitiesTabs />
      </section>

      <Separator />

      {/* Privacy & security */}
      <section className="mx-auto max-w-3xl px-4 py-20">
        <div className="rounded-xl border bg-card p-8">
          <h2 className="text-xl font-semibold">Your data &amp; privacy</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Nothing to remember, nothing extra collected.
          </p>
          <ul className="mt-6 space-y-4">
            {PRIVACY_POINTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex gap-3 text-sm">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="text-muted-foreground">{text}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex gap-6 text-sm">
            <Link
              href="/privacy"
              className="text-primary underline underline-offset-4 hover:text-primary/80"
            >
              Privacy policy
            </Link>
            <Link
              href="/terms"
              className="text-primary underline underline-offset-4 hover:text-primary/80"
            >
              Terms of service
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <p>ScriptForge &middot; IBM AI Builders Challenge 2026</p>
          <Link
            href="https://github.com/elvinny-is-coding/scriptforge"
            className="flex items-center gap-1.5 underline underline-offset-4 hover:text-foreground"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GithubMark className="h-3.5 w-3.5" />
            GitHub
          </Link>
        </div>
      </footer>
    </div>
  );
}
