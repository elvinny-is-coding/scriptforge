// contexts/ThemeContext.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

export type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  setTheme: () => {},
  cycleTheme: () => {},
});

const THEMES: Theme[] = ["dark", "light"];

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("scriptforge-theme") as Theme | null;
      if (stored && THEMES.includes(stored)) {
        setThemeState(stored);
      }
    } catch {
      // localStorage not available
    }
  }, []);

  // Apply class to <html> and persist
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    try {
      localStorage.setItem("scriptforge-theme", theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
  }, []);

  const cycleTheme = useCallback(() => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
