"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

export const LayoutTextFlip = ({
  text,
  words = ["Landing Pages", "Component Blocks", "Page Sections", "3D Shaders"],
  duration = 3000,
  className,
}: {
  text?: string;
  words: string[];
  duration?: number;
  className?: string;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, duration);

    return () => clearInterval(interval);
  }, [duration, words.length]);

  return (
    <>
      {text ? (
        <motion.span
          layoutId="subtext"
          className="font-bold tracking-tight"
        >
          {text}
        </motion.span>
      ) : null}

      <motion.span
        layout
        className={cn(
          "relative inline-flex items-center justify-center align-middle w-fit overflow-hidden rounded-xl sm:rounded-2xl border border-border/80 bg-neutral-100 dark:bg-neutral-900 px-3 py-1 sm:px-4 sm:py-1.5 font-sans font-extrabold tracking-tight text-foreground shadow-xs mx-1.5 my-1",
          className
        )}
      >
        <AnimatePresence mode="popLayout">
          <motion.span
            key={currentIndex}
            initial={{ y: -30, filter: "blur(8px)", opacity: 0 }}
            animate={{
              y: 0,
              filter: "blur(0px)",
              opacity: 1,
            }}
            exit={{ y: 30, filter: "blur(8px)", opacity: 0 }}
            transition={{
              duration: 0.45,
              ease: "easeInOut",
            }}
            className={cn("inline-block whitespace-nowrap leading-none")}
          >
            {words[currentIndex]}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </>
  );
};
