"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Loader2, FileText, AlertCircle } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
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
      // Error handles automatically via mutationError state
    }
  };


  return (
    <div className="container mx-auto max-w-6xl py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Forms</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create, manage, and view responses for all your form builder forms.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Form
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create a New Form</DialogTitle>
              <DialogDescription>
                Provide a title and optional description for your new form.
              </DialogDescription>
            </DialogHeader>

            {isError && (
              <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{mutationError?.message || "Failed to create form. Please try again."}</span>
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Title <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Customer Feedback Survey"
                          maxLength={55}
                          {...field}
                        />
                      </FormControl>
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <FormMessage />
                        <span>{field.value?.length || 0}/55</span>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief description of the form's purpose..."
                          className="resize-none rows-3"
                          maxLength={300}
                          {...field}
                        />
                      </FormControl>
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <FormMessage />
                        <span>{field.value?.length || 0}/300</span>
                      </div>
                    </FormItem>
                  )}
                />

                <DialogFooter className="pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    disabled={isPending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Form"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Table */}
      <div className="rounded-md border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">Title</TableHead>
              <TableHead className="w-[45%]">Description</TableHead>
              <TableHead className="w-[15%]">Created At</TableHead>
              <TableHead className="w-[10%] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-5 w-3/4" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-5/6" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-8 ml-auto rounded-md" />
                  </TableCell>
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-destructive">
                  Failed to load forms. Please try refreshing the page.
                </TableCell>
              </TableRow>
            ) : forms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <FileText className="h-8 w-8 mb-2 stroke-1" />
                    <p className="text-base font-medium">No forms yet.</p>
                    <p className="text-xs mt-1">Click "Create Form" above to build your first form.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              forms.map((formItem: any) => (
                <TableRow key={formItem.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium text-foreground">
                    <Link
                      href={`/dashboard/forms/${formItem.id}`}
                      className="hover:underline focus:outline-none"
                    >
                      {formItem.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground truncate max-w-xs">
                    {formItem.description || "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formItem.createdAt
                      ? format(new Date(formItem.createdAt), "MMM d, yyyy")
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      title="Edit Form"
                    >
                      <Link href={`/dashboard/forms/${formItem.id}`}>
                        <Pencil className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        <span className="sr-only">Edit {formItem.title}</span>
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
