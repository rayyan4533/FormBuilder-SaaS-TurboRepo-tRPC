"use client";

import Link from "next/link";
import { useListForms } from "~/hooks/api/form";
import { FileText, Plus, Inbox, Layers, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useUser } from "~/hooks/api/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSidebar } from "~/components/dashboard-sidebar";

export default function Page() {
  const { forms } = useListForms();
  const router = useRouter();
  const { user, isLoading } = useUser();
  const { isCollapsed, toggleSidebar } = useSidebar();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div className="p-8 text-center text-yellow-400 font-medium">Loading dark yellow neon dashboard...</div>;
  }
  if (!user) {
    return null;
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-yellow-500/25">
        <div className="flex items-start sm:items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="hidden md:flex p-2 text-zinc-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-xl border border-yellow-500/20 transition-all items-center justify-center shrink-0 mt-0.5 sm:mt-0"
            title={isCollapsed ? "Expand side panel" : "Collapse side panel"}
            aria-label="Toggle side panel"
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-5 h-5" />
            ) : (
              <PanelLeftClose className="w-5 h-5" />
            )}
          </button>
          <div>
            <h1 className="font-black text-2xl md:text-3xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500">
              Dashboard Overview
            </h1>
            <p className="mt-1 text-zinc-400 text-sm">
              Welcome back! Here is an overview of your forms and activity.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/forms"
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 text-zinc-950 px-4.5 py-2.5 rounded-xl font-black text-sm transition-all shadow-lg shadow-yellow-500/25 glow-yellow hover:brightness-110 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Form
        </Link>
      </div>

      {/* Simple Cards */}
      <div className="gap-6 grid grid-cols-1 sm:grid-cols-3">
        <div className="space-y-3 bg-zinc-900/90 backdrop-blur-md shadow-xl p-6 border border-yellow-500/25 rounded-2xl relative overflow-hidden group hover:border-yellow-500/50 transition-all">
          <div className="top-0 right-0 left-0 absolute bg-gradient-to-r from-yellow-400 to-amber-500 h-1" />
          <div className="flex justify-between items-center text-zinc-400">
            <span className="font-bold text-xs uppercase tracking-wider text-yellow-400/80">Total Forms</span>
            <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <p className="font-black text-3xl text-zinc-100">{isLoading ? "..." : forms?.length || 0}</p>
        </div>

        <div className="space-y-3 bg-zinc-900/90 backdrop-blur-md shadow-xl p-6 border border-amber-500/25 rounded-2xl relative overflow-hidden group hover:border-amber-500/50 transition-all">
          <div className="top-0 right-0 left-0 absolute bg-gradient-to-r from-amber-400 to-yellow-500 h-1" />
          <div className="flex justify-between items-center text-zinc-400">
            <span className="font-bold text-xs uppercase tracking-wider text-amber-400/80">Quick Actions</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Plus className="w-5 h-5" />
            </div>
          </div>
          <div className="pt-1">
            <Link
              href="/dashboard/forms"
              className="font-bold text-amber-300 text-sm hover:text-yellow-300 transition-colors flex items-center gap-1"
            >
              Create or manage forms &rarr;
            </Link>
          </div>
        </div>

        <div className="space-y-3 bg-zinc-900/90 backdrop-blur-md shadow-xl p-6 border border-yellow-500/25 rounded-2xl relative overflow-hidden group hover:border-yellow-500/50 transition-all">
          <div className="top-0 right-0 left-0 absolute bg-gradient-to-r from-yellow-400 to-amber-500 h-1" />
          <div className="flex justify-between items-center text-zinc-400">
            <span className="font-bold text-xs uppercase tracking-wider text-yellow-400/80">System Status</span>
            <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
              <Inbox className="w-5 h-5" />
            </div>
          </div>
          <p className="font-bold text-yellow-400 text-sm flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500"></span>
            </span>
            All systems operational
          </p>
        </div>
      </div>

      {/* Recent Forms List */}
      <div className="space-y-4 bg-zinc-900/90 backdrop-blur-md shadow-xl p-6 border border-yellow-500/25 rounded-2xl">
        <div className="flex justify-between items-center pb-3 border-b border-yellow-500/25">
          <h2 className="font-black text-lg text-zinc-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-yellow-400" />
            Your Forms
          </h2>
          <Link href="/dashboard/forms" className="font-bold text-yellow-400 text-xs hover:text-yellow-300 uppercase tracking-wider">
            View all &rarr;
          </Link>
        </div>

        {isLoading ? (
          <p className="text-zinc-400 text-sm">Loading forms...</p>
        ) : !forms || forms.length === 0 ? (
          <div className="space-y-3 py-10 text-zinc-400 text-center">
            <p className="font-medium text-sm">No forms created yet.</p>
            <Link
              href="/dashboard/forms"
              className="inline-block bg-gradient-to-r from-yellow-400 to-amber-500 px-4 py-2 rounded-xl font-bold text-zinc-950 text-xs shadow-md glow-yellow"
            >
              Create First Form
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {forms.slice(0, 5).map((f: any) => (
              <div key={f.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5 hover:bg-yellow-500/5 px-3 rounded-xl transition-colors">
                <div className="min-w-0">
                  <Link
                    href={`/dashboard/forms/${f.id}`}
                    className="font-bold text-sm text-zinc-200 hover:text-yellow-300 transition-colors"
                  >
                    {f.title}
                  </Link>
                  <p className="max-w-md text-zinc-400 text-xs truncate mt-0.5">
                    {f.description || "No description provided"}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/dashboard/forms/${f.id}`}
                    className="hover:bg-yellow-500/20 hover:border-yellow-500/40 px-3 py-1.5 border border-yellow-500/25 rounded-lg font-bold text-xs text-yellow-300 transition-all"
                  >
                    Builder
                  </Link>
                  <Link
                    href={`/dashboard/forms/${f.id}/submissions`}
                    className="hover:bg-amber-500/20 hover:border-amber-500/40 px-3 py-1.5 border border-amber-500/25 rounded-lg font-bold text-xs text-amber-300 transition-all"
                  >
                    Submissions
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
