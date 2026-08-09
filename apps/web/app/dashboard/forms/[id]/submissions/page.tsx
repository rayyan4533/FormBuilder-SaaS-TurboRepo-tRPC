"use client";

import { use } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, Inbox, RefreshCw } from "lucide-react";

import { Button } from "~/components/ui/button";
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
  useGetForm,
  useGetFields,
  useGetFormSubmissions,
} from "~/hooks/api/form";

interface SubmissionsPageProps {
  params: Promise<{ id: string }>;
}

export default function FormSubmissionsPage({ params }: SubmissionsPageProps) {
  const resolvedParams = use(params);
  const formId = resolvedParams.id;

  const { form, isLoading: isLoadingForm } = useGetForm(formId);
  const { fields, isLoading: isLoadingFields } = useGetFields(formId);
  const {
    submissions,
    isLoading: isLoadingSubmissions,
    error,
    refetch,
  } = useGetFormSubmissions(formId);

  const isLoading = isLoadingForm || isLoadingFields || isLoadingSubmissions;

  // Sort fields by fractional index ascending
  const sortedFields = [...fields].sort((a: any, b: any) => {
    const idxA = parseFloat(a.index || "0");
    const idxB = parseFloat(b.index || "0");
    return idxA - idxB;
  });

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" asChild title="Back to Form Builder">
            <Link href={`/dashboard/forms/${formId}`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Submissions
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isLoadingForm ? (
                <Skeleton className="h-4 w-40 inline-block" />
              ) : (
                form?.title || "Form Responses"
              )}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoadingSubmissions}
          className="self-start sm:self-auto flex items-center gap-2"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoadingSubmissions ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Submissions Table Container */}
      <div className="rounded-md border bg-card shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-[180px] min-w-[160px] font-semibold whitespace-nowrap">
                Submitted At
              </TableHead>

              {isLoadingFields ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableHead key={i} className="min-w-[150px]">
                    <Skeleton className="h-4 w-24" />
                  </TableHead>
                ))
              ) : (
                sortedFields.map((field: any) => (
                  <TableHead key={field.id} className="min-w-[150px] font-semibold">
                    <div className="flex items-center gap-1 truncate max-w-[200px]" title={field.label}>
                      <span>{field.label}</span>
                      {field.isRequired && (
                        <span className="text-destructive font-bold" title="Required field">
                          *
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  {Array.from({ length: Math.max(sortedFields.length, 3) }).map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={Math.max(sortedFields.length + 1, 2)}
                  className="h-32 text-center text-destructive"
                >
                  Failed to load submissions. Please try refreshing.
                </TableCell>
              </TableRow>
            ) : submissions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={Math.max(sortedFields.length + 1, 2)}
                  className="h-40 text-center"
                >
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Inbox className="h-8 w-8 mb-2 stroke-1" />
                    <p className="text-base font-medium">No submissions yet.</p>
                    <p className="text-xs mt-1">
                      Share your form to start collecting responses.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              submissions.map((submission: any) => {
                const valuesList = (submission.values as Array<{ formFieldId: string; value: string }>) || [];

                return (
                  <TableRow key={submission.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                      {submission.createdAt
                        ? format(new Date(submission.createdAt), "MMM d, yyyy HH:mm")
                        : "—"}
                    </TableCell>

                    {sortedFields.map((field: any) => {
                      const answerObj = valuesList.find(
                        (v) => v.formFieldId === field.id
                      );
                      const answerValue = answerObj?.value?.trim();

                      return (
                        <TableCell key={field.id} className="text-sm text-foreground max-w-[250px] truncate">
                          {answerValue ? (
                            <span>{answerValue}</span>
                          ) : (
                            <span className="text-muted-foreground/60 select-none">—</span>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
