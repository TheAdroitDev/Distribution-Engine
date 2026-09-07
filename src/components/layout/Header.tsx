"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { QuickActionsCommand } from "./QuickActionsCommand";

export function Header() {
  return (
    <header className="h-14 border-b flex items-center justify-between px-4 lg:px-8 bg-background shrink-0 gap-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <span className="font-semibold text-sm tracking-tight md:hidden">Distribution Engine</span>
      </div>

      <div className="flex items-center gap-3">
        <QuickActionsCommand />
      </div>
    </header>
  );
}
