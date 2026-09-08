"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { DuoIcon, type DuoIconName } from "@/components/ui/duo-icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MorphIcon } from "morphicons/react";
import { ChevronRight as MorphChevronRight, ArrowRight as MorphArrowRight } from "lucide";
import {
    ArrowRight,
    ChevronRight,
    Check,
    Flame,
    LayoutDashboard,
    Workflow
} from "lucide-react";
import { GooeyNav } from "@/components/ui/gooey-nav";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";
import { TypingAnimation } from "@/components/ui/typing-animation";
import { AnimatedList } from "@/components/ui/animated-list";
import AnimatedBeamMultipleOutputDemo from "@/components/animated-beam-multiple-outputs";
import {
    Sparkles,
    Calendar,
    Clock,
    Terminal,
    UserCheck,
    ShieldCheck,
    Paperclip,
    Send,
    Settings,
    CheckCircle2,
    Share2,
    FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LayoutTextFlip } from "../ui/layout-text-flip";

interface LandingPageClientProps {
    user: {
        id: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
    } | null;
}



const ASSET_CREATION_NOTIFICATIONS: {
    name: string;
    description: string;
    time: string;
    icon: DuoIconName;
    color: string;
}[] = [
        {
            name: "Peerlist Asset Created",
            description: "Project spotlight formatted & ready to post",
            time: "Just now",
            icon: "layers",
            color: "bg-emerald-500/10 text-emerald-500",
        },
        {
            name: "X (Twitter) Thread Generated",
            description: "6-tweet breakdown with technical quotes",
            time: "2m ago",
            icon: "rocket",
            color: "bg-sky-500/10 text-sky-500",
        },
        {
            name: "LinkedIn Article Derived",
            description: "Founder angle formatted with takeaways",
            time: "5m ago",
            icon: "target",
            color: "bg-blue-500/10 text-blue-500",
        },
        {
            name: "Reddit / Hacker News Draft",
            description: "Deep dive markdown with code snippets",
            time: "10m ago",
            icon: "file",
            color: "bg-amber-500/10 text-amber-500",
        },
    ];

const DISCOVER_CHAT_PAIRS = [
    {
        q: "5 hooks that make people stop scrolling",
        a: "1. Why 99% of queue workers starve\n2. The Redis pub/sub anti-pattern\n3. How we dropped latency to 4ms\n4. Stop using generic AI for summaries\n5. Postgres SKIP LOCKED in prod",
    },
    {
        q: "How do I turn this essay into a LinkedIn carousel?",
        a: "Generated 7-slide carousel: bold teardown cover, 4 breakdown slides with source quotes, code architecture comparison, and high-karma CTA.",
    },
    {
        q: "What is the single best angle for solo founders?",
        a: "Solo leverage angle: 'How 1 engineer shipped 30 technical assets across 4 platforms in 15 minutes without hallucinated AI summaries.'",
    },
];

export function LandingPageClient({ user }: LandingPageClientProps) {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [navDashboardHovered, setNavDashboardHovered] = useState(false);
    const [heroDashboardHovered, setHeroDashboardHovered] = useState(false);
    const [bottomDashboardHovered, setBottomDashboardHovered] = useState(false);
    const [navGetStartedHovered, setNavGetStartedHovered] = useState(false);
    const [heroGetStartedHovered, setHeroGetStartedHovered] = useState(false);
    const [bottomGetStartedHovered, setBottomGetStartedHovered] = useState(false);
    const [chatPairIndex, setChatPairIndex] = useState(0);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Cycle synchronized chat prompt pairs in Phase 2
    useEffect(() => {
        const chatInterval = setInterval(() => {
            setChatPairIndex((prev) => (prev + 1) % DISCOVER_CHAT_PAIRS.length);
        }, 9000);
        return () => clearInterval(chatInterval);
    }, []);

    // Keyboard shortcut: Press 'D' or 'd' to toggle theme
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement | null;
            if (
                target &&
                (target.tagName === "INPUT" ||
                    target.tagName === "TEXTAREA" ||
                    target.tagName === "SELECT" ||
                    target.isContentEditable)
            ) {
                return;
            }

            // Ignore if modifier keys are pressed (e.g. Ctrl+D, Cmd+D, Alt+D)
            if (e.ctrlKey || e.metaKey || e.altKey) {
                return;
            }

            if (e.key === "d" || e.key === "D") {
                e.preventDefault();
                setTheme(resolvedTheme === "dark" ? "light" : "dark");
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [resolvedTheme, setTheme]);

    return (
        <div className="relative min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary font-sans antialiased overflow-x-clip">
            {/* Floating Header / Navbar */}
            <header className="sticky top-0 z-50 w-full bg-background/65 dark:bg-background/60 backdrop-blur-2xl backdrop-saturate-150 shadow-sm shadow-black/[0.03] dark:shadow-black/20 transition-all">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                    {/* Brand Logo */}
                    <Link
                        href={user ? "/dashboard" : "/"}
                        className="flex items-center gap-2.5 group transition-transform duration-200 active:scale-98"
                    >
                        <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-md group-hover:shadow-primary/30">
                            <DuoIcon name="rocket" className="size-5 text-primary-foreground" />
                        </div>
                        <div className="flex items-center">
                            <span className="font-bold text-sm tracking-tight text-foreground leading-none">
                                Distribution Engine
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation Links with GooeyNav */}
                    <div className="hidden md:flex items-center">
                        <div className="rounded-[15px] border border-black/5 dark:border-white/[0.07] bg-muted/30 dark:bg-neutral-900/50 p-[2.5px] backdrop-blur-xl shadow-xs">
                            <GooeyNav
                                size="sm"
                                activeColor="var(--primary)"
                                activeLabelColor="var(--primary-foreground)"
                                items={[
                                    { label: "How it works", href: "#how-it-works" },
                                    { label: "Dashboard", href: "#preview" },
                                    { label: "Streak System", href: "#streak" },
                                ]}
                                className="rounded-xl border border-black/5 dark:border-white/[0.07] bg-muted/50 dark:bg-neutral-800/60 p-0.5"
                            />
                        </div>
                    </div>

                    {/* Right Action Items */}
                    <div className="flex items-center gap-2.5">
                        {/* Duo-tone Theme Toggle Button with Tooltip */}
                        <Tooltip>
                            <TooltipTrigger
                                type="button"
                                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                                className="size-9 rounded-[13px] border border-black/5 dark:border-white/[0.07] bg-muted/30 dark:bg-neutral-900/50 p-[2.5px] hover:bg-muted/60 dark:hover:bg-neutral-900/80 transition-all duration-200 cursor-pointer shadow-xs inline-flex items-center justify-center group"
                                aria-label="Toggle theme"
                            >
                                <div className="size-full rounded-[10px] border border-black/5 dark:border-white/[0.07] bg-muted/50 dark:bg-neutral-800/70 flex items-center justify-center transition-colors group-hover:border-black/10 dark:group-hover:border-white/15">
                                    <div className="relative flex items-center justify-center size-4 shrink-0">
                                        <DuoIcon
                                            name="sun"
                                            className={`size-4 rotate-0 scale-100 transition-all text-amber-500 ${mounted ? "dark:-rotate-90 dark:scale-0" : ""
                                                }`}
                                        />
                                        <DuoIcon
                                            name="moon_stars"
                                            className={`absolute size-4 rotate-90 scale-0 transition-all text-blue-400 ${mounted ? "dark:rotate-0 dark:scale-100" : ""
                                                }`}
                                        />
                                    </div>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" align="center" className="flex items-center gap-1.5 py-1 px-2.5 text-xs">
                                <span>Toggle theme</span>
                                <kbd className="px-1.5 py-0.5 text-[10px] font-semibold uppercase bg-muted/30 text-background rounded border border-background/20 font-mono">
                                    D
                                </kbd>
                            </TooltipContent>
                        </Tooltip>

                        {user ? (
                            <Link
                                href="/dashboard"
                                onMouseEnter={() => setNavDashboardHovered(true)}
                                onMouseLeave={() => setNavDashboardHovered(false)}
                            >
                                <Button
                                    size="sm"
                                    className="h-8.5 px-3.5 gap-1.5 rounded-lg text-xs font-semibold shadow-sm hover:shadow transition-all duration-200 group cursor-pointer"
                                >
                                    <span>Dashboard</span>
                                    <MorphIcon
                                        icon={navDashboardHovered ? MorphArrowRight : MorphChevronRight}
                                        className="size-3.5 shrink-0 transition-transform duration-200"
                                    />
                                </Button>
                            </Link>
                        ) : (
                            <div className="flex items-center">
                                <Link 
                                    href="/login"
                                    onMouseEnter={() => setNavGetStartedHovered(true)}
                                    onMouseLeave={() => setNavGetStartedHovered(false)}
                                >
                                    <Button
                                        size="sm"
                                        className="h-8.5 px-3.5 gap-1.5 rounded-lg text-xs font-semibold shadow-sm hover:shadow transition-all duration-200 group cursor-pointer"
                                    >
                                        <span>Get Started</span>
                                        <MorphIcon
                                            icon={navGetStartedHovered ? MorphArrowRight : MorphChevronRight}
                                            className="size-3.5 shrink-0 transition-transform duration-200"
                                        />
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-20 pb-16 sm:pt-28 sm:pb-24 overflow-hidden">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative z-10">

                    {/* Main Headline */}
                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.18] max-w-4xl mx-auto animate-in fade-in slide-in-from-top-4 duration-700">
                        Automate your technical content{" "}
                        <LayoutTextFlip
                            words={["distribution pipeline", "multi-platform dispatch", "content fanout", "execution queue"]}
                        />
                    </h1>

                    {/* Subtitle */}
                    <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-top-5 duration-700">
                        Convert engineering blogs, architectural writeups, and technical deep-dives into high-engagement platform-native posts. Build daily momentum and reach verified audiences without generic AI summaries.
                    </p>

                    {/* Dual CTAs */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
                        {user ? (
                            <Link
                                href="/dashboard"
                                onMouseEnter={() => setHeroDashboardHovered(true)}
                                onMouseLeave={() => setHeroDashboardHovered(false)}
                            >
                                <Button
                                    size="lg"
                                    className="h-12 px-6 gap-2 rounded-xl text-sm font-semibold shadow-md active:scale-[0.98] transition-colors duration-200 cursor-pointer"
                                >
                                    <span>Open Your Dashboard</span>
                                    <MorphIcon
                                        icon={heroDashboardHovered ? MorphArrowRight : MorphChevronRight}
                                        className="size-4 shrink-0 transition-transform duration-200"
                                    />
                                </Button>
                            </Link>
                        ) : (
                            <Link 
                                href="/login"
                                onMouseEnter={() => setHeroGetStartedHovered(true)}
                                onMouseLeave={() => setHeroGetStartedHovered(false)}
                            >
                                <Button
                                    size="lg"
                                    className="h-12 px-6 gap-2 rounded-xl text-sm font-semibold border border-black/10 dark:border-white/10 bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 shadow-md active:scale-[0.98] transition-colors duration-200 cursor-pointer"
                                >
                                    <span>Start Distributing Free</span>
                                    <MorphIcon
                                        icon={heroGetStartedHovered ? MorphArrowRight : MorphChevronRight}
                                        className="size-4 shrink-0 transition-transform duration-200"
                                    />
                                </Button>
                            </Link>
                        )}

                        <a href="#how-it-works">
                            <Button
                                variant="outline"
                                size="lg"
                                className="h-12 px-5 gap-2 rounded-xl text-sm font-medium border-border/80 bg-background/60 hover:bg-muted/60 backdrop-blur-sm active:scale-[0.98] transition-colors duration-200 cursor-pointer"
                            >
                                <DuoIcon name="layers" className="size-4.5 text-muted-foreground" />
                                <span>How It Works</span>
                            </Button>
                        </a>
                    </div>
                </div>

                {/* Dashboard 3D Interactive Showcase */}
                <div id="preview" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 relative z-10 scroll-mt-20">
                    <CardContainer className="w-full py-0 sm:py-2" containerClassName="w-full py-0">
                        <CardBody className="relative group/card w-full h-auto p-0 bg-transparent border-0 shadow-none">
                            {/* Pure Dashboard Image with 3D Depth */}
                            <CardItem translateZ="60" className="w-full">
                                <div className="relative overflow-hidden rounded-2xl shadow-2xl shadow-black/20 dark:shadow-black/70 dark:group-hover/card:shadow-emerald-500/[0.12] ring-1 ring-black/5 dark:ring-white/10 transition-all duration-500">
                                    <Image
                                        src="/image-1.png"
                                        alt="Distribution Engine Executive Dashboard"
                                        width={1593}
                                        height={811}
                                        priority
                                        className="w-full h-auto object-cover rounded-2xl"
                                    />
                                </div>
                            </CardItem>
                        </CardBody>
                    </CardContainer>
                </div>
            </section>

            {/* How It Works Section - 3-Phase Bento Grid */}
            <section id="how-it-works" className="py-20 border-t border-border/40 relative">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                    {/* Section Title Header */}
                    <div className="text-center max-w-2xl mx-auto space-y-3">
                        <Badge variant="outline" className="text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1.5 px-3 py-1">
                            <DuoIcon name="layers" className="size-3.5" />
                            <span>The Framework</span>
                        </Badge>
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                            How Distribution Engine Works
                        </h2>
                        <p className="text-sm sm:text-base text-neutral-600 dark:text-white/70 leading-relaxed">
                            From raw thoughts to multi-channel execution in three synchronized, high-impact phases.
                        </p>
                    </div>

                    {/* Interactive Bento Grid with Layered Double-Border Design */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                        {/* PHASE 01: Ingest & Content Input (5 cols) - Double Border */}
                        <div className="lg:col-span-5 rounded-[28px] border border-black/5 dark:border-white/[0.07] bg-muted/30 dark:bg-neutral-900/50 p-1 backdrop-blur-xl shadow-sm">
                            <div className="h-full relative rounded-[24px] border border-black/5 dark:border-white/[0.07] bg-card/75 dark:bg-neutral-900/75 p-6 sm:p-7 flex flex-col justify-between overflow-hidden group">
                                <div>
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                            <DuoIcon name="file" className="size-6" />
                                        </div>
                                        <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-500/10">
                                            PHASE 01
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white mb-2">
                                        Add Something to Distribute
                                    </h3>
                                    <p className="text-sm text-neutral-600 dark:text-white/70 leading-relaxed mb-5">
                                        Paste raw text or upload markdown notes, changelogs, and drafts. The engine extracts verified insights without generic filler.
                                    </p>
                                </div>

                                {/* Phase 1 Screenshot Visual (Border completely removed as requested) */}
                                <div className="relative overflow-hidden rounded-2xl shadow-lg bg-neutral-950/80">
                                    <Image
                                        src="/image-2.png"
                                        alt="Add Something to Distribute"
                                        width={958}
                                        height={717}
                                        className="w-full h-auto object-cover rounded-2xl transition-transform duration-500 group-hover:scale-[1.02]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* PHASE 02: Discover & Intelligence Workspace - Double Border */}
                        <div className="lg:col-span-7 rounded-[28px] border border-black/5 dark:border-white/[0.07] bg-muted/30 dark:bg-neutral-900/50 p-1 backdrop-blur-xl shadow-sm">
                            <div className="h-full relative rounded-[24px] border border-black/5 dark:border-white/[0.07] bg-card/75 dark:bg-neutral-900/75 p-6 sm:p-7 flex flex-col justify-between overflow-hidden group">
                                <div>
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                            <DuoIcon name="target" className="size-6" />
                                        </div>
                                        <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-full bg-blue-500/10">
                                            PHASE 02 · DISCOVER & INSIGHTS
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white mb-2">
                                        Intelligence & Persona Extraction
                                    </h3>
                                    <p className="text-sm text-neutral-600 dark:text-white/70 leading-relaxed mb-5">
                                        Ask your content repository for strategic angles. The engine deconstructs raw thoughts into high-retention hooks and formats in real time.
                                    </p>
                                </div>

                                {/* Chat Simulation Workspace matching reference image */}
                                <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-neutral-950 p-4 sm:p-5 shadow-inner space-y-4 font-sans text-xs">
                                    {/* User Message (Right Side with Avatar "S") */}
                                    <div className="flex items-start justify-end gap-2.5">
                                        <div className="rounded-2xl rounded-tr-xs bg-neutral-800/90 text-white px-4 py-2.5 max-w-[85%] text-xs sm:text-sm font-medium shadow-xs">
                                            <TypingAnimation
                                                key={`q-${chatPairIndex}`}
                                                duration={30}
                                                delay={100}
                                                showCursor={true}
                                                className="text-xs sm:text-sm font-medium"
                                            >
                                                {DISCOVER_CHAT_PAIRS[chatPairIndex].q}
                                            </TypingAnimation>
                                        </div>
                                        <div className="size-7 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center text-[11px] font-bold shrink-0 shadow-xs">
                                            S
                                        </div>
                                    </div>

                                    {/* Engine Response (Left Side with Duo Icon Logo + Same TypingAnimation Component) */}
                                    <div className="flex items-start gap-2.5">
                                        <div className="size-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-sm shadow-primary/30">
                                            <DuoIcon name="rocket" className="size-3.5 text-primary-foreground" />
                                        </div>
                                        <div className="rounded-2xl rounded-tl-xs bg-neutral-900 border border-white/5 text-neutral-200 px-4 py-3 max-w-[90%] text-xs sm:text-sm leading-relaxed shadow-xs">
                                            <TypingAnimation
                                                key={`a-${chatPairIndex}`}
                                                duration={22}
                                                delay={1400}
                                                showCursor={true}
                                                className="text-xs sm:text-sm text-neutral-200 whitespace-pre-line"
                                            >
                                                {DISCOVER_CHAT_PAIRS[chatPairIndex].a}
                                            </TypingAnimation>
                                        </div>
                                    </div>

                                    {/* Bottom Chat Bar Mock */}
                                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-neutral-500 text-[11px]">
                                        <div className="flex items-center gap-2">
                                            <Paperclip className="size-3.5 hover:text-neutral-300 transition-colors cursor-pointer" />
                                            <Settings className="size-3.5 hover:text-neutral-300 transition-colors cursor-pointer" />
                                        </div>
                                        <div className="flex size-5 items-center justify-center rounded-full bg-rose-500 text-white shadow-xs">
                                            <Send className="size-2.5" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* PHASE 03: Multi-Platform Dispatch & Execution Queue (Full 12 cols, Split into 2 columns) - Double Border */}
                        <div className="lg:col-span-12 rounded-[28px] border border-black/5 dark:border-white/[0.07] bg-muted/30 dark:bg-neutral-900/50 p-1 backdrop-blur-xl shadow-sm">
                            <div className="relative rounded-[24px] border border-black/5 dark:border-white/[0.07] bg-card/75 dark:bg-neutral-900/75 p-6 sm:p-8 overflow-hidden group">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                            <DuoIcon name="layers" className="size-6" />
                                        </div>
                                        <div>
                                            <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400 px-2.5 py-0.5 rounded-full bg-amber-500/10">
                                                PHASE 03 · EXECUTION & DISPATCH
                                            </span>
                                            <h3 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white mt-1">
                                                Multi-Channel Fanout & Live Queue Pipeline
                                            </h3>
                                        </div>
                                    </div>
                                </div>

                                {/* 2-Column Split inside Phase 3 */}
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

                                    {/* Part 1: Animated Beam Component (7 cols) - Border removed */}
                                    <div className="lg:col-span-7 flex flex-col justify-center">
                                        <div className="mb-2">
                                            <div className="text-xs font-semibold text-neutral-700 dark:text-white/80 uppercase tracking-wider mb-1">
                                                Beam Pipeline Engine
                                            </div>
                                            <p className="text-xs sm:text-sm text-neutral-600 dark:text-white/70">
                                                Continuous flow from single verified source into all target platforms simultaneously.
                                            </p>
                                        </div>
                                        {/* Animated Beam Container with Border Removed */}
                                        <div className="rounded-2xl bg-muted/20 dark:bg-neutral-950/40 p-2 sm:p-4">
                                            <AnimatedBeamMultipleOutputDemo className="h-[380px] sm:h-[420px]" />
                                        </div>
                                    </div>

                                    {/* Part 2: Polished Realistic Modern Smartphone (5 cols) */}
                                    <div className="lg:col-span-5 flex flex-col items-center justify-center">
                                        <div className="relative mx-auto w-[260px] sm:w-[275px]">
                                            {/* Realistic phone side hardware buttons */}
                                            <div className="absolute -left-[9px] top-20 h-7 w-[3px] rounded-l-md bg-neutral-700/80 dark:bg-neutral-600" />
                                            <div className="absolute -left-[9px] top-32 h-11 w-[3px] rounded-l-md bg-neutral-700/80 dark:bg-neutral-600" />
                                            <div className="absolute -left-[9px] top-47 h-11 w-[3px] rounded-l-md bg-neutral-700/80 dark:bg-neutral-600" />
                                            <div className="absolute -right-[9px] top-28 h-14 w-[3px] rounded-r-md bg-neutral-700/80 dark:bg-neutral-600" />

                                            {/* Phone Body with realistic bezel & ratio */}
                                            <div className="rounded-[44px] border-[7px] border-neutral-900 dark:border-neutral-800 bg-background shadow-2xl ring-1 ring-black/10 dark:ring-white/10 p-3 pt-2 relative overflow-hidden flex flex-col justify-between h-[450px]">

                                                {/* Top Phone Status Bar + Dynamic Island */}
                                                <div className="relative pt-1 pb-2">
                                                    {/* Dynamic Island Pill */}
                                                    <div className="mx-auto h-4 w-20 rounded-full bg-black flex items-center justify-end pr-2 shadow-xs">
                                                        {/* Camera lens reflection */}
                                                        <div className="size-2 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                                                            <div className="size-1 rounded-full bg-blue-950/80" />
                                                        </div>
                                                    </div>

                                                    {/* Status bar row: Time on left, Battery/Wifi on right */}
                                                    <div className="flex items-center justify-between px-2 pt-1 text-[10px] font-bold text-muted-foreground font-mono">
                                                        <span>9:41</span>
                                                        <div className="flex items-center gap-1.5 text-[9px]">
                                                            <span className="tracking-tighter">5G</span>
                                                            <div className="w-4 h-2 rounded-[3px] border border-muted-foreground/60 p-0.5 flex items-center">
                                                                <div className="h-full w-2.5 bg-emerald-500 rounded-[1px]" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* App Header */}
                                                <div className="px-1 py-1.5 border-b border-border/40 mb-2 flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="flex size-5 items-center justify-center rounded-md bg-primary text-primary-foreground">
                                                            <DuoIcon name="rocket" className="size-3 text-primary-foreground" />
                                                        </div>
                                                        <span className="text-[11px] font-bold text-foreground">Dist Engine</span>
                                                    </div>
                                                    <div className="text-[9px] text-emerald-500 font-semibold flex items-center gap-1 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                                                        <span className="size-1 rounded-full bg-emerald-500 animate-ping" />
                                                        Live Queue
                                                    </div>
                                                </div>

                                                {/* Animated List Content Inside Phone Screen */}
                                                <div className="flex-1 overflow-hidden flex flex-col justify-center">
                                                    <AnimatedList delay={1800}>
                                                        {ASSET_CREATION_NOTIFICATIONS.map((item, idx) => (
                                                            <div
                                                                key={`${item.name}-${idx}`}
                                                                className="flex items-center gap-2.5 p-2 rounded-xl border border-border/60 bg-muted/40 dark:bg-neutral-900/80 shadow-xs w-full transition-all"
                                                            >
                                                                <div className={cn("size-7 rounded-lg flex items-center justify-center shrink-0", item.color)}>
                                                                    <DuoIcon name={item.icon} className="size-3.5" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="text-[10px] font-bold text-foreground truncate">
                                                                        {item.name}
                                                                    </div>
                                                                    <div className="text-[9px] text-muted-foreground truncate">
                                                                        {item.description}
                                                                    </div>
                                                                </div>
                                                                <span className="text-[8px] font-mono text-muted-foreground shrink-0">
                                                                    {item.time}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </AnimatedList>
                                                </div>

                                                {/* Bottom Home Indicator Bar */}
                                                <div className="pt-2 pb-1 text-center">
                                                    <div className="w-24 h-1 rounded-full bg-neutral-400 dark:bg-neutral-600 mx-auto" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>


            {/* Streak Planner & Consistency Section */}
            <section id="streak" className="py-24 border-t border-border/40 relative">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">

                        {/* Left Column: Descriptive Typography & Core Principles */}
                        <div className="lg:col-span-6 space-y-6">
                            <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
                                <Flame className="size-3.5 fill-amber-500" />
                                <span>Daily Execution Streak</span>
                            </div>

                            <div className="space-y-3">
                                <h2 className="text-2xl sm:text-2xl lg:text-5xl font-black tracking-tight text-neutral-900 dark:text-white leading-tight">
                                    Distribution is won through consistency.
                                </h2>
                                <p className="text-sm sm:text-base text-neutral-600 dark:text-white/70 leading-relaxed">
                                    Publishing once every three months fails to build compounding leverage.
                                    Distribution Engine tracks your real creative activity: importing high-value technical essays, approving multi-platform strategies, and queueing daily dispatches.
                                </p>
                            </div>

                            {/* Feature Value Points */}
                            <div className="space-y-4 pt-2">
                                <div className="flex items-start gap-3">
                                    <div className="p-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mt-0.5 shrink-0">
                                        <Check className="size-4" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <span className="text-base font-semibold text-neutral-900 dark:text-white block">Real Output Verification</span>
                                        <span className="text-sm sm:text-[15px] text-neutral-600 dark:text-white/70 leading-relaxed block">Streaks only progress when you import sources, generate strategies, or dispatch live content.</span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="p-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mt-0.5 shrink-0">
                                        <Check className="size-4" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <span className="text-base font-semibold text-neutral-900 dark:text-white block">Monthly Activity Micro-Matrix</span>
                                        <span className="text-sm sm:text-[15px] text-neutral-600 dark:text-white/70 leading-relaxed block">Instant visual feedback on your monthly execution cadence with glowing emerald activity cells.</span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="p-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mt-0.5 shrink-0">
                                        <Check className="size-4" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <span className="text-base font-semibold text-neutral-900 dark:text-white block">Continuous Momentum Protection</span>
                                        <span className="text-sm sm:text-[15px] text-neutral-600 dark:text-white/70 leading-relaxed block">Next Recommended Action card always guides you to your highest-leverage task for today.</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Dashboard Execution Streak Card Mockup (Borders removed as requested) */}
                        <div className="lg:col-span-6 flex justify-center">
                            {/* Clean borderless card container */}
                            <div className="w-full max-w-md rounded-[28px] bg-card/95 dark:bg-neutral-900/90 p-6 sm:p-7 shadow-xl shadow-black/5 dark:shadow-black/30 relative overflow-hidden space-y-6">

                                {/* Subtle warm ambient illumination for active streaks */}
                                <div className="pointer-events-none absolute -top-12 -right-12 size-48 rounded-full bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent blur-3xl" />

                                {/* Top Row: Streak Count Header + Fire Icon Badge */}
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-baseline gap-2.5">
                                            <span className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-900 dark:text-white">
                                                34
                                            </span>
                                            <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                                Day Streak
                                            </span>
                                        </div>
                                        <p className="text-xs font-semibold text-neutral-800 dark:text-white/90">
                                            Monday, September 7, 2026
                                        </p>
                                        <p className="text-xs text-neutral-500 dark:text-white/60 font-medium">
                                            Your today&apos;s activity count is{" "}
                                            <span className="font-bold text-neutral-900 dark:text-white">
                                                4 actions
                                            </span>
                                        </p>
                                    </div>

                                    {/* Glowing Duo-Tone Colored Fire Icon Container */}
                                    <div className="relative flex size-12 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 shadow-sm border bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-amber-500/5 border-amber-500/30 text-amber-500 dark:text-amber-400">
                                        <span className="absolute inset-0 rounded-2xl bg-amber-500/15 blur-sm -z-10" />
                                        <DuoIcon name="fire" className="size-7 scale-105" />
                                    </div>
                                </div>

                                {/* Current Month Calendar Header & Micro Matrix without numbers */}
                                <div className="space-y-2.5 pt-1">
                                    <div className="flex items-center justify-between text-xs font-medium px-0.5">
                                        <span className="font-bold text-neutral-900 dark:text-white">September 2026</span>
                                        <span className="text-[11px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                                            24 active days
                                        </span>
                                    </div>

                                    {/* Clean minimal micro-squares grid */}
                                    <div className="grid grid-cols-7 gap-2 sm:gap-2.5">
                                        {Array.from({ length: 28 }).map((_, i) => {
                                            const isFuture = i > 20;
                                            const isToday = i === 20;
                                            const isRestDay = i === 4 || i === 11 || i === 18;
                                            const isActive = !isFuture && !isRestDay;

                                            return (
                                                <div
                                                    key={i}
                                                    className={cn(
                                                        "h-7 sm:h-8 rounded-md transition-all duration-150 border flex items-center justify-center",
                                                        isActive
                                                            ? "bg-emerald-500 border-emerald-400/90 shadow-2xs shadow-emerald-500/30 dark:bg-emerald-500 dark:border-emerald-400"
                                                            : isToday
                                                                ? "border-primary ring-2 ring-primary/40 bg-primary/15 font-bold"
                                                                : isFuture
                                                                    ? "bg-muted/40 border-border/50 dark:bg-neutral-800/40 dark:border-neutral-700/50 opacity-60"
                                                                    : "bg-muted/60 border-border/70 dark:bg-neutral-800/60 dark:border-neutral-700"
                                                    )}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Bottom Footer: Longest Streak & Status Tracker */}
                                <div className="pt-3.5 border-t border-border/60 dark:border-white/10 flex items-center justify-between text-xs text-neutral-500 dark:text-white/60 font-medium">
                                    <div className="truncate">
                                        <span>Your longest streak: </span>
                                        <span className="font-bold text-neutral-900 dark:text-white">
                                            42 days
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                            Active today
                                        </span>
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Bottom CTA Banner */}
            <section className="py-20 border-t border-border/40 relative overflow-hidden">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-primary/10" />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
                    <Badge variant="secondary" className="px-3 py-1 text-xs font-semibold">
                        Ready to distribute?
                    </Badge>
                    <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
                        Stop letting your best technical work gather dust.
                    </h2>
                    <p className="text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
                        Give your essays, guides, and project updates the distribution reach they deserve with platform-native precision.
                    </p>
                    <div className="pt-2">
                        {user ? (
                            <Link
                                href="/dashboard"
                                onMouseEnter={() => setBottomDashboardHovered(true)}
                                onMouseLeave={() => setBottomDashboardHovered(false)}
                            >
                                <Button
                                    size="lg"
                                    className="h-12 px-7 gap-2 rounded-xl text-sm font-semibold shadow-md active:scale-[0.98] transition-colors duration-200 cursor-pointer"
                                >
                                    <span>Open Your Dashboard</span>
                                    <MorphIcon
                                        icon={bottomDashboardHovered ? MorphArrowRight : MorphChevronRight}
                                        className="size-4 shrink-0 transition-transform duration-200"
                                    />
                                </Button>
                            </Link>
                        ) : (
                            <Link 
                                href="/login"
                                onMouseEnter={() => setBottomGetStartedHovered(true)}
                                onMouseLeave={() => setBottomGetStartedHovered(false)}
                            >
                                <Button
                                    size="lg"
                                    className="h-12 px-7 gap-2 rounded-xl text-sm font-semibold border border-black/10 dark:border-white/10 bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 shadow-md active:scale-[0.98] transition-colors duration-200 cursor-pointer"
                                >
                                    <span>Start Distributing Free</span>
                                    <MorphIcon
                                        icon={bottomGetStartedHovered ? MorphArrowRight : MorphChevronRight}
                                        className="size-4 shrink-0 transition-transform duration-200"
                                    />
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-border/40 bg-background/80 backdrop-blur-md text-muted-foreground pt-16 pb-12 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-border/50">

                        {/* Col 1: Brand & Tagline */}
                        <div className="md:col-span-5 space-y-4">
                            <Link href={user ? "/dashboard" : "/"} className="inline-flex items-center gap-2.5 group">
                                <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/20 transition-all duration-300 group-hover:scale-105">
                                    <DuoIcon name="rocket" className="size-5 text-primary-foreground" />
                                </div>
                                <span className="font-bold text-base tracking-tight text-foreground">
                                    Distribution Engine
                                </span>
                            </Link>
                            <p className="text-sm text-neutral-600 dark:text-white/65 max-w-sm leading-relaxed">
                                Platform-native content deconstruction and streak-driven distribution engine designed for technical founders and engineering teams.
                            </p>

                            {/* Status pill */}
                            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-black/5 dark:border-white/[0.07] bg-muted/40 text-[11px] font-medium text-foreground/80">
                                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span>Systems Operational</span>
                            </div>
                        </div>

                        {/* Col 2: Navigation Links */}
                        <div className="md:col-span-3 space-y-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-foreground block">
                                Product
                            </span>
                            <ul className="space-y-2.5 text-sm">
                                <li>
                                    <a href="#how-it-works" className="hover:text-foreground transition-colors">
                                        How it Works
                                    </a>
                                </li>
                                <li>
                                    <a href="#preview" className="hover:text-foreground transition-colors">
                                        Dashboard Preview
                                    </a>
                                </li>
                                <li>
                                    <a href="#streak" className="hover:text-foreground transition-colors">
                                        Streak System
                                    </a>
                                </li>
                                <li>
                                    <Link href={user ? "/dashboard" : "/login"} className="hover:text-foreground transition-colors">
                                        Interactive Workspace
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Col 3: Resources & Account */}
                        <div className="md:col-span-4 space-y-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-foreground block">
                                Platform
                            </span>
                            <ul className="space-y-2.5 text-sm">
                                <li>
                                    <Link href="/login" className="hover:text-foreground transition-colors">
                                        Account Sign In
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/dashboard" className="hover:text-foreground transition-colors">
                                        Execution Dashboard
                                    </Link>
                                </li>
                                <li>
                                    <a
                                        href="https://github.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-foreground transition-colors"
                                    >
                                        Documentation &amp; Source
                                    </a>
                                </li>
                            </ul>
                        </div>

                    </div>

                    {/* Bottom Row */}
                    <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                        <p className="text-muted-foreground">
                            &copy; {new Date().getFullYear()} Distribution Engine. All rights reserved. Built for engineering leverage.
                        </p>
                        <div className="flex items-center gap-6">
                            <a href="#how-it-works" className="hover:text-foreground transition-colors">
                                Architecture
                            </a>
                            <a href="#streak" className="hover:text-foreground transition-colors">
                                Consistency Heatmap
                            </a>
                            <Link href={user ? "/dashboard" : "/login"} className="hover:text-foreground transition-colors">
                                Launch App
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
