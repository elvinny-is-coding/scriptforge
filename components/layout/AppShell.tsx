// components/layout/AppShell.tsx
"use client";

interface AppShellProps {
  leftPanel: React.ReactNode;
  centerPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  topBar: React.ReactNode;
}

export function AppShell({
  leftPanel,
  centerPanel,
  rightPanel,
  topBar,
}: AppShellProps) {
  return (
    <div className="h-[calc(100vh-3rem)] flex flex-col">
      <div className="h-12 border-b">{topBar}</div>
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel: scene list */}
        <div className="w-[15%] min-w-[12rem] border-r overflow-y-auto">
          {leftPanel}
        </div>
        {/* Center panel: editor */}
        <div className="flex-1 overflow-y-auto">{centerPanel}</div>
        {/* Right panel: AI/Mood/Snapshots */}
        <div className="w-[25%] min-w-[20rem] border-l overflow-y-auto">
          {rightPanel}
        </div>
      </div>
    </div>
  );
}
