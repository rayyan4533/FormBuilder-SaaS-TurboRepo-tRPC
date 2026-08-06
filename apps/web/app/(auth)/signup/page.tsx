import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";
import { SignupForm } from "~/components/signup-form";

export default function SignupPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted/40 p-6 md:p-10">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex items-center justify-center gap-2">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground shadow">
              <GalleryVerticalEnd className="size-5" />
            </div>
            <span className="text-lg font-semibold">ChaiCode Forms</span>
          </Link>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm sm:p-8">
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
