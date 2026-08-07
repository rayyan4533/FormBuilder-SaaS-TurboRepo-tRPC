"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { useSignup } from "~/hooks/api/auth";

type SignupFormValues = {
    fullName: string;
    email: string;
    password: string;
};

export function SignupForm({ className, ...props }: React.ComponentProps<"div">) {
    const { createUserWithEmailAndPasswordAsync } = useSignup();
    const router = useRouter();
    const { register, handleSubmit } = useForm<SignupFormValues>({
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
        },
    });

    const onSubmit: SubmitHandler<SignupFormValues> = async (values) => {
        console.log(values);
        const { id } = await createUserWithEmailAndPasswordAsync({
            fullName: values.fullName,
            email: values.email,
            password: values.password,
        });
        router.replace("/dashboard");
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle>Create an account</CardTitle>
                    <CardDescription>Enter your details below to create your account</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
                                <Input
                                    id="fullName"
                                    type="text"
                                    placeholder="John Doe"
                                    required
                                    {...register("fullName", { required: true })}
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    required
                                    {...register("email", { required: true })}
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="password">Password</FieldLabel>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    {...register("password", { required: true })}
                                />
                            </Field>
                            <Field>
                                <Button type="submit">Sign Up</Button>
                                <Button variant="outline" type="button">
                                    Sign up with Google
                                </Button>
                                <FieldDescription className="text-center">
                                    Already have an account?{" "}
                                    <Link href="/login" className="underline underline-offset-4">
                                        Login
                                    </Link>
                                </FieldDescription>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
