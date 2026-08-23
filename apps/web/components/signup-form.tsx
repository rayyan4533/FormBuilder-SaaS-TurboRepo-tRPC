"use client";

import { useState } from "react";
import { Form, SubmitHandler, useForm, } from "react-hook-form";
import { useSignup } from "~/hooks/api/auth";

import { useRouter } from "next/navigation";
import Link from "next/link";

import { cn } from "~/lib/utils";


type SignupFormValues = {
    fullName: string;
    email: string;
    password: string;
};

export function SignUpForm() {
    const router = useRouter();
    const { createUserWithEmailAndPasswordAsync, isError, error } = useSignup();
    const [submitting, setSubmitting] = useState(false)
    const [formError, setFormError] = useState<string | null>(null)


    //#region open REACT-HOOK-FORM
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignupFormValues>({
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
        },
    });
    //#endregion

    //ONSUBMIT HANDLER REACT-HOOK FORM CUSTOM
    const onSubmit: SubmitHandler<SignupFormValues> = async (values) => {
        setFormError(null)
        setSubmitting(true)

        try {
            await createUserWithEmailAndPasswordAsync({
                fullName: values.fullName,
                email: values.email,
                password: values.password
            });
            router.replace("/dashboard");
        } catch (error: any) {
            setFormError(error?.message || "Failed to create account. Please try again.");
        }
        finally {
            setSubmitting(false);
        }
    }

    return (
        <section className="flex flex-col justify-center items-center mx-auto" >
            {/* heading */}
            < div >
                <h1>welcom to Formura</h1>
            </div >
            {/* Global Error Banner */}
            {(formError) && (
                <div className="bg-destructive/10 mb-4 p-2.5 rounded text-destructive text-xs">
                    {formError || "An error occurred."}
                </div>
            )}

            {/* 2 container of form and image */}
            < main className="flex justify-center items-center mx-auto" >
                {/* Form side */}

                <form onSubmit={handleSubmit(onSubmit)}>

                    <div className="space-y-1">
                        <label htmlFor="fullName" className="block font-medium text-xs">
                            Full Name
                        </label>
                        <input
                            id="fullName"
                            type="text"
                            placeholder="John Doe"
                            {...register("fullName", { required: "Full name is required" })}
                            className="bg-background px-3 py-1.5 border rounded outline-none focus:ring-1 focus:ring-ring w-full text-sm"
                        />
                        {errors.fullName && (
                            <p className="text-destructive text-xs">{errors.fullName.message}</p>
                        )}
                    </div>

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
                    {/* signup btns */}
                    <div className="space-y-3 pt-2">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex justify-center items-center bg-primary hover:bg-primary/90 disabled:opacity-50 px-4 py-2 rounded w-full font-medium text-primary-foreground text-sm transition-colors"
                        >
                            {submitting ? "Creating account..." : "Sign Up"}
                        </button>

                        <p className="text-muted-foreground text-xs text-center">
                            Already have an account?{" "}
                            <Link href="/login" className="font-medium text-primary underline underline-offset-4">
                                Login
                            </Link>
                        </p>
                    </div>
                </form>


                {/* image*/}
                <div>
                </div >
            </main >



        </section >


    )
}