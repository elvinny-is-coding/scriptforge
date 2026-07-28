// app/login/page.tsx
import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      {/* Quiet corner marks instead of the full site nav — this page has one job */}
      <div className="flex items-center justify-between px-6 py-5 text-xs text-muted-foreground sm:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to home
        </Link>
        <span className="font-mono">1.</span>
      </div>

      {/* Centered screenplay title page */}
      <div className="relative flex flex-1 items-center justify-center px-4 pb-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_50%_40%_at_50%_35%,hsl(var(--primary)/0.10),transparent)]"
        />
        <div className="w-full max-w-sm text-center">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
            Fade in:
          </p>
          <h1 className="mt-4 font-mono text-3xl font-bold uppercase tracking-[0.15em]">
            ScriptForge
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            An AI-assisted screenwriting studio
          </p>

          <div className="mt-10 rounded-lg border bg-card p-6 text-left shadow-sm sm:p-8">
            <AuthForm />
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            We&apos;ll send a magic link &mdash; no password needed.
          </p>

          <div className="mt-8 flex justify-center gap-4 text-xs text-muted-foreground">
            <Link href="/privacy" className="hover:underline">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:underline">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
