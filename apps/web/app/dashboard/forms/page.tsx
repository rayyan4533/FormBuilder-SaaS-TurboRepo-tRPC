"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Loader2, FileText, AlertCircle, ArrowLeft, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCreateForm, useListForms } from "~/hooks/api/form";

const createFormSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(55, "Title cannot exceed 55 characters"),
  description: z
    .string()
    .max(300, "Description cannot exceed 300 characters")
    .optional(),
});

type CreateFormValues = z.infer<typeof createFormSchema>;

export default function FormsDashboardPage() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { forms, isLoading, error } = useListForms();
  const { createFormAsync, isPending, isError, error: mutationError } = useCreateForm();

  const form = useForm<CreateFormValues>({
    resolver: zodResolver(createFormSchema) as any,
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const onSubmit = async (values: CreateFormValues) => {
    try {
      const result = await createFormAsync({
        title: values.title,
        description: values.description || undefined,
      });
      form.reset();
      setOpen(false);
      if (result?.id) {
        router.push(`/dashboard/forms/${result.id}`);
      }
    } catch (err) {
      // Error handled via mutationError
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Forms</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage, edit, and create your custom forms
          </p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Create Form
        </button>
      </div>
        {/* Create Form Modal Dialog */}
        {open && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-card text-card-foreground border border-border w-full max-w-md rounded-xl p-6 shadow-xl relative space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Create New Form</h2>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 rounded hover:bg-accent text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {isError && (
                <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{mutationError?.message || "Failed to create form."}</span>
                </div>
              )}

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Title <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Customer Feedback Survey"
                    maxLength={55}
                    {...form.register("title")}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  {form.formState.errors.title && (
                    <p className="text-xs text-destructive mt-1">
                      {form.formState.errors.title.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    placeholder="Brief description of the form's purpose..."
                    rows={3}
                    maxLength={300}
                    {...form.register("description")}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                  {form.formState.errors.description && (
                    <p className="text-xs text-destructive mt-1">
                      {form.formState.errors.description.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    disabled={isPending}
                    className="px-4 py-2 text-sm font-medium border border-border rounded-md hover:bg-accent"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2"
                  >
                    {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isPending ? "Creating..." : "Create Form"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Table / List */}
        <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground">
                <th className="p-4 font-semibold w-[30%]">Title</th>
                <th className="p-4 font-semibold w-[45%]">Description</th>
                <th className="p-4 font-semibold w-[15%]">Created At</th>
                <th className="p-4 font-semibold w-[10%] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">
                    Loading forms...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-destructive">
                    Failed to load forms.
                  </td>
                </tr>
              ) : forms.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-muted-foreground">
                    <FileText className="mx-auto h-8 w-8 mb-2 opacity-50" />
                    <p className="font-medium text-base">No forms yet</p>
                    <p className="text-xs mt-1">Click "Create Form" above to get started.</p>
                  </td>
                </tr>
              ) : (
                forms.map((formItem: any) => (
                  <tr key={formItem.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-medium">
                      <Link
                        href={`/dashboard/forms/${formItem.id}`}
                        className="hover:underline text-primary"
                      >
                        {formItem.title}
                      </Link>
                    </td>
                    <td className="p-4 text-muted-foreground truncate max-w-xs">
                      {formItem.description || "—"}
                    </td>
                    <td className="p-4 text-muted-foreground text-xs">
                      {formItem.createdAt
                        ? format(new Date(formItem.createdAt), "MMM d, yyyy")
                        : "—"}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/dashboard/forms/${formItem.id}`}
                        className="p-2 inline-flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"
                        title="Edit Form"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
    </div>
  );
}

