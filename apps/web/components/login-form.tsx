"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSignIn } from "~/hooks/api/auth";

type LoginFormValues = {
  email: string;
  password: string;
};



export function LoginForm() {
  const router = useRouter();
  const { signInUserWithEmailAndPasswordAsync, isError, error } = useSignIn();

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<LoginFormValues> = async (values) => {
    setFormError(null);
    setSubmitting(true);

    try {
      await signInUserWithEmailAndPasswordAsync({
        email: values.email,
        password: values.password,
      });
      router.replace("/dashboard");
    } catch (err: any) {
      setFormError(err?.message || "Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-card shadow-sm p-6 border rounded-lg w-full max-w-sm text-card-foreground">
      <div className="space-y-1 mb-6">
        <h2 className="font-bold text-xl">Log In</h2>
        <p className="text-muted-foreground text-xs">Welcome back! Enter your credentials</p>
      </div>

      {(formError || isError) && (
        <div className="bg-destructive/10 mb-4 p-2.5 rounded text-destructive text-xs">
          {formError || error?.message || "An error occurred."}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-1">
          <label htmlFor="email" className="block font-medium text-xs">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="name@example.com"
            {...register("email", { required: "Email is required" })}
            className="bg-background px-3 py-1.5 border rounded outline-none focus:ring-1 focus:ring-ring w-full text-sm"
          />
          {errors.email && (
            <p className="text-destructive text-xs">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1">
          <label htmlFor="password" className="block font-medium text-xs">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register("password", { required: "Password is required" })}
            className="bg-background px-3 py-1.5 border rounded outline-none focus:ring-1 focus:ring-ring w-full text-sm"
          />
          {errors.password && (
            <p className="text-destructive text-xs">{errors.password.message}</p>
          )}
        </div>

        {/* Submit Button & Navigation Link */}
        <div className="space-y-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex justify-center items-center bg-primary hover:bg-primary/90 disabled:opacity-50 px-4 py-2 rounded w-full font-medium text-primary-foreground text-sm transition-colors"
          >
            {submitting ? "Logging in..." : "Log In"}
          </button>

          <p className="text-muted-foreground text-xs text-center">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-primary underline underline-offset-4">
              Sign Up
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}