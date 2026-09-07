"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { DuoIcon } from "@/components/ui/duo-icon";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [mounted, setMounted] = React.useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      title="Toggle theme"
      className="cursor-pointer relative"
    >
      <div className="relative flex items-center justify-center size-5 shrink-0">
        <DuoIcon 
          name="sun" 
          className={`size-4.5 rotate-0 scale-100 transition-all text-amber-500 ${
            mounted ? "dark:-rotate-90 dark:scale-0" : ""
          }`} 
        />
        <DuoIcon 
          name="moon_stars" 
          className={`absolute size-4.5 rotate-90 scale-0 transition-all text-blue-400 ${
            mounted ? "dark:rotate-0 dark:scale-100" : ""
          }`} 
        />
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

