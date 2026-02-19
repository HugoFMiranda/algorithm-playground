"use client";

import { useEffect, useState } from "react";
import { MoonStarIcon, SunIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

type Theme = "light" | "dark";

const THEME_KEY = "algorithm-playground-theme";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const isDark = theme === "dark";
  root.classList.toggle("dark", isDark);
  root.style.colorScheme = isDark ? "dark" : "light";
}

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(THEME_KEY);
    const validTheme = storedTheme === "dark" || storedTheme === "light";
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme: Theme = validTheme
      ? storedTheme
      : systemPrefersDark
        ? "dark"
        : "light";

    applyTheme(initialTheme);
    setTheme(initialTheme);
    setMounted(true);
  }, []);

  const handleToggle = () => {
    const nextTheme: Theme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    applyTheme(nextTheme);
    window.localStorage.setItem(THEME_KEY, nextTheme);
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className="rounded-full"
      aria-label="Toggle theme"
    >
      {mounted && theme === "dark" ? (
        <SunIcon className="size-4" />
      ) : (
        <MoonStarIcon className="size-4" />
      )}
    </Button>
  );
}
