// components/layout/ThemeToggleButton.tsx
"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Contrast } from "lucide-react";

export function ThemeToggleButton() {
  const { theme, cycleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      title={`Theme: ${theme}`}
    >
      {theme === "dark" && <Moon className="h-4 w-4" />}
      {theme === "light" && <Sun className="h-4 w-4" />}
      {theme === "high-contrast" && <Contrast className="h-4 w-4" />}
    </Button>
  );
}
