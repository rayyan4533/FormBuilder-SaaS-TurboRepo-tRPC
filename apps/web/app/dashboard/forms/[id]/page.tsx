"use client";

import { use, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Eye,
  Inbox,
  Loader2,
  Layers,
  X,
} from "lucide-react";

import {
  useGetForm,
  useCreateField,
  useDeleteField,
} from "~/hooks/api/form";

interface FormDetailsPageProps {
  params: Promise<{ id: string }>;
}

const createFieldSchema = z.object({
  label: z.string().min(1, "Label is required").max(100),
  type: z.enum(["TEXT", "NUMBER", "EMAIL", "YES_NO", "PASSWORD"]),
  description: z.string().optional(),
  placeholder: z.string().optional(),
  isRequired: z.boolean().default(false),
});

type CreateFieldValues = z.infer<typeof createFieldSchema>;

export default function FormDetailsPage({ params }: FormDetailsPageProps) {
  const resolvedParams = use(params);
  const formId = resolvedParams.id;

  const [dialogOpen, setDialogOpen] = useState(false);
  const { form, isLoading, error } = useGetForm(formId);
  const { createFieldAsync, isPending: isCreatingField } = useCreateField();
  const { deleteFieldAsync, isPending: isDeletingField } = useDeleteField();

  const fieldForm = useForm<CreateFieldValues>({
    resolver: zodResolver(createFieldSchema) as any,
    defaultValues: {
      label: "",
      type: "TEXT",
      description: "",
      placeholder: "",
      isRequired: false,
    },
  });

  const handleCreateField = async (values: CreateFieldValues) => {
    try {
      await createFieldAsync({
        formId,
        label: values.label,
        type: values.type,
        description: values.description || undefined,
        placeholder: values.placeholder || undefined,
        isRequired: values.isRequired,
      });
      fieldForm.reset();
      setDialogOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteField = async (fieldId: string) => {
    if (confirm("Are you sure you want to delete this field?")) {
      await deleteFieldAsync({ fieldId });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8 flex justify-center items-center text-muted-foreground">
        Loading form details...
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-background p-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-destructive">Form not found</h2>
        <p className="text-sm text-muted-foreground">
          The requested form does not exist or failed to load.
        </p>
        <Link
          href="/dashboard/forms"
          className="inline-block px-4 py-2 text-sm font-medium border border-border rounded-md hover:bg-accent"
        >
          Back to Forms
        </Link>
      </div>
    );
  }

  const fields = form.fields || [];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/forms"
            className="p-2 rounded-md border border-border hover:bg-accent text-muted-foreground hover:text-foreground"
            title="Back to Forms"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold">{form.title}</h1>
            <p className="text-xs text-muted-foreground">
              Created {form.createdAt ? format(new Date(form.createdAt), "MMM d, yyyy") : "—"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/forms/${formId}/submissions`}
            className="px-3 py-1.5 text-xs font-medium border border-border rounded-md hover:bg-accent flex items-center gap-1.5"
          >
            <Inbox className="h-3.5 w-3.5" />
            Submissions
          </Link>
          <Link
            href={`/forms/${formId}`}
            target="_blank"
            className="px-3 py-1.5 text-xs font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 flex items-center gap-1.5"
          >
            <Eye className="h-3.5 w-3.5" />
            Preview
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 space-y-6">
        {/* Form Description */}
        {form.description && (
          <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-1">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Description
            </h3>
            <p className="text-sm whitespace-pre-wrap">{form.description}</p>
          </div>
        )}

        {/* Section Header & Add Field Button */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <h2 className="text-lg font-semibold">Form Fields</h2>
            <p className="text-xs text-muted-foreground">
              Configure input fields for this form schema.
            </p>
          </div>

          <button
            onClick={() => setDialogOpen(true)}
            className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Field
          </button>
        </div>

        {/* Modal Dialog for Add Field */}
        {dialogOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-card text-card-foreground border border-border w-full max-w-md rounded-xl p-6 shadow-xl relative space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Add Form Field</h3>
                <button
                  onClick={() => setDialogOpen(false)}
                  className="p-1 rounded hover:bg-accent text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form
                onSubmit={fieldForm.handleSubmit(handleCreateField)}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Field Label <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Work Email Address"
                    {...fieldForm.register("label")}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  {fieldForm.formState.errors.label && (
                    <p className="text-xs text-destructive mt-1">
                      {fieldForm.formState.errors.label.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Field Type</label>
                  <select
                    {...fieldForm.register("type")}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="TEXT">Short Text</option>
                    <option value="NUMBER">Number</option>
                    <option value="EMAIL">Email</option>
                    <option value="YES_NO">Yes / No</option>
                    <option value="PASSWORD">Password</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Placeholder (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. john@example.com"
                    {...fieldForm.register("placeholder")}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Help Text (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. We will never share your email"
                    {...fieldForm.register("description")}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isRequired"
                    {...fieldForm.register("isRequired")}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
                  />
                  <label htmlFor="isRequired" className="text-sm font-medium cursor-pointer">
                    Mark field as required
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setDialogOpen(false)}
                    disabled={isCreatingField}
                    className="px-4 py-2 text-sm font-medium border border-border rounded-md hover:bg-accent"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingField}
                    className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2"
                  >
                    {isCreatingField && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isCreatingField ? "Adding..." : "Add Field"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Fields List */}
        <div className="space-y-3">
          {fields.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground space-y-2">
              <Layers className="mx-auto h-8 w-8 opacity-50" />
              <p className="text-sm font-medium">No fields added yet.</p>
              <p className="text-xs">Click "Add Field" to start building your form schema.</p>
            </div>
          ) : (
            fields.map((fieldItem: any) => (
              <div
                key={fieldItem.id}
                className="flex items-center justify-between p-4 rounded-xl border border-border bg-card shadow-sm hover:border-border/80 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{fieldItem.label}</span>
                    {fieldItem.isRequired && (
                      <span className="text-[10px] bg-destructive/10 text-destructive font-bold px-1.5 py-0.5 rounded">
                        Required
                      </span>
                    )}
                    <span className="text-[10px] border border-border uppercase px-1.5 py-0.5 rounded text-muted-foreground">
                      {fieldItem.type}
                    </span>
                  </div>

                  {fieldItem.description && (
                    <p className="text-xs text-muted-foreground">{fieldItem.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-0.5">
                    <span>
                      Key: <code className="bg-muted px-1 py-0.5 rounded">{fieldItem.labelKey}</code>
                    </span>
                    {fieldItem.placeholder && <span>Placeholder: "{fieldItem.placeholder}"</span>}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteField(fieldItem.id)}
                  disabled={isDeletingField}
                  title="Delete Field"
                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
