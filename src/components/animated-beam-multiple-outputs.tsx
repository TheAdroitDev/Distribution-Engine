"use client"

import React, { forwardRef, useRef } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { AnimatedBeam } from "@/components/ui/animated-beam"
import { DuoIcon } from "@/components/ui/duo-icon"
import { User } from "lucide-react"

const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "z-10 flex size-10 sm:size-11 items-center justify-center rounded-full border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900 text-foreground p-1.5 shadow-md transition-transform duration-300 hover:scale-105",
        className
      )}
    >
      {children}
    </div>
  )
})

Circle.displayName = "Circle"

export default function AnimatedBeamMultipleOutputDemo({
  className,
}: {
  className?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sourceRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<HTMLDivElement>(null)
  const div1Ref = useRef<HTMLDivElement>(null)
  const div2Ref = useRef<HTMLDivElement>(null)
  const div3Ref = useRef<HTMLDivElement>(null)
  const div4Ref = useRef<HTMLDivElement>(null)
  const div5Ref = useRef<HTMLDivElement>(null)
  const div6Ref = useRef<HTMLDivElement>(null)
  const div7Ref = useRef<HTMLDivElement>(null)

  return (
    <div
      className={cn(
        "relative flex h-[400px] w-full items-center justify-center overflow-hidden p-4 sm:p-8",
        className
      )}
      ref={containerRef}
    >
      <div className="flex size-full max-w-lg flex-row items-stretch justify-between gap-4 sm:gap-8">
        {/* Source Creator / Ingest */}
        <div className="flex flex-col justify-center">
          <Circle ref={sourceRef} className="size-11 sm:size-12">
            <User className="size-5 text-foreground" />
          </Circle>
        </div>

        {/* Center: Distribution Engine Core */}
        <div className="flex flex-col justify-center">
          <div 
            ref={engineRef} 
            className="z-10 flex size-14 sm:size-16 items-center justify-center rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 border-2 border-primary/40 shadow-xl shadow-primary/30 ring-4 ring-primary/20 transition-transform duration-300 hover:scale-105"
          >
            <DuoIcon name="rocket" className="size-7 sm:size-8 text-white dark:text-neutral-950" />
          </div>
        </div>

        {/* Right: Fanout Target Platforms from public/logos */}
        <div className="flex flex-col justify-center gap-1.5 sm:gap-2">
          {/* X / Twitter */}
          <Circle ref={div1Ref} className="overflow-hidden p-1.5">
            <Image
              src="/logos/X-Logo.png"
              alt="X (Twitter)"
              width={28}
              height={28}
              className="size-5 sm:size-6 object-contain rounded-full dark:invert"
            />
          </Circle>

          {/* LinkedIn */}
          <Circle ref={div2Ref} className="overflow-hidden p-1.5">
            <Image
              src="/logos/linkedin.jpg"
              alt="LinkedIn"
              width={28}
              height={28}
              className="size-5 sm:size-6 object-contain rounded-sm"
            />
          </Circle>

          {/* Peerlist */}
          <Circle ref={div3Ref} className="overflow-hidden p-1.5">
            <Image
              src="/logos/peerlist.webp"
              alt="Peerlist"
              width={28}
              height={28}
              className="size-5 sm:size-6 object-contain rounded-full"
            />
          </Circle>

          {/* Reddit */}
          <Circle ref={div4Ref} className="overflow-hidden p-1.5">
            <Image
              src="/logos/reddit-logo-png_seeklogo-409489.png"
              alt="Reddit"
              width={28}
              height={28}
              className="size-5 sm:size-6 object-contain rounded-full"
            />
          </Circle>

          {/* GitHub */}
          <Circle ref={div5Ref} className="overflow-hidden p-1.5">
            <Image
              src="/logos/github.png"
              alt="GitHub"
              width={28}
              height={28}
              className="size-5 sm:size-6 object-contain rounded-full dark:invert"
            />
          </Circle>

          {/* Dev Blog */}
          <Circle ref={div6Ref} className="overflow-hidden p-1.5">
            <Image
              src="/logos/blog.png"
              alt="Blog"
              width={28}
              height={28}
              className="size-5 sm:size-6 object-contain rounded-full"
            />
          </Circle>

          {/* Portfolio */}
          <Circle ref={div7Ref} className="overflow-hidden p-1.5">
            <Image
              src="/logos/portfolio.png"
              alt="Portfolio"
              width={28}
              height={28}
              className="size-5 sm:size-6 object-contain rounded-full"
            />
          </Circle>
        </div>
      </div>

      {/* Animated Beams: Source to Engine */}
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={sourceRef}
        toRef={engineRef}
        duration={3}
      />

      {/* Animated Beams: Engine to all output platforms */}
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={engineRef}
        toRef={div1Ref}
        duration={3}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={engineRef}
        toRef={div2Ref}
        duration={3}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={engineRef}
        toRef={div3Ref}
        duration={3}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={engineRef}
        toRef={div4Ref}
        duration={3}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={engineRef}
        toRef={div5Ref}
        duration={3}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={engineRef}
        toRef={div6Ref}
        duration={3}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={engineRef}
        toRef={div7Ref}
        duration={3}
      />
    </div>
  )
}
