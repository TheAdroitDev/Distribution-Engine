"use client";

import { useState } from "react";
import Link from "next/link";
import { MorphIcon } from "morphicons/react";
import { Plus, ArrowRight } from "lucide";
import { cn } from "cn";

interface NewDistributionButtonProps {
  label?: string;
  className?: string;
}

export function NewDistributionButton({
  label = "New Distribution",
  className,
}: NewDistributionButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href="/content/new"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group relative inline-flex h-9 items-center justify-center gap-2 overflow-hidden rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-95 shadow-xs hover:shadow-md",
        className
      )}
    >
      <MorphIcon 
        icon={isHovered ? ArrowRight : Plus} 
        className="h-4 w-4 shrink-0" 
      />
      <span>{label}</span>
    </Link>
  );
}

