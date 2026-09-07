"use client";

import React, { useState, useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "cn";

interface MorphingContentCardProps {
  children: React.ReactNode;
  index?: number;
  className?: string;
}

export function MorphingContentCard({
  children,
  index = 0,
  className,
}: MorphingContentCardProps) {
  // Stages:
  // 1. 'skeleton' - Card starts at measured skeleton height with placeholder visible
  // 2. 'resizing' - Height smoothly interpolates to real content height via Framer curve, de-blurring & gliding in
  // 3. 'ready'    - Settled at final dimensions, height unlocked to auto, skeleton overlay unmounted
  const [stage, setStage] = useState<"skeleton" | "resizing" | "ready">("skeleton");
  const [cardHeight, setCardHeight] = useState<number | undefined>(undefined);

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const skeletonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial skeleton height measurement
    const initialSkeletonHeight = skeletonRef.current?.offsetHeight ?? 154;
    setCardHeight(initialSkeletonHeight);

    // Staggered cascade delay per card (Framer-like stagger)
    const delay = 80 + index * 50;

    const timer1 = setTimeout(() => {
      if (contentRef.current) {
        const targetHeight = contentRef.current.scrollHeight;
        setCardHeight(targetHeight);
      }
      setStage("resizing");

      // Once the fluid deceleration finishes, unlock height to auto
      const timer2 = setTimeout(() => {
        setStage("ready");
        setCardHeight(undefined);
      }, 560);

      return () => clearTimeout(timer2);
    }, delay);

    return () => clearTimeout(timer1);
  }, [index]);

  return (
    <div
      ref={containerRef}
      style={cardHeight !== undefined ? { height: `${cardHeight}px` } : undefined}
      className={cn(
        "relative rounded-xl overflow-hidden will-change-[height]",
        "transition-[height] duration-550 ease-framer",
        className
      )}
    >
      {/* Skeleton Overlay: Displays realistic placeholder layout, then smoothly dissolves & translates upward */}
      {stage !== "ready" && (
        <div
          ref={skeletonRef}
          aria-hidden="true"
          className={cn(
            "absolute inset-x-0 top-0 z-10 rounded-xl border-0 bg-card p-5 space-y-3 shadow-xs",
            "transition-all duration-350 ease-framer",
            stage === "resizing"
              ? "opacity-0 -translate-y-1 scale-[0.995] blur-[1px] pointer-events-none"
              : "opacity-100 translate-y-0 scale-100 blur-0"
          )}
        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-44 sm:w-60" />
                <Skeleton className="h-4 w-16 rounded-md" />
              </div>
              <div className="flex items-center gap-2 pt-0.5">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-8 w-24 rounded-lg shrink-0" />
          </div>
          <Skeleton className="h-14 w-full rounded-lg mt-2" />
        </div>
      )}

      {/* Real Content Card: Materializes with Framer-like glide, de-blur, and scale */}
      <div
        ref={contentRef}
        className={cn(
          "transition-all duration-520 ease-framer",
          stage === "skeleton"
            ? "opacity-0 translate-y-2 scale-[0.985] blur-[3px] pointer-events-none"
            : "opacity-100 translate-y-0 scale-100 blur-0"
        )}
      >
        {children}
      </div>
    </div>
  );
}

