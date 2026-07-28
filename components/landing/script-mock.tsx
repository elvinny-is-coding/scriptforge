// components/landing/script-mock.tsx
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function ScriptMock({ className }: { className?: string }) {
  return (
    <div className={cn("relative mx-auto w-full max-w-sm", className)}>
      <div className="-rotate-[1.5deg] rounded-lg border bg-card p-6 shadow-sm transition-transform hover:rotate-0">
        <p className="font-mono text-[13px] leading-relaxed">
          <span className="block font-semibold tracking-wide">
            INT. COFFEE SHOP &ndash; DAY
          </span>
          <span className="mt-3 block text-muted-foreground">
            SARAH sits alone, staring at a blinking cursor.
          </span>
          <span className="mt-4 block text-center font-semibold">SARAH</span>
          <span className="block text-center text-muted-foreground">
            (to herself)
          </span>
          <span className="block text-center">
            Just one good scene. That&apos;s all I need.
          </span>
        </p>
      </div>
      <div className="absolute -bottom-18 -right-10 w-56 rotate-2 rounded-lg border bg-popover p-3 text-xs shadow-md sm:-right-8">
        <div className="mb-1 flex items-center gap-1.5 font-medium text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          AI suggestion
        </div>
        <p className="text-muted-foreground">
          Cut to the barista noticing &mdash; give Sarah a reason to look up.
        </p>
      </div>
    </div>
  );
}
