"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { Kbd } from "@/components/ui/kbd";
import { Button } from "@/components/ui/button";
import { DuoIcon } from "@/components/ui/duo-icon";

export function QuickActionsCommand() {
  const [open, setOpen] = useState(false);
  const [isMac] = useState(() => {
    if (typeof window === "undefined") return false;
    return /Mac/i.test(navigator.platform || navigator.userAgent || "");
  });
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();

  // Global keydown listeners for Ctrl+K / Cmd+K and 'c' for quick add
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);

      // Open command dialog on Cmd+K / Ctrl+K
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setOpen((prev) => !prev);
        return;
      }

      // Quick add shortcut 'c' or 'C' when not typing in an input
      if (!isInput && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (e.key === "c" || e.key === "C") {
          e.preventDefault();
          router.push("/content/new");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  const runAction = (callback: () => void) => {
    setOpen(false);
    callback();
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Command Search Trigger Button */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group relative flex h-9 w-48 sm:w-60 md:w-68 items-center justify-between rounded-lg border border-border/70 bg-muted/40 px-3 text-sm text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-all cursor-pointer shadow-2xs"
          title="Search or quick actions (Ctrl+K)"
        >
          <div className="flex items-center gap-2.5 truncate">
            <DuoIcon
              name="compass"
              className="size-4.5 shrink-0 text-neutral-500 group-hover:text-foreground transition-colors"
            />
            <span className="truncate text-sm font-medium text-foreground/80 group-hover:text-foreground">
              Quick actions...
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Kbd className="h-5 px-1.5 text-[11px] font-mono border border-border/60">
              {isMac ? "⌘" : "Ctrl"}
            </Kbd>
            <Kbd className="h-5 px-1.5 text-[11px] font-mono border border-border/60">
              K
            </Kbd>
          </div>
        </button>

        {/* Quick Add Button with Kbd shortcut */}
        <Button
          type="button"
          size="sm"
          onClick={() => router.push("/content/new")}
          className="h-9 gap-1.5 px-3 text-xs sm:text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xs cursor-pointer"
          title="Add new content source (Press 'C')"
        >
          <DuoIcon name="add_circle" className="size-4 shrink-0" />
          <span className="hidden sm:inline">Add Content</span>
          <span className="sm:hidden">Add</span>
          <Kbd className="hidden md:inline-flex h-4.5 px-1.5 text-[10px] font-mono bg-primary-foreground/15 text-primary-foreground border-transparent ml-0.5">
            C
          </Kbd>
        </Button>
      </div>

      {/* Command Palette Dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search actions..." />
        <CommandList className="max-h-80">
          <CommandEmpty>No results found.</CommandEmpty>

          {/* Quick Actions Group */}
          <CommandGroup
            heading="Quick Actions"
            className="[&_[cmdk-group-heading]]:text-sm [&_[cmdk-group-heading]]:font-semibold"
          >
            <CommandItem
              onSelect={() => runAction(() => router.push("/content/new"))}
              className="cursor-pointer"
            >
              <DuoIcon
                name="add_circle"
                className="size-4 shrink-0 text-primary"
              />
              <span>Add New Content</span>
              <span className="ml-auto">
                <Kbd className="text-[10px] font-mono">C</Kbd>
              </span>
            </CommandItem>

            <CommandItem
              onSelect={() =>
                runAction(() =>
                  setTheme(resolvedTheme === "dark" ? "light" : "dark")
                )
              }
              className="cursor-pointer"
            >
              <div className="relative flex items-center justify-center size-4 shrink-0">
                <DuoIcon
                  name="sun"
                  className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500"
                />
                <DuoIcon
                  name="moon_stars"
                  className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400"
                />
              </div>
              <span>Toggle Dark / Light Mode</span>
              <span className="ml-auto">
                <Kbd className="text-[10px] font-mono">D</Kbd>
              </span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          {/* Navigation Group */}
          <CommandGroup heading="Navigation">
            <CommandItem
              onSelect={() => runAction(() => router.push("/dashboard"))}
              className="cursor-pointer"
            >
              <DuoIcon
                name="dashboard"
                className="size-4 shrink-0 text-[#3d3d3d] dark:text-neutral-300"
              />
              <span>Dashboard Overview</span>
            </CommandItem>

            <CommandItem
              onSelect={() => runAction(() => router.push("/content"))}
              className="cursor-pointer"
            >
              <DuoIcon
                name="file"
                className="size-4 shrink-0 text-[#3d3d3d] dark:text-neutral-300"
              />
              <span>Content Workspace</span>
            </CommandItem>

            <CommandItem
              onSelect={() => runAction(() => router.push("/plans"))}
              className="cursor-pointer"
            >
              <DuoIcon
                name="target"
                className="size-4 shrink-0 text-[#3d3d3d] dark:text-neutral-300"
              />
              <span>Distribution Plans</span>
            </CommandItem>


            <CommandItem
              onSelect={() => runAction(() => router.push("/settings/profile"))}
              className="cursor-pointer"
            >
              <DuoIcon
                name="settings"
                className="size-4 shrink-0 text-[#3d3d3d] dark:text-neutral-300"
              />
              <span>Settings & Profile</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
