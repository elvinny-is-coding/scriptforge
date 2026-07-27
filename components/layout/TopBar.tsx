// components/layout/TopBar.tsx
import type { ReactNode } from "react";

interface TopBarProps {
  title: string;
  children?: ReactNode;
  leftContent?: ReactNode; // <-- new
}

export function TopBar({ title, children, leftContent }: TopBarProps) {
  return (
    <div className="flex items-center h-full px-4 justify-between">
      <div className="flex items-center gap-3">
        {leftContent}
        <h1 className="font-semibold truncate">{title}</h1>
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}
