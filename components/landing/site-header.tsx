// components/landing/site-header.tsx
import Link from "next/link";
import type { ReactNode } from "react";

export function SiteHeader({ action }: { action: ReactNode }) {
  return (
    <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary font-mono text-sm text-primary-foreground">
            S
          </span>
          ScriptForge
        </Link>
        {action}
      </div>
    </header>
  );
}
