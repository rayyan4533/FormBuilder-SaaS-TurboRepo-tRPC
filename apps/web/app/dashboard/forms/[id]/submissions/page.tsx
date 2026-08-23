"use client";

import { use } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, Inbox, RefreshCw } from "lucide-react";

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

  const sortedFields = [...fields].sort((a: any, b: any) => {
    const idxA = parseFloat(a.index || "0");
    const idxB = parseFloat(b.index || "0");
    return idxA - idxB;
  });

  return (
    <div className="flex flex-col bg-background min-h-screen text-foreground">
      {/* Header */}
      <header className="flex sm:flex-row flex-col justify-between sm:items-center gap-4 bg-card px-6 py-4 border-border border-b">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/forms/${formId}`}
            className="hover:bg-accent p-2 border border-border rounded-md text-muted-foreground hover:text-foreground"
            title="Back to Form Builder"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-bold text-xl">Submissions</h1>
            <p className="text-muted-foreground text-xs">
              {isLoadingForm ? "Loading..." : form?.title || "Form Responses"}
            </p>
          </div>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isLoadingSubmissions}
          className="flex items-center self-start sm:self-auto gap-2 hover:bg-accent px-3 py-1.5 border border-border rounded-md font-medium text-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoadingSubmissions ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 mx-auto p-6 w-full max-w-7xl">
        <div className="bg-card shadow-sm border border-border rounded-xl overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-muted/40 border-border border-b text-muted-foreground">
                <th className="p-4 min-w-[160px] font-semibold whitespace-nowrap">
                  Submitted At
                </th>

                {isLoadingFields ? (
                  <th className="p-4 font-semibold">Loading fields...</th>
                ) : (
                  sortedFields.map((field: any) => (
                    <th key={field.id} className="p-4 min-w-[150px] font-semibold">
                      <div className="flex items-center gap-1 max-w-[200px] truncate" title={field.label}>
                        <span>{field.label}</span>
                        {field.isRequired && <span className="font-bold text-destructive">*</span>}
                      </div>
                    </th>
                  ))
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={Math.max(sortedFields.length + 1, 2)} className="p-8 text-muted-foreground text-center">
                    Loading submissions...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={Math.max(sortedFields.length + 1, 2)}
                    className="p-8 text-destructive text-center"
                  >
                    Failed to load submissions. Please try refreshing.
                  </td>
                </tr>
              ) : submissions.length === 0 ? (
                <tr>
                  <td
                    colSpan={Math.max(sortedFields.length + 1, 2)}
                    className="p-12 text-muted-foreground text-center"
                  >
                    <Inbox className="opacity-50 mx-auto mb-2 w-8 h-8" />
                    <p className="font-medium text-base">No submissions yet</p>
                    <p className="mt-1 text-xs">Share your form to start collecting responses.</p>
                  </td>
                </tr>
              ) : (
                submissions.map((submission: any) => {
                  const valuesList = (submission.values as Array<{ formFieldId: string; value: string }>) || [];

                  return (
                    <tr key={submission.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-medium text-muted-foreground text-xs whitespace-nowrap">
                        {submission.createdAt
                          ? format(new Date(submission.createdAt), "MMM d, yyyy HH:mm")
                          : "—"}
                      </td>

                      {sortedFields.map((field: any) => {
                        const answerObj = valuesList.find((v) => v.formFieldId === field.id);
                        const answerValue = answerObj?.value?.trim();

                        return (
                          <td key={field.id} className="p-4 max-w-[250px] text-sm truncate">
                            {answerValue ? (
                              <span>{answerValue}</span>
                            ) : (
                              <span className="text-muted-foreground/50 select-none">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
