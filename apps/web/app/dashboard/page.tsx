"use client";

import Link from "next/link";
import { useListForms } from "~/hooks/api/form";
import { FileText, Plus, Inbox, Layers } from "lucide-react";
import { useUser } from "~/hooks/api/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
export default function Page() {
  const { forms } = useListForms();  //isLoading 
  const router = useRouter();
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return <div className="p-8 text-center">Loading dashboard...</div>;
  }
  if (!user) {
    return null; // Avoid rendering content while redirecting
  }

  return (
    <div className="flex flex-col bg-background min-h-screen text-foreground">
      {/* Simple Header */}
      <header className="flex justify-between items-center bg-card px-6 py-4 border-border border-b">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-primary text-xl">
            <Layers className="w-6 h-6" />
            FormBuilder
          </Link>
          <nav className="flex items-center gap-4 font-medium text-muted-foreground text-sm">
            <Link href="/dashboard" className="font-semibold text-foreground">
              Overview
            </Link>
            <Link href="/dashboard/forms" className="hover:text-foreground transition-colors">
              Forms
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/forms"
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 px-4 py-2 rounded-md font-medium text-primary-foreground text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Manage Forms
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 space-y-8 mx-auto p-6 w-full max-w-6xl">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Dashboard Overview</h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Welcome to your FormBuilder dashboard.
          </p>
        </div>

        {/* Simple Cards */}
        <div className="gap-6 grid grid-cols-1 sm:grid-cols-3">
          <div className="space-y-2 bg-card shadow-sm p-6 border border-border rounded-xl">
            <div className="flex justify-between items-center text-muted-foreground">
              <span className="font-medium text-sm">Total Forms</span>
              <FileText className="w-5 h-5" />
            </div>
            <p className="font-bold text-3xl">{isLoading ? "..." : forms?.length || 0}</p>
          </div>

          <div className="space-y-2 bg-card shadow-sm p-6 border border-border rounded-xl">
            <div className="flex justify-between items-center text-muted-foreground">
              <span className="font-medium text-sm">Quick Actions</span>
              <Plus className="w-5 h-5" />
            </div>
            <div className="pt-1">
              <Link
                href="/dashboard/forms"
                className="font-medium text-primary text-sm hover:underline"
              >
                Create or manage forms &rarr;
              </Link>
            </div>
          </div>

          <div className="space-y-2 bg-card shadow-sm p-6 border border-border rounded-xl">
            <div className="flex justify-between items-center text-muted-foreground">
              <span className="font-medium text-sm">System Status</span>
              <Inbox className="w-5 h-5" />
            </div>
            <p className="font-medium text-emerald-500 text-sm">All systems operational</p>
          </div>
        </div>

        {/* Recent Forms List */}
        <div className="space-y-4 bg-card shadow-sm p-6 border border-border rounded-xl">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-lg">Your Forms</h2>
            <Link href="/dashboard/forms" className="font-medium text-primary text-sm hover:underline">
              View all
            </Link>
          </div>

          {isLoading ? (
            <p className="text-muted-foreground text-sm">Loading forms...</p>
          ) : !forms || forms.length === 0 ? (
            <div className="space-y-2 py-8 text-muted-foreground text-center">
              <p className="font-medium text-sm">No forms created yet.</p>
              <Link
                href="/dashboard/forms"
                className="inline-block bg-primary px-3 py-1.5 rounded-md text-primary-foreground text-xs"
              >
                Create First Form
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {forms.slice(0, 5).map((f: any) => (
                <div key={f.id} className="flex justify-between items-center py-3">
                  <div>
                    <Link
                      href={`/dashboard/forms/${f.id}`}
                      className="font-medium text-sm hover:underline"
                    >
                      {f.title}
                    </Link>
                    <p className="max-w-md text-muted-foreground text-xs truncate">
                      {f.description || "No description"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/forms/${f.id}`}
                      className="hover:bg-accent px-3 py-1 border border-border rounded font-medium text-xs"
                    >
                      Build
                    </Link>
                    <Link
                      href={`/dashboard/forms/${f.id}/submissions`}
                      className="hover:bg-accent px-3 py-1 border border-border rounded font-medium text-xs"
                    >
                      Submissions
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
