import { SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "~/components/ui/button";

export default async function SignInPage() {
  const session = await auth();

  if (session.userId) {
    return redirect("/drive");
  }

  return (
    <>
      <SignInButton forceRedirectUrl={"/drive"}>
        <Button className="cursor-pointer rounded-lg border border-gray-700 bg-gray-600 text-white transition-colors hover:bg-gray-700">
          Sign In
        </Button>
      </SignInButton>
      <footer className="mt-16 text-sm text-gray-500">
        © {new Date().getFullYear()} t-drive. All rights reserved.
      </footer>
    </>
  );
}
