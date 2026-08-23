"use client";

import { use, useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { trpc } from "~/trpc/client";
import { useGetForm } from "~/hooks/api/form";

interface PublicFormPageProps {
  params: Promise<{ id: string }>;
}

export default function PublicFormPage({ params }: PublicFormPageProps) {
  const resolvedParams = use(params);
  const formId = resolvedParams.id;

  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { form, isLoading, error } = useGetForm(formId);
  const submitMutation = trpc.form.submitForm.useMutation();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Record<string, string>>();

  const onSubmit = async (data: Record<string, string>) => {
    setSubmitError(null);
    try {
      const formattedValues = Object.entries(data)
        .filter(([_, val]) => val !== undefined && val !== null && val.trim() !== "")
        .map(([fieldId, value]) => ({
          formFieldId: fieldId,
          value,
        }));

      if (formattedValues.length === 0) {
        setSubmitError("Please fill out at least one field before submitting.");
        return;
      }

      await submitMutation.mutateAsync({
        formId,
        values: formattedValues,
      });

      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err?.message || "Failed to submit form. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/20 py-12 px-4 flex justify-center items-center">
        <div className="w-full max-w-xl p-8 rounded-xl border border-border bg-card shadow-sm text-center text-muted-foreground">
          Loading form...
        </div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-muted/20 py-12 px-4 flex justify-center items-center">
        <div className="w-full max-w-md text-center p-8 rounded-xl border border-border bg-card shadow-sm space-y-3">
          <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
          <h2 className="text-xl font-bold">Form Not Found</h2>
          <p className="text-sm text-muted-foreground">
            This form is unavailable or may have been deleted.
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-muted/20 py-12 px-4 flex justify-center items-center">
        <div className="w-full max-w-md text-center p-8 rounded-xl border border-border bg-card shadow-sm space-y-4">
          <CheckCircle className="mx-auto h-12 w-12 text-emerald-500" />
          <h2 className="text-2xl font-bold">Response Submitted!</h2>
          <p className="text-sm text-muted-foreground">
            Thank you for filling out <strong>{form.title}</strong>. Your response has been recorded.
          </p>
          <button
            className="mt-4 px-4 py-2 text-sm font-medium border border-border rounded-md hover:bg-accent transition-colors"
            onClick={() => setSubmitted(false)}
          >
            Submit Another Response
          </button>
        </div>
      </div>
    );
  }

  const fields = form.fields || [];

  return (
    <div className="min-h-screen bg-muted/20 py-12 px-4 flex justify-center items-center">
      <div className="w-full max-w-2xl bg-card border border-border rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-border bg-card space-y-1">
          <h1 className="text-2xl font-bold">{form.title}</h1>
          {form.description && (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap pt-1">
              {form.description}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 space-y-6">
            {submitError && (
              <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {fields.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                This form has no fields to display.
              </p>
            ) : (
              fields.map((field: any) => (
                <div key={field.id} className="space-y-1.5">
                  <label htmlFor={field.id} className="block text-sm font-medium">
                    {field.label}
                    {field.isRequired && <span className="text-destructive ml-1 font-bold">*</span>}
                  </label>

                  {field.description && (
                    <p className="text-xs text-muted-foreground mb-1">{field.description}</p>
                  )}

                  {field.type === "YES_NO" ? (
                    <div className="flex items-center space-x-6 pt-1">
                      <label className="flex items-center space-x-2 text-sm cursor-pointer">
                        <input
                          type="radio"
                          value="Yes"
                          checked={watch(field.id) === "Yes"}
                          onChange={() => setValue(field.id, "Yes")}
                          className="h-4 w-4 text-primary focus:ring-ring"
                        />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center space-x-2 text-sm cursor-pointer">
                        <input
                          type="radio"
                          value="No"
                          checked={watch(field.id) === "No"}
                          onChange={() => setValue(field.id, "No")}
                          className="h-4 w-4 text-primary focus:ring-ring"
                        />
                        <span>No</span>
                      </label>
                    </div>
                  ) : field.type === "NUMBER" ? (
                    <input
                      id={field.id}
                      type="number"
                      placeholder={field.placeholder || ""}
                      {...register(field.id, { required: field.isRequired })}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  ) : field.type === "EMAIL" ? (
                    <input
                      id={field.id}
                      type="email"
                      placeholder={field.placeholder || "email@example.com"}
                      {...register(field.id, { required: field.isRequired })}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  ) : field.type === "PASSWORD" ? (
                    <input
                      id={field.id}
                      type="password"
                      placeholder={field.placeholder || ""}
                      {...register(field.id, { required: field.isRequired })}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  ) : (
                    <input
                      id={field.id}
                      type="text"
                      placeholder={field.placeholder || ""}
                      {...register(field.id, { required: field.isRequired })}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  )}

                  {errors[field.id] && (
                    <p className="text-xs text-destructive mt-1">This field is required</p>
                  )}
                </div>
              ))
            )}
          </div>

          {fields.length > 0 && (
            <div className="p-4 border-t border-border bg-muted/20 flex justify-end">
              <button
                type="submit"
                disabled={submitMutation.isPending}
                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2"
              >
                {submitMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitMutation.isPending ? "Submitting..." : "Submit Form"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
