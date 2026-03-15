import { SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "~/components/ui/button";
import { LogIn } from "lucide-react";

export default async function SignInPage() {
  const session = await auth();
  if (session.userId) {
    return redirect("/drive");
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center text-center">
      <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-gray-800/50 shadow-inner ring-1 ring-gray-700/50">
        <LogIn className="h-12 w-12 text-gray-400" />
      </div>
      <h1 className="mb-3 bg-linear-to-r from-gray-200 to-gray-400 bg-clip-text text-3xl font-bold text-transparent">
        Welcome back
      </h1>
      <p className="mb-8 text-gray-400">
        Sign in to your account to continue to t-drive.
      </p>
      <SignInButton forceRedirectUrl={"/drive"}>
        <Button className="cursor-pointer rounded-lg border border-gray-700 bg-gray-700 px-6 text-white transition-colors hover:bg-gray-800">
          Sign in
        </Button>
      </SignInButton>
      <footer className="mt-16 text-sm text-gray-500">
        © {new Date().getFullYear()} t-drive. All rights reserved.
      </footer>
    </div>
  );
}
