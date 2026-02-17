"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-16 rounded-full bg-[rgba(216,222,233,0.5)]" />;
  }

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className={cn(
        "relative inline-flex h-9 w-16 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--nord8)] focus:ring-offset-2 cursor-pointer",
        theme === "light"
          ? "bg-[rgba(229,233,240,0.6)] border border-[rgba(216,222,233,0.8)]"
          : "bg-[var(--nord2)] border border-[var(--nord3)]",
      )}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
    >
      <span className="sr-only">Toggle theme</span>
      <div
        className={cn(
          "inline-flex h-7 w-7 items-center justify-center rounded-full shadow-lg transition-all duration-300",
          theme === "light"
            ? "translate-x-1 bg-white"
            : "translate-x-8 bg-[var(--nord3)]",
        )}
      >
        {theme === "light" ? (
          <Sun className="h-4 w-4 text-[var(--nord12)]" />
        ) : (
          <Moon className="h-4 w-4 text-[var(--nord8)]" />
        )}
      </div>
    </button>
  );
}
