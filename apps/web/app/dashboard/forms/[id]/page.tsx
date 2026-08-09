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
  CheckCircle2,
  FileText,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Checkbox } from "~/components/ui/checkbox";
import { Skeleton } from "~/components/ui/skeleton";
import { Badge } from "~/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
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
      <div className="container mx-auto max-w-5xl py-8 px-4 sm:px-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-32 w-full rounded-md" />
        <Skeleton className="h-64 w-full rounded-md" />
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="container mx-auto max-w-5xl py-12 px-4 text-center">
        <h2 className="text-xl font-semibold text-destructive">Form not found</h2>
        <p className="text-sm text-muted-foreground mt-2">
          The requested form does not exist or failed to load.
        </p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/dashboard/forms">Back to Forms</Link>
        </Button>
      </div>
    );
  }

  const fields = form.fields || [];

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" asChild title="Back to Forms">
            <Link href="/dashboard/forms">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {form.title}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Created {form.createdAt ? format(new Date(form.createdAt), "MMM d, yyyy") : "—"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" asChild className="gap-2">
            <Link href={`/dashboard/forms/${formId}/submissions`}>
              <Inbox className="h-4 w-4" />
              Submissions
            </Link>
          </Button>
          <Button variant="secondary" size="sm" asChild className="gap-2">
            <Link href={`/forms/${formId}`} target="_blank">
              <Eye className="h-4 w-4" />
              Preview
            </Link>
          </Button>
        </div>
      </div>

      {/* Form Description Card */}
      {form.description && (
        <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Description
          </h3>
          <p className="text-sm text-foreground whitespace-pre-wrap">{form.description}</p>
        </div>
      )}

      {/* Fields Section Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Form Fields</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure input fields collected by this form.
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Field
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Form Field</DialogTitle>
              <DialogDescription>
                Define label, input type, and constraints for this field.
              </DialogDescription>
            </DialogHeader>

            <Form {...fieldForm}>
              <form
                onSubmit={fieldForm.handleSubmit(handleCreateField)}
                className="space-y-4 pt-2"
              >
                <FormField
                  control={fieldForm.control}
                  name="label"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Field Label <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Work Email Address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={fieldForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Field Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="TEXT">Short Text</SelectItem>
                          <SelectItem value="NUMBER">Number</SelectItem>
                          <SelectItem value="EMAIL">Email</SelectItem>
                          <SelectItem value="YES_NO">Yes / No</SelectItem>
                          <SelectItem value="PASSWORD">Password</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={fieldForm.control}
                  name="placeholder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Placeholder (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={fieldForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Help Text (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. We will never share your email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={fieldForm.control}
                  name="isRequired"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0 rounded-md border p-3">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="cursor-pointer">
                          Mark field as required
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <DialogFooter className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    disabled={isCreatingField}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreatingField}>
                    {isCreatingField ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Field"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Field List Container */}
      <div className="space-y-3">
        {fields.length === 0 ? (
          <div className="rounded-lg border bg-card p-12 text-center text-muted-foreground">
            <Layers className="mx-auto h-10 w-10 mb-3 stroke-1" />
            <p className="text-base font-medium">No fields added yet.</p>
            <p className="text-xs mt-1">
              Click "Add Field" to start building your form schema.
            </p>
          </div>
        ) : (
          fields.map((fieldItem: any) => (
            <div
              key={fieldItem.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-card shadow-sm hover:border-muted-foreground/30 transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">
                    {fieldItem.label}
                  </span>
                  {fieldItem.isRequired && (
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0.5">
                      Required
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-[10px] uppercase">
                    {fieldItem.type}
                  </Badge>
                </div>

                {fieldItem.description && (
                  <p className="text-xs text-muted-foreground">{fieldItem.description}</p>
                )}

                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                  <span>Key: <code className="bg-muted px-1 py-0.5 rounded">{fieldItem.labelKey}</code></span>
                  {fieldItem.placeholder && (
                    <span>Placeholder: "{fieldItem.placeholder}"</span>
                  )}
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteField(fieldItem.id)}
                disabled={isDeletingField}
                title="Delete Field"
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
