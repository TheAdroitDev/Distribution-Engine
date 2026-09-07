"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { SignOut } from "@phosphor-icons/react";
import { DuoIcon, type DuoIconName } from "@/components/ui/duo-icon";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession, signOut } from "@/lib/auth/auth-client";
import { cn } from "@/lib/utils";

const mainNavItems: {
  title: string;
  url: string;
  icon: DuoIconName;
  isActive: (pathname: string) => boolean;
  disabled?: boolean;
  badge?: string;
}[] = [
  {
    title: "Overview",
    url: "/dashboard",
    icon: "dashboard",
    isActive: (pathname: string) => pathname === "/dashboard",
  },
  {
    title: "Content",
    url: "/content",
    icon: "file",
    isActive: (pathname: string) => pathname.startsWith("/content"),
  },
  {
    title: "Plans",
    url: "/plans",
    icon: "target",
    isActive: (pathname: string) => pathname.startsWith("/plans"),
  },
  {
    title: "Queue",
    url: "/queue",
    icon: "clipboard",
    isActive: (pathname: string) => pathname.startsWith("/queue"),
  },
  {
    title: "Results",
    url: "/outcomes",
    icon: "chart_pie",
    isActive: (pathname: string) => pathname.startsWith("/outcomes"),
    disabled: true,
    badge: "Soon",
  },
];

const configNavItems: {
  title: string;
  url: string;
  icon: DuoIconName;
  isActive: (pathname: string) => boolean;
}[] = [
  {
    title: "Settings",
    url: "/settings",
    icon: "settings",
    isActive: (pathname: string) => pathname.startsWith("/settings"),
  },
];

function UserAvatar({ 
  image, 
  name, 
  email 
}: { 
  image?: string | null; 
  name?: string | null; 
  email?: string | null;
}) {
  const [hasError, setHasError] = useState(false);

  // Fallback to unavatar (queries Gravatar, Google, GitHub by email) or dicebear shapes
  const fallbackUrl = email 
    ? `https://unavatar.io/${encodeURIComponent(email)}?fallback=https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(email)}`
    : `https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(name || 'user')}`;

  const src = (!hasError && image) ? image : fallbackUrl;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name || "User Avatar"}
      referrerPolicy="no-referrer"
      onError={() => {
        if (!hasError) setHasError(true);
      }}
      className="size-9 rounded-full border border-border/80 bg-muted object-cover shrink-0 shadow-2xs"
    />
  );
}

export type SidebarUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export function AppSidebar({ initialUser }: { initialUser?: SidebarUser | null }) {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // If initialUser was passed from server layout, no client-side fetch is needed
  const { data: clientSession, isPending: clientPending } = useSession();
  const router = useRouter();

  const user = initialUser !== undefined ? initialUser : clientSession?.user;
  const isPending = initialUser === undefined && clientPending;

  useEffect(() => {
    setMounted(true);
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

      // Ignore if modifier keys are pressed (e.g. Ctrl+D bookmark, Cmd+D, Alt+D)
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

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border/60">
      {/* Sidebar Header with robust collapsed state */}
      <SidebarHeader className="h-14 border-b border-border/60 px-3 flex items-center justify-center group-data-[collapsible=icon]:px-0">
        <SidebarMenu className="w-full">
          <SidebarMenuItem className="w-full flex items-center justify-center">
            <SidebarMenuButton 
              size="lg" 
              render={<Link href="/dashboard" />}
              className="w-full h-10 px-2 gap-2.5 rounded-lg group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0"
            >
              <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
                <DuoIcon name="rocket" className="size-4.5 text-primary-foreground" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight ml-0.5 group-data-[collapsible=icon]:hidden">
                <span className="truncate font-semibold tracking-tight text-foreground">Distribution Engine</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4 gap-6 group-data-[collapsible=icon]:px-1.5 group-data-[collapsible=icon]:py-3">
        {/* Workflow Group */}
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="px-2.5 text-[11px] font-semibold tracking-wider text-muted-foreground/80 uppercase mb-1 group-data-[collapsible=icon]:hidden">
            Workflow
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={item.disabled ? <span /> : <Link href={item.url} />}
                    isActive={!item.disabled && item.isActive(pathname)}
                    tooltip={item.disabled ? `${item.title} (Coming Soon)` : item.title}
                    className={cn(
                      "group/item h-9 px-2.5 gap-2.5 text-sm font-medium rounded-lg transition-all group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:mx-auto",
                      item.disabled
                        ? "opacity-45 cursor-not-allowed text-muted-foreground select-none pointer-events-none"
                        : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-800/60 data-active:bg-neutral-200/80 data-active:text-neutral-900 data-active:font-semibold dark:data-active:bg-neutral-800 dark:data-active:text-neutral-50"
                    )}
                  >
                    <DuoIcon 
                      name={item.icon} 
                      className="size-5 shrink-0 text-[#3d3d3d] dark:text-neutral-300 group-data-[active=true]/menu-button:text-neutral-950 dark:group-data-[active=true]/menu-button:text-white transition-colors" 
                    />
                    <span className="truncate flex-1 group-data-[collapsible=icon]:hidden">{item.title}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase tracking-wider bg-muted border border-border/80 text-muted-foreground group-data-[collapsible=icon]:hidden">
                        {item.badge}
                      </span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Configuration Group */}
        <SidebarGroup className="mt-auto p-0">
          <SidebarSeparator className="mb-3 group-data-[collapsible=icon]:hidden" />
          <SidebarGroupLabel className="px-2.5 text-[11px] font-semibold tracking-wider text-muted-foreground/80 uppercase mb-1 group-data-[collapsible=icon]:hidden">
            Configuration
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {configNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<Link href={item.url} />}
                    isActive={item.isActive(pathname)}
                    tooltip={item.title}
                    className="group/item h-9 px-2.5 gap-2.5 text-sm font-medium rounded-lg transition-all text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-800/60 data-active:bg-neutral-200/80 data-active:text-neutral-900 data-active:font-semibold dark:data-active:bg-neutral-800 dark:data-active:text-neutral-50 group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:mx-auto"
                  >
                    <DuoIcon 
                      name={item.icon} 
                      className="size-5 shrink-0 text-[#3d3d3d] dark:text-neutral-300 group-data-[active=true]/menu-button:text-neutral-950 dark:group-data-[active=true]/menu-button:text-white transition-colors" 
                    />
                    <span className="truncate flex-1 group-data-[collapsible=icon]:hidden">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {user?.email && process.env.NEXT_PUBLIC_ADMIN_EMAIL && user.email.toLowerCase() === process.env.NEXT_PUBLIC_ADMIN_EMAIL.toLowerCase() && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link href="/admin" />}
                    isActive={pathname.startsWith("/admin")}
                    tooltip="Admin Panel"
                    className="group/item h-9 px-2.5 gap-2.5 text-sm font-medium rounded-lg transition-all text-amber-600 hover:text-amber-700 hover:bg-amber-500/10 dark:text-amber-400 dark:hover:text-amber-300 dark:hover:bg-amber-500/10 data-active:bg-amber-500/15 data-active:text-amber-700 data-active:font-semibold dark:data-active:bg-amber-500/20 dark:data-active:text-amber-300 group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:mx-auto"
                  >
                    <DuoIcon 
                      name="award" 
                      className="size-5 shrink-0 text-amber-500 group-data-[active=true]/menu-button:text-amber-600 dark:group-data-[active=true]/menu-button:text-amber-300 transition-colors" 
                    />
                    <span className="truncate flex-1 group-data-[collapsible=icon]:hidden font-semibold">Admin Panel</span>
                    <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold uppercase tracking-wider bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 group-data-[collapsible=icon]:hidden">
                      Admin
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                  tooltip="Toggle theme (Press 'D')"
                  className="h-9 px-2.5 gap-2.5 text-sm font-medium rounded-lg transition-all text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-800/60 cursor-pointer group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:mx-auto"
                >
                  <div className="relative flex items-center justify-center size-5 shrink-0 text-[#3d3d3d] dark:text-neutral-300">
                    <DuoIcon name="sun" className="size-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-[#3d3d3d] dark:text-neutral-300" />
                    <DuoIcon name="moon_stars" className="absolute size-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-[#3d3d3d] dark:text-neutral-300" />
                  </div>
                  <span className="truncate flex-1 group-data-[collapsible=icon]:hidden">
                    {!mounted ? "Toggle Theme" : resolvedTheme === "dark" ? "Light Mode" : "Dark Mode"}
                  </span>
                  <kbd className="hidden sm:inline-flex h-5 items-center justify-center rounded border border-border/70 bg-muted/60 px-1.5 text-[10px] font-mono text-muted-foreground font-semibold shadow-xs group-data-[collapsible=icon]:hidden">
                    D
                  </kbd>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with clean collapsed handling */}
      <SidebarFooter className="p-3 pb-3.5 mb-1 border-t border-border/60 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:mb-0 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center">
        {isPending ? (
          <SidebarMenu className="w-full">
            <SidebarMenuItem className="w-full">
              <div className="w-full flex flex-col gap-2.5 p-3 rounded-xl bg-muted/40 border border-border/50 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:border-none group-data-[collapsible=icon]:items-center">
                <Skeleton className="h-3 w-20 group-data-[collapsible=icon]:hidden" />
                <div className="flex items-center gap-3 w-full group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:justify-center">
                  <Skeleton className="size-9 rounded-full shrink-0" />
                  <div className="flex flex-col gap-1.5 flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <div className="pt-2 border-t border-border/30 w-full group-data-[collapsible=icon]:hidden">
                  <Skeleton className="h-7 w-full rounded-lg" />
                </div>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        ) : user ? (
          <SidebarMenu className="w-full">
            <SidebarMenuItem className="w-full">
              <div className="w-full max-w-full flex flex-col gap-2.5 p-3 rounded-xl bg-muted/40 dark:bg-muted/20 border border-border/70 shadow-2xs group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:border-none group-data-[collapsible=icon]:shadow-none group-data-[collapsible=icon]:items-center overflow-hidden">
                <span className="text-[11px] font-semibold uppercase text-muted-foreground/80 tracking-wider group-data-[collapsible=icon]:hidden">
                  Signed in as
                </span>
                <div
                  className="flex items-center gap-3 min-w-0 w-full group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:justify-center"
                  title={`${user.name || 'User'} (${user.email || ''})`}
                >
                  <UserAvatar image={user.image} name={user.name} email={user.email} />
                  <div className="flex flex-col flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <span className="text-[13.5px] font-semibold text-foreground truncate leading-snug">
                      {user.name || "User"}
                    </span>
                    <span className="text-xs text-muted-foreground truncate leading-normal">
                      {user.email || ""}
                    </span>
                  </div>
                </div>
                <div className="pt-2 border-t border-border/40 w-full flex items-center group-data-[collapsible=icon]:border-none group-data-[collapsible=icon]:pt-1.5 group-data-[collapsible=icon]:justify-center">
                  <button 
                    type="button"
                    onClick={handleSignOut}
                    title="Sign Out"
                    className="w-full flex items-center justify-center gap-2 px-2.5 py-1.5 rounded-lg border border-black/5 dark:border-white/10 bg-background hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-all cursor-pointer shadow-2xs group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:border-none group-data-[collapsible=icon]:bg-transparent"
                  >
                    <SignOut weight="bold" className="size-3.5 shrink-0 transition-colors text-neutral-500 group-hover:text-neutral-900 dark:text-neutral-400 dark:group-hover:text-white" />
                    <span className="truncate group-data-[collapsible=icon]:hidden">Sign Out</span>
                  </button>
                </div>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        ) : (
          <SidebarMenu>
             <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/login" />}
                  tooltip="Sign In"
                  className="h-9 px-2.5 gap-2.5 text-sm font-medium rounded-lg transition-colors hover:bg-accent group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0"
                >
                   <SignOut weight="duotone" className="size-5 shrink-0 text-[#3d3d3d] dark:text-neutral-400" />
                   <span className="truncate">Sign In</span>
                </SidebarMenuButton>
             </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export { AppSidebar as Sidebar };
