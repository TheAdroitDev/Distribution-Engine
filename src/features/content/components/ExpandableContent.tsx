"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { MorphIcon } from "morphicons/react";
import { Copy, Check } from "lucide";
import { Button } from "@/components/ui/button";
import { cn } from "cn";

interface ExpandableContentProps {
  content: string;
  maxCollapsedHeight?: string;
  maxExpandedHeight?: string;
  charThreshold?: number;
  className?: string;
}

export function ExpandableContent({
  content,
  maxCollapsedHeight = "max-h-28",
  maxExpandedHeight = "max-h-80",
  charThreshold = 100,
  className,
}: ExpandableContentProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  // Check if content exceeds threshold or has multiple line breaks
  const lineCount = (content.match(/\n/g) || []).length;
  const isLong = content.length > charThreshold || lineCount > 2;

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback if clipboard API is restricted
    }
  };

  return (
    <div className={cn("relative group/content", className)}>
      <div className="relative">
        <pre
          className={cn(
            "text-xs leading-relaxed text-muted-foreground bg-muted/30 p-4 rounded-lg border border-border/50 whitespace-pre-wrap font-mono transition-all duration-300",
            !isExpanded && isLong
              ? cn(maxCollapsedHeight, "overflow-hidden")
              : isLong
              ? cn(maxExpandedHeight, "overflow-y-auto")
              : ""
          )}
        >
          {content}
        </pre>

        {/* Gradient fade overlay when collapsed */}
        {!isExpanded && isLong && (
          <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-muted/90 via-muted/40 to-transparent rounded-b-lg pointer-events-none" />
        )}

        {/* Quick copy button with smooth MorphIcon animation */}
        <Button
          type="button"
          variant="outline"
          size="icon-xs"
          onClick={handleCopy}
          className="absolute top-2.5 right-2.5 opacity-80 group-hover/content:opacity-100 transition-opacity bg-background/80 backdrop-blur-xs size-6 cursor-pointer"
          title={copied ? "Copied!" : "Copy content"}
          aria-label={copied ? "Copied" : "Copy content"}
        >
          <MorphIcon
            icon={copied ? Check : Copy}
            className={cn("size-3.5 transition-colors", copied ? "text-emerald-500" : "text-muted-foreground")}
          />
        </Button>
      </div>

      {/* Show more / Show less toggle */}
      {isLong && (
        <div className="mt-2 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="text-xs text-muted-foreground hover:text-foreground h-7 px-2 gap-1 font-medium -ml-1 cursor-pointer"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="size-3.5" />
                <span>Show less</span>
              </>
            ) : (
              <>
                <ChevronDown className="size-3.5" />
                <span>Show more</span>
              </>
            )}
          </Button>

          <span className="text-[11px] text-muted-foreground/70 font-mono">
            {content.length} characters
          </span>
        </div>
      )}
    </div>
  );
}
