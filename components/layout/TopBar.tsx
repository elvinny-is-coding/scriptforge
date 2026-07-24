// components/layout/TopBar.tsx
interface TopBarProps {
  title: string;
  children?: React.ReactNode;
}

export function TopBar({ title, children }: TopBarProps) {
  return (
    <div className="flex items-center h-full px-4 justify-between">
      <h1 className="font-semibold truncate">{title}</h1>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}
