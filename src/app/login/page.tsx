"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { authClient, signIn } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { DuoIcon } from "@/components/ui/duo-icon";
import { Spinner } from "@/components/ui/spinner";
import { MorphIcon } from "morphicons/react";
import { ChevronLeft as MorphChevronLeft, ArrowLeft as MorphArrowLeft } from "lucide";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export default function LoginPage() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState<"google" | "github" | null>(null);
  const [lastMethod, setLastMethod] = useState<string | null>(null);
  const [backHovered, setBackHovered] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      try {
        const method = authClient.getLastUsedLoginMethod();
        if (method) {
          setLastMethod(method);
        }
      } catch {
        // Ignore on SSR or uninitialized state
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleSignIn = async (provider: "google" | "github") => {
    try {
      setIsLoading(provider);
      await signIn.social({
        provider,
        callbackURL: "/dashboard",
      });
    } catch {
      toast.error("Failed to sign in. Please try again.");
      setIsLoading(null);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 bg-background text-foreground selection:bg-neutral-200 dark:selection:bg-neutral-800">
      {/* Top Controls: Back to Home + Theme Toggle */}
      <div className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between">
        {/* Back to Home button with MorphIcon */}
        <Link 
          href="/"
          onMouseEnter={() => setBackHovered(true)}
          onMouseLeave={() => setBackHovered(false)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all duration-200 px-3.5 py-1.5 rounded-full border border-black/5 dark:border-white/10 bg-muted/30 hover:bg-muted/60 backdrop-blur-md group"
        >
          <MorphIcon 
            icon={backHovered ? MorphArrowLeft : MorphChevronLeft} 
            className="size-3.5 shrink-0 transition-transform duration-200" 
          />
          <span>Back to home</span>
        </Link>

        {/* Duo-tone Theme Toggle */}
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
                  className={`size-4 rotate-0 scale-100 transition-all text-amber-500 ${mounted ? "dark:-rotate-90 dark:scale-0" : ""}`}
                />
                <DuoIcon
                  name="moon_stars"
                  className={`absolute size-4 rotate-90 scale-0 transition-all text-blue-400 ${mounted ? "dark:rotate-0 dark:scale-100" : ""}`}
                />
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="center" className="flex items-center gap-1.5 py-1 px-2.5 text-xs">
            <span>Toggle theme</span>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="relative z-10 w-full max-w-[440px] px-2">
        <Card className="border-none bg-transparent shadow-none sm:p-4">
          <CardHeader className="text-center space-y-4 pt-4 pb-6">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-md transition-transform duration-300 hover:scale-105">
              <DuoIcon name="rocket" className="size-7" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                Distribution Engine
              </CardTitle>
              <CardDescription className="text-sm text-neutral-600 dark:text-neutral-400 max-w-sm mx-auto">
                Sign in to launch targeted platform-native distribution campaigns
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col gap-4 pb-6 pt-0 px-2 sm:px-4">
            {/* Google Login Button */}
            <div className="relative">
              <Button
                variant="outline"
                className="w-full h-12 relative justify-center gap-3 rounded-xl border border-black/10 dark:border-white/15 bg-background hover:bg-neutral-100 dark:hover:bg-neutral-800/70 active:scale-[0.99] transition-all duration-200 cursor-pointer shadow-xs"
                onClick={() => handleSignIn("google")}
                disabled={isLoading !== null}
              >
                {isLoading === "google" ? (
                  <Spinner className="size-5 shrink-0" />
                ) : (
                  <div className="size-5 relative shrink-0 flex items-center justify-center">
                    <Image
                      src="/logos/google.png"
                      alt="Google"
                      width={20}
                      height={20}
                      className="size-5 object-contain"
                    />
                  </div>
                )}
                <span className="font-semibold text-sm text-foreground">Continue with Google</span>
              </Button>
              {lastMethod === "google" && (
                <span className="absolute -top-2.5 right-3 z-10 rounded-full border border-black/10 dark:border-white/10 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-2xs pointer-events-none">
                  Last used
                </span>
              )}
            </div>

            {/* GitHub Login Button (Disabled - Coming Soon) */}
            <div className="relative">
              <Button
                variant="outline"
                className="w-full h-12 relative justify-center gap-3 rounded-xl border border-black/5 dark:border-white/10 bg-muted/40 dark:bg-neutral-900/40 text-muted-foreground opacity-75 cursor-not-allowed select-none"
                disabled={true}
              >
                <div className="size-5 relative shrink-0 flex items-center justify-center opacity-60">
                  <Image
                    src="/logos/github.png"
                    alt="GitHub"
                    width={20}
                    height={20}
                    className="size-5 object-contain dark:invert"
                  />
                </div>
                <span className="font-semibold text-sm text-muted-foreground">Continue with GitHub</span>
              </Button>
              <span className="absolute -top-2.5 right-3 z-10 rounded-full border border-black/10 dark:border-white/10 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider shadow-2xs pointer-events-none">
                Very Soon
              </span>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                By continuing, you agree to our terms of service and automated distribution privacy guidelines.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
