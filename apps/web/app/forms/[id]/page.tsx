"use client";

import { use, useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Skeleton } from "~/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Label } from "~/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "~/components/ui/card";
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
        <Card className="w-full max-w-xl">
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-muted/20 py-12 px-4 flex justify-center items-center">
        <Card className="w-full max-w-md text-center p-6">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-3" />
          <h2 className="text-xl font-bold text-foreground">Form Not Found</h2>
          <p className="text-sm text-muted-foreground mt-2">
            This form is unavailable or may have been deleted.
          </p>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-muted/20 py-12 px-4 flex justify-center items-center">
        <Card className="w-full max-w-md text-center p-8">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-foreground">Response Submitted!</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Thank you for filling out <strong>{form.title}</strong>. Your response has been recorded.
          </p>
          <Button
            className="mt-6"
            variant="outline"
            onClick={() => {
              setSubmitted(false);
            }}
          >
            Submit Another Response
          </Button>
        </Card>
      </div>
    );
  }

  const fields = form.fields || [];

  return (
    <div className="min-h-screen bg-muted/20 py-12 px-4 flex justify-center items-center">
      <Card className="w-full max-w-2xl shadow-lg border">
        <CardHeader className="border-b bg-card">
          <CardTitle className="text-2xl font-bold">{form.title}</CardTitle>
          {form.description && (
            <CardDescription className="text-sm pt-1 whitespace-pre-wrap">
              {form.description}
            </CardDescription>
          )}
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6 pt-6">
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
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id} className="text-sm font-medium flex items-center gap-1">
                    <span>{field.label}</span>
                    {field.isRequired && <span className="text-destructive font-bold">*</span>}
                  </Label>

                  {field.description && (
                    <p className="text-xs text-muted-foreground">{field.description}</p>
                  )}

                  {field.type === "YES_NO" ? (
                    <RadioGroup
                      onValueChange={(val) => setValue(field.id, val)}
                      value={watch(field.id) || ""}
                      className="flex items-center space-x-6 pt-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Yes" id={`${field.id}-yes`} />
                        <Label htmlFor={`${field.id}-yes`} className="cursor-pointer">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="No" id={`${field.id}-no`} />
                        <Label htmlFor={`${field.id}-no`} className="cursor-pointer">No</Label>
                      </div>
                    </RadioGroup>
                  ) : field.type === "NUMBER" ? (
                    <Input
                      id={field.id}
                      type="number"
                      placeholder={field.placeholder || ""}
                      {...register(field.id, { required: field.isRequired })}
                    />
                  ) : field.type === "EMAIL" ? (
                    <Input
                      id={field.id}
                      type="email"
                      placeholder={field.placeholder || "email@example.com"}
                      {...register(field.id, { required: field.isRequired })}
                    />
                  ) : field.type === "PASSWORD" ? (
                    <Input
                      id={field.id}
                      type="password"
                      placeholder={field.placeholder || ""}
                      {...register(field.id, { required: field.isRequired })}
                    />
                  ) : (
                    <Input
                      id={field.id}
                      type="text"
                      placeholder={field.placeholder || ""}
                      {...register(field.id, { required: field.isRequired })}
                    />
                  )}

                  {errors[field.id] && (
                    <p className="text-xs text-destructive mt-1">This field is required</p>
                  )}
                </div>
              ))
            )}
          </CardContent>

          {fields.length > 0 && (
            <CardFooter className="border-t bg-muted/10 justify-end pt-4">
              <Button type="submit" disabled={submitMutation.isPending}>
                {submitMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Form"
                )}
              </Button>
            </CardFooter>
          )}
        </form>
      </Card>
    </div>
  );
}
