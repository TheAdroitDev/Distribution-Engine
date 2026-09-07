import { redirect } from "next/navigation";
import Link from "next/link";
import { getCachedSession, isAdminEmail } from "@/lib/auth/session";
import { getAdminDashboardData } from "@/features/admin/data/get-admin-data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DuoIcon } from "@/components/ui/duo-icon";
import { formatDistanceToNow, format } from "date-fns";
import { 
  Users, 
  FileText, 
  Target, 
  Layers, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  Activity, 
  ArrowUpRight,
  Database,
  Calendar,
  Sparkles
} from "lucide-react";

export const metadata = {
  title: "Admin Panel | Distribution Engine",
  description: "Executive control panel and system analytics",
};

export default async function AdminPage() {
  const session = await getCachedSession();

  if (!session?.user?.email) {
    redirect("/login");
  }

  // Strict authorization check: Only the configured ADMIN_EMAIL in .env is granted access
  if (!isAdminEmail(session.user.email)) {
    redirect("/dashboard");
  }

  const { stats, users, recentSources, recentQueue } = await getAdminDashboardData();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="size-3.5" />
              Executive Access
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              {session.user.email}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Platform Administration
          </h1>
          <p className="text-sm text-muted-foreground">
            Global system analytics, registered developers, content ingestion stats, and execution pipeline throughput.
          </p>
        </div>

        {/* Live status badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-black/5 dark:border-white/[0.07] bg-muted/40 text-xs font-medium text-foreground/90">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Database Operational</span>
          </div>
        </div>
      </div>

      {/* Top Hero KPI Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Users */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 flex flex-col justify-between shadow-xs hover:border-border transition-colors">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Total Users</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
              <Users className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black tracking-tight text-foreground">
              {stats.totalUsers}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Registered accounts</p>
          </div>
        </div>

        {/* Content Sources */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 flex flex-col justify-between shadow-xs hover:border-border transition-colors">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Sources</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <FileText className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black tracking-tight text-foreground">
              {stats.totalContentSources}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Ingested essays &amp; docs</p>
          </div>
        </div>

        {/* Distribution Plans */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 flex flex-col justify-between shadow-xs hover:border-border transition-colors">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Campaign Plans</span>
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
              <Target className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black tracking-tight text-foreground">
              {stats.totalPlans}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Architected plans</p>
          </div>
        </div>

        {/* Generated Strategies */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 flex flex-col justify-between shadow-xs hover:border-border transition-colors">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Strategies</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500">
              <Sparkles className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black tracking-tight text-foreground">
              {stats.totalStrategies}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {stats.acceptedStrategies} approved
            </p>
          </div>
        </div>

        {/* Ready Assets */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 flex flex-col justify-between shadow-xs hover:border-border transition-colors">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Assets</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-500">
              <Layers className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black tracking-tight text-foreground">
              {stats.totalAssets}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Polished outputs</p>
          </div>
        </div>

        {/* Live Queue Items */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 flex flex-col justify-between shadow-xs hover:border-border transition-colors">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Queue Dispatches</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <Send className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black tracking-tight text-foreground">
              {stats.totalQueueItems}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {stats.completedQueueItems} completed
            </p>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (8 cols): Registered Users Directory */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Users className="size-4" />
              </div>
              <h2 className="text-lg font-bold text-foreground">Registered Users</h2>
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              Showing recent {users.length} users
            </span>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 border-b border-border/60 text-muted-foreground font-semibold">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Sources</th>
                    <th className="py-3 px-4">Plans</th>
                    <th className="py-3 px-4">Assets</th>
                    <th className="py-3 px-4">Joined</th>
                    <th className="py-3 px-4 text-right">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {users.map((u) => {
                    const isSuperAdmin = isAdminEmail(u.email);
                    return (
                      <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5 min-w-[180px]">
                            <div className="size-8 rounded-full bg-muted flex items-center justify-center font-bold text-xs text-foreground uppercase shrink-0 border border-border">
                              {u.name ? u.name[0] : "U"}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-foreground truncate">{u.name}</p>
                              <p className="text-[11px] text-muted-foreground truncate">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-medium">
                          {u.sourcesCount}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-medium">
                          {u.plansCount}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-medium">
                          {u.assetsCount}
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground whitespace-nowrap">
                          {format(new Date(u.createdAt), "MMM d, yyyy")}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {isSuperAdmin ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                              Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground border border-border">
                              User
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">
                        No registered users found in the database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Real-Time Ingestion & Queue Activity */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Recent Content Sources */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                <FileText className="size-4" />
              </div>
              <h2 className="text-sm font-bold text-foreground">Recent Ingested Content</h2>
            </div>

            <div className="rounded-2xl border border-border/80 bg-card p-3.5 space-y-2 shadow-xs">
              {recentSources.map((source) => (
                <div 
                  key={source.id} 
                  className="p-2.5 rounded-xl bg-muted/30 border border-border/40 hover:border-border transition-colors space-y-1"
                >
                  <p className="text-xs font-semibold text-foreground line-clamp-1">
                    {source.title}
                  </p>
                  <div className="flex items-center justify-between text-[10.5px] text-muted-foreground">
                    <span className="truncate max-w-[120px]">{source.userName || source.userEmail || "Anonymous"}</span>
                    <span>{formatDistanceToNow(new Date(source.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
              ))}
              {recentSources.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No content sources ingested yet.
                </p>
              )}
            </div>
          </div>

          {/* Recent Queue Dispatches */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
                <Send className="size-4" />
              </div>
              <h2 className="text-sm font-bold text-foreground">Recent Queue Dispatches</h2>
            </div>

            <div className="rounded-2xl border border-border/80 bg-card p-3.5 space-y-2 shadow-xs">
              {recentQueue.map((item) => (
                <div 
                  key={item.id} 
                  className="p-2.5 rounded-xl bg-muted/30 border border-border/40 hover:border-border transition-colors space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground line-clamp-1">
                      {item.title || "Execution Asset"}
                    </span>
                    <Badge variant="outline" className="text-[9.5px] px-1.5 py-0 capitalize">
                      {item.status?.toLowerCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-[10.5px] text-muted-foreground">
                    <span className="truncate max-w-[120px]">{item.userName || item.userEmail || "Anonymous"}</span>
                    <span>{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
              ))}
              {recentQueue.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No queue items dispatched yet.
                </p>
              )}
            </div>
          </div>

          {/* Quick Access to App Routes */}
          <div className="p-4 rounded-2xl border border-border/80 bg-muted/30 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <Database className="size-4 text-primary" />
              <span>Direct Dashboard Jump</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link 
                href="/content" 
                className="p-2 rounded-lg bg-card border border-border/60 hover:border-border text-foreground font-medium flex items-center justify-between transition-colors"
              >
                <span>Content</span>
                <ArrowUpRight className="size-3 text-muted-foreground" />
              </Link>
              <Link 
                href="/plans" 
                className="p-2 rounded-lg bg-card border border-border/60 hover:border-border text-foreground font-medium flex items-center justify-between transition-colors"
              >
                <span>Plans</span>
                <ArrowUpRight className="size-3 text-muted-foreground" />
              </Link>
              <Link 
                href="/queue" 
                className="p-2 rounded-lg bg-card border border-border/60 hover:border-border text-foreground font-medium flex items-center justify-between transition-colors"
              >
                <span>Queue</span>
                <ArrowUpRight className="size-3 text-muted-foreground" />
              </Link>
              <Link 
                href="/settings" 
                className="p-2 rounded-lg bg-card border border-border/60 hover:border-border text-foreground font-medium flex items-center justify-between transition-colors"
              >
                <span>Settings</span>
                <ArrowUpRight className="size-3 text-muted-foreground" />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
