"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Monitor, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ModeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="space-x-1 rounded-full border bg-transparent p-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme("system")}
        className={cn(
          "size-7 rounded-full",
          theme === "system"
            ? "cursor-default bg-muted"
            : "text-muted-foreground hover:bg-background hover:text-foreground",
        )}
      >
        <Monitor className="size-4" />
        <span className="sr-only">System mode</span>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme("light")}
        className={cn(
          "size-7 rounded-full",
          theme === "light"
            ? "cursor-default bg-muted"
            : "text-muted-foreground hover:bg-background hover:text-foreground",
        )}
      >
        <SunIcon className="size-4" />
        <span className="sr-only">Light mode</span>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme("dark")}
        className={cn(
          "size-7 rounded-full",
          theme === "dark"
            ? "cursor-default bg-muted"
            : "text-muted-foreground hover:bg-background hover:text-foreground",
        )}
      >
        <MoonIcon className="size-4" />
        <span className="sr-only">Dark mode</span>
      </Button>
    </div>
  );
}
