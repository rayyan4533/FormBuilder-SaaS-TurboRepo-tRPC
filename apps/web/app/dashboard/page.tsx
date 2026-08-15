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
    <div className="p-6 md:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="font-bold text-2xl md:text-3xl tracking-tight">Dashboard Overview</h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Welcome back! Here is an overview of your forms and activity.
          </p>
        </div>
        <Link
          href="/dashboard/forms"
          className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Form
        </Link>
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
    </div>
  );
}


